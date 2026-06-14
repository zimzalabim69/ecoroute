# EcoRoute Deployment Commands (BONES ONLY)

> All commands are commented out or marked with `[BONES: DO NOT RUN YET]`.
> Activate by removing comment markers after CLI auth is complete.
> Source of truth: `.devin/memory.md` EcoRoute Deployment Ritual

---

## Step 0: Pre-Flight (Run Now — Safe)

```powershell
cd 'C:\Users\sikke\Projects\web\ecoroute (Next.js)'

# Verify CLIs
supabase --version    # Expected: 2.106.0+
vercel --version      # Expected: 54.14.0+
stripe --version      # Expected: 1.42.13+ (restart shell if not found)

# Verify build
npm run build         # Must pass
npm run lint          # Must pass (0 errors)

# Verify .env.local exists and is ignored
git check-ignore .env.local  # Should output: .env.local
```

---

## Step 1: Supabase (BONES — Activate After `supabase login`)

```powershell
# [BONES: UNCOMMENT AFTER LOGIN] supabase login
# [BONES: UNCOMMENT AFTER LOGIN] supabase link --project-ref dwxulsayhrzeelkfyiqj
# [BONES: UNCOMMENT AFTER LOGIN] supabase db push
# [BONES: UNCOMMENT AFTER LOGIN] supabase functions deploy

# After push, capture these from Supabase Dashboard → Settings → API:
#   NEXT_PUBLIC_SUPABASE_URL=https://dwxulsayhrzeelkfyiqj.supabase.co
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
#   SUPABASE_SERVICE_ROLE_KEY=<service-role-secret-key>
```

**Rollback**: `supabase db reset` (local) or restore from backup (prod).

---

## Step 2: Vercel (BONES — Activate After `vercel login`)

```powershell
# [BONES: UNCOMMENT AFTER LOGIN] vercel login
# [BONES: UNCOMMENT AFTER LOGIN] vercel link

# Set env vars (run one by one, paste values when prompted):
# [BONES: UNCOMMENT AFTER LOGIN] vercel env add NEXT_PUBLIC_SUPABASE_URL
# [BONES: UNCOMMENT AFTER LOGIN] vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# [BONES: UNCOMMENT AFTER LOGIN] vercel env add SUPABASE_SERVICE_ROLE_KEY
# [BONES: UNCOMMENT AFTER LOGIN] vercel env add STRIPE_SECRET_KEY
# [BONES: UNCOMMENT AFTER LOGIN] vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# [BONES: UNCOMMENT AFTER LOGIN] vercel env add STRIPE_WEBHOOK_SECRET

# Deploy preview first:
# [BONES: UNCOMMENT AFTER LOGIN] vercel

# Deploy production:
# [BONES: UNCOMMENT AFTER LOGIN] vercel --prod
```

**Rollback**: `vercel --rollback` (instant revert).

---

## Step 3: Stripe (BONES — Activate After `stripe login`)

```powershell
# [BONES: UNCOMMENT AFTER LOGIN] stripe login

# Create test product + price:
# [BONES: UNCOMMENT AFTER LOGIN]
#   stripe products create --name "EcoRoute Boost" --description "One-time route boost unlock"
#   stripe prices create --product <product-id-from-above> --unit-amount 299 --currency usd

# Create webhook endpoint (use your Vercel production URL):
# [BONES: UNCOMMENT AFTER LOGIN]
#   stripe webhook_endpoints create \
#     --url "https://your-domain.vercel.app/api/stripe-webhook" \
#     --enabled-events "checkout.session.completed"

# Capture webhook signing secret from output.
```

---

## Safer Step-by-Step Activation (Recommended)

> Run each block, verify output, then proceed. Do NOT chain everything.

### Block 1: Supabase (Safe — schema push)

```powershell
cd 'C:\Users\sikke\Projects\web\ecoroute (Next.js)'
supabase link --project-ref dwxulsayhrzeelkfyiqj
supabase db push
# VERIFY: Check Supabase Dashboard → Table Editor → confirm tables exist
supabase functions deploy
# VERIFY: Dashboard → Edge Functions → confirm 2 functions listed
```

**Pause. Verify tables and Edge Functions in Supabase Dashboard before continuing.**

### Block 2: Vercel Link + Env Vars (Safe — no deploy yet)

```powershell
vercel link
# VERIFY: .vercel/project.json created

vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
# VERIFY: Dashboard → Project → Environment Variables → confirm 3 vars
```

**Pause. Verify env vars in Vercel Dashboard before continuing.**

### Block 3: Vercel Preview Deploy (Safe — not production)

```powershell
vercel
# VERIFY: Preview URL loads without 500 errors
# VERIFY: `https://<preview-url>/manifest.json` loads
# VERIFY: `https://<preview-url>/sw.js` loads
```

**Pause. Test the preview URL in a browser. Confirm the app renders.**

### Block 4: Stripe Test Setup (Safe — test mode only)

```powershell
stripe login
stripe products create --name "EcoRoute Boost" --description "One-time route boost unlock"
# Capture product ID from output

stripe prices create --product <product-id> --unit-amount 299 --currency usd
# Capture price ID from output

stripe webhook_endpoints create `
  --url "https://<preview-url>/api/stripe-webhook" `
  --enabled-events "checkout.session.completed"
# Capture webhook secret from output
```

**Pause. Add Stripe env vars to Vercel preview before continuing.**

```powershell
vercel env add STRIPE_SECRET_KEY
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
vercel env add STRIPE_WEBHOOK_SECRET
vercel  # Redeploy preview with Stripe vars
```

**Pause. Test Stripe checkout on preview URL with card `4242 4242 4242 4242`.**

### Block 5: Production Deploy (IRREVERSIBLE — requires explicit approval)

```powershell
# ONLY RUN THIS AFTER preview checkout test succeeds:
vercel --prod
```

**If anything fails in Blocks 1-4, do NOT run Block 5.**

---

## One-Line Activation (Advanced / Risky — Not Recommended)

```powershell
# WARNING: Chains everything without pause. Use only if you are 100% confident.
# supabase link --project-ref dwxulsayhrzeelkfyiqj ; supabase db push ; supabase functions deploy ; vercel link ; vercel env add NEXT_PUBLIC_SUPABASE_URL ; vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY ; vercel env add SUPABASE_SERVICE_ROLE_KEY ; vercel env add STRIPE_SECRET_KEY ; vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ; vercel env add STRIPE_WEBHOOK_SECRET ; vercel ; vercel --prod
```

---

## Post-Launch Checklist

- [ ] `https://<your-domain>/manifest.json` loads
- [ ] `https://<your-domain>/sw.js` registers (DevTools → Application → Service Workers)
- [ ] Lighthouse audit: 90+ all categories
- [ ] Magic link auth works in production
- [ ] Stripe test checkout: card `4242 4242 4242 4242`
- [ ] Supabase backups enabled
- [ ] Vercel Analytics enabled
