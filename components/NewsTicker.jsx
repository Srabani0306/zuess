"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Megaphone } from "lucide-react";

export default function NewsTicker({ news = [] }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin") || news.length === 0) return null;

  const duration = Math.max(48, news.length * 16);

  return (
    <div className="bg-ink text-paper flex items-center overflow-hidden">
      <div className="flex items-center gap-2 shrink-0 px-4 py-2 bg-emerald text-paper text-xs font-medium uppercase tracking-[0.14em] z-10">
        <Megaphone size={14} className="animate-pulse" />
        News
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex w-max whitespace-nowrap animate-marquee-rtl" style={{ animationDuration: `${duration}s` }}>
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
              {news.map((item) =>
                item.link ? (
                  <Link key={item.id} href={item.link} tabIndex={copy === 1 ? -1 : undefined} className="px-8 text-sm text-paper/90 hover:text-gold-light transition-colors">
                    {item.title}
                  </Link>
                ) : (
                  <span key={item.id} className="px-8 text-sm text-paper/90">
                    {item.title}
                  </span>
                )
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
