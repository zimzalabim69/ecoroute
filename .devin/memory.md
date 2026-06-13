# EcoRoute Project Memory

## Overview
- **Name**: EcoRoute
- **Stack**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Leaflet, Supabase, Stripe
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

## Last Updated
2026-06-13
