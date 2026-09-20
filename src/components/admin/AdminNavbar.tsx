"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await fetch("/api/cms/session", { method: "DELETE" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  const showBackButton = pathname !== "/" && pathname !== "/login";

  return (
    <div className="w-full h-[60px] bg-[#0a0a0a] border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        {showBackButton && (
          <>
            <Link 
              href="/" 
              className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors text-[13px] font-medium bg-white/5 hover:bg-white/10 px-2 py-1 rounded-md"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Back
            </Link>
            <div className="w-px h-4 bg-white/10" />
          </>
        )}
        <div className="text-white font-bold text-[15px]">Admin Dashboard</div>
      </div>
      <div className="flex items-center gap-5">
        <button 
          onClick={handleSignOut} 
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all text-[13px] font-medium"
        >
          <span className="material-symbols-rounded text-[16px]">logout</span>
          Sign out
        </button>
      </div>
    </div>
  );
}
