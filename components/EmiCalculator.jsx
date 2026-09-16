"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

const RUPEE = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

function formatRupee(value) {
  return `₹${RUPEE.format(Math.round(value))}`;
}

function computeEmi(principal, years, annualRate) {
  const months = years * 12;
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return principal / months;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
}

const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function EmiCalculator() {
  const [amount, setAmount] = useState(500000);
  const [years, setYears] = useState(5);
  const [rate, setRate] = useState(10.5);

  const { emi, totalPayment, totalInterest, principalShare } = useMemo(() => {
    const monthlyEmi = computeEmi(amount, years, rate);
    const payment = monthlyEmi * years * 12;
    const interest = payment - amount;
    return {
      emi: monthlyEmi,
      totalPayment: payment,
      totalInterest: interest,
      principalShare: amount / payment,
    };
  }, [amount, years, rate]);

  const principalOffset = CIRCUMFERENCE * (1 - principalShare);

  return (
    <div className="bg-paper border border-line rounded-sm p-7 md:p-10 grid md:grid-cols-[1fr_auto] gap-10 items-center">
      <div className="space-y-7">
        <Slider
          label="Loan amount"
          value={amount}
          onChange={setAmount}
          min={50000}
          max={5000000}
          step={10000}
          display={formatRupee(amount)}
        />
        <Slider
          label="Loan term"
          value={years}
          onChange={setYears}
          min={1}
          max={20}
          step={1}
          display={`${years} ${years === 1 ? "year" : "years"}`}
        />
        <Slider
          label="Interest rate"
          value={rate}
          onChange={setRate}
          min={6}
          max={20}
          step={0.1}
          display={`${rate.toFixed(1)}%`}
        />

        <div className="grid grid-cols-2 gap-6 pt-2 border-t border-line">
          <div>
            <p className="text-[13px] text-charcoal/60">Total interest</p>
            <p className="font-mono tabular text-lg text-ink mt-1">{formatRupee(totalInterest)}</p>
          </div>
          <div>
            <p className="text-[13px] text-charcoal/60">Total payment</p>
            <p className="font-mono tabular text-lg text-ink mt-1">{formatRupee(totalPayment)}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-5 mx-auto">
        <div className="relative w-[180px] h-[180px]">
          <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
            <circle cx="90" cy="90" r={RADIUS} fill="none" stroke="#C0954A" strokeWidth="18" />
            <motion.circle
              cx="90"
              cy="90"
              r={RADIUS}
              fill="none"
              stroke="#1F6F54"
              strokeWidth="18"
              strokeLinecap="butt"
              strokeDasharray={CIRCUMFERENCE}
              initial={false}
              animate={{ strokeDashoffset: principalOffset }}
              transition={{ type: "spring", stiffness: 90, damping: 20 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <p className="text-[11px] uppercase tracking-[0.12em] text-charcoal/50">Monthly EMI</p>
            <p className="font-serif text-2xl text-ink mt-1 leading-tight">{formatRupee(emi)}</p>
          </div>
        </div>

        <div className="flex gap-5 text-[13px]">
          <span className="inline-flex items-center gap-1.5 text-charcoal/70">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald inline-block" /> Principal
          </span>
          <span className="inline-flex items-center gap-1.5 text-charcoal/70">
            <span className="w-2.5 h-2.5 rounded-full bg-gold inline-block" /> Interest
          </span>
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, onChange, min, max, step, display }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[14px] text-ink font-medium">{label}</span>
        <span className="font-mono tabular text-[14px] text-emerald">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(parseFloat(event.target.value))}
        className="w-full h-1.5 bg-line rounded-full appearance-none cursor-pointer accent-emerald
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-paper [&::-webkit-slider-thumb]:shadow
          [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-emerald
          [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-paper [&::-moz-range-thumb]:cursor-pointer"
      />
    </label>
  );
}
