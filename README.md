# EcoRoute

> A Levels.io-style PWA for EV charger discovery, route planning, and carbon tracking.
> Now with real driving routes, safety scoring, and mobile-first UX.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **Maps**: Leaflet + React-Leaflet (OpenStreetMap tiles)
- **Routing**: OpenRouteService (ORS) — free, open-source directions
- **Backend/Auth**: Supabase (Auth, Postgres, Realtime)
- **Payments**: Stripe Checkout + Webhooks
- **Data**: Open Charge Map API (EV chargers), CrimeoMeter API (safety), NWS API (weather)
- **Hosting**: Vercel
- **PWA**: Native manifest + service worker with cache expiration + offline fallback

## What's New in v2 (The Ultimate EcoRoute)

### Real Route Planning (ABRP-style)
- **OpenRouteService integration** — actual driving routes, not straight lines
- **Turn-by-turn instructions** with distance and duration
- **Auto-detect chargers along route** within 2km of the path
- **Carbon savings** calculated from real route distance

### Safety Layer (No competitor has this)
- **Crime risk scoring** per station via CrimeoMeter API
- **Route safety score** — samples 10 points along the route and averages crime risk
- **Night mode boost** — extra safety weighting after 6pm
- **Weather alerts** from National Weather Service along your route
- **Color-coded badges**: Safe (green), Caution (yellow), Avoid (red)

### Mobile-First UX (PlugShare-style, but cleaner)
- **Bottom sheet** for station details on mobile — draggable, snap points, swipe to close
- **Floating search bar** with Nominatim geocoding ("123 Main St" → lat/lng)
- **Skeleton loaders** — shimmer effect while stations load
- **Check-in modal** — proper form with star rating, status, photo URL (no more `alert()`)
- **PWA install prompt** — shows after 2nd visit, one-tap install
- **Touch targets** — 48px minimum, 56px for critical actions

### Features & Hardening
- **Saved favorites** — heart stations, accessible from any session
- **Trip history** — `/history` page shows all planned routes with carbon + safety scores
- **Error boundaries** — map crashes gracefully instead of white-screening
- **Stripe webhook idempotency** — duplicate events are ignored, no double-charging
- **Rate limiting** — OCM proxy limited to 30 req/min per IP
- **Service worker** — cache expiration after 1 hour, LRU eviction, offline fallback page

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
| `OCM_API_KEY` | Open Charge Map API key (free at openchargemap.org) |
| `ORS_API_KEY` | OpenRouteService API key (free at openrouteservice.org) |
| `CRIMEOMETER_API_KEY` | CrimeoMeter API key (free tier: 100 req/day) |
| `NEXT_PUBLIC_DEFAULT_CITY_LAT` | Default map center latitude |
| `NEXT_PUBLIC_DEFAULT_CITY_LNG` | Default map center longitude |
| `NEXT_PUBLIC_DEFAULT_CITY_NAME` | Default city label |

### 3. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → **New query**
3. Run `supabase/migrations/001_initial_schema.sql`
4. Run `supabase/migrations/002_favorites_trips.sql`
5. Enable **Email** provider in Authentication → Providers (Magic Link enabled by default)

### 4. Stripe Setup

