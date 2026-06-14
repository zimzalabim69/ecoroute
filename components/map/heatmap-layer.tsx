"use client";

import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { computeCrimeRisk } from "@/lib/crime-heuristic";

interface HeatmapLayerProps {
  center: [number, number];
  visible: boolean;
}

function drawHeatmap(
  canvas: HTMLCanvasElement,
  map: L.Map,
  cityCenter: [number, number]
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const size = map.getSize();
  canvas.width = size.x;
  canvas.height = size.y;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const bounds = map.getBounds();
  const north = bounds.getNorth();
  const south = bounds.getSouth();
  const east = bounds.getEast();
  const west = bounds.getWest();

  const latRange = north - south;
  const lngRange = east - west;

  // Dense grid: 40x40 cells across the visible area
  const cols = 40;
  const rows = Math.round(cols * (canvas.height / canvas.width));
  const latStep = latRange / rows;
  const lngStep = lngRange / cols;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lat = south + r * latStep + latStep / 2;
      const lng = west + c * lngStep + lngStep / 2;
      const { score } = computeCrimeRisk(lat, lng, cityCenter[0], cityCenter[1]);

      // Only draw heat for non-safe areas
      if (score < 30) continue;

      const point = map.latLngToContainerPoint([lat, lng]);
      const radius = Math.max(
        12,
        Math.min(60, (canvas.width / cols) * 2)
      );

      const gradient = ctx.createRadialGradient(
        point.x,
        point.y,
        0,
        point.x,
        point.y,
        radius
      );

      const intensity = Math.min(1, (score - 30) / 70);
      if (score >= 70) {
        gradient.addColorStop(0, `rgba(244, 67, 54, ${intensity * 0.7})`);
        gradient.addColorStop(0.5, `rgba(244, 67, 54, ${intensity * 0.35})`);
        gradient.addColorStop(1, "rgba(244, 67, 54, 0)");
      } else {
        gradient.addColorStop(0, `rgba(255, 214, 0, ${intensity * 0.6})`);
        gradient.addColorStop(0.5, `rgba(255, 214, 0, ${intensity * 0.25})`);
        gradient.addColorStop(1, "rgba(255, 214, 0, 0)");
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function HeatmapLayer({ center, visible }: HeatmapLayerProps) {
  const map = useMap();
  // Lock the city center on first mount so it doesn't move when user pans
  const [cityCenter] = useState<[number, number]>(() => center);

  useEffect(() => {
    if (!visible) return;

    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "500";

    const container = map.getContainer();
    container.appendChild(canvas);

    const redraw = () => {
      drawHeatmap(canvas, map, cityCenter);
    };

    redraw();
    map.on("moveend zoomend resize", redraw);

    return () => {
      map.off("moveend zoomend resize", redraw);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, [map, cityCenter, visible]);

  return null;
}
