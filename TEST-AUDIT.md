# Test Infrastructure Audit for ecoroute

## Finding: Zero source-level tests
- No *.test.* files in app/, components/, or lib/
- No __tests__ directories in source code
- No vitest, jest, or playwright in devDependencies

## Recommended Stack
1. **vitest** — Fast unit testing for React components and utilities
2. **@testing-library/react** — DOM testing aligned with user behavior
3. **playwright** — E2E testing for Stripe checkout + map interactions

## Why this matters for ecoroute specifically
- Stripe payments need regression testing (critical path)
- Leaflet map interactions are easy to break in React 19
- Supabase auth flows need happy-path + error-path coverage
- Next.js 16 App Router has new conventions worth validating

## Next Steps
1. npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
2. Add vitest.config.ts with Next.js path aliases
3. Write first test: <CheckoutButton /> renders without crashing
4. Add playwright for /map route E2E
