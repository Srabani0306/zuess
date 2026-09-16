function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function richTextHtml(value) {
  const text = String(value || "");
  if (!text) return "";
  if (!/<[a-z][\s\S]*>/i.test(text)) return escapeHtml(text).replace(/\r?\n/g, "<br />");
  return text
    .replace(/<\/?(script|style|iframe|object|embed)[^>]*>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*(?:\"[^\"]*\"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s+(?:href|src)\s*=\s*([\"'])\s*javascript:[\s\S]*?\1/gi, "");
}

export default function RichText({ value, className = "" }) {
  const html = richTextHtml(value);
  if (!html) return null;
  return <div className={`[&_ol]:ml-5 [&_ol]:list-decimal [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:ml-5 [&_ul]:list-disc ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
