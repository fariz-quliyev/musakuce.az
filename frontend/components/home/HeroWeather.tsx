import { getVillageWeather, type WeatherCondition } from "@/lib/weather";

const CONDITION_ICON_PATHS: Record<WeatherCondition, React.ReactNode> = {
  clear: (
    <>
      <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4M15.3 15.3l-1.4-1.4M6.1 6.1 4.7 4.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </>
  ),
  cloudy: (
    <path
      d="M6.5 14.5a3.5 3.5 0 0 1-.5-6.96 4 4 0 0 1 7.6-1.6A3.5 3.5 0 0 1 14 13.5v0"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  ),
  fog: (
    <>
      <path
        d="M6.5 10.5a3.5 3.5 0 0 1-.5-6.96 4 4 0 0 1 7.6-1.6A3.5 3.5 0 0 1 14 9.5v0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M3.5 13.5h13M4.5 16.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  rain: (
    <>
      <path
        d="M6.5 11.5a3.5 3.5 0 0 1-.5-6.96 4 4 0 0 1 7.6-1.6A3.5 3.5 0 0 1 14 10.5v0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M6.5 14.5 5.5 17M10 14.5 9 17M13.5 14.5l-1 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  snow: (
    <>
      <path
        d="M6.5 11.5a3.5 3.5 0 0 1-.5-6.96 4 4 0 0 1 7.6-1.6A3.5 3.5 0 0 1 14 10.5v0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 14.5v3M5.2 15.2l2.6 1.6M7.8 15.2l-2.6 1.6M13.5 14.5v3M12.2 15.2l2.6 1.6M14.8 15.2l-2.6 1.6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </>
  ),
  storm: (
    <>
      <path
        d="M6.5 10.5a3.5 3.5 0 0 1-.5-6.96 4 4 0 0 1 7.6-1.6A3.5 3.5 0 0 1 14 9.5v0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M10.5 12.5 8 16.5h3l-1.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

/** Decorative — the temperature/condition it represents is always
 * present as adjacent visible text, so screen readers get the same
 * information without needing a separate label on the icon itself. */
function WeatherIcon({ condition, className }: { condition: WeatherCondition; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={className}>
      {CONDITION_ICON_PATHS[condition]}
    </svg>
  );
}

function PinIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-3 w-3 shrink-0">
      <path
        d="M10 18s5.5-5.1 5.5-9.2A5.5 5.5 0 0 0 4.5 8.8C4.5 12.9 10 18 10 18Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="8.6" r="1.8" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/**
 * Real, live weather for Musaküçə (Open-Meteo, see lib/weather.ts),
 * overlaid on a hero corner. Deliberately just today: icon, temperature,
 * condition and the place it's for — a small fact about the village, not
 * a forecast panel competing with the greeting. The 5-day forecast, date
 * and "feels like" were dropped from the hero; lib/weather.ts still
 * provides them if another page ever wants them. No text below 12px.
 * Never shows fabricated data: if the API is unreachable, a single quiet
 * line takes its place.
 */
export async function HeroWeather() {
  const weather = await getVillageWeather();

  if (!weather) {
    return (
      <div className="rounded-lg border border-cream/15 bg-ink/45 px-3 py-2 text-xs text-cream/80 shadow-md backdrop-blur-md">
        Hava məlumatı hazırda əlçatan deyil
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2.5 rounded-lg border border-cream/15 bg-ink/45 px-3 py-2 text-cream shadow-lg backdrop-blur-md sm:rounded-xl"
      aria-label={`Musaküçədə hava: ${weather.temperatureC} dərəcə, ${weather.label.toLowerCase()}`}
    >
      <WeatherIcon condition={weather.condition} className="h-6 w-6 shrink-0" />
      <p className="font-display text-xl leading-none text-cream">{weather.temperatureC}°C</p>
      <div className="text-xs leading-tight">
        <p className="font-medium">{weather.label}</p>
        <p className="mt-0.5 flex items-center gap-1 text-cream/80">
          <PinIcon />
          {weather.locationLabel}
        </p>
      </div>
    </div>
  );
}
