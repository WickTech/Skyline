import { GEO_BASE, OPENWEATHER_KEY, getJson } from './config';

// OpenWeather Geocoding API. Turns a free-text query into candidate places
// (with country/state so "Springfield" is disambiguable) and turns coordinates
// back into a readable label for the geolocation button.

function normalizePlace(p) {
  return {
    name: p.name,
    state: p.state || null,
    country: p.country || null,
    lat: p.lat,
    lon: p.lon,
    label: [p.name, p.state, p.country].filter(Boolean).join(', '),
  };
}

/** Autocomplete: up to `limit` matching places for a search query. */
export async function geocodeCity(query, limit = 5) {
  const q = query.trim();
  if (!q) return [];
  const url = `${GEO_BASE}/direct?q=${encodeURIComponent(q)}&limit=${limit}&appid=${OPENWEATHER_KEY}`;
  const list = await getJson(url);
  return Array.isArray(list) ? list.map(normalizePlace) : [];
}

/** Reverse: nearest named place for a coordinate pair. */
export async function reverseGeocode(lat, lon) {
  const url = `${GEO_BASE}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OPENWEATHER_KEY}`;
  const list = await getJson(url);
  return Array.isArray(list) && list[0] ? normalizePlace(list[0]) : null;
}
