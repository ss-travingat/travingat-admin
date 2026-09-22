"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

type FeaturedRequest = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  country: string | null;
  visited_count: number | null;
  links: string[] | null;
  avatar_url: string | null;
  created_at: string;
  status?: string;
};

export default function FeaturedRequestsPage() {
  const [requests, setRequests] = useState<FeaturedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const [archivedIds, setArchivedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("all");

  const handleApprove = async (req: FeaturedRequest) => {
    // If not approved, approve it first
    if (!approvedIds.has(req.id)) {
      try {
        await fetch('/api/admin/featured-requests/status', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: req.email, status: 'Approved' })
        });
        setApprovedIds(prev => new Set([...prev, req.id]));
      } catch (err) {
        console.error("Failed to update status", err);
      }
    }
    
    // Redirect to profile creation page
    const searchParams = new URLSearchParams();
    searchParams.set("create", "true");
    if (req.email) searchParams.set("email", req.email);
    if (req.country) searchParams.set("country", req.country);
    if (req.id) searchParams.set("waitlistId", req.id);

    window.open(`/profiles?${searchParams.toString()}`, "_blank");
  };

  const handleDelete = async (id: string, email: string) => {
    const isCurrentlyDeleted = archivedIds.has(id);
    const newStatus = isCurrentlyDeleted ? 'Created' : 'Deleted';

    setArchivedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });

    try {
      await fetch('/api/admin/featured-requests/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, status: newStatus })
      });
      // Optionally remove from list visually if soft deleted
      if (newStatus === 'Deleted') {
        setRequests(prev => prev.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const getCountryName = (code: string) => {
    if (!code) return "Unknown Location";
    try {
      return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code;
    } catch {
      return code;
    }
  };

  useEffect(() => {
    fetch("/api/admin/featured-requests", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => {
        setRequests(data.requests || []);
        
        const initialApproved = new Set<string>();
        const initialDeleted = new Set<string>();
        
        (data.requests || []).forEach((req: FeaturedRequest) => {
          if (req.status === 'Approved') initialApproved.add(req.id);
          if (req.status === 'Deleted') initialDeleted.add(req.id);
        });
        
        setApprovedIds(initialApproved);
        setArchivedIds(initialDeleted);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const onSignOut = async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-sm z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors">
            ← Back
          </Link>
          <h1 className="text-lg font-semibold">Featured Requests</h1>
        </div>
        <Button onClick={onSignOut} variant="ghost" size="sm" className="text-sm text-white/50 hover:text-white">Sign out</Button>
      </header>

      <main className="flex-1 w-full relative">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="mb-8">
            <h2 className="text-[28px] font-bold tracking-[-0.5px]">Featured Applications</h2>
            <p className="text-white/40 text-sm mb-6">Review users who applied to be featured on the platform.</p>
            
            <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
              {['all', 'approved', 'new'].map(tab => {
                let count = 0;
                if (tab === 'approved') count = requests.filter(req => approvedIds.has(req.id) && !archivedIds.has(req.id)).length;

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 capitalize ${
                      activeTab === tab 
                        ? 'bg-white text-black' 
                        : 'bg-transparent text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{tab === 'new' ? 'New (Past 7 Days)' : tab}</span>
                    {['approved'].includes(tab) && (
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                        activeTab === tab ? 'bg-black/10 text-black/70' : 'bg-white/10 text-white/50'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <p className="text-white/50">Loading requests...</p>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : (() => {
            const filteredRequests = requests.filter(req => {
              const isApproved = approvedIds.has(req.id);
              const isDeleted = archivedIds.has(req.id);
              const isNew = new Date(req.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;

              if (activeTab === "all") return !isApproved && !isDeleted;
              if (activeTab === "approved") return isApproved && !isDeleted;
              if (activeTab === "new") return isNew && !isApproved && !isDeleted;
              return true;
            });

            if (filteredRequests.length === 0) {
              return (
                <div className="text-center py-20 border border-white/10 rounded-2xl bg-[#141414]">
                  <span className="material-symbols-rounded text-4xl text-white/20 mb-3">inbox</span>
                  <p className="text-white/50">No requests found for this filter.</p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRequests.map((req) => (
                  <div key={req.id} className="bg-[#141414] border border-white/10 rounded-3xl p-6 flex flex-col transition-all hover:border-[#5A45F9]/30 hover:shadow-[0_4px_30px_rgba(90,69,249,0.05)]">
                  {/* Top Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                      {req.avatar_url ? (
                        <img src={req.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white/40 text-lg font-medium">
                          {(req.first_name?.[0] || req.email?.[0] || "?").toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end text-right">
                      <span className="text-xs text-white/40 mb-1">From</span>
                      <div className="flex items-center gap-2 text-base font-medium text-white/90">
                        <span className={`fi fi-${(req.country || "").toLowerCase()} text-lg`} />
                        {getCountryName(req.country || "")}
                      </div>
                    </div>
                  </div>

                  {/* Name and Email */}
                  <div className="mb-4">
                    <p className="text-white/90 text-base mb-1.5 flex items-center gap-1.5">
                      {req.email} <span className="text-white/20">•</span> <span className="text-white/40 text-sm">{new Date(req.created_at).toLocaleDateString()}</span>
                    </p>
                    <h3 className="text-xl font-semibold text-white">
                      {req.first_name || req.last_name ? `${req.first_name || ''} ${req.last_name || ''}`.trim() : "Unknown Name"}
                    </h3>
                  </div>

                  {/* Bottom Area */}
                  <div className="mt-auto pt-6 border-t border-white/5 flex items-end justify-between gap-4">
                    <div className="flex flex-col gap-4">
                      {/* Socials URLs on left (Moved above) */}
                      {req.links && req.links.length > 0 && (
                        <div className="flex flex-col gap-1.5 items-start max-w-[200px]">
                          {req.links.map((link, i) => (
                            <a 
                              key={i} 
                              href={link.startsWith('http') ? link : `https://${link}`}
                              target="_blank" 
                              rel="noreferrer"
                              className="text-xs text-white/40 hover:text-white transition-colors underline truncate w-full text-left"
                            >
                              {link.replace(/^https?:\/\//, '')}
                            </a>
                          ))}
                        </div>
                      )}

                      <div>
                        <p className="text-lg font-bold text-white mb-1">{(req.visited_count || 0).toLocaleString()} <span className="text-sm font-normal text-white/50">countries</span></p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-1">
                      <button 
                        onClick={() => handleApprove(req)}
                        className={`pl-4 pr-3 h-[36px] rounded-xl text-sm font-medium transition-colors flex items-center gap-2.5 shrink-0 ${
                          approvedIds.has(req.id)
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-white text-black hover:bg-white/90"
                        }`}
                      >
                        {approvedIds.has(req.id) ? "Approved" : "Approve"}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          approvedIds.has(req.id) 
                            ? 'border-white bg-green-500' 
                            : 'border-black/20'
                        }`}>
                          {approvedIds.has(req.id) && <span className="material-symbols-rounded text-white text-[14px]">check</span>}
                        </div>
                      </button>
                      <button 
                        onClick={() => handleDelete(req.id, req.email)}
                        className={`w-[36px] h-[36px] flex items-center justify-center rounded-xl border transition-colors shrink-0 ${
                          archivedIds.has(req.id)
                            ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                            : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-red-400'
                        }`}
                        title={archivedIds.has(req.id) ? "Restore" : "Delete"}
                      >
                        <span className="material-symbols-rounded text-[18px]">
                          {archivedIds.has(req.id) ? "restore" : "delete"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            );
          })()}
        </div>
      </main>
    </div>
  );
}
