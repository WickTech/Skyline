import { OPENMETEO_BASE, getJson, ApiError } from './config';
import { describeWmo } from './wmo';

// Open-Meteo forecast — keyless, CORS-enabled. One request returns current
// conditions, the 24-hour strip, UV and the 5-day outlook. Fetched in metric
// (m/s wind); the client converts to °F via formatTemp.
//
// Times come back as the location's local wall-clock ISO strings
// (timezone=auto) together with `utc_offset_seconds`, so they're converted to
// unix seconds explicitly rather than parsed in the *browser's* timezone.

const FORECAST_DAYS = 5;

export async function getForecast(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current:
      'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,visibility',
    hourly: 'temperature_2m,precipitation_probability,weather_code,uv_index,is_day',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max',
    timezone: 'auto',
    forecast_days: String(FORECAST_DAYS),
    wind_speed_unit: 'ms',
  });
  const data = await getJson(`${OPENMETEO_BASE}/forecast?${params.toString()}`);
  return normalizeForecast(data);
}

/** Local wall-clock ISO ("2026-10-11T14:00" or "2026-10-11") → unix seconds. */
export function localIsoToUnix(iso, utcOffsetSeconds = 0) {
  const withTime = iso.length === 10 ? `${iso}T12:00` : iso;
  return Math.round(Date.parse(`${withTime}Z`) / 1000) - utcOffsetSeconds;
}

/**
 * Normalise the Open-Meteo payload. `current` keeps the field shape the UI
 * was built around (OpenWeather-style: main/wind/weather[]/sys), so the
 * components didn't need rewriting; the caller adds the place name/country.
 */
export function normalizeForecast(data, now = Date.now()) {
  const c = data && data.current;
  const d = data && data.daily;
  if (!c || !d || !Array.isArray(d.time)) {
    throw new ApiError('Forecast unavailable for this location.');
  }
  const offset = data.utc_offset_seconds || 0;
  const condition = describeWmo(c.weather_code, c.is_day !== 0);

  const current = {
    coord: { lat: data.latitude, lon: data.longitude },
    dt: localIsoToUnix(c.time, offset),
    timezone: offset,
    main: {
      temp: c.temperature_2m,
      feels_like: c.apparent_temperature,
      temp_min: d.temperature_2m_min[0],
      temp_max: d.temperature_2m_max[0],
      humidity: c.relative_humidity_2m,
    },
    wind: { speed: c.wind_speed_10m },
    visibility: c.visibility,
    weather: [condition],
    sys: {
      sunrise: d.sunrise && d.sunrise[0] ? localIsoToUnix(d.sunrise[0], offset) : null,
      sunset: d.sunset && d.sunset[0] ? localIsoToUnix(d.sunset[0], offset) : null,
    },
  };

  const daily = d.time.slice(0, FORECAST_DAYS).map((date, i) => {
    const day = describeWmo(d.weather_code[i], true);
    return {
      date,
      dt: localIsoToUnix(date, offset), // local noon; the UI labels days from `date`
      min: Math.round(d.temperature_2m_min[i]),
      max: Math.round(d.temperature_2m_max[i]),
      icon: day.icon,
      condition: day.main,
      description: day.description,
    };
  });

  const h = data.hourly || {};
  const hourly = [];
  for (let i = 0; Array.isArray(h.time) && i < h.time.length; i += 1) {
    const unix = localIsoToUnix(h.time[i], offset);
    if (unix * 1000 < now - 3600 * 1000) continue; // skip past hours (1h grace)
    hourly.push({
      time: h.time[i], // local ISO; Hourly reads the wall-clock digits
      dt: unix * 1000,
      temp: h.temperature_2m ? h.temperature_2m[i] : null,
      precip: h.precipitation_probability ? h.precipitation_probability[i] : null,
      uv: h.uv_index ? h.uv_index[i] : null,
      icon: describeWmo(h.weather_code ? h.weather_code[i] : 0, !h.is_day || h.is_day[i] !== 0)
        .icon,
    });
    if (hourly.length >= 24) break;
  }

  return {
    current,
    daily,
    hourly,
    uvNow: hourly.length ? hourly[0].uv : null,
    uvMax: d.uv_index_max ? d.uv_index_max[0] : null,
  };
}
