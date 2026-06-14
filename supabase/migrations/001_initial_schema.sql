-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'boost')),
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checkins table
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id INTEGER NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('available', 'busy', 'broken', 'unknown')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  photo_url TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trips table
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  origin_lat DOUBLE PRECISION NOT NULL,
  origin_lng DOUBLE PRECISION NOT NULL,
  origin_name TEXT NOT NULL,
  destination_lat DOUBLE PRECISION NOT NULL,
  destination_lng DOUBLE PRECISION NOT NULL,
  destination_name TEXT NOT NULL,
  distance_km DOUBLE PRECISION NOT NULL,
  carbon_saved_kg DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table (Stripe)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Checkins policies
CREATE POLICY "Checkins are readable by all"
  ON checkins FOR SELECT USING (true);

CREATE POLICY "Users can insert own checkin"
  ON checkins FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checkin"
  ON checkins FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own checkin"
  ON checkins FOR DELETE USING (auth.uid() = user_id);

-- Trips policies
CREATE POLICY "Users can read own trips"
  ON trips FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trips"
  ON trips FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can read own subscriptions"
  ON subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- NOTE: Service role key bypasses RLS entirely. No policy needed for service role.
-- The policy below restricts update to the subscription owner only.
-- If you need service role updates (e.g., from Stripe webhook Edge Function),
-- use service_role_key — it bypasses RLS without needing this policy.
CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
