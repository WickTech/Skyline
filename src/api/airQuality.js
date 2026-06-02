import { WAQI_BASE, WAQI_TOKEN, getJson, ApiError } from './config';

/**
 * Air quality by coordinates via WAQI's `geo:` feed. Using coordinates (rather
 * than a city-name match) keeps the AQI reading aligned with the same place the
 * weather data describes.
 */
export async function getAirQualityByCoords(lat, lon) {
  const url = `${WAQI_BASE}/geo:${lat};${lon}/?token=${WAQI_TOKEN}`;
  return normalize(await getJson(url));
}

/** Air quality by city name (fallback / direct search). */
export async function getAirQualityByCity(city) {
  const q = encodeURIComponent(city.trim());
  const url = `${WAQI_BASE}/${q}/?token=${WAQI_TOKEN}`;
  return normalize(await getJson(url));
}

// WAQI returns HTTP 200 with a `status` field even on logical errors, so we
// translate that into our ApiError contract here.
function normalize(payload) {
  if (!payload || payload.status !== 'ok' || !payload.data) {
    const reason = payload && payload.data ? String(payload.data) : 'unknown';
    if (/unknown station|over quota|invalid key/i.test(reason)) {
      throw new ApiError('No air-quality station near this location.', { kind: 'not_found' });
    }
    throw new ApiError('Air-quality data unavailable.', { kind: 'not_found' });
  }

  const d = payload.data;
  const iaqi = d.iaqi || {};
  const pollutant = (key) => (iaqi[key] && typeof iaqi[key].v === 'number' ? iaqi[key].v : null);

  return {
    aqi: typeof d.aqi === 'number' ? d.aqi : null,
    dominantPollutant: d.dominentpol || null, // (WAQI's spelling)
    stationName: d.city ? d.city.name : null,
    time: d.time ? d.time.iso || d.time.s : null,
    pollutants: {
      pm25: pollutant('pm25'),
      pm10: pollutant('pm10'),
      o3: pollutant('o3'),
      no2: pollutant('no2'),
      so2: pollutant('so2'),
      co: pollutant('co'),
    },
  };
}
