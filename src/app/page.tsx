"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
const BouncingDots = () => (
  <div className="flex items-center justify-center gap-[3px] h-[36px]">
    <div className="w-[5px] h-[5px] bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
    <div className="w-[5px] h-[5px] bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
    <div className="w-[5px] h-[5px] bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
  </div>
);

export default function AdminPage() {
  const [explorerCardCount, setExplorerCardCount] = useState<number | null>(null);
  const [featuredRequestsCount, setFeaturedRequestsCount] = useState<number | null>(null);
  const [profileCount, setProfileCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/explorer-cards-count", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => typeof d?.count === "number" && setExplorerCardCount(d.count))
      .catch(() => { });

    fetch("/api/admin/featured-requests", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => typeof d?.total === "number" && setFeaturedRequestsCount(d.total))
      .catch(() => { });

    fetch("/api/profiles")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setProfileCount(d.length))
      .catch(() => { });
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <h2 className="ds-font-display text-[36px] md:text-[46px] font-semibold tracking-[-1px] text-white mb-3">
          Content Management
        </h2>
        <p className="ds-font-body text-[#798298] text-[16px] mb-12 max-w-xl">
          Overview of platform activity, user management, and administrative tools.
        </p>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Users & Waitlist Card (Spans 2 columns on large screens) */}
          <Link
            href="/users"
            className="group ds-card lg:col-span-2 p-7 transition-all hover:border-white/20 hover:bg-[#151618] hover:shadow-[0_0_30px_rgba(255,255,255,0.03)] flex flex-col relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/50 group-hover:text-white group-hover:bg-white/10 group-hover:border-white/10 transition-all">
                <span className="material-symbols-rounded text-[24px]">group</span>
              </div>
              <div className="flex items-center gap-6 bg-[#0f1116] border border-[#20242d] rounded-xl px-5 py-3">
                <div className="text-center">
                  <div className="ds-font-display text-2xl font-semibold text-white tracking-tight flex items-center justify-center min-h-[36px]">
                    {explorerCardCount !== null ? explorerCardCount.toLocaleString() : <BouncingDots />}
                  </div>
                  <p className="ds-font-body text-[11px] font-semibold uppercase tracking-wider text-white/40 mt-1">Explorer Cards</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <div className="ds-font-display text-2xl font-semibold text-white tracking-tight flex items-center justify-center min-h-[36px]">
                    {featuredRequestsCount !== null ? featuredRequestsCount.toLocaleString() : <BouncingDots />}
                  </div>
                  <p className="ds-font-body text-[11px] font-semibold uppercase tracking-wider text-white/40 mt-1">Get featured</p>
                </div>
              </div>
            </div>

            <h3 className="ds-font-display text-[24px] font-semibold mb-2 text-white transition-colors tracking-tight">
              Users & Waitlist
            </h3>
            <p className="ds-font-body text-[#798298] text-[15px] leading-relaxed max-w-lg mb-8 flex-1">
              View waitlist signups, registered users, activity patterns, and comprehensive admin controls.
            </p>

            <div className="flex items-center justify-between mt-auto pt-5 border-t border-[#20242d] group-hover:border-white/10 transition-colors">
              <span className="ds-font-body text-white/70 group-hover:text-white text-[14px] font-medium transition-colors">
                Manage accounts
              </span>
              <span className="material-symbols-rounded text-[20px] text-white/50 group-hover:text-white transition-all transform group-hover:translate-x-1">arrow_forward</span>
            </div>
          </Link>

          {/* Profiles List */}
          <Link
            href="/admin-profiles"
            className="group ds-card p-7 transition-all hover:border-white/20 hover:bg-[#151618] hover:shadow-[0_0_30px_rgba(255,255,255,0.03)] flex flex-col h-full relative"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center mb-6 text-white/50 group-hover:text-white group-hover:bg-white/10 group-hover:border-white/10 transition-all">
              <span className="material-symbols-rounded text-[24px]">id_card</span>
            </div>
            <h3 className="ds-font-display text-[20px] font-semibold mb-2 text-white transition-colors tracking-tight">
              Profiles List
            </h3>
            <p className="ds-font-body text-[#798298] text-[14px] leading-relaxed flex-1">
              Browse and manage all traveler profiles currently active on the platform.
            </p>
            <div className="flex items-center justify-between mt-8 pt-5 border-t border-[#20242d] group-hover:border-white/10 transition-colors">
              <span className="ds-font-display text-[15px] font-semibold text-white/90">
                {profileCount !== null ? `${profileCount} Profiles` : "Loading..."}
              </span>
              <span className="material-symbols-rounded text-[18px] text-white/50 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">arrow_forward</span>
            </div>
          </Link>

          {/* Featured Profiles */}
          <Link
            href="/profiles"
            className="group ds-card p-7 transition-all hover:border-white/20 hover:bg-[#151618] hover:shadow-[0_0_30px_rgba(255,255,255,0.03)] flex flex-col h-full relative"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center mb-6 text-white/50 group-hover:text-white group-hover:bg-white/10 group-hover:border-white/10 transition-all">
              <span className="material-symbols-rounded text-[24px]">public</span>
            </div>
            <h3 className="ds-font-display text-[20px] font-semibold mb-2 text-white transition-colors tracking-tight">
              Featured Profiles
            </h3>
            <p className="ds-font-body text-[#798298] text-[14px] leading-relaxed flex-1">
              Curate and highlight top traveler profiles. Control images, links, and featured status.
            </p>
            <div className="flex items-center justify-between mt-8 pt-5 border-t border-[#20242d] group-hover:border-white/10 transition-colors">
              <span className="ds-font-body text-white/70 group-hover:text-white text-[13px] font-medium transition-colors">
                Manage featured
              </span>
              <span className="material-symbols-rounded text-[18px] text-white/50 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">arrow_forward</span>
            </div>
          </Link>

          {/* Featured Requests */}
          <Link
            href="/featured-requests"
            className="group ds-card p-7 transition-all hover:border-white/20 hover:bg-[#151618] hover:shadow-[0_0_30px_rgba(255,255,255,0.03)] flex flex-col h-full relative"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center mb-6 text-white/50 group-hover:text-white group-hover:bg-white/10 group-hover:border-white/10 transition-all">
              <span className="material-symbols-rounded text-[24px]">mark_email_unread</span>
            </div>
            <h3 className="ds-font-display text-[20px] font-semibold mb-2 text-white transition-colors tracking-tight">
              Featured Requests
            </h3>
            <p className="ds-font-body text-[#798298] text-[14px] leading-relaxed flex-1">
              Review applications from users requesting to be featured on the platform.
            </p>
            <div className="flex items-center justify-between mt-8 pt-5 border-t border-[#20242d] group-hover:border-white/10 transition-colors">
              <span className="ds-font-body text-white/70 group-hover:text-white text-[13px] font-medium transition-colors">
                Review queue
              </span>
              <span className="material-symbols-rounded text-[18px] text-white/50 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">arrow_forward</span>
            </div>
          </Link>

          {/* Design System */}
          <Link
            href="https://app.travingat.com/designsystem"
            className="group ds-card p-7 transition-all hover:border-white/20 hover:bg-[#151618] hover:shadow-[0_0_30px_rgba(255,255,255,0.03)] flex flex-col h-full relative"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center mb-6 text-white/50 group-hover:text-white group-hover:bg-white/10 group-hover:border-white/10 transition-all">
              <span className="material-symbols-rounded text-[24px]">palette</span>
            </div>
            <h3 className="ds-font-display text-[20px] font-semibold mb-2 text-white transition-colors tracking-tight">
              Design System
            </h3>
            <p className="ds-font-body text-[#798298] text-[14px] leading-relaxed flex-1">
              Browse the visual foundations, color palettes, typography, and core components.
            </p>
            <div className="flex items-center justify-between mt-8 pt-5 border-t border-[#20242d] group-hover:border-white/10 transition-colors">
              <span className="ds-font-body text-white/70 group-hover:text-white text-[13px] font-medium transition-colors">
                View components
              </span>
              <span className="material-symbols-rounded text-[18px] text-white/50 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">arrow_forward</span>
            </div>
          </Link>

          {/* Media Engine */}
          <Link
            href="/media-engine"
            className="group ds-card p-7 transition-all hover:border-white/20 hover:bg-[#151618] hover:shadow-[0_0_30px_rgba(255,255,255,0.03)] flex flex-col h-full relative"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center mb-6 text-white/50 group-hover:text-white group-hover:bg-white/10 group-hover:border-white/10 transition-all">
              <span className="material-symbols-rounded text-[24px]">cloud_done</span>
            </div>
            <h3 className="ds-font-display text-[20px] font-semibold mb-2 text-white transition-colors tracking-tight">
              Media Engine
            </h3>
            <p className="ds-font-body text-[#798298] text-[14px] leading-relaxed flex-1">
              Monitor storage statistics, track image/video processing, and manage failed media jobs.
            </p>
            <div className="flex items-center justify-between mt-8 pt-5 border-t border-[#20242d] group-hover:border-white/10 transition-colors">
              <span className="ds-font-body text-white/70 group-hover:text-white text-[13px] font-medium transition-colors">
                View metrics
              </span>
              <span className="material-symbols-rounded text-[18px] text-white/50 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">arrow_forward</span>
            </div>
          </Link>

          {/* Recycle Bin */}
          <Link
            href="/recycle-bin"
            className="group ds-card p-7 transition-all hover:border-red-500/50 hover:bg-[#1a1111] hover:shadow-[0_0_30px_rgba(239,68,68,0.08)] flex flex-col h-full relative"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center mb-6 text-white/50 group-hover:text-red-500 group-hover:bg-red-500/10 group-hover:border-red-500/20 transition-all">
              <span className="material-symbols-rounded text-[24px]">delete</span>
            </div>
            <h3 className="ds-font-display text-[20px] font-semibold mb-2 text-white transition-colors tracking-tight">
              Recycle Bin
            </h3>
            <p className="ds-font-body text-[#798298] text-[14px] leading-relaxed flex-1">
              Recover or permanently purge soft-deleted records. Items are kept for 30 days.
            </p>
            <div className="flex items-center justify-between mt-8 pt-5 border-t border-[#20242d] group-hover:border-red-500/20 transition-colors">
              <span className="ds-font-body text-white/70 group-hover:text-red-500 text-[13px] font-medium transition-colors">
                Manage deletions
              </span>
              <span className="material-symbols-rounded text-[18px] text-red-500 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">arrow_forward</span>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}
