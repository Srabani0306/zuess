const SHAPES = [
  { className: "top-[-8%] left-[-6%] w-[32rem] h-[32rem] bg-emerald/25 animate-pulse-scale" },
  { className: "top-[18%] right-[-10%] w-[28rem] h-[28rem] bg-gold/25 animate-pulse-scale-slow animate-drift" },
  { className: "bottom-[-12%] left-[18%] w-[36rem] h-[36rem] bg-emerald/15 animate-pulse-scale-slow" },
  { className: "bottom-[8%] right-[8%] w-[22rem] h-[22rem] bg-gold/20 animate-pulse-scale animate-drift-slow" },
];

/* Fixed size/position/timing per bubble — deliberately not Math.random(), which would render
   differently on the server vs. the client and trigger a hydration mismatch. */
const BUBBLES = [
  { left: "4%", size: 14, duration: 16, delay: 0, tone: "bg-emerald/40" },
  { left: "12%", size: 22, duration: 21, delay: 3, tone: "bg-gold/40" },
  { left: "21%", size: 10, duration: 13, delay: 6, tone: "bg-emerald/35" },
  { left: "30%", size: 30, duration: 24, delay: 1, tone: "bg-gold/30" },
  { left: "40%", size: 16, duration: 18, delay: 8, tone: "bg-emerald/40" },
  { left: "50%", size: 12, duration: 14, delay: 4, tone: "bg-gold/35" },
  { left: "59%", size: 26, duration: 22, delay: 10, tone: "bg-emerald/30" },
  { left: "68%", size: 18, duration: 17, delay: 2, tone: "bg-gold/40" },
  { left: "77%", size: 11, duration: 15, delay: 7, tone: "bg-emerald/35" },
  { left: "85%", size: 24, duration: 20, delay: 5, tone: "bg-gold/30" },
  { left: "92%", size: 15, duration: 19, delay: 9, tone: "bg-emerald/40" },
  { left: "97%", size: 20, duration: 23, delay: 12, tone: "bg-gold/35" },
];

/**
 * Fixed, decorative-only backdrop shared by every public page (mounted once in the root
 * layout). Negative z-index keeps it behind normal-flow content; sections with their own
 * background (bg-paper, bg-ink, ...) simply paint over it, so it only shows through the
 * sections that don't set one.
 */
export default function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {SHAPES.map((shape, index) => (
        <div key={index} className={`absolute rounded-full blur-3xl ${shape.className}`} />
      ))}
      {BUBBLES.map((bubble, index) => (
        <span
          key={index}
          className={`absolute bottom-0 rounded-full ${bubble.tone} animate-bubble-rise`}
          style={{
            left: bubble.left,
            width: bubble.size,
            height: bubble.size,
            animationDuration: `${bubble.duration}s`,
            animationDelay: `${bubble.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
