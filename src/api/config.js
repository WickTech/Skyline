// Central place for API configuration.
//
// The core dashboard (current weather, forecast, hourly, UV, air quality,
// geocoding, radar) runs entirely on keyless, CORS-enabled APIs: Open-Meteo,
// BigDataCloud (reverse geocoding), RainViewer and OpenStreetMap.
//
// An OpenWeather key is OPTIONAL and only unlocks extras with no keyless
// equivalent: extra map layers and One Call severe-weather alerts. Any key a
// browser app uses is visible to every visitor, so leave it unset unless you
// accept that (and restrict the key in your OpenWeather account).
export const OPENWEATHER_KEY = import.meta.env.VITE_OPENWEATHER_KEY || '';
export const HAS_OPENWEATHER = Boolean(OPENWEATHER_KEY);

// Keyless sources.
export const OPENMETEO_BASE = 'https://api.open-meteo.com/v1';
export const AIR_QUALITY_BASE = 'https://air-quality-api.open-meteo.com/v1';
export const GEOCODING_BASE = 'https://geocoding-api.open-meteo.com/v1';
export const REVERSE_GEOCODE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';
export const RAINVIEWER_API = 'https://api.rainviewer.com/public/weather-maps.json';

// Optional OpenWeather endpoints (only called when a key is configured).
export const ONECALL_BASE = 'https://api.openweathermap.org/data/3.0';
export const OWM_TILE_BASE = 'https://tile.openweathermap.org/map';

// A small typed-ish error so the UI can show friendly messages.
export class ApiError extends Error {
  constructor(message, { status, kind = 'generic' } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.kind = kind; // 'not_found' | 'network' | 'auth' | 'generic'
  }
}

export async function getJson(url) {
  let res;
  try {
    res = await fetch(url);
  } catch (e) {
    throw new ApiError('Network error — check your connection.', { kind: 'network' });
  }
  if (!res.ok) {
    if (res.status === 404) {
      throw new ApiError('Location not found.', { status: 404, kind: 'not_found' });
    }
    if (res.status === 401) {
      throw new ApiError('Invalid or missing API key.', { status: 401, kind: 'auth' });
    }
    throw new ApiError(`Request failed (${res.status}).`, { status: res.status });
  }
  return res.json();
}
