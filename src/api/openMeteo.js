import { OPENMETEO_BASE, getJson, ApiError } from './config';

// Open-Meteo — keyless, CORS-enabled. We use it for the hourly strip and the UV
// index (OpenWeather retired free UV into the paid One Call plan). Requested in
// metric; the client converts to °F via the same formatTemp used elsewhere.

// WMO weather codes → OpenWeather icon codes, so the existing <WeatherIcon>
// glyph map can render Open-Meteo hours with no new asset work. Day variants are
// fine for a compact hourly row.
const WMO_TO_OWM = {
  0: '01d',
  1: '02d',
  2: '03d',
  3: '04d',
  45: '50d',
  48: '50d',
  51: '09d',
  53: '09d',
  55: '09d',
  56: '09d',
  57: '09d',
  61: '10d',
  63: '10d',
  65: '10d',
  66: '10d',
  67: '10d',
  71: '13d',
  73: '13d',
  75: '13d',
  77: '13d',
  80: '09d',
  81: '09d',
  82: '09d',
  85: '13d',
  86: '13d',
  95: '11d',
  96: '11d',
  99: '11d',
};

export async function getOpenMeteo(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    hourly: 'temperature_2m,precipitation_probability,weather_code,uv_index',
    daily: 'uv_index_max',
    timezone: 'auto',
    forecast_days: '2',
  });
  const data = await getJson(`${OPENMETEO_BASE}/forecast?${params.toString()}`);
  return normalize(data);
}

function normalize(data) {
  const h = data && data.hourly;
  if (!h || !Array.isArray(h.time)) {
    throw new ApiError('Hourly forecast unavailable for this location.');
  }

  const now = Date.now();
  const hours = [];
  for (let i = 0; i < h.time.length; i += 1) {
    // Open-Meteo returns local wall-clock ISO strings (timezone=auto).
    const t = new Date(h.time[i]);
    if (t.getTime() < now - 3600 * 1000) continue; // skip past hours (1h grace)
    hours.push({
      time: h.time[i],
      dt: t.getTime(),
      temp: h.temperature_2m ? h.temperature_2m[i] : null,
      precip: h.precipitation_probability ? h.precipitation_probability[i] : null,
      uv: h.uv_index ? h.uv_index[i] : null,
      icon: WMO_TO_OWM[h.weather_code ? h.weather_code[i] : 0] || '01d',
    });
    if (hours.length >= 24) break;
  }

  const uvNow = hours.length ? hours[0].uv : null;
  const uvMax = data.daily && data.daily.uv_index_max ? data.daily.uv_index_max[0] : null;

  return { hourly: hours, uvNow, uvMax };
}
