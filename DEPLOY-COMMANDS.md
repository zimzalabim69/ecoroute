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

## One-Line Activation (After All Logins)

```powershell
# Copy-paste this entire block after completing supabase login + vercel login + stripe login:

supabase link --project-ref dwxulsayhrzeelkfyiqj ; `n  supabase db push ; `n  supabase functions deploy ; `n  vercel link ; `n  vercel env add NEXT_PUBLIC_SUPABASE_URL ; `n  vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY ; `n  vercel env add SUPABASE_SERVICE_ROLE_KEY ; `n  vercel env add STRIPE_SECRET_KEY ; `n  vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ; `n  vercel env add STRIPE_WEBHOOK_SECRET ; `n  vercel ; `n  vercel --prod
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