1. Create an account at [stripe.com](https://stripe.com)
2. Get your test keys from Developers → API Keys
3. Create a webhook endpoint pointing to `https://your-domain.com/api/stripe-webhook`
4. Select `checkout.session.completed` event
5. Copy the webhook signing secret

### 5. API Keys (Free Tiers)

| Service | Free Tier | Signup |
|---------|-----------|--------|
| Open Charge Map | Required for API access | [openchargemap.org/site/develop#api](https://openchargemap.org/site/develop#api) |
| OpenRouteService | 500 req/day | [api.openrouteservice.org](https://api.openrouteservice.org) |
| CrimeoMeter | 100 req/day | [crimeometer.com](https://crimeometer.com) |
| NWS Weather | No key needed | Built-in |
| Nominatim (Geocoding) | No key needed | Built-in (OpenStreetMap) |

### 6. Change Default City

Edit `.env.local`:

```env
NEXT_PUBLIC_DEFAULT_CITY_LAT=37.7749
NEXT_PUBLIC_DEFAULT_CITY_LNG=-122.4194
NEXT_PUBLIC_DEFAULT_CITY_NAME=San Francisco, CA
```

### 7. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 8. Deploy to Vercel

**Option A: Dashboard**
1. Push to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Add all environment variables in Project Settings

**Option B: CLI**
```bash
npx vercel --prod
```

## Project Structure

```
app/
  ├── api/
  │   ├── crime/route.ts              # Crime risk proxy + rate limit
  │   ├── favorites/route.ts          # Save/unsave favorite stations
  │   ├── ocm/route.ts                # Open Charge Map proxy + rate limit
  │   ├── route-plan/route.ts         # ORS driving directions
  │   ├── safe-route/route.ts         # Route + crime scoring
  │   ├── stripe-checkout/route.ts    # Stripe Checkout session
  │   ├── stripe-webhook/route.ts     # Stripe webhook (idempotent)
  │   ├── trips/route.ts              # Trip history CRUD
  │   └── weather/route.ts            # NWS alerts proxy
  ├── history/
  │   └── page.tsx                    # Trip history page
  ├── map/
  │   └── page.tsx                    # Map page (ErrorBoundary wrapped)
  ├── layout.tsx                     # Root layout + PWA install prompt
  └── page.tsx                        # Landing page
components/
  ├── auth-provider.tsx               # Supabase auth context
  ├── error-boundary.tsx              # React error boundary
  ├── install-prompt.tsx              # PWA install banner
  ├── navbar.tsx                      # Top navigation
  ├── service-worker-register.tsx     # SW registration
  ├── map/
  │   ├── leaflet-map.tsx            # Main map (all features integrated)
  │   ├── map-wrapper.tsx            # SSR-safe dynamic import
  │   └── search-bar.tsx             # Geocoding search bar
  └── ui/
      ├── bottom-sheet.tsx           # Mobile bottom sheet
      ├── checkin-modal.tsx          # Check-in form modal
      ├── skeleton.tsx               # Shimmer loader
      └── star-rating.tsx            # 5-star rating input
lib/
  ├── crime.ts                        # CrimeoMeter client + risk colors
  ├── ocm.ts                          # Open Charge Map client
  ├── ors.ts                          # OpenRouteService client + polyline decoder
  ├── supabase/
  │   ├── client.ts                  # Browser Supabase client
  │   ├── server.ts                  # Server Supabase client
  │   └── middleware.ts              # Proxy auth session handler
  └── utils.ts                        # cn() helper (clsx + tailwind-merge)
public/
  ├── manifest.json                   # PWA manifest
  ├── offline.html                   # Offline fallback page
  ├── sw.js                          # Service worker (cache expiration + LRU)
  └── icon-*.svg                     # PWA icons
supabase/
  ├── migrations/
  │   ├── 001_initial_schema.sql     # profiles, checkins, trips, subscriptions
  │   └── 002_favorites_trips.sql    # favorites, trip_history
  └── functions/                      # Edge Functions (optional fallback)
      ├── stripe-checkout/index.ts
      └── stripe-webhook/index.ts
types/
  └── index.ts                       # All TypeScript types
```

## Launch Checklist

- [ ] Supabase project created + both migrations run
- [ ] Auth email provider enabled
- [ ] Stripe account created + keys added to env
- [ ] Stripe webhook configured and tested
- [ ] OCM API key obtained and added to env
- [ ] ORS API key obtained and added to env
- [ ] CrimeoMeter API key obtained and added to env
- [ ] Default city changed (if not Omaha, NE)
- [ ] `npm run build` passes
- [ ] `npm run lint` passes (only img warning acceptable)
- [ ] Test payment with Stripe test card: `4242 4242 4242 4242`
- [ ] PWA install prompt works on mobile
- [ ] Map loads with user geolocation
- [ ] Search bar geocodes addresses correctly
- [ ] Route planner draws real driving route
- [ ] Safety score appears on planned routes
- [ ] Check-in flow tested with logged-in user
- [ ] Favorites save and persist
- [ ] Trip history page shows saved trips
- [ ] Deployed to Vercel with all env vars
- [ ] Live URL shared

## Competitive Feature Matrix

| Feature | EcoRoute | PlugShare | ABRP | Google Maps |
|---------|----------|-----------|------|-------------|
| Community check-ins / photos | ✅ | ✅ | ❌ | ❌ |
| Real driving route planning | ✅ | ❌ | ✅ | ✅ |
| Auto charger detection on route | ✅ | ❌ | ✅ | ✅ |
| Carbon tracking | ✅ | ❌ | ❌ | ❌ |
| Crime / safety scoring | ✅ | ❌ | ❌ | ❌ |
| Weather alerts along route | ✅ | ❌ | ❌ | ❌ |
| Night mode safety boost | ✅ | ❌ | ❌ | ❌ |
| Saved favorites | ✅ | ✅ | ✅ | ✅ |
| Trip history | ✅ | ❌ | ❌ | ❌ |
| PWA / offline support | ✅ | ❌ | ❌ | ❌ |
| One-time payment (not subscription) | ✅ | ❌ | ❌ | ❌ |

## Monetization

- **Free**: Map browsing, charger details, community check-ins, basic route planning
- **Boost ($2.99 one-time)**: Unlimited routes, carbon dashboard, saved favorites, ad-free
- To change price: edit `unit_amount` in `app/api/stripe-checkout/route.ts` (cents)

## License

MIT — Fork it, launch it, make money.
