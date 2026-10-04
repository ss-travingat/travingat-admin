import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { toLandingAssetUrl } from "@/lib/landing-assets";

interface LightboxItem {
  url: string;
  label?: string;
}

interface LightboxProps {
  items: LightboxItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function Lightbox({ items, currentIndex, onClose, onNavigate }: LightboxProps) {
  const currentItem = items[currentIndex];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft") onNavigate(currentIndex > 0 ? currentIndex - 1 : items.length - 1);
    if (e.key === "ArrowRight") onNavigate(currentIndex < items.length - 1 ? currentIndex + 1 : 0);
  }, [currentIndex, items.length, onClose, onNavigate]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [handleKeyDown]);

  if (!currentItem || typeof document === 'undefined') return null;

  const isVideo = /\.(mp4|mov|webm|m4v)$/i.test(currentItem.url);

  const content = (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center" onClick={onClose}>
      <button
        className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2 bg-white/10 rounded-full cursor-pointer z-[110]"
        onClick={onClose}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
      </button>

      {items.length > 1 && (
        <>
          <button
            className="absolute left-6 text-white/50 hover:text-white p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all cursor-pointer z-[110]"
            onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex > 0 ? currentIndex - 1 : items.length - 1); }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>

          <button
            className="absolute right-6 text-white/50 hover:text-white p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all cursor-pointer z-[110]"
            onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex < items.length - 1 ? currentIndex + 1 : 0); }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </>
      )}

      <div className="relative w-full h-full flex flex-col items-center justify-center p-6 sm:p-12" onClick={(e) => e.stopPropagation()}>
        {isVideo ? (
          <video
            src={toLandingAssetUrl(currentItem.url)}
            controls
            autoPlay
            className="w-auto h-auto max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        ) : (
          <img
            src={toLandingAssetUrl(currentItem.url)}
            alt={currentItem.label || "Media"}
            className="w-auto h-auto max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        )}

        <div className="absolute bottom-6 inset-x-0 flex flex-col items-center gap-1 pointer-events-none drop-shadow-md">
          {currentItem.label && <p className="text-white font-medium text-sm">{currentItem.label}</p>}
          {items.length > 1 && <p className="text-white/60 text-xs text-center">{currentIndex + 1} of {items.length}</p>}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
