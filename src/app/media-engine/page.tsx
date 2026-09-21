"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function MediaEngineDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/media/stats/");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch media stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/media/jobs/");
      if (res.ok) {
        const data = await res.json();
        if (data.results) {
          setJobs(data.results);
        } else if (Array.isArray(data)) {
          setJobs(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch media jobs:", err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const retryJob = async (jobId: string) => {
    try {
      setRetryMessage(null);
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + `/media/jobs/${jobId}/retry/`, {
        method: "POST",
      });
      if (res.ok) {
        setRetryMessage("Job queued for retry successfully!");
        fetchJobs();
      } else {
        const data = await res.json();
        setRetryMessage(data.error || "Failed to retry job");
      }
    } catch (err) {
      setRetryMessage("Network error when retrying job");
    }
    setTimeout(() => setRetryMessage(null), 5000);
  };

  useEffect(() => {
    fetchStats();
    fetchJobs();

    const interval = setInterval(() => {
      fetchStats();
      fetchJobs();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="ds-font-display text-4xl font-semibold tracking-tight text-white mb-2">
              Media Engine
            </h1>
            <p className="text-white/50 ds-font-body">
              Monitor storage processing and failed media jobs.
            </p>
          </div>
          <button
            onClick={() => {
              setLoadingStats(true);
              setLoadingJobs(true);
              fetchStats();
              fetchJobs();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-colors border border-white/10"
          >
            <span className="material-symbols-rounded text-[18px]">refresh</span>
            Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Media */}
          <div className="bg-[#151618] border border-[#20242d] rounded-2xl p-6">
            <div className="text-white/40 mb-2 flex items-center gap-2">
              <span className="material-symbols-rounded text-[20px]">collections</span>
              <h3 className="ds-font-body text-sm font-medium uppercase tracking-wider">Total Media</h3>
            </div>
            <div className="ds-font-display text-3xl font-semibold text-white">
              {loadingStats ? "..." : (stats?.total_media || 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5 text-sm">
              <div className="flex items-center gap-1.5 text-white/60">
                <span className="material-symbols-rounded text-[16px]">image</span>
                {stats?.images_count || 0} Images
              </div>
              <div className="flex items-center gap-1.5 text-white/60">
                <span className="material-symbols-rounded text-[16px]">videocam</span>
                {stats?.videos_count || 0} Videos
              </div>
            </div>
          </div>

          {/* Original Size */}
          <div className="bg-[#151618] border border-[#20242d] rounded-2xl p-6">
            <div className="text-white/40 mb-2 flex items-center gap-2">
              <span className="material-symbols-rounded text-[20px]">folder_open</span>
              <h3 className="ds-font-body text-sm font-medium uppercase tracking-wider">Raw Storage</h3>
            </div>
            <div className="ds-font-display text-3xl font-semibold text-white">
              {loadingStats ? "..." : formatBytes(stats?.original_size || 0)}
            </div>
          </div>

          {/* Savings */}
          <div className="bg-[#151618] border border-[#20242d] rounded-2xl p-6 lg:col-span-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <span className="material-symbols-rounded text-[120px]">eco</span>
            </div>
            <div className="text-white/40 mb-2 flex items-center gap-2 relative z-10">
              <span className="material-symbols-rounded text-[20px] text-green-500/80">savings</span>
              <h3 className="ds-font-body text-sm font-medium uppercase tracking-wider text-green-500/80">Optimization Savings</h3>
            </div>
            <div className="ds-font-display text-3xl font-semibold text-white relative z-10">
              {loadingStats ? "..." : formatBytes(stats?.saved_bytes || 0)}
            </div>
            <p className="text-sm text-white/40 mt-2 relative z-10">
              Bytes saved compared to raw unoptimized uploads.
            </p>
          </div>
        </div>

        {/* Alerts */}
        {retryMessage && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${retryMessage.includes('successfully') ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
            <span className="material-symbols-rounded">
              {retryMessage.includes('successfully') ? 'check_circle' : 'error'}
            </span>
            <p className="text-sm font-medium">{retryMessage}</p>
          </div>
        )}

        {/* Jobs Table */}
        <div className="bg-[#151618] border border-[#20242d] rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-[#20242d] bg-[#1a1b1f]">
            <h2 className="ds-font-display text-xl font-semibold text-white">Media Jobs</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm ds-font-body text-white/70">
              <thead className="bg-white/[0.02] text-white/40 uppercase tracking-wider text-xs border-b border-[#20242d]">
                <tr>
                  <th className="px-6 py-4 font-medium">Job ID</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Created At</th>
                  <th className="px-6 py-4 font-medium">Error Message</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#20242d]">
                {loadingJobs ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-white/30">
                      Loading jobs...
                    </td>
                  </tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-white/30">
                      No jobs found in the system.
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-white/50">{job.id}</td>
                      <td className="px-6 py-4 text-white/90">{job.job_type.replace(/_/g, ' ')}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${job.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                          job.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                            job.status === 'PROCESSING' || job.status === 'RETRYING' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                              'bg-red-500/10 text-red-500 border-red-500/20'
                          }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/50 whitespace-nowrap">
                        {new Date(job.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {job.error_message ? (
                          <div className="max-w-xs truncate text-red-400" title={job.error_message}>
                            {job.error_message}
                          </div>
                        ) : (
                          <span className="text-white/20">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {['FAILURE', 'ERROR', 'RETRYING'].includes(job.status) && (
                          <button
                            onClick={() => retryJob(job.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-md text-white/80 transition-colors border border-white/10 text-xs font-medium"
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
        </div>
      </div>
    </div>
  );
}
