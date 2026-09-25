"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

export default function BatchDetailsPage(props: { params: Promise<{ batchId: string }> }) {
  const params = use(props.params);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/media?upload_batch_id=${params.batchId}`)
      .then((res) => res.json())
      .then((json) => setAssets(json.results || json))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [params.batchId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center p-8 bg-zinc-950 text-zinc-100">
        <div className="text-xl font-medium text-zinc-400">Loading batch details...</div>
      </div>
    );
  }

  const completed = assets.filter(a => a.completed_at);
  const avgTime = completed.length > 0 
    ? completed.reduce((acc, a) => {
        const duration = new Date(a.completed_at).getTime() - new Date(a.created_at).getTime();
        return acc + duration;
      }, 0) / completed.length
    : 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 pt-20">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
          <div>
            <Link href="/benchmarks" className="text-sm text-blue-400 hover:text-blue-300 mb-2 inline-block">&larr; Back to Benchmarks</Link>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Batch Details</h1>
            <p className="text-zinc-400 font-mono text-sm">{params.batchId}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">{(avgTime / 1000).toFixed(2)}s</div>
            <div className="text-sm text-zinc-500">Average processing time per image</div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50">
                <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Filename</th>
                <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Processing Time</th>
                <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {assets.map((asset) => {
                let durationStr = "Pending";
                let durationColor = "text-yellow-400";
                
                if (asset.completed_at && asset.created_at) {
                  const ms = new Date(asset.completed_at).getTime() - new Date(asset.created_at).getTime();
                  durationStr = `${(ms / 1000).toFixed(2)}s`;
                  durationColor = ms > 5000 ? "text-red-400" : "text-green-400";
                }

                return (
                  <tr key={asset.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-white truncate max-w-[200px]" title={asset.original_filename}>
                      {asset.original_filename}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 rounded bg-zinc-800 text-zinc-300 text-xs">{asset.status}</span>
                    </td>
                    <td className={`px-6 py-4 text-sm font-mono ${durationColor}`}>
                      {durationStr}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {asset.original_size ? `${(asset.original_size / 1024).toFixed(1)} KB` : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {assets.length === 0 && (
             <div className="p-8 text-center text-zinc-500">No assets found for this batch.</div>
          )}
        </div>
        
      </div>
    </div>
  );
}
