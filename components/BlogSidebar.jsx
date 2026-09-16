"use client";

import { useState } from "react";
import Link from "next/link";
import { Facebook, Instagram, Linkedin, Newspaper, Twitter, Youtube } from "lucide-react";



const TABS = [
  ["popular", "Popular"],
  ["recent", "Recent"],
  ["trending", "Trending"],
];

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function PostRow({ post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="flex items-center gap-3 py-3 border-b border-line last:border-b-0 group">
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-emerald-light">
        {post.coverImage ? (
          <img src={post.coverImage} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-emerald/40"><Newspaper size={18} /></div>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-[13.5px] font-medium text-ink leading-snug line-clamp-2 group-hover:text-emerald transition-colors">{post.title}</p>
        <p className="text-[11.5px] text-charcoal/50 mt-1">{formatDate(post.createdAt)}</p>
      </div>
    </Link>
  );
}

export default function BlogSidebar({ categories = [], tags = [], popular = [], recent = [], trending = [] }) {
  const [tab, setTab] = useState("popular");
  const activePosts = { popular, recent, trending }[tab];

  return (
    <aside className="space-y-8">
    

      {categories.length > 0 && (
        <div className="bg-paper border border-line rounded-xl p-6">
          <h3 className="font-serif text-lg mb-4">Category</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <Link key={category} href={`/blog?tag=${encodeURIComponent(category)}`} className="block rounded-lg border border-line px-4 py-2.5 text-[13.5px] text-charcoal/70 hover:border-emerald hover:text-emerald transition-colors">
                {category}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="bg-paper border border-line rounded-xl p-6">
        <div className="flex items-center gap-1 mb-4 border-b border-line">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-3 py-2 text-[12.5px] font-medium uppercase tracking-wide border-b-2 -mb-px transition-colors ${
                tab === key ? "border-emerald text-emerald" : "border-transparent text-charcoal/50 hover:text-charcoal"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {activePosts.length === 0 && <p className="text-xs text-charcoal/50">Nothing here yet.</p>}
        {activePosts.map((post) => <PostRow key={post.id} post={post} />)}
      </div>

      {tags.length > 0 && (
        <div className="bg-paper border border-line rounded-xl p-6">
          <h3 className="font-serif text-lg mb-4">Tag Cloud</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`} className="rounded-full border border-line px-3.5 py-1.5 text-[12px] text-charcoal/60 hover:border-emerald hover:text-emerald transition-colors">
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
