import { useCallback, useRef, useState } from 'react';
import { getForecast } from '../api/openMeteo';
import { getAirQualityByCoords } from '../api/airQuality';
import { getAlerts } from '../api/alerts';
import { geocodeCity, reverseGeocode } from '../api/geocoding';
import { ApiError } from '../api/config';

/**
 * Drives the whole dashboard. Every lookup first resolves a *place* (name +
 * coordinates) — by geocoding a typed city, from an autocomplete pick, or by
 * reverse-geocoding the device location — then fetches everything for that
 * point in parallel.
 *
 * The Open-Meteo forecast (current, hourly, UV, 5-day) is the primary result —
 * if it fails, we surface an error. Air quality and the optional alerts are
 * best-effort: a missing piece never blanks out the rest of the dashboard.
 */
export function useEnvironment() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourly, setHourly] = useState([]);
  const [uv, setUv] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [error, setError] = useState(null);

  // Guards against out-of-order responses when searches overlap.
  const requestId = useRef(0);

  const load = useCallback(async (resolvePlace) => {
    const id = ++requestId.current;
    setStatus('loading');
    setError(null);

    let place;
    let meteo;
    try {
      place = await resolvePlace();
      meteo = await getForecast(place.lat, place.lon);
    } catch (e) {
      if (id !== requestId.current) return;
      setStatus('error');
      setError(e instanceof ApiError ? e.message : 'Something went wrong. Please try again.');
      return;
    }
    if (id !== requestId.current) return;

    const current = {
      ...meteo.current,
      name: place.name,
      sys: { ...meteo.current.sys, country: place.countryCode },
    };
    setWeather(current);
    setForecast(meteo.daily);
    setHourly(meteo.hourly);
    setUv({ now: meteo.uvNow, max: meteo.uvMax });

    const [aqR, alertsR] = await Promise.allSettled([
      getAirQualityByCoords(place.lat, place.lon),
      getAlerts(place.lat, place.lon),
    ]);
    if (id !== requestId.current) return;

    setAirQuality(aqR.status === 'fulfilled' ? aqR.value : null);
    setAlerts(alertsR.status === 'fulfilled' ? alertsR.value : []);
    setStatus('success');
  }, []);

  /** Free-text search: take the best geocoding match. */
  const searchByCity = useCallback(
    (city) => {
      if (!city || !city.trim()) return undefined;
      return load(async () => {
        const [best] = await geocodeCity(city, 1);
        if (!best) throw new ApiError('Location not found.', { kind: 'not_found' });
        return best;
      });
    },
    [load]
  );

  /** An autocomplete suggestion: already a fully resolved place. */
  const searchByPlace = useCallback((place) => load(async () => place), [load]);

  /** Device location: reverse-geocode for a label, best-effort. */
  const searchByCoords = useCallback(
    (lat, lon) =>
      load(async () => {
        const named = await reverseGeocode(lat, lon).catch(() => null);
        return named || { name: 'Your location', countryCode: null, lat, lon };
      }),
    [load]
  );

  return {
    weather,
    forecast,
    hourly,
    uv,
    airQuality,
    alerts,
    status,
    error,
    searchByCity,
    searchByPlace,
    searchByCoords,
  };
}
