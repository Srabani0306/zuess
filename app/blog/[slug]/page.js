import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import RichText from "@/components/RichText";
import BlogLikeButton from "@/components/BlogLikeButton";
import BlogSidebar from "@/components/BlogSidebar";
import { getBlogPost, getBlogTags, getPopularBlogPosts, getRecentBlogPosts, getTrendingBlogPosts } from "@/lib/content";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const post = await getBlogPost(params.slug);
  return { title: post ? `${post.title} | Zuess Blog` : "Blog | Zuess" };
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" });
}

function readingTime(content) {
  const words = String(content || "").replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function BlogPostPage({ params }) {
  const post = await getBlogPost(params.slug);
  if (!post) notFound();

  const [tags, popular, recent, trending] = await Promise.all([
    getBlogTags(),
    getPopularBlogPosts(5),
    getRecentBlogPosts(5),
    getTrendingBlogPosts(5),
  ]);
  const exclude = (rows) => rows.filter((row) => row.id !== post.id).slice(0, 4);
  const categories = [...new Set([post.tag, ...tags].filter(Boolean))];

  return (
    <>
      <PageHero
        eyebrow={post.tag || "Blog"}
        title={post.title}
        description={[post.author, formatDate(post.createdAt)].filter(Boolean).join(" · ")}
      />

      <section className="py-16 md:py-20">
        <div className="container-content">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-emerald mb-8">
            <ArrowLeft size={14} /> Back to blog
          </Link>

          <div className="grid lg:grid-cols-[1fr_320px] gap-12 items-start">
            <article className="min-w-0">
              {post.tag && (
                <span className="inline-block rounded-full bg-gold-light text-gold px-3 py-1 text-[11px] font-semibold uppercase tracking-wide mb-4">
                  {post.tag}
                </span>
              )}
              <h1 className="font-serif text-3xl md:text-4xl text-ink leading-tight mb-4">{post.title}</h1>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-charcoal/55 mb-8 pb-6 border-b border-line">
                {post.author && (
                  <span className="inline-flex items-center gap-1.5"><User size={14} /> By {post.author}</span>
                )}
                <span className="inline-flex items-center gap-1.5"><Calendar size={14} /> {formatDate(post.createdAt)}</span>
                <span className="inline-flex items-center gap-1.5"><Clock size={14} /> {readingTime(post.content)} min read</span>
              </div>

              {post.coverImage && (
                <img
                  src={post.coverImage}
                  alt=""
                  className="w-full max-h-[420px] object-cover rounded-xl border border-line mb-10"
                />
              )}

              {post.excerpt && (
                <blockquote className="border-l-4 border-emerald bg-emerald-light/60 rounded-r-lg px-6 py-5 my-8 font-serif text-lg italic text-ink/80 leading-relaxed">
                  {post.excerpt}
                </blockquote>
              )}

              <RichText value={post.content} className="text-[16px] text-charcoal/80 leading-relaxed" />

              {post.images.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-4 mt-10">
                  {post.images.map((image) => (
                    <div key={image.id} className="overflow-hidden rounded-xl border border-line aspect-[4/3]">
                      <img src={image.url} alt={image.alt || ""} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-10 pt-8 border-t border-line">
                <BlogLikeButton slug={post.slug} initialLikeCount={post.likeCount} />
              </div>
            </article>

            <BlogSidebar
              categories={categories}
              tags={tags}
              popular={exclude(popular)}
              recent={exclude(recent)}
              trending={exclude(trending)}
            />
          </div>
        </div>
      </section>
    </>
  );
}
