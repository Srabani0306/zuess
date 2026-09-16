import Link from "next/link";
import Image from "next/image";
import { Fragment } from "react";
import { ArrowUpRight } from "lucide-react";
import AnimatedCounter from "@/components/AnimatedCounter";
import { serviceGroups, process, stats, insights } from "@/lib/data";
import { getServiceVisual } from "@/lib/serviceVisuals";
import { getPage } from "@/lib/content";
import { getNavigation } from "@/lib/content";
import { getTestimonials } from "@/lib/content";
import { getBanks } from "@/lib/content";
import HomeBanner from "@/components/HomeBanner";
import { renderBlock } from "@/components/CmsPage";
import EmiCalculator from "@/components/EmiCalculator";
import AssociatedBanks from "@/components/AssociatedBanks";
import TestimonialsSlider from "@/components/TestimonialsSlider";
import Reveal from "@/components/Reveal";

export default async function Home() {
  const page = await getPage("home");
  const navigation = await getNavigation();
  const testimonials = await getTestimonials();
  const banks = await getBanks();
  const bannerSlides = page?.published && Array.isArray(page.content)
    ? page.content
        .filter((block) => block.type === "banner")
        .flatMap((block) => {
          const extraImages = Array.isArray(block.images)
            ? block.images.map((img) => (typeof img === "string" ? img : img.url || "")).filter(Boolean)
            : [];
          const images = [block.image, ...extraImages].filter(Boolean);
          if (!images.length) return [block];
          return images.map((image) => ({ ...block, image }));
        })
    : [];
  const dynamicServices = navigation.find((group) => group.slug === "services")?.items || [];
  const homeServices = dynamicServices.length
    ? dynamicServices.map((item) => ({ ...item, title: item.label, blurb: item.description || "Practical support from the Zuess team.", items: item.children?.length ? item.children : [item] }))
    : serviceGroups.map((group) => ({ ...group, items: group.items.map((item) => ({ ...item, href: `/services/${item.slug}` })) }));
  const visibleServices = homeServices.slice(0, 4);
  const servicesGridCols = { 1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4" }[visibleServices.length] || "lg:grid-cols-4";

  const statsBlock = page?.published && Array.isArray(page.content)
    ? page.content.find((block) => block.type === "stats")
    : null;

  const dynamicStats = statsBlock && Array.isArray(statsBlock.statItems) && statsBlock.statItems.length
    ? statsBlock.statItems.map((item) => ({
        value: typeof item.value === "number" ? item.value : parseInt(item.value, 10) || 0,
        suffix: item.suffix || "",
        label: item.label || "",
      }))
    : statsBlock && statsBlock.heading && statsBlock.text
    ? statsBlock.heading.split("|").map((val, idx) => {
        const label = statsBlock.text.split("|")[idx] || "";
        const match = val.trim().match(/^(\d+)(.*)$/);
        return {
          value: match ? parseInt(match[1], 10) : 0,
          suffix: match ? match[2] : "",
          label: label.trim(),
        };
      })
    : stats;

  const customBlocks = page?.published && Array.isArray(page.content)
    ? page.content.filter((block) => block.type !== "banner" && block.type !== "stats")
    : [];

  /* Legacy visual sections remain below as a design reference for future CMS blocks. */
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-light via-paper to-gold-light">
        <div className="container-content"><HomeBanner slides={bannerSlides} /></div>
      </section>

      {/* Stats strip */}
      <section className="relative bg-ink text-paper ledger-bg-dark overflow-hidden">
        <div className="absolute -left-20 -top-24 w-72 h-72 rounded-full bg-emerald/20 blur-3xl" />
        <div className="absolute -right-16 -bottom-24 w-72 h-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="container-content relative py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {dynamicStats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <p className="font-serif text-3xl md:text-4xl text-gold">
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-2 text-[13px] text-paper/60">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Services overview */}
      <section className="py-20 md:py-28">
        <div className="container-content">
          <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <p className="text-emerald text-[14px] font-medium mb-3">What we handle</p>
              <h2 className="font-serif text-3xl md:text-4xl text-ink max-w-lg">
                Four practices, one point of contact.
              </h2>
            </div>
            <Link
              href="/services"
              className="group inline-flex items-center gap-1.5 text-ink font-medium border-b border-ink/30 pb-0.5 hover:border-ink w-fit"
            >
              See all services <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Reveal>

          <div className={`grid sm:grid-cols-2 ${servicesGridCols} gap-6`}>
            {visibleServices.map((group, i) => {
              const { Icon, bg, text } = getServiceVisual(i);
              return (
                <Reveal key={group.id} delay={i * 0.08} className="group relative aspect-[3/4] overflow-hidden rounded-sm shadow-[0_1px_3px_rgba(16,27,51,0.12)] transition-shadow duration-500 hover:shadow-[0_25px_50px_-20px_rgba(16,27,51,0.4)]">
                  {group.image ? (
                    <Image src={group.image} alt={group.title} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-110" sizes="(max-width: 768px) 100vw, 25vw" />
                  ) : (
                    <div className={`absolute inset-0 flex items-center justify-center ${bg} transition-transform duration-700 ease-out group-hover:scale-110`}>
                      <Icon size={72} className={text} strokeWidth={1.1} style={{ opacity: 0.35 }} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/45 to-ink/0 transition-opacity duration-500" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-paper">
                    <p className="font-serif text-xl leading-snug">{group.title}</p>
                    <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
                      <div className="overflow-hidden">
                        <p className="text-[13.5px] text-paper/75 mt-3 leading-relaxed">{group.blurb}</p>
                        <ul className="space-y-1.5 mt-4">
                          {group.items.slice(0, 3).map((item) => (
                            <li key={item.id || item.slug} className="text-[12.5px] text-paper/70">
                              {item.label || item.name}
                            </li>
                          ))}
                        </ul>
                        <Link
                          href={group.items[0]?.href || `/services#${group.id}`}
                          className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-medium text-gold-light"
                        >
                          Details <ArrowUpRight size={12} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* EMI calculator + Process timeline */}
      <section className="bg-paper-dim py-20 md:py-28 space-y-20 md:space-y-28">
        <div className="container-content">
          <Reveal>
            <p className="text-emerald text-[14px] font-medium mb-3">Plan ahead</p>
            <h2 className="font-serif text-3xl md:text-4xl text-ink max-w-lg mb-10">
              Work out a loan EMI before you apply.
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <EmiCalculator />
          </Reveal>
        </div>

        <div className="container-content">
          <Reveal>
            <p className="text-emerald text-[14px] font-medium mb-3">How we work</p>
            <h2 className="font-serif text-3xl md:text-4xl text-ink max-w-lg mb-14">
              From first call to filed return.
            </h2>
          </Reveal>

          <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-0">
            {process.map((p, i) => (
              <Fragment key={p.step}>
                <Reveal delay={i * 0.08} className="md:flex-1 md:min-w-0">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-emerald text-paper font-mono text-[13px] mb-4">{p.step}</span>
                  <p className="font-serif text-lg text-ink mb-2">{p.title}</p>
                  <p className="text-[14px] text-charcoal/65 leading-relaxed">{p.detail}</p>
                </Reveal>
                {i < process.length - 1 && (
                  <div className="hidden md:block md:flex-[0.6] h-px bg-line mt-[18px] mx-3 overflow-hidden">
                    <div
                      className="h-full w-full origin-left bg-emerald animate-sequential-flow"
                      style={{ animationDelay: `${i * (3.6 / (process.length - 1))}s` }}
                    />
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="pt-20 pb-12 md:pt-28 md:pb-16">
          <div className="container-content">
            <Reveal>
              <p className="text-emerald text-[14px] font-medium mb-3">What our clients say</p>
              <h2 className="font-serif text-3xl md:text-4xl text-ink max-w-lg mb-10">
                Trusted with the numbers that matter to them.
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <TestimonialsSlider testimonials={testimonials} />
            </Reveal>
          </div>
        </section>
      )}

      {/* Associated banks */}
      {banks.length > 0 && (
        <section className="py-20 md:py-28 bg-paper-dim">
          <div className="container-content">
            <Reveal>
              <p className="text-emerald text-[14px] font-medium mb-3">Who we work alongside</p>
              <h2 className="font-serif text-3xl md:text-4xl text-ink max-w-lg mb-14">
                Associated banks.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <AssociatedBanks banks={banks} />
            </Reveal>
          </div>
        </section>
      )}

      {/* Insights preview */}
      <section className="pt-12 pb-20 md:pt-16 md:pb-28">
        <div className="container-content">
          <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <p className="text-emerald text-[14px] font-medium mb-3">From the desk</p>
              <h2 className="font-serif text-3xl md:text-4xl text-ink max-w-lg">
                Recent notes on filings and finance.
              </h2>
            </div>
            <Link
              href="/insights"
              className="group inline-flex items-center gap-1.5 text-ink font-medium border-b border-ink/30 pb-0.5 hover:border-ink w-fit"
            >
              All insights <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8">
            {insights.slice(0, 3).map((post, i) => (
              <Reveal key={post.title} delay={i * 0.08} as="article" className="group border-t border-line pt-5">
                <div className="flex items-center gap-3 text-[12.5px] text-charcoal/50 mb-3">
                  <span className="text-emerald font-medium">{post.tag}</span>
                  <span>&middot;</span>
                  <span>{post.date}</span>
                </div>
                <h3 className="font-serif text-lg text-ink leading-snug mb-2 transition-colors group-hover:text-emerald">{post.title}</h3>
                <p className="text-[14px] text-charcoal/65 leading-relaxed">{post.excerpt}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-emerald text-paper overflow-hidden">
        <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-gold/10 blur-3xl" />
        <Reveal className="relative container-content py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <h2 className="font-serif text-3xl md:text-4xl max-w-lg leading-tight">
            Bring your books current before the next deadline finds them.
          </h2>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 bg-paper text-ink px-6 py-3.5 rounded-sm font-medium hover:bg-gold-light hover:-translate-y-0.5 hover:shadow-lg transition-all shrink-0"
          >
            Book a consultation <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </Reveal>
      </section>

      {/* Custom sections added from the admin Pages editor */}
      {customBlocks.map((block, index) => renderBlock(block, index, homeServices))}
    </>
  );
}
