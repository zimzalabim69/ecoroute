-- Note: frontend CheckinStatus is "available" | "busy" | "broken"
-- The 'unknown' value in the constraint is reserved for future use

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_station_id ON favorites(station_id);
CREATE INDEX IF NOT EXISTS idx_trip_history_user_id ON trip_history(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_history_created_at ON trip_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_checkins_station_id ON checkins(station_id);
CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);

DROP TABLE IF EXISTS trips;
