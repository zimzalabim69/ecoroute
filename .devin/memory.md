# EcoRoute Project Memory

## Overview
- **Name**: EcoRoute
- **Stack**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Leaflet, Supabase, Stripe
- **Default City**: Omaha, NE (lat: 41.2565, lng: -95.9345)
- **Monetization**: One-time $2.99 Boost via Stripe Checkout
- **PWA**: Native manifest + service worker (no next-pwa)

## Architecture Decisions
- **Dark mode default**: #121212 bg, #1E1E1E cards, green accents #4CAF50
- **Leaflet SSR-safe**: Always dynamic import with { ssr: false }
- **OCM API**: Client-side calls (CORS ok), cached in SW
- **Route Planner**: Straight-line + nearest chargers (no paid Directions API)
- **Auth**: Supabase magic link only (no social for v1)
- **Stripe**: One-time payment, Edge Functions for checkout + webhook

## Directory Structure
- pp/ — Next.js App Router pages
- components/ — React components
- lib/supabase/ — Supabase clients
- 	ypes/ — Shared TypeScript types
- public/sw.js — Service worker
- public/manifest.json — PWA manifest

## Environment Variables
See .env.example for full list.

## Current Deployment Status

| Phase | Status | Blocker | Notes |
|-------|--------|---------|-------|
| **Step 0: Pre-flight** | PASS | None | Build PASS, Lint PASS (1 warning), CLIs installed |
| **Step 1: Supabase** | IN PROGRESS | CLI login required | Project created (`dwxulsayhrzeelkfyiqj`). Migrations ready. Need `supabase login` + `supabase link` + `supabase db push`. |
| **Step 2: Vercel** | BLOCKED | CLI login required | Need `vercel login` + `vercel link` + preview deploy. |
| **Step 3: Stripe** | NOT STARTED | CLI login + test account | Need `stripe login` (shell restart) + test product + webhook. |
| **Step 4: Post-launch** | NOT STARTED | Blocked on Phase 2/3 | Smoke test pending. |

**Supabase Project**: `dwxulsayhrzeelkfyiqj`  
**Supabase URL**: `https://dwxulsayhrzeelkfyiqj.supabase.co`  
**Next action**: Run `supabase login` and `vercel login` in your terminal (browser OAuth required). Then I can resume autonomous deployment.

---

## Deployment Checklist (Supabase + Vercel + Stripe)

### Phase 1: Supabase Infrastructure
- [x] Create Supabase project at `supabase.com` (ref: `dwxulsayhrzeelkfyiqj`)
- [ ] Run schema migrations (`supabase db push`)
- [x] Enable Row Level Security (RLS) on all tables (defined in migrations)
- [ ] Verify Edge Functions deploy: `supabase functions deploy`
- [ ] Set Supabase env vars in Vercel (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)

### Phase 2: Vercel Deploy
- [ ] Link project: `vercel link`
- [ ] Set all env vars from `.env.example`
- [ ] Deploy preview: `vercel`
- [ ] Deploy production: `vercel --prod`
- [ ] Verify PWA manifest loads (`/manifest.json`)
- [ ] Verify service worker registers (`/sw.js`)
- [ ] Run Lighthouse audit (target: 90+ all categories)

### Phase 3: Stripe Integration
- [ ] Create Stripe test product + price for $2.99 Boost
- [ ] Set STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in Vercel
- [ ] Configure Stripe webhook endpoint: `https://<domain>/api/stripe/webhook`
- [ ] Set webhook signing secret in env vars
- [ ] Test checkout flow in Stripe Test Mode
- [ ] Switch to Live Mode and verify real payment works

### Phase 4: Post-Launch
- [ ] Enable Supabase backups
- [ ] Set up Vercel Analytics
- [ ] Configure Stripe email receipts
- [ ] Verify auth flow (magic link) works in production
- [ ] Run end-to-end smoke test: sign up → plan route → purchase Boost → receive email

## EcoRoute Deployment Ritual

> Step-by-step with exact CLI commands, env checks, and rollback notes.
> Run this ritual when you are ready to deploy EcoRoute to production.
> Prerequisites: `supabase` CLI, `vercel` CLI, `stripe` CLI all installed and authenticated.

---

### Step 0: Pre-Flight Checks

