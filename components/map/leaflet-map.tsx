"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
  Circle,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { EVStation } from "@/types";
import { fetchStations } from "@/lib/ocm";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase/client";

const DEFAULT_LAT = parseFloat(process.env.NEXT_PUBLIC_DEFAULT_CITY_LAT || "41.2565");
const DEFAULT_LNG = parseFloat(process.env.NEXT_PUBLIC_DEFAULT_CITY_LNG || "-95.9345");

// Fix Leaflet default icon paths
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
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

function MapController({
  center,
}: {
  center: [number, number];
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function LeafletMap() {
  const [center, setCenter] = useState<[number, number]>([DEFAULT_LAT, DEFAULT_LNG]);
  const [stations, setStations] = useState<EVStation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    connector: "",
    minPower: 0,
    freeOnly: false,
    distance: 10,
  });
  const [routePoints, setRoutePoints] = useState<{
    from: { lat: number; lng: number; name: string } | null;
    to: { lat: number; lng: number; name: string } | null;
  }>({ from: null, to: null });
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCenter([pos.coords.latitude, pos.coords.longitude]),
        () => {
          /* fallback to default */
        }
      );
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchStations(center[0], center[1], filters.distance);
        setStations(data);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load stations");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [center, filters.distance]);

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

  const routeLine = useMemo(() => {
    if (!routePoints.from || !routePoints.to) return null;
    return [
      [routePoints.from.lat, routePoints.from.lng] as [number, number],
      [routePoints.to.lat, routePoints.to.lng] as [number, number],
    ];
  }, [routePoints]);

  const carbonSaved = useMemo(() => {
    if (!routePoints.from || !routePoints.to) return 0;
    const distKm =
      L.latLng(routePoints.from.lat, routePoints.from.lng).distanceTo(
        L.latLng(routePoints.to.lat, routePoints.to.lng)
      ) / 1000;
    return distKm * 0.12;
  }, [routePoints]);

  const routeStations = useMemo(() => {
    if (!routePoints.from || !routePoints.to) return [];
    const bounds = L.latLngBounds(
      [routePoints.from.lat, routePoints.from.lng],
      [routePoints.to.lat, routePoints.to.lng]
    ).pad(0.2);
    return filteredStations.filter((s) => bounds.contains([s.lat, s.lng]));
  }, [filteredStations, routePoints]);

  const handleBoostCheckout = async () => {
    if (!user) {
      alert("Please sign in first.");
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
      if (data.url) window.location.href = data.url;
      else alert(data.error || "Checkout failed.");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Checkout failed");
    }
  };

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col">
      {/* Top bar: filters + route */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#2a2a2a] bg-[#1e1e1e] p-3">
        <select
          className="rounded-lg bg-[#121212] px-2 py-1 text-xs text-[#ededed] border border-[#2a2a2a]"
          value={filters.connector}
          onChange={(e) => setFilters((f) => ({ ...f, connector: e.target.value }))}
        >
          <option value="">All Connectors</option>
          <option value="J1772">J1772</option>
          <option value="CCS">CCS</option>
          <option value="CHAdeMO">CHAdeMO</option>
          <option value="Tesla">Tesla</option>
        </select>
        <select
          className="rounded-lg bg-[#121212] px-2 py-1 text-xs text-[#ededed] border border-[#2a2a2a]"
          value={filters.minPower}
          onChange={(e) =>
            setFilters((f) => ({ ...f, minPower: Number(e.target.value) }))
          }
        >
          <option value={0}>Any Speed</option>
          <option value={50}>{`>= 50 kW`}</option>
          <option value={100}>{`>= 100 kW`}</option>
          <option value={150}>{`>= 150 kW`}</option>
        </select>
        <label className="flex items-center gap-1 text-xs text-[#a0a0a0]">
          <input
            type="checkbox"
            checked={filters.freeOnly}
            onChange={(e) => setFilters((f) => ({ ...f, freeOnly: e.target.checked }))}
          />
          Free only
        </label>
        <select
          className="rounded-lg bg-[#121212] px-2 py-1 text-xs text-[#ededed] border border-[#2a2a2a]"
          value={filters.distance}
          onChange={(e) =>
            setFilters((f) => ({ ...f, distance: Number(e.target.value) }))
          }
        >
          <option value={5}>5 km</option>
          <option value={10}>10 km</option>
          <option value={25}>25 km</option>
          <option value={50}>50 km</option>
        </select>
        <div className="ml-auto flex items-center gap-2">
          <input
            placeholder="From (lat,lng)"
            className="w-28 rounded-lg bg-[#121212] px-2 py-1 text-xs text-[#ededed] border border-[#2a2a2a]"
            onBlur={(e) => {
              const [lat, lng] = e.target.value.split(",").map(Number);
              if (!isNaN(lat) && !isNaN(lng))
                setRoutePoints((r) => ({
                  ...r,
                  from: { lat, lng, name: "From" },
                }));
            }}
          />
          <input
            placeholder="To (lat,lng)"
            className="w-28 rounded-lg bg-[#121212] px-2 py-1 text-xs text-[#ededed] border border-[#2a2a2a]"
            onBlur={(e) => {
              const [lat, lng] = e.target.value.split(",").map(Number);
              if (!isNaN(lat) && !isNaN(lng))
                setRoutePoints((r) => ({
                  ...r,
                  to: { lat, lng, name: "To" },
                }));
            }}
          />
          <button
            onClick={() => {
              setRoutePoints({ from: null, to: null });
            }}
            className="rounded-lg bg-[#2a2a2a] px-2 py-1 text-xs text-[#ededed]"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Carbon panel */}
      {carbonSaved > 0 && (
        <div className="flex items-center justify-between bg-[#1e1e1e] px-4 py-2 text-sm text-[#4CAF50]">
          <span>
            This trip saved <strong>{carbonSaved.toFixed(2)} kg CO₂</strong>
          </span>
          <span className="text-xs text-[#737373]">
            {routeStations.length} chargers near route
          </span>
        </div>
      )}

      {/* Map */}
      <div className="relative flex-1">
        <MapContainer
          center={center}
          zoom={13}
          className="h-full w-full"
          style={{ background: "#121212" }}
        >
          <MapController center={center} />
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredStations.map((s) => (
            <Marker key={s.id} position={[s.lat, s.lng]} icon={evIcon}>
              <Popup>
                <div className="min-w-[200px] text-[#ededed]">
                  <h4 className="font-semibold">{s.name}</h4>
                  <p className="text-xs text-[#a0a0a0]">{s.address}</p>
                  <ul className="mt-2 space-y-1 text-xs">
                    {s.connectors.map((c, i) => (
                      <li key={i} className="flex justify-between">
                        <span>{c.type}</span>
                        <span className="text-[#4CAF50]">{c.powerKW} kW</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex gap-2">
                    {user ? (
                      <button
                        onClick={async () => {
                          const status = prompt("Status? (available/busy/broken)");
                          const rating = prompt("Rating 1-5?");
                          if (status && rating) {
                            await supabase.from("checkins").insert({
                              station_id: s.id,
                              user_id: user.id,
                              status,
                              rating: Number(rating),
                            });
                            alert("Check-in saved!");
                          }
                        }}
                        className="rounded bg-[#4CAF50] px-2 py-1 text-xs font-bold text-[#121212]"
                      >
                        Check In
                      </button>
                    ) : (
                      <span className="text-[10px] text-[#737373]">
                        Sign in to check in
                      </span>
                    )}
                    <button
                      onClick={handleBoostCheckout}
                      className="rounded bg-[#FFD600] px-2 py-1 text-xs font-bold text-[#121212]"
                    >
                      Boost $2.99
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
          {routeLine && (
            <>
              <Polyline positions={routeLine} color="#4CAF50" weight={4} />
              {routePoints.from && (
                <Circle
                  center={[routePoints.from.lat, routePoints.from.lng]}
                  radius={200}
                  pathOptions={{ color: "#4CAF50", fillColor: "#4CAF50" }}
                />
              )}
              {routePoints.to && (
                <Circle
                  center={[routePoints.to.lat, routePoints.to.lng]}
                  radius={200}
                  pathOptions={{ color: "#4CAF50", fillColor: "#4CAF50" }}
                />
              )}
            </>
          )}
        </MapContainer>

        {/* Loading / Error overlays */}
        {loading && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rounded-xl bg-[#1e1e1e]/90 px-4 py-2 text-sm text-[#ededed] shadow-lg">
              Loading chargers...
            </div>
          </div>
        )}
        {error && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-xl bg-[#F44336]/90 px-4 py-2 text-sm text-white shadow-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
