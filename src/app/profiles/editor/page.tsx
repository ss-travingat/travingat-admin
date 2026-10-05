"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import LoadedImage from "@/components/ui/LoadedImage";
import { toLandingAssetUrl, getOptimizedMediaUrl } from "@/lib/landing-assets";
import { COUNTRY_LIST } from "@/lib/countries";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import BulkUploadModal from "../components/BulkUploadModal";
import CountrySelect from "../components/CountrySelect";
import ProfileCropModal from "@/components/ProfileCropModal";
import Lightbox from "@/components/ui/Lightbox";
import SortableImageGrid from "@/components/ui/SortableImageGrid";

interface CountryImage {
  countryCode: string;
  images: (string | { url: string; countryCode?: string })[];
  coverPhoto?: string;
  about?: string;
  updated_at?: string;
}

interface CollectionImage {
  title: string;
  images: (string | { url: string; countryCode?: string })[];
  coverPhoto?: string;
  about?: string;
  countryCodes?: string[];
  updated_at?: string;
}

interface Profile {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string; // computed by backend
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
    coverCrop?: any;
    avatar: string;
    avatarCrop?: any;
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
  showBadge?: boolean;
  explorerCardShowBadge?: boolean;
  isSampleProfile?: boolean;
  explorerCardVariant?: 'classic' | 'minimal' | 'adventure';
}

const emptyForm: Omit<Profile, "id"> = {
  firstName: "",
  lastName: "",
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
  showBadge: false,
  explorerCardShowBadge: false,
  isSampleProfile: false,
  explorerCardVariant: "adventure",
};



