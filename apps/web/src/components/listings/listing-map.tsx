'use client';

import { useEffect, useRef } from 'react';

/**
 * Interactive OpenStreetMap view centered on a listing's MLS coordinates.
 *
 * Leaflet (not MapLibre GL): the PDP needs one raster basemap and one marker, so
 * WebGL and vector tiles buy nothing — and MapLibre's style worker never
 * initializes under Next 16 + Turbopack here (the map constructs, then no
 * `styledata` and no error, so tiles are never requested).
 *
 * Leaflet and its stylesheet are dynamically imported inside the effect so
 * neither lands in the SSR/initial bundle. Tiles come straight from
 * tile.openstreetmap.org with the required attribution — fine at this traffic
 * level, but OSM's tile usage policy discourages heavy production use, so swap
 * only the tile URL below for a hosted provider if PDP traffic grows.
 */
export function ListingMap({
  lat,
  lon,
  label,
  zoom = 16,
}: {
  lat: number;
  lon: number;
  /** Accessible name for the map region, e.g. the street address. */
  label: string;
  zoom?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let map: { remove: () => void } | null = null;
    let cancelled = false;

    void (async () => {
      const [leaflet] = await Promise.all([import('leaflet'), import('leaflet/dist/leaflet.css')]);
      if (cancelled) return;

      const L = leaflet.default ?? leaflet;

      // On touch devices a one-finger drag inside a full-width map block
      // hijacks page scroll, trapping the reader mid-page. Panning is disabled
      // there and zooming stays available through the on-map control below.
      const isTouch = window.matchMedia('(pointer: coarse)').matches;

      const instance = L.map(container, {
        center: [lat, lon],
        zoom,
        // Ctrl/⌘ + scroll to zoom, so the page keeps scrolling normally.
        scrollWheelZoom: false,
        dragging: !isTouch,
        touchZoom: !isTouch,
        zoomControl: false,
        attributionControl: true,
      });

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(instance);

      L.control.zoom({ position: 'bottomleft' }).addTo(instance);

      // Navy teardrop pin in the app's own tokens rather than Leaflet's default blue marker.
      const pin = L.divIcon({
        className: '',
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        html: `<span class="bg-primary grid size-[34px] -rotate-45 place-items-center rounded-[50%_50%_50%_0] shadow-[0_10px_22px_-8px_rgba(8,26,48,.7),inset_0_0_0_2px_var(--accent)]"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="text-accent size-[15px] rotate-45" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg></span>`,
      });
      L.marker([lat, lon], { icon: pin, keyboard: false, alt: label }).addTo(instance);

      // The container is often still sizing when the library resolves, which leaves
      // the home off-center until Leaflet re-measures.
      instance.whenReady(() => {
        instance.invalidateSize();
        instance.setView([lat, lon], zoom);
      });

      map = instance;
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [lat, lon, zoom, label]);

  return (
    <div
      ref={containerRef}
      className="bg-surface-muted size-full"
      role="region"
      aria-label={`Map showing the location of ${label}`}
    />
  );
}
