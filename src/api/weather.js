import { OPENWEATHER_BASE, ONECALL_BASE, OPENWEATHER_KEY, getJson, ApiError } from './config';

// All requests use metric units; the UI converts to °F on the client so a unit
// toggle never triggers a refetch.
const unitParam = 'units=metric';

/**
 * Current conditions by city name.
 * Returns the raw OpenWeatherMap payload (it already includes `coord`,
 * which we reuse for the forecast and air-quality lookups).
 */
export async function getCurrentByCity(city) {
  const q = encodeURIComponent(city.trim());
  const url = `${OPENWEATHER_BASE}/weather?q=${q}&${unitParam}&appid=${OPENWEATHER_KEY}`;
  return getJson(url);
}

/** Current conditions by coordinates (used for geolocation). */
export async function getCurrentByCoords(lat, lon) {
  const url = `${OPENWEATHER_BASE}/weather?lat=${lat}&lon=${lon}&${unitParam}&appid=${OPENWEATHER_KEY}`;
  return getJson(url);
}

/**
 * 5-day / 3-hour forecast, collapsed into one entry per day.
 *
 * The old app called the retired `2.5/onecall?q=city` endpoint, which never
 * accepted a city name and is no longer free. `2.5/forecast` is on the free
 * tier and works with coordinates, so we aggregate its 3-hourly points into
 * daily min/max with a representative midday icon.
 */
export async function getDailyForecast(lat, lon) {
  const url = `${OPENWEATHER_BASE}/forecast?lat=${lat}&lon=${lon}&${unitParam}&appid=${OPENWEATHER_KEY}`;
  const data = await getJson(url);
  if (!data || !Array.isArray(data.list)) {
    throw new ApiError('Forecast unavailable for this location.');
  }
  return aggregateDaily(data.list);
}

/**
 * One Call API 3.0 — richer bundle (UV, weather alerts, extended daily). This
 * lives on a separate OpenWeather subscription that is free but must be enabled
 * on the account, so callers treat it as best-effort: a 401 here just means the
 * subscription isn't active and the rest of the dashboard carries on.
 */
export async function getOneCall(lat, lon) {
  const url = `${ONECALL_BASE}/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely&appid=${OPENWEATHER_KEY}`;
  return getJson(url);
}

function aggregateDaily(list) {
  const byDay = new Map();

  for (const point of list) {
    // dt is UTC seconds; group by local-ish calendar day using the API's dt_txt.
    const dayKey = point.dt_txt ? point.dt_txt.split(' ')[0] : new Date(point.dt * 1000).toISOString().slice(0, 10);
    if (!byDay.has(dayKey)) {
      byDay.set(dayKey, { dayKey, dt: point.dt, points: [] });
    }
    byDay.get(dayKey).points.push(point);
  }

  const today = new Date().toISOString().slice(0, 10);

  return Array.from(byDay.values())
    .filter((d) => d.dayKey >= today) // drop any stale leading day
    .slice(0, 5)
    .map((day) => {
      const temps = day.points.map((p) => p.main.temp);
      const min = Math.min(...day.points.map((p) => p.main.temp_min));
      const max = Math.max(...day.points.map((p) => p.main.temp_max));

      // Pick the point closest to 12:00 as the day's representative weather/icon.
      const midday =
        day.points.find((p) => p.dt_txt && p.dt_txt.includes('12:00:00')) ||
        day.points[Math.floor(day.points.length / 2)];

      return {
        date: day.dayKey,
        dt: midday.dt,
        min: Math.round(min),
        max: Math.round(max),
        avg: Math.round(temps.reduce((a, b) => a + b, 0) / temps.length),
        icon: midday.weather[0].icon,
        condition: midday.weather[0].main,
        description: midday.weather[0].description,
        humidity: midday.main.humidity,
        wind: midday.wind ? midday.wind.speed : null,
      };
    });
}
