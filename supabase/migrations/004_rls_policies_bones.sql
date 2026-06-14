-- EcoRoute RLS Policies Skeleton (BONES ONLY)
-- These policies are ALREADY ACTIVE in 001_initial_schema.sql.
-- This file contains ENHANCED policies for future activation.
-- Run with: supabase db push (after linking)

-- ============================================================
-- ENHANCED PROFILES POLICIES
-- ============================================================

-- Allow service role to read all profiles (for admin dashboards)
-- UNCOMMENT TO ACTIVATE:
-- CREATE POLICY "Service role can read all profiles"
--   ON profiles FOR SELECT USING (true);
-- NOTE: This bypasses RLS. Only use for admin Edge Functions with service_role_key.

-- Allow users to delete own profile (GDPR right to be forgotten)
-- UNCOMMENT TO ACTIVATE:
-- CREATE POLICY "Users can delete own profile"
--   ON profiles FOR DELETE USING (auth.uid() = id);

-- ============================================================
-- ENHANCED CHECKINS POLICIES
-- ============================================================

-- Allow public read on checkins (already active from 001_initial_schema.sql)
-- This is the community-driven layer: anyone can see charger statuses.

-- Allow service role to update any checkin (for moderation)
-- UNCOMMENT TO ACTIVATE:
-- CREATE POLICY "Service role can moderate checkins"
--   ON checkins FOR UPDATE USING (true);

-- ============================================================
-- ENHANCED FAVORITES POLICIES
-- ============================================================

-- Already active from 002_favorites_trips.sql: "Users can CRUD own favorites"

-- Allow service role to read favorites (for recommendation engine)
-- UNCOMMENT TO ACTIVATE:
-- CREATE POLICY "Service role can read favorites for analytics"
--   ON favorites FOR SELECT USING (true);

-- ============================================================
-- ENHANCED TRIP_HISTORY POLICIES
-- ============================================================

-- Already active from 002_favorites_trips.sql: "Users can CRUD own trip_history"

-- Allow public read on anonymized trip stats (for city carbon reports)
-- UNCOMMENT TO ACTIVATE:
-- CREATE POLICY "Public can read anonymized trip stats"
--   ON trip_history FOR SELECT USING (false);
-- NOTE: Set to false until anonymization view is created.

-- ============================================================
-- ENHANCED SUBSCRIPTIONS POLICIES
-- ============================================================

-- Already active from 001_initial_schema.sql:
-- - "Users can read own subscriptions"
-- - "Users can insert own subscriptions"
-- - "Service role can update subscriptions"

-- Prevent users from deleting subscription records (audit trail)
-- UNCOMMENT TO ACTIVATE:
-- CREATE POLICY "Users cannot delete subscriptions"
--   ON subscriptions FOR DELETE USING (false);

-- ============================================================
-- FUTURE TABLES (create when needed)
-- ============================================================

-- UNCOMMENT TO ACTIVATE: Route sharing / public routes table
-- CREATE TABLE IF NOT EXISTS public_routes (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
--   slug TEXT UNIQUE NOT NULL,
--   origin_name TEXT NOT NULL,
--   origin_lat DOUBLE PRECISION NOT NULL,
--   origin_lng DOUBLE PRECISION NOT NULL,
--   destination_name TEXT NOT NULL,
--   destination_lat DOUBLE PRECISION NOT NULL,
--   destination_lng DOUBLE PRECISION NOT NULL,
--   is_public BOOLEAN DEFAULT false,
--   view_count INTEGER DEFAULT 0,
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );
-- ALTER TABLE public_routes ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can CRUD own public_routes" ON public_routes FOR ALL USING (auth.uid() = user_id);
-- CREATE POLICY "Public can view public routes" ON public_routes FOR SELECT USING (is_public = true);
