"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Eye, EyeOff, LockKeyhole } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    if (!response.ok) setError(data.error);
    else router.push("/admin");
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-ink text-paper flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-10">
          <p className="text-gold text-[13px] font-mono uppercase tracking-[0.2em]">Zuess / Admin</p>
          <h1 className="font-serif text-4xl mt-4">Sign in to the office.</h1>
          <p className="text-paper/60 mt-3">Manage consultation enquiries from one quiet dashboard.</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-paper text-ink p-8 rounded-sm space-y-5">
          <div>
            <label className="block text-[13px] text-charcoal/60 mb-1.5">Email</label>
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-line bg-paper px-4 py-3 text-[14px] focus:outline-none focus:border-emerald" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[13px] text-charcoal/60">Password</label>
              <a href="/admin/forgot-password" className="text-[12px] text-emerald hover:underline">Forgot password?</a>
            </div>
            <div className="relative">
              <input required type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border border-line bg-paper px-4 py-3 pr-12 text-[14px] focus:outline-none focus:border-emerald" />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} title={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/60 hover:text-emerald">
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button disabled={loading} className="inline-flex items-center gap-2 bg-emerald text-paper px-5 py-3 rounded-sm font-medium disabled:opacity-60">
            <LockKeyhole size={16} /> {loading ? "Signing in..." : "Sign in"} <ArrowUpRight size={16} />
          </button>
        </form>
      </div>
    </main>
  );
}
