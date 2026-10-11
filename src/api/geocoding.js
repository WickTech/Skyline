import { GEOCODING_BASE, REVERSE_GEOCODE_URL, getJson } from './config';

// Forward search: Open-Meteo Geocoding (keyless). Returns candidate places with
// region + country so "Springfield" is disambiguable.
// Reverse lookup (geolocation button): BigDataCloud's free client-side
// endpoint (keyless, CORS-enabled) — Open-Meteo has no reverse geocoder.

function place({ name, state, country, countryCode, lat, lon }) {
  return {
    name,
    state: state || null,
    country: country || null,
    countryCode: countryCode || null,
    lat,
    lon,
    label: [name, state, country].filter(Boolean).join(', '),
  };
}

/** Autocomplete: up to `limit` matching places for a search query. */
export async function geocodeCity(query, limit = 5) {
  const q = query.trim();
  if (!q) return [];
  const params = new URLSearchParams({ name: q, count: String(limit), language: 'en', format: 'json' });
  const data = await getJson(`${GEOCODING_BASE}/search?${params.toString()}`);
  const results = data && Array.isArray(data.results) ? data.results : [];
  return results.map((r) =>
    place({
      name: r.name,
      state: r.admin1,
      country: r.country,
      countryCode: r.country_code,
      lat: r.latitude,
      lon: r.longitude,
    })
  );
}

/** Reverse: nearest named place for a coordinate pair (null if unknown). */
export async function reverseGeocode(lat, lon) {
  const params = new URLSearchParams({ latitude: lat, longitude: lon, localityLanguage: 'en' });
  const r = await getJson(`${REVERSE_GEOCODE_URL}?${params.toString()}`);
  const name = r && (r.city || r.locality);
  if (!name) return null;
  return place({
    name,
    state: r.principalSubdivision,
    country: r.countryName,
    countryCode: r.countryCode,
    lat,
    lon,
  });
}
