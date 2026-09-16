"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, Linkedin, Mail, Phone } from "lucide-react";

const TILE_COLORS = ["bg-rose-400", "bg-amber-400", "bg-sky-400", "bg-teal-400", "bg-orange-400", "bg-indigo-400", "bg-emerald", "bg-gold"];

function initialsOf(name) {
  return String(name || "")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function stripHtml(value) {
  return String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export default function TeamShowcase({ members }) {
  const [activeIndex, setActiveIndex] = useState(0);
  if (!members.length) return null;
  const active = members[Math.min(activeIndex, members.length - 1)];

  function go(delta) {
    setActiveIndex((current) => (current + delta + members.length) % members.length);
  }

  return (
    <section className="relative bg-ink text-paper overflow-hidden">
      <div className="absolute -left-24 -top-24 w-80 h-80 rounded-full bg-emerald/20 blur-3xl" />
      <div className="absolute -right-20 -bottom-24 w-72 h-72 rounded-full bg-gold/10 blur-3xl" />

      <div className="container-content relative py-20 md:py-28">
        <p className="text-gold text-[13px] tracking-[0.2em] uppercase mb-3">Our team</p>
        <h1 className="font-serif text-3xl md:text-5xl mb-12 leading-tight">The people you'll actually speak to.</h1>

        <div className="grid lg:grid-cols-[380px_1fr] gap-10 items-start">
          <div className="relative min-h-[420px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id || active.name}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="bg-ink-soft/70 border border-paper/10 rounded-2xl p-6"
              >
                <div className="rounded-xl overflow-hidden mb-6 aspect-[4/5] bg-paper/5 flex items-center justify-center">
                  {active.photo ? (
                    <img src={active.photo} alt={active.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-serif text-5xl text-paper/40">{active.initials || initialsOf(active.name)}</span>
                  )}
                </div>

                <p className="font-serif text-2xl text-paper">{active.name}</p>
                <p className="text-gold text-[13.5px] mt-1">{active.role}</p>
                {active.qualification && <p className="text-paper/45 text-[12px] mt-1">{active.qualification}</p>}

                <div className="w-10 h-px bg-gold/40 my-5" />

                {active.bio ? (
                  <p className="text-paper/65 text-[14px] leading-relaxed line-clamp-5">{stripHtml(active.bio)}</p>
                ) : active.focus ? (
                  <p className="text-paper/65 text-[14px] leading-relaxed">Focus: {active.focus}</p>
                ) : null}

                <div className="flex items-center gap-3 mt-6">
                  {active.phone && (
                    <a href={`tel:${active.phone}`} aria-label="Call" className="w-9 h-9 rounded-full border border-paper/20 flex items-center justify-center hover:bg-gold hover:text-ink hover:border-gold transition-colors">
                      <Phone size={15} />
                    </a>
                  )}
                  {active.email && (
                    <a href={`mailto:${active.email}`} aria-label="Email" className="w-9 h-9 rounded-full border border-paper/20 flex items-center justify-center hover:bg-gold hover:text-ink hover:border-gold transition-colors">
                      <Mail size={15} />
                    </a>
                  )}
                  {active.linkedin && (
                    <a href={active.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-9 h-9 rounded-full border border-paper/20 flex items-center justify-center hover:bg-gold hover:text-ink hover:border-gold transition-colors">
                      <Linkedin size={15} />
                    </a>
                  )}
                  {active.slug && (
                    <Link href={`/team/${active.slug}`} className="ml-auto inline-flex items-center gap-1 text-[13px] text-gold hover:text-gold-light transition-colors">
                      Full profile <ArrowUpRight size={13} />
                    </Link>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-start gap-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 flex-1">
              {members.map((member, index) => {
                const isActive = index === activeIndex;
                const color = TILE_COLORS[index % TILE_COLORS.length];
                return (
                  <button
                    key={member.id || member.name}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`group text-left rounded-xl transition-all duration-300 ${isActive ? "ring-2 ring-gold ring-offset-2 ring-offset-ink -translate-y-1" : "opacity-75 hover:opacity-100 hover:-translate-y-1"}`}
                  >
                    <div className={`aspect-square rounded-xl overflow-hidden flex items-center justify-center ${color}`}>
                      {member.photo ? (
                        <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-serif text-2xl text-ink/70">{member.initials || initialsOf(member.name)}</span>
                      )}
                    </div>
                    <p className="text-[12.5px] text-paper/80 mt-2 truncate">{member.name}</p>
                  </button>
                );
              })}
            </div>

            {members.length > 1 && (
              <div className="hidden sm:flex flex-col gap-3 pt-2 shrink-0">
                <button type="button" onClick={() => go(1)} aria-label="Next member" className="w-10 h-10 rounded-full bg-paper/10 hover:bg-gold hover:text-ink flex items-center justify-center transition-colors">
                  <ChevronRight size={16} />
                </button>
                <button type="button" onClick={() => go(-1)} aria-label="Previous member" className="w-10 h-10 rounded-full bg-paper/10 hover:bg-gold hover:text-ink flex items-center justify-center transition-colors">
                  <ChevronLeft size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
