import React from 'react';
import WeatherIcon from './WeatherIcon';
import { formatTemp, weekday, capitalize } from '../utils/format';

const Forecast = ({ forecast, unit }) => {
  if (!forecast || forecast.length === 0) return null;

  return (
    <section className="card forecast" aria-label="5-day forecast">
      <h3 className="card__title">5-Day Forecast</h3>
      <div className="forecast__grid">
        {forecast.map((day, i) => (
          <div className="forecast__card" key={day.date}>
            <p className="forecast__day">{i === 0 ? 'Today' : weekday(day.dt, { short: true })}</p>
            <WeatherIcon code={day.icon} size={44} title={day.description} />
            <p className="forecast__cond" title={capitalize(day.description)}>{day.condition}</p>
            <p className="forecast__temps">
              <span className="forecast__max">{formatTemp(day.max, unit, false)}°</span>
              <span className="forecast__min">{formatTemp(day.min, unit, false)}°</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Forecast;
