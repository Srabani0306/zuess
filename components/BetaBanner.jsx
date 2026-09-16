export default function BetaBanner() {
  return (
    <div className="bg-ink text-paper text-center text-[12px] sm:text-[13px] py-2 px-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 border-b border-gold/30">
      <span className="flex items-center gap-1.5 shrink-0">
        <span className="w-2 h-2 rounded-full bg-gold animate-blink" />
        <span className="font-semibold text-gold uppercase tracking-wide">Beta</span>
      </span>
      <span className="text-paper/75">
        This website is currently in beta testing. Some features may be under development.
      </span>
    </div>
  );
}
