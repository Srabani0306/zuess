"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

const services = ["Income Tax", "GST", "Audit & Assurance", "Company Registration", "Bookkeeping & Payroll", "Advisory"];

export default function EnquiryForm() {
  const [service, setService] = useState(services[0]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form.entries())) });
    const data = await response.json();
    if (response.ok) setSubmitted(true);
    else setError(data.error || "Unable to send your enquiry.");
    setSubmitting(false);
  }

  if (submitted) return <div className="py-10 text-center"><p className="font-serif text-2xl text-ink mb-3">Message received.</p><p className="text-[15px] text-charcoal/65">Someone from the team will get back to you within one business day.</p></div>;

  return <form onSubmit={submit} className="space-y-5">
    <div className="grid sm:grid-cols-2 gap-5">
      <label className="block text-[13px] text-charcoal/60">Name<input required name="name" className="mt-1.5 w-full bg-paper border border-line rounded-sm px-4 py-2.5 text-[14.5px] focus:outline-none focus:border-emerald" /></label>
      <label className="block text-[13px] text-charcoal/60">Phone<input required name="phone" type="tel" className="mt-1.5 w-full bg-paper border border-line rounded-sm px-4 py-2.5 text-[14.5px] focus:outline-none focus:border-emerald" /></label>
    </div>
    <label className="block text-[13px] text-charcoal/60">Email<input required name="email" type="email" className="mt-1.5 w-full bg-paper border border-line rounded-sm px-4 py-2.5 text-[14.5px] focus:outline-none focus:border-emerald" /></label>
    <label className="block text-[13px] text-charcoal/60">Which service is this about?<select name="service" value={service} onChange={(event) => setService(event.target.value)} className="mt-1.5 w-full bg-paper border border-line rounded-sm px-4 py-2.5 text-[14.5px] focus:outline-none focus:border-emerald">{services.map((item) => <option key={item}>{item}</option>)}</select></label>
    <label className="block text-[13px] text-charcoal/60">Message<textarea required name="message" rows={4} className="mt-1.5 w-full bg-paper border border-line rounded-sm px-4 py-2.5 text-[14.5px] focus:outline-none focus:border-emerald resize-none" /></label>
    {error && <p className="text-sm text-red-700">{error}</p>}
    <button disabled={submitting} className="inline-flex items-center gap-2 bg-emerald text-paper px-6 py-3 rounded-sm font-medium hover:bg-emerald-dark transition-colors disabled:opacity-60">{submitting ? "Sending..." : "Send message"} <ArrowUpRight size={16} /></button>
  </form>;
}
