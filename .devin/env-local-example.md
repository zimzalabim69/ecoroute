# EcoRoute Environment Variables (BONES ONLY)

> Copy contents into `.env.local` (at project root) and fill in real values.
> `.env.local` is gitignored — never commit it.

---

## SUPABASE (Project: dwxulsayhrzeelkfyiqj)

Get these from: https://app.supabase.com/project/dwxulsayhrzeelkfyiqj/settings/api

```
NEXT_PUBLIC_SUPABASE_URL=https://dwxulsayhrzeelkfyiqj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## STRIPE (Test Mode)

Get these from: https://dashboard.stripe.com/test/apikeys

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## THIRD-PARTY APIs

```
ORS_API_KEY=your-openrouteservice-key
OCM_API_KEY=your-ocm-api-key
```

## APP CONFIG

```
NEXT_PUBLIC_DEFAULT_CITY_LAT=41.2565
NEXT_PUBLIC_DEFAULT_CITY_LNG=-95.9345
NEXT_PUBLIC_DEFAULT_CITY_NAME=Omaha, NE
```

## OPTIONAL / ADVANCED

```
# VERCEL_ANALYTICS_ID=your-vercel-analytics-id
# NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```
