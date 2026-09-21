"use client";

import { useState, useEffect, useRef } from "react";

export default function LoadedImage({ 
  src, 
  alt, 
  className = "",
  containerClassName = "",
  skeletonClassName = "absolute inset-0",
  priority = false,
  thumbnailSrc,
  onClick,
  onLoad,
}: { 
  src: string; 
  alt: string; 
  className?: string;
  containerClassName?: string;
  skeletonClassName?: string;
  /** When true, sets fetchPriority="high" + loading="eager" so the browser
   *  requests this image immediately, before lower-priority images. */
  priority?: boolean;
  /** Optional thumbnail URL to display instead of the full-size image.
   *  Falls back to `src` if the thumbnail fails to load. */
  thumbnailSrc?: string;
  onClick?: (event: React.MouseEvent<HTMLImageElement>) => void;
  onLoad?: () => void;
}) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [retryCount, setRetryCount] = useState(0);
  const [isHealing, setIsHealing] = useState(false);
  // Track whether we've fallen back from thumbnail to original
  const [useThumbnail, setUseThumbnail] = useState(!!thumbnailSrc);
  const maxRetries = 2;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxLoadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Determine which source to use: thumbnail (if available and not failed) or original
  let activeSrc = useThumbnail && thumbnailSrc ? thumbnailSrc : src;

  // If we are in a healing fallback state, rewrite the extension
  if (isHealing) {
    if (activeSrc.match(/\.(mp4|mov|m4v|3gp|3g2)$/i)) {
      activeSrc = activeSrc.replace(/\.[^/.]+$/, ".webm");
    } else {
      activeSrc = activeSrc.replace(/\.[^/.]+$/, ".webp");
    }
  }

  // Add a query param on retries to bypass broken browser cache for the failed image
  let currentSrc = retryCount > 0 && !activeSrc.startsWith("blob:") && !activeSrc.startsWith("data:") 
    ? `${activeSrc}${activeSrc.includes("?") ? "&" : "?"}retry=${retryCount}` 
    : activeSrc;

  if (currentSrc.startsWith("http")) {
    currentSrc = `/api/proxy-image?url=${encodeURIComponent(currentSrc)}`;
  }

  const handleLoad = () => {
    if (maxLoadTimeoutRef.current) clearTimeout(maxLoadTimeoutRef.current);
    setStatus("loaded");
    
    // If we loaded successfully via fallback, tell the server to update the DB permanently
    if (isHealing) {
      fetch("/api/heal-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUrl: src,
          optimizedUrl: activeSrc
        })
      }).catch((e) => console.error("Failed to trigger image healing", e));
      setIsHealing(false); // Prevent multiple triggers
    }
    
    onLoad?.();
  };

  const handleError = () => {
    // If thumbnail failed, fall back to the original src
    if (useThumbnail && thumbnailSrc) {
      setUseThumbnail(false);
      setRetryCount(0);
      setStatus("loading");
      return;
    }
    if (retryCount < maxRetries) {
      timeoutRef.current = setTimeout(() => {
        setRetryCount((prev) => prev + 1);
        setStatus("loading");
      }, 1000 * (retryCount + 1));
    } else {
      // Before giving up completely, if the image isn't already webp/webm, attempt to fallback to it.
      if (!isHealing && !activeSrc.match(/\.(webp|webm)$/i) && !activeSrc.startsWith("blob:") && !activeSrc.startsWith("data:")) {
        setIsHealing(true);
        setRetryCount(0); // Reset retries for the new URL
        setStatus("loading");
        return;
      }
      
      if (maxLoadTimeoutRef.current) clearTimeout(maxLoadTimeoutRef.current);
      setStatus("error");
    }
  };

  useEffect(() => {
    setStatus("loading");
    setRetryCount(0);
    setUseThumbnail(!!thumbnailSrc);
    // Force error state if image hangs for more than 1 minute
    maxLoadTimeoutRef.current = setTimeout(() => {
      setStatus("error");
    }, 60000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (maxLoadTimeoutRef.current) clearTimeout(maxLoadTimeoutRef.current);
    };
  }, [src, thumbnailSrc]);

  useEffect(() => {
    const node = imgRef.current;
    if (!node) return;
    
    // SVGs might have a naturalWidth of 0 depending on their viewbox/width attributes
    const isSvg = currentSrc.includes(".svg");
    
    if (node.complete && (node.naturalWidth > 0 || (isSvg && node.naturalWidth === 0))) {
      handleLoad();
    }
  }, [currentSrc]);

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Skeleton placeholder while the real image is loading */}
      {status === "loading" && (
        <div className={`z-0 pointer-events-none bg-[#1a1a1a] animate-pulse rounded-[inherit] ${skeletonClassName}`} />
      )}

      {/* Real image stays hidden until loaded, preserving skeleton-first UX. */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={`relative z-10 transition-all duration-700 ${status === "loaded" ? "opacity-100 blur-none" : "opacity-0 blur-lg"} ${className}`}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...(priority ? { fetchPriority: "high" as any, loading: "eager" } : { loading: "lazy" })}
        onClick={onClick}
        onLoad={handleLoad}
        onError={handleError}
      />

      {/* Fallback Error State — shown when all retries fail */}
      {status === "error" && (
        <div className={`absolute inset-0 z-20 bg-[#151515] flex items-center justify-center rounded-[inherit] ${skeletonClassName}`}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M20.9973 21.0011C23.5339 18.4645 27.6719 18.4899 30.2399 21.0579L53.2668 44.0848C55.8347 46.6527 55.8601 50.7908 53.3235 53.3274C50.7869 55.864 46.6489 55.8386 44.0809 53.2706L21.054 30.2437C18.4861 27.6758 18.4607 23.5377 20.9973 21.0011ZM27.0272 30.093L30.391 30.3376L30.146 26.9742L26.7826 26.7292L27.0272 30.093ZM23.0197 27.8352C22.5366 28.3184 22.5414 29.1066 23.0305 29.5957C23.5197 30.0848 24.3079 30.0897 24.791 29.6065C25.2742 29.1233 25.2693 28.3351 24.7802 27.846C24.2911 27.3569 23.5029 27.352 23.0197 27.8352ZM27.8313 23.0236C27.3482 23.5067 27.353 24.2949 27.8422 24.7841C28.3313 25.2732 29.1195 25.278 29.6026 24.7949C30.0858 24.3117 30.081 23.5235 29.5918 23.0344C29.1027 22.5453 28.3145 22.5404 27.8313 23.0236Z" fill="#212121"/>
            <path d="M8.4121 49.9708C6.82242 48.3812 6.80669 45.8195 8.37696 44.2493L18.3529 34.2733C19.4868 33.1394 21.3366 33.1508 22.4845 34.2987L26.1627 37.9769L14.1337 50.006C12.5634 51.5763 10.0018 51.5605 8.4121 49.9708Z" fill="#212121"/>
            <path d="M15.6809 51.1157L25.3041 41.4925C26.512 40.2846 28.4825 40.2967 29.7053 41.5195L36.7905 48.6047L34.166 51.2293C29.0928 56.3024 20.8168 56.2516 15.6809 51.1157Z" fill="#212121"/>
            <path d="M51.1119 15.6847L41.4887 25.308C40.2808 26.5159 40.2929 28.4864 41.5157 29.7092L48.6009 36.7944L51.2254 34.1699C56.2986 29.0967 56.2478 20.8206 51.1119 15.6847Z" fill="#212121"/>
            <path d="M49.967 8.41595C48.3773 6.82627 45.8157 6.81054 44.2454 8.38082L34.2695 18.3567C33.1356 19.4907 33.1469 21.3404 34.2948 22.4884L37.9731 26.1666L50.0021 14.1375C51.5724 12.5673 51.5567 10.0056 49.967 8.41595Z" fill="#212121"/>
          </svg>
        </div>
      )}
    </div>
  );
}
