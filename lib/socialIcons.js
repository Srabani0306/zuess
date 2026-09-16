import { Facebook, Instagram, Linkedin, Mail, MessageCircle, Twitter, Youtube } from "lucide-react";

export const SOCIAL_ICONS = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
  youtube: Youtube,
  whatsapp: MessageCircle,
  email: Mail,
};

export const SOCIAL_PLATFORM_OPTIONS = [
  ["facebook", "Facebook"],
  ["instagram", "Instagram"],
  ["linkedin", "LinkedIn"],
  ["twitter", "Twitter / X"],
  ["youtube", "YouTube"],
  ["whatsapp", "WhatsApp"],
  ["email", "Email"],
];

export function getSocialIcon(platform) {
  return SOCIAL_ICONS[platform] || Mail;
}
