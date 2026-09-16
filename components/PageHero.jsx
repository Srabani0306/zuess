"use client";

import { motion } from "framer-motion";
import RichText from "@/components/RichText";

export default function PageHero({ eyebrow, title, description }) {
  return (
    <section className="relative bg-ink text-paper overflow-hidden">
      <div className="absolute -left-20 -top-20 w-72 h-72 rounded-full bg-emerald/20 blur-3xl" />
      <div className="absolute -right-16 -bottom-20 w-64 h-64 rounded-full bg-gold/10 blur-3xl" />
      <div className="container-content relative py-20 md:py-28">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-gold text-[14px] mb-4"
        >
          {eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="font-serif text-4xl md:text-6xl leading-[1.08] max-w-2xl"
        >
          {title}
        </motion.h1>
        {description && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
          >
            <RichText value={description} className="mt-6 text-paper/70 max-w-lg text-[16px] leading-relaxed" />
          </motion.div>
        )}
      </div>
    </section>
  );
}
