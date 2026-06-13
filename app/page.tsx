import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-4 py-24 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1e1e1e]/40 to-transparent" />
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#ededed] sm:text-6xl">
            Charge smarter.
            <br />
            <span className="text-[#4CAF50]">Drive cleaner.</span>
          </h1>
          <p className="mt-6 text-lg text-[#a0a0a0]">
            EcoRoute finds the best EV chargers near you, plans your route,
            and tracks every kilogram of CO₂ you save.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/map"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-[#4CAF50] px-8 py-3 text-base font-semibold text-[#121212] shadow-lg transition hover:bg-[#43a047]"
            >
              Try the Map
            </Link>
            <span className="text-sm text-[#737373]">Free. No credit card.</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Find Chargers",
              body: "Hyperlocal EV stations with real-time filters for speed, connector, and price.",
            },
            {
              title: "Plan Routes",
              body: "Two-tap route planner with nearest chargers along the way and carbon estimates.",
            },
            {
              title: "Track Carbon",
              body: "See exactly how much CO₂ you save on every trip. Small wins, big planet.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-[#2a2a2a] bg-[#1e1e1e] p-6 transition hover:border-[#4CAF50]/30"
            >
              <h3 className="text-lg font-semibold text-[#ededed]">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#a0a0a0]">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-[#ededed]">
          What drivers are saying
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            {
              quote: "Finally an EV app that doesn't feel like a spreadsheet. Beautiful and fast.",
              author: "Alex M.",
              role: "Tesla Model 3 Owner",
            },
            {
              quote: "The carbon tracker actually motivated me to drive EV more often. Love it.",
              author: "Jordan K.",
              role: "Leaf Driver",
            },
            {
              quote: "Found a free charger 2 blocks away I never knew existed. Game changer.",
              author: "Sam T.",
              role: "Bolt EUV Owner",
            },
          ].map((t) => (
            <div
              key={t.author}
              className="rounded-2xl border border-[#2a2a2a] bg-[#1e1e1e] p-6"
            >
              <p className="text-sm italic text-[#d4d4d4]">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-4">
                <p className="text-sm font-medium text-[#ededed]">{t.author}</p>
                <p className="text-xs text-[#737373]">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto w-full max-w-4xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-[#ededed]">
          Simple pricing
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#1e1e1e] p-8">
            <h3 className="text-xl font-semibold text-[#ededed]">Free</h3>
            <p className="mt-2 text-sm text-[#a0a0a0]">
              Browse the map, view chargers, and see basic details.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-[#d4d4d4]">
              <li className="flex items-center gap-2">
                <span className="text-[#4CAF50]">&#10003;</span> Map + charger lookup
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#4CAF50]">&#10003;</span> Basic filters
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#4CAF50]">&#10003;</span> Community check-ins
              </li>
            </ul>
            <Link
              href="/map"
              className="mt-8 inline-flex w-full min-h-[48px] items-center justify-center rounded-xl border border-[#2a2a2a] px-4 py-2 text-sm font-medium text-[#ededed] transition hover:bg-[#2a2a2a]"
            >
              Get Started
            </Link>
          </div>

          <div className="relative rounded-2xl border border-[#4CAF50]/40 bg-[#1e1e1e] p-8">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#4CAF50] px-3 py-1 text-xs font-bold text-[#121212]">
              MOST POPULAR
            </div>
            <h3 className="text-xl font-semibold text-[#ededed]">Boost</h3>
            <p className="mt-2 text-3xl font-bold text-[#4CAF50]">
              $2.99
              <span className="text-sm font-normal text-[#a0a0a0]"> one-time</span>
            </p>
            <p className="mt-2 text-sm text-[#a0a0a0]">
              Unlock route planning, carbon reports, and saved favorites.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-[#d4d4d4]">
              <li className="flex items-center gap-2">
                <span className="text-[#4CAF50]">&#10003;</span> Unlimited route planning
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#4CAF50]">&#10003;</span> Carbon savings dashboard
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#4CAF50]">&#10003;</span> Save favorite stations
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#4CAF50]">&#10003;</span> Ad-free experience
              </li>
            </ul>
            <Link
              href="/map?boost=checkout"
              className="mt-8 inline-flex w-full min-h-[48px] items-center justify-center rounded-xl bg-[#4CAF50] px-4 py-2 text-sm font-bold text-[#121212] transition hover:bg-[#43a047]"
            >
              Unlock Boost
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#2a2a2a] py-8 text-center text-sm text-[#737373]">
        EcoRoute &copy; {new Date().getFullYear()} — Built for EV drivers.
      </footer>
    </div>
  );
}
