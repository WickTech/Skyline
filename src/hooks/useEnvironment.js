import { useCallback, useRef, useState } from 'react';
import {
  getCurrentByCity,
  getCurrentByCoords,
  getDailyForecast,
} from '../api/weather';
import { getAirQualityByCoords } from '../api/airQuality';
import { ApiError } from '../api/config';

/**
 * Drives the whole dashboard: one lookup resolves a place to its coordinates,
 * then fetches current weather, 5-day forecast, and air quality together.
 *
 * Weather is the primary result — if it fails, we surface an error. Air quality
 * is best-effort: many places have no nearby station, so a missing AQI should
 * not blank out the weather.
 */
export function useEnvironment() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [airQuality, setAirQuality] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [error, setError] = useState(null);

  // Guards against out-of-order responses when searches overlap.
  const requestId = useRef(0);

  const load = useCallback(async (fetchCurrent) => {
    const id = ++requestId.current;
    setStatus('loading');
    setError(null);

    let current;
    try {
      current = await fetchCurrent();
    } catch (e) {
      if (id !== requestId.current) return;
      setStatus('error');
      setError(
        e instanceof ApiError ? e.message : 'Something went wrong. Please try again.'
      );
      return;
    }

    if (id !== requestId.current) return;
    setWeather(current);

    const { lat, lon } = current.coord || {};

    const [forecastResult, aqResult] = await Promise.allSettled([
      getDailyForecast(lat, lon),
      getAirQualityByCoords(lat, lon),
    ]);

    if (id !== requestId.current) return;

    setForecast(forecastResult.status === 'fulfilled' ? forecastResult.value : []);
    setAirQuality(aqResult.status === 'fulfilled' ? aqResult.value : null);
    setStatus('success');
  }, []);

  const searchByCity = useCallback((city) => {
    if (!city || !city.trim()) return;
    return load(() => getCurrentByCity(city));
  }, [load]);

  const searchByCoords = useCallback((lat, lon) => {
    return load(() => getCurrentByCoords(lat, lon));
  }, [load]);

  return { weather, forecast, airQuality, status, error, searchByCity, searchByCoords };
}
