"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

export default function TestimonialsSlider({ testimonials }) {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (testimonials.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setDirection(1);
      setActive((current) => (current + 1) % testimonials.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [testimonials.length]);

  function go(index) {
    setDirection(index > active ? 1 : -1);
    setActive(index);
  }

  function prev() {
    setDirection(-1);
    setActive((current) => (current - 1 + testimonials.length) % testimonials.length);
  }

  function next() {
    setDirection(1);
    setActive((current) => (current + 1) % testimonials.length);
  }

  const item = testimonials[active];

  return (
    <div className="relative bg-ink text-paper rounded-sm overflow-hidden">
      <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-gold/10 blur-2xl" />
      <div className="absolute -left-10 -bottom-16 w-56 h-56 rounded-full bg-emerald/20 blur-2xl" />

      <div className="relative px-6 py-14 md:px-16 md:py-20">
        <Quote className="text-gold mb-6" size={40} strokeWidth={1.5} />

        <div className="relative min-h-[180px] md:min-h-[140px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={item.id}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <blockquote className="font-serif text-2xl md:text-[2rem] leading-snug max-w-2xl text-paper">
                &ldquo;{item.quote}&rdquo;
              </blockquote>

              <div className="mt-8 flex items-center gap-4">
                {item.avatar ? (
                  <img src={item.avatar} alt={item.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-gold/60 shrink-0" />
                ) : (
                  <span className="w-14 h-14 rounded-full bg-gold/15 text-gold font-serif flex items-center justify-center text-lg shrink-0 ring-2 ring-gold/40">
                    {item.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}
                  </span>
                )}
                <div>
                  <p className="font-serif text-lg text-paper">{item.name}</p>
                  {(item.role || item.company) && (
                    <p className="text-[13px] text-paper/60">
                      {[item.role, item.company].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {testimonials.length > 1 && (
          <div className="mt-10 flex items-center justify-between">
            <div className="flex gap-2" aria-label="Testimonial slides">
              {testimonials.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Show testimonial ${i + 1}`}
                  className={`h-1.5 transition-all rounded-full ${i === active ? "w-8 bg-gold" : "w-2 bg-paper/25 hover:bg-paper/40"}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous testimonial"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-paper/20 text-paper/70 hover:text-paper hover:border-paper/50 transition-colors"
              >
                <ChevronLeft size={17} />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next testimonial"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-paper/20 text-paper/70 hover:text-paper hover:border-paper/50 transition-colors"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
