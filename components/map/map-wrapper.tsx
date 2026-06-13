"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-[#121212] text-[#ededed]">
      <p>Loading map...</p>
    </div>
  ),
});

export default function MapWrapper() {
  return <LeafletMap />;
}
