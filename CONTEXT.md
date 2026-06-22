# CONTEXT.md — ecoroute-next-js

## Last Updated
2026-06-21 — Project is feature-complete on frontend, ready for backend keys.

## Stack
- **Framework:** Next.js 16.2.9 (Turbopack)
- **Runtime:** React 19.2.4, TypeScript 5, Tailwind CSS v4
- **Data Viz:** Recharts 3.8.1
- **Animation:** Framer Motion 12.40.0
- **Maps:** Leaflet 1.9.4 + react-leaflet 5.0.0
- **Icons:** Lucide React
- **Auth:** Supabase SSR (@supabase/ssr 0.12.0)
- **Payments:** Stripe (@stripe/stripe-js 9.8.0, stripe 22.2.1)
- **Testing:** Vitest 4.1.9 + @testing-library/react 16.3.2

## Project Status

### COMPLETE (Working Without API Keys)
| Feature | Status | Notes |
|---------|--------|-------|
| Landing page | ✅ | Particles, stats ticker, feature cards, CTAs, animations |
| Map display | ✅ | CartoDB dark tiles, 12 demo stations, markers, bottom sheet |
| Search | ✅ | Nominatim geocoding, recent searches in localStorage |
| Filters | ✅ | Connector type, min power, distance, free-only, risk toggle |
| Weather alerts | ✅ | NOAA api.weather.gov, 15-min server cache |
| Crime heuristic | ✅ | Zero-API local computation based on distance from city center + time |
| Demo mode | ✅ | Auto-detects missing OCM key, shows sample stations |
| Sign-in modal | ✅ | Magic link (real) + Dev Login (localStorage fake) |
| Page transitions | ✅ | Framer Motion AnimatePresence |
| Toast notifications | ✅ | Success/error/info on map actions |
| 404 page | ✅ | Branded "Lost on the road?" |
| Error boundary | ✅ | "Houston, we have a problem" with reload/home buttons |
| Cookie consent | ✅ | Slide-up animation, Accept/Decline |
| Service worker | ✅ | Auto-unregisters old SWs, caches only known static assets |
| PWA icons/manifest | ✅ | All sizes generated (192, 512, apple-touch, favicon, maskable) |
| Navbar | ✅ | Logo SVG, active indicator, mobile bottom nav |

### REQUIRES REAL API KEYS
| Feature | Blocker | Where to Get Key |
|---------|---------|------------------|
| Route planning | `ORS_API_KEY` | https://openrouteservice.org/dev/#/signup (free) |
| Safe route scoring | Depends on route-plan | Same as above |
| Real charger data | `OCM_API_KEY` (optional) | https://openchargemap.org/site/develop#api |
| Auth (magic link) | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → API |
| Favorites persistence | Supabase auth + `favorites` table | Run migrations |
| Check-ins persistence | Supabase auth + `checkins` table | Run migrations |
| Trip history | Supabase auth + `trip_history` table | Run migrations |
| Stripe checkout | `STRIPE_SECRET_KEY` | https://dashboard.stripe.com/test/apikeys |
| Dashboard real data | Supabase auth + `trip_history` table | Post-MVP |

### CRASH-FIXED (Graceful Degradation)
- **Stripe checkout:** Returns HTTP 503 "Payments disabled" instead of crashing server
- **Stripe webhook:** Returns HTTP 503 instead of crashing server
- **OCM proxy:** Returns demo stations instead of 403 when key is placeholder

## File Structure (Key Files)
```
app/
  page.tsx              # Landing (particles, stats, features)
  layout.tsx            # Root layout (providers, transitions)
  map/page.tsx          # Map wrapper
  dashboard/page.tsx    # Charts + hardcoded stats
  history/page.tsx      # Trip cards (auth-gated, mock data)
  not-found.tsx         # 404 branded page
  api/
    ocm/route.ts        # Proxy + demo mode fallback
    weather/route.ts    # NOAA alerts proxy
    crime/route.ts      # Local heuristic
    route-plan/route.ts # ORS proxy (needs key)
    safe-route/route.ts # Crime scoring along route
    favorites/route.ts  # Supabase CRUD
    trips/route.ts      # Supabase CRUD
    stripe-checkout/    # Graceful 503 if no key
    stripe-webhook/     # Graceful 503 if no key

components/
  map/leaflet-map.tsx   # Main map (800+ lines, all features)
  ui/
    bottom-sheet.tsx    # Station detail sheet
    checkin-modal.tsx   # Check-in form
    star-rating.tsx     # Interactive rating
  sign-in-modal.tsx     # Auth modal with animations
  navbar.tsx            # Logo + nav + mobile nav
  page-transition.tsx   # AnimatePresence wrapper
  toast-provider.tsx    # Toast notifications
  logo.tsx              # SVG logo component

lib/
  supabase/
    client.ts           # Browser client
    server.ts           # Server client (cookies)
  ors.ts                # OpenRouteService client
  crime-heuristic.ts    # Zero-API safety scoring
  env.ts                # Runtime env validation helper

supabase/migrations/
  001_initial_schema.sql    # profiles, checkins, trips, subscriptions
  002_favorites_trips.sql   # favorites, trip_history
  003_indexes_cleanup.sql # indexes
  004_rls_policies_bones.sql # RLS + admin policies

public/
  sw.js                   # Service worker v2 (network-first, no stale chunks)
  manifest.json           # PWA manifest
  logo-*.png              # Generated icon sizes
```

## Environment Variables
See `.env.example` for full template. Critical for MVP:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://dwxulsayhrzeelkfyiqj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-real-anon-key
ORS_API_KEY=your-ors-key
OCM_API_KEY=your-ocm-key  # optional, demo mode works without
```

## How to Finish Shipping
1. **Get ORS key** (5 min) → Route planning works immediately
2. **Get Supabase keys + run migrations** (15-30 min) → Auth, favorites, trips, check-ins all work
3. **Get OCM key** (5 min, optional) → Real charger data instead of demo
4. **Stripe keys** (later) → Only when ready to monetize

## Build Commands
```bash
npm run build    # Production build (passes, 18/18 pages)
npm run dev      # Dev server (Turbopack)
npm run lint     # ESLint
```

## Conventions (learned from past sessions)
- Coding style: compact, idiomatic TypeScript
- Error handling: defensive but not verbose; graceful degradation over crashes
- UI: glassmorphism, gradient buttons, green glow shadows, Framer Motion
- Commits: conventional commits
- Auth: dual-mode (real Supabase + dev localStorage fallback)
- API routes: always rate-limit, always validate input, always return structured errors

## Devin Mind Commands
- `/reflect` — review recent work and update skills
- `/learn` — extract patterns from history
- `/search-memory <query>` — find past decisions

_Auto-generated by Devin Mind on 2026-06-21_
