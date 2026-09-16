"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight, MessageSquareText, X } from "lucide-react";

const SERVICES = ["Income Tax", "GST", "Audit & Assurance", "Company Registration", "Bookkeeping & Payroll", "Advisory"];
const EMPTY_FORM = { name: "", phone: "", email: "", service: SERVICES[0] };

export default function QuoteQuickForm() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  /* This is a marketing-site affordance; the admin dashboard has its own chrome. */
  if (pathname?.startsWith("/admin")) return null;

  function close() {
    setOpen(false);
    setStatus("idle");
    setError("");
  }

  async function submit(event) {
    event.preventDefault();
    setStatus("sending");
    setError("");
    const response = await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, message: `Quick quote request for ${form.service}, submitted from the floating quote form.` }),
    });
    const data = await response.json();
    if (response.ok) {
      setStatus("done");
      setForm(EMPTY_FORM);
      window.setTimeout(close, 2000);
    } else {
      setStatus("idle");
      setError(data.error || "Unable to send your request.");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Get a quick quote"
        aria-expanded={open}
        className={`fixed left-0 top-1/2 -translate-y-1/2 z-40 transition-all duration-500 ease-out ${open ? "-translate-x-24 opacity-0 pointer-events-none" : "translate-x-0 opacity-100"}`}
      >
        <span className="flex items-center justify-center w-24 h-24 -ml-14 rotate-45 bg-gradient-to-br from-emerald to-emerald-dark shadow-[0_10px_30px_-10px_rgba(16,27,51,0.5)] hover:shadow-[0_14px_36px_-10px_rgba(16,27,51,0.6)] transition-shadow">
          <span className="-rotate-45 translate-x-3.5 text-paper">
            <MessageSquareText size={24} strokeWidth={2} />
          </span>
        </span>
      </button>

      <div
        className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-500 ease-out ${open ? "translate-y-0" : "translate-y-full"}`}
        aria-hidden={!open}
      >
        <form onSubmit={submit} className="relative bg-gradient-to-r from-emerald via-emerald-dark to-ink px-6 py-6 md:px-10 flex flex-wrap items-end gap-3">
          <button type="button" onClick={close} aria-label="Close quote form" className="absolute right-4 top-4 text-paper/70 hover:text-paper transition-colors">
            <X size={20} />
          </button>

          {status === "done" ? (
            <p className="text-paper text-[15px] py-2">Request received — we'll be in touch within one business day.</p>
          ) : (
            <>
              <label className="flex-1 min-w-[140px] text-[12px] text-paper/70">
                Name
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-sm px-3.5 py-2.5 text-sm text-ink focus:outline-none" />
              </label>
              <label className="flex-1 min-w-[140px] text-[12px] text-paper/70">
                Phone
                <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1 w-full rounded-sm px-3.5 py-2.5 text-sm text-ink focus:outline-none" />
              </label>
              <label className="flex-1 min-w-[160px] text-[12px] text-paper/70">
                Email
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full rounded-sm px-3.5 py-2.5 text-sm text-ink focus:outline-none" />
              </label>
              <label className="flex-1 min-w-[170px] text-[12px] text-paper/70">
                Service
                <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} className="mt-1 w-full rounded-sm px-3.5 py-2.5 text-sm text-ink focus:outline-none">
                  {SERVICES.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <button disabled={status === "sending"} className="inline-flex items-center gap-2 bg-gold text-ink px-6 py-2.5 rounded-sm font-medium text-sm hover:bg-gold-light transition-colors disabled:opacity-60">
                {status === "sending" ? "Sending..." : "Get a quote"} <ArrowUpRight size={15} />
              </button>
              {error && <p className="w-full text-paper text-[12.5px]">{error}</p>}
            </>
          )}
        </form>
      </div>
    </>
  );
}
