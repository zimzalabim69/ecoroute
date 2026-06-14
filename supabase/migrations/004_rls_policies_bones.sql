-- EcoRoute RLS Policies Skeleton (BONES ONLY)
-- These policies are ALREADY ACTIVE in 001_initial_schema.sql.
-- This file contains ENHANCED policies for future activation.
-- Run with: supabase db push (after linking)

-- ============================================================
-- ENHANCED PROFILES POLICIES
-- ============================================================

-- NOTE: Service role (supabase service_role_key) BYPASSES RLS entirely.
-- No policy is needed for service role access. Do NOT create a policy with USING (true)
-- because that would allow ANY authenticated user to read all profiles.
-- If you need admin dashboards, either:
--   (a) Use service_role_key in an Edge Function (no policy needed), or
--   (b) Create an "admin" column on profiles and check it in the policy.
-- NOTE: `is_admin` column already added in 001_initial_schema.sql.
-- UNCOMMENT TO ACTIVATE (admin flag approach):
-- CREATE POLICY "Admins can read all profiles"
--   ON profiles FOR SELECT USING (auth.uid() IN (
--     SELECT id FROM profiles WHERE is_admin = true
--   ));

-- Allow users to delete own profile (GDPR right to be forgotten)
-- UNCOMMENT TO ACTIVATE:
-- CREATE POLICY "Users can delete own profile"
--   ON profiles FOR DELETE USING (auth.uid() = id);

-- ============================================================
-- ENHANCED CHECKINS POLICIES
-- ============================================================

-- Allow public read on checkins (already active from 001_initial_schema.sql)
-- This is the community-driven layer: anyone can see charger statuses.

-- NOTE: Service role bypasses RLS. No policy needed for Edge Function moderation.
-- If you need in-app moderation by admins, use the admin flag approach above.
-- UNCOMMENT TO ACTIVATE (admin moderation via app):
-- CREATE POLICY "Admins can moderate checkins"
--   ON checkins FOR UPDATE USING (auth.uid() IN (
--     SELECT id FROM profiles WHERE is_admin = true
--   ));

-- ============================================================
-- ENHANCED FAVORITES POLICIES
-- ============================================================

-- Already active from 002_favorites_trips.sql: "Users can CRUD own favorites"

-- NOTE: Service role bypasses RLS. For analytics, run a scheduled Edge Function
-- with service_role_key. Do NOT create a wide-open SELECT policy.
-- UNCOMMENT TO ACTIVATE (analytics via admin access only):
-- CREATE POLICY "Admins can read favorites for analytics"
--   ON favorites FOR SELECT USING (auth.uid() IN (
--     SELECT id FROM profiles WHERE is_admin = true
--   ));

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
CREATE POLICY "Users cannot delete subscriptions"
  ON subscriptions FOR DELETE USING (false);

-- ============================================================
-- OPTIONAL HELPER FUNCTION (for cleaner Edge Function checks)
-- ============================================================

-- UNCOMMENT TO ACTIVATE: A helper to detect service role context in SQL.
-- This is rarely needed because Edge Functions using service_role_key
-- bypass RLS entirely. But it can be useful for audit logging.
--
-- CREATE OR REPLACE FUNCTION public.is_service_role()
-- RETURNS BOOLEAN AS $$
-- BEGIN
--   RETURN current_setting('request.jwt.claims', true)::json->>'role' = 'service_role';
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

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
