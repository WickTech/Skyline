import React from 'react';
import WeatherIcon from './WeatherIcon';
import { FiDroplet } from 'react-icons/fi';
import { formatTemp } from '../utils/format';

// Next-24-hours strip, powered by Open-Meteo. Horizontally scrollable so it
// stays compact on narrow screens.
function hourLabel(iso) {
  // Open-Meteo hours are local wall-clock ISO strings; the digits are already
  // in the location's timezone, so read them straight off.
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}${ampm}`;
}

const Hourly = ({ hourly, unit }) => {
  if (!hourly || hourly.length === 0) return null;

  return (
    <section className="card hourly" aria-label="Hourly forecast">
      <h3 className="card__title">Next 24 Hours</h3>
      <div className="hourly__track">
        {hourly.map((hour, i) => (
          <div className="hourly__cell" key={hour.time}>
            <span className="hourly__time">{i === 0 ? 'Now' : hourLabel(hour.time)}</span>
            <WeatherIcon code={hour.icon} size={34} />
            <span className="hourly__temp">{formatTemp(hour.temp, unit, false)}°</span>
            <span className="hourly__precip" title="Chance of precipitation">
              <FiDroplet aria-hidden="true" />
              {hour.precip == null ? '—' : `${hour.precip}%`}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Hourly;
