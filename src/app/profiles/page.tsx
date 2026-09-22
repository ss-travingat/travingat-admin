"use client";

import { useState, useEffect, useRef } from "react";
import LoadedImage from "@/components/ui/LoadedImage";
import Link from "next/link";
import { toLandingAssetUrl, getOptimizedMediaUrl } from "@/lib/landing-assets";
import { COUNTRY_LIST } from "@/lib/countries";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import BulkUploadModal from "./components/BulkUploadModal";
import CountrySelect from "./components/CountrySelect";

interface CountryImage {
  countryCode: string;
  images: string[];
  coverPhoto?: string;
  about?: string;
}

interface CollectionImage {
  title: string;
  images: string[];
  coverPhoto?: string;
  about?: string;
  countryCodes?: string[];
}

interface Profile {
  id: string;
  name: string;
  handle: string;
  country: string;
  flag: string;
  flagCode: string;
  homelandFlagCode: string;
  currentlyInFlagCode: string;
  countries: number;
  media: number;
  collections: number;
  images: {
    cover: string;
    avatar: string;
    gallery: string[];
  };
  align: "start" | "end";
  bio: string;
  interests: string[];
  languages: string[];
  homeland: string;
  currentlyIn: string;
  socials: {
    x: string;
    instagram: string;
    linkedin: string;
    youtube: string;
  };
  aboutImages: string[];
  visitedCountryCodes: string[];
  countryImages: CountryImage[];
  collectionImages: CollectionImage[];
  email?: string;
  isExplorerCard?: boolean;
  isFeaturedProfile?: boolean;
}

const emptyForm: Omit<Profile, "id"> = {
  name: "",
  handle: "",
  country: "",
  flag: "",
  flagCode: "",
  homelandFlagCode: "",
  currentlyInFlagCode: "",
  countries: 0,
  media: 0,
  collections: 0,
  images: { cover: "", avatar: "", gallery: [] },
  align: "end",
  bio: "",
  interests: [],
  languages: [],
  homeland: "",
  currentlyIn: "",
  socials: { x: "", instagram: "", linkedin: "", youtube: "" },
  aboutImages: [],
  visitedCountryCodes: [],
  countryImages: [],
  collectionImages: [],
  email: "",
  isExplorerCard: false,
  isFeaturedProfile: true,
};



function MultiCountrySelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string[];
  onChange: (codes: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = COUNTRY_LIST.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (code: string) => {
    if (value.includes(code)) {
      onChange(value.filter((c) => c !== code));
    } else {
      onChange([...value, code]);
    }
  };

  return (
    <div ref={ref} className="relative">
      <label className="text-sm text-white/60 block mb-1.5">
        {label} <span className="text-white/30">({value.length} selected)</span>
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-left hover:border-white/20 transition-colors cursor-pointer"
      >
        {value.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {value.slice(0, 10).map((code) => (
              <span
                key={code}
                className="inline-flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded text-xs"
              >
                <img
                  src={`/flags/${code}.svg`}
                  alt={code}
                  className="w-3.5 h-2.5 rounded-sm object-cover"
                />
                {code}
              </span>
            ))}
            {value.length > 10 && (
              <span className="text-white/30 text-xs py-0.5">
                +{value.length - 10} more
              </span>
            )}
          </div>
        ) : (
          <span className="text-white/25">Select visited countries...</span>
        )}
      </button>
      {open && (
        <div className="absolute z-40 mt-1 w-full bg-black-700 border border-white/10 rounded-lg shadow-xl max-h-72 overflow-hidden">
          <div className="p-2 border-b border-white/10">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search countries..."
              className="bg-white/5 border border-white/10 text-sm placeholder:text-white/25 focus:border-[#5A45F9]"
              autoFocus
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => toggle(c.code)}
                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer ${value.includes(c.code)
                    ? "bg-[#5A45F9]/20 text-white"
                    : "text-white/70"
                  }`}
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${value.includes(c.code)
                      ? "bg-[#5A45F9] border-[#5A45F9]"
                      : "border-white/20"
                    }`}
                >
                  {value.includes(c.code) && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </div>
                <img
                  src={`/flags/${c.code}.svg`}
                  alt={c.name}
                  className="w-5 h-3.5 rounded-sm object-cover"
                />
                <span>{c.name}</span>
                <span className="text-white/30 ml-auto text-xs">{c.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TagInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");

  const appendUniqueTags = (nextTags: string[]) => {
    if (nextTags.length === 0) return;
    const existing = new Set(value);
    const unique = nextTags.filter((tag) => !existing.has(tag));
    if (unique.length === 0) return;
    onChange([...value, ...unique]);
  };

  const parseTags = (raw: string) =>
    raw
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

  const addTag = () => {
    const tags = parseTags(input);
    appendUniqueTags(tags);
    if (tags.length > 0) setInput("");
  };

  const handleInputChange = (nextValue: string) => {
    if (!nextValue.includes(",")) {
      setInput(nextValue);
      return;
    }

    const pieces = nextValue.split(",");
    const completed = pieces.slice(0, -1);
    const remaining = pieces[pieces.length - 1] ?? "";
    appendUniqueTags(
      completed
        .map((tag) => tag.trim())
        .filter(Boolean)
    );
    setInput(remaining.trimStart());
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = event.clipboardData.getData("text");
    if (!pastedText) return;
    if (!pastedText.includes(",")) return;

    event.preventDefault();
    const tags = parseTags(pastedText);
    appendUniqueTags(tags);
    setInput("");
  };

  return (
    <div>
      <label className="text-sm text-white/60 block mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-[#5A45F9]/20 text-[#5A45F9] px-2 py-1 rounded-md text-xs"
          >
            {tag}
            <button
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="hover:text-white transition-colors cursor-pointer"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          type="text"
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          onPaste={handlePaste}
          placeholder={placeholder}
          className="flex-1 bg-white/5 border border-white/10 text-xs placeholder:text-white/25 focus:border-[#5A45F9]"
        />
        <Button
          type="button"
          onClick={addTag}
          size="sm"
          variant="ghost"
          className="px-3 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-xs font-medium"
        >
          Add
        </Button>
      </div>
    </div>
  );
}

export default function AdminProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [form, setForm] = useState<Omit<Profile, "id">>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; error?: boolean } | null>(null);
  const [uploading, setUploading] = useState<{ field: "cover" | "avatar" | "gallery" | "about" | "country" | "collection"; stage: "processing" | "uploading" | "done"; idx?: number; current?: number; total?: number } | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const aboutInputRef = useRef<HTMLInputElement>(null);
  const [pendingCountryCode, setPendingCountryCode] = useState<string>("");
  const [pendingCollectionTitle, setPendingCollectionTitle] = useState<string>("");
  const [mediaPickerTarget, setMediaPickerTarget] = useState<{ type: "country" | "collection" | "about"; idx?: number } | null>(null);

  // Orphan cleanup state
  const [orphanScanning, setOrphanScanning] = useState(false);
  const [orphanResult, setOrphanResult] = useState<{
    orphans: { key: string; url: string; size: number; lastModified: string }[];
    totalR2: number;
    totalReferenced: number;
    totalOrphaned: number;
    totalOrphanedBytes: number;
  } | null>(null);
  const [orphanDeleting, setOrphanDeleting] = useState(false);
  const [orphanPanelOpen, setOrphanPanelOpen] = useState(false);

  const showToast = (msg: string, error = false) => {
    setToast({ msg, error });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profiles", { cache: "no-store" });
      const data = await res.json();
      const normalizedProfiles = (Array.isArray(data) ? data : []).map((profile) => ({
        ...profile,
        aboutImages: Array.isArray(profile.aboutImages) ? profile.aboutImages : [],
        countryImages: Array.isArray(profile.countryImages) ? profile.countryImages : [],
        collectionImages: Array.isArray(profile.collectionImages)
          ? profile.collectionImages.map((collection: CollectionImage) => ({
            ...collection,
            countryCodes: Array.isArray(collection.countryCodes) ? collection.countryCodes : [],
          }))
          : [],
      })) as Profile[];
      setProfiles([...normalizedProfiles].reverse());
    } catch {
      showToast("Failed to load profiles");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();

    // Check if we are navigated here to create a new profile with prefilled data
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("create") === "true") {
        const email = params.get("email") || "";
        const waitlistId = params.get("waitlistId") || "";
        const countryName = params.get("country") || "";

        let flagCode = "";
        let flag = "";
        let finalCountryName = countryName;

        if (countryName) {
          const matchedCountry = COUNTRY_LIST.find(
            (c) => c.name.toLowerCase() === countryName.toLowerCase() || c.code.toLowerCase() === countryName.toLowerCase()
          );
          if (matchedCountry) {
            finalCountryName = matchedCountry.name;
            flagCode = matchedCountry.code;
            flag = matchedCountry.flag;
          }
        }

        // Initially open the form with whatever basic info we have
        setForm((prev) => ({
          ...prev,
          email,
          country: finalCountryName,
          flagCode,
          flag,
        }));

        // Remove the search params from URL so it doesn't stay there on refresh
        window.history.replaceState({}, '', '/profiles');

        // Fetch detailed user info if email exists
        if (email) {
          fetch(`/api/admin/users/by-email?email=${encodeURIComponent(email)}`)
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(user => {
              if (user && !user.error) {
                const ec = user.explorerCard || {};

                let fname = user.first_name;
                let lname = user.last_name;
                if (!fname && !lname && ec.name) {
                  const parts = ec.name.split(' ');
                  fname = parts[0];
                  lname = parts.slice(1).join(' ');
                }
                const fullName = [fname, lname].filter(Boolean).join(" ");

                // Extract socials from links jsonb array if it exists
                const newSocials = { x: "", instagram: "", linkedin: "", youtube: "" };
                if (Array.isArray(user.links)) {
                  user.links.forEach((link: string) => {
                    const lc = link.toLowerCase();
                    if (lc.includes("instagram.com")) newSocials.instagram = link;
                    else if (lc.includes("twitter.com") || lc.includes("x.com")) newSocials.x = link;
                    else if (lc.includes("youtube.com")) newSocials.youtube = link;
                    else if (lc.includes("linkedin.com")) newSocials.linkedin = link;
                  });
                }

                let fetchedFlagCode = flagCode;
                let fetchedFlag = flag;
                let fetchedCountryName = finalCountryName;
                const bestCountry = user.country || ec.country;
                if (bestCountry && bestCountry !== finalCountryName) {
                  const matchedCountry = COUNTRY_LIST.find(
                    (c) => c.name.toLowerCase() === bestCountry.toLowerCase() || c.code.toLowerCase() === bestCountry.toLowerCase()
                  );
                  if (matchedCountry) {
                    fetchedCountryName = matchedCountry.name;
                    fetchedFlagCode = matchedCountry.code;
                    fetchedFlag = matchedCountry.flag;
                  } else {
                    fetchedCountryName = bestCountry;
                  }
                }

                let count = user.visited_count;
                if (!count && ec.visited_countries) {
                  if (Array.isArray(ec.visited_countries)) count = ec.visited_countries.length;
                  else if (typeof ec.visited_countries === 'string') {
                    try { count = JSON.parse(ec.visited_countries).length; } catch { count = 0; }
                  }
                }

                setForm(prev => ({
                  ...prev,
                  name: fullName || prev.name,
                  countries: count || prev.countries,
                  country: fetchedCountryName,
                  flagCode: fetchedFlagCode,
                  flag: fetchedFlag,
                  images: {
                    ...prev.images,
                    avatar: user.avatar_url || user.profile_image_url || ec.profile_image_url || prev.images.avatar,
                    cover: user.cover_photo_url || user.cover_image_url || ec.cover_image_url || prev.images.cover,
                  },
                  socials: { ...prev.socials, ...newSocials },
                }));
              }
            })
            .catch(console.error);
        }
      }
    }
  }, []);

  const scanOrphans = async () => {
    setOrphanScanning(true);
    setOrphanPanelOpen(true);
    try {
      const res = await fetch("/api/profiles/orphans");
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Scan failed", true);
        return;
      }
      setOrphanResult(data);
      if (data.totalOrphaned === 0) {
        showToast("No orphaned files found! ✨");
      } else {
        showToast(`Found ${data.totalOrphaned} orphaned file${data.totalOrphaned !== 1 ? "s" : ""}`);
      }
    } catch {
      showToast("Failed to scan orphans", true);
    } finally {
      setOrphanScanning(false);
    }
  };

  const deleteOrphans = async (keys: string[]) => {
    if (keys.length === 0) return;
    setOrphanDeleting(true);
    try {
      const res = await fetch("/api/profiles/orphans", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Delete failed", true);
        return;
      }
      showToast(`Deleted ${data.deleted} orphaned file${data.deleted !== 1 ? "s" : ""}`);
      // Re-scan to update the list
      await scanOrphans();
    } catch {
      showToast("Failed to delete orphans", true);
    } finally {
      setOrphanDeleting(false);
    }
  };

  const handleVideoUpload = async (
    file: File,
    type: "country" | "collection" | "gallery" | "about",
    idx?: number,
    batch?: { current: number; total: number }
  ) => {
    if (file.size > 50 * 1024 * 1024) {
      showToast("Video too large. Max 50MB.", true);
      return null;
    }
    if (!file.type.startsWith("video/")) {
      showToast("Please upload a video file", true);
      return null;
    }

    // Check duration client-side via a temporary object URL
    const duration = await new Promise<number>((resolve) => {
      const vid = document.createElement("video");
      vid.preload = "metadata";
      const objUrl = URL.createObjectURL(file);
      vid.src = objUrl;
      vid.onloadedmetadata = () => {
        URL.revokeObjectURL(objUrl);
        resolve(vid.duration);
      };
      vid.onerror = () => {
        URL.revokeObjectURL(objUrl);
        resolve(0);
      };
    });

    if (duration > 30) {
      showToast("Video must be 30 seconds or less.", true);
      return null;
    }

    setUploading({ field: type, stage: "uploading", idx, current: batch?.current, total: batch?.total });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    try {
      // 1. Request presigned URL
      const presignRes = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
          fileType: file.type,
          prefix: "profiles",
        }),
      });
      const presignData = await presignRes.json();
      if (!presignRes.ok) {
        showToast(presignData.error || "Failed to get upload URL", true);
        return null;
      }

      const { uploadUrl, publicUrl } = presignData;

      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) {
        showToast("Direct upload to R2 failed", true);
        return null;
      }

      try {
        const urlObj = new URL(publicUrl);
        const key = urlObj.pathname.substring(1);
        await fetch("/api/media-engine/optimize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, mediaType: "VIDEO" }),
        });
      } catch (err) {
        console.warn("Media engine optimization trigger failed", err);
      }

      const isLastInBatch = !batch || batch.current === batch.total;
      if (isLastInBatch) {
        setUploading((prev) => prev ? { ...prev, stage: "done" } : null);
        await new Promise((r) => setTimeout(r, 800));
      }
      showToast("Video uploaded");
      return publicUrl;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      showToast(`Upload failed: ${msg}`, true);
      return null;
    } finally {
      setUploading(null);
    }
  };

  const handleImageUpload = async (
    file: File,
    type: "avatar" | "cover" | "gallery" | "about" | "country" | "collection",
    idx?: number,
    batch?: { current: number; total: number }
  ) => {
    if (file.size > 20 * 1024 * 1024) {
      showToast("File too large. Max 20MB.", true);
      return null;
    }
    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file", true);
      return null;
    }
    if (file.type === "image/svg+xml") {
      showToast("SVG uploads are not supported here. Please upload a photo image.", true);
      return null;
    }
    if (file.type === "image/gif") {
      showToast("GIF uploads are not supported for profile images. Please upload a static image.", true);
      return null;
    }

    setUploading({ field: type, stage: "uploading", idx, current: batch?.current, total: batch?.total });
    try {
      let dims = null;
      if (file.type.startsWith("image/")) {
        dims = await new Promise<{ width: number; height: number } | null>((resolve) => {
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
      }

      const presignRes = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileType: file.type,
          prefix: type,
          fileName: `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        }),
      });

      if (!presignRes.ok) {
        let err = "Failed to get upload URL";
        try { err = (await presignRes.json()).error || err; } catch { }
        throw new Error(err);
      }

      const { uploadUrl, publicUrl } = await presignRes.json();

      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!putRes.ok) throw new Error("Upload to storage failed");

      console.info(`[profiles-upload] ✅ Done: ${file.name} → ${publicUrl}`);

      try {
        const urlObj = new URL(publicUrl);
        const key = urlObj.pathname.substring(1);
        await fetch("/api/media-engine/optimize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, mediaType: "IMAGE" }),
        });
      } catch (err) {
        console.warn("Media engine optimization trigger failed", err);
      }

      const isLastInBatch = !batch || batch.current === batch.total;
      if (isLastInBatch) {
        setUploading((prev) => prev ? { ...prev, stage: "done" } : null);
        await new Promise((r) => setTimeout(r, 800));
      }
      showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} image uploaded`);
      if (dims) {
        return { url: String(publicUrl), width: dims.width, height: dims.height };
      }
      return String(publicUrl);

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      showToast(`Upload failed: ${msg}`, true);
      return null;
    } finally {
      setUploading(null);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const urlOrObj = await handleImageUpload(file, "cover");
    if (urlOrObj) {
      setForm((prev) => ({
        ...prev,
        images: { ...prev.images, cover: typeof urlOrObj === 'string' ? urlOrObj : urlOrObj.url },
      }));
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const urlOrObj = await handleImageUpload(file, "avatar");
    if (urlOrObj) {
      setForm((prev) => ({
        ...prev,
        images: { ...prev.images, avatar: typeof urlOrObj === 'string' ? urlOrObj : urlOrObj.url },
      }));
    }
  };

  const handleGalleryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    // Reset input so the same files can be re-selected if needed
    e.target.value = "";
    for (let fi = 0; fi < files.length; fi++) {
      const file = files[fi];
      const batch = { current: fi + 1, total: files.length };
      const url = await handleImageUpload(file, "gallery", undefined, batch);
      if (url) {
        setForm((prev) => ({
          ...prev,
          images: { ...prev.images, gallery: [...prev.images.gallery, typeof url === 'string' ? url : url.url] },
        }));
      }
    }
  };

  const handleGalleryVideoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    e.target.value = "";
    for (let fi = 0; fi < files.length; fi++) {
      const file = files[fi];
      const batch = { current: fi + 1, total: files.length };
      const url = await handleVideoUpload(file, "gallery", undefined, batch);
      if (url) {
        setForm((prev) => ({
          ...prev,
          images: { ...prev.images, gallery: [...prev.images.gallery, typeof url === 'string' ? url : url.url] },
        }));
      }
    }
  };

  const handleAboutUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    e.target.value = "";

    const availableSlots = Math.max(0, 4 - form.aboutImages.length);
    if (availableSlots === 0) {
      showToast("About section supports up to 4 photos.", true);
      return;
    }

    const filesToUpload = files.slice(0, availableSlots);
    const uploadedUrls: string[] = [];

    for (const file of filesToUpload) {
      const url = await handleImageUpload(file, "about");
      if (url) uploadedUrls.push(typeof url === 'string' ? url : url.url);
    }

    if (uploadedUrls.length > 0) {
      setForm((prev) => ({
        ...prev,
        aboutImages: [...prev.aboutImages, ...uploadedUrls].slice(0, 4),
      }));
    }

    if (files.length > filesToUpload.length) {
      showToast("Only the first 4 About photos are kept.");
    }
  };

  const removeGalleryImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: {
        ...prev.images,
        gallery: prev.images.gallery.filter((_, i) => i !== index),
      },
    }));
  };

  const removeAboutImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      aboutImages: prev.aboutImages.filter((_, i) => i !== index),
    }));
  };

  const saveFormState = async (newForm: typeof form) => {
    if (!editing) return;
    const cleanCountryImages = newForm.countryImages.filter(c => c.images.length > 0);
    const cleanCollectionImages = newForm.collectionImages.filter(c => c.images.length > 0);
    const computedMedia =
      cleanCountryImages.reduce((sum, c) => sum + c.images.length, 0) +
      cleanCollectionImages.reduce((sum, c) => sum + c.images.length, 0);
    const payload = {
      ...newForm,
      countryImages: cleanCountryImages,
      collectionImages: cleanCollectionImages,
      media: computedMedia
    };
    try {
      const res = await fetch(`/api/profiles/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        showToast(errData?.error || `Save failed (${res.status})`, true);
      } else {
        await fetchProfiles();
      }
    } catch {
      showToast("Failed to save changes", true);
    }
  };

  const deleteCountryMedia = (countryIdx: number, imageIdx: number) => {
    const newCountryImages = form.countryImages
      .map((c, i) =>
        i === countryIdx ? { ...c, images: c.images.filter((_, j) => j !== imageIdx) } : c
      )
      .filter((c) => c.images.length > 0);
    const newForm = { ...form, countryImages: newCountryImages };
    setForm(newForm);
    saveFormState(newForm);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.handle.trim()) {
      showToast("Name and handle are required", true);
      return;
    }

    setSaving(true);
    try {
      const cleanCountryImages = form.countryImages.filter(c => c.images.length > 0);
      const cleanCollectionImages = form.collectionImages.filter(c => c.images.length > 0);
      const computedMedia =
        cleanCountryImages.reduce((sum, c) => sum + c.images.length, 0) +
        cleanCollectionImages.reduce((sum, c) => sum + c.images.length, 0);
      const payload = {
        ...form,
        countryImages: cleanCountryImages,
        collectionImages: cleanCollectionImages,
        media: computedMedia
      };
      let res: Response;
      if (editing) {
        res = await fetch(`/api/profiles/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/profiles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        showToast(errData?.error || `Save failed (${res.status})`, true);
        setSaving(false);
        return;
      }
      showToast(editing ? "Profile updated" : "Profile added");
      setForm(emptyForm);
      setEditing(null);
      await fetchProfiles();
    } catch (err) {
      showToast(`Failed to save: ${err instanceof Error ? err.message : "Network error"}`, true);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this profile?")) return;
    try {
      await fetch(`/api/profiles/${id}`, { method: "DELETE" });
      showToast("Profile deleted");
      if (editing?.id === id) {
        setEditing(null);
        setForm(emptyForm);
      }
      await fetchProfiles();
    } catch {
      showToast("Failed to delete");
    }
  };

  const startEdit = (p: Profile) => {
    setEditing(p);
    setForm({
      name: p.name,
      handle: p.handle,
      country: p.country,
      flag: p.flag,
      flagCode: p.flagCode || (p as any).flag_code || "",
      homelandFlagCode: p.homelandFlagCode || (p as any).homeland_flag_code || "",
      currentlyInFlagCode: p.currentlyInFlagCode || (p as any).currently_in_flag_code || "",
      countries: p.countries,
      media: p.media,
      collections: p.collections,
      images: { ...p.images, gallery: p.images?.gallery ? [...p.images.gallery] : [] },
      align: p.align,
      bio: p.bio,
      interests: p.interests ? [...p.interests] : [],
      languages: p.languages ? [...p.languages] : [],
      homeland: p.homeland,
      currentlyIn: p.currentlyIn,
      socials: { ...p.socials, x: p.socials?.x || "", instagram: p.socials?.instagram || "", linkedin: p.socials?.linkedin || "", youtube: p.socials?.youtube || "" },
      aboutImages: p.aboutImages || (p as any).about_images ? [...(p.aboutImages || (p as any).about_images)] : [],
      visitedCountryCodes: p.visitedCountryCodes || (p as any).visited_country_codes ? [...(p.visitedCountryCodes || (p as any).visited_country_codes)] : [],
      countryImages: p.countryImages || (p as any).country_images ? [...(p.countryImages || (p as any).country_images)] : [],
      collectionImages: p.collectionImages || (p as any).collection_images
        ? (p.collectionImages || (p as any).collection_images).map((collection: any) => ({
          ...collection,
          countryCodes: Array.isArray(collection.countryCodes || collection.country_codes) ? [...(collection.countryCodes || collection.country_codes)] : [],
        }))
        : [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const selectableMediaUrls = Array.from(
    new Set([
      ...form.countryImages.flatMap((c) => c.images),
      ...form.collectionImages.flatMap((c) => c.images),
    ])
  );
  const canPickFromMedia = selectableMediaUrls.length > 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 text-white px-5 py-3 rounded-xl text-sm font-medium shadow-lg animate-[fadeIn_0.2s_ease-out] ${toast.error ? "bg-red-500" : "bg-[#5A45F9]"}`}>
          {toast.msg}
        </div>
      )}

      {/* Media Picker Modal */}
      {mediaPickerTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setMediaPickerTarget(null)}>
          <div className="bg-black-700 border border-white/10 rounded-2xl p-6 max-w-3xl w-full mx-4 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Select from your media</h3>
              <button onClick={() => setMediaPickerTarget(null)} className="text-white/40 hover:text-white text-lg cursor-pointer">✕</button>
            </div>
            <p className="text-xs text-white/40 mb-3">
              {mediaPickerTarget.type === "about"
                ? `Tap photos to add them to About (${form.aboutImages.length}/4 selected).`
                : "Tap items to add them. Already added items are dimmed."}
            </p>
            <div className="overflow-y-auto flex-1 -mx-1">
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 px-1">
                {selectableMediaUrls.map((url, i) => {
                  const existing = mediaPickerTarget.type === "country"
                    ? form.countryImages[mediaPickerTarget.idx ?? -1]?.images ?? []
                    : mediaPickerTarget.type === "collection"
                      ? form.collectionImages[mediaPickerTarget.idx ?? -1]?.images ?? []
                      : form.aboutImages;
                  const isAlreadyAdded = existing.includes(url);
                  const isVid = /\.(mp4|mov|webm|m4v)$/i.test(url);
                  const aboutLimitReached = mediaPickerTarget.type === "about" && form.aboutImages.length >= 4;
                  const videoBlockedForAbout = mediaPickerTarget.type === "about" && isVid;
                  const disabled = isAlreadyAdded || aboutLimitReached || videoBlockedForAbout;

                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        if (disabled) return;
                        const { type, idx } = mediaPickerTarget;
                        if (type === "country" && typeof idx === "number") {
                          setForm((prev) => ({
                            ...prev,
                            countryImages: prev.countryImages.map((c, ci) =>
                              ci === idx ? { ...c, images: [...c.images, url] } : c
                            ),
                          }));
                          return;
                        }

                        if (type === "collection" && typeof idx === "number") {
                          setForm((prev) => ({
                            ...prev,
                            collectionImages: prev.collectionImages.map((c, ci) =>
                              ci === idx ? { ...c, images: [...c.images, url] } : c
                            ),
                          }));
                          return;
                        }

                        setForm((prev) => ({
                          ...prev,
                          aboutImages: [...prev.aboutImages, url].slice(0, 4),
                        }));
                      }}
                      className={`group relative aspect-square rounded-xl overflow-hidden bg-white/5 transition-all ${disabled ? "opacity-30 cursor-not-allowed" : "hover:ring-2 hover:ring-[#5A45F9] cursor-pointer"}`}
                    >
                      {isVid ? (
                        <>
                          <video
                            muted
                            playsInline
                            loop
                            preload="metadata"
                            className="w-full h-full object-cover"
                            onMouseEnter={(e) => e.currentTarget.play().catch(() => { })}
                            onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                          >
                            <source src={getOptimizedMediaUrl(toLandingAssetUrl(url))} type="video/webm" />
                            <source src={toLandingAssetUrl(url)} type="video/mp4" />
                          </video>
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity">
                            <span className="text-white text-[14px] drop-shadow">▶</span>
                          </div>
                        </>
                      ) : (
                        <LoadedImage src={toLandingAssetUrl(url)} thumbnailSrc={getOptimizedMediaUrl(toLandingAssetUrl(url))} alt={`Media ${i + 1}`} containerClassName="w-full h-full absolute inset-0" className="w-full h-full object-cover" />
                      )}
                      {isAlreadyAdded && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-sm font-bold">✓</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <button onClick={() => { setMediaPickerTarget(null); saveFormState(form); }} className="mt-4 w-full py-2.5 bg-[#5A45F9] hover:bg-[#4a35e9] rounded-lg text-sm font-medium transition-colors cursor-pointer">
              Done
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/60 transition hover:border-white/20 hover:text-white"
            >
              <span aria-hidden>←</span>
              <span>Dashboard</span>
            </a>
            <span className="hidden sm:block text-white/15">/</span>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold tracking-[-0.02em]">Featured Profiles CMS</h1>
              <p className="hidden md:block text-xs text-white/35">Design-driven profile editing, media curation, and quick publishing.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              type="button"
              onClick={scanOrphans}
              disabled={orphanScanning}
              variant="ghost"
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs text-white/55 hover:text-white transition-colors disabled:opacity-50"
            >
              {orphanScanning ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin inline-block" />
                  Scanning…
                </span>
              ) : "🧹 Scan Orphans"}
            </Button>
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/55">
              {profiles.length} profile{profiles.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </header>

      <div className="relative overflow-hidden border-b border-white/10 bg-[#0a0a0a]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(90,69,249,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_28%)]" />
        <div className="max-w-6xl mx-auto px-6 py-8 lg:py-10 relative z-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/50">
                Profile studio
              </span>
              <div className="space-y-3">
                <h2 className="text-[30px] leading-[1.05] tracking-[-0.04em] font-semibold text-white md:text-[42px] lg:text-[48px]">
                  Polish and publish profiles
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:max-w-md">
              <div className="rounded-2xl border border-white/10 bg-white/4 px-4 py-4 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">Profiles</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{profiles.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/4 px-4 py-4 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">Media</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                  {profiles.reduce((sum, profile) => sum + profile.media, 0)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/4 px-4 py-4 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">Published</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Live</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orphan Cleanup Panel */}
      {orphanPanelOpen && (
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="rounded-2xl border border-white/10 bg-white/4 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-lg">🧹</span>
                <div>
                  <h3 className="text-sm font-semibold">Orphaned Files Cleanup</h3>
                  <p className="text-xs text-white/40">Images uploaded but never saved to a profile</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={scanOrphans}
                  disabled={orphanScanning}
                  variant="ghost"
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-lg text-xs font-medium disabled:opacity-50"
                >
                  {orphanScanning ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin inline-block" />
                      Scanning…
                    </span>
                  ) : "Re-scan"}
                </Button>
                <button
                  onClick={() => { setOrphanPanelOpen(false); setOrphanResult(null); }}
                  className="text-white/30 hover:text-white/60 text-sm cursor-pointer p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {orphanResult && orphanResult.totalOrphaned === 0 && (
              <div className="text-center py-6">
                <span className="text-3xl">✨</span>
                <p className="text-sm text-white/50 mt-2">No orphaned files found. Everything is clean!</p>
                <p className="text-xs text-white/30 mt-1">{orphanResult.totalR2} files in R2 · {orphanResult.totalReferenced} referenced by profiles</p>
              </div>
            )}

            {orphanResult && orphanResult.totalOrphaned > 0 && (
              <>
                <div className="flex items-center justify-between mb-3 px-1">
                  <p className="text-xs text-white/50">
                    {orphanResult.totalOrphaned} orphaned file{orphanResult.totalOrphaned !== 1 ? "s" : ""} · {(orphanResult.totalOrphanedBytes / 1024 / 1024).toFixed(1)}MB wasted
                    <span className="text-white/30 ml-2">({orphanResult.totalR2} total in R2 · {orphanResult.totalReferenced} referenced)</span>
                  </p>
                  <Button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete ${orphanResult.totalOrphaned} orphaned file${orphanResult.totalOrphaned !== 1 ? "s" : ""}? This cannot be undone.`)) {
                        deleteOrphans(orphanResult.orphans.map((o) => o.key));
                      }
                    }}
                    disabled={orphanDeleting}
                    variant="ghost"
                    className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-medium disabled:opacity-50"
                  >
                    {orphanDeleting ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin inline-block" />
                        Deleting…
                      </span>
                    ) : `Delete All (${orphanResult.totalOrphaned})`}
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-64 overflow-y-auto">
                  {orphanResult.orphans.map((orphan) => {
                    const isVid = /\.(mp4|mov|webm|m4v)$/i.test(orphan.url);
                    return (
                      <div key={orphan.key} className="group relative rounded-lg overflow-hidden bg-white/5 aspect-square">
                        {isVid ? (
                          <div className="w-full h-full flex items-center justify-center text-white/20">
                            <span className="text-2xl">▶</span>
                          </div>
                        ) : (
                          <img
                            src={orphan.url}
                            alt="Orphaned"
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                          <p className="text-[10px] text-white/50 truncate">{orphan.key.split("/").pop()}</p>
                          <p className="text-[9px] text-white/30">{(orphan.size / 1024).toFixed(0)}KB</p>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm("Delete this file?")) {
                              deleteOrphans([orphan.key]);
                            }
                          }}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 cursor-pointer text-white/70 hover:text-white"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 xl:grid-cols-[minmax(0,460px)_minmax(0,1fr)] gap-6 xl:gap-8">
        {/* Form Panel */}
        <div className="shrink-0">
          <div className="sticky top-22 rounded-[28px] border border-white/10 bg-white/4 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/35">Editor</p>
                <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em]">
                  {editing ? "Edit Profile" : "Add New Profile"}
                </h2>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/45">
                Step 1 of 2
              </span>
            </div>

            <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
              {/* Images Section */}
              <div className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <h3 className="text-sm font-medium text-white/80 pb-2 border-b border-white/10">
                  Images
                </h3>

                {/* Cover Image */}
                <div>
                  <label className="text-sm text-white/60 block mb-2">
                    Cover Image
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-20 rounded-lg overflow-hidden bg-white/5 shrink-0 relative group">
                      {form.images.cover ? (
                        <>
                          <LoadedImage src={toLandingAssetUrl(form.images.cover)} thumbnailSrc={getOptimizedMediaUrl(toLandingAssetUrl(form.images.cover))} alt="Cover" containerClassName="w-full h-full absolute inset-0" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, images: { ...prev.images, cover: "" } }))}
                            className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/70 rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 cursor-pointer text-white"
                          >
                            ×
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
                          No cover
                        </div>
                      )}
                    </div>
                    <div>
                      <Button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        disabled={uploading !== null}
                        variant="ghost"
                        className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploading?.field === "cover" ? (
                          <span className="inline-flex items-center gap-2">
                            {uploading.stage === "done" ? (
                              <span className="text-emerald-400">✓</span>
                            ) : (
                              <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin inline-block" />
                            )}
                            {uploading.stage === "processing" ? "Processing…" : uploading.stage === "uploading" ? "Uploading…" : "Uploaded!"}
                          </span>
                        ) : "Upload Cover"}
                      </Button>
                      <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/jpeg, image/png, image/webp"
                        onChange={handleCoverUpload}
                        className="hidden"
                      />
                      <p className="text-xs text-white/30 mt-1">
                        PNG, JPG up to 20MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Avatar Image */}
                <div>
                  <label className="text-sm text-white/60 block mb-2">
                    Avatar
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 shrink-0 relative group">
                      {form.images.avatar ? (
                        <>
                          <LoadedImage src={toLandingAssetUrl(form.images.avatar)} thumbnailSrc={getOptimizedMediaUrl(toLandingAssetUrl(form.images.avatar))} alt="Avatar" containerClassName="w-full h-full absolute inset-0" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, images: { ...prev.images, avatar: "" } }))}
                            className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/70 rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 cursor-pointer text-white"
                          >
                            ×
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
                          No avatar
                        </div>
                      )}
                    </div>
                    <div>
                      <Button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={uploading !== null}
                        variant="ghost"
                        className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploading?.field === "avatar" ? (
                          <span className="inline-flex items-center gap-2">
                            {uploading.stage === "done" ? (
                              <span className="text-emerald-400">✓</span>
                            ) : (
                              <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin inline-block" />
                            )}
                            {uploading.stage === "processing" ? "Processing…" : uploading.stage === "uploading" ? "Uploading…" : "Uploaded!"}
                          </span>
                        ) : "Upload Avatar"}
                      </Button>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/jpeg, image/png, image/webp"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>


                {/* About Photos */}
                <div>
                  <label className="text-sm text-white/60 block mb-2">
                    About Photos ({form.aboutImages.length}/4)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.aboutImages.map((url, i) => (
                      <div
                        key={i}
                        className="relative w-20 h-16 rounded-lg overflow-hidden bg-white/5 group"
                      >
                        <LoadedImage
                          src={toLandingAssetUrl(url)}
                          thumbnailSrc={getOptimizedMediaUrl(toLandingAssetUrl(url))}
                          alt={`About ${i + 1}`}
                          containerClassName="w-full h-full absolute inset-0"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeAboutImage(i)}
                          className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/70 rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {Array.from({ length: Math.max(0, 4 - form.aboutImages.length) }).map((_, i) => (
                      <div
                        key={`about-placeholder-${i}`}
                        className="w-20 h-16 rounded-lg border border-dashed border-white/15 bg-white/5 flex items-center justify-center text-[10px] text-white/30"
                      >
                        Slot {form.aboutImages.length + i + 1}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 items-center">
                    <Button
                      type="button"
                      onClick={() => aboutInputRef.current?.click()}
                      disabled={uploading !== null || form.aboutImages.length >= 4}
                      variant="ghost"
                      className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading?.field === "about" ? (
                        <span className="inline-flex items-center gap-2">
                          {uploading.stage === "done" ? (
                            <span className="text-emerald-400">✓</span>
                          ) : (
                            <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin inline-block" />
                          )}
                          {uploading.stage === "processing"
                            ? `Processing${uploading.total && uploading.total > 1 ? ` ${uploading.current}/${uploading.total}` : ""}…`
                            : uploading.stage === "uploading"
                              ? `Uploading${uploading.total && uploading.total > 1 ? ` ${uploading.current}/${uploading.total}` : ""}…`
                              : `Uploaded${uploading.total && uploading.total > 1 ? ` ${uploading.total}/${uploading.total}` : ""}!`}
                        </span>
                      ) : "+ Add Media"}
                    </Button>
                    <input
                      ref={aboutInputRef}
                      type="file"
                      accept="image/jpeg, image/png, image/webp, video/*"
                      multiple
                      onChange={async (e) => {
                        const files = Array.from(e.target.files ?? []);
                        if (files.length === 0) return;
                        e.target.value = "";

                        const availableSlots = Math.max(0, 4 - form.aboutImages.length);
                        if (availableSlots === 0) {
                          showToast("About section supports up to 4 media items.", true);
                          return;
                        }

                        const filesToUpload = files.slice(0, availableSlots);
                        const uploadedUrls: string[] = [];

                        for (let fi = 0; fi < filesToUpload.length; fi++) {
                          const file = filesToUpload[fi];
                          const batch = { current: fi + 1, total: filesToUpload.length };
                          if (file.type.startsWith("video/")) {
                            const url = await handleVideoUpload(file, "about", undefined, batch);
                            if (url) uploadedUrls.push(typeof url === 'string' ? url : url.url);
                          } else {
                            const url = await handleImageUpload(file, "about", undefined, batch);
                            if (url) uploadedUrls.push(typeof url === 'string' ? url : url.url);
                          }
                        }

                        if (uploadedUrls.length > 0) {
                          setForm((prev) => ({
                            ...prev,
                            aboutImages: [...prev.aboutImages, ...uploadedUrls].slice(0, 4),
                          }));
                        }

                        if (files.length > filesToUpload.length) {
                          showToast("Only the first 4 About media items are kept.");
                        }
                      }}
                      className="hidden"
                    />

                    {canPickFromMedia && (
                      <Button
                        type="button"
                        onClick={() => setMediaPickerTarget({ type: "about" })}
                        disabled={form.aboutImages.length >= 4}
                        variant="ghost"
                        className="px-4 py-2 bg-[#5A45F9]/20 hover:bg-[#5A45F9]/30 text-[#8B7BFF] rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Select from media
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-white/30 mt-1">
                    Only displayed in the About tab. Max 4 photos.
                  </p>
                </div>

                {/* Country Images */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-white/60 block">
                      Country Images
                    </label>
                    <BulkUploadModal 
                      onUploadComplete={(results) => {
                        setForm(prev => {
                          const newCountryImages = [...prev.countryImages];
                          results.forEach(({ countryCode, urls }) => {
                            const existingIndex = newCountryImages.findIndex(c => c.countryCode === countryCode);
                            if (existingIndex >= 0) {
                              newCountryImages[existingIndex] = {
                                ...newCountryImages[existingIndex],
                                images: [...newCountryImages[existingIndex].images, ...urls]
                              };
                            } else {
                              newCountryImages.push({
                                countryCode,
                                images: urls
                              });
                            }
                          });
                          return { ...prev, countryImages: newCountryImages };
                        });
                        showToast("Bulk upload completed successfully!");
                      }} 
                    />
                  </div>
                  <div className="space-y-2 mb-2">
                    {form.countryImages.map((ci, idx) => {
                      const country = COUNTRY_LIST.find((c) => c.code === ci.countryCode);
                      return (
                        <div key={idx} className="bg-white/5 rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              {country && (
                                <img
                                  src={`/flags/${ci.countryCode}.svg`}
                                  alt={country.name}
                                  className="w-4 h-3 rounded-sm object-cover"
                                />
                              )}
                              <span className="text-sm text-white font-medium">{country?.name || ci.countryCode}</span>
                              <span className="text-xs text-white/40 ml-1">({ci.images.filter((u: any) => !(typeof u === 'string' ? u : u.url).match(/\.(mp4|mov|webm|m4v)$/i)).length} photos · {ci.images.filter((u: any) => (typeof u === 'string' ? u : u.url).match(/\.(mp4|mov|webm|m4v)$/i)).length} videos)</span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <label className="px-2 py-1 bg-white/10 hover:bg-white/15 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2">
                                {uploading?.field === "country" && uploading?.idx === idx ? (
                                  <span className="inline-flex items-center gap-1.5">
                                    {uploading.stage === "done" ? (
                                      <span className="text-emerald-400">✓</span>
                                    ) : (
                                      <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin inline-block" />
                                    )}
                                    {uploading.stage === "processing"
                                      ? `Processing${uploading.total && uploading.total > 1 ? ` ${uploading.current}/${uploading.total}` : ""}…`
                                      : uploading.stage === "uploading"
                                        ? `Uploading${uploading.total && uploading.total > 1 ? ` ${uploading.current}/${uploading.total}` : ""}…`
                                        : `Uploaded${uploading.total && uploading.total > 1 ? ` ${uploading.total}/${uploading.total}` : ""}!`}
                                  </span>
                                ) : "+ Add Media"}
                                <input
                                  type="file"
                                  accept="image/jpeg, image/png, image/webp, video/*"
                                  multiple
                                  className="hidden"
                                  onChange={async (e) => {
                                    const files = Array.from(e.target.files ?? []);
                                    if (files.length === 0) return;
                                    e.target.value = "";
                                    const urls: string[] = [];
                                    for (let fi = 0; fi < files.length; fi++) {
                                      const file = files[fi];
                                      const batch = { current: fi + 1, total: files.length };
                                      if (file.type.startsWith("video/")) {
                                        const url = await handleVideoUpload(file, "country", idx, batch);
                                        if (url) urls.push(typeof url === 'string' ? url : url.url);
                                      } else {
                                        const url = await handleImageUpload(file, "country", idx, batch);
                                        if (url) urls.push(typeof url === 'string' ? url : url.url);
                                      }
                                    }
                                    if (urls.length > 0) {
                                      const newCountryImages = form.countryImages.map((c, i) =>
                                        i === idx ? { ...c, images: [...c.images, ...urls] } : c
                                      );
                                      const newForm = { ...form, countryImages: newCountryImages };
                                      setForm(newForm);
                                      saveFormState(newForm);
                                    }
                                  }}
                                />

                              </label>
                              {canPickFromMedia && (
                                <Button
                                  type="button"
                                  onClick={() => setMediaPickerTarget({ type: "country", idx })}
                                  variant="ghost"
                                  className="px-2 py-1 bg-[#5A45F9]/20 hover:bg-[#5A45F9]/30 text-[#8B7BFF] rounded-md text-xs font-medium whitespace-nowrap"
                                >
                                  Select from media
                                </Button>
                              )}
                              <Button
                                type="button"
                                onClick={() =>
                                  setForm((prev) => ({
                                    ...prev,
                                    countryImages: prev.countryImages.filter((_, i) => i !== idx),
                                  }))
                                }
                                variant="ghost"
                                className="p-1 hover:bg-red-500/20 rounded-md text-white/40 hover:text-red-400 transition-colors cursor-pointer text-xs"
                              >
                                ✕
                              </Button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {ci.images.map((imgEntry: any, imgIdx: number) => {
                              const imgUrl = typeof imgEntry === "string" ? imgEntry : imgEntry.url;
                              const isVid = /\.(mp4|mov|webm|m4v)$/i.test(imgUrl);
                              return (
                                <div key={imgIdx} className="relative group w-16 h-12 shrink-0">
                                  <div className="w-full h-full rounded-md overflow-hidden bg-white/5">
                                    {isVid ? (
                                      <>
                                        <video
                                          muted
                                          playsInline
                                          loop
                                          preload="metadata"
                                          className="w-full h-full object-cover"
                                          onMouseEnter={(e) => e.currentTarget.play().catch(() => { })}
                                          onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                                          onClick={(e) => { const v = e.currentTarget; if (v.paused) v.play().catch(() => { }); else { v.pause(); v.currentTime = 0; } }}
                                        >
                                          <source src={getOptimizedMediaUrl(toLandingAssetUrl(imgUrl))} type="video/webm" />
                                          <source src={toLandingAssetUrl(imgUrl)} type="video/mp4" />
                                        </video>
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity">
                                          <span className="text-white text-[16px] drop-shadow">▶</span>
                                        </div>
                                      </>
                                    ) : (
                                      <LoadedImage
                                        src={toLandingAssetUrl(imgUrl)}
                                        thumbnailSrc={getOptimizedMediaUrl(toLandingAssetUrl(imgUrl))}
                                        alt={`${country?.name || ci.countryCode} ${imgIdx + 1}`}
                                        containerClassName="w-full h-full absolute inset-0"
                                        className="w-full h-full object-cover"
                                      />
                                    )}
                                    {ci.coverPhoto === imgUrl && (
                                      <div className="absolute top-1 left-1 z-20 bg-[#5A45F9] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm pointer-events-none shadow-sm">COVER</div>
                                    )}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setForm((prev) => ({
                                            ...prev,
                                            countryImages: prev.countryImages.map((c, i) =>
                                              i === idx ? { ...c, coverPhoto: imgUrl } : c
                                            ),
                                          }));
                                        }}
                                        className="px-2 py-1 bg-white/20 hover:bg-[#5A45F9] text-white text-[9px] font-medium rounded-sm transition-colors"
                                      >
                                        Set Cover
                                      </button>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteCountryMedia(idx, imgIdx);
                                    }}
                                    className="absolute -top-1.5 -right-1.5 z-20 w-4 h-4 bg-black/80 hover:bg-red-500 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer text-[9px] leading-none border border-white/10"
                                  >
                                    ✕
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                          <Textarea
                            placeholder={`About ${country?.name || ci.countryCode}...`}
                            value={ci.about || ""}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                countryImages: prev.countryImages.map((c, i) =>
                                  i === idx ? { ...c, about: e.target.value } : c
                                ),
                              }))
                            }
                            className="bg-white/5 border-white/10 text-white min-h-[80px]"
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <CountrySelect
                        label=""
                        value={pendingCountryCode}
                        onChange={(code) => setPendingCountryCode(code)}
                      />
                    </div>
                    <button
                      type="button"
                      disabled={!pendingCountryCode}
                      onClick={() => {
                        if (!pendingCountryCode) return;
                        const alreadyExists = form.countryImages.some(
                          (c) => c.countryCode === pendingCountryCode
                        );
                        if (!alreadyExists) {
                          setForm((prev) => ({
                            ...prev,
                            countryImages: [
                              ...prev.countryImages,
                              { countryCode: pendingCountryCode, images: [] },
                            ],
                          }));
                        }
                        setPendingCountryCode("");
                      }}
                      className="px-3 py-2.5 bg-white/10 hover:bg-white/15 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      + Add Country
                    </button>
                  </div>
                </div>

                {/* Collection Images */}
                <div>
                  <label className="text-sm text-white/60 block mb-2">
                    Collection Images
                  </label>
                  <div className="space-y-2 mb-2">
                    {form.collectionImages.map((ci, idx) => (
                      <div key={idx} className="bg-white/5 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm text-white font-medium">{ci.title}</span>
                            <span className="text-xs text-white/40 ml-1">({ci.images.filter(u => !u.match(/\.(mp4|mov|webm|m4v)$/i)).length} photos · {ci.images.filter(u => u.match(/\.(mp4|mov|webm|m4v)$/i)).length} videos)</span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <label className="px-2 py-1 bg-white/10 hover:bg-white/15 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2">
                              {uploading?.field === "collection" && uploading?.idx === idx ? (
                                <span className="inline-flex items-center gap-1.5">
                                  {uploading.stage === "done" ? (
                                    <span className="text-emerald-400">✓</span>
                                  ) : (
                                    <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin inline-block" />
                                  )}
                                  {uploading.stage === "processing"
                                    ? `Processing${uploading.total && uploading.total > 1 ? ` ${uploading.current}/${uploading.total}` : ""}…`
                                    : uploading.stage === "uploading"
                                      ? `Uploading${uploading.total && uploading.total > 1 ? ` ${uploading.current}/${uploading.total}` : ""}…`
                                      : `Uploaded${uploading.total && uploading.total > 1 ? ` ${uploading.total}/${uploading.total}` : ""}!`}
                                </span>
                              ) : "+ Add Media"}
                              <input
                                type="file"
                                accept="image/jpeg, image/png, image/webp, video/*"
                                multiple
                                className="hidden"
                                onChange={async (e) => {
                                  const files = Array.from(e.target.files ?? []);
                                  if (files.length === 0) return;
                                  e.target.value = "";
                                  const urls: string[] = [];
                                  for (let fi = 0; fi < files.length; fi++) {
                                    const file = files[fi];
                                    const batch = { current: fi + 1, total: files.length };
                                    if (file.type.startsWith("video/")) {
                                      const url = await handleVideoUpload(file, "collection", idx, batch);
                                      if (url) urls.push(typeof url === 'string' ? url : url.url);
                                    } else {
                                      const url = await handleImageUpload(file, "collection", idx, batch);
                                      if (url) urls.push(typeof url === 'string' ? url : url.url);
                                    }
                                  }
                                  if (urls.length > 0) {
                                    setForm((prev) => ({
                                      ...prev,
                                      collectionImages: prev.collectionImages.map((c, i) =>
                                        i === idx ? { ...c, images: [...c.images, ...urls] } : c
                                      ),
                                    }));
                                  }
                                }}
                              />

                            </label>
                            {canPickFromMedia && (
                              <Button
                                type="button"
                                onClick={() => setMediaPickerTarget({ type: "collection", idx })}
                                variant="ghost"
                                className="px-2 py-1 bg-[#5A45F9]/20 hover:bg-[#5A45F9]/30 text-[#8B7BFF] rounded-md text-xs font-medium whitespace-nowrap"
                              >
                                Select from media
                              </Button>
                            )}
                            <Button
                              type="button"
                              onClick={() =>
                                setForm((prev) => ({
                                  ...prev,
                                  collectionImages: prev.collectionImages.filter((_, i) => i !== idx),
                                }))
                              }
                              variant="ghost"
                              className="p-1 hover:bg-red-500/20 rounded-md text-white/40 hover:text-red-400 transition-colors cursor-pointer text-xs"
                            >
                              ✕
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {ci.images.map((imgEntry: any, imgIdx: number) => {
                            const imgUrl = typeof imgEntry === "string" ? imgEntry : imgEntry.url;
                            const isVid = /\.(mp4|mov|webm|m4v)$/i.test(imgUrl);
                            return (
                              <div key={imgIdx} className="relative group w-16 h-12 rounded-md overflow-hidden bg-white/5 shrink-0">
                                {isVid ? (
                                  <>
                                    <video
                                      muted
                                      playsInline
                                      loop
                                      preload="metadata"
                                      className="w-full h-full object-cover"
                                      onMouseEnter={(e) => e.currentTarget.play().catch(() => { })}
                                      onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                                      onClick={(e) => { const v = e.currentTarget; if (v.paused) v.play().catch(() => { }); else { v.pause(); v.currentTime = 0; } }}
                                    >
                                      <source src={getOptimizedMediaUrl(toLandingAssetUrl(imgUrl))} type="video/webm" />
                                      <source src={toLandingAssetUrl(imgUrl)} type="video/mp4" />
                                    </video>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity">
                                      <span className="text-white text-[16px] drop-shadow">▶</span>
                                    </div>
                                  </>
                                ) : (
                                  <LoadedImage
                                    src={toLandingAssetUrl(imgUrl)}
                                    thumbnailSrc={getOptimizedMediaUrl(toLandingAssetUrl(imgUrl))}
                                    alt={`${ci.title} ${imgIdx + 1}`}
                                    containerClassName="w-full h-full absolute inset-0"
                                    className="w-full h-full object-cover"
                                  />
                                )}
                                {ci.coverPhoto === imgUrl && (
                                  <div className="absolute top-1 left-1 z-20 bg-[#5A45F9] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm pointer-events-none shadow-sm">COVER</div>
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 z-10">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setForm((prev) => ({
                                        ...prev,
                                        collectionImages: prev.collectionImages.map((c, i) =>
                                          i === idx ? { ...c, coverPhoto: imgUrl } : c
                                        ),
                                      }));
                                    }}
                                    className="px-1.5 py-0.5 bg-white/20 hover:bg-[#5A45F9] text-white text-[9px] font-medium rounded-sm transition-colors"
                                  >
                                    Set Cover
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setForm((prev) => ({
                                        ...prev,
                                        collectionImages: prev.collectionImages.map((c, i) =>
                                          i === idx ? { ...c, images: c.images.filter((_, j) => j !== imgIdx) } : c
                                        ).filter((c) => c.images.length > 0),
                                      }));
                                    }}
                                    className="w-5 h-5 bg-black/80 hover:bg-red-500 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer text-[9px] leading-none border border-white/10"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <Textarea
                          placeholder={`About ${ci.title}...`}
                          value={ci.about || ""}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              collectionImages: prev.collectionImages.map((c, i) =>
                                i === idx ? { ...c, about: e.target.value } : c
                              ),
                            }))
                          }
                          className="bg-white/5 border-white/10 text-white min-h-[80px]"
                        />
                        <MultiCountrySelect
                          label="Countries for this collection"
                          value={ci.countryCodes || []}
                          onChange={(codes) =>
                            setForm((prev) => ({
                              ...prev,
                              collectionImages: prev.collectionImages.map((c, i) =>
                                i === idx ? { ...c, countryCodes: codes } : c
                              ),
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={pendingCollectionTitle}
                        onChange={(e) => setPendingCollectionTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const title = pendingCollectionTitle.trim();
                            if (!title) return;
                            setForm((prev) => ({
                              ...prev,
                              collectionImages: [
                                ...prev.collectionImages,
                                { title, images: [], countryCodes: [] },
                              ],
                            }));
                            setPendingCollectionTitle("");
                          }
                        }}
                        placeholder="Collection title..."
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#5A45F9] transition-colors"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={!pendingCollectionTitle.trim()}
                      onClick={() => {
                        const title = pendingCollectionTitle.trim();
                        if (!title) return;
                        setForm((prev) => ({
                          ...prev,
                          collectionImages: [
                            ...prev.collectionImages,
                            { title, images: [], countryCodes: [] },
                          ],
                        }));
                        setPendingCollectionTitle("");
                      }}
                      className="px-3 py-2.5 bg-white/10 hover:bg-white/15 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      + Add Collection
                    </button>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <h3 className="text-sm font-medium text-white/80 pb-2 border-b border-white/10">
                  Basic Info
                </h3>

                {/* Email (Optional) */}
                <div>
                  <label className="text-sm text-white/60 block mb-1.5">
                    User Email <span className="text-white/30 text-xs ml-2">(Optional - creates user account if provided)</span>
                  </label>
                  <Input
                    type="email"
                    value={form.email || ""}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="user@example.com"
                    className="bg-white/5 border border-white/10 placeholder:text-white/25 focus:border-[#5A45F9]"
                  />
                </div>



                {/* Name */}
                <div>
                  <label className="text-sm text-white/60 block mb-1.5">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={form.name || ""}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g. Michael Thompson"
                    className="bg-white/5 border border-white/10 placeholder:text-white/25 focus:border-[#5A45F9]"
                  />
                </div>

                {/* Handle */}
                <div>
                  <label className="text-sm text-white/60 block mb-1.5">
                    Handle <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={form.handle || ""}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, handle: e.target.value }))
                    }
                    placeholder="e.g. @micheal.th99"
                    className="bg-white/5 border border-white/10 placeholder:text-white/25 focus:border-[#5A45F9]"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="text-sm text-white/60 block mb-1.5">
                    Bio
                  </label>
                  <Textarea
                    value={form.bio || ""}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    placeholder="Short bio about this traveler..."
                    rows={3}
                    className="bg-white/5 border border-white/10 placeholder:text-white/25 focus:border-[#5A45F9] resize-none"
                  />
                </div>

              </div>

              {/* Country & Location */}
              <div className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <h3 className="text-sm font-medium text-white/80 pb-2 border-b border-white/10">
                  Country & Location
                </h3>

                {/* Primary Country */}
                <CountrySelect
                  label="Primary Country"
                  value={form.flagCode}
                  onChange={(code, name, flag) =>
                    setForm((prev) => ({
                      ...prev,
                      flagCode: code,
                      country: name,
                      flag,
                    }))
                  }
                />

                {/* Homeland */}
                <div className="space-y-2">
                  <CountrySelect
                    label="Homeland Country"
                    value={form.homelandFlagCode}
                    onChange={(code, name) =>
                      setForm((prev) => ({
                        ...prev,
                        homelandFlagCode: code,
                        // Pre-fill city text if empty, otherwise keep what admin typed
                        homeland: prev.homeland || name,
                      }))
                    }
                  />
                  <Input
                    type="text"
                    value={form.homeland || ""}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, homeland: e.target.value }))
                    }
                    placeholder="City, e.g. Bogota"
                    className="bg-white/5 border border-white/10 placeholder:text-white/25 focus:border-[#5A45F9]"
                  />
                </div>

                {/* Currently In */}
                <div className="space-y-2">
                  <CountrySelect
                    label="Currently In Country"
                    value={form.currentlyInFlagCode}
                    onChange={(code, name) =>
                      setForm((prev) => ({
                        ...prev,
                        currentlyInFlagCode: code,
                        currentlyIn: prev.currentlyIn || name,
                      }))
                    }
                  />
                  <Input
                    type="text"
                    value={form.currentlyIn || ""}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, currentlyIn: e.target.value }))
                    }
                    placeholder="City, e.g. Medellin"
                    className="bg-white/5 border border-white/10 placeholder:text-white/25 focus:border-[#5A45F9]"
                  />
                </div>

                {/* Visited Countries */}
                <MultiCountrySelect
                  label="Visited Countries"
                  value={form.visitedCountryCodes}
                  onChange={(codes) =>
                    setForm((prev) => ({
                      ...prev,
                      visitedCountryCodes: codes,
                      countries: codes.length,
                    }))
                  }
                />
              </div>



              {/* Tags */}
              <div className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <h3 className="text-sm font-medium text-white/80 pb-2 border-b border-white/10">
                  Interests & Languages
                </h3>
                <TagInput
                  label="Interests"
                  value={form.interests}
                  onChange={(v) =>
                    setForm((prev) => ({ ...prev, interests: v }))
                  }
                  placeholder="e.g. Photography, Hiking"
                />
                <TagInput
                  label="Languages"
                  value={form.languages}
                  onChange={(v) =>
                    setForm((prev) => ({ ...prev, languages: v }))
                  }
                  placeholder="e.g. English, Spanish"
                />
              </div>

              {/* Social Links */}
              <div className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <h3 className="text-sm font-medium text-white/80 pb-2 border-b border-white/10">
                  Social Links
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-white/30 text-xs w-16">
                      Instagram
                    </span>
                    <Input
                      type="text"
                      value={form.socials.instagram}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          socials: {
                            ...prev.socials,
                            instagram: e.target.value,
                          },
                        }))
                      }
                      placeholder="username"
                      className="flex-1 bg-white/5 border border-white/10 text-xs placeholder:text-white/25 focus:border-[#5A45F9]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/30 text-xs w-16">X</span>
                    <Input
                      type="text"
                      value={form.socials.x}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          socials: { ...prev.socials, x: e.target.value },
                        }))
                      }
                      placeholder="username"
                      className="flex-1 bg-white/5 border border-white/10 text-xs placeholder:text-white/25 focus:border-[#5A45F9]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/30 text-xs w-16">LinkedIn</span>
                    <Input
                      type="text"
                      value={form.socials.linkedin}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          socials: {
                            ...prev.socials,
                            linkedin: e.target.value,
                          },
                        }))
                      }
                      placeholder="username"
                      className="flex-1 bg-white/5 border border-white/10 text-xs placeholder:text-white/25 focus:border-[#5A45F9]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/30 text-xs w-16">YouTube</span>
                    <Input
                      type="text"
                      value={form.socials.youtube}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          socials: {
                            ...prev.socials,
                            youtube: e.target.value,
                          },
                        }))
                      }
                      placeholder="channel"
                      className="flex-1 bg-white/5 border border-white/10 text-xs placeholder:text-white/25 focus:border-[#5A45F9]"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  loading={saving}
                  className="flex-1 py-2.5 bg-white text-black hover:bg-white/90 rounded-full text-sm font-semibold shadow-[0_12px_30px_rgba(255,255,255,0.08)]"
                >
                  {saving
                    ? "Saving..."
                    : editing
                      ? "Update Profile"
                      : "Add Profile"}
                </Button>
                {editing && (
                  <Button
                    type="button"
                    onClick={cancelEdit}
                    variant="ghost"
                    className="py-2.5 px-4 bg-white/10 hover:bg-white/15 rounded-full text-sm font-medium"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* List Panel */}
        <div className="flex-1 min-w-0">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">Directory</p>
              <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em]">All Profiles</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/45">
              {profiles.length} entries
            </span>
          </div>

          {loading ? (
            <div className="text-white/40 text-sm py-12 text-center">
              Loading...
            </div>
          ) : profiles.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/4 p-12 text-center backdrop-blur-sm">
              <p className="text-white/40 text-sm">No profiles yet</p>
              <p className="text-white/20 text-xs mt-1">
                Add your first one using the form
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {profiles.map((p) => (
                <div
                  key={p.id}
                  className={`rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/6 ${editing?.id === p.id
                      ? "border-[#5A45F9]/60 bg-[#5A45F9]/8 shadow-[0_18px_40px_rgba(90,69,249,0.12)]"
                      : "border-white/10 bg-white/4"
                    }`}
                >
                  <div className="flex gap-4 items-start">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/5 shrink-0 relative">
                      {p.images.avatar ? (
                        <LoadedImage src={toLandingAssetUrl(p.images.avatar)} thumbnailSrc={getOptimizedMediaUrl(toLandingAssetUrl(p.images.avatar))} alt={p.name} containerClassName="w-full h-full absolute inset-0" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20 text-lg">
                          👤
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {p.flagCode && (
                          <img
                            src={`/flags/${p.flagCode}.svg`}
                            alt={p.country}
                            className="w-4 h-3 rounded-sm object-cover"
                          />
                        )}
                        <span className="font-medium text-sm">{p.name}</span>
                        <span className="text-white/40 text-xs">
                          {p.handle}
                        </span>
                      </div>
                      <p className="text-white/50 text-xs leading-relaxed line-clamp-2 mb-2">
                        {p.bio}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/40">
                        <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1">{p.countries} countries</span>
                        <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1">{p.media} media</span>
                        <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1">{p.collections} collections</span>
                      </div>
                      {/* Visited flags preview */}
                      {p.visitedCountryCodes && p.visitedCountryCodes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {p.visitedCountryCodes.slice(0, 15).map((code) => (
                            <img
                              key={code}
                              src={`/flags/${code}.svg`}
                              alt={code}
                              className="w-4 h-3 rounded-sm object-cover"
                            />
                          ))}
                          {p.visitedCountryCodes.length > 15 && (
                            <span className="text-white/20 text-[10px] self-center">
                              +{p.visitedCountryCodes.length - 15}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0 rounded-full border border-white/10 bg-black/20 p-1">
                      <Link
                        href={`https://app.travingat.com/profiles/${p.handle.replace(/^@/, "")}`}
                        target="_blank"
                        className="p-2 hover:bg-white/10 rounded-full text-xs text-white/60 hover:text-white transition-colors"
                        title="View profile"
                      >
                        🔗
                      </Link>
                      <button
                        onClick={() => startEdit(p)}
                        className="p-2 hover:bg-white/10 rounded-full text-xs text-white/60 hover:text-white transition-colors cursor-pointer"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 hover:bg-red-500/20 rounded-full text-xs text-white/60 hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Cover preview */}
                  {p.images.cover && (
                    <div className="mt-3 h-24 rounded-xl overflow-hidden relative ring-1 ring-white/10">
                      <LoadedImage src={toLandingAssetUrl(p.images.cover)} thumbnailSrc={getOptimizedMediaUrl(toLandingAssetUrl(p.images.cover))} alt="Cover" containerClassName="w-full h-full absolute inset-0" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
