import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { getPage, getNavigation } from "@/lib/content";
import CmsPage from "@/components/CmsPage";
import { serviceGroups } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ServiceDetail({ params }) {
  const cmsPage = await getPage(params.slug);
  const navigation = await getNavigation();
  const dynamicItems = navigation.find((group) => group.slug === "services")?.items || [];
  const item = dynamicItems.flatMap((entry) => [entry, ...(entry.children || [])]).find((entry) => entry.id === params.slug || entry.label.toLowerCase().replace(/[^a-z0-9]+/g, "-") === params.slug);
  const staticItem = serviceGroups.flatMap((group) => group.items.map((service) => ({ ...service, group }))).find((service) => service.slug === params.slug);
  const service = item || staticItem;
  if (cmsPage?.published) {
    const page = {
      ...cmsPage,
      subtitle: cmsPage.subtitle || "Zuess services",
      description: cmsPage.description || "",
      heroImage: cmsPage.heroImage || "",
    };
    return <CmsPage page={page} />;
  }
  if (!service && !cmsPage) notFound();
  const title = service?.label || service?.name || cmsPage?.title;
  const description = service?.description || staticItem?.group?.blurb || cmsPage?.description || "Practical support from the Zuess team, with clear scope and dependable follow-through.";
  const image = service?.image || cmsPage?.heroImage;

  return <main>
    <section className="bg-ink text-paper"><div className="container-content py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center"><div><p className="text-gold text-sm mb-4">Zuess services</p><h1 className="font-serif text-4xl md:text-6xl leading-tight">{title}</h1><p className="mt-6 text-paper/70 max-w-xl leading-relaxed">{description}</p><Link href="/contact" className="inline-flex items-center gap-2 mt-8 bg-gold text-ink px-5 py-3.5 rounded-sm font-medium">Discuss this service <ArrowUpRight size={16} /></Link></div>{image && <div className="relative aspect-[4/3] overflow-hidden"><Image src={image} alt={title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" /></div>}</div></section>
    <section className="py-20 md:py-28"><div className="container-content max-w-3xl"><p className="text-emerald text-sm font-medium mb-3">How we help</p><h2 className="font-serif text-3xl md:text-4xl text-ink mb-5">A clear next step for your business.</h2><p className="text-charcoal/70 leading-relaxed">We scope the work around your records, deadlines and decisions, then keep the process straightforward from the first conversation to the final filing.</p><Link href="/services" className="inline-flex items-center gap-2 mt-8 text-emerald font-medium">View all services <ArrowUpRight size={15} /></Link></div></section>
  </main>;
}
