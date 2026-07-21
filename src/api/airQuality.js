import { OPENWEATHER_BASE, OPENWEATHER_KEY, getJson, ApiError } from './config';

/**
 * Air quality via OpenWeather's Air Pollution API (same free `appid` as the
 * weather calls). Coordinate-based, so the AQI reading stays aligned with the
 * place the weather describes. Replaces the former WAQI integration — one fewer
 * key to manage.
 *
 * OpenWeather reports a 1–5 index (1 Good … 5 Very Poor) plus raw pollutant
 * concentrations in µg/m³.
 */
export async function getAirQualityByCoords(lat, lon) {
  const url = `${OPENWEATHER_BASE}/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_KEY}`;
  return normalize(await getJson(url));
}

function normalize(payload) {
  const entry = payload && Array.isArray(payload.list) ? payload.list[0] : null;
  if (!entry || !entry.main) {
    throw new ApiError('Air-quality data unavailable.', { kind: 'not_found' });
  }

  const c = entry.components || {};
  const num = (v) => (typeof v === 'number' ? v : null);

  return {
    aqi: typeof entry.main.aqi === 'number' ? entry.main.aqi : null, // 1–5
    time: entry.dt ? new Date(entry.dt * 1000).toISOString() : null,
    pollutants: {
      pm25: num(c.pm2_5),
      pm10: num(c.pm10),
      o3: num(c.o3),
      no2: num(c.no2),
      so2: num(c.so2),
      co: num(c.co),
      nh3: num(c.nh3),
    },
  };
}
