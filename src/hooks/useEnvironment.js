import { useCallback, useRef, useState } from 'react';
import {
  getCurrentByCity,
  getCurrentByCoords,
  getDailyForecast,
  getOneCall,
} from '../api/weather';
import { getAirQualityByCoords } from '../api/airQuality';
import { getOpenMeteo } from '../api/openMeteo';
import { ApiError } from '../api/config';

/**
 * Drives the whole dashboard: one lookup resolves a place to its coordinates,
 * then fetches everything else for that point in parallel.
 *
 * Current weather is the primary result — if it fails, we surface an error.
 * Everything else (daily forecast, hourly + UV from Open-Meteo, air quality,
 * One Call alerts) is best-effort: a missing piece should never blank out the
 * rest of the dashboard.
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

    const [forecastR, meteoR, aqR, oneCallR] = await Promise.allSettled([
      getDailyForecast(lat, lon),
      getOpenMeteo(lat, lon),
      getAirQualityByCoords(lat, lon),
      getOneCall(lat, lon),
    ]);

    if (id !== requestId.current) return;

    setForecast(forecastR.status === 'fulfilled' ? forecastR.value : []);

    const meteo = meteoR.status === 'fulfilled' ? meteoR.value : null;
    setHourly(meteo ? meteo.hourly : []);
    setUv(meteo ? { now: meteo.uvNow, max: meteo.uvMax } : null);

    setAirQuality(aqR.status === 'fulfilled' ? aqR.value : null);

    const oneCall = oneCallR.status === 'fulfilled' ? oneCallR.value : null;
    setAlerts(oneCall && Array.isArray(oneCall.alerts) ? oneCall.alerts : []);

    setStatus('success');
  }, []);

  const searchByCity = useCallback((city) => {
    if (!city || !city.trim()) return undefined;
    return load(() => getCurrentByCity(city));
  }, [load]);

  const searchByCoords = useCallback((lat, lon) => {
    return load(() => getCurrentByCoords(lat, lon));
  }, [load]);

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
    searchByCoords,
  };
}
