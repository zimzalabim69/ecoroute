# Stripe Test-Mode Setup (BONES ONLY)

> No real keys. No live execution. Skeleton + templates only.
> Activate after `stripe login` and Vercel preview URL is live.

---

## Placeholder Keys (Fill In After Stripe Account Creation)

| Key | Placeholder | Where to Get |
|-----|-------------|--------------|
| Publishable | `pk_test_...` | Stripe Dashboard → Developers → API keys → Publishable key |
| Secret | `sk_test_...` | Stripe Dashboard → Developers → API keys → Secret key |
| Webhook Secret | `whsec_...` | Run `stripe webhook_endpoints create` or Dashboard → Developers → Webhooks |

---

## Test Product Template

```json
{
  "name": "EcoRoute Boost",
  "description": "One-time premium route planner + carbon report unlock",
  "metadata": {
    "app": "ecoroute",
    "tier": "boost"
  }
}
```

## Test Price Template

```json
{
  "currency": "usd",
  "unit_amount": 299,
  "product": "<product-id-from-above>"
}
```

---

## Webhook Endpoint Template

```bash
# Replace <your-domain> with actual Vercel production URL
stripe webhook_endpoints create \
  --url "https://<your-domain>/api/stripe-webhook" \
  --enabled-events "checkout.session.completed"
```

## Test Cards

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Declined |
| `4000 0000 0000 3220` | 3D Secure required |

---

## Edge Function Env Vars Needed

The Supabase Edge Functions (`stripe-checkout`, `stripe-webhook`) require:
- `STRIPE_SECRET_KEY` → `sk_test_...`
- `STRIPE_WEBHOOK_SECRET` → `whsec_...`
- `SUPABASE_URL` → `https://dwxulsayhrzeelkfyiqj.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` → from Supabase Dashboard

Set these via: `supabase secrets set STRIPE_SECRET_KEY=sk_test_...`

---

## Rollback

1. Delete webhook endpoint: `stripe webhook_endpoints delete <endpoint-id>`
2. Archive product: `stripe products update <product-id> --active=false`
3. Switch Vercel env vars back to test keys
4. `vercel --prod` to redeploy
