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
 * Real, live weather for Musaküçə (Open-Meteo, see lib/weather.ts) —
 * overlaid on the hero photo's top-left corner, styled as a warm
 * translucent glass card rather than a generic weather-app widget. Never
 * shows fabricated data: if the API is unreachable, a single quiet line
 * takes its place instead of the full card.
 *
 * Sized as a secondary hero element, not a competing focal point: ~30%
 * narrower and every internal size step (icon/temperature/forecast row)
 * scaled down to match, so the village name + intro + CTAs stay the
 * hero's primary visual weight. Functionality/data untouched.
 */
export async function HeroWeather() {
  const weather = await getVillageWeather();

  if (!weather) {
    return (
      <div className="rounded-lg border border-cream/15 bg-ink/45 px-3 py-2 text-[11px] text-cream/70 shadow-md backdrop-blur-md">
        Hava məlumatı hazırda əlçatan deyil
      </div>
    );
  }

  return (
    <div
      className="w-[172px] rounded-lg border border-cream/15 bg-ink/45 p-2.5 text-cream shadow-lg backdrop-blur-md sm:w-[206px] sm:rounded-xl sm:p-3"
      aria-label={`Musaküçədə hava: ${weather.temperatureC} dərəcə, ${weather.label.toLowerCase()}, hiss olunur ${weather.feelsLikeC} dərəcə`}
    >
      <div className="flex items-center justify-between gap-1.5 text-[9px] text-cream/70 sm:text-[10px]">
        <span className="flex items-center gap-1 truncate">
          <PinIcon />
          {weather.locationLabel}
        </span>
        <span className="shrink-0">{weather.dateLabel}</span>
      </div>

      <div className="mt-1.5 flex items-center gap-1.5 sm:mt-2 sm:gap-2">
        <WeatherIcon condition={weather.condition} className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" />
        <p className="font-display text-base leading-none text-cream sm:text-xl">{weather.temperatureC}°C</p>
        <div className="ml-auto text-right text-[9px] leading-tight text-cream/85 sm:text-[10px]">
          <p className="font-medium">{weather.label}</p>
          <p className="text-cream/65">Hiss olunur {weather.feelsLikeC}°C</p>
        </div>
      </div>

      <div className="mt-2 hidden border-t border-cream/15 pt-2 sm:grid sm:grid-cols-5 sm:gap-0.5">
        {weather.days.map((day) => (
          <div key={day.date} className="flex flex-col items-center gap-0.5 text-center">
            <span className="text-[9px] text-cream/70">{day.dayLabel}</span>
            <WeatherIcon condition={day.condition} className="h-3.5 w-3.5" />
            <span className="text-[10px] font-semibold">{day.highC}°</span>
            <span className="text-[9px] text-cream/55">{day.lowC}°</span>
          </div>
        ))}
      </div>
    </div>
  );
}
