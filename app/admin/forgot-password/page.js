"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, KeyRound } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) setError(data.error);
    else setMessage(data.message);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-ink text-paper flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-10">
          <p className="text-gold text-[13px] font-mono uppercase tracking-[0.2em]">Zuess / Admin</p>
          <h1 className="font-serif text-4xl mt-4">Reset your password.</h1>
          <p className="text-paper/60 mt-3">We'll send a reset link to your admin email if an account exists.</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-paper text-ink p-8 rounded-sm space-y-5">
          <div>
            <label className="block text-[13px] text-charcoal/60 mb-1.5">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-line bg-paper px-4 py-3 text-[14px] focus:outline-none focus:border-emerald" />
          </div>
          {message && <p className="text-sm text-emerald">{message}</p>}
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button disabled={loading} className="inline-flex items-center gap-2 bg-emerald text-paper px-5 py-3 rounded-sm font-medium disabled:opacity-60">
            <KeyRound size={16} /> {loading ? "Sending..." : "Send reset link"} <ArrowUpRight size={16} />
          </button>
          <Link href="/admin/login" className="block text-[13px] text-charcoal/60 hover:text-emerald">Back to sign in</Link>
        </form>
      </div>
    </main>
  );
}
