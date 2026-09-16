"use client";

import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";

const rows = [
  { label: "Assets", value: 48, delay: 0.2 },
  { label: "Liabilities", value: 21, delay: 0.4 },
  { label: "Equity", value: 27, delay: 0.6 },
];

export default function LedgerHero() {
  return (
    <div className="relative w-full max-w-[420px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 24, rotate: -1.5 }}
        animate={{ opacity: 1, y: 0, rotate: -1.5 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white border border-line rounded-sm shadow-[0_30px_60px_-25px_rgba(16,27,51,0.35)] p-7 ledger-bg"
      >
        <div className="flex items-baseline justify-between mb-6">
          <span className="font-serif text-lg text-ink">Statement of position</span>
          <span className="text-[11px] text-charcoal/50 font-mono">FY 2025&ndash;26</span>
        </div>

        <div className="space-y-4">
          {rows.map((row) => (
            <motion.div
              key={row.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: row.delay, duration: 0.5 }}
              className="flex items-center justify-between border-b border-line/70 pb-3"
            >
              <span className="text-[14px] text-charcoal/75">{row.label}</span>
              <span className="font-mono text-[15px] text-ink tabular">
                &#8377;<AnimatedCounter value={row.value} suffix=".0L" />
              </span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: -8 }}
          transition={{ delay: 1.1, duration: 0.4, ease: "backOut" }}
          className="mt-7 inline-flex items-center gap-2 border-2 border-emerald text-emerald px-3 py-1.5 rounded-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <motion.path
              d="M4 12.5L9.5 18L20 6"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1.3, duration: 0.5 }}
            />
          </svg>
          <span className="text-[13px] font-medium tracking-wide">Books balanced</span>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute -bottom-5 -left-5 bg-gold text-ink px-4 py-2.5 rounded-sm text-[13px] font-medium shadow-lg hidden sm:block"
      >
        Filed 6 days before deadline
      </motion.div>
    </div>
  );
}
