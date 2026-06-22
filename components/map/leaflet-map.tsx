"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Circle,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { EVStation, SafeRouteResult, WeatherAlert } from "@/types";
import { fetchStations } from "@/lib/ocm";
import { fetchCrimeScore, getRiskColor } from "@/lib/crime";
import { useAuth } from "@/components/auth-provider";
import { useSignIn } from "@/components/sign-in-context";
import { useToast } from "@/components/toast-provider";
import { createClient } from "@/lib/supabase/client";
import { SearchBar } from "./search-bar";
import { HeatmapLayer } from "./heatmap-layer";
import { CheckinModal } from "@/components/ui/checkin-modal";
import type { CheckinFormData } from "@/components/ui/checkin-modal";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_LAT = parseFloat(
  process.env.NEXT_PUBLIC_DEFAULT_CITY_LAT || "41.2565"
);
const DEFAULT_LNG = parseFloat(
  process.env.NEXT_PUBLIC_DEFAULT_CITY_LNG || "-95.9345"
);

const DefaultIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const evIcon = new L.DivIcon({
  className: "custom-ev-marker",
  html: `<div style="background:#4CAF50;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.5);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const routeStartIcon = new L.DivIcon({
  className: "route-start-marker",
  html: `<div style="background:#4CAF50;width:18px;height:18px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.5);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const routeEndIcon = new L.DivIcon({
  className: "route-end-marker",
  html: `<div style="background:#FFD600;width:18px;height:18px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.5);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});



function MapController({
  center,
  onMoveEnd,
}: {
  center: [number, number];
  onMoveEnd?: (lat: number, lng: number) => void;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  useMapEvents({
    moveend: () => {
      const c = map.getCenter();
      onMoveEnd?.(c.lat, c.lng);
    },
  });

  return null;
}

export default function LeafletMap() {
  const [center, setCenter] = useState<[number, number]>([
    DEFAULT_LAT,
    DEFAULT_LNG,
  ]);
  const [stations, setStations] = useState<EVStation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [filters, setFilters] = useState({
    connector: "",
    minPower: 0,
    freeOnly: false,
    distance: 10,
  });

  // Selected station for bottom sheet
  const [selectedStation, setSelectedStation] = useState<EVStation | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Check-in modal
  const [checkinStation, setCheckinStation] = useState<EVStation | null>(null);
  const [checkinOpen, setCheckinOpen] = useState(false);

  // Route planning
  const [routeFrom, setRouteFrom] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [routeTo, setRouteTo] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [routeResult, setRouteResult] = useState<SafeRouteResult | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  // Weather alerts
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);

  // Favorites
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  // Safety overlay toggle
  const [showSafetyOverlay, setShowSafetyOverlay] = useState(false);

  const { user } = useAuth();
  const { openSignIn } = useSignIn();
  const { toast } = useToast();
  const supabase = createClient();

  // Geolocation on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCenter([pos.coords.latitude, pos.coords.longitude]),
        () => {}
      );
    }
  }, []);

  // Fetch stations when center or distance changes (debounced 300ms)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const load = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await fetchStations(center[0], center[1], filters.distance);
          setStations(data);
          setDemoMode(data.length > 0 && data[0].address?.includes("Demo City"));
        } catch (e: unknown) {
          setError(e instanceof Error ? e.message : "Failed to load stations");
        } finally {
          setLoading(false);
        }
      };
      load();
    }, 300);
    return () => clearTimeout(timeout);
  }, [center, filters.distance]);

  // Fetch weather alerts
  useEffect(() => {
    const loadWeather = async () => {
      try {
        const res = await fetch(`/api/weather?lat=${center[0]}&lng=${center[1]}`);
        if (res.ok) {
          const data = (await res.json()) as WeatherAlert[];
          setWeatherAlerts(data);
        }
      } catch {
        // weather is non-critical
      }
    };
    loadWeather();
  }, [center]);

  // Load favorites
  useEffect(() => {
    if (!user) return;
    const loadFavs = async () => {
      try {
        const res = await fetch("/api/favorites");
        if (res.ok) {
          const data = (await res.json()) as { stationId: number }[];
          setFavorites(new Set(data.map((f) => f.stationId)));
        }
      } catch {
        // non-critical
      }
    };
    loadFavs();
  }, [user]);

  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      if (filters.connector) {
        const hasType = s.connectors.some((c) =>
          c.type.toLowerCase().includes(filters.connector.toLowerCase())
        );
        if (!hasType) return false;
      }
      if (filters.minPower > 0) {
        const maxPower = Math.max(...s.connectors.map((c) => c.powerKW), 0);
        if (maxPower < filters.minPower) return false;
      }
      if (filters.freeOnly && !s.isFree) return false;
      return true;
    });
  }, [stations, filters]);

  const handleSearchSelect = useCallback((lat: number, lng: number) => {
    setCenter([lat, lng]);
  }, []);

  const handleStationClick = (station: EVStation) => {
    setSelectedStation(station);
    setSheetOpen(true);
  };

  const handleCheckinClick = (station: EVStation) => {
    setCheckinStation(station);
    setCheckinOpen(true);
  };

  const handleCheckinSubmit = async (data: CheckinFormData) => {
    if (!user || !checkinStation) return;
    try {
      await supabase.from("checkins").insert({
        station_id: checkinStation.id,
        user_id: user.id,
        status: data.status,
        rating: data.rating,
        note: data.note,
        photo_url: data.photoUrl,
      });
      toast(`Checked in at ${checkinStation.name}`, "success");
    } catch {
      toast("Check-in failed", "error");
    }
    setCheckinOpen(false);
  };

  const toggleFavorite = async (station: EVStation) => {
    if (!user) { openSignIn(); return; }
    const isFav = favorites.has(station.id);
    try {
      if (isFav) {
        await fetch("/api/favorites", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stationId: station.id }),
        });
        setFavorites((prev) => {
          const next = new Set(prev);
          next.delete(station.id);
          return next;
        });
        toast(`Removed ${station.name} from favorites`, "info");
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stationId: station.id,
            stationName: station.name,
            lat: station.lat,
            lng: station.lng,
          }),
        });
        setFavorites((prev) => new Set(prev).add(station.id));
        toast(`Saved ${station.name} to favorites`, "success");
      }
    } catch {
      toast("Failed to update favorites", "error");
    }
  };

  const planRoute = async () => {
    if (!routeFrom || !routeTo) return;
    const latDiff = Math.abs(routeFrom.lat - routeTo.lat);
    const lngDiff = Math.abs(routeFrom.lng - routeTo.lng);
    if (latDiff < 0.0001 && lngDiff < 0.0001) {
      setError("Please select different start and end points.");
      return;
    }
    setRouteLoading(true);
    try {
      const res = await fetch("/api/safe-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: routeFrom, to: routeTo }),
      });
      if (res.ok) {
        const data = (await res.json()) as SafeRouteResult;
        setRouteResult(data);
        toast(`Route planned: ${(data.route.distanceM / 1000).toFixed(1)} km, Safety ${Math.round(data.safetyScore)}%`, "success");
        // Save trip to history
        if (user) {
          await fetch("/api/trips", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              originName: routeFrom.name,
              originLat: routeFrom.lat,
              originLng: routeFrom.lng,
              destinationName: routeTo.name,
              destinationLat: routeTo.lat,
              destinationLng: routeTo.lng,
              distanceKm: data.route.distanceM / 1000,
              carbonSavedKg: (data.route.distanceM / 1000) * 0.12,
              safetyScore: data.safetyScore,
            }),
          });
        }
      } else {
        setError("Route planning failed. Try again.");
        toast("Route planning failed. Try again.", "error");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Route planning failed";
      setError(msg);
      toast(msg, "error");
    } finally {
      setRouteLoading(false);
    }
  };

  const clearRoute = () => {
    setRouteFrom(null);
    setRouteTo(null);
    setRouteResult(null);
  };

  const routeGeometry = useMemo(() => {
    if (!routeResult) return null;
    // ORS returns [lng, lat] pairs, Leaflet needs [lat, lng]
    return routeResult.route.geometry.map(([lng, lat]) => [lat, lng] as [number, number]);
  }, [routeResult]);

  const routeChargers = useMemo(() => {
    if (!routeResult) return [];
    // Find chargers within 2km of any route point (simple approximation)
    const chargers: EVStation[] = [];
    const seen = new Set<number>();
    for (const [lat, lng] of routeResult.route.geometry) {
      for (const s of filteredStations) {
        if (seen.has(s.id)) continue;
        const d = L.latLng(lat, lng).distanceTo(L.latLng(s.lat, s.lng));
        if (d < 2000) {
          seen.add(s.id);
          chargers.push(s);
        }
      }
    }
    return chargers;
  }, [routeResult, filteredStations]);

  const handleBoostCheckout = async () => {
    if (!user) {
      openSignIn();
      return;
    }
    try {
      const res = await fetch("/api/stripe-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          userId: user.id,
          returnUrl: window.location.origin + "/map",
        }),
      });
      const data = await res.json();
      if (data.url) {
        toast("Redirecting to checkout...", "info");
        window.location.href = data.url;
      } else {
        toast(data.error || "Checkout failed", "error");
      }
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Checkout failed", "error");
    }
  };

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col">
      {/* Weather alerts */}
      {weatherAlerts.length > 0 && (
        <div className="flex items-center gap-2 border-b border-[#2a2a2a] bg-[#FFD600]/10 px-4 py-2 text-xs text-[#FFD600]">
          <span className="font-bold">Weather Alert:</span>
          <span className="truncate">{weatherAlerts[0].headline}</span>
        </div>
      )}

      {/* Top bar — glassmorphism */}
      <div className="flex flex-col gap-2 border-b border-[#2a2a2a]/60 bg-[#1e1e1e]/80 backdrop-blur-xl p-3 shadow-lg">
        <SearchBar onSelect={handleSearchSelect} className="max-w-md" />

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-[#2a2a2a] bg-[#121212]/60 px-2 py-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#4CAF50]"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            <select
              className="bg-transparent text-xs text-[#ededed] outline-none cursor-pointer"
              value={filters.connector}
              onChange={(e) => setFilters((f) => ({ ...f, connector: e.target.value }))}
            >
              <option value="" className="bg-[#121212]">All Types</option>
              <option value="J1772" className="bg-[#121212]">J1772</option>
              <option value="CCS" className="bg-[#121212]">CCS</option>
              <option value="CHAdeMO" className="bg-[#121212]">CHAdeMO</option>
              <option value="Tesla" className="bg-[#121212]">Tesla</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-[#2a2a2a] bg-[#121212]/60 px-2 py-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#81C784]"><path d="M12 2v20M2 12h20"/></svg>
            <select
              className="bg-transparent text-xs text-[#ededed] outline-none cursor-pointer"
              value={filters.minPower}
              onChange={(e) => setFilters((f) => ({ ...f, minPower: Number(e.target.value) }))}
            >
              <option value={0} className="bg-[#121212]">Any Power</option>
              <option value={50} className="bg-[#121212]">≥ 50 kW</option>
              <option value={100} className="bg-[#121212]">≥ 100 kW</option>
              <option value={150} className="bg-[#121212]">≥ 150 kW</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-[#2a2a2a] bg-[#121212]/60 px-2 py-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#A5D6A7]"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/></svg>
            <select
              className="bg-transparent text-xs text-[#ededed] outline-none cursor-pointer"
              value={filters.distance}
              onChange={(e) => setFilters((f) => ({ ...f, distance: Number(e.target.value) }))}
            >
              <option value={5} className="bg-[#121212]">5 km</option>
              <option value={10} className="bg-[#121212]">10 km</option>
              <option value={25} className="bg-[#121212]">25 km</option>
              <option value={50} className="bg-[#121212]">50 km</option>
            </select>
          </div>

          <button
            onClick={() => setFilters((f) => ({ ...f, freeOnly: !f.freeOnly }))}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition ${
              filters.freeOnly
                ? "border-[#4CAF50] bg-[#4CAF50]/10 text-[#4CAF50]"
                : "border-[#2a2a2a] bg-[#121212]/60 text-[#a0a0a0] hover:text-[#ededed]"
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M2 12h20"/></svg>
            Free Only
          </button>

          <button
            onClick={() => setShowSafetyOverlay((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition ${
              showSafetyOverlay
                ? "border-[#F44336] bg-[#F44336]/10 text-[#F44336]"
                : "border-[#2a2a2a] bg-[#121212]/60 text-[#a0a0a0] hover:text-[#ededed]"
            }`}
            title="Toggle safety risk overlay"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            {showSafetyOverlay ? "Risk On" : "Risk Off"}
          </button>

          {/* Route planner */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => {
                if (center) setRouteFrom({ lat: center[0], lng: center[1], name: "Current Location" });
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition ${
                routeFrom ? "border-[#4CAF50] bg-[#4CAF50]/10 text-[#4CAF50]" : "border-[#2a2a2a] bg-[#121212]/60 text-[#ededed] hover:border-[#4CAF50]/40"
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
              {routeFrom ? "From" : "Set From"}
            </button>
            <button
              onClick={() => {
                if (center) setRouteTo({ lat: center[0], lng: center[1], name: "Current Location" });
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition ${
                routeTo ? "border-[#FFD600] bg-[#FFD600]/10 text-[#FFD600]" : "border-[#2a2a2a] bg-[#121212]/60 text-[#ededed] hover:border-[#FFD600]/40"
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
              {routeTo ? "To" : "Set To"}
            </button>
            <button
              onClick={planRoute}
              disabled={!routeFrom || !routeTo || routeLoading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#4CAF50] to-[#388E3C] px-4 py-1.5 text-xs font-bold text-[#121212] shadow-[0_0_20px_rgba(76,175,80,0.2)] transition hover:shadow-[0_0_30px_rgba(76,175,80,0.35)] disabled:opacity-50 disabled:shadow-none"
            >
              {routeLoading ? (
                <>
                  <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Planning...
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M12 3v18"/></svg>
                  Plan Route
                </>
              )}
            </button>
            {(routeFrom || routeTo) && (
              <button
                onClick={clearRoute}
                className="inline-flex items-center rounded-xl border border-[#2a2a2a] bg-[#121212]/60 px-2.5 py-1.5 text-xs text-[#a0a0a0] transition hover:text-[#ededed]"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Route summary */}
      {routeLoading ? (
        <div className="flex items-center gap-2 border-b border-[#2a2a2a] bg-[#1e1e1e] px-4 py-2 text-sm text-[#a0a0a0]">
          <svg className="h-4 w-4 animate-spin text-[#4CAF50]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Calculating route...
        </div>
      ) : routeResult ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2a2a2a] bg-[#1e1e1e] px-4 py-2 text-sm">
          <div className="flex items-center gap-3">
            <span className="text-[#4CAF50]">
              {(routeResult.route.distanceM / 1000).toFixed(1)} km
            </span>
            <span className="text-[#a0a0a0]">
              {Math.round(routeResult.route.durationSec / 60)} min
            </span>
            <span className="text-[#4CAF50]">
              {((routeResult.route.distanceM / 1000) * 0.12).toFixed(2)} kg CO₂ saved
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-xs font-bold"
              style={{
                background:
                  routeResult.safetyScore >= 80
                    ? "rgba(76,175,80,0.2)"
                    : routeResult.safetyScore >= 50
                    ? "rgba(255,214,0,0.2)"
                    : "rgba(244,67,54,0.2)",
                color:
                  routeResult.safetyScore >= 80
                    ? "#4CAF50"
                    : routeResult.safetyScore >= 50
                    ? "#FFD600"
                    : "#F44336",
              }}
            >
              Safety: {Math.round(routeResult.safetyScore)}%
            </span>
            {routeResult.nightModeActive && (
              <span className="rounded-full bg-[#1E1E1E] px-2 py-0.5 text-xs text-[#a0a0a0]">
                Night Mode
              </span>
            )}
          </div>
          {routeResult.warnings.length > 0 && (
            <div className="w-full text-xs text-[#F44336]">
              {routeResult.warnings.join(" ")}
            </div>
          )}
        </div>
      ) : null}

      {/* Map */}
      <div className="relative flex-1">
        <MapContainer
          center={center}
          zoom={13}
          className="h-full w-full"
          style={{ background: "#121212" }}
        >
          <MapController center={center} onMoveEnd={(lat, lng) => setCenter([lat, lng])} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {filteredStations.map((s) => (
            <Marker
              key={s.id}
              position={[s.lat, s.lng]}
              icon={evIcon}
              eventHandlers={{
                click: () => handleStationClick(s),
              }}
            />
          ))}

          {routeFrom && (
            <Marker position={[routeFrom.lat, routeFrom.lng]} icon={routeStartIcon} />
          )}
          {routeTo && (
            <Marker position={[routeTo.lat, routeTo.lng]} icon={routeEndIcon} />
          )}

          {routeGeometry && (
            <Polyline
              positions={routeGeometry}
              color="#4CAF50"
              weight={4}
              opacity={0.9}
            />
          )}

          {routeChargers.map((s) => (
            <Circle
              key={`route-${s.id}`}
              center={[s.lat, s.lng]}
              radius={300}
              pathOptions={{ color: "#FFD600", fillColor: "#FFD600", fillOpacity: 0.15 }}
            />
          ))}

          {showSafetyOverlay && <HeatmapLayer center={center} visible={showSafetyOverlay} />}
        </MapContainer>

        {/* Loading overlay */}
        {loading && (
          <div className="pointer-events-none absolute inset-0 z-[1000] flex flex-col items-center justify-center gap-3 bg-[#121212]/60">
            <Skeleton variant="card" className="w-64 h-24" />
            <Skeleton variant="card" className="w-64 h-24" />
            <p className="text-sm text-[#ededed]">Loading chargers...</p>
          </div>
        )}

        {/* Demo mode badge */}
        {demoMode && !error && (
          <div className="absolute bottom-4 left-1/2 z-[1000] w-auto -translate-x-1/2 rounded-full border border-[#FFD600]/30 bg-[#FFD600]/10 px-4 py-1.5 text-xs font-medium text-[#FFD600] backdrop-blur-md">
            Demo Mode — Using sample charger data
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="absolute bottom-4 left-1/2 z-[1000] w-[90%] max-w-md -translate-x-1/2 rounded-xl bg-[#F44336]/90 px-4 py-3 text-sm text-white shadow-lg">
            <p className="font-semibold">{error}</p>
            {error.includes("OCM_API_KEY") && (
              <p className="mt-1 text-xs">
                Get a free key at{" "}
                <a
                  href="https://openchargemap.org/site/develop#api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  openchargemap.org
                </a>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bottom Sheet — Station Details */}
      <BottomSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={selectedStation?.name}
        initialSnap="half"
      >
        {selectedStation && (
          <StationDetailContent
            station={selectedStation}
            user={user}
            isFav={favorites.has(selectedStation.id)}
            onToggleFavorite={() => toggleFavorite(selectedStation)}
            onCheckin={() => {
              setSheetOpen(false);
              handleCheckinClick(selectedStation);
            }}
            onBoost={handleBoostCheckout}
            center={center}
          />
        )}
      </BottomSheet>

      {/* Check-in Modal */}
      <CheckinModal
        isOpen={checkinOpen}
        onClose={() => setCheckinOpen(false)}
        onSubmit={handleCheckinSubmit}
        stationName={checkinStation?.name}
      />
    </div>
  );
}

function StationDetailContent({
  station,
  user,
  isFav,
  onToggleFavorite,
  onCheckin,
  onBoost,
  center,
}: {
  station: EVStation;
  user: { id: string; email?: string } | null;
  isFav: boolean;
  onToggleFavorite: () => Promise<void>;
  onCheckin: () => void;
  onBoost: () => void;
  center: [number, number];
}) {
  const [crime, setCrime] = useState<{ score: number; label: "Safe" | "Caution" | "Avoid" } | null>(null);
  const [saving, setSaving] = useState(false);
  const { openSignIn } = useSignIn();

  const handleToggleFavorite = async () => {
    setSaving(true);
    try {
      await onToggleFavorite();
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetchCrimeScore(station.lat, station.lng, center[0], center[1]).then((c) => {
      if (!cancelled) setCrime(c);
    });
    return () => { cancelled = true; };
  }, [station.lat, station.lng, center]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#a0a0a0]">{station.address}</p>

      {/* Crime risk badge */}
      {crime && (
        <div
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
          style={{
            background: `${getRiskColor(crime.label)}20`,
            color: getRiskColor(crime.label),
          }}
        >
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: getRiskColor(crime.label) }}
          />
          {crime.label}
        </div>
      )}

      {/* Connectors */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-[#737373]">
          Connectors
        </p>
        {station.connectors.map((c, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg border border-[#2a2a2a] bg-[#121212] px-3 py-2"
          >
            <span className="text-sm text-[#ededed]">{c.type}</span>
            <span className="text-sm font-medium text-[#4CAF50]">{c.powerKW} kW</span>
          </div>
        ))}
      </div>

      {/* Photos */}
      {station.photos && station.photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {station.photos.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`Station photo ${i + 1}`}
              className="h-24 w-24 shrink-0 rounded-lg object-cover"
              loading="lazy"
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-2">
        {user ? (
          <button
            onClick={handleToggleFavorite}
            disabled={saving}
            className={`inline-flex min-h-[40px] items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition ${
              isFav
                ? "bg-[#FFD600]/20 text-[#FFD600]"
                : "bg-[#2a2a2a] text-[#ededed] hover:bg-[#3a3a3a]"
            } ${saving ? "opacity-50" : ""}`}
          >
            {saving ? "Saving..." : isFav ? "★ Saved" : "☆ Save"}
          </button>
        ) : (
          <button
            onClick={openSignIn}
            className="inline-flex min-h-[40px] items-center gap-1 rounded-lg bg-[#2a2a2a] px-3 py-2 text-xs font-medium text-[#ededed] transition hover:bg-[#3a3a3a]"
          >
            ☆ Save
          </button>
        )}
        {user ? (
          <button
            onClick={onCheckin}
            className="inline-flex min-h-[40px] items-center rounded-lg bg-[#4CAF50] px-3 py-2 text-xs font-bold text-[#121212] transition hover:bg-[#43a047]"
          >
            Check In
          </button>
        ) : (
          <button
            onClick={openSignIn}
            className="inline-flex min-h-[40px] items-center rounded-lg border border-[#2a2a2a] bg-[#121212] px-3 py-2 text-xs font-medium text-[#737373] transition hover:border-[#4CAF50]/40 hover:text-[#ededed]"
          >
            Sign in to check in
          </button>
        )}
        <button
          onClick={onBoost}
          className="inline-flex min-h-[40px] items-center rounded-lg bg-[#FFD600] px-3 py-2 text-xs font-bold text-[#121212] transition hover:bg-[#e6c200]"
        >
          Boost $2.99
        </button>
      </div>
    </div>
  );
}
