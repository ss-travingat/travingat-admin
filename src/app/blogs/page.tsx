"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { toLandingAssetUrl } from "@/lib/landing-assets";
import ImageCropModal from "@/components/ImageCropModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";


interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  content: string;
  author: string;
  publishedAt: string;
  tags: string[];
  readTime: number;
}

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  coverImage: toLandingAssetUrl("/images/testimonial-photo-figma.png"),
  content: "",
  author: "Travingat Team",
  tags: [] as string[],
};

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "editor">("list");
  const editorRef = useRef<HTMLDivElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const contentImageInputRef = useRef<HTMLInputElement>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropTarget, setCropTarget] = useState<"cover" | "content">("cover");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch blogs
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/blogs");
      const data = await res.json();
      if (Array.isArray(data)) setBlogs(data);
    } catch {
      showToast("Failed to load blogs");
    }
    setLoading(false);
  };

  useEffect(() => {
    setTimeout(fetchBlogs, 0);
  },[]);

  // Sync editor content → form
  const syncContent = useCallback(() => {
    if (editorRef.current) {
      setForm((prev) => ({ ...prev, content: editorRef.current!.innerHTML }));
    }
  }, []);

  // Auto-generate slug from title
  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  // Open crop modal for cover image
  const handleCoverFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("Max 5MB");
      return;
    }
    setCropTarget("cover");
    setCropFile(file);
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  // Upload a blob to the blog upload endpoint
  const uploadBlob = async (blob: Blob, prefix: string): Promise<string | null> => {
    try {
      showToast("Uploading image...");
      const file = new File([blob], `${prefix}-${Date.now()}.jpg`, { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("file", file, file.name);
      formData.append("prefix", "blogs");

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
        return null;
      }
      
      const { publicUrl } = await uploadRes.json();
      return publicUrl;
    } catch {
      showToast("Upload failed");
    }
    return null;
  };

  // Handle cropped cover image
  const handleCroppedCover = async (blob: Blob) => {
    setCropFile(null);
    const url = await uploadBlob(blob, "cover");
    if (url) {
      setForm((prev) => ({ ...prev, coverImage: url }));
      showToast("Cover uploaded");
    }
  };

  // Open crop modal for content image
  const handleContentImageSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("Max 5MB");
      return;
    }
    setCropTarget("content");
    setCropFile(file);
    if (contentImageInputRef.current) contentImageInputRef.current.value = "";
  };

  // Handle cropped content image
  const handleCroppedContent = async (blob: Blob) => {
    setCropFile(null);
    const url = await uploadBlob(blob, "blog");
    if (url) {
      insertHtml(
        `<figure style="margin:24px 0;"><img src="${url}" alt="Blog image" style="width:100%;border-radius:8px;" /><figcaption style="text-align:center;color:#999;font-size:14px;margin-top:8px;">Image caption</figcaption></figure>`
      );
      showToast("Image inserted");
    }
  };

  // Insert YouTube embed
  const insertYouTube = () => {
    const url = prompt("Paste YouTube video URL:");
    if (!url) return;

    // Extract video ID from various YouTube URL formats
    let videoId = "";
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    ];
    for (const p of patterns) {
      const match = url.match(p);
      if (match) {
        videoId = match[1];
        break;
      }
    }
    if (!videoId) {
      showToast("Invalid YouTube URL");
      return;
    }

    insertHtml(
      `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:24px 0;border-radius:12px;"><iframe src="https://www.youtube.com/embed/${videoId}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;border-radius:12px;" allowfullscreen></iframe></div>`
    );
    showToast("YouTube video embedded");
  };

  // Insert HTML at cursor position in editor
  const insertHtml = (html: string) => {
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, html);
    syncContent();
  };

  // Toolbar exec
  const exec = (cmd: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    syncContent();
  };

  // Save
  const handleSave = async () => {
    syncContent();
    const current = {
      ...form,
      content: editorRef.current?.innerHTML || form.content,
    };

    if (!current.title.trim() || !current.content.trim()) {
      showToast("Title and content are required");
      return;
    }
    if (!current.slug) {
      current.slug = generateSlug(current.title);
    }

    setSaving(true);
    try {
      if (editing) {
        await fetch(`/api/blogs/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(current),
        });
        showToast("Blog updated");
      } else {
        await fetch("/api/blogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(current),
        });
        showToast("Blog published");
      }
      resetForm();
      setView("list");
      await fetchBlogs();
    } catch {
      showToast("Failed to save");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this blog post?")) return;
    try {
      await fetch(`/api/blogs/${id}`, { method: "DELETE" });
      showToast("Blog deleted");
      if (editing?.id === id) resetForm();
      await fetchBlogs();
    } catch {
      showToast("Failed to delete");
    }
  };

  const startEdit = (b: BlogPost) => {
    setEditing(b);
    setForm({
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt,
      coverImage: b.coverImage,
      content: b.content,
      author: b.author,
      tags: [...b.tags],
    });
    setView("editor");
    // Set editor content after render
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = b.content;
      }
    }, 50);
  };

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm);
    setTagInput("");
    if (editorRef.current) editorRef.current.innerHTML = "";
  };

  const appendUniqueTags = (nextTags: string[]) => {
    if (nextTags.length === 0) return;
    setForm((prev) => {
      const existing = new Set(prev.tags);
      const toAppend = nextTags.filter((tag) => !existing.has(tag));
      if (toAppend.length === 0) return prev;
      return { ...prev, tags: [...prev.tags, ...toAppend] };
    });
  };

  const parseTags = (value: string) =>
    value
      .split(",")
      .map((part) => part.trim().toLowerCase())
      .filter(Boolean);

  const addTag = () => {
    const tags = parseTags(tagInput);
    appendUniqueTags(tags);
    setTagInput("");
  };

  const handleTagInputChange = (value: string) => {
    if (!value.includes(",")) {
      setTagInput(value);
      return;
    }

    const pieces = value.split(",");
    const completedTags = pieces.slice(0, -1);
    const remaining = pieces[pieces.length - 1] ?? "";
    appendUniqueTags(
      completedTags
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
    );
    setTagInput(remaining.trimStart());
  };

  const handleTagInputPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = event.clipboardData.getData("text");
    if (!pastedText) return;

    if (pastedText.includes(",")) {
      event.preventDefault();
      const tags = parseTags(pastedText);
      appendUniqueTags(tags);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  // ─── RENDER ──────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Crop Modal */}
      {cropFile && (
        <ImageCropModal
          file={cropFile}
          aspectRatio={cropTarget === "cover" ? 16 / 9 : 0}
          onCrop={cropTarget === "cover" ? handleCroppedCover : handleCroppedContent}
          onCancel={() => setCropFile(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#5A45F9] text-white px-5 py-3 rounded-xl text-sm font-medium shadow-lg">
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
          <h1 className="text-lg font-semibold">Blog CMS</h1>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="text-white/40 hover:text-white text-sm transition-colors"
          >
            ← Site
          </a>
          {view === "list" ? (
            <Button
              type="button"
              onClick={() => {
                resetForm();
                setView("editor");
              }}
              className="px-4 py-2 bg-[#5A45F9] hover:bg-[#4935e0] rounded-lg text-sm font-semibold"
            >
              + New Post
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => {
                resetForm();
                setView("list");
              }}
              variant="ghost"
              className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-sm font-medium"
            >
              ← Back
            </Button>
          )}
        </div>
      </header>

      {view === "list" ? (
        /* ─── LIST VIEW ──────────────────────────────────────── */
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-lg font-semibold mb-6">
            All Posts ({blogs.length})
          </h2>
          {loading ? (
            <div className="text-white/30 text-sm py-12 text-center">
              Loading…
            </div>
          ) : blogs.length === 0 ? (
            <div className="bg-[#141414] rounded-2xl border border-white/10 p-12 text-center">
              <p className="text-white/40 text-sm">No blog posts yet</p>
              <p className="text-white/20 text-xs mt-1">
                Click &quot;+ New Post&quot; to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {blogs.map((b) => (
                <div
                  key={b.id}
                  className="bg-[#141414] rounded-xl border border-white/10 p-4 flex gap-4 items-start"
                >
                  {/* Cover thumbnail */}
                  <div className="w-20 h-14 rounded-lg overflow-hidden bg-white/5 relative shrink-0">
                    <Image
                      src={toLandingAssetUrl(b.coverImage)}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-white truncate">
                      {b.title}
                    </h3>
                    <p className="text-white/40 text-xs mt-0.5 line-clamp-1">
                      {b.excerpt}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-white/25">
                        {formatDate(b.publishedAt)}
                      </span>
                      <span className="text-[10px] text-white/25">·</span>
                      <span className="text-[10px] text-white/25">
                        {b.readTime} min
                      </span>
                      {b.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      type="button"
                      onClick={() => startEdit(b)}
                      variant="ghost"
                      size="sm"
                      className="p-2 hover:bg-white/10 rounded-lg text-xs"
                      title="Edit"
                    >
                      ✏️
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleDelete(b.id)}
                      variant="ghost"
                      size="sm"
                      className="p-2 hover:bg-red-500/20 rounded-lg text-xs"
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
      ) : (
        /* ─── EDITOR VIEW ────────────────────────────────────── */
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Meta fields row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
            {/* Title */}
            <div className="xl:col-span-2">
              <Input
                type="text"
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    title,
                    slug: generateSlug(title),
                  }));
                }}
                placeholder="Post title…"
                className="px-0 py-3 bg-transparent text-[28px] xl:text-[36px] font-bold text-white placeholder:text-white/20 tracking-[-1px]"
                style={{
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                }}
              />
            </div>

            {/* Slug */}
            <div>
              <label className="text-xs text-white/40 block mb-1">Slug</label>
              <Input
                type="text"
                value={form.slug}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, slug: e.target.value }))
                }
                placeholder="auto-generated-from-title"
                className="bg-white/5 border border-white/10 placeholder:text-white/20 focus:border-[#5A45F9]"
              />
            </div>

            {/* Author */}
            <div>
              <label className="text-xs text-white/40 block mb-1">Author</label>
              <Input
                type="text"
                value={form.author}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, author: e.target.value }))
                }
                placeholder="Author name"
                className="bg-white/5 border border-white/10 placeholder:text-white/20 focus:border-[#5A45F9]"
              />
            </div>

            {/* Excerpt */}
            <div className="xl:col-span-2">
              <label className="text-xs text-white/40 block mb-1">
                Excerpt
              </label>
              <Textarea
                value={form.excerpt}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, excerpt: e.target.value }))
                }
                placeholder="Brief description for the blog card…"
                rows={2}
                className="bg-white/5 border border-white/10 placeholder:text-white/20 focus:border-[#5A45F9] resize-none"
              />
            </div>

            {/* Cover image */}
            <div>
              <label className="text-xs text-white/40 block mb-1">
                Cover Image
              </label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-10 rounded-lg overflow-hidden bg-white/5 relative shrink-0">
                  <Image
                    src={toLandingAssetUrl(form.coverImage)}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  size="sm"
                  variant="ghost"
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-lg text-xs font-medium"
                >
                  Upload
                </Button>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/jpeg, image/png, image/webp, image/avif"
                  onChange={handleCoverFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs text-white/40 block mb-1">Tags</label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={tagInput}
                  onChange={(e) => handleTagInputChange(e.target.value)}
                  onPaste={handleTagInputPaste}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add tag…"
                  className="flex-1 bg-white/5 border border-white/10 text-xs placeholder:text-white/20 focus:border-[#5A45F9]"
                />
                <Button
                  type="button"
                  onClick={addTag}
                  size="sm"
                  variant="ghost"
                  className="px-2 py-1.5 bg-white/10 hover:bg-white/15 rounded-lg text-xs"
                >
                  +
                </Button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] bg-[#5A45F9]/20 text-[#5A45F9] px-2 py-0.5 rounded-full flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-white cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ─── WYSIWYG TOOLBAR ──────────────────────────────── */}
          <div className="sticky top-16.25 z-30 bg-[#0a0a0a] border-b border-white/10 pb-2 mb-4">
            <div className="flex flex-wrap items-center gap-1">
              {/* Text formatting */}
              <ToolbarBtn label="B" title="Bold" onClick={() => exec("bold")} bold />
              <ToolbarBtn label="I" title="Italic" onClick={() => exec("italic")} italic />
              <ToolbarBtn label="U" title="Underline" onClick={() => exec("underline")} />
              <ToolbarBtn label="S" title="Strikethrough" onClick={() => exec("strikeThrough")} strike />
              <Divider />

              {/* Headings */}
              <ToolbarBtn label="H1" title="Heading 1" onClick={() => exec("formatBlock", "h1")} />
              <ToolbarBtn label="H2" title="Heading 2" onClick={() => exec("formatBlock", "h2")} />
              <ToolbarBtn label="H3" title="Heading 3" onClick={() => exec("formatBlock", "h3")} />
              <ToolbarBtn label="¶" title="Paragraph" onClick={() => exec("formatBlock", "p")} />
              <Divider />

              {/* Lists */}
              <ToolbarBtn label="• List" title="Bullet List" onClick={() => exec("insertUnorderedList")} />
              <ToolbarBtn label="1. List" title="Numbered List" onClick={() => exec("insertOrderedList")} />
              <Divider />

              {/* Block quote */}
              <ToolbarBtn label="❝" title="Blockquote" onClick={() => exec("formatBlock", "blockquote")} />
              <ToolbarBtn label="—" title="Horizontal Rule" onClick={() => exec("insertHorizontalRule")} />
              <Divider />

              {/* Link */}
              <ToolbarBtn
                label="🔗"
                title="Insert Link"
                onClick={() => {
                  const url = prompt("URL:");
                  if (url) exec("createLink", url);
                }}
              />

              {/* Image */}
              <ToolbarBtn
                label="🖼️"
                title="Upload Image"
                onClick={() => contentImageInputRef.current?.click()}
              />
              <input
                ref={contentImageInputRef}
                type="file"
                accept="image/jpeg, image/png, image/webp, image/avif"
                onChange={handleContentImageSelect}
                className="hidden"
              />

              {/* YouTube */}
              <ToolbarBtn
                label="▶ YT"
                title="Embed YouTube Video"
                onClick={insertYouTube}
              />
              <Divider />

              {/* Clear */}
              <ToolbarBtn
                label="⌫"
                title="Remove Formatting"
                onClick={() => exec("removeFormat")}
              />
            </div>
          </div>

          {/* ─── WYSIWYG Editor ───────────────────────────────── */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={syncContent}
            onPaste={(e) => {
              e.preventDefault();
              const text = e.clipboardData.getData("text/html") || e.clipboardData.getData("text/plain");
              const tmp = document.createElement("div");
              tmp.innerHTML = text;
              tmp.querySelectorAll("*").forEach((el) => {
                (el as HTMLElement).style.color = "";
                (el as HTMLElement).style.backgroundColor = "";
              });
              const sel = window.getSelection();
              if (!sel?.rangeCount) return;
              const range = sel.getRangeAt(0);
              range.deleteContents();
              const frag = range.createContextualFragment(tmp.innerHTML);
              range.insertNode(frag);
              range.collapse(false);
              syncContent();
            }}
            className="blog-content min-h-100 px-1 py-2 focus:outline-none text-white/90"
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: "18px",
              lineHeight: "1.8",
            }}
            data-placeholder="Start writing your story…"
          />

          {/* Action bar */}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-white/10">
            <Button
              type="button"
              onClick={handleSave}
              loading={saving}
              className="px-6 py-2.5 bg-[#5A45F9] hover:bg-[#4935e0] rounded-lg text-sm font-semibold"
            >
              {saving
                ? "Saving…"
                : editing
                  ? "Update Post"
                  : "Publish Post"}
            </Button>
            <Button
              type="button"
              onClick={() => {
                resetForm();
                setView("list");
              }}
              variant="ghost"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/15 rounded-lg text-sm font-medium"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Toolbar components ──────────────────────────────────────────── */

function ToolbarBtn({
  label,
  title,
  onClick,
  bold,
  italic,
  strike,
}: {
  label: string;
  title: string;
  onClick: () => void;
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`px-2.5 py-1.5 text-xs rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer ${
        bold ? "font-bold" : ""
      } ${italic ? "italic" : ""} ${strike ? "line-through" : ""}`}
    >
      {label}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-white/10 mx-1" />;
}
