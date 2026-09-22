"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    if (pathname !== "/login" && !hasSession) {
      router.replace("/login");
    }
  }, [pathname, hasSession, router]);

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white">
      {pathname !== "/login" && <AdminNavbar />}
      <div className="flex-1 flex flex-col">
        {(!hasSession && pathname !== "/login") ? null : children}
      </div>
    </div>
  );
}
