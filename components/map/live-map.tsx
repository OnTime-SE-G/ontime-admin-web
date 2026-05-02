"use client";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";
import { useBusTracking } from "@/app/hooks/useBusTracking";

type LiveMapProps = {
  routeLabel: string;
};

const MAPBOX_TOKEN =
  "pk.eyJ1Ijoia2FsYW5hbGl5YW5hZ2UiLCJhIjoiY21vaDNyeGE3MDI0aDJwc2FmcWE5eG9meCJ9.36vlcSsm6E91cvh8F9f8XA";

// One colour per bus
const BUS_COLORS: Record<string, string> = {
  "BUS-01": "#004ac6",
  "BUS-02": "#f59e0b",
  "BUS-03": "#ef4444",
};
const DEFAULT_COLOR = "#64748b";

const routeCoordinates: [number, number][] = [
  [79.8612, 6.9271],
  [79.8706, 6.9004],
  [79.8853, 6.8659],
];

function makeBusMarkerEl(busId: string): HTMLDivElement {
  const color = BUS_COLORS[busId] ?? DEFAULT_COLOR;
  const el = document.createElement("div");
  el.style.cssText = "width:36px;height:36px;cursor:pointer";
  el.innerHTML = `
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style="filter:drop-shadow(0 2px 8px rgba(0,0,0,0.3))">
      <circle cx="20" cy="20" r="18" fill="${color}"/>
      <rect x="12" y="13" width="16" height="12" rx="2" fill="white"/>
      <rect x="14" y="14" width="4"  height="3"  rx="1" fill="${color}"/>
      <rect x="22" y="14" width="4"  height="3"  rx="1" fill="${color}"/>
      <path d="M20 4 L23 9 L20 7.5 L17 9 Z" fill="white" opacity="0.9"/>
    </svg>`;
  return el;
}

function popupHtml(
  busId: string,
  routeId: string,
  routeLabel: string,
  speed: number,
  eta: number | undefined,
  status: string,
  driverName: string,
) {
  const statusColor = status === "active" ? "#16a34a" : "#ef4444";
  const statusText  = status === "active" ? "On Time"  : "Delayed";
  return `
    <div style="font-family:sans-serif;font-size:13px;line-height:1.7;min-width:160px">
      <strong style="font-size:14px">${busId}</strong><br/>
      <span style="color:#64748b">Route ${routeId} · ${routeLabel}</span><br/>
      Driver: ${driverName}<br/>
      Speed: <strong>${Math.round(speed)} km/h</strong><br/>
      ETA: <strong>${eta ?? "—"} min</strong><br/>
      Status: <span style="color:${statusColor};font-weight:700">${statusText}</span>
    </div>`;
}

export function LiveMap({ routeLabel }: LiveMapProps) {
  const mapRef   = useRef<HTMLDivElement | null>(null);
  const mapObj   = useRef<mapboxgl.Map | null>(null);
  const markers  = useRef<Record<string, mapboxgl.Marker>>({});

  // ── FIX: only place markers after the map style has fully loaded ─────────
  // Without this guard, if the socket fires before the Mapbox "load" event,
  // addTo() is called on an unready map and the marker is silently dropped.
  const mapReady = useRef(false);

  // ── Live socket data ──────────────────────────────────────────────────────
  const { buses, connectionStatus } = useBusTracking();

  // ── Map init (runs once) ──────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mapObj.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    mapObj.current = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [79.8612, 6.9271],
      zoom: 11,
    });

    mapObj.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    mapObj.current.on("load", () => {
      // ── Mark map as ready before doing anything else ──────────────────
      mapReady.current = true;

      const m = mapObj.current!;

      m.addSource("route-line", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: { type: "LineString", coordinates: routeCoordinates },
          properties: {},
        },
      });
      m.addLayer({
        id: "route-line-layer",
        type: "line",
        source: "route-line",
        paint: { "line-color": "#004ac6", "line-width": 5 },
      });
    });

    return () => {
      mapReady.current = false; // reset so re-mount starts clean
      mapObj.current?.remove();
      mapObj.current = null;
    };
  }, []);

  // ── Sync markers on every socket update ───────────────────────────────────
  useEffect(() => {
    // Guard: need both the Map object AND the loaded style
    if (!mapObj.current || !mapReady.current) return;

    buses.forEach((bus) => {
      const lngLat: [number, number] = [bus.lng, bus.lat];

      if (markers.current[bus.busId]) {
        // Update position only — no re-create, no flicker
        markers.current[bus.busId].setLngLat(lngLat);

        // Refresh popup HTML so speed / ETA stay current when opened
        markers.current[bus.busId].getPopup()?.setHTML(
          popupHtml(bus.busId, bus.routeId, routeLabel, bus.speed, bus.eta, bus.status, bus.driverName)
        );
      } else {
        // First time seeing this bus — create marker + popup
        const el    = makeBusMarkerEl(bus.busId);
        const popup = new mapboxgl.Popup({ offset: 14, closeButton: false })
          .setHTML(popupHtml(bus.busId, bus.routeId, routeLabel, bus.speed, bus.eta, bus.status, bus.driverName));

        markers.current[bus.busId] = new mapboxgl.Marker({
          element: el,
          rotationAlignment: "map",
        })
          .setLngLat(lngLat)
          .setPopup(popup)
          .addTo(mapObj.current!);
      }
    });

    // Remove markers for buses that are no longer in the store
    Object.keys(markers.current).forEach((id) => {
      if (!buses.has(id)) {
        markers.current[id].remove();
        delete markers.current[id];
      }
    });
  }, [buses, routeLabel]);

  const busCount = buses.size;

  return (
    <div style={{ position: "relative" }}>
      {/* Map */}
      <div ref={mapRef} className="h-[60vh] w-full rounded-xl" />

      {/* Live connection badge — top-left */}
      <div style={{
        position: "absolute", top: 12, left: 12, zIndex: 10,
        display: "flex", alignItems: "center", gap: 6,
        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(6px)",
        padding: "5px 12px", borderRadius: 999,
        boxShadow: "0 1px 6px rgba(0,0,0,0.15)",
        fontSize: 12, fontWeight: 700, color: "#334155",
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%", display: "inline-block",
          background:
            connectionStatus === "connected"  ? "#22c55e" :
            connectionStatus === "connecting" ? "#f59e0b" : "#ef4444",
        }} />
        {connectionStatus === "connected"
          ? `Live · ${busCount} bus${busCount !== 1 ? "es" : ""}`
          : connectionStatus === "connecting"
            ? "Connecting…"
            : "Disconnected"}
      </div>
    </div>
  );
}