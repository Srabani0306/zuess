import PageHero from "@/components/PageHero";
import { insights } from "@/lib/data";
import { ArrowUpRight } from "lucide-react";
import CmsPage from "@/components/CmsPage";
import { getPage } from "@/lib/content";

export const metadata = { title: "Insights | Zuess" };

export default async function Insights() {
  const page = await getPage("insights");
  if (page?.published) return <CmsPage page={page} />;

  return (
    <>
      <PageHero
        eyebrow="From the desk"
        title="Notes on filings, finance and running a business."
        description="Short, practical write-ups from the team — the kind of thing we'd otherwise explain over a phone call."
      />

      <section className="py-20 md:py-28">
        <div className="container-content grid md:grid-cols-2 gap-x-12 gap-y-14">
          {insights.map((post) => (
            <article key={post.title} className="border-t border-line pt-6 group">
              <div className="flex items-center gap-3 text-[12.5px] text-charcoal/50 mb-4">
                <span className="text-emerald font-medium">{post.tag}</span>
                <span>&middot;</span>
                <span>{post.date}</span>
              </div>
              <h2 className="font-serif text-2xl text-ink leading-snug mb-3">{post.title}</h2>
              <p className="text-[15px] text-charcoal/65 leading-relaxed mb-4 max-w-lg">
                {post.excerpt}
              </p>
              <span className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-ink group-hover:text-emerald transition-colors">
                Read note <ArrowUpRight size={13} />
              </span>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
