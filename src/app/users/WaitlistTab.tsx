"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const BouncingDots = () => (
  <div className="flex items-center gap-[3px] h-[40px]">
    <div className="w-[5px] h-[5px] bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
    <div className="w-[5px] h-[5px] bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
    <div className="w-[5px] h-[5px] bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
  </div>
);

type WaitlistEntry = {
  id: number;
  email: string;
  browser: string;
  device: string;
  country: string;
  city: string;
  ip: string;
  confirmed: boolean;
  confirmed_at: string | null;
  created_at: string;
  source: string;
  explorer_card_status: string;
  get_featured_status: string;
  countries_count: number | null;
  card_style: string | null;
  user_uuid?: string;
};

type Filter = "all" | "confirmed" | "unconfirmed";

export function WaitlistTab() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [unconfirmedCount, setUnconfirmedCount] = useState(0);
  const [explorerCardCount, setExplorerCardCount] = useState(0);
  const [getFeaturedCount, setGetFeaturedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [detailsModalEntry, setDetailsModalEntry] = useState<WaitlistEntry | null>(null);
  const [resendEntry, setResendEntry] = useState<WaitlistEntry | null>(null);
  const [resendType, setResendType] = useState<'waitlist' | 'explorer' | 'profile' | null>(null);
  const [resendLoading, setResendLoading] = useState(false);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    source: "",
    explorer_card_status: "",
    get_featured_status: "",
    device: "",
    browser: "",
    country: ""
  });

  const uniqueSources = Array.from(new Set(entries.map((e) => e.source || "Waitlist")));
  const uniqueCountries = Array.from(new Set(entries.map((e) => e.country))).filter(Boolean);

  const activeFiltersCount = Object.values(advancedFilters).filter(v => v !== "").length;

  useEffect(() => {
    fetch("/api/waitlist", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setEntries(data.entries ?? []);
        setTotal(data.total ?? 0);
        setConfirmedCount(data.confirmed ?? 0);
        setUnconfirmedCount(data.unconfirmed ?? 0);
        setExplorerCardCount(data.explorerCardCount ?? 0);
        setGetFeaturedCount(data.getFeaturedCount ?? 0);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const filtered = entries.filter((e) => {
    const matchesSearch =
      !search ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.country?.toLowerCase().includes(search.toLowerCase()) ||
      e.city?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "confirmed" && e.confirmed) ||
      (filter === "unconfirmed" && !e.confirmed);

    const matchesAdvanced =
      (!advancedFilters.source || (e.source || "Waitlist") === advancedFilters.source) &&
      (!advancedFilters.explorer_card_status ||
        (advancedFilters.explorer_card_status === 'Created' && e.explorer_card_status === 'Created') ||
        (advancedFilters.explorer_card_status === 'Not created' && e.explorer_card_status !== 'Created')) &&
      (!advancedFilters.get_featured_status ||
        (advancedFilters.get_featured_status === 'Created' && e.get_featured_status === 'Created') ||
        (advancedFilters.get_featured_status === 'Not created' && e.get_featured_status !== 'Created')) &&
      (!advancedFilters.device || e.device === advancedFilters.device) &&
      (!advancedFilters.browser || e.browser === advancedFilters.browser) &&
      (!advancedFilters.country || e.country === advancedFilters.country);

    return matchesSearch && matchesFilter && matchesAdvanced;
  });

  const deviceIcon = (device: string) => {
    switch (device) {
      case "mobile":
        return "smartphone";
      case "tablet":
        return "tablet_mac";
      default:
        return "desktop_windows";
    }
  };

  return (
    <div className="flex-1 w-full relative">

      <div className="max-w-5xl mx-auto px-6 py-4">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-5">
          <div className="bg-[#141414] border border-white/10 rounded-xl p-4">
            <div className="text-[28px] font-bold text-white flex items-center min-h-[40px]">
              {loading ? <BouncingDots /> : total}
            </div>
            <p className="text-xs text-white/40 mt-1">Total signups</p>
          </div>
          <div className="bg-[#141414] border border-[#163d22]/60 rounded-xl p-4">
            <div className="text-[28px] font-bold text-[#4ade80] flex items-center min-h-[40px]">
              {loading ? <BouncingDots /> : confirmedCount}
            </div>
            <p className="text-xs text-white/40 mt-1">Confirmed</p>
          </div>
          <div className="bg-[#141414] border border-[#3d2e0e]/60 rounded-xl p-4">
            <div className="text-[28px] font-bold text-[#fbbf24] flex items-center min-h-[40px]">
              {loading ? <BouncingDots /> : unconfirmedCount}
            </div>
            <p className="text-xs text-white/40 mt-1">Not confirmed</p>
          </div>
          <div className="bg-[#141414] border border-white/10 rounded-xl p-4">
            <div className="text-[28px] font-bold text-white flex items-center min-h-[40px]">
              {loading ? <BouncingDots /> : `${total > 0 ? Math.round((confirmedCount / total) * 100) : 0}%`}
            </div>
            <p className="text-xs text-white/40 mt-1">Confirm rate</p>
          </div>
          <div className="bg-[#141414] border border-[#163d22]/60 rounded-xl p-4">
            <div className="text-[28px] font-bold text-[#4ade80] flex items-center min-h-[40px]">
              {loading ? <BouncingDots /> : explorerCardCount}
            </div>
            <p className="text-xs text-white/40 mt-1">Explorer card</p>
          </div>
          <div className="bg-[#141414] border border-[#163d22]/60 rounded-xl p-4">
            <div className="text-[28px] font-bold text-[#4ade80] flex items-center min-h-[40px]">
              {loading ? <BouncingDots /> : getFeaturedCount}
            </div>
            <p className="text-xs text-white/40 mt-1">Get featured</p>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="relative w-full sm:max-w-md">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              type="text"
              placeholder="Search by email, country, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 h-10 bg-[#151618] border border-white/10 rounded-xl text-[13px] placeholder:text-white/30 focus:border-white/30 focus:bg-[#1a1b1e] transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
            <div className="flex items-center bg-[#151618] p-1 rounded-xl border border-white/10">
              {(["all", "confirmed", "unconfirmed"] as Filter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all capitalize whitespace-nowrap ${filter === f
                    ? "bg-white text-black shadow-sm"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-white/10 mx-1" />

            <button
              onClick={() => setIsFilterModalOpen(true)}
              className={`h-10 px-3.5 rounded-xl text-[13px] font-medium transition-all flex items-center gap-2 shrink-0 ${activeFiltersCount > 0
                ? "bg-white/10 text-white border border-white/20 hover:bg-white/15"
                : "bg-[#151618] text-white/60 border border-white/10 hover:text-white hover:border-white/20"
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
              Filter
              {activeFiltersCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-black text-[10px] font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <Link
              href="/recycle-bin"
              className="h-10 px-3.5 rounded-xl text-[13px] font-medium transition-all flex items-center gap-2 bg-[#151618] text-white/60 border border-white/10 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
              Recycle Bin
            </Link>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20 bg-[#151618] border border-white/10 rounded-2xl">
            <BouncingDots />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-[#151618] border border-white/10 rounded-2xl flex flex-col items-center justify-center">
            <span className="material-symbols-rounded text-[48px] text-white/10 mb-4">search_off</span>
            <p className="text-white/40 text-[15px]">
              {search || filter !== "all" || activeFiltersCount > 0 ? "No matches found." : "No waitlist signups yet."}
            </p>
          </div>
        ) : (
          <div className={`rounded-2xl border border-white/10 bg-[#151618] shadow-2xl transition-all ${openDropdownId !== null ? 'overflow-visible' : 'overflow-x-auto'}`}>
            <table className="w-full text-left text-[14px]">
              <thead>
                <tr className="border-b border-white/5 bg-[#0a0a0c]">
                  <th className="px-4 py-3 text-[12px] font-semibold text-white/40 uppercase tracking-wider sticky left-0 bg-[#0a0a0c] z-20 border-r border-white/5">#</th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-white/40 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-white/40 uppercase tracking-wider">Source</th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-white/40 uppercase tracking-wider">Explorer Card</th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-white/40 uppercase tracking-wider">Get Featured</th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-white/40 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-white/40 uppercase tracking-wider">Joined</th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-white/40 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((entry, i) => (
                  <tr
                    key={entry.id}
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-2.5 text-white/60 font-medium sticky left-0 bg-[#151618] group-hover:bg-[#1a1b1e] z-10 border-r border-white/5 transition-colors">
                      {i + 1}
                    </td>
                    <td className="px-4 py-2.5 text-white font-medium">{entry.email}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center bg-white/5 text-white/70 text-[11px] font-semibold px-2.5 py-1 rounded-md border border-white/10 tracking-wide uppercase">
                        {entry.source || "Waitlist"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-white/60 capitalize">
                      {entry.explorer_card_status || "Not created"}
                    </td>
                    <td className="px-4 py-2.5 text-white/60 capitalize">
                      {entry.get_featured_status || "Not created"}
                    </td>
                    <td className="px-4 py-2.5">
                      {entry.confirmed ? (
                        <span className="inline-flex items-center gap-1.5 bg-[#4ade80]/10 border border-[#4ade80]/20 text-[#4ade80] text-[12px] font-medium px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                          Confirmed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-[#fbbf24]/10 border border-[#fbbf24]/20 text-[#fbbf24] text-[12px] font-medium px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#fbbf24] shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-white/40 whitespace-nowrap text-[13px]">
                      {new Date(entry.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className={`px-4 py-2.5 text-right relative ${openDropdownId === entry.id ? 'z-[100]' : ''}`}>
                      <div className="relative inline-block">
                        <button
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                          title="More actions"
                          onClick={() => setOpenDropdownId(openDropdownId === entry.id ? null : entry.id)}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white/50 group-hover:text-white/80 transition-colors">
                            <circle cx="8" cy="3" r="1.5" fill="currentColor" />
                            <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                            <circle cx="8" cy="13" r="1.5" fill="currentColor" />
                          </svg>
                        </button>

                        {openDropdownId === entry.id && (
                          <>
                            <div
                              className="fixed inset-0 z-[90]"
                              onClick={() => setOpenDropdownId(null)}
                            />
                            <div
                              className="absolute right-0 top-full mt-1 z-[100] rounded-2xl border border-[#1E1E1E] bg-[#161616] shadow-[20px_20px_20px_rgba(0,0,0,0.25)] text-left overflow-hidden"
                              style={{ width: entry.explorer_card_status?.toLowerCase() === "created" ? 276 : 140 }}
                            >
                              {/* ── Explorer card section (only if created) ── */}
                              {entry.explorer_card_status?.toLowerCase() === "created" && (
                                <>
                                  <p className="px-5 pt-4 pb-1 text-[13px] font-bold text-white tracking-wide">
                                    Explore card
                                  </p>
                                  {entry.user_uuid && (
                                    <a
                                      href={`/view/explorercard/${entry.user_uuid}?style=${entry.card_style?.toLowerCase() || 'adventure'}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="block w-full px-5 py-2 text-[12px] text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                                      onClick={() => setOpenDropdownId(null)}
                                    >
                                      View
                                    </a>
                                  )}
                                  {entry.user_uuid && (
                                    <a
                                      href={`/edit/explorercard?userId=${entry.user_uuid}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="block w-full px-5 py-2 text-[12px] text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                                      onClick={() => setOpenDropdownId(null)}
                                    >
                                      Edit
                                    </a>
                                  )}
                                  <button
                                    className="w-full px-5 py-2 text-[12px] text-white/70 hover:text-white hover:bg-white/5 text-left transition-colors"
                                    onClick={() => {
                                      setResendEntry(entry);
                                      setResendType('explorer');
                                      setOpenDropdownId(null);
                                    }}
                                  >
                                    Resend
                                  </button>
                                  <div className="mx-5 my-2 h-px bg-[#303030]" />
                                </>
                              )}

                              {/* ── Profile section ── */}
                              <p className={`px-5 ${entry.explorer_card_status?.toLowerCase() === "created" ? "pt-1" : "pt-4"} pb-1 text-[13px] font-bold text-white tracking-wide`}>
                                Profile
                              </p>
                              {entry.user_uuid && (
                                <button
                                  className="block w-full px-5 py-2 text-[12px] text-left text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                                  onClick={() => {
                                    setDetailsModalEntry(entry);
                                    setOpenDropdownId(null);
                                  }}
                                >
                                  VIew
                                </button>
                              )}
                              {entry.user_uuid && (
                                <a
                                  href={`/admin/profiles?edit=${entry.user_uuid}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block w-full px-5 py-2 text-[12px] text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                                  onClick={() => setOpenDropdownId(null)}
                                >
                                  Edit
                                </a>
                              )}
                              <button
                                className="w-full px-5 py-2 text-[12px] text-white/70 hover:text-white hover:bg-white/5 text-left transition-colors"
                                onClick={() => {
                                  setResendEntry(entry);
                                  setResendType('profile');
                                  setOpenDropdownId(null);
                                }}
                              >
                                Resend email
                              </button>
                              <button
                                className="w-full px-5 py-2 text-[12px] text-white/70 hover:text-white hover:bg-white/5 text-left transition-colors"
                                onClick={() => {
                                  alert("Delete profile (not yet wired)");
                                  setOpenDropdownId(null);
                                }}
                              >
                                Delete
                              </button>

                              {/* ── Resend waitlist confirmation (only if explorer card) ── */}
                              {entry.explorer_card_status?.toLowerCase() === "created" && (
                                <>
                                  <div className="mx-5 my-2 h-px bg-[#303030]" />
                                  <button
                                    className="w-full px-5 py-2 text-[12px] text-white/70 hover:text-white hover:bg-white/5 text-left transition-colors"
                                    onClick={() => {
                                      setResendEntry(entry);
                                      setResendType('waitlist');
                                      setOpenDropdownId(null);
                                    }}
                                  >
                                    Resend waitlist confirmation email
                                  </button>
                                </>
                              )}

                              {/* ── Separator + Delete everything ── */}
                              <div className="mx-5 my-2 h-px bg-[#303030]" />
                              <button
                                className="w-full px-5 pt-1 pb-4 text-[12px] text-[#ef4444]/80 hover:text-[#ef4444] hover:bg-[#ef4444]/5 text-left transition-colors"
                                onClick={async () => {
                                  if (window.confirm("Are you sure you want to delete this waitlist entry?")) {
                                    try {
                                      const res = await fetch(`/api/admin/waitlist/${entry.id}`, { method: "DELETE" });
                                      if (res.ok) {
                                        setEntries(entries.filter(e => e.id !== entry.id));
                                        setTotal(total - 1);
                                        if (entry.confirmed) setConfirmedCount(confirmedCount - 1);
                                        else setUnconfirmedCount(unconfirmedCount - 1);
                                      } else {
                                        alert("Failed to delete entry");
                                      }
                                    } catch (err) {
                                      alert("Error deleting entry");
                                    }
                                  }
                                  setOpenDropdownId(null);
                                }}
                              >
                                Delete everything
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFilterModalOpen(false)} />
          <div className="bg-[#101115] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden relative z-10 shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#14151a]">
              <h2 className="text-[16px] font-semibold text-white flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
                Advanced Filters
              </h2>
              <button onClick={() => setIsFilterModalOpen(false)} className="text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-md p-1.5 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">
              {/* Explorer Card Status */}
              <div>
                <label className="block text-[13px] font-medium text-white/50 mb-2">Explorer Card</label>
                <div className="flex bg-[#1a1b20] p-1 rounded-xl border border-white/5">
                  {['', 'Created', 'Not created'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => setAdvancedFilters({ ...advancedFilters, explorer_card_status: opt })}
                      className={`flex-1 py-1.5 text-[12px] font-medium rounded-lg transition-all capitalize ${advancedFilters.explorer_card_status === opt ? 'bg-white text-black shadow-sm' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                    >
                      {opt === '' ? 'Any' : opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Get Featured Status */}
              <div>
                <label className="block text-[13px] font-medium text-white/50 mb-2">Get Featured</label>
                <div className="flex bg-[#1a1b20] p-1 rounded-xl border border-white/5">
                  {['', 'Created', 'Not created'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => setAdvancedFilters({ ...advancedFilters, get_featured_status: opt })}
                      className={`flex-1 py-1.5 text-[12px] font-medium rounded-lg transition-all capitalize ${advancedFilters.get_featured_status === opt ? 'bg-white text-black shadow-sm' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                    >
                      {opt === '' ? 'Any' : opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source */}
              <div>
                <label className="block text-[13px] font-medium text-white/50 mb-2">Source</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none bg-[#1a1b20] border border-white/10 rounded-xl px-4 py-2.5 text-[13px] font-medium text-white focus:border-white/30 focus:outline-none transition-all cursor-pointer"
                    value={advancedFilters.source}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, source: e.target.value })}
                  >
                    <option value="">All Sources</option>
                    {uniqueSources.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                  </div>
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="block text-[13px] font-medium text-white/50 mb-2">Country</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none bg-[#1a1b20] border border-white/10 rounded-xl px-4 py-2.5 text-[13px] font-medium text-white focus:border-white/30 focus:outline-none transition-all cursor-pointer"
                    value={advancedFilters.country}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, country: e.target.value })}
                  >
                    <option value="">All Countries</option>
                    {uniqueCountries.map(c => c && <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-white/5 flex justify-end gap-3 bg-[#14151a]">
              <button
                className="px-4 py-2 text-[13px] font-medium text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                onClick={() => setAdvancedFilters({
                  source: "",
                  explorer_card_status: "",
                  get_featured_status: "",
                  device: "",
                  browser: "",
                  country: ""
                })}
              >
                Clear all
              </button>
              <button
                className="px-5 py-2 text-[13px] font-medium bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
                onClick={() => setIsFilterModalOpen(false)}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Side Panel */}
      {detailsModalEntry && (
        <div className="fixed inset-0 z-[120] flex justify-end p-5">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDetailsModalEntry(null)} />
          <div className="bg-[#161616] border border-[#1E1E1E] rounded-2xl w-[420px] h-full relative z-10 shadow-[20px_20px_40px_rgba(0,0,0,0.40)] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">

            <div className="p-6 flex justify-between items-center bg-[#161616] shrink-0">
              <h2 className="text-xl font-bold text-white">VIew</h2>
              <button
                onClick={() => setDetailsModalEntry(null)}
                className="text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-md p-1.5 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="px-6 pb-8 overflow-y-auto flex-1 flex flex-col">

              {/* Basic info */}
              <div className="mb-6">
                <h3 className="text-[15px] font-bold text-white mb-4">Basic info</h3>
                <div className="flex flex-col gap-3 text-[13.5px]">
                  {detailsModalEntry.user_uuid && (
                    <div className="grid grid-cols-[130px_1fr] items-center">
                      <span className="text-white/50 font-medium">User ID</span>
                      <span className="text-white font-mono text-xs">{detailsModalEntry.user_uuid}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-[130px_1fr] items-center">
                    <span className="text-white/50 font-medium">Email</span>
                    <span className="text-white break-all">{detailsModalEntry.email}</span>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center">
                    <span className="text-white/50 font-medium">Country</span>
                    <span className="text-white">{detailsModalEntry.country || "N/A"}</span>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center">
                    <span className="text-white/50 font-medium">Joined</span>
                    <span className="text-white">
                      {new Date(detailsModalEntry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} &bull; {new Date(detailsModalEntry.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center">
                    <span className="text-white/50 font-medium">Source</span>
                    <span className="text-white">{detailsModalEntry.source || "Waitlist"}</span>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center">
                    <span className="text-white/50 font-medium">Waitlist status</span>
                    <div className="flex">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium tracking-wide ${detailsModalEntry.confirmed
                        ? "bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20"
                        : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                        }`}>
                        {detailsModalEntry.confirmed ? "Confirmed" : "Pending"}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center">
                    <span className="text-white/50 font-medium">Email verified</span>
                    <span className="text-white">
                      {detailsModalEntry.confirmed_at ? (
                        <>{new Date(detailsModalEntry.confirmed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} &bull; {new Date(detailsModalEntry.confirmed_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</>
                      ) : (
                        "N/A"
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-px w-full bg-white/5 mb-6" />

              {/* Explorer Card */}
              <div className="mb-6">
                <h3 className="text-[15px] font-bold text-white mb-4">Explorer Card</h3>
                <div className="flex flex-col gap-3 text-[13.5px]">
                  <div className="grid grid-cols-[130px_1fr] items-center">
                    <span className="text-white/50 font-medium">Status</span>
                    <div className="flex">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium tracking-wide ${detailsModalEntry.explorer_card_status?.toLowerCase() === 'created'
                        ? "bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20"
                        : "bg-white/10 text-white/70 border border-white/10"
                        }`}>
                        {detailsModalEntry.explorer_card_status || "Not created"}
                      </span>
                    </div>
                  </div>
                  {detailsModalEntry.explorer_card_status?.toLowerCase() === 'created' && (
                    <>
                      <div className="grid grid-cols-[130px_1fr] items-center">
                        <span className="text-white/50 font-medium">Card style</span>
                        <span className="text-white capitalize">{detailsModalEntry.card_style || "Adventure"}</span>
                      </div>
                      <div className="grid grid-cols-[130px_1fr] items-center">
                        <span className="text-white/50 font-medium">Countries visited</span>
                        <span className="text-white">{detailsModalEntry.countries_count || 0}</span>
                      </div>
                      <div className="grid grid-cols-[130px_1fr] items-center">
                        <span className="text-white/50 font-medium">View card</span>
                        <a
                          href={`/view/explorercard/${detailsModalEntry.user_uuid}?style=${detailsModalEntry.card_style?.toLowerCase() || 'adventure'}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#60a5fa] hover:underline"
                        >
                          Open card
                        </a>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="h-px w-full bg-white/5 mb-6" />

              {/* Featured Application */}
              <div className="mb-6">
                <h3 className="text-[15px] font-bold text-white mb-4">Featured Application</h3>
                <div className="flex flex-col gap-3 text-[13.5px]">
                  <div className="grid grid-cols-[130px_1fr] items-center">
                    <span className="text-white/50 font-medium">Status</span>
                    <div className="flex">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium tracking-wide ${detailsModalEntry.get_featured_status?.toLowerCase() === 'approved'
                        ? "bg-[#60a5fa]/10 text-[#60a5fa] border border-[#60a5fa]/20"
                        : detailsModalEntry.get_featured_status?.toLowerCase() === 'created'
                          ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                          : "bg-white/10 text-white/70 border border-white/10"
                        }`}>
                        {detailsModalEntry.get_featured_status || "Not created"}
                      </span>
                    </div>
                  </div>

                  {detailsModalEntry.get_featured_status?.toLowerCase() === 'created' && (
                    <div className="flex gap-3 mt-2">
                      <button
                        onClick={() => {
                          const searchParams = new URLSearchParams();
                          searchParams.set("create", "true");
                          if (detailsModalEntry.email) searchParams.set("email", detailsModalEntry.email);
                          if (detailsModalEntry.country) searchParams.set("country", detailsModalEntry.country);
                          if (detailsModalEntry.id) searchParams.set("waitlistId", detailsModalEntry.id.toString());

                          window.open(`/profiles?${searchParams.toString()}`, "_blank");
                        }}
                        className="px-4 py-2 bg-[#e8f5e9] text-[#1b5e20] hover:bg-[#c8e6c9] font-medium rounded-lg text-[13px] transition-colors"
                      >
                        Mark as Featured
                      </button>
                      <button className="px-4 py-2 bg-white text-black hover:bg-gray-100 font-medium rounded-lg text-[13px] transition-colors">
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="h-px w-full bg-white/5 mb-6" />

              {/* Additional info */}
              <div>
                <h3 className="text-[15px] font-bold text-white mb-4">Additional info</h3>
                <div className="flex flex-col gap-3 text-[13.5px]">
                  <div className="grid grid-cols-[130px_1fr] items-center">
                    <span className="text-white/50 font-medium">Device</span>
                    <span className="text-white">{detailsModalEntry.device || "N/A"}</span>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center">
                    <span className="text-white/50 font-medium">Browser</span>
                    <span className="text-white">{detailsModalEntry.browser || "N/A"}</span>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center">
                    <span className="text-white/50 font-medium">Location</span>
                    <span className="text-white">
                      {[detailsModalEntry.city, detailsModalEntry.country].filter(Boolean).join(", ") || "N/A"}
                    </span>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center">
                    <span className="text-white/50 font-medium">IP address</span>
                    <span className="text-white">{detailsModalEntry.ip || "N/A"}</span>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center">
                    <span className="text-white/50 font-medium">Last seen</span>
                    <span className="text-white">
                      {new Date(detailsModalEntry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} &bull; {new Date(detailsModalEntry.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
      {/* Resend Modal */}
      {resendEntry && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setResendEntry(null)} />
          <div className="relative bg-[#161616] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <h3 className="text-xl font-display font-medium text-white mb-2">
              {resendEntry.confirmed ? "Reverify User" : "Verify User"}
            </h3>
            <p className="text-sm text-white/60 mb-6">
              Are you sure you want to resend the {resendType === 'waitlist' ? 'waitlist confirmation' : resendType === 'explorer' ? 'Explorer Card' : 'Profile'} email to {resendEntry.email} to {resendEntry.confirmed ? "reverify" : "verify"} this user?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setResendEntry(null)}
                className="bg-transparent hover:bg-white/5 text-white/60 hover:text-white"
                disabled={resendLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  setResendLoading(true);
                  try {
                    const res = await fetch("/api/admin/waitlist/resend", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: resendEntry.id, type: resendType }),
                    });
                    if (res.ok) {
                      alert("Email sent successfully!");
                    } else {
                      alert("Failed to send email.");
                    }
                  } catch (e) {
                    alert("Error sending email.");
                  } finally {
                    setResendLoading(false);
                    setResendEntry(null);
                    setResendType(null);
                  }
                }}
                className="bg-[#5A45F9] hover:bg-[#5A45F9]/80 "
                disabled={resendLoading}
              >
                {resendLoading ? "Sending..." : "Resend Email"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
