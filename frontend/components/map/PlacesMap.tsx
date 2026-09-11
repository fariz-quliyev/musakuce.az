"use client";

import { useState } from "react";
import { MapContainer, TileLayer, LayersControl, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createPlaceIcon, createUserLocationIcon } from "./placeMarkerIcon";
import { placeCategoryLabels } from "@/lib/api/labels";
import type { PlaceDto } from "@/lib/api/types";

// Musaküçə, Masallı — verified against Wikipedia (39°00′31″N 48°41′56″E),
// same source used for the homepage weather widget (lib/weather.ts). Do
// not replace with an approximated or unrelated-village coordinate.
const VILLAGE_CENTER: [number, number] = [39.00861, 48.69889];
const INITIAL_ZOOM = 15;

function LocateControl() {
  const map = useMap();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [position, setPosition] = useState<[number, number] | null>(null);

  function handleLocate() {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (result) => {
        const next: [number, number] = [result.coords.latitude, result.coords.longitude];
        setPosition(next);
        setStatus("idle");
        map.flyTo(next, Math.max(map.getZoom(), 15), { duration: 0.8 });
      },
      () => setStatus("error"),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  return (
    <>
      <div className="absolute top-3 right-3 z-[1000] flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={handleLocate}
          disabled={status === "loading"}
          className="flex items-center gap-1.5 rounded-full border border-stone-light bg-paper px-3.5 py-2 text-xs font-semibold text-forest-dark shadow-md transition-colors hover:bg-paper-soft disabled:opacity-60"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5 shrink-0">
            <path
              d="M10 18s5.5-5.1 5.5-9.2A5.5 5.5 0 0 0 4.5 8.8C4.5 12.9 10 18 10 18Z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <circle cx="10" cy="8.6" r="1.8" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          {status === "loading" ? "Axtarılır…" : "Yerimi göstər"}
        </button>
        {status === "error" ? (
          <p className="max-w-[180px] rounded-md bg-paper px-2.5 py-1.5 text-right text-[11px] text-danger shadow-md">
            Məkanınız müəyyən edilə bilmədi.
          </p>
        ) : null}
      </div>
      {position ? (
        <Marker position={position} icon={createUserLocationIcon()}>
          <Popup>Siz buradasınız</Popup>
        </Marker>
      ) : null}
    </>
  );
}

type Props = {
  places: PlaceDto[];
  selectedId?: string | null;
  onSelect?: (place: PlaceDto) => void;
  /**
   * Homepage preview mode: the street layer only (no layer switcher, no
   * "Yerimi göstər"), framed to fit every published place, and it never
   * captures page scrolling — no wheel zoom, and no one-finger drag on
   * touch screens, where it would trap the visitor's scroll. Markers and
   * their popups work as on /xerite; the +/− buttons still zoom.
   */
  preview?: boolean;
};

const STREET_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> müəllifləri';
const STREET_TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

/**
 * Real Leaflet map (OpenStreetMap street tiles + Esri satellite +
 * OpenTopoMap relief as switchable base layers — all keyless/free, same
 * no-API-key approach as the original OSM layer). Loaded exclusively
 * via next/dynamic({ ssr: false }) from XeriteMapView — Leaflet reaches
 * for `window`/`document` at module init, which breaks SSR/hydration if
 * imported any other way.
 */
export function PlacesMap({ places, selectedId = null, onSelect, preview = false }: Props) {
  // react-leaflet only fits `bounds` when center/zoom are absent, so the
  // preview passes one or the other. Client-only module: window is safe.
  const fitToPlaces = preview && places.length > 0;
  const bounds = fitToPlaces
    ? L.latLngBounds([VILLAGE_CENTER, ...places.map((p): [number, number] => [p.latitude, p.longitude])])
    : undefined;
  const isTouch = window.matchMedia("(pointer: coarse)").matches;

  return (
    <MapContainer
      center={fitToPlaces ? undefined : VILLAGE_CENTER}
      zoom={fitToPlaces ? undefined : INITIAL_ZOOM}
      bounds={bounds}
      boundsOptions={{ padding: [40, 40], maxZoom: 16 }}
      minZoom={12}
      maxZoom={18}
      scrollWheelZoom={!preview}
      dragging={!(preview && isTouch)}
      style={{ height: "100%", width: "100%" }}
    >
      {preview ? (
        <TileLayer attribution={STREET_ATTRIBUTION} url={STREET_TILES} />
      ) : (
        <LayersControl position="topleft">
          <LayersControl.BaseLayer checked name="Standart">
            <TileLayer attribution={STREET_ATTRIBUTION} url={STREET_TILES} />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Peyk">
            <TileLayer
              attribution="&copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxNativeZoom={18}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Relyef">
            <TileLayer
              attribution='Xəritə: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA) &mdash; Data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> müəllifləri, SRTM'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              maxNativeZoom={17}
            />
          </LayersControl.BaseLayer>
        </LayersControl>
      )}
      {places.map((place) => (
        <Marker
          key={place.id}
          position={[place.latitude, place.longitude]}
          icon={createPlaceIcon(place.kind, place.category, place.id === selectedId)}
          eventHandlers={onSelect ? { click: () => onSelect(place) } : undefined}
        >
          <Popup>
            <div className="min-w-[160px] max-w-[220px]">
              <p className="font-display text-sm text-ink">{place.name}</p>
              <p className="mt-0.5 text-xs text-ink-faint">
                {place.category ? placeCategoryLabels[place.category] : place.kind}
              </p>
              {place.description ? (
                <p className="mt-1.5 line-clamp-2 text-xs text-ink-soft">{place.description}</p>
              ) : null}
            </div>
          </Popup>
        </Marker>
      ))}
      {preview ? null : <LocateControl />}
    </MapContainer>
  );
}

export default PlacesMap;
