"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Menu, X, ArrowUpRight } from "lucide-react";
import { serviceGroups, featuredService } from "@/lib/data";
import ConsultationModal from "@/components/ConsultationModal";

const navLinks = [
  { name: "About", href: "/about" },
  { name: "Team", href: "/team" },
  { name: "Insights", href: "/insights" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar({ navigation = [] }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const serviceNavigation = navigation.find((group) => group.slug === "services");
  const menuGroups = serviceNavigation
    ? serviceNavigation.items.map((item) => ({
        id: item.id,
        title: item.label,
        blurb: item.description || "Explore this service",
        items: item.children?.length
          ? item.children.map((child) => ({
              slug: child.id,
              name: child.label,
              href: child.href,
              children: (child.children || []).map((sub) => ({ slug: sub.id, name: sub.label, href: sub.href })),
            }))
          : [{ slug: item.id, name: item.label, href: item.href, children: [] }],
      }))
    : serviceGroups.map((group) => ({ ...group, items: group.items.map((item) => ({ ...item, href: `/services#${group.id}`, children: [] })) }));
  const dynamicHeaderLinks = navigation
    .filter((group) => group.slug !== "services")
    .flatMap((group) => group.items.map((item) => ({ name: item.label, href: item.href })));
  const baseHeaderLinks = dynamicHeaderLinks.length ? dynamicHeaderLinks : navLinks;
  const headerLinks = baseHeaderLinks.some((link) => link.href === "/blog") ? baseHeaderLinks : [...baseHeaderLinks, { name: "Blog", href: "/blog" }];
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const closeTimer = useRef(null);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setMegaOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const open = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setMegaOpen(false), 150);
  };

  return (
    <header className="sticky top-0 z-50 bg-paper/95 backdrop-blur border-b border-line">
      <div className="container-content flex items-center justify-between h-20">
        <Link href="/" className="flex items-baseline gap-2 shrink-0" onClick={() => setMegaOpen(false)}>
          <span className="font-serif text-2xl text-ink">Zuess</span>
         
        </Link>

        <nav className="hidden lg:flex items-center gap-8" onMouseLeave={scheduleClose}>
          <div className="relative" onMouseEnter={open}>
            <button
              className="flex items-center gap-1 text-[15px] font-medium text-ink py-8 hover:text-emerald transition-colors"
              onClick={() => setMegaOpen((v) => !v)}
              aria-expanded={megaOpen}
              aria-haspopup="true"
            >
              Services
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${megaOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {megaOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="fixed left-0 right-0 top-20 border-t border-line bg-paper shadow-[0_20px_40px_-20px_rgba(16,27,51,0.25)] max-h-[calc(100vh-5rem)] overflow-y-auto"
                  onMouseEnter={open}
                  onMouseLeave={scheduleClose}
                >
                  <div className="container-content grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8 py-10">
                    {menuGroups.map((group) => (
                      <div key={group.id}>
                        <p className="font-serif text-lg text-ink mb-1">{group.title}</p>
                        <p className="text-xs text-charcoal/60 mb-4">{group.blurb}</p>
                        <ul className="space-y-3">
                          {group.items.map((item) => (
                            <li key={item.slug}>
                              <Link
                                href={item.href}
                                className="text-[14px] font-medium text-charcoal/85 hover:text-emerald transition-colors"
                                onClick={() => setMegaOpen(false)}
                              >
                                {item.name}
                              </Link>
                              {item.children?.length > 0 && (
                                <ul className="ml-3 mt-1.5 space-y-1.5 border-l border-line pl-3">
                                  {item.children.map((child) => (
                                    <li key={child.slug}>
                                      <Link
                                        href={child.href}
                                        className="text-[13px] text-charcoal/65 hover:text-emerald transition-colors"
                                        onClick={() => setMegaOpen(false)}
                                      >
                                        {child.name}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}

                    <div className="bg-ink rounded-sm p-6 flex flex-col justify-between">
                      <div>
                        <span className="inline-block text-[11px] tracking-wide text-gold-light/70 mb-3">
                          Featured
                        </span>
                        <p className="font-serif text-xl text-paper leading-snug mb-2">
                          {featuredService.title}
                        </p>
                        <p className="text-[13px] text-paper/70 leading-relaxed">
                          {featuredService.description}
                        </p>
                      </div>
                      <Link
                        href={featuredService.href}
                        onClick={() => setMegaOpen(false)}
                        className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-gold hover:text-gold-light transition-colors"
                      >
                        Learn more <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {headerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[15px] font-medium text-ink hover:text-emerald transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <button
            type="button"
            onClick={() => setBookingOpen(true)}
            className="inline-flex items-center gap-1.5 bg-emerald text-paper text-[14px] font-medium px-5 py-2.5 rounded-sm hover:bg-emerald-dark transition-colors"
          >
            Book a consultation
          </button>
        </div>

        <button
          className="lg:hidden text-ink"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="lg:hidden overflow-hidden border-t border-line bg-paper"
          >
            <div className="container-content py-5 flex flex-col gap-1">
              <button
                className="flex items-center justify-between py-3 text-ink font-medium"
                onClick={() => setMobileServicesOpen((v) => !v)}
              >
                Services
                <ChevronDown
                  size={18}
                  className={`transition-transform ${mobileServicesOpen ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {mobileServicesOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden pl-3 flex flex-col gap-4 pb-3"
                  >
                    {menuGroups.map((group) => (
                      <div key={group.id}>
                        <p className="text-sm font-medium text-emerald mb-1.5">{group.title}</p>
                        <ul className="space-y-1.5">
                          {group.items.map((item) => (
                            <li key={item.slug}>
                              <Link
                                href={item.href}
                                className="text-[14px] text-charcoal/80"
                                onClick={() => setMobileOpen(false)}
                              >
                                {item.name}
                              </Link>
                              {item.children?.length > 0 && (
                                <ul className="ml-3 mt-1.5 space-y-1 border-l border-line pl-3">
                                  {item.children.map((child) => (
                                    <li key={child.slug}>
                                      <Link
                                        href={child.href}
                                        className="text-[13px] text-charcoal/60"
                                        onClick={() => setMobileOpen(false)}
                                      >
                                        {child.name}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {headerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="py-3 text-ink font-medium border-t border-line/70"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              <button
                type="button"
                onClick={() => { setMobileOpen(false); setBookingOpen(true); }}
                className="mt-3 text-center bg-emerald text-paper font-medium px-5 py-3 rounded-sm"
              >
                Book a consultation
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConsultationModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </header>
  );
}
