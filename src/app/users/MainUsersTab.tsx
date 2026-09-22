"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";

type AdminUser = {
  id: string;
  email: string;
  username: string;
  display_name: string;
  based_in: string;
  countries_traveled: number;
  onboarded: boolean;
  auth_provider: string;
  avatar_url: string;
  cover_image_url: string;
  total_media_count: number;
  image_count: number;
  video_count: number;
  storage_bytes: number;
  last_active_at: string;
  activity_events_30d: number;
  active_days_30d: number;
  weekly_frequency: number;
  status: "active" | "disabled";
  disabled_at?: string;
  disabled_reason: string;
  created_at: string;
  has_explorer_card?: boolean;
  card_style?: string;
};

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatDateTime(input: string) {
  if (!input) return "-";
  return new Date(input).toLocaleString();
}

/* ─── Dropdown Menu Component ─── */
function UserActionsDropdown({
  user,
  onDelete,
  onToggleStatus,
  processing,
  onViewDetails,
  hasExplorerCard,
  isOpen,
  toggle,
  close,
  onResendEmail,
}: {
  user: AdminUser;
  onDelete: (u: AdminUser) => void;
  onToggleStatus: (u: AdminUser) => void;
  processing: boolean;
  onViewDetails: (u: AdminUser) => void;
  hasExplorerCard: boolean;
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  onResendEmail: (email: string, type: 'explorer' | 'waitlist' | 'profile') => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        close();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, close]);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        className="p-1.5 rounded-md hover:bg-white/5 transition-colors"
        title="More actions"
        onClick={toggle}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-50 hover:opacity-100 transition-opacity">
          <circle cx="8" cy="3" r="1.5" fill="white" />
          <circle cx="8" cy="8" r="1.5" fill="white" />
          <circle cx="8" cy="13" r="1.5" fill="white" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[90]"
            onClick={close}
          />
          <div
            className="absolute right-0 top-full mt-1 z-[100] rounded-2xl border border-[#1E1E1E] bg-[#161616] shadow-[20px_20px_20px_rgba(0,0,0,0.25)] text-left overflow-hidden"
            style={{ width: hasExplorerCard ? 276 : 140 }}
          >
            {/* ── Explorer card section (only if created) ── */}
            {hasExplorerCard && (
              <>
                <p className="px-5 pt-4 pb-1 text-[13px] font-bold text-white tracking-wide">
                  Explore card
                </p>
                <a
                  href={`/view/explorercard/${user.username || user.id}?style=${user.card_style?.toLowerCase() || 'adventure'}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full px-5 py-2 text-[12px] text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={close}
                >
                  View
                </a>
                <a
                  href={`/edit/explorercard?userId=${user.username || user.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full px-5 py-2 text-[12px] text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={close}
                >
                  Edit
                </a>
                <button
                  className="w-full px-5 py-2 text-[12px] text-white/70 hover:text-white hover:bg-white/5 text-left transition-colors"
                  onClick={() => {
                    onResendEmail(user.email, 'explorer');
                    close();
                  }}
                >
                  Resend
                </button>
                <div className="mx-5 my-2 h-px bg-[#303030]" />
              </>
            )}

            {/* ── Profile section ── */}
            <p className={`px-5 ${hasExplorerCard ? "pt-1" : "pt-4"} pb-1 text-[13px] font-bold text-white tracking-wide`}>
              Profile
            </p>
            {/* VIew */}
            <button
              className="block w-full px-5 py-2 text-[12px] text-left text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              onClick={() => {
                onViewDetails(user);
                close();
              }}
            >
              VIew
            </button>
            {/* View */}
            <a
              href={`https://app.travingat.com/profiles/${user.username || user.id}`}
              target="_blank"
              rel="noreferrer"
              className="block w-full px-5 py-2 text-[12px] text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              onClick={close}
            >
              View
            </a>
            {/* Edit */}
            <a
              href={`/admin/profiles?edit=${user.id}`}
              target="_blank"
              rel="noreferrer"
              className="block w-full px-5 py-2 text-[12px] text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              onClick={close}
            >
              Edit
            </a>
            {/* Resend */}
            <button
              className="w-full px-5 py-2 text-[12px] text-white/70 hover:text-white hover:bg-white/5 text-left transition-colors"
              onClick={() => {
                onResendEmail(user.email, 'profile');
                close();
              }}
            >
              Resend
            </button>
            {/* Delete profile */}
            <button
              className="w-full px-5 py-2 text-[12px] text-white/70 hover:text-white hover:bg-white/5 text-left transition-colors"
              onClick={() => {
                alert("Delete profile (not yet wired)");
                close();
              }}
            >
              Delete
            </button>

            {hasExplorerCard && (
              <>
                {/* Separator */}
                <div className="mx-5 my-2 h-px bg-[#303030]" />

                {/* Resend waitlist confirmation email */}
                <button
                  className="w-full px-5 py-2 text-[12px] text-white/70 hover:text-white hover:bg-white/5 text-left transition-colors"
                  onClick={() => {
                    onResendEmail(user.email, 'waitlist');
                    close();
                  }}
                >
                  Resend waitlist confirmation email
                </button>
              </>
            )}

            {/* Separator */}
            <div className="mx-5 my-2 h-px bg-[#303030]" />

            {/* Delete everything */}
            <button
              className="w-full px-5 pt-1 pb-4 text-[12px] text-[#ef4444]/80 hover:text-[#ef4444] hover:bg-[#ef4444]/5 text-left transition-colors"
              onClick={() => {
                onDelete(user);
                close();
              }}
            >
              Delete everything
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Main Component ─── */
export function MainUsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingUserID, setProcessingUserID] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [detailsModalUser, setDetailsModalUser] = useState<AdminUser | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users?limit=50", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load users");
        return;
      }
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const onToggleStatus = async (user: AdminUser) => {
    const disableTarget = user.status !== "disabled";
    const reason = disableTarget
      ? window.prompt("Disable reason (optional):", user.disabled_reason || "") || ""
      : "";

    setProcessingUserID(user.id);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disabled: disableTarget, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update account status");
        return;
      }
      await loadUsers();
    } catch {
      setError("Failed to update account status");
    } finally {
      setProcessingUserID("");
    }
  };

  const onDeleteUser = async (user: AdminUser) => {
    const confirmed = window.confirm(`Delete account for ${user.email}? This action is permanent.`);
    if (!confirmed) return;

    setProcessingUserID(user.id);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to delete account");
        return;
      }
      await loadUsers();
    } catch {
      setError("Failed to delete account");
    } finally {
      setProcessingUserID("");
    }
  };

  const handleDelete = onDeleteUser;

  const onSignOut = async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    window.location.href = "/login";
  };

  const handleResendEmail = async (email: string, type: 'explorer' | 'waitlist' | 'profile') => {
    try {
      const res = await fetch("/api/admin/waitlist/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Email sent successfully");
      } else {
        alert(data.error || "Failed to resend email");
      }
    } catch (err) {
      alert("Network error while trying to resend email");
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.display_name || "").toLowerCase().includes(q) ||
        (u.based_in || "").toLowerCase().includes(q)
    );
  }, [users, query]);

  return (
    <div className="flex-1 w-full relative">

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-[28px] font-bold tracking-[-0.5px]">Users</h2>
            <p className="text-white/40 text-sm">View account analytics, activity patterns, media usage, and admin controls.</p>
          </div>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by email / username / country"
            className="max-w-[320px] bg-[#141414] border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#5A45F9]/60"
          />
        </div>

        {loading && <p className="text-white/50 text-sm">Loading users...</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        {!loading && !error && (
          <div className={`rounded-2xl border border-white/10 bg-[#121212] ${openDropdownId !== null ? 'overflow-visible' : 'overflow-x-auto'}`}>
            <table className="w-full min-w-[1700px] text-sm">
              <thead className="text-white/60 border-b border-white/10">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">User</th>
                  <th className="text-left px-4 py-3 font-medium">Username</th>
                  <th className="text-left px-4 py-3 font-medium">Profile</th>
                  <th className="text-left px-4 py-3 font-medium">Media</th>
                  <th className="text-left px-4 py-3 font-medium">Storage</th>
                  <th className="text-left px-4 py-3 font-medium">Activity</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Created</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 min-w-[240px]">
                      <p className="font-medium">{u.email}</p>
                      <p className="text-white/45 text-xs">{u.id}</p>
                    </td>
                    <td className="px-4 py-3">{u.username}</td>
                    <td className="px-4 py-3">
                      <p className="text-white/90">{u.display_name || "-"}</p>
                      <p className="text-white/50 text-xs uppercase">{u.auth_provider} • {u.based_in || "NA"}</p>
                      <p className="text-white/50 text-xs">Countries: {u.countries_traveled} • Onboarded: {u.onboarded ? "Yes" : "No"}</p>
                    </td>
                    <td className="px-4 py-3 min-w-[230px]">
                      <div className="flex items-center gap-2">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-white/10" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-white/10" />
                        )}
                        {u.cover_image_url ? (
                          <img src={u.cover_image_url} alt="Cover" className="w-24 h-10 rounded-md object-cover border border-white/10" />
                        ) : (
                          <div className="w-24 h-10 rounded-md bg-white/10" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p>Total: {u.total_media_count}</p>
                      <p className="text-white/55 text-xs">Images: {u.image_count} • Videos: {u.video_count}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{formatBytes(u.storage_bytes)}</p>
                    </td>
                    <td className="px-4 py-3 min-w-[220px]">
                      <p className="text-white/90">Last: {formatDateTime(u.last_active_at)}</p>
                      <p className="text-white/55 text-xs">Events(30d): {u.activity_events_30d} • Active days: {u.active_days_30d}</p>
                      <p className="text-white/55 text-xs">Frequency: {u.weekly_frequency.toFixed(1)} / week</p>
                    </td>
                    <td className="px-4 py-3 min-w-[190px]">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs ${u.status === "active" ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}>
                        {u.status}
                      </span>
                      {u.status === "disabled" ? (
                        <p className="text-xs text-white/50 mt-1">
                          {u.disabled_reason || "No reason provided"}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {formatDateTime(u.created_at)}
                    </td>
                    <td className={`px-4 py-3 text-right relative ${openDropdownId === u.id ? 'z-[100]' : ''}`}>
                      <UserActionsDropdown
                        user={u}
                        hasExplorerCard={!!u.has_explorer_card}
                        isOpen={openDropdownId === u.id}
                        toggle={() => setOpenDropdownId(openDropdownId === u.id ? null : u.id)}
                        close={() => setOpenDropdownId(null)}
                        onDelete={onDeleteUser}
                        onToggleStatus={onToggleStatus}
                        processing={processingUserID === u.id}
                        onViewDetails={(user) => setDetailsModalUser(user)}
                        onResendEmail={handleResendEmail}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="p-6 text-sm text-white/50">No users found.</div>
            )}
          </div>
        )}
      </div>
      {/* Details Side Panel */}
      {detailsModalUser && (
        <div className="fixed inset-0 z-[120] flex justify-end p-5">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDetailsModalUser(null)} />
          <div className="bg-[#161616] border border-[#1E1E1E] rounded-2xl w-[420px] h-full relative z-10 shadow-[20px_20px_40px_rgba(0,0,0,0.40)] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-[#1E1E1E] flex justify-between items-center bg-[#161616]">
              <h2 className="text-xl font-semibold text-white">Details</h2>
              <button onClick={() => setDetailsModalUser(null)} className="text-white/40 hover:text-white transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">

              {/* Profile Overview */}
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Profile Overview</p>
                <div className="bg-[#1E1E1E]/40 rounded-xl p-4 border border-white/5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/60">Display Name</span>
                    <span className="text-sm text-white font-medium">{detailsModalUser.display_name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/60">Username</span>
                    <span className="text-sm text-white">@{detailsModalUser.username || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/60">Email</span>
                    <span className="text-sm text-white">{detailsModalUser.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/60">User ID</span>
                    <span className="text-xs text-white/80 bg-white/5 px-2 py-1 rounded font-mono truncate max-w-[200px]">{detailsModalUser.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/60">Joined</span>
                    <span className="text-sm text-white">{new Date(detailsModalUser.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Status & Analytics */}
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Status & Analytics</p>
                <div className="bg-[#1E1E1E]/40 rounded-xl p-4 border border-white/5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/60">Status</span>
                    <span className={`text-sm font-medium ${detailsModalUser.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                      {detailsModalUser.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/60">Onboarded</span>
                    <span className="text-sm text-white">{detailsModalUser.onboarded ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/60">Auth Provider</span>
                    <span className="text-sm text-white capitalize">{detailsModalUser.auth_provider || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/60">Countries Traveled</span>
                    <span className="text-sm text-white">{detailsModalUser.countries_traveled}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/60">Based In</span>
                    <span className="text-sm text-white">{detailsModalUser.based_in || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Media Usage */}
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Media Storage</p>
                <div className="bg-[#1E1E1E]/40 rounded-xl p-4 border border-white/5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/60">Total Media</span>
                    <span className="text-sm text-white">{detailsModalUser.total_media_count} files</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/60">Images</span>
                    <span className="text-sm text-white">{detailsModalUser.image_count}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/60">Videos</span>
                    <span className="text-sm text-white">{detailsModalUser.video_count}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/60">Storage Used</span>
                    <span className="text-sm text-white">{(detailsModalUser.storage_bytes / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions inside modal */}
              <div className="mt-4 pt-4 border-t border-[#1E1E1E] flex flex-col gap-2">
                <a
                  href={`https://app.travingat.com/profiles/${detailsModalUser.username || detailsModalUser.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-[#2A2A2A] hover:bg-[#333333] text-white text-sm font-medium rounded-lg text-center transition-colors"
                >
                  View Public Profile
                </a>
                <button
                  className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-medium rounded-lg text-center transition-colors"
                  onClick={() => {
                    handleDelete(detailsModalUser);
                    setDetailsModalUser(null);
                  }}
                  disabled={!!processingUserID}
                >
                  {processingUserID === detailsModalUser.id ? "Deleting..." : "Delete User"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
