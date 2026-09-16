"use client";

import { useState } from "react";
import Reveal from "@/components/Reveal";

const INITIAL_COUNT = 6;

export default function AssociatedBanks({ banks }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? banks : banks.slice(0, INITIAL_COUNT);

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {visible.map((bank, i) => (
          <Reveal key={bank.id} delay={i * 0.06} className="h-24 [perspective:900px]">
            <div className="relative w-full h-full transition-transform duration-500 ease-out [transform-style:preserve-3d] hover:[transform:rotateY(180deg)] hover:-translate-y-1.5">
              {/* Front: logo */}
              <div className="absolute inset-0 flex items-center justify-center bg-paper p-6 rounded-sm border border-line shadow-[0_1px_3px_rgba(16,27,51,0.08)] [backface-visibility:hidden]">
                {bank.logo ? (
                  <img src={bank.logo} alt={bank.name} className="max-h-12 max-w-full object-contain" />
                ) : (
                  <span className="text-center text-[13px] font-serif text-ink/70">{bank.name}</span>
                )}
              </div>
              {/* Back: name on a dark ground */}
              <div className="absolute inset-0 flex items-center justify-center bg-ink p-4 rounded-sm [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <span className="text-center text-[13px] font-serif text-paper">{bank.name}</span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {banks.length > INITIAL_COUNT && (
        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={() => setShowAll((value) => !value)}
            className="border border-ink/20 text-ink px-6 py-3 rounded-sm font-medium text-sm hover:border-ink transition-colors"
          >
            {showAll ? "Show less" : "Show more"}
          </button>
        </div>
      )}
    </div>
  );
}
