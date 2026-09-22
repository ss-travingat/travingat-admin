"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { toLandingAssetUrl } from "@/lib/landing-assets";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";


interface Testimonial {
  id: string;
  name: string;
  location: string;
  quote: string;
  photo: string;
  socials: {
    instagram: string;
    tiktok: string;
    linkedin: string;
  };
}

const emptyForm: Omit<Testimonial, "id"> = {
  name: "",
  location: "",
  quote: "",
  photo: toLandingAssetUrl("/images/testimonial-photo-figma.png"),
  socials: { instagram: "", tiktok: "", linkedin: "" },
};

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<Omit<Testimonial, "id">>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch testimonials
  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/testimonials");
      const data = await res.json();
      setTestimonials(data);
    } catch {
      showToast("Failed to load testimonials");
    }
    setLoading(false);
  };

  useEffect(() => {
    setTimeout(fetchTestimonials, 0);
  },[]);

  // Upload photo
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      showToast("File too large. Max 20MB.");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file");
      return;
    }

    try {
      showToast("Uploading image...");

      const formData = new FormData();
      formData.append("file", file, file.name);
      formData.append("prefix", "testimonials");

      const uploadRes = await fetch("/api/upload/presign", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        let err = "Failed to upload photo";
        try {
          const data = await uploadRes.json();
          err = data.error || err;
        } catch {}
        showToast(err);
        return;
      }
      
      const { publicUrl } = await uploadRes.json();
      
      setForm((prev) => ({ ...prev, photo: toLandingAssetUrl(publicUrl) }));
      showToast("Photo uploaded");
    } catch (err) {
      console.error("Upload error:", err);
      showToast("Failed to upload photo — check console for details");
    }
  };

  // Save (create or update)
  const handleSave = async () => {
    if (!form.name.trim() || !form.quote.trim()) {
      showToast("Name and quote are required");
      return;
    }

    if (form.quote.length > 100) {
      showToast("Quote must be 100 characters or less");
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await fetch(`/api/testimonials/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        showToast("Testimonial updated");
      } else {
        await fetch("/api/testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        showToast("Testimonial added");
      }
      setForm(emptyForm);
      setEditing(null);
      await fetchTestimonials();
    } catch {
      showToast("Failed to save");
    }
    setSaving(false);
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    try {
      await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
      showToast("Testimonial deleted");
      if (editing?.id === id) {
        setEditing(null);
        setForm(emptyForm);
      }
      await fetchTestimonials();
    } catch {
      showToast("Failed to delete");
    }
  };

  // Start editing
  const startEdit = (t: Testimonial) => {
    setEditing(t);
    setForm({
      name: t.name,
      location: t.location,
      quote: t.quote,
      photo: t.photo,
      socials: { ...t.socials },
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#5A45F9] text-white px-5 py-3 rounded-xl text-sm font-medium shadow-lg animate-[fadeIn_0.2s_ease-out]">
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-sm z-50">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="text-white/50 hover:text-white text-sm transition-colors"
          >
            ← Dashboard
          </a>
          <span className="text-white/20">|</span>
          <h1 className="text-lg font-semibold">Testimonial CMS</h1>
        </div>
        <span className="text-white/40 text-sm">
          {testimonials.length} testimonial{testimonials.length !== 1 && "s"}
        </span>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col xl:flex-row gap-8">
        {/* Form Panel */}
        <div className="xl:w-105 shrink-0">
          <div className="bg-[#141414] rounded-2xl border border-white/10 p-6 sticky top-20">
            <h2 className="text-lg font-semibold mb-6">
              {editing ? "Edit Testimonial" : "Add New Testimonial"}
            </h2>

            {/* Photo */}
            <div className="mb-5">
              <label className="text-sm text-white/60 block mb-2">Photo</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-24 rounded-lg overflow-hidden bg-white/5 shrink-0 relative">
                  <Image
                    src={toLandingAssetUrl(form.photo)}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    variant="ghost"
                    className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-sm font-medium"
                  >
                    Upload Photo
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg, image/png, image/webp"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-white/30 mt-1">PNG, JPG up to 20MB</p>
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="mb-4">
              <label className="text-sm text-white/60 block mb-1.5">
                Name <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g. Sophia"
                className="bg-white/5 border border-white/10 placeholder:text-white/25 focus:border-[#5A45F9]"
              />
            </div>

            {/* Location */}
            <div className="mb-4">
              <label className="text-sm text-white/60 block mb-1.5">
                Location
              </label>
              <Input
                type="text"
                value={form.location}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, location: e.target.value }))
                }
                placeholder="e.g. USA"
                className="bg-white/5 border border-white/10 placeholder:text-white/25 focus:border-[#5A45F9]"
              />
            </div>

            {/* Quote */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm text-white/60">
                  Quote <span className="text-red-400">*</span>
                </label>
                <span className={`text-xs tabular-nums ${form.quote.length > 100 ? "text-red-400" : "text-white/30"}`}>
                  {form.quote.length}/100
                </span>
              </div>
              <Textarea
                value={form.quote}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, quote: e.target.value.slice(0, 100) }))
                }
                placeholder="What did they say about Travingat?"
                rows={4}
                maxLength={100}
                className={`bg-white/5 border placeholder:text-white/25 resize-none ${form.quote.length >= 100 ? "border-red-400/50 focus:border-red-400" : "border-white/10 focus:border-[#5A45F9]"}`}
              />
            </div>

            {/* Social Links */}
            <div className="mb-6">
              <label className="text-sm text-white/60 block mb-2">
                Social Links
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-white/30 text-xs w-16">Instagram</span>
                  <Input
                    type="url"
                    value={form.socials.instagram}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        socials: { ...prev.socials, instagram: e.target.value },
                      }))
                    }
                    placeholder="https://instagram.com/..."
                    className="flex-1 bg-white/5 border border-white/10 text-xs placeholder:text-white/25 focus:border-[#5A45F9]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/30 text-xs w-16">TikTok</span>
                  <Input
                    type="url"
                    value={form.socials.tiktok}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        socials: { ...prev.socials, tiktok: e.target.value },
                      }))
                    }
                    placeholder="https://tiktok.com/@..."
                    className="flex-1 bg-white/5 border border-white/10 text-xs placeholder:text-white/25 focus:border-[#5A45F9]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/30 text-xs w-16">LinkedIn</span>
                  <Input
                    type="url"
                    value={form.socials.linkedin}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        socials: { ...prev.socials, linkedin: e.target.value },
                      }))
                    }
                    placeholder="https://linkedin.com/in/..."
                    className="flex-1 bg-white/5 border border-white/10 text-xs placeholder:text-white/25 focus:border-[#5A45F9]"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={handleSave}
                loading={saving}
                className="flex-1 py-2.5 bg-[#5A45F9] hover:bg-[#4935e0] rounded-lg text-sm font-semibold"
              >
                {saving
                  ? "Saving..."
                  : editing
                    ? "Update Testimonial"
                    : "Add Testimonial"}
              </Button>
              {editing && (
                <Button
                  type="button"
                  onClick={cancelEdit}
                  variant="ghost"
                  className="py-2.5 px-4 bg-white/10 hover:bg-white/15 rounded-lg text-sm font-medium"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* List Panel */}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold mb-4">
            All Testimonials
          </h2>

          {loading ? (
            <div className="text-white/40 text-sm py-12 text-center">
              Loading...
            </div>
          ) : testimonials.length === 0 ? (
            <div className="bg-[#141414] rounded-2xl border border-white/10 p-12 text-center">
              <p className="text-white/40 text-sm">No testimonials yet</p>
              <p className="text-white/20 text-xs mt-1">
                Add your first one using the form
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className={`bg-[#141414] rounded-xl border p-4 flex gap-4 items-start transition-colors ${
                    editing?.id === t.id
                      ? "border-[#5A45F9]"
                      : "border-white/10"
                  }`}
                >
                  {/* Photo thumbnail */}
                  <div className="w-12 h-18 rounded-lg overflow-hidden bg-white/5 shrink-0 relative">
                    <Image
                      src={toLandingAssetUrl(t.photo)}
                      alt={t.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{t.name}</span>
                      {t.location && (
                        <span className="text-white/40 text-xs">
                          {t.location}
                        </span>
                      )}
                    </div>
                    <p className="text-white/50 text-xs leading-relaxed line-clamp-2">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    {/* Social indicators */}
                    <div className="flex items-center gap-2 mt-2">
                      {t.socials.instagram && (
                        <span className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded">
                          IG
                        </span>
                      )}
                      {t.socials.tiktok && (
                        <span className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded">
                          TT
                        </span>
                      )}
                      {t.socials.linkedin && (
                        <span className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded">
                          LI
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      type="button"
                      onClick={() => startEdit(t)}
                      variant="ghost"
                      size="sm"
                      className="p-2 hover:bg-white/10 rounded-lg text-xs text-white/60 hover:text-white"
                      title="Edit"
                    >
                      ✏️
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleDelete(t.id)}
                      variant="ghost"
                      size="sm"
                      className="p-2 hover:bg-red-500/20 rounded-lg text-xs text-white/60 hover:text-red-400"
                      title="Delete"
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
