import { AIR_QUALITY_BASE, getJson, ApiError } from './config';

/**
 * Air quality via the Open-Meteo Air Quality API (keyless, global CAMS data).
 * Coordinate-based, so the reading stays aligned with the weather location.
 *
 * Reports the European AQI (0–20 Good … 100+ Extremely Poor) plus pollutant
 * concentrations in µg/m³. Requested in GMT so the timestamp is unambiguous.
 */
export async function getAirQualityByCoords(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current:
      'european_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide,ammonia',
    timezone: 'GMT',
  });
  return normalizeAirQuality(await getJson(`${AIR_QUALITY_BASE}/air-quality?${params.toString()}`));
}

export function normalizeAirQuality(payload) {
  const c = payload && payload.current;
  if (!c || typeof c.european_aqi !== 'number') {
    throw new ApiError('Air-quality data unavailable.', { kind: 'not_found' });
  }
  const num = (v) => (typeof v === 'number' ? v : null);

  return {
    aqi: c.european_aqi,
    time: c.time ? new Date(`${c.time}Z`).toISOString() : null,
    pollutants: {
      pm25: num(c.pm2_5),
      pm10: num(c.pm10),
      o3: num(c.ozone),
      no2: num(c.nitrogen_dioxide),
      so2: num(c.sulphur_dioxide),
      co: num(c.carbon_monoxide),
      nh3: num(c.ammonia), // Europe only; null elsewhere and filtered by the UI
    },
  };
}
