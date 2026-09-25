"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

export default function BenchmarksDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/media/benchmarks")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center p-8 bg-zinc-950 text-zinc-100">
        <div className="text-xl font-medium text-zinc-400">Loading Benchmarks...</div>
      </div>
    );
  }

  if (!data || !data.global) {
    return (
      <div className="flex h-screen items-center justify-center p-8 bg-zinc-950 text-zinc-100">
        <div className="text-xl font-medium text-red-400">Failed to load benchmarks.</div>
      </div>
    );
  }

  const { global, recent_batches } = data;
  const savingsPct = global.original_size > 0 
    ? ((global.saved_bytes / global.original_size) * 100).toFixed(1) 
    : "0.0";
  const compressionRatio = global.optimized_size > 0 
    ? (global.original_size / global.optimized_size).toFixed(1) 
    : "0.0";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 pt-20">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Media Engine Benchmarks</h1>
            <p className="text-zinc-400">Global observability for storage compression and processing speeds.</p>
          </div>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md text-sm transition-colors">
            Refresh
          </button>
        </div>

        {/* GLOBAL STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="text-sm font-medium text-zinc-400 mb-1">Total Assets</div>
            <div className="text-3xl font-bold text-white">{global.total_assets.toLocaleString()}</div>
            <div className="text-xs text-zinc-500 mt-2">{global.total_variants.toLocaleString()} optimized variants generated</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="text-sm font-medium text-zinc-400 mb-1">Storage Used</div>
            <div className="text-3xl font-bold text-blue-400">{formatBytes(global.optimized_size)}</div>
            <div className="text-xs text-zinc-500 mt-2">vs {formatBytes(global.original_size)} raw uploaded</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="text-sm font-medium text-zinc-400 mb-1">Total Storage Saved</div>
            <div className="text-3xl font-bold text-green-400">{formatBytes(global.saved_bytes)}</div>
            <div className="text-xs text-zinc-500 mt-2">{savingsPct}% storage reduction</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="text-sm font-medium text-zinc-400 mb-1">Compression Ratio</div>
            <div className="text-3xl font-bold text-purple-400">{compressionRatio}x</div>
            <div className="text-xs text-zinc-500 mt-2">More images per gigabyte</div>
          </div>
        </div>

        {/* FORMAT ANALYTICS */}
        {global.format_breakdown && global.format_breakdown.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Upload Format Analytics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {global.format_breakdown.map((fmt: any, i: number) => (
                <div key={i} className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
                  <div className="text-sm font-medium text-zinc-400 truncate">{fmt.original_content_type}</div>
                  <div className="text-2xl font-bold text-white mt-1">{fmt.count}</div>
                  <div className="text-xs text-zinc-500 mt-1">{formatBytes(fmt.total_size)} total</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RECENT BATCHES */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-white">Recent Bulk Upload Batches</h2>
            <p className="text-sm text-zinc-400">Track processing times for bulk user uploads.</p>
          </div>
          
          {recent_batches.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">No batch uploads tracked yet. Start a new bulk upload to see benchmarks.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-950/50">
                    <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Images</th>
                    <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Batch Start</th>
                    <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Time</th>
                    <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Avg Time/Image</th>
                    <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {recent_batches.map((batch: any) => (
                    <tr key={batch.batch_id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{batch.user_handle}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">{batch.image_count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                        {batch.start_time ? new Date(batch.start_time).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-400 font-medium">
                        {batch.total_duration_seconds ? `${batch.total_duration_seconds.toFixed(2)}s` : 'Processing...'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-medium">
                        {batch.avg_per_image ? `${(batch.avg_per_image * 1000).toFixed(0)}ms` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link href={`/benchmarks/${batch.batch_id}`} className="text-blue-400 hover:text-blue-300 transition-colors">
                          View details &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
