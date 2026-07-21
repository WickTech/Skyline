// Central place for API configuration. The OpenWeather key is read exclusively
// from the environment (see .env.example) — never hardcode it here, or GitHub
// secret scanning will (rightly) block the push and the key ends up in git
// history. Open-Meteo, RainViewer and OpenStreetMap are keyless.
export const OPENWEATHER_KEY = process.env.REACT_APP_OPENWEATHER_KEY || '';

if (!OPENWEATHER_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    '[Skyline] Missing API key. Copy .env.example to .env and set ' +
      'REACT_APP_OPENWEATHER_KEY.'
  );
}

// OpenWeather endpoints (all on the same free `appid`, except One Call 3.0
// which needs a separate — still free — subscription and is used best-effort).
export const OPENWEATHER_BASE = 'https://api.openweathermap.org/data/2.5';
export const ONECALL_BASE = 'https://api.openweathermap.org/data/3.0';
export const GEO_BASE = 'https://api.openweathermap.org/geo/1.0';
export const OWM_TILE_BASE = 'https://tile.openweathermap.org/map';

// Keyless third-party sources (both CORS-enabled).
export const OPENMETEO_BASE = 'https://api.open-meteo.com/v1';
export const RAINVIEWER_API = 'https://api.rainviewer.com/public/weather-maps.json';

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
