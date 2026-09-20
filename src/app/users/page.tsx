"use client";

import { WaitlistTab } from "./WaitlistTab";

export default function UsersAdminWrapper() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <div className="max-w-5xl mx-auto w-full px-6 pt-10 pb-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">Users Management</h1>
      </div>
      <main className="flex-1 w-full relative">
        <WaitlistTab />
      </main>
    </div>
  );
}
