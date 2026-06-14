import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold text-[#ededed]">Privacy Policy</h1>
      <p className="mt-2 text-sm text-[#a0a0a0]">Last updated: {new Date().toLocaleDateString()}</p>

      <section className="mt-8 space-y-6 text-sm text-[#d4d4d4]">
        <div>
          <h2 className="text-lg font-semibold text-[#ededed]">What data we collect</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[#a0a0a0]">
            <li><strong className="text-[#ededed]">Email address</strong> — used for authentication via Supabase magic links.</li>
            <li><strong className="text-[#ededed]">Location</strong> — used to display chargers on the map and plan routes. We do not store your location history.</li>
            <li><strong className="text-[#ededed]">Trip history</strong> — saved to your account so you can view past routes and carbon savings.</li>
            <li><strong className="text-[#ededed]">Check-ins</strong> — public community check-ins at charging stations (photo, status, rating, note).</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-[#ededed]">How we use it</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[#a0a0a0]">
            <li>Authentication and account management.</li>
            <li>Map display and route planning.</li>
            <li>Carbon tracking and trip history.</li>
            <li>Community features (check-ins, favorites).</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-[#ededed]">Third-party services</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[#a0a0a0]">
            <li><strong className="text-[#ededed]">Supabase</strong> — authentication, database, and storage.</li>
            <li><strong className="text-[#ededed]">Stripe</strong> — one-time payment processing for Boost unlock.</li>
            <li><strong className="text-[#ededed]">Open Charge Map</strong> — EV station data.</li>
            <li><strong className="text-[#ededed]">OpenRouteService (ORS)</strong> — route planning and directions.</li>
            <li><strong className="text-[#ededed]">National Weather Service (NWS)</strong> — weather alerts.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-[#ededed]">Cookies & localStorage</h2>
          <p className="mt-2 text-[#a0a0a0]">
            We use localStorage (not cookies) for essential app functionality:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[#a0a0a0]">
            <li>Visit counter (<code className="rounded bg-[#2a2a2a] px-1 text-[#ededed]">ecoroute_visits</code>)</li>
            <li>Dismissed banner states (<code className="rounded bg-[#2a2a2a] px-1 text-[#ededed]">ecoroute_*_dismissed</code>)</li>
            <li>Recent search history (<code className="rounded bg-[#2a2a2a] px-1 text-[#ededed]">ecoroute_recent_searches</code>)</li>
            <li>Cookie consent preference (<code className="rounded bg-[#2a2a2a] px-1 text-[#ededed]">ecoroute_cookie_consent</code>)</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-[#ededed]">Contact</h2>
          <p className="mt-2 text-[#a0a0a0]">
            Questions or concerns? Reach out at{" "}
            <a href="mailto:support@ecoroute.app" className="text-[#4CAF50] underline">
              support@ecoroute.app
            </a>.
          </p>
        </div>
      </section>

      <div className="mt-10">
        <Link href="/" className="text-sm text-[#4CAF50] underline hover:text-[#43a047]">
          &larr; Back to home
        </Link>
      </div>
    </div>
  );
}
