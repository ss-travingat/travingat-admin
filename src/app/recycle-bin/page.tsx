"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type SoftDeletedItem = {
  id: string;
  email: string;
  deleted_at: string;
  [key: string]: any;
};

export default function AdminRecycleBinPage() {
  const [waitlistItems, setWaitlistItems] = useState<SoftDeletedItem[]>([]);
  const [userItems, setUserItems] = useState<SoftDeletedItem[]>([]);
  const [profileItems, setProfileItems] = useState<SoftDeletedItem[]>([]);
  const [featuredRequestItems, setFeaturedRequestItems] = useState<SoftDeletedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingID, setProcessingID] = useState("");
  const [error, setError] = useState("");
  
  const [activeTab, setActiveTab] = useState<"waitlist" | "users" | "profiles" | "featured_requests">("waitlist");
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadRecycleBin = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/recycle-bin", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load recycle bin");
        return;
      }
      setWaitlistItems(Array.isArray(data.waitlist) ? data.waitlist : []);
      setUserItems(Array.isArray(data.users) ? data.users : []);
      
      const mappedProfiles = Array.isArray(data.profiles) ? data.profiles.map((p: any) => ({
        id: p.id,
        email: p.handle || p.name,
        deleted_at: p.deleted_at || p.deletedAt,
        ...p
      })) : [];
      setProfileItems(mappedProfiles);

      const mappedFeatured = Array.isArray(data.featured_requests) ? data.featured_requests.map((p: any) => ({
        id: p.id,
        email: p.email,
        deleted_at: p.created_at,
        ...p
      })) : [];
      setFeaturedRequestItems(mappedFeatured);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(loadRecycleBin, 0);
  },[]);

  const removeFromState = (id: string, type: string) => {
    if (type === "waitlist") setWaitlistItems(prev => prev.filter(item => item.id !== id));
    if (type === "users") setUserItems(prev => prev.filter(item => item.id !== id));
    if (type === "profiles") setProfileItems(prev => prev.filter(item => item.id !== id));
    if (type === "featured_requests") setFeaturedRequestItems(prev => prev.filter(item => item.id !== id));
  };

  const onRestore = async (id: string, type: string) => {
    setProcessingID(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/recycle-bin/${type}/${id}`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to restore record");
        return;
      }
      removeFromState(id, type);
    } catch {
      setError("Failed to restore record");
    } finally {
      setProcessingID("");
    }
  };

  const onPermanentlyDelete = async (id: string, type: string, email: string) => {
    const confirmed = window.confirm(`Permanently delete record for ${email}? This action CANNOT be undone.`);
    if (!confirmed) return;

    setProcessingID(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/recycle-bin/${type}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to permanently delete record");
        return;
      }
      removeFromState(id, type);
    } catch {
      setError("Failed to permanently delete record");
    } finally {
      setProcessingID("");
    }
  };

  const currentItems = useMemo(() => {
    if (activeTab === "waitlist") return waitlistItems;
    if (activeTab === "users") return userItems;
    if (activeTab === "featured_requests") return featuredRequestItems;
    return profileItems;
  }, [activeTab, waitlistItems, userItems, profileItems, featuredRequestItems]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return currentItems;
    return currentItems.filter((u) => u.email.toLowerCase().includes(q));
  }, [currentItems, query]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const calculateDaysLeft = (deletedAt: string) => {
    const deletedDate = new Date(deletedAt);
    const deletionDate = new Date(deletedDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const msLeft = deletionDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? daysLeft : 0;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-sm z-50">
        <h1 className="text-lg font-semibold">Admin Dashboard - Recycle Bin</h1>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors">
            ← Back to admin
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-[28px] font-bold tracking-[-0.5px]">Recycle Bin</h2>
            <p className="text-white/40 text-sm mt-1">Deleted items are kept here for 30 days before being automatically purged.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/users"
              className="h-10 px-4 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 bg-[#141414] text-white/50 border border-white/10 hover:text-white hover:border-white/30 whitespace-nowrap"
            >
              Back to Users
            </Link>
            <Input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by email or handle..."
              className="max-w-[240px] bg-[#141414] border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#5A45F9]/60"
            />
          </div>
        </div>

        <div className="flex bg-[#141414] rounded-lg p-1 border border-white/10 mb-6 w-fit">
          <button 
            onClick={() => { setActiveTab('waitlist'); setCurrentPage(1); }} 
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'waitlist' ? 'bg-[#2a2a2a] text-white shadow-sm' : 'text-white/50 hover:text-white'}`}
          >
            Waitlist ({waitlistItems.length})
          </button>
          <button 
            onClick={() => { setActiveTab('users'); setCurrentPage(1); }} 
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'users' ? 'bg-[#2a2a2a] text-white shadow-sm' : 'text-white/50 hover:text-white'}`}
          >
            Main Users ({userItems.length})
          </button>
          <button 
            onClick={() => { setActiveTab('profiles'); setCurrentPage(1); }} 
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'profiles' ? 'bg-[#2a2a2a] text-white shadow-sm' : 'text-white/50 hover:text-white'}`}
          >
            Featured Profiles ({profileItems.length})
          </button>
          <button 
            onClick={() => { setActiveTab('featured_requests'); setCurrentPage(1); }} 
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'featured_requests' ? 'bg-[#2a2a2a] text-white shadow-sm' : 'text-white/50 hover:text-white'}`}
          >
            Featured Requests ({featuredRequestItems.length})
          </button>
        </div>

        {loading && <p className="text-white/50 text-sm">Loading recycle bin...</p>}
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {!loading && !error && (
          <>
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#121212]">
              <table className="w-full text-sm">
                <thead className="text-white/60 border-b border-white/10">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Email / ID</th>
                    <th className="text-left px-4 py-3 font-medium">Deleted At</th>
                    <th className="text-left px-4 py-3 font-medium">Auto-Purge In</th>
                    <th className="text-right px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((u) => {
                    const daysLeft = calculateDaysLeft(u.deleted_at);
                    return (
                      <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="px-4 py-3">
                          <p className="font-medium">{u.email}</p>
                          <p className="text-white/45 text-xs font-mono mt-0.5">ID: {u.id}</p>
                        </td>
                        <td className="px-4 py-3 text-white/70">
                          {new Date(u.deleted_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          {daysLeft > 0 ? (
                            <span className="text-yellow-400/80">{daysLeft} days</span>
                          ) : (
                            <span className="text-red-400/80">Pending Purge</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              type="button"
                              onClick={() => onRestore(u.id, activeTab)}
                              variant="ghost"
                              size="sm"
                              loading={processingID === u.id}
                              disabled={!!processingID}
                              className="px-2.5 py-1.5 rounded-md text-xs font-medium border border-green-500/40 bg-green-500/10 text-green-400 hover:bg-green-500/20 transition"
                            >
                              Restore
                            </Button>
                            <Button
                              type="button"
                              onClick={() => onPermanentlyDelete(u.id, activeTab, u.email)}
                              variant="ghost"
                              size="sm"
                              loading={processingID === u.id}
                              disabled={!!processingID}
                              className="px-2.5 py-1.5 rounded-md text-xs font-medium border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {paginatedItems.length === 0 && (
                <div className="p-10 text-sm text-white/50 text-center flex flex-col items-center">
                  <span className="material-symbols-rounded text-4xl mb-3 text-white/20">delete</span>
                  Recycle bin is empty for this category.
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-between items-center bg-[#141414] p-3 rounded-xl border border-white/10">
                <Button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  variant="ghost"
                  className="text-xs"
                >
                  Previous
                </Button>
                <span className="text-xs text-white/50">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  variant="ghost"
                  className="text-xs"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
