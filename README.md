# EcoRoute

> A Levels.io-style PWA for EV charger discovery, route planning, and carbon tracking.
> Built for broke solo founders who need to ship fast and monetize faster.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **Maps**: Leaflet + React-Leaflet (OpenStreetMap tiles)
- **Backend/Auth**: Supabase (Auth, Postgres, Realtime)
- **Payments**: Stripe Checkout + Webhooks
- **Data**: Open Charge Map API (free tier)
- **Hosting**: Vercel
- **PWA**: Native manifest + service worker

## Features

- **Landing Page**: Hero, value prop, testimonials, pricing
- **Map**: Full-screen Leaflet with live EV charger data
- **Filters**: Connector type, speed (kW), free/paid, distance
- **Check-ins**: Logged-in users update station status + rating
- **Route Planner**: Two-point input with nearest chargers + carbon saved
- **Carbon Dashboard**: Real-time CO₂ savings per trip
- **Auth**: Supabase magic link
- **Monetization**: One-time `$2.99` Boost unlocks routes + carbon reports
- **PWA**: Offline map tiles + station cache, installable

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/your-username/ecoroute.git
cd ecoroute
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook endpoint secret |
| `NEXT_PUBLIC_DEFAULT_CITY_LAT` | Default map center latitude |
| `NEXT_PUBLIC_DEFAULT_CITY_LNG` | Default map center longitude |
| `NEXT_PUBLIC_DEFAULT_CITY_NAME` | Default city label |

### 3. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → **New query**
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Run the query
5. Enable **Email** provider in Authentication → Providers (Magic Link is enabled by default)

### 4. Stripe Setup

1. Create an account at [stripe.com](https://stripe.com)
2. Get your test keys from Developers → API Keys
3. Create a product + price for a one-time `$2.99` payment, or use the dynamic price creation in `/api/stripe-checkout`
4. Create a webhook endpoint pointing to `https://your-domain.com/api/stripe-webhook`
5. Select `checkout.session.completed` event
6. Copy the webhook signing secret

### 5. Change Default City

Edit `.env.local`:

```env
NEXT_PUBLIC_DEFAULT_CITY_LAT=37.7749
NEXT_PUBLIC_DEFAULT_CITY_LNG=-122.4194
NEXT_PUBLIC_DEFAULT_CITY_NAME=San Francisco, CA
```

### 6. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 7. Deploy to Vercel

**Option A: Dashboard**
1. Push to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Add environment variables in Project Settings

**Option B: CLI**
```bash
npx vercel
```

## Project Structure

```
app/
  ├── api/
  │   ├── stripe-checkout/route.ts   # Stripe Checkout session
  │   └── stripe-webhook/route.ts    # Stripe webhook handler
  ├── map/
  │   └── page.tsx                   # Map page (dynamic Leaflet)
  ├── layout.tsx                     # Root layout + auth provider
  └── page.tsx                       # Landing page
components/
  ├── auth-provider.tsx              # Supabase auth context
  ├── navbar.tsx                     # Top navigation
  ├── service-worker-register.tsx    # PWA SW registration
  └── map/
      ├── leaflet-map.tsx            # Main map + filters + planner
      └── map-wrapper.tsx            # SSR-safe dynamic import
lib/
  ├── ocm.ts                         # Open Charge Map API client
  └── supabase/
      ├── client.ts                  # Browser Supabase client
      ├── server.ts                  # Server Supabase client
      └── middleware.ts            # Proxy auth session handler
public/
  ├── manifest.json                  # PWA manifest
  ├── sw.js                          # Service worker
  └── icon-*.svg                     # PWA icons
supabase/
  ├── migrations/001_initial_schema.sql
  └── functions/                     # Edge Functions (optional)
      ├── stripe-checkout/index.ts
      └── stripe-webhook/index.ts
types/
  └── index.ts                       # Shared TypeScript types
```

## Launch Checklist

- [ ] Supabase project created + schema migrated
- [ ] Auth email provider enabled
- [ ] Stripe account created + keys added to env
- [ ] Stripe webhook configured and tested
- [ ] Default city changed (if not Omaha, NE)
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Test payment with Stripe test card: `4242 4242 4242 4242`
- [ ] PWA install prompt works on mobile
- [ ] Map loads correctly with user geolocation
- [ ] Check-in flow tested with logged-in user
- [ ] Deployed to Vercel with all env vars
- [ ] Live URL shared

## Monetization Notes

- **Free tier**: Map browsing, charger details, community check-ins
- **Boost ($2.99 one-time)**: Route planner, carbon dashboard, saved favorites, ad-free
- To change price: edit `unit_amount` in `app/api/stripe-checkout/route.ts` (cents)

## License

MIT — Fork it, launch it, make money.
