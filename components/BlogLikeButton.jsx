"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

export default function BlogLikeButton({ slug, initialLikeCount = 0 }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialLikeCount);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/blog/${slug}/like`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) {
          setLiked(Boolean(data.liked));
          setCount(data.likeCount);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [slug]);

  async function toggleLike() {
    if (busy) return;
    setBusy(true);
    const previousLiked = liked;
    const previousCount = count;
    setLiked(!previousLiked);
    setCount(previousLiked ? previousCount - 1 : previousCount + 1);
    try {
      const response = await fetch(`/api/blog/${slug}/like`, { method: "POST" });
      if (!response.ok) throw new Error("Request failed");
      const data = await response.json();
      setLiked(Boolean(data.liked));
      setCount(data.likeCount);
    } catch {
      setLiked(previousLiked);
      setCount(previousCount);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleLike}
      disabled={busy}
      aria-pressed={liked}
      className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors ${
        liked ? "border-emerald bg-emerald text-paper" : "border-line text-charcoal/70 hover:border-emerald hover:text-emerald"
      }`}
    >
      <Heart size={16} fill={liked ? "currentColor" : "none"} />
      {liked ? "Liked" : "Like"}
      <span className="tabular-nums">{count}</span>
    </button>
  );
}
