"use client";

import { useState, useRef } from "react";
import { COUNTRY_LIST } from "@/lib/countries";
import { Button } from "@/components/ui/Button";
import CountrySelect from "./CountrySelect";

interface BulkUploadModalProps {
  onUploadComplete: (results: { countryCode: string; urls: any[] }[]) => void;
}

const getImageDimensions = (file: File): Promise<{ width: number; height: number } | null> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      resolve(null);
      return;
    }
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(objectUrl);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  });
};

export default function BulkUploadModal({ onUploadComplete }: BulkUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  const [detectedFolders, setDetectedFolders] = useState<{
    originalName: string;
    files: File[];
    selectedCountryCode: string;
    isSelected: boolean;
  }[]>([]);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  // Handle folder selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    // Reset input so they can select the same folder again if needed
    e.target.value = "";

    // Group files by folder (assuming path is Root/Folder/File.ext)
    const folderMap = new Map<string, File[]>();
    
    files.forEach(file => {
      // Validate file type
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) return;
      if (file.type === "image/svg+xml" || file.type === "image/gif") return;
      
      const pathParts = (file as any).webkitRelativePath?.split("/") || [];
      if (pathParts.length >= 2) {
        // e.g. ["MyPhotos", "France", "img.jpg"] -> index 1 is "France"
        const folderName = pathParts[1];
        if (!folderMap.has(folderName)) folderMap.set(folderName, []);
        folderMap.get(folderName)!.push(file);
      }
    });

    const parsedFolders = Array.from(folderMap.entries()).map(([folderName, files]) => {
      // Try to fuzzy match folder name to a country code
      const normalizedFolder = folderName.toLowerCase().replace(/[^a-z0-9]/g, "");
      const match = COUNTRY_LIST.find(
        c => 
          c.name.toLowerCase().replace(/[^a-z0-9]/g, "") === normalizedFolder ||
          c.code.toLowerCase() === normalizedFolder
      );

      return {
        originalName: folderName,
        files,
        selectedCountryCode: match ? match.code : "",
        isSelected: false, // User must select which ones to process
      };
    });

    setDetectedFolders(parsedFolders);
    setIsOpen(true);
  };

  const handleCheckbox = (idx: number) => {
    setDetectedFolders(prev => {
      const next = [...prev];
      const currentlySelected = next.filter(f => f.isSelected).length;
      
      if (!next[idx].isSelected && currentlySelected >= 20) {
        alert("You can only select up to 20 folders per batch.");
        return prev;
      }
      
      next[idx] = { ...next[idx], isSelected: !next[idx].isSelected };
      return next;
    });
  };

  const handleCountryChange = (idx: number, code: string) => {
    setDetectedFolders(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], selectedCountryCode: code };
      return next;
    });
  };

  const startUpload = async () => {
    const selected = detectedFolders.filter(f => f.isSelected);
    if (selected.length === 0) return;
    
    const unmapped = selected.find(f => !f.selectedCountryCode);
    if (unmapped) {
      alert(`Please select a country for folder: ${unmapped.originalName}`);
      return;
    }

    const totalImages = selected.reduce((acc, f) => acc + f.files.length, 0);
    if (totalImages > 2000) {
      alert(`You have selected ${totalImages} files. The maximum per batch is 2000.`);
      return;
    }

    // Generate a unique batch ID for this upload session
    const uploadBatchId = crypto.randomUUID();

    setIsUploading(true);
    setUploadProgress({ current: 0, total: totalImages });

    const results: { countryCode: string; urls: any[] }[] = [];
    let completedCount = 0;

    // Process one folder at a time
    for (const folder of selected) {
      const urls: any[] = [];
      
      // Upload chunking inside the folder (5 at a time to prevent browser/R2 rate limits dropping images)
      const chunkSize = 5;
      for (let i = 0; i < folder.files.length; i += chunkSize) {
        const chunk = folder.files.slice(i, i + chunkSize);
        
        const chunkPromises = chunk.map(async (file) => {
          try {
            // Extract dimensions
            let dims = null;
            if (file.type.startsWith("image/")) {
              dims = await getImageDimensions(file);
            }

            // Presign
            // Pass a unique filename using Date.now() and the original file name
            // to prevent the backend from generating identical S3 keys for concurrent uploads.
            const uniqueFilename = `country-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const presignRes = await fetch("/api/upload/presign", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fileType: file.type, filename: uniqueFilename }),
            });
            
            if (!presignRes.ok) throw new Error("Presign failed");
            const { uploadUrl, publicUrl } = await presignRes.json();
            
            // PUT
            const putRes = await fetch(uploadUrl, {
              method: "PUT",
              headers: { "Content-Type": file.type },
              body: file,
            });
            if (!putRes.ok) throw new Error("Upload failed");
            
            // Optimize
            const urlObj = new URL(publicUrl);
            const key = urlObj.pathname.substring(1);
            fetch("/api/media-engine/optimize", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                key,
                mediaType: file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
                upload_batch_id: uploadBatchId
              })
            }).catch(console.warn);

            if (dims) {
              return { url: publicUrl, width: dims.width, height: dims.height };
            }
            return publicUrl;
          } catch (err) {
            console.error("Failed to upload file", file.name, err);
            return null;
          } finally {
            completedCount++;
            setUploadProgress(prev => ({ ...prev, current: completedCount }));
          }
        });
        
        const chunkResults = await Promise.all(chunkPromises);
        urls.push(...(chunkResults.filter(Boolean) as any[]));
      }
      
      if (urls.length > 0) {
        results.push({ countryCode: folder.selectedCountryCode, urls });
      }
    }

    onUploadComplete(results);
    setIsOpen(false);
    setIsUploading(false);
    setDetectedFolders([]);
  };

  return (
    <>
      <Button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        variant="ghost"
        className="px-3 py-2.5 bg-[#5A45F9]/20 hover:bg-[#5A45F9]/30 text-[#8B7BFF] rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
      >
        Bulk Upload Folder
      </Button>

      {/* Note: React doesn't natively support webkitdirectory typing perfectly on standard inputs without casting or ts-ignore depending on versions. We use standard HTML input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        // @ts-expect-error webkitdirectory is non-standard but widely supported
        webkitdirectory="true"
        directory="true"
        onChange={handleFileSelect}
      />

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1C1C] rounded-xl border border-white/10 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">Review & Map Folders</h3>
                <p className="text-sm text-white/50 mt-1">Select up to 20 folders to upload in this batch.</p>
              </div>
              <button 
                type="button"
                onClick={() => !isUploading && setIsOpen(false)}
                className="text-white/40 hover:text-white"
                disabled={isUploading}
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {detectedFolders.map((folder, idx) => (
                <div key={idx} className={`p-4 rounded-lg border transition-colors ${folder.isSelected ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/5 hover:border-white/10'}`}>
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={folder.isSelected}
                      onChange={() => handleCheckbox(idx)}
                      disabled={isUploading}
                      className="w-5 h-5 rounded border-white/20 bg-black/50 text-[#5A45F9] focus:ring-[#5A45F9] focus:ring-offset-black"
                    />
                    
                    <div className="flex-1">
                      <div className="font-medium text-white">{folder.originalName}</div>
                      <div className="text-xs text-white/50">{folder.files.length} valid media files</div>
                    </div>
                    
                    <div className="w-56">
                      <CountrySelect
                        label=""
                        value={folder.selectedCountryCode}
                        onChange={(code) => handleCountryChange(idx, code)}
                        disabled={!folder.isSelected || isUploading}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {detectedFolders.length === 0 && (
                <div className="text-center text-white/40 py-8">No valid media folders found.</div>
              )}
            </div>

            <div className="p-6 border-t border-white/10 bg-black/20 flex items-center justify-between">
              <div className="text-sm text-white/60">
                {isUploading ? (
                  <span>Uploading {uploadProgress.current} / {uploadProgress.total} files...</span>
                ) : (
                  <span>
                    Selected {detectedFolders.filter(f => f.isSelected).length} folders
                    ({detectedFolders.filter(f => f.isSelected).reduce((acc, f) => acc + f.files.length, 0)} files)
                  </span>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  disabled={isUploading}
                  className="text-white/60 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={startUpload}
                  disabled={isUploading || detectedFolders.filter(f => f.isSelected).length === 0}
                  className="bg-white hover:bg-white/90 text-black font-medium"
                >
                  {isUploading ? "Uploading..." : "Confirm & Upload"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
