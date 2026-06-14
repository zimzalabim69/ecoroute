-- EcoRoute Seed Data (BONES ONLY)
-- Run with: supabase db reset --seed (after linking)
-- Or manually: psql $SUPABASE_DB_URL -f supabase/seed.sql

-- Seed a test user profile (for dev login / local testing)
-- UNCOMMENT TO ACTIVATE:
-- INSERT INTO profiles (id, email, subscription_tier)
-- VALUES ('00000000-0000-0000-0000-000000000000', 'dev@ecoroute.test', 'free')
-- ON CONFLICT (id) DO NOTHING;

-- Seed some Omaha charger stations for local dev
-- UNCOMMENT TO ACTIVATE:
-- INSERT INTO checkins (station_id, user_id, status, rating, note)
-- VALUES
--   (1, '00000000-0000-0000-0000-000000000000', 'available', 5, 'Fast charger, works great'),
--   (2, '00000000-0000-0000-0000-000000000000', 'busy', 4, 'Often occupied during rush hour');

-- Seed a sample trip for local testing
-- UNCOMMENT TO ACTIVATE:
-- INSERT INTO trip_history (
--   user_id, origin_name, origin_lat, origin_lng,
--   destination_name, destination_lat, destination_lng,
--   distance_km, carbon_saved_kg, safety_score
-- )
-- VALUES (
--   '00000000-0000-0000-0000-000000000000',
--   'Omaha, NE', 41.2565, -95.9345,
--   'Lincoln, NE', 40.8136, -96.7026,
--   85.2, 12.4, 78.5
-- );
