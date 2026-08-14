import L from "leaflet";
import type { PlaceCategory, PlaceKind } from "@/lib/api/types";

// Matches app/globals.css design tokens (--color-terracotta / --color-forest
// / --color-paper) — kept as literal hex here since these strings are
// injected into a Leaflet DivIcon's HTML, outside Tailwind/CSS-var scope.
const HISTORICAL_COLOR = "#b15e3b";
const USEFUL_COLOR = "#2f4a3b";
const CREAM = "#fffdf8";

/**
 * One small glyph per PlaceCategory so markers are distinguishable by
 * shape, not only by the historical/useful color — screen-reader users
 * and colorblind users still get the category from the popup/card text,
 * but sighted users scanning the map shouldn't have to rely on color
 * alone (spec §14).
 */
function categoryGlyph(category: PlaceCategory | null, color: string): string {
  switch (category) {
    case "Mosque":
      return `<path d="M18.6 10.3a3.9 3.9 0 1 0 0 7.4 3.1 3.1 0 0 1 0-7.4Z" fill="${color}"/>`;
    case "Shrine":
      return `<path d="M16 9.5c1.8 2 2.6 3.6 2.6 5a2.6 2.6 0 1 1-5.2 0c0-.9.4-1.7 1-2.4.2.7.6 1 1 1 .1-1.4-.2-2.4.6-3.6Z" fill="${color}"/>`;
    case "Cemetery":
      return `<path d="M16 10v8M13.3 12.7h5.4" stroke="${color}" stroke-width="1.4" stroke-linecap="round"/>`;
    case "School":
      return `<path d="M11.5 12.4 16 10.7l4.5 1.7-4.5 1.7Z" stroke="${color}" stroke-width="1.3" stroke-linejoin="round" fill="none"/><path d="M13.2 13.6v2.6c0 .7 1.2 1.3 2.8 1.3s2.8-.6 2.8-1.3v-2.6" stroke="${color}" stroke-width="1.3" fill="none"/>`;
    case "Library":
      return `<rect x="12" y="10.5" width="8" height="7" rx="1" stroke="${color}" stroke-width="1.3" fill="none"/><path d="M14.3 10.5v7M17.7 10.5v7" stroke="${color}" stroke-width="1"/>`;
    case "Shop":
      return `<path d="M12.6 12.5h6.8l.6 6h-8Z" stroke="${color}" stroke-width="1.3" stroke-linejoin="round" fill="none"/><path d="M14.1 12.5a1.9 1.9 0 0 1 3.8 0" stroke="${color}" stroke-width="1.3" fill="none"/>`;
    case "Pharmacy":
      return `<circle cx="16" cy="14" r="4" stroke="${color}" stroke-width="1.3" fill="none"/><path d="M16 12.2v3.6M14.2 14h3.6" stroke="${color}" stroke-width="1.3" stroke-linecap="round"/>`;
    case "Doctor":
      return `<path d="M13.3 10.8v2.7a2.7 2.7 0 0 0 5.4 0v-2.7" stroke="${color}" stroke-width="1.3" stroke-linecap="round" fill="none"/><circle cx="19.2" cy="16.6" r="1.2" stroke="${color}" stroke-width="1.1" fill="none"/>`;
    case "TeaHouse":
      return `<path d="M12.6 12.6h6v3.2a3 3 0 0 1-6 0Z" stroke="${color}" stroke-width="1.3" stroke-linejoin="round" fill="none"/><path d="M18.6 13.1h1a1.4 1.4 0 0 1 0 2.8h-.9" stroke="${color}" stroke-width="1.2" fill="none"/>`;
    case "SportsArea":
      return `<circle cx="16" cy="14" r="4" stroke="${color}" stroke-width="1.3" fill="none"/><path d="M13.2 11.6 18.8 16.4M18.8 11.6 13.2 16.4" stroke="${color}" stroke-width="1.1"/>`;
    case "Service":
      return `<path d="M13.4 18.2 17 14.6" stroke="${color}" stroke-width="1.4" stroke-linecap="round"/><path d="M17.6 11.2a2.2 2.2 0 0 0 2.9 2.9l-1-1-.2-1.7-1.7-.2Z" fill="${color}"/>`;
    default:
      return `<circle cx="16" cy="14" r="1.7" fill="${color}"/>`;
  }
}

/** Pin marker with a category glyph inset — Historical (terracotta) vs
 * Useful (forest) mirrors the Badge tones already used across the site. */
export function createPlaceIcon(kind: PlaceKind, category: PlaceCategory | null, selected = false): L.DivIcon {
  const color = kind === "Historical" ? HISTORICAL_COLOR : USEFUL_COLOR;
  const scale = selected ? 1.15 : 1;
  const html = `
    <div style="transform: scale(${scale}); transform-origin: bottom center; filter: drop-shadow(0 3px 4px rgba(42,35,24,0.35));">
      <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 1.5C8.8 1.5 3 7.1 3 14c0 9.3 13 23.5 13 23.5S29 23.3 29 14c0-6.9-5.8-12.5-13-12.5Z" fill="${color}" stroke="${CREAM}" stroke-width="1.6"/>
        <circle cx="16" cy="14" r="8.5" fill="${CREAM}"/>
        ${categoryGlyph(category, color)}
      </svg>
    </div>`;

  return L.divIcon({
    html,
    className: "musakuce-place-marker",
    iconSize: [32, 40],
    iconAnchor: [16, 39],
    popupAnchor: [0, -32],
  });
}

/** Small dot for the visitor's own browser-geolocated position. */
export function createUserLocationIcon(): L.DivIcon {
  return L.divIcon({
    html: `<div style="width:16px;height:16px;border-radius:9999px;background:#3e6e82;border:2.5px solid ${CREAM};box-shadow:0 0 0 4px rgba(62,110,130,0.28);"></div>`,
    className: "musakuce-user-marker",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}
