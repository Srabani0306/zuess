"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, KeyRound } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (form.newPassword !== form.confirmPassword) return setError("Passwords don't match.");
    setLoading(true);
    setError("");
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: form.newPassword }),
    });
    const data = await response.json();
    if (!response.ok) setError(data.error);
    else router.push("/admin/login");
    setLoading(false);
  }

  if (!token) {
    return (
      <div className="bg-paper text-ink p-8 rounded-sm space-y-4">
        <p className="text-sm text-red-700">This reset link is missing its token. Request a new one from the forgot password page.</p>
        <Link href="/admin/forgot-password" className="text-[13px] text-emerald hover:underline">Request a new link</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-paper text-ink p-8 rounded-sm space-y-5">
      <div>
        <label className="block text-[13px] text-charcoal/60 mb-1.5">New password</label>
        <input required type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} className="w-full border border-line bg-paper px-4 py-3 text-[14px] focus:outline-none focus:border-emerald" />
      </div>
      <div>
        <label className="block text-[13px] text-charcoal/60 mb-1.5">Confirm new password</label>
        <input required type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="w-full border border-line bg-paper px-4 py-3 text-[14px] focus:outline-none focus:border-emerald" />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button disabled={loading} className="inline-flex items-center gap-2 bg-emerald text-paper px-5 py-3 rounded-sm font-medium disabled:opacity-60">
        <KeyRound size={16} /> {loading ? "Saving..." : "Set new password"} <ArrowUpRight size={16} />
      </button>
    </form>
  );
}

export default function ResetPassword() {
  return (
    <main className="min-h-screen bg-ink text-paper flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-10">
          <p className="text-gold text-[13px] font-mono uppercase tracking-[0.2em]">Zuess / Admin</p>
          <h1 className="font-serif text-4xl mt-4">Set a new password.</h1>
          <p className="text-paper/60 mt-3">This link is valid for one hour and can only be used once.</p>
        </div>
        <Suspense fallback={<div className="bg-paper text-ink p-8 rounded-sm text-sm text-charcoal/60">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
