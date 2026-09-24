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
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/media/stats");
      if (res.ok) setStats(await res.json());
    } catch { }
    finally { setLoadingStats(false); }
  };

  const fetchJobs = async (pageNumber = 1, append = false, isPolling = false) => {
    if (!isPolling && !append) setLoadingJobs(true);
    if (append) setLoadingMore(true);
    try {
      const res = await fetch(`/api/media/queue?page=${pageNumber}`);
      if (res.ok) {
        const data = await res.json();
        const raw = Array.isArray(data) ? data : data.results ?? [];
        const filtered = raw.filter((j: any) => j.job_type === "IMAGE_PROCESSING");
        
        if (append) {
          setJobs(prev => [...prev, ...filtered]);
        } else {
          setJobs(filtered);
        }
        setHasMore(!!data.next);
      }
    } catch { }
    finally { 
      setLoadingJobs(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchJobs(nextPage, true);
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
        fetchJobs();
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
    const iv = setInterval(() => { fetchStats(); fetchJobs(1, false, true); }, 15000);
    return () => clearInterval(iv);
  }, []);

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

        {/* ── Jobs Table ─────────────────────────────────────────── */}
        <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Image Processing Jobs</h2>
              <p className="text-white/30 text-xs mt-0.5">Click a job to see the full pipeline details.</p>
            </div>
            {!loadingJobs && (
              <span className="text-white/30 text-xs font-mono">{jobs.length} jobs</span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-white/70">
              <thead className="text-white/30 text-xs uppercase tracking-wider border-b border-white/5">
                <tr>
                  <th className="px-6 py-3 font-medium">Asset ID</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Started</th>
                  <th className="px-6 py-3 font-medium">Error</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {loadingJobs ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-3 bg-white/5 rounded animate-pulse w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : jobs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-white/30">
                      <span className="material-symbols-rounded text-4xl block mb-2 opacity-30">image_not_supported</span>
                      No image processing jobs found.
                    </td>
                  </tr>
                ) : (
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  jobs.map((job: any) => (
                    <tr
                      key={job.id}
                      onClick={() => router.push(`/media-engine/${job.media_id}`)}
                      className="hover:bg-white/[0.025] transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-white/40 group-hover:text-blue-400 transition-colors">
                          {job.media_id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="px-6 py-4 text-white/40 text-xs whitespace-nowrap">
                        {new Date(job.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {job.error_message ? (
                          <span className="text-red-400 text-xs truncate max-w-xs block" title={job.error_message}>
                            {job.error_message}
                          </span>
                        ) : (
                          <span className="text-white/20 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        {["FAILURE", "ERROR", "RETRYING"].includes(job.status) && (
                          <button
                            onClick={() => retryJob(job.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 transition-colors border border-white/8 text-xs font-medium"
                          >
                            <span className="material-symbols-rounded text-[14px]">replay</span>
                            Retry
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {hasMore && (
            <div className="p-4 border-t border-white/5 flex justify-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 rounded-xl text-sm font-medium transition-colors border border-white/8 flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <span className="material-symbols-rounded animate-spin text-[16px]">refresh</span>
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
