import Link from "next/link";
import PageHero from "@/components/PageHero";
import { getBlogPosts, getPage } from "@/lib/content";
import { ArrowUpRight, Newspaper } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Blog | Zuess" };

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

export default async function BlogIndex({ searchParams }) {
  const [allPosts, page] = await Promise.all([getBlogPosts(), getPage("blog")]);
  const cms = page?.published ? page : null;
  const activeTag = searchParams?.tag || null;
  const posts = activeTag ? allPosts.filter((post) => post.tag === activeTag) : allPosts;

  return (
    <>
      <PageHero
        eyebrow="From the desk"
        title={cms?.title || "Notes on filings, finance and running a business."}
        description={cms?.description || "Longer reads from the team on the topics that come up most in client conversations."}
      />

      <section className="py-20 md:py-28">
        <div className="container-content">
          {activeTag && (
            <div className="flex items-center gap-3 mb-8 text-sm text-charcoal/60">
              Filtering by <span className="text-emerald font-medium">{activeTag}</span>
              <Link href="/blog" className="text-emerald underline">Clear</Link>
            </div>
          )}
          {posts.length === 0 && <p className="text-charcoal/60">No posts published yet.</p>}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group relative block overflow-hidden rounded-xl border border-line bg-paper transition-all duration-300 hover:-translate-y-1 hover:border-emerald/30 hover:shadow-[0_20px_40px_-25px_rgba(16,27,51,0.3)]"
              >
                <div className="aspect-[16/10] w-full overflow-hidden bg-emerald-light">
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-emerald/40">
                      <Newspaper size={36} />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-[12.5px] text-charcoal/50 mb-3">
                    {post.tag && <span className="text-emerald font-medium">{post.tag}</span>}
                    {post.tag && <span>&middot;</span>}
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                  <h2 className="font-serif text-xl text-ink leading-snug mb-3">{post.title}</h2>
                  {post.excerpt && (
                    <p className="text-[14px] text-charcoal/65 leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink group-hover:text-emerald transition-colors">
                    Read post
                    <ArrowUpRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
