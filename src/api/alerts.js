import { HAS_OPENWEATHER, ONECALL_BASE, OPENWEATHER_KEY, getJson } from './config';

/**
 * Severe-weather alerts from OpenWeather One Call 3.0 — the one source with no
 * keyless equivalent. Optional: without VITE_OPENWEATHER_KEY (or without the
 * free One Call subscription on that key) this resolves to [] and the alerts
 * card simply doesn't render.
 */
export async function getAlerts(lat, lon) {
  if (!HAS_OPENWEATHER) return [];
  const url = `${ONECALL_BASE}/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,daily&appid=${OPENWEATHER_KEY}`;
  const data = await getJson(url);
  return data && Array.isArray(data.alerts) ? data.alerts : [];
}
