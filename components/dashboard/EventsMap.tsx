"use client";

import React, { useEffect, useRef } from "react";
import centroids from "./countryCentroids";

interface EventLocation {
  event_id: number;
  name?: string | null;
  event_name?: string | null;
  coordinates?: any;
  affected_countries?: any;
}

interface Props {
  events: EventLocation[];
  highlightedEventId?: number | null;
}

export default function EventsMap({ events, highlightedEventId }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layersRef = useRef<any>({ markers: [], polylines: [] });
  const [mapAvailable, setMapAvailable] = React.useState(false);

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!ref.current) return;

      // ensure leaflet css
      if (typeof document !== "undefined" && !document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // try to import leaflet npm package first
      let L: any = null;
      try {
        L = await import("leaflet");
      } catch (e) {
        // fallback: load from CDN
        console.warn("leaflet import failed, loading from CDN", e);
        if (typeof document !== "undefined" && !document.getElementById("leaflet-js")) {
          const script = document.createElement("script");
          script.id = "leaflet-js";
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.async = true;
          document.body.appendChild(script);

          // wait for window.L to be defined with timeout
          const waitForL = () =>
            new Promise<void>((resolve, reject) => {
              const start = Date.now();
              const iv = setInterval(() => {
                if ((window as any).L) {
                  clearInterval(iv);
                  resolve();
                }
                if (Date.now() - start > 10000) {
                  clearInterval(iv);
                  reject(new Error("leaflet CDN load timeout"));
                }
              }, 200);
            });

          try {
            await waitForL();
            L = (window as any).L;
          } catch (err) {
            console.warn("Leaflet CDN failed to load", err);
            return;
          }
        } else {
          L = (window as any).L;
          if (!L) return;
        }
      }

      if (!mounted) return;

      // ensure global reference
      try {
        (window as any).L = L;
      } catch (e) {
        /* ignore */
      }

      mapRef.current = L.map(ref.current, { preferCanvas: true }).setView([20, 0], 2);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current);
      setMapAvailable(true);
    }

    init();

    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // update markers & polylines
    if (!mapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    // clear existing
    layersRef.current.markers.forEach((m: any) => mapRef.current.removeLayer(m));
    layersRef.current.polylines.forEach((p: any) => mapRef.current.removeLayer(p));
    layersRef.current = { markers: [], polylines: [] };

    for (const ev of events) {
      const coords = ev.coordinates;
      if (!coords || !Array.isArray(coords)) continue;

      // normalize: coordinates may be [lon, lat] or {lat,lon}
      let lat = 0,
        lon = 0;
      if (Array.isArray(coords) && coords.length >= 2) {
        // sample data uses [lon, lat]
        lon = Number(coords[0]);
        lat = Number(coords[1]);
      } else if (coords && typeof coords.lat === "number" && typeof coords.lon === "number") {
        lat = coords.lat;
        lon = coords.lon;
      }

      const marker = L.circleMarker([lat, lon], { radius: 6, color: ev.event_id === highlightedEventId ? "#ef4444" : "#3182bd" }).addTo(mapRef.current);
      marker.bindTooltip((ev.event_name ?? ev.name) || String(ev.event_id));
      layersRef.current.markers.push(marker);

      // add affected country markers if present with coords — try centroid lookup when coords missing
      if (Array.isArray(ev.affected_countries)) {
        for (const ac of ev.affected_countries) {
          if (!ac) continue;
          // support objects like { coordinates: [lon, lat] } or { lat, lon }
          let aLat: number | null = null;
          let aLon: number | null = null;
          if (Array.isArray(ac.coordinates) && ac.coordinates.length >= 2) {
            aLon = Number(ac.coordinates[0]);
            aLat = Number(ac.coordinates[1]);
          } else if (ac.lat && ac.lon) {
            aLat = Number(ac.lat);
            aLon = Number(ac.lon);
          }

          // fallback: country centroid lookup by iso3
          if ((aLat == null || aLon == null) && ac.iso3 && centroids) {
            const cent = centroids[ac.iso3];
            if (cent) {
              aLat = cent[0];
              aLon = cent[1];
            }
          }

          if (aLat != null && aLon != null) {
            const m2 = L.circleMarker([aLat, aLon], { radius: 4, color: "#f59e0b" }).addTo(mapRef.current);
            m2.bindTooltip(ac.countryname ?? ac.country ?? ac.name ?? "");
            layersRef.current.markers.push(m2);

            // draw polyline when highlighted
            if (ev.event_id === highlightedEventId) {
              const pl = L.polyline([[lat, lon], [aLat, aLon]], { color: "#f97316", weight: 2 }).addTo(mapRef.current);
              layersRef.current.polylines.push(pl);
            }
          }
        }
      }
    }
  }, [events, highlightedEventId]);

  return (
    <div style={{ width: "100%", height: 300, borderRadius: 8, overflow: "hidden", position: 'relative' }}>
      <div ref={ref} style={{ width: '100%', height: '100%' }} />
      {!mapAvailable && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', pointerEvents: 'none' }}>
          <div className="text-sm">Map loading or unavailable — install "leaflet" or allow CDN load to enable interactive map</div>
        </div>
      )}
    </div>
  );
}
