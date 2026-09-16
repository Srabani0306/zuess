import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import EnquiryForm from "@/components/EnquiryForm";
import { getServiceVisual } from "@/lib/serviceVisuals";
import { getBlockIcon } from "@/lib/blockIcons";
import RichText from "@/components/RichText";
import Reveal from "@/components/Reveal";

function cardStyleClass(style) {
  if (style === "border") return "border-2 border-emerald/25 rounded-xl p-6 md:p-9";
  if (style === "shadow") return "rounded-xl p-6 md:p-9 bg-paper shadow-[0_25px_60px_-30px_rgba(16,27,51,0.35)]";
  if (style === "3d") return "border border-line rounded-xl p-6 md:p-9 bg-paper shadow-[0_30px_70px_-30px_rgba(16,27,51,0.4)] transition-transform duration-300 hover:-translate-y-1.5";
  return "";
}

function hexToRgba(hex, alphaPct) {
  let clean = (hex || "#000000").replace("#", "");
  if (clean.length === 3) clean = clean.split("").map((c) => c + c).join("");
  const value = parseInt(clean, 16) || 0;
  const r = (value >> 16) & 255, g = (value >> 8) & 255, b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${(Number(alphaPct) || 0) / 100})`;
}

function getSectionBackground(background) {
  if (!background || !background.type || background.type === "none") return { style: undefined, overlayStyle: null };
  const style = {};
  if (background.type === "color" && background.color) {
    style.backgroundColor = background.color;
  } else if (background.type === "gradient") {
    const direction = background.gradientDirection || "to bottom right";
    style.backgroundImage = `linear-gradient(${direction}, ${background.gradientFrom || "#ffffff"}, ${background.gradientTo || "#000000"})`;
  } else if (background.type === "image" && background.image) {
    style.backgroundImage = `url(${background.image})`;
    style.backgroundSize = "cover";
    style.backgroundPosition = "center";
  }
  const overlayOpacity = Number(background.overlayOpacity) || 0;
  const overlayStyle = background.overlayColor && overlayOpacity > 0 ? { backgroundColor: hexToRgba(background.overlayColor, overlayOpacity) } : null;
  return { style, overlayStyle };
}

function SectionShell({ index, block, className = "", children }) {
  const { style, overlayStyle } = getSectionBackground(block.background);
  return (
    <section key={index} className={`relative overflow-hidden ${className}`} style={style}>
      {overlayStyle && <div className="absolute inset-0 pointer-events-none" style={overlayStyle} />}
      <div className="relative z-10">{children}</div>
    </section>
  );
}

export function renderBlock(block, index, serviceCategories) {
  const image = block.image && <div className="relative aspect-[16/8] mt-6 overflow-hidden"><Image src={block.image} alt={block.imageAlt || block.heading || "Section image"} fill className="object-cover" sizes="(max-width: 768px) 100vw, 900px" /></div>;
  if (block.type === "split") { const cardClass = cardStyleClass(block.cardStyle); return <SectionShell key={index} index={index} block={block} className="py-8 md:py-14"><div className="container-content"><div className={`grid md:grid-cols-2 gap-8 items-center ${cardClass}`}><div>{block.image && <div className="relative aspect-[4/3] overflow-hidden rounded-md"><Image src={block.image} alt={block.imageAlt || block.heading || "Section image"} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" /></div>}</div><div><p className="text-emerald text-sm font-medium mb-2.5">{block.kicker}</p><h2 className="font-serif text-3xl md:text-4xl text-ink mb-4">{block.heading}</h2><RichText value={block.text} className="text-charcoal/70 leading-relaxed max-w-xl" /></div></div></div></SectionShell>; }
  if (block.type === "quote") return <SectionShell key={index} index={index} block={block} className="bg-ink text-paper py-12 md:py-16"><div className="container-content max-w-4xl"><p className="text-gold text-sm mb-3">{block.kicker}</p><blockquote className="font-serif text-3xl md:text-5xl leading-tight">“{block.heading}”</blockquote><RichText value={block.text} className="mt-5 text-paper/65 max-w-2xl" />{block.image && <div className="relative aspect-[16/7] mt-6 overflow-hidden"><Image src={block.image} alt={block.imageAlt || block.heading || "Section image"} fill className="object-cover" sizes="100vw" /></div>}</div></SectionShell>;
  if (block.type === "stats") return <SectionShell key={index} index={index} block={block} className="bg-paper-dim py-12 md:py-14"><div className="container-content"><p className="text-emerald text-sm font-medium mb-2.5">{block.kicker}</p><h2 className="font-serif text-3xl md:text-4xl text-ink mb-3">{block.heading}</h2><RichText value={block.text} className="text-charcoal/65 max-w-xl" />{image}</div></SectionShell>;
  if (block.type === "cards") {
    const customCards = Array.isArray(block.cards) ? block.cards.filter((card) => card.title || card.description || card.image) : [];
    return <SectionShell key={index} index={index} block={block} className="py-8"><div className="container-content"><p className="text-emerald text-sm font-medium mb-2.5">{block.kicker}</p><h2 className="font-serif text-3xl md:text-4xl text-ink mb-3">{block.heading}</h2><p className="text-charcoal/65 max-w-xl">{block.text}</p>{image}
      {customCards.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {customCards.map((card, i) => <div key={i} className="bg-paper border border-line p-6" style={card.bgColor ? { backgroundColor: card.bgColor } : undefined}>
            {card.image && <div className="relative aspect-[4/3] mb-5 overflow-hidden"><Image src={card.image} alt={card.title || "Card image"} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" /></div>}
            <p className="font-serif text-xl text-ink mb-2">{card.title}</p>
            <RichText value={card.description} className="text-[14.5px] text-charcoal/65 leading-relaxed" />
          </div>)}
        </div>
      ) : (
        serviceCategories && serviceCategories.length > 0 && <div className="space-y-14 mt-10">{serviceCategories.map((group, i) => { const { Icon, bg, text } = getServiceVisual(i); return <div key={group.id} id={group.id} className="scroll-mt-28 grid md:grid-cols-[240px_1fr] gap-8 md:gap-12">
          <Reveal y={14}><span className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${bg} ${text}`}><Icon size={22} /></span><h3 className="font-serif text-2xl text-ink leading-snug mb-3">{group.title}</h3><p className="text-[14.5px] text-charcoal/65 leading-relaxed">{group.blurb}</p></Reveal>
          <div className={`grid gap-4 ${group.items.length > 1 ? "sm:grid-cols-2" : "sm:max-w-sm"}`}>{group.items.map((item, j) => <Reveal key={item.id || item.slug} delay={j * 0.08} y={14}>
            <Link href={item.href || "/contact"} className="group relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border border-line bg-paper p-6 transition-all duration-300 hover:-translate-y-1 hover:border-emerald/30 hover:shadow-[0_20px_40px_-25px_rgba(16,27,51,0.3)]">
              <span className={`absolute -right-8 -top-8 w-20 h-20 rounded-full ${bg} opacity-60 transition-transform duration-500 ease-out group-hover:scale-150`} />
              <p className="relative font-serif text-lg text-ink">{item.label || item.name}</p>
              <span className="relative inline-flex items-center gap-1 text-[13px] font-medium text-emerald">Learn more <ArrowUpRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
            </Link>
          </Reveal>)}</div>
        </div>; })}</div>
      )}
    </div></SectionShell>;
  }
  if (block.type === "features") {
    const items = Array.isArray(block.items) ? block.items.filter((item) => item.title || item.description) : [];
    const itemLayoutClass = block.layout === "rows" ? "space-y-5 mt-0 max-w-4xl mx-auto" : "grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8 mt-10";
    return <SectionShell key={index} index={index} block={block} className="py-8 md:py-16"><div className="container-content"><div className="max-w-2xl mx-auto text-center"><p className="text-emerald text-sm font-medium mb-2.5">{block.kicker}</p><h2 className="font-serif text-3xl md:text-4xl text-ink mb-3">{block.heading}</h2>{block.text && <p className="text-charcoal/65">{block.text}</p>}</div>
      {items.length > 0 && <div className={itemLayoutClass}>{items.map((item, i) => { const Icon = getBlockIcon(item.icon); return <div key={i} className={`flex gap-4 ${block.layout === "rows" ? "border-b border-line pb-3 last:border-b-0 last:pb-0" : ""}`}><span className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-full bg-emerald/10 text-emerald"><Icon size={20} /></span><div><p className="font-serif text-lg text-ink mb-1.5">{item.title}</p><RichText value={item.description} className="text-[14px] text-charcoal/65 leading-relaxed" /></div></div>; })}</div>}
    </div></SectionShell>;
  }
  if (block.type === "eligibility") {
    const items = Array.isArray(block.items) ? block.items.filter((item) => item.title || item.description) : [];
    const itemLayoutClass = block.layout === "rows" ? "space-y-3 mt-8 max-w-4xl mx-auto" : "grid sm:grid-cols-2 gap-x-8 gap-y-6 mt-10 max-w-4xl mx-auto";
    return <SectionShell key={index} index={index} block={block} className="bg-ink text-paper py-8 md:py-16"><div className="container-content"><div className="max-w-2xl mx-auto text-center"><p className="text-gold text-sm font-medium mb-2.5 uppercase tracking-[0.14em]">{block.kicker}</p><h2 className="font-serif text-3xl md:text-4xl mb-3">{block.heading}</h2>{block.text && <p className="text-paper/65">{block.text}</p>}</div>
      {items.length > 0 && <div className={itemLayoutClass}>{items.map((item, i) => { const Icon = getBlockIcon(item.icon); return <div key={i} className={`flex gap-4 ${block.layout === "rows" ? "border-b border-paper/15 pb-3 last:border-b-0 last:pb-0" : ""}`}><span className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-full bg-gold/15 text-gold"><Icon size={20} /></span><div><p className="font-serif text-lg mb-1.5">{item.title}</p><RichText value={item.description} className="text-[14px] text-paper/65 leading-relaxed" /></div></div>; })}</div>}
    </div></SectionShell>;
  }
  if (block.type === "checklist") {
    const items = Array.isArray(block.items) ? block.items.filter((item) => item.title || item.description) : [];
    return <SectionShell key={index} index={index} block={block} className="py-8 md:py-16"><div className="container-content"><div className="max-w-2xl mx-auto text-center"><p className="text-emerald text-sm font-medium mb-2.5">{block.kicker}</p><h2 className="font-serif text-3xl md:text-4xl text-ink mb-3">{block.heading}</h2>{block.text && <p className="text-charcoal/65">{block.text}</p>}</div>
      {items.length > 0 && <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">{items.map((item, i) => <div key={i} className="relative border border-line bg-paper-dim/40 p-6 overflow-hidden"><span className="absolute -top-px -right-px w-9 h-9 bg-emerald/15 flex items-center justify-center"><ArrowUpRight size={15} className="text-emerald" /></span><p className="font-serif text-lg text-ink mb-2 pr-8">{item.title}</p><RichText value={item.description} className="text-[14px] text-charcoal/65 leading-relaxed" /></div>)}</div>}
    </div></SectionShell>;
  }
  if (block.type === "faq") {
    const items = Array.isArray(block.items) ? block.items.filter((item) => item.title || item.description) : [];
    return <SectionShell key={index} index={index} block={block} className="py-8 md:py-16"><div className="container-content"><div className="max-w-2xl mx-auto text-center"><p className="text-emerald text-sm font-medium mb-2.5">{block.kicker}</p><h2 className="font-serif text-3xl md:text-4xl text-ink mb-3">{block.heading}</h2>{block.text && <p className="text-charcoal/65">{block.text}</p>}</div>
      {items.length > 0 && <div className="grid sm:grid-cols-2 gap-4 mt-10">{items.map((item, i) => <div key={i} className="border border-line bg-paper p-6"><p className="font-serif text-[15px] text-ink mb-2">{i + 1}. {item.title}</p><RichText value={item.description} className="text-[14px] text-charcoal/65 leading-relaxed" /></div>)}</div>}
    </div></SectionShell>;
  }
  if (block.type === "contact") return <SectionShell key={index} index={index} block={block} className="py-12"><div className="container-content grid md:grid-cols-[1fr_1.3fr] gap-10"><div><h2 className="font-serif text-3xl text-ink mb-3">{block.heading}</h2><RichText value={block.text} className="text-charcoal/65 leading-relaxed max-w-md" />{image}</div><div className="bg-paper-dim rounded-sm p-8"><EnquiryForm /></div></div></SectionShell>;
  const richCardClass = cardStyleClass(block.cardStyle);
  return <SectionShell key={index} index={index} block={block} className="py-12"><div className="container-content max-w-4xl"><div className={richCardClass}><p className="text-emerald text-sm font-medium mb-2.5">{block.kicker}</p><h2 className="font-serif text-3xl md:text-4xl text-ink mb-4">{block.heading}</h2><RichText value={block.text} className="text-charcoal/70 leading-relaxed max-w-2xl" />{image}{block.href && <Link href={block.href} className="inline-flex items-center gap-2 mt-6 text-emerald font-medium">Explore <ArrowUpRight size={15} /></Link>}</div></div></SectionShell>;
}

export default function CmsPage({ page, children, serviceCategories }) {
  const blocks = Array.isArray(page.content) ? page.content : [];
  const heroBanner = blocks.find((block) => block.type === "banner");
  const contentBlocks = blocks.filter((block) => block.type !== "banner");
  const heroTitle = heroBanner?.heading || page.title;
  const heroSubtitle = heroBanner?.kicker || page.subtitle;
  const heroDescription = heroBanner?.text || page.description;
  const heroImage = heroBanner?.image || page.heroImage;
  return <>
    <section className="relative bg-ink text-paper overflow-hidden">
      <div className="absolute -left-20 -top-20 w-72 h-72 rounded-full bg-emerald/20 blur-3xl" />
      <div className="absolute -right-16 -bottom-20 w-64 h-64 rounded-full bg-gold/10 blur-3xl" />
      <div className="container-content relative py-14 md:py-20 grid md:grid-cols-[1fr_0.8fr] gap-10 items-center">
        <div><p className="text-gold text-sm mb-4">{heroSubtitle}</p><h1 className="font-serif text-4xl md:text-6xl leading-[1.08] max-w-3xl">{heroTitle}</h1><RichText value={heroDescription} className="mt-6 text-paper/70 max-w-xl text-[16px] leading-relaxed" /></div>
        {heroImage && <div className="relative aspect-[4/3] overflow-hidden"><Image src={heroImage} alt={heroTitle} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" /></div>}
      </div>
    </section>
    {children}
    {contentBlocks.map((block, index) => renderBlock(block, index, serviceCategories))}
  </>;
}
