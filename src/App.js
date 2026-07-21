import React, { useEffect, useMemo, useState, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import UnitToggle from './components/UnitToggle';
import CurrentWeather from './components/CurrentWeather';
import Forecast from './components/Forecast';
import Hourly from './components/Hourly';
import AirQuality from './components/AirQuality';
import UvIndex from './components/UvIndex';
import Alerts from './components/Alerts';
import WeatherMap from './components/WeatherMap';
import Skeleton from './components/Skeleton';
import StateMessage from './components/StateMessage';
import { useEnvironment } from './hooks/useEnvironment';
import { themeForIcon, gradientCss } from './utils/theme';
import './App.css';

const UNIT_KEY = 'skyline:unit';
const RECENTS_KEY = 'skyline:recents';
const DEFAULT_CITY = 'London';

function App() {
  const {
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
  } = useEnvironment();

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
  const handleSelectPlace = (place) => searchByCoords(place.lat, place.lon);

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
  const coord = weather && weather.coord;

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
          onSelectPlace={handleSelectPlace}
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

            <Alerts alerts={alerts} />

            {/* Wide screens: current weather spans two rows on the left with air
                quality and UV stacked beside it; the map then runs full width as
                a landscape band, followed by the hourly strip and 5-day forecast.
                Narrow screens collapse to this same source order in one column. */}
            <div className="dashboard">
              <CurrentWeather weather={weather} unit={unit} />
              <AirQuality airQuality={airQuality} />
              <UvIndex uv={uv} />
              {coord && <WeatherMap lat={coord.lat} lon={coord.lon} />}
              <Hourly hourly={hourly} unit={unit} />
              <Forecast forecast={forecast} unit={unit} />
            </div>
          </>
        )}

        <footer className="footer">
          <span>
            Data:{' '}
            <a href="https://openweathermap.org/" target="_blank" rel="noreferrer">
              OpenWeatherMap
            </a>
            ,{' '}
            <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
              Open-Meteo
            </a>
            ,{' '}
            <a href="https://www.rainviewer.com/" target="_blank" rel="noreferrer">
              RainViewer
            </a>{' '}
            &amp;{' '}
            <a href="https://www.openstreetmap.org/" target="_blank" rel="noreferrer">
              OpenStreetMap
            </a>
          </span>
        </footer>
      </main>
    </div>
  );
}

export default App;
