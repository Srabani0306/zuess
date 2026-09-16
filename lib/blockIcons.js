import { AlertCircle, BadgeCheck, Calendar, CheckCircle2, Clock, CreditCard, FileText, IndianRupee, ShieldCheck, Users } from "lucide-react";

export const BLOCK_ICONS = {
  check: CheckCircle2,
  shield: ShieldCheck,
  badge: BadgeCheck,
  file: FileText,
  calendar: Calendar,
  rupee: IndianRupee,
  card: CreditCard,
  clock: Clock,
  users: Users,
  alert: AlertCircle,
};

export const BLOCK_ICON_OPTIONS = [
  ["check", "Check"],
  ["shield", "Shield"],
  ["badge", "Badge"],
  ["file", "Document"],
  ["calendar", "Calendar"],
  ["rupee", "Rupee"],
  ["card", "Card"],
  ["clock", "Clock"],
  ["users", "Users"],
  ["alert", "Alert"],
];

export function getBlockIcon(key) {
  return BLOCK_ICONS[key] || CheckCircle2;
}
