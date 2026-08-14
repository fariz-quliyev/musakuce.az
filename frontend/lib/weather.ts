/**
 * Musaküçə (Masallı rayonu, Azərbaycan) üçün cari hava + 5 günlük
 * proqnoz — Open-Meteo-dan (açar tələb etmir, pulsuzdur) çəkilir.
 * Server tərəfində işləyir (Next.js fetch cache, bax aşağıda); brauzerə
 * heç bir sorğu məntiqi ötürülmür. Uğursuz olarsa `null` qaytarılır —
 * çağıran tərəf (HeroWeather) belə halda sakit bir fallback göstərir,
 * heç vaxt uydurma dəyərlər deyil.
 *
 * Koordinatlar Vikipediyadan təsdiqlənib: Musakücə, Masally Rayon,
 * Azerbaijan — 39°00′31″N 48°41′56″E (39.00861°N, 48.69889°E).
 * https://en.wikipedia.org/wiki/Musak%C3%BCc%C9%99
 */

const LATITUDE = 39.00861;
const LONGITUDE = 48.69889;

const LOCATION_LABEL = "Musaküçə, Masallı";

export type WeatherCondition = "clear" | "cloudy" | "fog" | "rain" | "snow" | "storm";

export interface DailyForecast {
  date: string;
  dayLabel: string;
  condition: WeatherCondition;
  label: string;
  highC: number;
  lowC: number;
}

export interface VillageWeather {
  locationLabel: string;
  dateLabel: string;
  temperatureC: number;
  feelsLikeC: number;
  condition: WeatherCondition;
  label: string;
  todayHighC: number;
  todayLowC: number;
  days: DailyForecast[];
}

const DAY_LABELS = ["B.", "B.e.", "Ç.a.", "Ç.", "C.a.", "C.", "Ş."]; // Date.getDay(): 0=Bazar..6=Şənbə
const MONTH_LABELS = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr",
];

/** WMO weather-code cədvəli (Open-Meteo) — AZ tərcümə. */
function describeWeatherCode(code: number): { condition: WeatherCondition; label: string } {
  if (code === 0) return { condition: "clear", label: "Açıq" };
  if (code === 1) return { condition: "clear", label: "Əsasən açıq" };
  if (code === 2) return { condition: "cloudy", label: "Az buludlu" };
  if (code === 3) return { condition: "cloudy", label: "Buludlu" };
  if (code === 45 || code === 48) return { condition: "fog", label: "Duman" };
  if (code >= 51 && code <= 57) return { condition: "rain", label: "Çisək" };
  if (code >= 61 && code <= 67) return { condition: "rain", label: "Yağış" };
  if (code >= 71 && code <= 77) return { condition: "snow", label: "Qar" };
  if (code >= 80 && code <= 82) return { condition: "rain", label: "Sağanaq yağış" };
  if (code >= 85 && code <= 86) return { condition: "snow", label: "Qar yağıntısı" };
  if (code >= 95) return { condition: "storm", label: "Şimşəkli" };
  return { condition: "cloudy", label: "Buludlu" };
}

/**
 * Open-Meteo sorğusu. Next.js-in fetch keşi ilə 30 dəqiqə saxlanılır
 * (`next.revalidate`) — hər səhifə yükləməsində yeni sorğu getmir.
 */
export async function getVillageWeather(): Promise<VillageWeather | null> {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}` +
      `&current=temperature_2m,apparent_temperature,weather_code` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
      `&timezone=auto&forecast_days=6`;
    const response = await fetch(url, { next: { revalidate: 1800 } });
    if (!response.ok) return null;

    const data = (await response.json()) as {
      current?: { temperature_2m?: number; apparent_temperature?: number; weather_code?: number };
      daily?: {
        time?: string[];
        weather_code?: number[];
        temperature_2m_max?: number[];
        temperature_2m_min?: number[];
      };
    };

    if (
      data.current?.temperature_2m === undefined ||
      data.current?.weather_code === undefined ||
      !data.daily?.time ||
      data.daily.temperature_2m_max === undefined ||
      data.daily.temperature_2m_min === undefined
    ) {
      return null;
    }

    const { condition, label } = describeWeatherCode(data.current.weather_code);
    const today = new Date();

    const days: DailyForecast[] = data.daily.time.slice(1, 6).map((date, i) => {
      const dayIndex = i + 1;
      const code = data.daily!.weather_code?.[dayIndex] ?? 0;
      const desc = describeWeatherCode(code);
      return {
        date,
        dayLabel: DAY_LABELS[new Date(date).getDay()],
        condition: desc.condition,
        label: desc.label,
        highC: Math.round(data.daily!.temperature_2m_max?.[dayIndex] ?? 0),
        lowC: Math.round(data.daily!.temperature_2m_min?.[dayIndex] ?? 0),
      };
    });

    return {
      locationLabel: LOCATION_LABEL,
      dateLabel: `Bu gün, ${today.getDate()} ${MONTH_LABELS[today.getMonth()]}`,
      temperatureC: Math.round(data.current.temperature_2m),
      feelsLikeC: Math.round(data.current.apparent_temperature ?? data.current.temperature_2m),
      condition,
      label,
      todayHighC: Math.round(data.daily.temperature_2m_max[0] ?? data.current.temperature_2m),
      todayLowC: Math.round(data.daily.temperature_2m_min[0] ?? data.current.temperature_2m),
      days,
    };
  } catch {
    return null;
  }
}
