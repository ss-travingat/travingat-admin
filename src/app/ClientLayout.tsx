"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminNavbar from "@/components/admin/AdminNavbar";

export default function ClientLayout({
  children,
  hasSession,
}: {
  children: React.ReactNode;
  hasSession: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (pathname !== "/login" && !hasSession) {
      router.replace("/login"); 
    }
  }, [pathname, hasSession, router]);

  useEffect(() => {
    const originalFetch = window.fetch;
    let isSigningOut = false;

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      if (response.status === 401 && !isSigningOut && pathname !== "/login") {
        isSigningOut = true;
        setToast("Session expired or corrupted. Signing out...");
        
        try {
          await originalFetch("/api/admin/session", { method: "DELETE" });
        } catch (e) {
          // ignore
        }
        
        setTimeout(() => {
          setToast(null);
          // force a full reload to the login page to completely clear client state
          window.location.href = "/login";
        }, 2500);
      }
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white">
      {pathname !== "/login" && <AdminNavbar />}
      <div className="flex-1 flex flex-col">
        {(!hasSession && pathname !== "/login") ? null : children}
      </div>
      {toast && (
        <div className="fixed bottom-4 right-4 bg-red-600/90 backdrop-blur-md px-4 py-2 rounded-lg border border-red-500/50 text-white z-toast shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
