import React from 'react';
import { FiDroplet, FiWind, FiSunrise, FiSunset, FiEye, FiThermometer } from 'react-icons/fi';
import WeatherIcon from './WeatherIcon';
import { formatTemp, formatTime, capitalize } from '../utils/format';

const Stat = ({ icon, label, value }) => (
  <div className="stat">
    <span className="stat__icon">{icon}</span>
    <div className="stat__body">
      <span className="stat__value">{value}</span>
      <span className="stat__label">{label}</span>
    </div>
  </div>
);

const CurrentWeather = ({ weather, unit }) => {
  const { name, sys, main, wind, weather: conditions, visibility, dt, timezone } = weather;
  const condition = conditions && conditions[0];
  const tz = timezone || 0;

  const today = new Date((dt + tz) * 1000);
  const dateLabel = today.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

  return (
    <section className="card current" aria-label="Current weather">
      <header className="current__head">
        <div>
          <h2 className="current__place">
            {name}
            {sys && sys.country ? <span className="current__country">{sys.country}</span> : null}
          </h2>
          <p className="current__date">{dateLabel}</p>
        </div>
        <WeatherIcon code={condition && condition.icon} size={96} className="current__glyph" title={condition && condition.description} />
      </header>

      <div className="current__temp-row">
        <span className="current__temp">{formatTemp(main.temp, unit)}</span>
        <div className="current__meta">
          <p className="current__desc">{condition ? capitalize(condition.description) : '—'}</p>
          <p className="current__feels">Feels like {formatTemp(main.feels_like, unit)}</p>
        </div>
      </div>

      <div className="stat-grid">
        <Stat icon={<FiThermometer />} label="Min / Max" value={`${formatTemp(main.temp_min, unit, false)}° / ${formatTemp(main.temp_max, unit, false)}°`} />
        <Stat icon={<FiDroplet />} label="Humidity" value={`${main.humidity}%`} />
        <Stat icon={<FiWind />} label="Wind" value={`${Math.round((wind && wind.speed) || 0)} m/s`} />
        <Stat icon={<FiEye />} label="Visibility" value={`${((visibility || 0) / 1000).toFixed(1)} km`} />
        {sys && sys.sunrise ? (
          <Stat icon={<FiSunrise />} label="Sunrise" value={formatTime(sys.sunrise, tz)} />
        ) : null}
        {sys && sys.sunset ? (
          <Stat icon={<FiSunset />} label="Sunset" value={formatTime(sys.sunset, tz)} />
        ) : null}
      </div>
    </section>
  );
};

export default CurrentWeather;
