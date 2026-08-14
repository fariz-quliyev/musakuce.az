"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Same verified Musaküçə center used by the public map (components/map/PlacesMap.tsx).
const VILLAGE_CENTER: [number, number] = [39.00861, 48.69889];

const markerIcon = L.divIcon({
  html: `<div style="width:16px;height:16px;border-radius:9999px;background:#b15e3b;border:2.5px solid #fffdf8;box-shadow:0 0 0 3px rgba(177,94,59,0.3);"></div>`,
  className: "musakuce-picker-marker",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

type Props = {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
};

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)));
    },
  });
  return null;
}

/**
 * Minimal "pick a point on the map" helper — a single draggable marker,
 * no search/geocoding, per the instruction not to over-build this.
 * Latitude/longitude inputs stay the source of truth; this is only a
 * convenience for filling them in.
 */
export function PlaceMapPicker({ latitude, longitude, onChange }: Props) {
  const position: [number, number] =
    Number.isFinite(latitude) && Number.isFinite(longitude) ? [latitude, longitude] : VILLAGE_CENTER;

  return (
    <MapContainer center={position} zoom={15} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> müəllifləri'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker
        position={position}
        icon={markerIcon}
        draggable
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target as L.Marker;
            const pos = marker.getLatLng();
            onChange(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)));
          },
        }}
      />
      <ClickHandler onChange={onChange} />
    </MapContainer>
  );
}

export default PlaceMapPicker;
