import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TripHistory } from "@/types";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let trips: TripHistory[] = [];
  if (user) {
    const { data } = await supabase
      .from("trip_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    trips = (data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      originName: row.origin_name,
      originLat: row.origin_lat,
      originLng: row.origin_lng,
      destinationName: row.destination_name,
      destinationLat: row.destination_lat,
      destinationLng: row.destination_lng,
      distanceKm: row.distance_km,
      carbonSavedKg: row.carbon_saved_kg,
      safetyScore: row.safety_score ?? 0,
      createdAt: row.created_at,
    }));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-[#ededed]">Trip History</h1>

      {!user && (
        <div className="mt-12 text-center">
          <p className="text-[#a0a0a0]">Sign in to view your trip history.</p>
          <Link
            href="/map"
            className="mt-4 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-[#4CAF50] px-6 py-3 text-sm font-semibold text-[#121212] transition hover:bg-[#43a047]"
          >
            Go to Map
          </Link>
        </div>
      )}

      {user && trips.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-[#a0a0a0]">
            No trips yet. Plan your first route!
          </p>
          <Link
            href="/map"
            className="mt-4 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-[#4CAF50] px-6 py-3 text-sm font-semibold text-[#121212] transition hover:bg-[#43a047]"
          >
            Plan a Route
          </Link>
        </div>
      )}

      {user && trips.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="rounded-2xl border border-[#2a2a2a] bg-[#1e1e1e] p-5"
            >
              <div className="flex items-center gap-2 text-sm text-[#ededed]">
                <span className="truncate font-medium">{trip.originName}</span>
                <span className="text-[#737373]">→</span>
                <span className="truncate font-medium">{trip.destinationName}</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-[#737373]">Distance</p>
                  <p className="font-semibold text-[#ededed]">
                    {trip.distanceKm.toFixed(1)} km
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#737373]">Carbon Saved</p>
                  <p className="font-semibold text-[#4CAF50]">
                    {trip.carbonSavedKg.toFixed(2)} kg
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#737373]">Safety Score</p>
                  <p className="font-semibold text-[#ededed]">
                    {Math.round(trip.safetyScore)}/100
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#737373]">Date</p>
                  <p className="font-semibold text-[#ededed]">
                    {formatDate(trip.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
