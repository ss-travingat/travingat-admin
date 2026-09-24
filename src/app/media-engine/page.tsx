"use client";

import { useEffect, useState } from "react";
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg[s] ?? cfg["FAILED"]}`}>
      {status}
    </span>
  );
}

export default function MediaEngineDashboard() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/media/stats");
      if (res.ok) setStats(await res.json());
    } catch { }
    finally { setLoadingStats(false); }
  };

  const fetchJobs = async (pageNumber = 1, isPolling = false) => {
    if (!isPolling) setLoadingJobs(true);
    try {
      const res = await fetch(`/api/media/queue?page=${pageNumber}`);
      if (res.ok) {
        const data = await res.json();
        const raw = Array.isArray(data) ? data : data.results ?? [];
        const filtered = raw.filter((j: any) => j.job_type === "IMAGE_PROCESSING");
        setJobs(filtered);
        
        if (!Array.isArray(data) && data.count) {
            // Assuming default page size of DRF is used (e.g. 10 or 20), we can estimate total pages
            // If the DRF provides `count`, we can approximate.
            const pageSize = 10; // Default fallback
            setTotalPages(Math.ceil(data.count / pageSize));
        } else {
            setTotalPages(data.next ? pageNumber + 1 : pageNumber);
        }
        setHasMore(!!data.next);
      }
    } catch { }
    finally { 
      setLoadingJobs(false);
    }
  };

  const goToPage = (newPage: number) => {
    if (newPage < 1 || (newPage > totalPages && totalPages > 1)) return;
    setPage(newPage);
    fetchJobs(newPage);
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
    setTimeout(() => {
      fetchStats();
      fetchJobs(1);
    }, 0);
    const iv = setInterval(() => { fetchStats(); fetchJobs(page, true); }, 15000);
    return () => clearInterval(iv);
  }, [page]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="border-b border-white/5 bg-[#0f0f0f]">
        <div className="max-w-screen-xl mx-auto px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Media Engine</h1>
            <p className="text-white/40 text-sm mt-1">Image processing pipeline &amp; optimization dashboard.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                const res = await fetch("/api/media/scan_unoptimized", { method: "POST" });
                if (res.ok) alert("Scan queued successfully!");
                else {
                  const res2 = await fetch("/api/media/scan-unoptimized", { method: "POST" });
                  if (res2.ok) alert("Scan queued successfully!");
                  else alert("Failed to queue scan.");
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 active:bg-blue-500/30 text-blue-400 rounded-xl text-sm transition-colors border border-blue-500/20"
            >
              <span className="material-symbols-rounded text-[18px]">search</span>
              Scan Unoptimized
            </button>
            <button
              onClick={refresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/8 active:bg-white/10 disabled:opacity-50 rounded-xl text-sm text-white/70 transition-colors border border-white/8"
            >
              <span className={`material-symbols-rounded text-[18px] ${refreshing ? "animate-spin" : ""}`}>refresh</span>
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-8 py-8 space-y-8">

        {/* ── Stats Grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Assets */}
          <div className="bg-[#141414] border border-white/5 rounded-2xl p-6">
            <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">Total Assets</p>
            <p className="text-3xl font-bold">
              {loadingStats ? <span className="text-white/20 animate-pulse">—</span> : (stats?.total_media ?? 0).toLocaleString()}
            </p>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5 text-xs text-white/40">
              <span><span className="text-white/60 font-medium">{stats?.images_count ?? 0}</span> images</span>
              <span><span className="text-white/60 font-medium">{stats?.videos_count ?? 0}</span> videos</span>
            </div>
          </div>

          {/* Raw Storage */}
          <div className="bg-[#141414] border border-white/5 rounded-2xl p-6">
            <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">Raw Storage</p>
            <p className="text-3xl font-bold">
              {loadingStats ? <span className="text-white/20 animate-pulse">—</span> : formatBytes(stats?.original_size ?? 0)}
            </p>
            <p className="text-xs text-white/30 mt-4 pt-4 border-t border-white/5">Total unprocessed upload size</p>
          </div>

          {/* Optimized Size */}
          <div className="bg-[#141414] border border-white/5 rounded-2xl p-6">
            <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">Optimized Size</p>
            <p className="text-3xl font-bold">
              {loadingStats ? <span className="text-white/20 animate-pulse">—</span> : formatBytes(stats?.optimized_size ?? 0)}
            </p>
            <p className="text-xs text-white/30 mt-4 pt-4 border-t border-white/5">After WebP conversion</p>
          </div>

          {/* Savings */}
          <div className="relative bg-[#141414] border border-green-500/10 rounded-2xl p-6 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
            <p className="text-green-400/70 text-xs font-medium uppercase tracking-wider mb-3 relative z-10">Saved</p>
            <p className="text-3xl font-bold text-green-400 relative z-10">
              {loadingStats ? <span className="text-white/20 animate-pulse">—</span> : formatBytes(stats?.saved_bytes ?? 0)}
            </p>
            <p className="text-xs text-white/30 mt-4 pt-4 border-t border-white/5 relative z-10">Bytes saved via optimization</p>
          </div>
        </div>

        {/* ── Alert ──────────────────────────────────────────────── */}
        {retryMessage && (
          <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${retryMessage.includes("queued") ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
            <span className="material-symbols-rounded text-[18px]">{retryMessage.includes("queued") ? "check_circle" : "error"}</span>
            {retryMessage}
          </div>
        )}

        {/* ── Jobs List ─────────────────────────────────────────── */}
        <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div>
              <h2 className="text-lg font-semibold text-white/90">Processing Pipeline</h2>
              <p className="text-white/40 text-sm mt-1">Recent media jobs and their status.</p>
            </div>
            {!loadingJobs && (
              <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-white/50 text-xs font-medium">
                {jobs.length} jobs
              </span>
            )}
          </div>

          <div className="divide-y divide-white/[0.04]">
            {loadingJobs ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-6 flex items-center gap-6">
                  <div className="w-16 h-16 bg-white/5 rounded-xl animate-pulse shrink-0" />
                  <div className="space-y-3 flex-1">
                    <div className="h-4 bg-white/5 rounded w-1/4 animate-pulse" />
                    <div className="h-3 bg-white/5 rounded w-1/3 animate-pulse" />
                  </div>
                </div>
              ))
            ) : jobs.length === 0 ? (
              <div className="px-6 py-20 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-rounded text-3xl text-white/20">check_circle</span>
                </div>
                <h3 className="text-white/70 font-medium text-lg">No active jobs</h3>
                <p className="text-white/30 text-sm mt-1">All media has been processed successfully.</p>
              </div>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              jobs.map((job: any) => (
                <div
                  key={job.id}
                  onClick={() => router.push(`/media-engine/${job.media_id}`)}
                  className="p-6 flex flex-col sm:flex-row sm:items-center gap-6 hover:bg-white/[0.03] transition-all cursor-pointer group"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 bg-[#0f0f0f] border border-white/10 rounded-xl overflow-hidden shrink-0 relative flex items-center justify-center group-hover:border-white/20 transition-colors">
                    {job.media_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img 
                        src={job.media_url} 
                        alt={job.media_filename || "Media"} 
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <span className="material-symbols-rounded text-white/20 text-2xl">image</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-white/90 font-medium truncate text-base group-hover:text-blue-400 transition-colors">
                        {job.media_filename || "Unknown Filename"}
                      </h3>
                      <StatusBadge status={job.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mt-2">
                      <div className="flex items-center gap-1.5 text-white/40">
                        <span className="material-symbols-rounded text-[16px]">tag</span>
                        <span className="font-mono text-xs">{job.media_id.split('-')[0]}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-white/40">
                        <span className="material-symbols-rounded text-[16px]">schedule</span>
                        <span>{new Date(job.created_at).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-white/40">
                        <span className="material-symbols-rounded text-[16px]">build</span>
                        <span className="capitalize">{job.job_type.replace('_', ' ').toLowerCase()}</span>
                      </div>
                    </div>
                    
                    {job.error_message && (
                      <div className="mt-3 inline-flex items-start gap-2 bg-red-500/10 text-red-400/90 text-xs px-3 py-2 rounded-lg border border-red-500/20 max-w-full">
                        <span className="material-symbols-rounded text-[16px] shrink-0 mt-0.5">error</span>
                        <span className="break-words">{job.error_message}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex items-center justify-end sm:justify-start" onClick={(e) => e.stopPropagation()}>
                    {["FAILURE", "ERROR", "RETRYING"].includes(job.status) ? (
                      <button
                        onClick={() => retryJob(job.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 active:bg-white/15 rounded-xl text-white/80 transition-all border border-white/10 hover:border-white/20 text-sm font-medium"
                      >
                        <span className="material-symbols-rounded text-[18px]">replay</span>
                        Retry
                      </button>
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white/20 group-hover:text-white/50 group-hover:bg-white/5 transition-all">
                        <span className="material-symbols-rounded">chevron_right</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Pagination Controls */}
          <div className="p-4 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
            <div className="text-sm text-white/40">
              Page <span className="text-white/80 font-medium">{page}</span> of <span className="text-white/80 font-medium">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1 || loadingJobs}
                className="p-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-xl transition-all border border-white/10 hover:border-white/20 flex items-center justify-center text-white/70 hover:text-white"
              >
                <span className="material-symbols-rounded text-[20px]">chevron_left</span>
              </button>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={(!hasMore && page >= totalPages) || loadingJobs}
                className="p-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-xl transition-all border border-white/10 hover:border-white/20 flex items-center justify-center text-white/70 hover:text-white"
              >
                <span className="material-symbols-rounded text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
