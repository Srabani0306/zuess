"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import EnquiryForm from "@/components/EnquiryForm";

export default function ConsultationModal({ open, onClose }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return undefined;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
        >
          <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-paper w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-sm shadow-[0_40px_80px_-30px_rgba(16,27,51,0.5)] p-7 md:p-9"
            role="dialog"
            aria-modal="true"
            aria-label="Book a consultation"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-5 top-5 text-charcoal/50 hover:text-ink transition-colors"
            >
              <X size={20} />
            </button>
            <p className="text-emerald text-[13px] font-medium mb-2">Book a consultation</p>
            <h2 className="font-serif text-2xl md:text-3xl text-ink mb-6 max-w-sm">
              Tell us where your books stand today.
            </h2>
            <EnquiryForm />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
