// Central place for API configuration. Keys are read exclusively from the
// environment (see .env.example) — never hardcode them here, or GitHub secret
// scanning will (rightly) block the push and the key ends up in git history.
export const OPENWEATHER_KEY = process.env.REACT_APP_OPENWEATHER_KEY || '';
export const WAQI_TOKEN = process.env.REACT_APP_WAQI_TOKEN || '';

if (!OPENWEATHER_KEY || !WAQI_TOKEN) {
  // eslint-disable-next-line no-console
  console.warn(
    '[Skyline] Missing API keys. Copy .env.example to .env and set ' +
      'REACT_APP_OPENWEATHER_KEY and REACT_APP_WAQI_TOKEN.'
  );
}

export const OPENWEATHER_BASE = 'https://api.openweathermap.org/data/2.5';
export const WAQI_BASE = 'https://api.waqi.info/feed';

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
