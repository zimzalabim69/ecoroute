import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold text-[#ededed]">Terms of Service</h1>
      <p className="mt-2 text-sm text-[#a0a0a0]">Last updated: {new Date().toLocaleDateString()}</p>

      <section className="mt-8 space-y-6 text-sm text-[#d4d4d4]">
        <div>
          <h2 className="text-lg font-semibold text-[#ededed]">1. Service Description</h2>
          <p className="mt-2 text-[#a0a0a0]">
            EcoRoute provides EV charging station discovery, route planning, carbon tracking, and community check-in features. The service is provided &ldquo;as is&rdquo; and may change or be discontinued at any time without notice.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-[#ededed]">2. User Conduct</h2>
          <p className="mt-2 text-[#a0a0a0]">
            You agree to use EcoRoute responsibly. Do not post abusive, misleading, or illegal content in check-ins. Do not attempt to scrape, abuse, or overload our APIs.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-[#ededed]">3. Payment Terms</h2>
          <p className="mt-2 text-[#a0a0a0]">
            The Boost upgrade is a one-time payment processed via Stripe. Prices are shown at checkout and may include applicable taxes. All sales are final.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-[#ededed]">4. Limitation of Liability</h2>
          <p className="mt-2 text-[#a0a0a0]">
            EcoRoute is not liable for inaccuracies in third-party data (charger availability, route conditions, weather alerts), or for any damages resulting from use of the service. Always verify critical information independently.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-[#ededed]">5. Contact</h2>
          <p className="mt-2 text-[#a0a0a0]">
            For questions about these terms, contact{" "}
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
