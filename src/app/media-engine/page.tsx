"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0 || !+bytes) return "0 Bytes";
  const isNegative = bytes < 0;
  const absBytes = Math.abs(bytes);
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(absBytes) / Math.log(k));
  const value = parseFloat((absBytes / Math.pow(k, i)).toFixed(dm));
  return `${isNegative ? "-" : ""}${value} ${sizes[i]}`;
}

function StatusBadge({ status }: { status: any }) {
  const s = String(status).toUpperCase();
  const cfg: Record<string, string> = {
    SUCCESS: "bg-green-500/10 text-green-400 border-green-500/20",
    COMPLETED: "bg-green-500/10 text-green-400 border-green-500/20",
    DONE: "bg-green-500/10 text-green-400 border-green-500/20",
    PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    PROCESSING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    RETRYING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    FAILURE: "bg-red-500/10 text-red-400 border-red-500/20",
    ERROR: "bg-red-500/10 text-red-400 border-red-500/20",
    FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return (
    <div className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${cfg[s] ?? cfg["FAILED"]} backdrop-blur-md`}>
      {status}
    </div>
  );
}

export default function MediaEngineDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "PROCESSING" | "FAILED">("ALL");

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/media/stats");
      if (res.ok) setStats(await res.json());
      else setRetryMessage("Failed to load stats.");
    } catch { 
      setRetryMessage("Network error loading stats.");
    } finally { setLoadingStats(false); }
  };

  const fetchJobs = async (pageNumber = 1, isPolling = false) => {
    if (!isPolling) setLoadingJobs(true);
    try {
      let url = `/api/media/queue?page=${pageNumber}&page_size=20`;
      if (activeTab === "PROCESSING") url += "&status_in=PROCESSING,PENDING,RETRYING";
      if (activeTab === "FAILED") url += "&status_in=FAILURE,ERROR";
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const raw = Array.isArray(data) ? data : data.results ?? [];
        const filtered = raw.filter((j: any) => j.job_type === "IMAGE_PROCESSING");
        setJobs(filtered);

        if (!Array.isArray(data) && data.count) {
          const pageSize = 20; 
          setTotalPages(Math.ceil(data.count / pageSize));
        } else {
          setTotalPages(data.next ? pageNumber + 1 : pageNumber);
        }
        setHasMore(!!data.next);
      } else {
        setRetryMessage("Failed to load jobs.");
      }
    } catch {
      setRetryMessage("Network error loading jobs.");
    } finally {
      setLoadingJobs(false);
    }
  };

  const goToPage = (newPage: number) => {
    if (newPage < 1 || (newPage > totalPages && totalPages > 1)) return;
    setPage(newPage);
  };

  const refresh = async () => {
    setRefreshing(true);
    setLoadingStats(true);
    setLoadingJobs(true);
    setPage(1);
    await Promise.all([fetchStats(), fetchJobs(1)]);
    setRefreshing(false);
  };

  const retryJob = async (jobId: string) => {
    try {
      setRetryMessage(null);
      const res = await fetch(`/api/media/queue/${jobId}/retry`, { method: "POST" });
      if (res.ok) {
        setRetryMessage("Job queued for retry.");
        fetchJobs(page);
      } else {
        const d = await res.json();
        setRetryMessage(d.error || "Failed to retry job.");
      }
    } catch { setRetryMessage("Network error."); }
    setTimeout(() => setRetryMessage(null), 5000);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchStats();
      fetchJobs(page);
    }, 300);
    return () => clearTimeout(timeout);
  }, [page, activeTab, searchQuery]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;
    
    const connect = () => {
      const defaultWsUrl = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}`;
      const baseUrl = process.env.NEXT_PUBLIC_WS_URL || defaultWsUrl;
      ws = new WebSocket(`${baseUrl}/ws/media-jobs/`);
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "job_update" && data.job) {
            setJobs(prevJobs => {
              const idx = prevJobs.findIndex((j: any) => j.id === data.job.id);
              if (idx >= 0) {
                const newJobs = [...prevJobs];
                newJobs[idx] = data.job;
                return newJobs;
              } else {
                return [data.job, ...prevJobs];
              }
            });
            if (["SUCCESS", "FAILURE"].includes(data.job.status)) {
               fetchStats();
            }
          }
        } catch (err) {
          console.error("WebSocket message error", err);
        }
      };

      ws.onclose = () => {
        reconnectTimer = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
    };
  }, []);

  const filteredJobs = jobs;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30">
      
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white/90">Media Engine</h1>
            <p className="text-white/40 text-sm mt-0.5">Manage and monitor your image processing pipeline.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-[18px] group-focus-within:text-blue-400 transition-colors">search</span>
              <input 
                type="text" 
                placeholder="Find image..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 focus:border-blue-500/50 focus:bg-blue-500/5 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all w-full md:w-64"
              />
            </div>
            <button
              onClick={async () => {
                try {
                  const res = await fetch("/api/media/scan-unoptimized", { method: "POST" });
                  if (res.ok) alert("Scan queued successfully!");
                  else alert("Failed to queue scan.");
                } catch { alert("Network error."); }
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-500/20 shrink-0"
            >
              <span className="material-symbols-rounded text-[18px]">document_scanner</span>
              <span className="hidden sm:inline">Scan Unoptimized</span>
            </button>
            <button
              onClick={refresh}
              disabled={refreshing}
              className="w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 active:bg-white/5 disabled:opacity-50 rounded-xl text-white/70 transition-colors border border-white/10 shrink-0"
            >
              <span className={`material-symbols-rounded text-[18px] ${refreshing ? "animate-spin" : ""}`}>refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-10">

        {/* ── Stats Grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.03] transition-colors relative overflow-hidden group">
            <div className="absolute -inset-20 bg-blue-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full pointer-events-none" />
            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">Total Assets</p>
            <p className="text-3xl font-bold tracking-tight text-white/90">
              {loadingStats ? <span className="text-white/20 animate-pulse">—</span> : (stats?.total_media ?? 0).toLocaleString()}
            </p>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5 text-xs text-white/40 font-medium">
              <span><span className="text-white/70">{stats?.images_count ?? 0}</span> imgs</span>
              <span><span className="text-white/70">{stats?.videos_count ?? 0}</span> vids</span>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.03] transition-colors">
            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">Raw Storage</p>
            <p className="text-3xl font-bold tracking-tight text-white/90">
              {loadingStats ? <span className="text-white/20 animate-pulse">—</span> : formatBytes(stats?.original_size ?? 0)}
            </p>
            <p className="text-xs text-white/40 mt-3 pt-3 border-t border-white/5 font-medium">Unprocessed size</p>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.03] transition-colors">
            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">Optimized Size</p>
            <p className="text-3xl font-bold tracking-tight text-white/90">
              {loadingStats ? <span className="text-white/20 animate-pulse">—</span> : formatBytes(stats?.optimized_size ?? 0)}
            </p>
            <p className="text-xs text-white/40 mt-3 pt-3 border-t border-white/5 font-medium">Converted size</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <span className="material-symbols-rounded text-6xl text-green-500">savings</span>
            </div>
            <p className="text-green-400/80 text-xs font-semibold uppercase tracking-wider mb-2 relative z-10">Total Savings</p>
            <p className="text-3xl font-bold tracking-tight text-green-400 relative z-10">
              {loadingStats ? <span className="text-white/20 animate-pulse">—</span> : formatBytes(stats?.saved_bytes ?? 0)}
            </p>
            <p className="text-xs text-green-400/50 mt-3 pt-3 border-t border-green-500/10 font-medium relative z-10">Optimization efficiency</p>
          </div>
        </div>

        {/* ── Alert ──────────────────────────────────────────────── */}
        {retryMessage && (
          <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-2 ${retryMessage.includes("queued") ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
            <span className="material-symbols-rounded text-[20px]">{retryMessage.includes("queued") ? "check_circle" : "error"}</span>
            {retryMessage}
          </div>
        )}

        {/* ── Jobs Grid ─────────────────────────────────────────── */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex p-1 bg-white/[0.03] border border-white/5 rounded-xl w-fit">
              {(["ALL", "PROCESSING", "FAILED"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setPage(1); }}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === tab 
                      ? "bg-white/10 text-white shadow-sm" 
                      : "text-white/40 hover:text-white/70 hover:bg-white/5"
                  }`}
                >
                  {tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {!loadingJobs && (
              <div className="text-sm font-medium text-white/40">
                Showing <span className="text-white/80">{filteredJobs.length}</span> images
              </div>
            )}
          </div>

          {loadingJobs ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-square bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="py-32 text-center flex flex-col items-center justify-center bg-white/[0.01] border border-white/5 rounded-3xl border-dashed">
              <div className="w-16 h-16 bg-white/[0.03] border border-white/5 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-rounded text-3xl text-white/20">image_not_supported</span>
              </div>
              <h3 className="text-white/80 font-semibold text-lg">No images found</h3>
              <p className="text-white/40 text-sm mt-1 max-w-sm">
                {searchQuery ? "Try adjusting your search terms to find what you're looking for." : "No jobs match this filter criteria."}
              </p>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 text-sm font-medium rounded-xl transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredJobs.map((job: any) => (
                <div
                  key={job.id}
                  onClick={() => router.push(`/media-engine/system/${job.media_id}`)}
                  className="group relative flex flex-col bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  {/* Thumbnail Container */}
                  <div className="relative aspect-square bg-[#0f0f0f] w-full overflow-hidden flex items-center justify-center">
                    {job.media_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={job.media_url}
                        alt={job.media_filename || "Media"}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <span className="material-symbols-rounded text-white/10 text-5xl">image</span>
                    )}
                    
                    {/* Status Badge overlay */}
                    <div className="absolute top-3 left-3 z-10 shadow-lg">
                      <StatusBadge status={job.status} />
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-md shadow-xl border border-white/20 transform scale-75 group-hover:scale-100 transition-all duration-300">
                        <span className="material-symbols-rounded text-[20px]">open_in_new</span>
                      </div>
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="p-4 flex flex-col gap-2 flex-1 border-t border-white/5">
                    <h3 className="text-white/90 font-medium text-sm truncate w-full" title={job.media_filename}>
                      {job.media_filename || "Unknown File"}
                    </h3>
                    
                    <div className="flex items-center justify-between text-[11px] text-white/40 font-medium mt-auto">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-rounded text-[14px]">schedule</span>
                        {new Date(job.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    
                    {job.error_message && (
                      <div className="mt-2 text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1.5 rounded bg-clip-padding truncate" title={job.error_message}>
                        {job.error_message}
                      </div>
                    )}
                  </div>
                  
                  {/* Quick Action (Retry) */}
                  {["FAILURE", "ERROR", "RETRYING"].includes(job.status) && (
                    <button
                      onClick={(e) => { e.stopPropagation(); retryJob(job.id); }}
                      className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center shadow-lg backdrop-blur-md transition-colors"
                      title="Retry processing"
                    >
                      <span className="material-symbols-rounded text-[16px]">replay</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <div className="text-sm font-medium text-white/40">
                Page <span className="text-white/80">{page}</span> of <span className="text-white/80">{totalPages}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1 || loadingJobs}
                  className="px-3 py-2 bg-white/[0.03] hover:bg-white/[0.06] disabled:opacity-30 disabled:hover:bg-white/[0.03] rounded-xl transition-colors border border-white/5 font-medium text-sm text-white/70 hover:text-white flex items-center"
                >
                  <span className="material-symbols-rounded text-[18px]">arrow_back</span>
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = page - 2 + i;
                  if (page <= 2) pageNum = i + 1;
                  else if (page >= totalPages - 1) pageNum = totalPages - 4 + i;
                  
                  if (pageNum < 1 || pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      disabled={loadingJobs}
                      className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors border text-sm font-medium ${
                        page === pageNum 
                          ? "bg-blue-600 border-blue-500 text-white" 
                          : "bg-white/[0.03] hover:bg-white/[0.06] border-white/5 text-white/70 hover:text-white"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={(!hasMore && page >= totalPages) || loadingJobs}
                  className="px-3 py-2 bg-white/[0.03] hover:bg-white/[0.06] disabled:opacity-30 disabled:hover:bg-white/[0.03] rounded-xl transition-colors border border-white/5 font-medium text-sm text-white/70 hover:text-white flex items-center"
                >
                  <span className="material-symbols-rounded text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