```powershell
# Verify all CLIs are available
supabase --version    # Should print version (e.g., 2.106.0)
vercel --version      # Should print version (e.g., 54.14.0)
stripe --version      # Should print version (e.g., 1.42.13)

# Verify .env.local exists and is NOT committed
cd 'C:\Users\sikke\Projects\web\ecoroute (Next.js)'
if (Test-Path .env.local) { Write-Output ".env.local OK" } else { Write-Output "FAIL: .env.local missing" }
git check-ignore .env.local  # Should print .env.local
```

**Rollback**: If any CLI missing, install:
- `npm install -g supabase`
- `npm install -g vercel`
- `winget install Stripe.StripeCLI` (then restart shell)

---

### Step 1: Supabase Project + Schema

```powershell
cd 'C:\Users\sikke\Projects\web\ecoroute (Next.js)'

# Login (if not already)
supabase login

# Create project (or link existing)
supabase projects create --org-id <your-org-id> --region us-east-1 --plan free
# OR link existing:
supabase link --project-ref <project-ref>

# Push local schema to production
supabase db push

# Verify Edge Functions
cd supabase/functions
supabase functions deploy
```

**Env vars to capture**:
- `NEXT_PUBLIC_SUPABASE_URL` → Project Settings → API → URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Project Settings → API → `anon` public key
- `SUPABASE_SERVICE_ROLE_KEY` → Project Settings → API → `service_role` secret key (NEVER client-side)

**Rollback**: `supabase db reset` reverts to local seed. For prod: restore from backup (enable backups first).

---

### Step 2: Vercel Project Link + Env

```powershell
cd 'C:\Users\sikke\Projects\web\ecoroute (Next.js)'

# Login (if not already)
vercel login

# Link project (creates if new)
vercel link

# Set env vars one by one (or use --yes for non-interactive)
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add STRIPE_SECRET_KEY          # Step 3
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  # Step 3
vercel env add STRIPE_WEBHOOK_SECRET      # Step 3

# Deploy preview first
vercel

# Deploy production
vercel --prod
```

**Verify after deploy**:
- `https://<your-domain>/manifest.json` loads
- `https://<your-domain>/sw.js` registers (check DevTools → Application → Service Workers)
- Lighthouse audit: open DevTools → Lighthouse → run on mobile/desktop

**Rollback**: `vercel --rollback` instantly reverts to previous deployment.

---

### Step 3: Stripe Integration

```powershell
# Login
stripe login

# Create product + price (or do via Stripe Dashboard)
stripe products create --name "EcoRoute Boost" --description "One-time route boost"
# Capture product ID and price ID from output

# Set webhook endpoint
stripe webhook_endpoints create --url "https://<your-domain>/api/stripe/webhook" --enabled-events "checkout.session.completed"
# Capture webhook signing secret from output
```

**Env vars to set in Vercel**:
- `STRIPE_SECRET_KEY` → `sk_test_...` or `sk_live_...`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → `pk_test_...` or `pk_live_...`
- `STRIPE_WEBHOOK_SECRET` → `whsec_...`

**Test mode checklist**:
- [ ] Open app → Plan route → Tap Boost → Stripe Checkout loads in test mode
- [ ] Use test card `4242 4242 4242 4242`, any future date, any CVC
- [ ] Verify webhook fires (check Stripe Dashboard → Developers → Webhooks → recent events)
- [ ] Verify user receives Boost in app

**Live mode checklist**:
- [ ] Switch Stripe keys to `pk_live_...` / `sk_live_...`
- [ ] Switch webhook endpoint to live mode
- [ ] Real $2.99 charge (use your own card to test)
- [ ] Verify receipt email

**Rollback**: Switch env vars back to test keys. `vercel --prod` redeploys with old config.

---

### Step 4: Post-Launch Smoke Test

```powershell
# End-to-end verification script (manual)
# 1. Open production URL in incognito window
# 2. Sign up with email (magic link)
# 3. Plan a route (Omaha → Lincoln)
# 4. Purchase Boost ($2.99)
# 5. Verify email receipt
# 6. Check Supabase Dashboard → Table Editor → confirm row created
# 7. Check Stripe Dashboard → confirm payment received
```

**Monitoring**:
- [ ] Enable Supabase backups (Database → Backups)
- [ ] Enable Vercel Analytics (Project → Analytics)
- [ ] Set up Stripe email receipts (Settings → Emails)

**Rollback**: Full rollback = `vercel --rollback` + revert Supabase schema via migration down.

---

## Last Updated
2026-06-14
