# EcoRoute Security Policy

> **Last updated**: 2026-06-14
> **Owner**: Sikke (zimzalabim69)
> **Classification**: Internal — no secrets below

---

## 1. Incident Response Checklist

If you suspect a breach, leak, or unauthorized access:

1. **Stop the bleed**
   - Rotate all affected keys immediately (Supabase, Stripe, Vercel, GitHub PAT).
   - Disable the compromised service account or token.
2. **Assess scope**
   - Check Vercel / Supabase / Stripe audit logs for unauthorized requests.
   - Review GitHub Security → Secret scanning alerts.
   - Run `git log -p --all -S '<key-fragment>'` to verify no secrets in history.
3. **Fix root cause**
   - If a secret was committed: use `git filter-repo` or BFG to purge from history.
   - If env var leaked: remove from Vercel, re-add fresh value, redeploy.
   - If Supabase key leaked: rotate via Dashboard → Settings → API.
4. **Verify**
   - Re-run full build + lint + smoke test.
   - Confirm app functions with rotated keys.
5. **Document**
   - Append date, cause, and fix to this file under **Past Incidents**.

---

## 2. Secret Management Rules

| Rule | Status | Enforcement |
|------|--------|-------------|
| `.env.local` is gitignored | Enforced | `.gitignore` blocks `.env*`, `*.key`, `secrets.*`, `credentials.*` |
| No secrets in git history | Enforced | Verified clean (only placeholders in history) |
| No hardcoded keys in source | Enforced | All keys via `process.env.*` or `Deno.env.get()` |
| Service role key never client-side | Enforced | `lib/supabase/client.ts` uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` only |
| Stripe test keys only | Enforced | No `sk_live_` / `pk_live_` references in codebase |
| Webhook signature verification | Enforced | `stripe.webhooks.constructEvent` in webhook route |
| Vercel env vars encrypted | Required | Must be set as **Encrypted** in Vercel Dashboard |
| Local secrets in vault | Recommended | Use Windows Credential Manager, 1Password, or DPAPI-encrypted store |

---

## 3. Key Rotation Contacts

| Service | Rotation Path | Notes |
|---------|---------------|-------|
| **Supabase** | Dashboard → Project Settings → API → Regenerate keys | Rotates `anon` and `service_role` simultaneously |
| **Stripe** | Dashboard → Developers → API keys → Create new key | Revoke old key after confirming new one works |
| **Vercel** | Dashboard → Project → Environment Variables → Edit | Re-deploy after changing any env var |
| **GitHub PAT** | Settings → Developer settings → Personal access tokens | Use Classic PAT with `repo`, `read:org`, `workflow` for `gh` CLI |
| **OpenRouteService** | https://openrouteservice.org/dev → API Console | Free key, rotate if leaked |
| **Open Charge Map** | https://openchargemap.org/site → API Keys | Free key, rotate if leaked |

---

## 4. Architecture Security Notes

### Row Level Security (RLS)
- All tables: `profiles`, `checkins`, `trips`, `subscriptions`, `favorites`, `trip_history` have RLS enabled.
- `checkins` table has a **public read policy** (`USING (true)`) — this is intentional for the community charger-status layer. If this requirement changes, replace with an auth-gated policy.
- `subscriptions` table has a `DELETE USING (false)` policy to preserve audit trail.

### API Security
- All public API routes implement rate limiting (30 req / 60 s).
- Stripe webhook validates signatures before processing.
- Input validation enforced on `stripe-checkout`, `route-plan`, and `weather` endpoints.
- Dev login bypass is **gated to `NODE_ENV === "development"`** only.

### Infrastructure Headers
- `vercel.json` applies security headers globally:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Strict-Transport-Security: max-age=63072000`
  - `Content-Security-Policy` (strict default-src and connect-src)

---

## 5. Past Incidents

| Date | Incident | Cause | Fix | Status |
|------|----------|-------|-----|--------|
| — | — | — | — | — |

---

## 6. Contact

- GitHub: `zimzalabim69/ecoroute`
- For security issues: create a private security advisory on GitHub or contact the repo owner directly.
