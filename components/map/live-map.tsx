"use client";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";

type LiveMapProps = {
  routeLabel: string;
};

const MAPBOX_TOKEN =
  "pk.eyJ1Ijoia2FsYW5hbGl5YW5hZ2UiLCJhIjoiY21vaDNyeGE3MDI0aDJwc2FmcWE5eG9meCJ9.36vlcSsm6E91cvh8F9f8XA";

export function LiveMap({ routeLabel }: LiveMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [79.8612, 6.9271],
      zoom: 11,
    });

    const routeCoordinates: [number, number][] = [
      [79.8612, 6.9271],
      [79.8706, 6.9004],
      [79.8853, 6.8659],
    ];

    map.on("load", () => {
      map.addSource("route-line", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: routeCoordinates,
          },
          properties: {},
        },
      });

      map.addLayer({
        id: "route-line-layer",
        type: "line",
        source: "route-line",
        paint: {
          "line-color": "#004ac6",
          "line-width": 5,
        },
      });

      new mapboxgl.Marker({ color: "#22c55e" })
        .setLngLat(routeCoordinates[1])
        .setPopup(new mapboxgl.Popup().setText(`Bus on ${routeLabel}`))
        .addTo(map);
    });

    return () => map.remove();
  }, [routeLabel]);

  return <div ref={mapRef} className="h-[60vh] w-full rounded-xl" />;
}
