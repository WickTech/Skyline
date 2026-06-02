import React, { useEffect, useMemo, useState, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import UnitToggle from './components/UnitToggle';
import CurrentWeather from './components/CurrentWeather';
import Forecast from './components/Forecast';
import AirQuality from './components/AirQuality';
import Skeleton from './components/Skeleton';
import StateMessage from './components/StateMessage';
import { useEnvironment } from './hooks/useEnvironment';
import { themeForIcon, gradientCss } from './utils/theme';
import './App.css';

const UNIT_KEY = 'skyline:unit';
const RECENTS_KEY = 'skyline:recents';
const DEFAULT_CITY = 'London';

function App() {
  const { weather, forecast, airQuality, status, error, searchByCity, searchByCoords } =
    useEnvironment();

  const [unit, setUnit] = useState(() => localStorage.getItem(UNIT_KEY) || 'celsius');
  const [recents, setRecents] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENTS_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(UNIT_KEY, unit);
  }, [unit]);

  // Seed the dashboard with a default city on first load.
  useEffect(() => {
    searchByCity(DEFAULT_CITY);
  }, [searchByCity]);

  const rememberCity = useCallback((name) => {
    if (!name) return;
    setRecents((prev) => {
      const next = [name, ...prev.filter((c) => c.toLowerCase() !== name.toLowerCase())].slice(0, 5);
      localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // When a successful weather result lands, record its resolved name.
  useEffect(() => {
    if (status === 'success' && weather && weather.name) {
      rememberCity(weather.name);
    }
  }, [status, weather, rememberCity]);

  const handleSearch = (city) => searchByCity(city);

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false);
        searchByCoords(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setGeoLoading(false);
        alert('Could not get your location. Please search by city instead.');
      },
      { timeout: 10000 }
    );
  };

  const background = useMemo(() => {
    const icon = weather && weather.weather && weather.weather[0] && weather.weather[0].icon;
    return gradientCss(themeForIcon(icon));
  }, [weather]);

  const loading = status === 'loading';
  const showSkeleton = loading && !weather;

  return (
    <div className="app" style={{ background }}>
      <div className="app__overlay" />

      <main className="shell">
        <header className="masthead">
          <div className="brand">
            <span className="brand__mark" aria-hidden="true">⛅</span>
            <div>
              <h1 className="brand__name">Skyline</h1>
              <p className="brand__tag">Weather &amp; air quality, in one search</p>
            </div>
          </div>
          <UnitToggle unit={unit} onChange={setUnit} />
        </header>

        <SearchBar
          onSearch={handleSearch}
          onGeolocate={handleGeolocate}
          loading={loading}
          geoLoading={geoLoading}
        />

        {recents.length > 0 && (
          <div className="recents" aria-label="Recent searches">
            {recents.map((city) => (
              <button key={city} type="button" className="chip" onClick={() => handleSearch(city)}>
                {city}
              </button>
            ))}
          </div>
        )}

        {showSkeleton && <Skeleton />}

        {status === 'error' && !weather && (
          <StateMessage
            variant="error"
            title="We couldn't find that"
            message={error || 'Try another city name.'}
          />
        )}

        {weather && (
          <>
            {status === 'error' && (
              <div className="inline-error" role="alert">
                {error}
              </div>
            )}
            <div className="dashboard">
              <CurrentWeather weather={weather} unit={unit} />
              <div className="dashboard__side">
                <AirQuality airQuality={airQuality} />
              </div>
              <div className="dashboard__full">
                <Forecast forecast={forecast} unit={unit} />
              </div>
            </div>
          </>
        )}

        <footer className="footer">
          <span>
            Data:{' '}
            <a href="https://openweathermap.org/" target="_blank" rel="noreferrer">
              OpenWeatherMap
            </a>{' '}
            &amp;{' '}
            <a href="https://aqicn.org/" target="_blank" rel="noreferrer">
              WAQI
            </a>
          </span>
        </footer>
      </main>
    </div>
  );
}

export default App;
