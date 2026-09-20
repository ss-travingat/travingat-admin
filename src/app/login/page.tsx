"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/cms/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Login failed");
        return;
      }
      window.location.href = "/";
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-6 py-10 grid place-items-center">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#121212] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
        <p className="text-xs uppercase tracking-[0.28em] text-white/40 mb-3">Admin Access</p>
        <h1 className="text-3xl font-semibold tracking-[-0.5px] mb-2">Travingat Control</h1>
        <p className="text-sm text-white/50 mb-8">Sign in with the admin password.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm text-white/70">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="rounded-xl border border-white/15 bg-[#0d0d0d] focus:border-white/35"
            />
          </div>

          {error ? <p className="text-red-400 text-sm">{error}</p> : null}

          <Button
            type="submit"
            loading={submitting}
            className="w-full rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