function MultiCountrySelect({
  label,
  value,
  onChange,
  autoSelected = [],
}: {
  label: string;
  value: string[];
  onChange: (codes: string[]) => void;
  autoSelected?: string[];
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

  const allSelected = Array.from(new Set([...value, ...autoSelected]));

  const toggle = (code: string) => {
    if (autoSelected.includes(code)) return;
    if (value.includes(code)) {
      onChange(value.filter((c) => c !== code));
    } else {
      onChange([...value, code]);
    }
  };

  return (
    <div ref={ref} className="relative">
      <label className="text-[13px] text-[#b3bccf] font-medium block mb-1.5">
        {label} <span className="text-white/30">({allSelected.length} selected)</span>
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2.5 bg-[#000000] border border-[#20242d] rounded-lg text-sm text-left hover:border-white/20 transition-colors cursor-pointer"
      >
        {allSelected.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {allSelected.slice(0, 10).map((code) => (
              <span
                key={code}
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${autoSelected.includes(code) ? "bg-[#5A45F9]/20 border border-[#5A45F9]/30" : "bg-white/10"}`}
              >
                <img
                  src={`/flags/${code}.svg`}
                  alt={code}
                  className="w-3.5 h-2.5 rounded-sm object-cover"
                />
                {code}
              </span>
            ))}
            {allSelected.length > 10 && (
              <span className="text-white/30 text-xs py-0.5">
                +{allSelected.length - 10} more
              </span>
            )}
          </div>
        ) : (
          <span className="text-white/25">Select visited countries...</span>
        )}
      </button>
      {open && (
        <div className="absolute z-40 mt-1 w-full bg-black-700 border border-[#1c212c] rounded-lg shadow-xl max-h-72 overflow-hidden">
          <div className="p-2 border-b border-[#1c212c]">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search countries..."
              className="bg-[#000000] border border-[#20242d] text-sm placeholder:text-[#6f798b] focus:border-[#5A45F9]"
              autoFocus
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => toggle(c.code)}
                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors ${autoSelected.includes(c.code) ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:bg-white/10"} ${allSelected.includes(c.code)
                  ? "bg-[#5A45F9]/20 text-white"
                  : "text-white/70"
                  }`}
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${allSelected.includes(c.code)
                    ? "bg-[#5A45F9] border-[#5A45F9]"
                    : "border-white/20"
                    }`}
                >
                  {allSelected.includes(c.code) && (
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
      <label className="text-[13px] text-[#b3bccf] font-medium block mb-1.5">{label}</label>
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
          className="flex-1 bg-[#000000] border border-[#20242d] text-xs placeholder:text-[#6f798b] focus:border-[#5A45F9]"
        />
        <Button
          type="button"
          onClick={addTag}
          size="sm"
          variant="ghost"
          className="px-3 py-2 bg-[#1c212c] text-[#d4d4d4] hover:text-white rounded-lg text-xs font-medium"
        >
          Add
        </Button>
      </div>
    </div>
  );
}

export default function EditorPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [form, setForm] = useState<Omit<Profile, "id">>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [toast, setToast] = useState<{ msg: string; error?: boolean } | null>(null);
  const [uploading, setUploading] = useState<{ field: "cover" | "avatar" | "gallery" | "about" | "country" | "collection"; stage: "processing" | "uploading" | "done"; idx?: number; current?: number; total?: number } | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const aboutInputRef = useRef<HTMLInputElement>(null);
  const [pendingCountryCode, setPendingCountryCode] = useState<string>("");
  const [pendingCollectionTitle, setPendingCollectionTitle] = useState<string>("");
  const [mediaPickerTarget, setMediaPickerTarget] = useState<{ type: "country" | "collection" | "about"; idx?: number } | null>(null);
  const [handleStatus, setHandleStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const [lightbox, setLightbox] = useState<{ items: { url: string; label?: string }[]; index: number } | null>(null);

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
      const normalizedProfiles = (Array.isArray(data) ? data : []).map((profile) => {
        const aboutImages = Array.isArray(profile.aboutImages) ? profile.aboutImages : (Array.isArray(profile.about_images) ? profile.about_images : []);
        const countryImages = Array.isArray(profile.countryImages) ? profile.countryImages : (Array.isArray(profile.country_images) ? profile.country_images : []);
        const rawCollectionImages = Array.isArray(profile.collectionImages) ? profile.collectionImages : (Array.isArray(profile.collection_images) ? profile.collection_images : []);
        const collectionImages = rawCollectionImages.map((collection: any) => ({
          ...collection,
          countryCodes: Array.isArray(collection.countryCodes) ? collection.countryCodes : (Array.isArray(collection.country_codes) ? collection.country_codes : []),
        }));
        return {
          ...profile,
          aboutImages,
          countryImages,
          collectionImages,
        };
      }) as Profile[];
      setProfiles([...normalizedProfiles].reverse());
    } catch {
      showToast("Failed to load profiles");
    }
    setLoading(false);
  };

  useEffect(() => {
    setTimeout(fetchProfiles, 0);

    // Check if we are navigated here to create or edit a profile
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const editId = params.get("id");

      if (editId) {
        fetch(`/api/profiles/${editId}`)
          .then(res => res.ok ? res.json() : Promise.reject())
          .then(data => {
            setEditing(data);
            setForm({
              firstName: data.firstName || (data as any).first_name || data.name?.split(' ')[0] || "",
              lastName: data.lastName || (data as any).last_name || data.name?.split(' ').slice(1).join(' ') || "",
              name: data.name || "",
              handle: data.handle || "",
              country: data.country || "",
              flag: data.flag || "",
              flagCode: data.flagCode || (data as any).flag_code || "",
              homelandFlagCode: data.homelandFlagCode || (data as any).homeland_flag_code || "",
              currentlyInFlagCode: data.currentlyInFlagCode || (data as any).currently_in_flag_code || "",
              countries: data.countries || 0,
              media: data.media || 0,
              collections: data.collections || 0,
              images: { ...emptyForm.images, ...data.images, gallery: data.images?.gallery ? [...data.images.gallery] : [] },
              align: data.align || "end",
              bio: data.bio || "",
              interests: data.interests ? [...data.interests] : [],
              languages: data.languages ? [...data.languages] : [],
              homeland: data.homeland || "",
              currentlyIn: data.currentlyIn || "",
              socials: { ...emptyForm.socials, ...data.socials, x: data.socials?.x || "", instagram: data.socials?.instagram || "", linkedin: data.socials?.linkedin || "", youtube: data.socials?.youtube || "" },
              aboutImages: data.aboutImages || (data as any).about_images ? [...(data.aboutImages || (data as any).about_images)] : [],
              visitedCountryCodes: data.visitedCountryCodes || (data as any).visited_country_codes ? [...(data.visitedCountryCodes || (data as any).visited_country_codes)] : [],
              countryImages: data.countryImages || (data as any).country_images ? [...(data.countryImages || (data as any).country_images)] : [],
              collectionImages: data.collectionImages || (data as any).collection_images
                ? (data.collectionImages || (data as any).collection_images).map((collection: any) => ({
                  ...collection,
                  countryCodes: Array.isArray(collection.countryCodes || collection.country_codes) ? [...(collection.countryCodes || collection.country_codes)] : [],
                }))
                : [],
              email: data.email || "",
              isExplorerCard: data.isExplorerCard ?? (data as any).is_explorer_card ?? false,
              isFeaturedProfile: data.isFeaturedProfile ?? (data as any).is_featured_profile ?? true,
              isSampleProfile: data.isSampleProfile ?? (data as any).is_sample_profile ?? false,
              explorerCardVariant: data.explorerCardVariant ?? (data as any).explorer_card_variant ?? "adventure",
              showBadge: data.showBadge ?? (data as any).show_badge ?? false,
            });
          })
          .catch(err => {
            console.error("Failed to load profile for edit", err);
            showToast("Failed to load profile for edit", true);
          })
          .finally(() => setLoading(false));

        // Clean the URL visually
        window.history.replaceState({}, '', '/profiles/editor');
      } else if (params.get("create") === "true") {
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
                  firstName: fname || prev.firstName,
                  lastName: lname || prev.lastName,
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
            .catch(console.error)
            .finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let active = true;
    if (form.handle.length < 3) {
      setTimeout(() => setHandleStatus('idle'), 0);
      return;
    }

    setTimeout(() => setHandleStatus('checking'), 0);
    const timer = setTimeout(async () => {
      try {
        let url = `/api/profiles/check-handle?handle=${encodeURIComponent(form.handle)}`;
        if (editing) {
          url += `&current_handle=${encodeURIComponent(editing.handle)}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (active) {
          if (res.ok) {
            setHandleStatus(data.available ? 'available' : 'unavailable');
          } else {
            setHandleStatus('idle');
          }
        }
      } catch (e) {
        if (active) setHandleStatus('idle');
      }
    }, 500);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [form.handle, editing]);

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
    showToast("Video uploads are currently disabled. Please upload an image.", true);
    return null;
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
      } catch (e) {
        console.warn("Media engine optimization trigger failed", e);
      }

      const isLastInBatch = !batch || batch?.current === batch?.total;
      if (isLastInBatch) {
        setUploading((prev) => prev ? { ...prev, stage: "done" } : null);
        await new Promise((r) => setTimeout(r, 800));
      }
      showToast("Video uploaded");
      return publicUrl;
    } catch (e: any) {
      const msg = e?.message || "Network error";
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
          body: JSON.stringify({
            key,
            mediaType: "IMAGE",
            thumbnails: type === "avatar" || type === "cover" ? [144] : [144, 720]
          }),
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

  const [cropConfig, setCropConfig] = useState<{ src: string; type: "cover" | "avatar"; file?: File } | null>(null);

  const handleCropSave = async (croppedFile: File, cropData: any) => {
    if (!cropConfig) return;

    let url = typeof cropConfig.src === "string" && !cropConfig.file ? cropConfig.src : null;

    if (cropConfig.file) {
      const urlOrObj = await handleImageUpload(cropConfig.file, cropConfig.type);
      if (urlOrObj) {
        url = typeof urlOrObj === 'string' ? urlOrObj : urlOrObj.url;
      }
    }

    if (url) {
      setForm((prev) => ({
        ...prev,
        images: {
          ...prev.images,
          [cropConfig.type]: url,
          [`${cropConfig.type}Crop`]: cropData
        },
      }));
    }
    setCropConfig(null);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCropConfig({ src: String(reader.result), type: "cover", file });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCropConfig({ src: String(reader.result), type: "avatar", file });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
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

  // Returns only the fields that differ from the original editing profile.
  // For a new profile (no editing) this is a no-op — we always send the full form on POST.
  const buildPatch = (newForm: typeof form, cleanCountryImages: typeof form.countryImages, cleanCollectionImages: typeof form.collectionImages, computedMedia: number) => {
    if (!editing) return { ...newForm, countryImages: cleanCountryImages, collectionImages: cleanCollectionImages, media: computedMedia };

    const patch: Record<string, any> = {};
    const orig = editing;

    // Scalar fields
    const scalarFields = [
      'firstName', 'lastName', 'handle', 'country', 'flag', 'flagCode', 'homelandFlagCode',
      'currentlyInFlagCode', 'align', 'bio', 'homeland', 'currentlyIn',
      'email', 'isExplorerCard', 'isFeaturedProfile', 'showBadge', 'isSampleProfile', 'explorerCardVariant',
    ] as const;
    for (const key of scalarFields) {
      const formVal = (newForm as any)[key];
      const origVal = (orig as any)[key] ?? (orig as any)[key.replace(/([A-Z])/g, (m) => `_${m.toLowerCase()}`)];
      if (formVal !== origVal) patch[key] = formVal;
    }

    // Arrays compared by JSON serialization
    const origAbout = orig.aboutImages || (orig as any).about_images || [];
    if (JSON.stringify(newForm.aboutImages) !== JSON.stringify(origAbout)) {
      patch.aboutImages = newForm.aboutImages;
    }

    const origVisited = orig.visitedCountryCodes || (orig as any).visited_country_codes || [];
    if (JSON.stringify(newForm.visitedCountryCodes) !== JSON.stringify(origVisited)) {
      patch.visitedCountryCodes = newForm.visitedCountryCodes;
    }

    const origInterests = orig.interests || [];
    if (JSON.stringify(newForm.interests) !== JSON.stringify(origInterests)) {
      patch.interests = newForm.interests;
    }

    const origLanguages = orig.languages || [];
    if (JSON.stringify(newForm.languages) !== JSON.stringify(origLanguages)) {
      patch.languages = newForm.languages;
    }

    // Nested objects
    const origImages = orig.images || { cover: '', avatar: '', gallery: [] };
    if (JSON.stringify(newForm.images) !== JSON.stringify(origImages)) {
      patch.images = newForm.images;
    }

    const origSocials = orig.socials || { x: '', instagram: '', linkedin: '', youtube: '' };
    if (JSON.stringify(newForm.socials) !== JSON.stringify(origSocials)) {
      patch.socials = newForm.socials;
    }

    // Country / collection images — always send cleaned versions if they changed
    const origCountry = orig.countryImages || (orig as any).country_images || [];
    if (JSON.stringify(cleanCountryImages) !== JSON.stringify(origCountry)) {
      patch.countryImages = cleanCountryImages;
      patch.media = computedMedia; // media must be recalculated whenever images change
    }

    const origCollection = orig.collectionImages || (orig as any).collection_images || [];
    if (JSON.stringify(cleanCollectionImages) !== JSON.stringify(origCollection)) {
      patch.collectionImages = cleanCollectionImages;
      patch.media = computedMedia;
    }

    return patch;
  };

  const saveFormState = async (newForm: typeof form) => {
    if (!editing) return;
    const cleanCountryImages = newForm.countryImages;
    const cleanCollectionImages = newForm.collectionImages;
    const computedMedia = new Set([
      ...cleanCountryImages.flatMap(c => c.images),
      ...cleanCollectionImages.flatMap(c => c.images)
    ]).size;
    const patch = buildPatch(newForm, cleanCountryImages, cleanCollectionImages, computedMedia);
    if (Object.keys(patch).length === 0) return; // nothing changed
    try {
      const res = await fetch(`/api/profiles/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        showToast(errData?.error || `Save failed (${res.status})`, true);
      } else {
        fetchProfiles();
      }
    } catch {
      showToast("Failed to save changes", true);
    }
  };

  const deleteCountryMedia = (countryIdx: number, imageIdx: number) => {
    const newCountryImages = form.countryImages
      .map((c, i) =>
        i === countryIdx ? { ...c, images: c.images.filter((_, j) => j !== imageIdx) } : c
      );
    const newForm = { ...form, countryImages: newCountryImages };
    setForm(newForm);
    saveFormState(newForm);
  };

  const handleSave = async () => {
    if (!form.firstName?.trim() || !form.handle.trim()) {
      showToast("First name and handle are required", true);
      return;
    }

    setSaving(true);
    try {
      const cleanCountryImages = form.countryImages;
      const cleanCollectionImages = form.collectionImages;
      const computedMedia = new Set([
        ...cleanCountryImages.flatMap(c => c.images),
        ...cleanCollectionImages.flatMap(c => c.images)
      ]).size;

      let res: Response;
      if (editing) {
        // Only send fields that actually changed
        const patch = buildPatch(form, cleanCountryImages, cleanCollectionImages, computedMedia);
        if (Object.keys(patch).length === 0) {
          showToast("No changes to save");
          setSaving(false);
          return;
        }
        res = await fetch(`/api/profiles/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });

        // Also update explorer card badge if changed
        if (form.explorerCardShowBadge !== editing.explorerCardShowBadge) {
          try {
            await fetch(`/api/explorercard/${editing.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ show_badge: form.explorerCardShowBadge }),
            });
          } catch (e) {
            console.error("Failed to update explorer card badge", e);
          }
        }
      } else {
        // New profile — send everything
        const payload = {
          ...form,
          countryImages: cleanCountryImages,
          collectionImages: cleanCollectionImages,
          media: computedMedia,
        };
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
      window.location.href = "/profiles";
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
      fetchProfiles();
    } catch {
      showToast("Failed to delete");
    }
  };

  const startEdit = (p: Profile) => {
    setEditing(p);
    setForm({
      firstName: p.firstName || (p as any).first_name || p.name?.split(' ')[0] || "",
      lastName: p.lastName || (p as any).last_name || p.name?.split(' ').slice(1).join(' ') || "",
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
      email: p.email || "",
      isExplorerCard: p.isExplorerCard ?? (p as any).is_explorer_card ?? false,
      isFeaturedProfile: p.isFeaturedProfile ?? (p as any).is_featured_profile ?? true,
      showBadge: p.showBadge ?? (p as any).show_badge ?? false,
      explorerCardShowBadge: p.explorerCardShowBadge ?? (p as any).explorer_card_show_badge ?? false,
      isSampleProfile: p.isSampleProfile ?? (p as any).is_sample_profile ?? false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    window.location.href = "/profiles";
  };

  const selectableMediaUrls = Array.from(
    new Set([
      ...(form.countryImages || []).flatMap((c) => c.images || []),
      ...(form.collectionImages || []).flatMap((c) => c.images || []),
    ])
  );
  const canPickFromMedia = selectableMediaUrls.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-[#5A45F9] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[#b3bccf] text-sm">Loading profile data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 text-white px-5 py-3 rounded-xl text-sm font-medium shadow-lg animate-[fadeIn_0.2s_ease-out] ${toast.error ? "bg-red-500" : "bg-[#5A45F9]"}`}>
          {toast.msg}
        </div>
      )}

      {cropConfig && (
        <ProfileCropModal
          imageSrc={cropConfig.src}
          type={cropConfig.type}
          title={cropConfig.type === "cover" ? "Crop Cover Image" : "Crop Avatar"}
          initialCropData={cropConfig.type === "cover" ? form.images.coverCrop : form.images.avatarCrop}
          onSave={handleCropSave}
          onCancel={() => setCropConfig(null)}
          onReplace={() => {
            if (cropConfig.type === "cover") coverInputRef.current?.click();
            else avatarInputRef.current?.click();
          }}
          onDelete={() => {
            setForm(prev => ({ ...prev, images: { ...prev.images, [cropConfig.type]: "" } }));
            setCropConfig(null);
          }}
        />
      )}

      {/* Media Picker Modal */}
      {mediaPickerTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setMediaPickerTarget(null)}>
          <div className="bg-black-700 border border-[#1c212c] rounded-2xl p-6 max-w-3xl w-full mx-4 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Select from your media</h3>
              <button onClick={() => setMediaPickerTarget(null)} className="text-white/40 hover:text-white text-lg cursor-pointer">✕</button>
            </div>
            <p className="text-xs text-white/40 mb-3">
              {mediaPickerTarget.type === "about"
                ? `Tap photos to add them to About (${form.aboutImages.length}/4 selected).`
                : mediaPickerTarget.type === "collection"
                  ? "Tap items to add them. Images already in this collection are hidden."
                  : "Tap items to add them. Already added items are dimmed."}
            </p>
            <div className="overflow-y-auto flex-1 -mx-1">
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 px-1">
                {selectableMediaUrls
                  .filter((url) => {
                    const extractUrl = (img: any) => typeof img === "string" ? img : (img as any).url;
                    if (mediaPickerTarget.type === "collection") {
                      const currentCollection = form.collectionImages[mediaPickerTarget.idx ?? -1];
                      if (!currentCollection) return true;
                      const existingUrls = currentCollection.images.map(extractUrl);
                      return !existingUrls.includes(extractUrl(url));
                    }
                    return true;
                  })
                  .map((url, i) => {
                    const extractUrl = (img: any) => typeof img === "string" ? img : (img as any).url;

                    const existing = mediaPickerTarget.type === "country"
                      ? form.countryImages[mediaPickerTarget.idx ?? -1]?.images ?? []
                      : mediaPickerTarget.type === "collection"
                        ? form.collectionImages[mediaPickerTarget.idx ?? -1]?.images ?? []
                        : form.aboutImages;
                    const existingUrls = existing.map(extractUrl);

                    const isAlreadyAdded = existingUrls.includes(extractUrl(url));
                    const isVid = /\.(mp4|mov|webm|m4v)$/i.test(extractUrl(url));
                    const aboutLimitReached = mediaPickerTarget.type === "about" && form.aboutImages.length >= 4;
                    const videoBlockedForAbout = mediaPickerTarget.type === "about" && isVid;
                    const disabled = (!isAlreadyAdded && aboutLimitReached) || videoBlockedForAbout;

                    const getCountryForUrl = (mediaUrl: any) => {
                      const strUrl = extractUrl(mediaUrl);
                      const match = form.countryImages.find(c => c.images.map(extractUrl).includes(strUrl));
                      return match?.countryCode;
                    };
                    const countryCode = getCountryForUrl(url);

                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          if (disabled) return;
                          const { type, idx } = mediaPickerTarget;
                          if (type === "country" && typeof idx === "number") {
                            setForm((prev: any) => ({
                              ...prev,
                              countryImages: prev.countryImages.map((c: any, ci: number) =>
                                ci === idx ? { ...c, images: isAlreadyAdded ? c.images.filter((u: any) => extractUrl(u) !== extractUrl(url)) : [...c.images, url] } : c
                              ),
                            }));
                            return;
                          }

                          if (type === "collection" && typeof idx === "number") {
                            setForm((prev: any) => ({
                              ...prev,
                              collectionImages: prev.collectionImages.map((c: any, ci: number) =>
                                ci === idx ? {
                                  ...c,
                                  images: isAlreadyAdded
                                    ? c.images.filter((u: any) => extractUrl(u) !== extractUrl(url))
                                    : [...c.images, countryCode ? { url: extractUrl(url), countryCode } : extractUrl(url)]
                                } : c
                              ),
                            }));
                            return;
                          }

                          setForm((prev: any) => ({
                            ...prev,
                            aboutImages: isAlreadyAdded ? prev.aboutImages.filter((u: any) => extractUrl(u) !== extractUrl(url)) : [...prev.aboutImages, extractUrl(url)].slice(0, 4),
                          }));
                        }}
                        className={`group relative aspect-square rounded-xl overflow-hidden bg-white/5 transition-all ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:ring-2 hover:ring-[#5A45F9]"} ${isAlreadyAdded ? "ring-2 ring-warning-500" : ""}`}
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
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity z-10">
                              <span className="text-white text-[14px] drop-shadow">▶</span>
                            </div>
                          </>
                        ) : (
                          <LoadedImage src={toLandingAssetUrl(url)} thumbnailSrc={getOptimizedMediaUrl(toLandingAssetUrl(url))} alt={`Media ${i + 1}`} containerClassName="w-full h-full absolute inset-0 z-0" className="w-full h-full object-cover" />
                        )}
                        {isAlreadyAdded && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                            <span className="material-symbols-rounded text-warning-500 text-[40px] drop-shadow-md">check_circle</span>
                          </div>
                        )}
                        {countryCode && (
                          <div className="absolute top-2 right-2 z-20">
                            <img
                              src={`/flags/${countryCode.toUpperCase()}.svg`}
                              alt={countryCode}
                              className="h-3.5 w-5 rounded-sm object-cover drop-shadow-md"
                            />
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
      <header className="sticky top-0 z-40 border-b border-[#1c212c] bg-[#0a0a0a]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <a
            href="/profiles"
            className="inline-flex items-center gap-2 rounded-full border border-[#1c212c] bg-white/5 px-3 py-1.5 text-sm text-white/60 transition hover:border-white/20 hover:text-white"
          >
            <span aria-hidden>←</span>
            <span>Back</span>
          </a>
          <span className="hidden sm:block text-white/15">/</span>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-[-0.02em]">Profile Editor</h1>
            <p className="hidden md:block text-xs text-[#7e889c]">
              {editing ? "Edit existing profile details and media." : "Create a new featured profile."}
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6 xl:gap-8">
        {/* Form Panel */}
        <div className="shrink-0">
          <div className="sticky top-22 rounded-[24px] border border-[#2d2f37] bg-[#0b0d13] p-6 shadow-2xl">
            <div className="mb-6 flex flex-col gap-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#7e889c]">Editor</p>
                  <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em]">
                    {editing ? "Edit Profile" : "Add New Profile"}
                  </h2>
                </div>
                <span className="rounded-full border border-[#1c212c] bg-white/5 px-3 py-1 text-xs text-[#7e889c]">
                  Step {currentStep} of 6
                </span>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2" style={{ scrollbarWidth: 'none' }}>
                {["Basic Info", "Images", "Country & Location", "Interests & Languages", "Social Links", "Status"].map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentStep(i + 1)}
                    className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${currentStep === i + 1
                      ? "bg-[#5A45F9] text-white"
                      : "bg-[#1c212c] text-[#7e889c] hover:bg-white/5 hover:text-white"
                      }`}
                  >
                    {i + 1}. {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
              {currentStep === 2 && (
                <div className="space-y-5">

                  {/* ── Cover & Avatar Hero Section ── */}
                  <div className="rounded-2xl border border-[#1c212c] bg-[#12161f] overflow-hidden">
                    <div className="px-5 py-4 border-b border-[#1c212c] flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5A45F9]/30 to-[#8B7BFF]/10 flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B7BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-[15px] font-semibold text-white">Profile Images</h3>
                        <p className="text-xs text-white/40">Cover photo and avatar displayed on the profile</p>
                      </div>
                    </div>
                    <div className="p-5 space-y-5">
                      {/* Cover Image - Wide Preview */}
                      <div>
                        <label className="text-[13px] text-white/50 font-medium block mb-2.5 flex items-center gap-2">
                          <span>Cover Image</span>
                          {form.images.cover && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Uploaded</span>}
                        </label>
                        <div className="relative rounded-xl overflow-hidden bg-[#0a0e16] border border-[#1c212c] aspect-[16/5] group">
                          {form.images.cover ? (
                            <>
                              <LoadedImage
                                src={toLandingAssetUrl(form.images.cover)}
                                thumbnailSrc={getOptimizedMediaUrl(toLandingAssetUrl(form.images.cover))}
                                alt="Cover"
                                containerClassName="w-full h-full absolute inset-0"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                <button
                                  type="button"
                                  onClick={() => setLightbox({ items: [{ url: toLandingAssetUrl(form.images.cover), label: "Cover Image" }], index: 0 })}
                                  className="px-3 py-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white text-xs font-medium rounded-lg transition-colors border border-white/10 cursor-pointer"
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                  Preview
                                </button>
                                {/*
                                <button
                                  type="button"
                                  onClick={() => setCropConfig({ src: toLandingAssetUrl(form.images.cover), type: "cover" })}
                                  className="px-3 py-1.5 bg-[#5A45F9]/80 hover:bg-[#5A45F9] backdrop-blur-sm text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1.5"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                                  Crop
                                </button>
                                */}
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-dashed border-[#2a3040] flex items-center justify-center">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/20">
                                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                  <circle cx="8.5" cy="8.5" r="1.5" />
                                  <polyline points="21 15 16 10 5 21" />
                                </svg>
                              </div>
                              <p className="text-sm text-white/30">No cover image uploaded</p>
                            </div>
                          )}
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => coverInputRef.current?.click()}
                            disabled={uploading !== null}
                            className="flex items-center gap-2 px-4 py-2 bg-[#1c212c] hover:bg-[#252b38] text-[#d4d4d4] hover:text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                            ) : (
                              <span className="flex items-center gap-1.5">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                Upload Cover
                              </span>
                            )}
                          </button>
                          {form.images.cover && (
                            <button
                              type="button"
                              onClick={() => setForm(prev => ({ ...prev, images: { ...prev.images, cover: "" } }))}
                              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors"
                            >
                              Remove
                            </button>
                          )}
                          <span className="text-xs text-white/25 ml-2">PNG, JPG, WebP up to 20MB</span>
                          <input
                            ref={coverInputRef}
                            type="file"
                            accept="image/jpeg, image/png, image/webp, image/avif"
                            onChange={handleCoverUpload}
                            className="hidden"
                          />
                        </div>
                      </div>

                      {/* Avatar - Larger circle preview */}
                      <div className="pt-2 border-t border-[#1c212c]/60">
                        <label className="text-[13px] text-white/50 font-medium block mb-2.5 flex items-center gap-2">
                          <span>Avatar</span>
                          {form.images.avatar && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Uploaded</span>}
                        </label>
                        <div className="flex items-center gap-5">
                          <div className="relative group">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#0a0e16] border-2 border-[#1c212c] transition-all group-hover:border-[#5A45F9]/40 group-hover:shadow-[0_0_20px_rgba(90,69,249,0.15)]">
                              {form.images.avatar ? (
                                <LoadedImage
                                  src={toLandingAssetUrl(form.images.avatar)}
                                  thumbnailSrc={getOptimizedMediaUrl(toLandingAssetUrl(form.images.avatar))}
                                  alt="Avatar"
                                  containerClassName="w-full h-full absolute inset-0"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/15">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            {/* form.images.avatar && (
                              <button
                                type="button"
                                onClick={() => setCropConfig({ src: toLandingAssetUrl(form.images.avatar), type: "avatar" })}
                                className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#5A45F9] hover:bg-[#6B58FF] rounded-xl flex items-center justify-center cursor-pointer text-white shadow-lg z-10 transition-colors border-2 border-[#12161f]"
                                title="Edit"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                                </svg>
                              </button>
                            ) */}
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => avatarInputRef.current?.click()}
                                disabled={uploading !== null}
                                className="flex items-center gap-2 px-4 py-2 bg-[#1c212c] hover:bg-[#252b38] text-[#d4d4d4] hover:text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                                ) : (
                                  <span className="flex items-center gap-1.5">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                    Upload Avatar
                                  </span>
                                )}
                              </button>
                              {form.images.avatar && (
                                <button
                                  type="button"
                                  onClick={() => setForm(prev => ({ ...prev, images: { ...prev.images, avatar: "" } }))}
                                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                            <input
                              ref={avatarInputRef}
                              type="file"
                              accept="image/jpeg, image/png, image/webp, image/avif"
                              onChange={handleAvatarUpload}
                              className="hidden"
                            />
                            <p className="text-xs text-white/25">Square image recommended</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── About Photos Section ── */}
                  <div className="rounded-2xl border border-[#1c212c] bg-[#12161f] overflow-hidden">
                    <div className="px-5 py-4 border-b border-[#1c212c] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/25 to-emerald-600/10 flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-[15px] font-semibold text-white">About Photos</h3>
                          <p className="text-xs text-white/40">Displayed in the About tab</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-white/5 text-white/40 border border-[#1c212c]">{form.aboutImages.length}/4</span>
                    </div>
                    <div className="p-5">
                      {/* About images grid */}
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        {form.aboutImages.map((url, i) => (
                          <div
                            key={i}
                            className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#0a0e16] border border-[#1c212c] group hover:border-[#2a3040] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all cursor-pointer"
                            onClick={() => setLightbox({
                              items: form.aboutImages.map((u, j) => ({ url: toLandingAssetUrl(u), label: `About Photo ${j + 1}` })),
                              index: i,
                            })}
                          >
                            <LoadedImage
                              src={toLandingAssetUrl(url)}
                              thumbnailSrc={getOptimizedMediaUrl(toLandingAssetUrl(url))}
                              alt={`About ${i + 1}`}
                              containerClassName="w-full h-full absolute inset-0"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                              <span className="text-[10px] text-white/60 font-medium">Photo {i + 1}</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); removeAboutImage(i); }}
                                className="w-6 h-6 bg-red-500/20 hover:bg-red-500 rounded-lg flex items-center justify-center text-red-400 hover:text-white transition-all border border-red-500/30 hover:border-red-500 cursor-pointer"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                        {Array.from({ length: Math.max(0, 4 - form.aboutImages.length) }).map((_, i) => (
                          <div
                            key={`about-placeholder-${i}`}
                            className="aspect-[4/3] rounded-xl border-2 border-dashed border-[#1c212c] bg-[#0a0e16]/50 flex flex-col items-center justify-center gap-1.5 text-white/20 hover:border-[#2a3040] hover:text-white/30 transition-colors"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            <span className="text-[10px] font-medium">Slot {form.aboutImages.length + i + 1}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 items-center">
                        <Button
                          type="button"
                          onClick={() => aboutInputRef.current?.click()}
                          disabled={uploading !== null || form.aboutImages.length >= 4}
                          variant="ghost"
                          className="px-4 py-2 bg-[#1c212c] hover:bg-[#252b38] text-[#d4d4d4] hover:text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                              Add Media
                            </span>
                          )}
                        </Button>
                        <input
                          ref={aboutInputRef}
                          type="file"
                          accept="image/jpeg, image/png, image/webp, image/avif"
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
                            className="px-4 py-2 bg-[#5A45F9]/15 hover:bg-[#5A45F9]/25 text-[#8B7BFF] rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-[#5A45F9]/20"
                          >
                            <span className="flex items-center gap-1.5">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                              Select from media
                            </span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Country Images Section ── */}
                  <div className="rounded-2xl border border-[#1c212c] bg-[#12161f] overflow-hidden">
                    <div className="px-5 py-4 border-b border-[#1c212c] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/25 to-orange-500/10 flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-[15px] font-semibold text-white">Country Images</h3>
                          <p className="text-xs text-white/40">{form.countryImages.length} {form.countryImages.length === 1 ? 'country' : 'countries'} with media</p>
                        </div>
                      </div>
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
                    <div className="p-5 space-y-4">
                      {form.countryImages.map((ci, idx) => {
                        const country = COUNTRY_LIST.find((c) => c.code === ci.countryCode);
                        const countryImgUrls = ci.images.map((u: any) => typeof u === 'string' ? u : u.url);
                        return (
                          <div key={idx} className="rounded-xl bg-[#0a0e16] border border-[#1c212c] overflow-hidden hover:border-[#1f2735] transition-colors">
                            {/* Country header */}
                            <div className="px-4 py-3 flex items-center justify-between border-b border-[#1c212c]/60 bg-gradient-to-r from-white/[0.02] to-transparent">
                              <div className="flex items-center gap-3">
                                {country && (
                                  <img
                                    src={`/flags/${ci.countryCode}.svg`}
                                    alt={country.name}
                                    className="w-6 h-4 rounded-sm object-cover shadow-sm"
                                  />
                                )}
                                <div>
                                  <span className="text-sm text-white font-semibold">{country?.name || ci.countryCode}</span>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[11px] text-white/35">
                                      {ci.images.filter((u: any) => !(typeof u === 'string' ? u : u.url).match(/\.(mp4|mov|webm|m4v)$/i)).length} photos · {ci.images.filter((u: any) => (typeof u === 'string' ? u : u.url).match(/\.(mp4|mov|webm|m4v)$/i)).length} videos
                                    </span>
                                    {ci.updated_at && <span className="text-[11px] text-white/25">• {new Date(ci.updated_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="px-3 py-1.5 bg-[#1c212c] hover:bg-[#252b38] text-[#d4d4d4] hover:text-white rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5">
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
                                  ) : (
                                    <>
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                      Add Media
                                    </>
                                  )}
                                  <input
                                    type="file"
                                    accept="image/jpeg, image/png, image/webp, image/avif"
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
                                    className="px-3 py-1.5 bg-[#5A45F9]/15 hover:bg-[#5A45F9]/25 text-[#8B7BFF] rounded-lg text-xs font-medium border border-[#5A45F9]/20 transition-colors"
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
                                  className="p-1.5 hover:bg-red-500/20 rounded-lg text-white/30 hover:text-red-400 transition-colors cursor-pointer"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                </Button>
                              </div>
                            </div>
                            {/* Sortable image grid */}
                            <div className="p-4">
                              <SortableImageGrid
                                images={countryImgUrls}
                                coverPhoto={ci.coverPhoto}
                                onReorder={(newImages) => {
                                  setForm((prev: any) => ({
                                    ...prev,
                                    countryImages: prev.countryImages.map((c: any, i: number) =>
                                      i === idx ? { ...c, images: newImages } : c
                                    ),
                                  }));
                                }}
                                onRemove={(imgIdx) => deleteCountryMedia(idx, imgIdx)}
                                onSetCover={(url) => {
                                  setForm((prev) => ({
                                    ...prev,
                                    countryImages: prev.countryImages.map((c, i) =>
                                      i === idx ? { ...c, coverPhoto: url } : c
                                    ),
                                  }));
                                }}
                                onImageClick={(imgIdx) => {
                                  setLightbox({
                                    items: countryImgUrls.map((u, j) => ({
                                      url: toLandingAssetUrl(u),
                                      label: `${country?.name || ci.countryCode} — Photo ${j + 1}`,
                                    })),
                                    index: imgIdx,
                                  });
                                }}
                              />
                              <div className="mt-4">
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
                                  className="bg-[#080b12] border border-[#1c212c] text-white min-h-[80px] rounded-xl focus:border-[#5A45F9] transition-colors"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {/* Add country */}
                      <div className="flex gap-2 items-end pt-2">
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
                          className="px-4 py-2.5 bg-[#1c212c] hover:bg-[#252b38] text-[#d4d4d4] hover:text-white rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-1.5"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                          Add Country
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ── Collection Images Section ── */}
                  <div className="rounded-2xl border border-[#1c212c] bg-[#12161f] overflow-hidden">
                    <div className="px-5 py-4 border-b border-[#1c212c] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500/25 to-rose-500/10 flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-[15px] font-semibold text-white">Collections</h3>
                          <p className="text-xs text-white/40">{(form.collectionImages || []).length} {(form.collectionImages || []).length === 1 ? 'collection' : 'collections'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-5 space-y-4">
                      {(form.collectionImages || []).map((ci, idx) => {
                        const collImgUrls = ci.images.map((u: any) => typeof u === 'string' ? u : u.url);
                        return (
                          <div key={idx} className="rounded-xl bg-[#0a0e16] border border-[#1c212c] overflow-hidden hover:border-[#1f2735] transition-colors">
                            <div className="px-4 py-3 flex items-center justify-between border-b border-[#1c212c]/60 bg-gradient-to-r from-white/[0.02] to-transparent">
                              <div>
                                <span className="text-sm text-white font-semibold">{ci.title}</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[11px] text-white/35">
                                    {ci.images.filter((u: any) => !(typeof u === 'string' ? u : u.url).match(/\.(mp4|mov|webm|m4v)$/i)).length} photos · {ci.images.filter((u: any) => (typeof u === 'string' ? u : u.url).match(/\.(mp4|mov|webm|m4v)$/i)).length} videos
                                  </span>
                                  {ci.updated_at && <span className="text-[11px] text-white/25">• {new Date(ci.updated_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="px-3 py-1.5 bg-[#1c212c] hover:bg-[#252b38] text-[#d4d4d4] hover:text-white rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5">
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
                                  ) : (
                                    <>
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                      Add Media
                                    </>
                                  )}
                                  <input
                                    type="file"
                                    accept="image/jpeg, image/png, image/webp, image/avif"
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
                                        const newCollectionImages = form.collectionImages.map((c, i) =>
                                          i === idx ? { ...c, images: [...c.images, ...urls] } : c
                                        );
                                        const newForm = { ...form, collectionImages: newCollectionImages };
                                        setForm(newForm);
                                        saveFormState(newForm);
                                      }
                                    }}
                                  />
                                </label>
                                {canPickFromMedia && (
                                  <Button
                                    type="button"
                                    onClick={() => setMediaPickerTarget({ type: "collection", idx })}
                                    variant="ghost"
                                    className="px-3 py-1.5 bg-[#5A45F9]/15 hover:bg-[#5A45F9]/25 text-[#8B7BFF] rounded-lg text-xs font-medium border border-[#5A45F9]/20 transition-colors"
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
                                  className="p-1.5 hover:bg-red-500/20 rounded-lg text-white/30 hover:text-red-400 transition-colors cursor-pointer"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                </Button>
                              </div>
                            </div>
                            <div className="p-4">
                              <SortableImageGrid
                                images={ci.images}
                                coverPhoto={ci.coverPhoto}
                                onReorder={(newImages) => {
                                  setForm((prev: any) => ({
                                    ...prev,
                                    collectionImages: prev.collectionImages.map((c: any, i: number) =>
                                      i === idx ? { ...c, images: newImages } : c
                                    ),
                                  }));
                                }}
                                onRemove={(imgIdx) => {
                                  setForm((prev) => ({
                                    ...prev,
                                    collectionImages: prev.collectionImages.map((c, i) =>
                                      i === idx ? { ...c, images: c.images.filter((_, j) => j !== imgIdx) } : c
                                    ),
                                  }));
                                }}
                                onSetCover={(url) => {
                                  setForm((prev) => ({
                                    ...prev,
                                    collectionImages: prev.collectionImages.map((c, i) =>
                                      i === idx ? { ...c, coverPhoto: url } : c
                                    ),
                                  }));
                                }}
                                onImageClick={(imgIdx) => {
                                  setLightbox({
                                    items: collImgUrls.map((u, j) => ({
                                      url: toLandingAssetUrl(u),
                                      label: `${ci.title} — Photo ${j + 1}`,
                                    })),
                                    index: imgIdx,
                                  });
                                }}
                              />
                              <div className="mt-4 space-y-3">
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
                                  className="bg-[#080b12] border border-[#1c212c] text-white min-h-[80px] rounded-xl focus:border-[#5A45F9] transition-colors"
                                />
                                <MultiCountrySelect
                                  label="Countries for this collection"
                                  value={ci.countryCodes || []}
                                  autoSelected={Array.from(new Set(ci.images.map((img: any) => typeof img === "string" ? null : img.countryCode).filter(Boolean)))}
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
                            </div>
                          </div>
                        );
                      })}
                      {/* Add collection */}
                      <div className="flex gap-2 items-end pt-2">
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
                                    ...(prev.collectionImages || []),
                                    { title, images: [], countryCodes: [] },
                                  ],
                                }));
                                setPendingCollectionTitle("");
                              }
                            }}
                            placeholder="Collection title..."
                            className="w-full px-3 py-2.5 bg-[#080b12] border border-[#1c212c] rounded-lg text-sm text-white placeholder:text-[#6f798b] focus:outline-none focus:border-[#5A45F9] transition-colors"
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
                                ...(prev.collectionImages || []),
                                { title, images: [], countryCodes: [] },
                              ],
                            }));
                            setPendingCollectionTitle("");
                          }}
                          className="px-4 py-2.5 bg-[#1c212c] hover:bg-[#252b38] text-[#d4d4d4] hover:text-white rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-1.5"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                          Add Collection
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Lightbox */}
                  {lightbox && (
                    <Lightbox
                      items={lightbox.items}
                      currentIndex={lightbox.index}
                      onClose={() => setLightbox(null)}
                      onNavigate={(index) => setLightbox(prev => prev ? { ...prev, index } : null)}
                    />
                  )}
                </div>
              )}


              {currentStep === 1 && (
                <div className="space-y-4 rounded-2xl border border-[#1c212c] bg-[#12161f] p-5">
                  <h3 className="text-[15px] font-semibold text-white pb-3 border-b border-[#1c212c]">
                    Basic Info
                  </h3>

                  {/* Email (Optional) */}
                  <div>
                    <label className="text-[13px] text-[#b3bccf] font-medium block mb-1.5">
                      User Email <span className="text-white/30 text-xs ml-2">(Optional - creates user account if provided)</span>
                    </label>
                    <Input
                      type="email"
                      value={form.email || ""}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, email: e.target.value }))
                      }
                      placeholder="user@example.com"
                      className="bg-[#000000] border border-[#20242d] placeholder:text-[#6f798b] focus:border-[#5A45F9]"
                    />
                  </div>



                  {/* Name */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-[13px] text-[#b3bccf] font-medium block mb-1.5">
                        First Name <span className="text-red-400">*</span>
                      </label>
                      <Input
                        type="text"
                        value={form.firstName || ""}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, firstName: e.target.value }))
                        }
                        placeholder="e.g. Michael"
                        className="bg-[#000000] border border-[#20242d] placeholder:text-[#6f798b] focus:border-[#5A45F9]"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[13px] text-[#b3bccf] font-medium block mb-1.5">
                        Last Name
                      </label>
                      <Input
                        type="text"
                        value={form.lastName || ""}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, lastName: e.target.value }))
                        }
                        placeholder="e.g. Thompson"
                        className="bg-[#000000] border border-[#20242d] placeholder:text-[#6f798b] focus:border-[#5A45F9]"
                      />
                    </div>
                  </div>

                  {/* Handle */}
                  <div>
                    <label className="text-[13px] text-[#b3bccf] font-medium block mb-1.5 flex justify-between items-center">
                      <span>Handle <span className="text-red-400">*</span></span>
                      {handleStatus === 'checking' && <span className="text-white/40 text-xs">Checking...</span>}
                      {handleStatus === 'available' && <span className="text-emerald-400 text-xs">Available</span>}
                      {handleStatus === 'unavailable' && <span className="text-red-400 text-xs">Not available</span>}
                    </label>
                    <Input
                      type="text"
                      value={form.handle || ""}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, handle: e.target.value }))
                      }
                      placeholder="e.g. @micheal.th99"
                      className={`bg-[#000000] border placeholder:text-[#6f798b] focus:border-[#5A45F9] transition-colors ${handleStatus === 'unavailable'
                        ? 'border-red-500 focus:border-red-500'
                        : handleStatus === 'available'
                          ? 'border-emerald-500 focus:border-emerald-500'
                          : 'border-[#1c212c]'
                        }`}
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="text-[13px] text-[#b3bccf] font-medium block mb-1.5">
                      Bio
                    </label>
                    <Textarea
                      value={form.bio || ""}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, bio: e.target.value }))
                      }
                      placeholder="Short bio about this traveler..."
                      rows={3}
                      className="bg-[#000000] border border-[#20242d] placeholder:text-[#6f798b] focus:border-[#5A45F9] resize-none"
                    />
                  </div>

                </div>

              )}

              {currentStep === 3 && (
                <div className="space-y-4 rounded-2xl border border-[#1c212c] bg-[#12161f] p-5">
                  <h3 className="text-[15px] font-semibold text-white pb-3 border-b border-[#1c212c]">
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
                      className="bg-[#000000] border border-[#20242d] placeholder:text-[#6f798b] focus:border-[#5A45F9]"
                    />
                  </div>

                  {/* Visited Countries */}
                  <MultiCountrySelect
                    label="Visited Countries"
                    value={form.visitedCountryCodes}
                    autoSelected={Array.from(new Set(form.countryImages.map(c => c.countryCode)))}
                    onChange={(codes) =>
                      setForm((prev) => ({
                        ...prev,
                        visitedCountryCodes: codes,
                        countries: Array.from(new Set([...codes, ...form.countryImages.map(c => c.countryCode)])).length,
                      }))
                    }
                  />
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4 rounded-2xl border border-[#1c212c] bg-[#12161f] p-5">
                  <h3 className="text-[15px] font-semibold text-white pb-3 border-b border-[#1c212c]">
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

              )}

              {currentStep === 5 && (
                <div className="space-y-4 rounded-2xl border border-[#1c212c] bg-[#12161f] p-5">
                  <h3 className="text-[15px] font-semibold text-white pb-3 border-b border-[#1c212c]">
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
                        className="flex-1 bg-[#000000] border border-[#20242d] text-xs placeholder:text-[#6f798b] focus:border-[#5A45F9]"
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
                        className="flex-1 bg-[#000000] border border-[#20242d] text-xs placeholder:text-[#6f798b] focus:border-[#5A45F9]"
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
                        className="flex-1 bg-[#000000] border border-[#20242d] text-xs placeholder:text-[#6f798b] focus:border-[#5A45F9]"
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
                        className="flex-1 bg-[#000000] border border-[#20242d] text-xs placeholder:text-[#6f798b] focus:border-[#5A45F9]"
                      />
                    </div>
                  </div>
                </div>

              )}

              {currentStep === 6 && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-[#1c212c] bg-[#12161f] p-5">
                    <h3 className="text-[15px] font-semibold text-white pb-3 border-b border-[#1c212c] mb-3">
                      Founding Explorer Badge
                    </h3>
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, showBadge: !prev.showBadge }))}
                      className="w-full flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <img src="/icons/badge.svg" alt="Badge" className="w-10 h-10 shrink-0 opacity-80" />
                        <div className="text-left">
                          <p className="text-sm text-white font-medium leading-snug">Show badge on profile</p>
                          <p className="text-xs text-white/40 leading-snug mt-0.5">
                            Displays the Founding Explorer badge on the cover photo
                          </p>
                        </div>
                      </div>
                      {/* Toggle pill */}
                      <div
                        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${form.showBadge ? "bg-[#5A45F9]" : "bg-white/10"
                          }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${form.showBadge ? "translate-x-5" : "translate-x-0"
                            }`}
                        />
                      </div>
                    </button>
                  </div>

                  <div className="rounded-2xl border border-[#1c212c] bg-[#12161f] p-5">
                    <h3 className="text-[15px] font-semibold text-white pb-3 border-b border-[#1c212c] mb-3">
                      Explorer Card Badge
                    </h3>
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, explorerCardShowBadge: !prev.explorerCardShowBadge }))}
                      className="w-full flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <img src="/icons/badge.svg" alt="Badge" className="w-10 h-10 shrink-0 opacity-80" />
                        <div className="text-left">
                          <p className="text-sm text-white font-medium leading-snug">Show badge on Explorer Card</p>
                          <p className="text-xs text-white/40 leading-snug mt-0.5">
                            Displays the Founding Explorer badge on their Explorer Card
                          </p>
                        </div>
                      </div>
                      <div
                        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${form.explorerCardShowBadge ? "bg-[#5A45F9]" : "bg-white/10"
                          }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${form.explorerCardShowBadge ? "translate-x-5" : "translate-x-0"
                            }`}
                        />
                      </div>
                    </button>
                  </div>

                  {/* Explorer Card Variant */}
                  <div className="rounded-2xl border border-[#1c212c] bg-[#12161f] p-5">
                    <h3 className="text-[15px] font-semibold text-white pb-3 border-b border-[#1c212c] mb-3">
                      Explorer Card Variant
                    </h3>
                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-white font-medium leading-snug">Card Style</p>
                      <p className="text-xs text-white/40 leading-snug mb-2">
                        Select which card style should be shown on the user's profile about section.
                      </p>
                      <select
                        value={form.explorerCardVariant || "adventure"}
                        onChange={(e) => setForm({ ...form, explorerCardVariant: e.target.value as any })}
                        className="w-full bg-[#0b0d13] border border-[#1c212c] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#5A45F9] transition-colors"
                      >
                        <option value="classic">Classic</option>
                        <option value="minimal">Minimal</option>
                        <option value="adventure">Adventure</option>
                      </select>
                    </div>
                  </div>

                  {/* Sample Profile */}
                  <div className="rounded-2xl border border-[#1c212c] bg-[#12161f] p-5">
                    <h3 className="text-[15px] font-semibold text-white pb-3 border-b border-[#1c212c] mb-3">
                      Sample Profile Indicator
                    </h3>
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, isSampleProfile: !prev.isSampleProfile }))}
                      className="w-full flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-left">
                          <p className="text-sm text-white font-medium leading-snug">Mark as Sample Profile</p>
                          <p className="text-xs text-white/40 leading-snug mt-0.5">
                            Displays the "Sample Profile" tag on the cover photo
                          </p>
                        </div>
                      </div>
                      {/* Toggle pill */}
                      <div
                        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${form.isSampleProfile ? "bg-[#5A45F9]" : "bg-white/10"
                          }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${form.isSampleProfile ? "translate-x-5" : "translate-x-0"
                            }`}
                        />
                      </div>
                    </button>
                  </div>

                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 sticky bottom-0 bg-[#0b0d13] pb-2 z-10 border-t border-[#1c212c] mt-4 pt-4 justify-between">
                <div>
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(c => c - 1)}
                      className="py-2.5 px-6 bg-[#1c212c] text-[#d4d4d4] hover:text-white rounded-full text-sm font-medium transition-colors"
                    >
                      Previous
                    </button>
                  )}
                </div>
                <div className="flex gap-3">
                  {currentStep < 6 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(c => c + 1)}
                      className="py-2.5 px-6 bg-[#5A45F9] text-white hover:bg-[#5A45F9]/90 rounded-full text-sm font-medium shadow-[0_12px_30px_rgba(90,69,249,0.12)] transition-colors"
                    >
                      Next Step
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || uploading !== null}
                    className={`py-2.5 px-6 rounded-full text-sm font-semibold shadow-[0_12px_30px_rgba(255,255,255,0.08)] transition-colors ${currentStep === 6 ? "bg-[#5A45F9] text-white hover:bg-[#5A45F9]/90 shadow-[0_12px_30px_rgba(90,69,249,0.12)]" : "bg-white text-black hover:bg-white/90"} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {saving ? "Saving..." : editing ? "Update Profile" : "Add Profile"}
                  </button>
                  {editing && (
                    <Button
                      type="button"
                      onClick={cancelEdit}
                      variant="ghost"
                      className="py-2.5 px-4 bg-[#1c212c] text-[#d4d4d4] hover:text-white rounded-full text-sm font-medium"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
