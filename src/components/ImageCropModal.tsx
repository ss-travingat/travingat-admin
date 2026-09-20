"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface ImageCropModalProps {
  file: File;
  /** Aspect ratio width/height. E.g. 16/9. Pass 0 for free-form. */
  aspectRatio?: number;
  onCrop: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

interface CropBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function ImageCropModal({
  file,
  aspectRatio = 0,
  onCrop,
  onCancel,
}: ImageCropModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgSrc, setImgSrc] = useState<string>("");
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });
  const [crop, setCrop] = useState<CropBox>({ x: 0, y: 0, w: 0, h: 0 });
  const [dragging, setDragging] = useState<
    null | "move" | "nw" | "ne" | "sw" | "se"
  >(null);
  const dragStart = useRef({ mx: 0, my: 0, crop: { x: 0, y: 0, w: 0, h: 0 } });

  // Load image
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImgSrc(url);
    const img = new window.Image();
    img.onload = () => {
      imgRef.current = img;
      setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Calculate display size and initial crop when image loads
  useEffect(() => {
    if (!imgSize.w || !containerRef.current) return;

    const maxW = Math.min(containerRef.current.clientWidth - 32, 640);
    const maxH = 420;
    const scale = Math.min(maxW / imgSize.w, maxH / imgSize.h, 1);
    const dw = Math.round(imgSize.w * scale);
    const dh = Math.round(imgSize.h * scale);
    setDisplaySize({ w: dw, h: dh });

    // Default crop: centered, 80% size, constrained to aspect ratio
    let cw = dw * 0.8;
    let ch = dh * 0.8;
    if (aspectRatio > 0) {
      if (cw / ch > aspectRatio) {
        cw = ch * aspectRatio;
      } else {
        ch = cw / aspectRatio;
      }
    }
    setCrop({
      x: (dw - cw) / 2,
      y: (dh - ch) / 2,
      w: cw,
      h: ch,
    });
  }, [imgSize, aspectRatio]);

  const clampCrop = useCallback(
    (c: CropBox): CropBox => {
      const minSize = 30;
      let { x, y, w, h } = c;
      w = Math.max(w, minSize);
      h = Math.max(h, minSize);
      if (aspectRatio > 0) {
        h = w / aspectRatio;
      }
      w = Math.min(w, displaySize.w);
      h = Math.min(h, displaySize.h);
      x = Math.max(0, Math.min(x, displaySize.w - w));
      y = Math.max(0, Math.min(y, displaySize.h - h));
      return { x, y, w, h };
    },
    [displaySize, aspectRatio]
  );

  const onPointerDown = useCallback(
    (type: "move" | "nw" | "ne" | "sw" | "se", e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(type);
      dragStart.current = { mx: e.clientX, my: e.clientY, crop: { ...crop } };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [crop]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - dragStart.current.mx;
      const dy = e.clientY - dragStart.current.my;
      const s = dragStart.current.crop;

      let next: CropBox;

      if (dragging === "move") {
        next = { x: s.x + dx, y: s.y + dy, w: s.w, h: s.h };
      } else if (dragging === "se") {
        next = { x: s.x, y: s.y, w: s.w + dx, h: s.h + dy };
      } else if (dragging === "sw") {
        next = { x: s.x + dx, y: s.y, w: s.w - dx, h: s.h + dy };
      } else if (dragging === "ne") {
        next = { x: s.x, y: s.y + dy, w: s.w + dx, h: s.h - dy };
      } else {
        // nw
        next = { x: s.x + dx, y: s.y + dy, w: s.w - dx, h: s.h - dy };
      }

      setCrop(clampCrop(next));
    },
    [dragging, clampCrop]
  );

  const onPointerUp = useCallback(() => {
    setDragging(null);
  }, []);

  // Perform crop using canvas
  const handleCrop = useCallback(() => {
    if (!imgRef.current || !displaySize.w) return;

    const scaleX = imgSize.w / displaySize.w;
    const scaleY = imgSize.h / displaySize.h;

    const sx = crop.x * scaleX;
    const sy = crop.y * scaleY;
    const sw = crop.w * scaleX;
    const sh = crop.h * scaleY;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(sw);
    canvas.height = Math.round(sh);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(
      imgRef.current,
      Math.round(sx),
      Math.round(sy),
      Math.round(sw),
      Math.round(sh),
      0,
      0,
      Math.round(sw),
      Math.round(sh)
    );

    canvas.toBlob(
      (blob) => {
        if (blob) onCrop(blob);
      },
      file.type.startsWith("image/") ? file.type : "image/jpeg",
      0.92
    );
  }, [crop, imgSize, displaySize, file, onCrop]);

  const handleCornerStyle =
    "absolute w-4 h-4 rounded-full bg-white border-2 border-[#5A45F9] shadow-md z-10 cursor-pointer";

  if (!imgSrc) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111111] rounded-2xl border border-white/10 shadow-2xl max-w-[720px] w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white">Crop Image</h3>
          <button
            onClick={onCancel}
            className="text-white/40 hover:text-white text-lg leading-none transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Crop area */}
        <div
          ref={containerRef}
          className="flex items-center justify-center p-4 select-none"
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          {displaySize.w > 0 && (
            <div
              className="relative"
              style={{ width: displaySize.w, height: displaySize.h }}
            >
              {/* Base image (dimmed) */}
              <img
                src={imgSrc}
                alt="Source"
                draggable={false}
                className="absolute inset-0 w-full h-full object-cover rounded-lg opacity-30"
              />

              {/* Crop overlay (bright) */}
              <div
                className="absolute overflow-hidden rounded-sm"
                style={{
                  left: crop.x,
                  top: crop.y,
                  width: crop.w,
                  height: crop.h,
                }}
              >
                <img
                  src={imgSrc}
                  alt="Cropped preview"
                  draggable={false}
                  className="absolute"
                  style={{
                    width: displaySize.w,
                    height: displaySize.h,
                    left: -crop.x,
                    top: -crop.y,
                  }}
                />
              </div>

              {/* Crop border + drag handles */}
              <div
                className="absolute border-2 border-white/80 rounded-sm"
                style={{
                  left: crop.x,
                  top: crop.y,
                  width: crop.w,
                  height: crop.h,
                }}
                onPointerDown={(e) => onPointerDown("move", e)}
              >
                {/* Grid lines */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/20" />
                  <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/20" />
                  <div className="absolute top-1/3 left-0 right-0 h-px bg-white/20" />
                  <div className="absolute top-2/3 left-0 right-0 h-px bg-white/20" />
                </div>
              </div>

              {/* Corner handles */}
              <div
                className={handleCornerStyle}
                style={{
                  left: crop.x - 8,
                  top: crop.y - 8,
                  cursor: "nw-resize",
                }}
                onPointerDown={(e) => onPointerDown("nw", e)}
              />
              <div
                className={handleCornerStyle}
                style={{
                  left: crop.x + crop.w - 8,
                  top: crop.y - 8,
                  cursor: "ne-resize",
                }}
                onPointerDown={(e) => onPointerDown("ne", e)}
              />
              <div
                className={handleCornerStyle}
                style={{
                  left: crop.x - 8,
                  top: crop.y + crop.h - 8,
                  cursor: "sw-resize",
                }}
                onPointerDown={(e) => onPointerDown("sw", e)}
              />
              <div
                className={handleCornerStyle}
                style={{
                  left: crop.x + crop.w - 8,
                  top: crop.y + crop.h - 8,
                  cursor: "se-resize",
                }}
                onPointerDown={(e) => onPointerDown("se", e)}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-white/10">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleCrop}
            className="px-5 py-2 bg-[#5A45F9] hover:bg-[#4935e0] rounded-lg text-sm font-semibold text-white transition-colors cursor-pointer"
          >
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
}
