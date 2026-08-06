export default function Hub() {
  return (
    <div className="mx-auto max-w-[960px] px-6 py-10 pb-16">
      <header className="mb-9 border-b border-[#1f232b] pb-[22px] pt-[18px]">
        <div className="text-[1.35em] font-black tracking-tight text-[#e5e7eb]">obs.aldifhr.fun</div>
        <div className="mt-1 text-[0.78em] font-semibold uppercase tracking-[0.4px] text-[#9ca3af]">
          Valorant &amp; OBS Widgets
        </div>
      </header>

      <main className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3.5">
        <a
          href="/customizer/valorant.html"
          className="block rounded-2xl border border-[#1f232b] bg-[#0f1115] p-[18px] text-white transition-all duration-150 hover:-translate-y-0.5 hover:border-white/15 hover:bg-[#14171c]"
        >
          <h3 className="mb-1.5 text-[1.05em] font-extrabold">Valorant Rank</h3>
          <p className="m-0 text-[0.85em] leading-[1.4] text-[#9ca3af]">
            Configure colors, size, background &amp; live preview, then copy the widget URL into OBS.
          </p>
        </a>
      </main>

      <footer className="mt-10 border-t border-[#1f232b] pt-[18px] text-[0.78em] font-semibold text-[#6b7280]">
        Paste a widget URL into OBS Browser Source.
      </footer>
    </div>
  );
}
