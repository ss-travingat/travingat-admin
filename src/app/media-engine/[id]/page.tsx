'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, ExternalLink, Image as ImageIcon, CheckCircle2, Clock, AlertCircle, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';

function formatBytes(bytes: number | undefined, decimals = 2) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const isNegative = bytes < 0;
  const absBytes = Math.abs(bytes);
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(absBytes) / Math.log(k));
  const value = parseFloat((absBytes / Math.pow(k, i)).toFixed(dm));
  return `${isNegative ? '-' : ''}${value} ${sizes[i]}`;
}

function getProxiedImageUrl(url: string | undefined | null): string | undefined {
  return url || undefined;
}

interface MediaVariant {
  url: string;
  size?: number;
  content_type?: string;
  file_size?: number;
  width?: number;
  height?: number;
  quality?: number;
  filename?: string;
}

interface JobLog {
  stage: string;
  message: string;
  timestamp: string;
}

interface MediaJob {
  id: string;
  job_type: string;
  status: string;
  started_at: string;
  created_at: string;
  logs: JobLog[];
}

interface AssetData {
  id: string;
  status: string;
  original?: MediaVariant & { filename?: string };
  optimized?: MediaVariant;
  thumbnails?: MediaVariant[];
  jobs?: MediaJob[];
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toUpperCase();
  const map: Record<string, { cls: string; icon: React.ReactNode }> = {
    DONE: { cls: 'bg-green-500/10 text-green-400 border-green-500/20', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    SUCCESS: { cls: 'bg-green-500/10 text-green-400 border-green-500/20', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    COMPLETED: { cls: 'bg-green-500/10 text-green-400 border-green-500/20', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    PENDING: { cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: <Clock className="w-3.5 h-3.5" /> },
    PROCESSING: { cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" /> },
    RETRYING: { cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" /> },
    FAILED: { cls: 'bg-red-500/10 text-red-400 border-red-500/20', icon: <AlertCircle className="w-3.5 h-3.5" /> },
  };
  const style = map[s] ?? map['FAILED'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${style.cls}`}>
      {style.icon}
      {status}
    </span>
  );
}

export default function MediaEngineJobPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [asset, setAsset] = useState<AssetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setTimeout(() => {
      setLoading(true);
      fetch(`/api/media/${id}`, { credentials: 'include' })
        .then(r => r.json())
        .then(data => { setAsset(data); setLoading(false); })
        .catch(() => setLoading(false));
    }, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-white/60 animate-spin" />
          <p className="text-white/40 text-sm">Loading asset…</p>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <p className="text-white/60">Asset not found or failed to load.</p>
          <button onClick={() => router.push('/media-engine')} className="text-blue-400 hover:underline text-sm">← Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const originalSize = asset.original?.file_size ?? 0;
  const optimizedSize = asset.optimized?.file_size ?? 0;
  const savings = originalSize - optimizedSize;
  const savingsPct = originalSize > 0 ? ((savings / originalSize) * 100).toFixed(1) : '0';
  const isIncrease = savings < 0;

  const previewUrl = getProxiedImageUrl(asset.optimized?.url || asset.original?.url);

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white font-sans">

      {/* ── Top Header ─────────────────────────────────────────── */}
      <div className="border-b border-white/5 bg-[#111] sticky top-0 z-10 backdrop-blur">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => router.push('/media-engine')}
              className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Media Engine</span>
            </button>
            <span className="text-white/10">/</span>
            <h1 className="text-sm font-semibold text-white truncate max-w-[280px]">
              {asset.original?.filename ?? id}
            </h1>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-white/30 text-xs font-mono hidden sm:block">{asset.id}</span>
            <StatusBadge status={asset.status} />
          </div>
        </div>
      </div>

      {/* ── Quick Stats Bar ──────────────────────────────────────── */}
      <div className="border-b border-white/5 bg-[#111]/50">
        <div className="max-w-screen-xl mx-auto px-6 py-3 grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/5">
          {[
            { label: 'Original', value: formatBytes(originalSize) },
            { label: 'Optimized', value: formatBytes(optimizedSize) },
            {
              label: 'Savings',
              value: isIncrease ? `+${formatBytes(Math.abs(savings))}` : formatBytes(savings),
              highlight: isIncrease ? 'text-red-400' : 'text-green-400',
            },
            {
              label: isIncrease ? 'Size Increase' : 'Size Reduction',
              value: `${isIncrease ? '+' : '-'}${Math.abs(Number(savingsPct))}%`,
              highlight: isIncrease ? 'text-red-400' : 'text-green-400',
              icon: isIncrease ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />,
            },
          ].map(stat => (
            <div key={stat.label} className="px-6 py-2 first:pl-0">
              <p className="text-white/40 text-xs mb-1">{stat.label}</p>
              <div className={`flex items-center gap-1.5 font-semibold text-sm ${stat.highlight ?? 'text-white'}`}>
                {stat.icon}
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── Left: Preview + Thumbnails (col-span-2) ─────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Large Preview */}
            <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <span className="text-sm font-semibold text-white/60">Preview (Optimized)</span>
                {previewUrl && (
                  <a href={previewUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-white/40 hover:text-blue-400 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" /> Open
                  </a>
                )}
              </div>
              <div className="relative bg-[#0D0D0D] flex items-center justify-center min-h-[360px] p-6">
                {/* subtle checkerboard for transparency */}
                <div className="absolute inset-0 opacity-[0.04]"
                  style={{ backgroundImage: 'repeating-conic-gradient(#fff 0% 25%, transparent 0% 50%)', backgroundSize: '16px 16px' }} />
                {previewUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="relative max-w-full max-h-[480px] object-contain rounded-lg shadow-2xl"
                  />
                ) : (
                  <div className="relative flex flex-col items-center gap-3 text-white/20">
                    <ImageIcon className="w-16 h-16" />
                    <span className="text-sm">No preview available</span>
                  </div>
                )}
              </div>
            </div>

            {/* 720p Thumbnail */}
            {asset.thumbnails && asset.thumbnails.length > 0 && (() => {
              const thumb720 = asset.thumbnails.find((t: any) => t.size === 720) ?? asset.thumbnails[0];
              const thumbUrl = getProxiedImageUrl(thumb720?.url);
              return (
                <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-white/60">720p Thumbnail</span>
                      <span className="ml-2 text-xs font-mono text-white/20">{thumb720?.size}w</span>
                    </div>
                    {thumbUrl && (
                      <a href={thumbUrl} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs text-white/30 hover:text-blue-400 transition-colors">
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                    )}
                  </div>
                  <div className="relative bg-[#0D0D0D] flex items-center justify-center min-h-[240px] p-6">
                    <div className="absolute inset-0 opacity-[0.03]"
                      style={{ backgroundImage: 'repeating-conic-gradient(#fff 0% 25%, transparent 0% 50%)', backgroundSize: '16px 16px' }} />
                    {thumbUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={thumbUrl}
                        alt="720p thumbnail"
                        className="relative max-w-full max-h-[280px] object-contain rounded-lg shadow-2xl"
                      />
                    ) : (
                      <div className="relative flex flex-col items-center gap-3 text-white/20">
                        <ImageIcon className="w-10 h-10" />
                        <span className="text-xs">No thumbnail</span>
                      </div>
                    )}
                  </div>
                  {thumb720 && (
                    <div className="px-5 py-3 border-t border-white/5 flex items-center gap-4 text-xs text-white/30">
                      {thumb720.width && <span>{thumb720.width} × {thumb720.height}</span>}
                      {thumb720.file_size && <span>{formatBytes(thumb720.file_size)}</span>}
                      {thumb720.content_type && <span className="font-mono">{thumb720.content_type}</span>}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* ── Right Sidebar ─────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Original vs Optimized specs */}
            <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5">
                <span className="text-sm font-semibold text-white/60">File Details</span>
              </div>
              <div className="divide-y divide-white/5">
                {/* Original */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Original</span>
                    {asset.original?.url && (
                      <a href={getProxiedImageUrl(asset.original.url)} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-white/30 hover:text-blue-400 transition-colors">
                        <Download className="w-3 h-3" /> Download
                      </a>
                    )}
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Format', value: asset.original?.content_type },
                      { label: 'Size', value: formatBytes(originalSize) },
                      { label: 'Dimensions', value: asset.original?.width ? `${asset.original.width} × ${asset.original.height}` : '—' },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between">
                        <span className="text-white/30 text-xs">{row.label}</span>
                        <span className="text-white/70 text-xs font-mono">{row.value ?? '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optimized */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Optimized</span>
                    {asset.optimized?.url && (
                      <a href={getProxiedImageUrl(asset.optimized.url)} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-white/30 hover:text-blue-400 transition-colors">
                        <Download className="w-3 h-3" /> Download
                      </a>
                    )}
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Format', value: asset.optimized?.content_type },
                      { label: 'Size', value: asset.optimized ? formatBytes(optimizedSize) : '—' },
                      { label: 'Dimensions', value: asset.optimized?.width ? `${asset.optimized.width} × ${asset.optimized.height}` : asset.original?.width ? `${asset.original.width} × ${asset.original.height}` : '—' },
                      { label: 'Quality', value: asset.optimized ? `${asset.optimized.quality ?? 80}%` : '—' },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between">
                        <span className="text-white/30 text-xs">{row.label}</span>
                        <span className="text-white/70 text-xs font-mono">{row.value ?? '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Pipeline Stages */}
            <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5">
                <span className="text-sm font-semibold text-white/60">Pipeline Stages</span>
              </div>
              <div className="p-5 space-y-4 max-h-[600px] overflow-y-auto">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {asset.jobs?.map((job: any) => (
                  <div key={job.id} className="space-y-3">
                    {/* Job header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white/80 tracking-wide uppercase">{job.job_type.replace(/_/g, ' ')}</p>
                        <p className="text-white/30 text-xs mt-0.5">
                          {new Date(job.started_at || job.created_at).toLocaleString()}
                        </p>
                      </div>
                      <StatusBadge status={job.status} />
                    </div>

                    {/* Logs */}
                    {job.logs && job.logs.length > 0 && (
                      <div className="relative pl-4 space-y-3 before:absolute before:left-[5px] before:top-1 before:bottom-1 before:w-px before:bg-white/10">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {job.logs.map((log: any, idx: number) => (
                          <div key={idx} className="relative">
                            <div className="absolute -left-[11px] top-1.5 w-2 h-2 rounded-full bg-[#1A1A1A] ring-2 ring-white/20" />
                            <p className="text-white/80 text-xs font-semibold capitalize">{log.stage.replace(/_/g, ' ')}</p>
                            <p className="text-white/40 text-xs mt-0.5">{log.message}</p>
                            <p className="text-white/20 text-xs font-mono mt-0.5">{new Date(log.timestamp).toLocaleTimeString()}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="h-px bg-white/5" />
                  </div>
                ))}

                {(!asset.jobs || asset.jobs.length === 0) && (
                  <div className="py-8 text-center text-white/30 text-sm">No pipeline jobs found.</div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
