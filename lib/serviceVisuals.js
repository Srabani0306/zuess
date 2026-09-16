import { Banknote, Building2, Calculator, FileText, Landmark, ScrollText, ShieldCheck, TrendingUp } from "lucide-react";

const ICONS = [Building2, Calculator, ShieldCheck, Landmark, FileText, TrendingUp, ScrollText, Banknote];

const PALETTE = [
  { bg: "bg-emerald/10", text: "text-emerald" },
  { bg: "bg-gold/15", text: "text-gold" },
];

export function getServiceVisual(index) {
  const Icon = ICONS[index % ICONS.length];
  const { bg, text } = PALETTE[index % PALETTE.length];
  return { Icon, bg, text };
}
