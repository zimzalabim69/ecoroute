"use client";

import { useEffect } from "react";
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
  centerLat: number,
  centerLng: number
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

  // Dense grid: 30x30 cells across the visible area
  const cols = 30;
  const rows = Math.round(cols * (canvas.height / canvas.width));
  const latStep = latRange / rows;
  const lngStep = lngRange / cols;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lat = south + r * latStep + latStep / 2;
      const lng = west + c * lngStep + lngStep / 2;
      const { score } = computeCrimeRisk(lat, lng, centerLat, centerLng);

      // Only draw heat for non-safe areas
      if (score < 30) continue;

      const point = map.latLngToContainerPoint([lat, lng]);
      const radius = Math.max(
        8,
        Math.min(40, (canvas.width / cols) * 1.5)
      );

      const gradient = ctx.createRadialGradient(
        point.x,
        point.y,
        0,
        point.x,
        point.y,
        radius
      );

      // Color based on score: 30-40 transparent, 40-70 yellow, 70-100 red
      const intensity = Math.min(1, (score - 30) / 70);
      if (score >= 70) {
        gradient.addColorStop(0, `rgba(244, 67, 54, ${intensity * 0.55})`);
        gradient.addColorStop(0.6, `rgba(244, 67, 54, ${intensity * 0.25})`);
        gradient.addColorStop(1, "rgba(244, 67, 54, 0)");
      } else {
        gradient.addColorStop(0, `rgba(255, 214, 0, ${intensity * 0.45})`);
        gradient.addColorStop(0.6, `rgba(255, 214, 0, ${intensity * 0.2})`);
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
    canvas.style.mixBlendMode = "screen";

    const container = map.getContainer();
    container.appendChild(canvas);

    const redraw = () => {
      drawHeatmap(canvas, map, center[0], center[1]);
    };

    redraw();
    map.on("moveend zoomend resize", redraw);

    return () => {
      map.off("moveend zoomend resize", redraw);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, [map, center, visible]);

  return null;
}
