const DEFAULT_R2_PUBLIC_URL = "https://cdn.travingat.com";
const LANDING_ASSETS_PREFIX = "landingpage-assets";

function isBareMediaFile(path: string): boolean {
  // Many profile media records store only a filename (e.g. "la_123.webp").
  // Those files are uploaded under landingpage-assets/profiles/* on R2.
  return !path.includes("/") && /\.(avif|webp|jpe?g|png|heic|heif|mp4|mov|webm|m4v|3gp|3g2)$/i.test(path);
}

export function getLandingAssetsCdnBase(): string {
  const envBase = process.env.NEXT_PUBLIC_LANDING_ASSETS_CDN_BASE;
  if (envBase && envBase.trim().length > 0) {
    return envBase.replace(/\/+$/, "");
  }

  const publicUrl = (process.env.R2_PUBLIC_URL || DEFAULT_R2_PUBLIC_URL).replace(
    /\/+$/,
    ""
  );
  return `${publicUrl}/${LANDING_ASSETS_PREFIX}`;
}

export function toLandingAssetUrl(assetPath: string | { url: string }): string {
  if (!assetPath) return assetPath as any;
  const urlStr = typeof assetPath === "string" ? assetPath : assetPath.url;
  if (!urlStr) return "";
  if (/^https?:\/\//i.test(urlStr) || /^blob:/i.test(urlStr) || /^data:/i.test(urlStr)) return urlStr;

  const normalizedInput = urlStr.replace(/^\/+/, "");
  const assetPathWithFolder = isBareMediaFile(normalizedInput)
    ? `profiles/${normalizedInput}`
    : normalizedInput;

  const normalizedPath = assetPathWithFolder
    .replace(/^\/+/, "")
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${getLandingAssetsCdnBase()}/${normalizedPath}`;
}

export function normalizeAssetHtml(html: string): string {
  if (!html) return html;

  return html.replace(/src=(['"])\/(?!\/)([^'"]+)\1/g, (_match, quote, path) => {
    const absoluteUrl = toLandingAssetUrl(`/${path}`);
    return `src=${quote}${absoluteUrl}${quote}`;
  });
}

/**
 * Returns the thumbnail URL for a given full-resolution CDN URL.
 *
 * The backend stores thumbnails at:
 *   thumbnails/{original_key_without_ext}_{size}.webp
 *
 * e.g. https://cdn.travingat.com/profiles/abc.jpg
 *   → https://cdn.travingat.com/thumbnails/profiles/abc_720.webp
 *
 * Falls back to the original URL if it can't be derived (blobs, data URIs, videos).
 */
export function getOptimizedMediaUrl(assetUrl: string, size: number = 720): string {
  if (!assetUrl) return assetUrl;
  // Don't try to thumbnail blobs, data URIs, or videos
  if (/^blob:/i.test(assetUrl) || /^data:/i.test(assetUrl)) return assetUrl;
  if (/\.(mp4|mov|webm|m4v|3gp|3g2)$/i.test(assetUrl)) return assetUrl;
  // Already a thumbnail URL — don't double-process
  if (assetUrl.includes('/thumbnails/')) return assetUrl;

  try {
    const cdnBase = getLandingAssetsCdnBase().replace(/\/+$/, '');
    // getLandingAssetsCdnBase() returns e.g. "https://cdn.travingat.com/landingpage-assets"
    // Strip the "/landingpage-assets" suffix to get the R2 root.
    const r2Base = cdnBase.replace(/\/landingpage-assets$/, '').replace(/\/+$/, '');

    if (!assetUrl.startsWith(r2Base)) return assetUrl;

    // Extract the key: everything after the r2 base domain
    const key = assetUrl.slice(r2Base.length).replace(/^\/+/, '');
    // Strip extension
    const keyNoExt = key.replace(/\.[^/.]+$/, '');
    return `${r2Base}/thumbnails/${keyNoExt}_${size}.webp`;
  } catch {
    return assetUrl;
  }
}
