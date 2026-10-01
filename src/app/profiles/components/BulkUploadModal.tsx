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
      // Only accept files within subfolders (length >= 3). 
      // Files directly in the root selected folder (length === 2) will be ignored.
      if (pathParts.length >= 3) {
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
      
      // Upload chunking inside the folder (3 at a time to prevent browser/R2 rate limits dropping images)
      const chunkSize = 3;
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6 opacity-100 transition-opacity">
          <div className="bg-[#0f0f11]/95 backdrop-blur-3xl rounded-[24px] border border-white/[0.08] w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh] shadow-[0_24px_80px_rgba(0,0,0,0.8)]">
            <div className="px-8 py-6 border-b border-white/[0.06] flex justify-between items-start bg-gradient-to-b from-white/[0.03] to-transparent">
              <div>
                <h3 className="text-[22px] font-bold tracking-tight text-white flex items-center gap-2.5">
                  <span className="material-symbols-rounded text-[#8B7BFF] text-[28px]">create_new_folder</span>
                  Review & Map Folders
                </h3>
                <p className="text-[15px] text-white/50 mt-1.5 font-medium">Select up to 20 folders to upload in this batch.</p>
              </div>
              <button 
                type="button"
                onClick={() => !isUploading && setIsOpen(false)}
                className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                disabled={isUploading}
              >
                <span className="material-symbols-rounded text-[20px]">close</span>
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 space-y-3.5 custom-scrollbar">
              {detectedFolders.map((folder, idx) => (
                <div 
                  key={idx} 
                  className={`group relative p-4 rounded-xl border transition-all duration-300 ${
                    folder.isSelected 
                      ? 'bg-[#5A45F9]/[0.08] border-[#5A45F9]/40 shadow-[0_0_20px_rgba(90,69,249,0.1)]' 
                      : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-5 relative z-10">
                    <div className="flex items-center justify-center">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={folder.isSelected}
                          onChange={() => handleCheckbox(idx)}
                          disabled={isUploading}
                          className="peer appearance-none w-[22px] h-[22px] rounded-md border-2 border-white/20 bg-black/40 checked:bg-[#8B7BFF] checked:border-[#8B7BFF] focus:outline-none focus:ring-2 focus:ring-[#8B7BFF]/30 focus:ring-offset-2 focus:ring-offset-[#0f0f11] transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <span className="material-symbols-rounded absolute text-white text-[16px] pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity drop-shadow-md">check</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                      <div className="font-semibold text-[16px] text-white/90 truncate flex items-center gap-2">
                        <span className={`material-symbols-rounded text-[20px] ${folder.isSelected ? 'text-[#8B7BFF]' : 'text-white/40'}`}>folder</span>
                        {folder.originalName}
                      </div>
                      <div className="text-[13px] text-white/40 font-medium mt-0.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80"></span>
                        {folder.files.length} valid media files
                      </div>
                    </div>
                    
                    <div className="w-[280px] shrink-0">
                      <div className={`transition-opacity duration-300 ${!folder.isSelected ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                        <CountrySelect
                          label=""
                          value={folder.selectedCountryCode}
                          onChange={(code) => handleCountryChange(idx, code)}
                          disabled={!folder.isSelected || isUploading}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Subtle highlight effect on hover */}
                  {!folder.isSelected && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  )}
                </div>
              ))}
              
              {detectedFolders.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="h-20 w-20 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mb-4">
                    <span className="material-symbols-rounded text-[40px] text-white/20">search_off</span>
                  </div>
                  <h4 className="text-[17px] font-semibold text-white/70 mb-1">No valid media folders found</h4>
                  <p className="text-[14px] text-white/40 max-w-sm">Folders must contain images or videos. Single files at the root level are ignored.</p>
                </div>
              )}
            </div>

            <div className="px-8 py-5 border-t border-white/[0.06] bg-[#0a0a0c]/80 flex items-center justify-between">
              <div className="text-[14px] font-medium text-white/60 flex items-center gap-3">
                {isUploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#8B7BFF]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-white/90">Uploading {uploadProgress.current} / {uploadProgress.total} files...</span>
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-1.5">
                      <span className="text-white">{detectedFolders.filter(f => f.isSelected).length}</span> folders selected
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-white">{detectedFolders.filter(f => f.isSelected).reduce((acc, f) => acc + f.files.length, 0)}</span> files total
                    </span>
                  </>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  disabled={isUploading}
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={startUpload}
                  disabled={isUploading || detectedFolders.filter(f => f.isSelected).length === 0}
                  className="bg-[#8B7BFF] hover:bg-[#7262ff] text-white border-none disabled:bg-white/10 disabled:text-white/30"
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
