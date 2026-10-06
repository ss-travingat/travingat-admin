"use client";

import React, { useState, useCallback, useMemo } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage";

export interface CropData {
  crop: { x: number; y: number };
  zoom: number;
  aspectRatio: number;
  pixels: any;
}

interface ProfileCropModalProps {
  imageSrc: string;
  type: "cover" | "avatar";
  initialCropData?: any;
  onSave: (croppedFile: File, cropData: any) => void | Promise<void>;
  onCancel: () => void;
  onReplace?: () => void;
  onDelete?: () => void;
  title?: string;
}

export default function ProfileCropModal({
  imageSrc,
  type,
  initialCropData,
  onSave,
  onCancel,
  onReplace,
  onDelete,
  title = "Crop Image",
}: ProfileCropModalProps) {
  // Default aspect ratios
  const aspectRatio = type === "cover" ? 344 / 528 : 1; // Cover matches Adventure card, Avatar 1:1

  const defaultCropState = {
    crop: { x: 0, y: 0 },
    zoom: 1,
    aspectRatio,
    pixels: null,
  };

  const [cropState, setCropState] = useState<CropData>(() => ({
    ...defaultCropState,
    ...initialCropData,
    aspectRatio: aspectRatio, // Always enforce the current hardcoded aspect ratio
  }));

  const setCrop = (c: any) => {
    if (!mediaSize) return;
    setCropState((s) => ({ ...s, crop: c }));
  };

  const setZoom = (z: any) => {
    if (!mediaSize) return;
    setCropState((s) => ({ ...s, zoom: z }));
  };

  const setCroppedAreaPixels = (p: any) => {
    setCropState((s) => ({ ...s, pixels: p }));
  };

  const [isSaving, setIsSaving] = useState(false);
  const [mediaSize, setMediaSize] = useState<{ width: number; height: number } | null>(null);
  const [naturalMediaSize, setNaturalMediaSize] = useState<{ width: number; height: number } | null>(null);
  const [cropSize, setCropSize] = useState<{ width: number; height: number } | null>(null);

  const calculatedMinZoom = useMemo(() => {
    if (!mediaSize || !cropSize) return 1;
    return Math.max(
      cropSize.width / mediaSize.width,
      cropSize.height / mediaSize.height,
      1
    );
  }, [mediaSize, cropSize]);

  React.useEffect(() => {
    if (cropState.zoom < calculatedMinZoom) {
      setZoom(calculatedMinZoom);
    }
  }, [calculatedMinZoom, cropState.zoom]);

  const maxZoomValue = Math.max(3, calculatedMinZoom + 2);
  const zoomPercentage =
    ((cropState.zoom - calculatedMinZoom) / (maxZoomValue - calculatedMinZoom)) * 100 || 0;

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleSave = async () => {
    if (!cropState.pixels) return;
    try {
      setIsSaving(true);
      const croppedFile = await getCroppedImg(imageSrc, cropState.pixels);
      if (!croppedFile) throw new Error("Failed to crop image");

      const finalData = { ...cropState, mediaSize: naturalMediaSize };
      await onSave(croppedFile, finalData);
    } catch (e) {
      console.error(e);
      alert("Failed to save crop.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <div className="relative flex w-full max-w-[600px] flex-col rounded-[24px] border border-[#252525] bg-[#161616] p-6 shadow-2xl">
        <h3 className="mb-4 text-center text-[20px] font-semibold text-white">
          {title}
        </h3>

        {/* Cropper Container */}
        <div className="relative h-[400px] w-full overflow-hidden rounded-[16px] bg-[#1a1a1a]">
          <Cropper
            image={imageSrc}
            crop={cropState.crop}
            zoom={cropState.zoom}
            aspect={cropState.aspectRatio}
            minZoom={calculatedMinZoom}
            maxZoom={maxZoomValue}
            showGrid={false}
            style={{
              cropAreaStyle: { border: "1.5px dashed rgba(255, 255, 255, 0.8)" },
            }}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            onMediaLoaded={(size) => {
              setMediaSize({ width: size.width, height: size.height });
              setNaturalMediaSize({
                width: size.naturalWidth,
                height: size.naturalHeight,
              });
            }}
            onCropSizeChange={(size) =>
              setCropSize({ width: size.width, height: size.height })
            }
          />
          {/* Action Icons (Replace & Delete) */}
          <div className="absolute top-4 right-4 z-[100] flex items-center bg-[#0a0a0a] border border-[#2d2f37] rounded-full p-1 gap-1 shadow-lg">
            {onReplace && (
              <button
                type="button"
                onClick={onReplace}
                title="Replace photo"
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#999] hover:text-white transition-colors hover:bg-white/10"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
                  <line x1="16" x2="22" y1="5" y2="5" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
                  <line x1="19" x2="19" y1="2" y2="8" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
                  <circle cx="9" cy="9" r="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                title="Delete photo"
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#ff453a] hover:bg-red-500/20 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            )}
          </div>
        </div>

        {/* Controls */}
        <style>{`
          .custom-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 24px;
            width: 24px;
            border-radius: 50%;
            background: #5a45f9;
            border: 2px solid white;
            cursor: pointer;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          }
          .custom-slider::-moz-range-thumb {
            height: 24px;
            width: 24px;
            border-radius: 50%;
            background: #5a45f9;
            border: 2px solid white;
            cursor: pointer;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          }
        `}</style>
        <div className="mt-6 flex items-center gap-[12px] px-2 w-full justify-center">
          <button
            type="button"
            onClick={() => setZoom(Math.max(calculatedMinZoom, cropState.zoom - 0.1))}
            className="flex items-center justify-center p-[6px] shrink-0 text-[#999] hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </button>

          <input
            type="range"
            value={cropState.zoom}
            min={calculatedMinZoom}
            max={maxZoomValue}
            step={0.01}
            aria-label="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="custom-slider h-[6px] w-[350px] cursor-pointer appearance-none rounded-[30px]"
            style={{
              background: `linear-gradient(to right, #5a45f9 0%, #5a45f9 ${zoomPercentage}%, #404040 ${zoomPercentage}%, #404040 100%)`,
            }}
          />

          <button
            type="button"
            onClick={() => setZoom(Math.min(maxZoomValue, cropState.zoom + 0.1))}
            className="flex items-center justify-center p-[6px] shrink-0 text-[#999] hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="11" y1="8" x2="11" y2="14"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </button>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="flex h-[44px] items-center justify-center rounded-full border border-[#353535] bg-[#1a1a1a] px-6 text-[14px] font-medium text-white transition-colors hover:bg-[#252525] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex h-[44px] items-center justify-center rounded-full bg-white px-8 text-[14px] font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Crop"}
          </button>
        </div>
      </div>
    </div>
  );
}
