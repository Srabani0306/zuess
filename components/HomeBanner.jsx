"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowUpRight, Banknote, Calculator, FileText, Landmark, ScrollText, ShieldCheck, TrendingUp } from "lucide-react";

const STATIC_SLIDE = {
  kicker: "Chartered Accountants · Bengaluru",
  heading: "Numbers you can build decisions on.",
  text: "Taxation, audit, compliance and advisory handled by one practice — so nothing falls between two accountants' desks, and no deadline arrives as a surprise.",
};

const BACKGROUND_ICONS = [
  { Icon: Calculator, className: "top-[4%] left-[2%] w-16 h-16 text-emerald/35 animate-float-slow" },
  { Icon: TrendingUp, className: "top-[10%] right-[2%] w-20 h-20 text-gold/45 animate-float-delayed" },
  { Icon: FileText, className: "bottom-[14%] left-[6%] w-14 h-14 text-emerald/30 animate-float-delayed" },
  { Icon: Landmark, className: "bottom-[4%] right-[12%] w-[4.5rem] h-[4.5rem] text-gold/40 animate-float-slow" },
  { Icon: ShieldCheck, className: "top-[38%] left-[-2%] w-12 h-12 text-emerald/25 animate-float-slow" },
  { Icon: ScrollText, className: "top-[-2%] right-[28%] w-11 h-11 text-gold/35 animate-float-delayed" },
  { Icon: Banknote, className: "bottom-[-2%] left-[38%] w-14 h-14 text-emerald/25 animate-float-slow" },
];

export default function HomeBanner({ slides }) {
  const [active, setActive] = useState(0);
  const items = slides?.length ? slides : [STATIC_SLIDE];

  useEffect(() => {
    if (items.length < 2) return undefined;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % items.length), 5500);
    return () => window.clearInterval(timer);
  }, [items.length]);

  const slide = items[active];
  const kicker = slide.kicker || STATIC_SLIDE.kicker;
  const heading = slide.heading || STATIC_SLIDE.heading;
  const text = slide.text || STATIC_SLIDE.text;
  return <div className="relative overflow-hidden">
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden md:block">
      {BACKGROUND_ICONS.map(({ Icon, className }, index) => <Icon key={index} className={`absolute ${className}`} strokeWidth={1.4} />)}
    </div>
    <div className="relative grid md:grid-cols-2 gap-16 items-center py-16 md:py-24">
      <div key={`${active}-${heading}`} className="animate-fadeUp">
        <p className="text-emerald text-[14px] font-medium mb-5">{kicker}</p>
        <h1 className="text-shimmer font-serif text-4xl md:text-[3.4rem] leading-[1.08]">{heading}</h1>
        <p className="mt-6 text-charcoal/75 text-[17px] leading-relaxed max-w-md">{text}</p>
        <div className="mt-9 flex flex-wrap gap-4">
          <a href="/contact" className="neon-border group inline-flex items-center gap-2 bg-emerald text-paper px-6 py-3.5 rounded-sm font-medium hover:bg-emerald-dark hover:-translate-y-0.5 hover:shadow-lg transition-all">Book a consultation <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></a>
          <a href="/services" className="neon-border inline-flex items-center gap-2 bg-paper border border-ink/20 text-ink px-6 py-3.5 rounded-sm font-medium hover:border-ink hover:-translate-y-0.5 transition-all">View services</a>
        </div>
        {items.length > 1 && <div className="flex gap-2 mt-8" aria-label="Banner slides">{items.map((item, index) => <button key={`${item.heading}-${index}`} type="button" onClick={() => setActive(index)} aria-label={`Show banner ${index + 1}`} className={`h-1.5 transition-all ${index === active ? "w-8 bg-emerald" : "w-2 bg-line"}`} />)}</div>}
      </div>
      <div className="animate-float">
        {slide.image ? <div className="relative aspect-[4/3] overflow-hidden"><Image src={slide.image} alt={heading} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" /></div> : <div className="md:block"><div className="relative w-full max-w-[420px] mx-auto"><div className="bg-white border border-line rounded-sm shadow-[0_30px_60px_-25px_rgba(16,27,51,0.35)] p-7"><p className="font-serif text-lg text-ink">Statement of position</p><div className="space-y-4 mt-6">{[["Assets", "₹48.0L"], ["Liabilities", "₹21.0L"], ["Equity", "₹27.0L"]].map(([label, value]) => <div key={label} className="flex justify-between border-b border-line/70 pb-3 text-charcoal/75"><span>{label}</span><span className="font-mono text-ink">{value}</span></div>)}</div><span className="inline-flex mt-7 border-2 border-emerald text-emerald px-3 py-1.5 text-sm">✓ Books balanced</span></div></div></div>}
      </div>
    </div>
  </div>;
}
