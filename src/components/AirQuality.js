import React from 'react';
import { aqiInfo, POLLUTANT_LABELS } from '../utils/aqi';
import { relativeTime } from '../utils/format';

// Circular SVG gauge — value sweeps proportionally, stroke colour matches the
// AQI category. Demonstrates a hand-rolled data visualisation (no chart lib).
const Gauge = ({ aqi, info }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const dash = (info.percent / 100) * circumference;

  return (
    <div className="gauge" role="img" aria-label={`Air quality index ${aqi}, ${info.label}`}>
      <svg viewBox="0 0 180 180" className="gauge__svg">
        <circle cx="90" cy="90" r={radius} className="gauge__track" />
        <circle
          cx="90"
          cy="90"
          r={radius}
          className="gauge__fill"
          stroke={info.color}
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="gauge__center">
        <span className="gauge__value">{aqi ?? '—'}</span>
        <span className="gauge__unit">AQI</span>
      </div>
    </div>
  );
};

const AirQuality = ({ airQuality }) => {
  if (!airQuality) {
    return (
      <section className="card air air--empty" aria-label="Air quality">
        <h3 className="card__title">Air Quality</h3>
        <p className="air__none">No air-quality station found near this location.</p>
      </section>
    );
  }

  const info = aqiInfo(airQuality.aqi);
  const pollutants = Object.entries(airQuality.pollutants).filter(([, v]) => v !== null);

  return (
    <section className="card air" aria-label="Air quality">
      <h3 className="card__title">Air Quality</h3>

      <div className="air__main">
        <Gauge aqi={airQuality.aqi} info={info} />
        <div className="air__summary">
          <span className="air__badge" style={{ backgroundColor: info.color, color: info.text }}>
            {info.label}
          </span>
          <p className="air__message">{info.message}</p>
          {airQuality.dominantPollutant ? (
            <p className="air__dominant">
              Main pollutant:{' '}
              <strong>{POLLUTANT_LABELS[airQuality.dominantPollutant] || airQuality.dominantPollutant.toUpperCase()}</strong>
            </p>
          ) : null}
        </div>
      </div>

      {pollutants.length > 0 && (
        <ul className="air__pollutants">
          {pollutants.map(([key, value]) => (
            <li className="pollutant" key={key}>
              <span className="pollutant__label">{POLLUTANT_LABELS[key] || key}</span>
              <span className="pollutant__value">{value}</span>
            </li>
          ))}
        </ul>
      )}

      <footer className="air__foot">
        {airQuality.stationName ? <span className="air__station">{airQuality.stationName}</span> : null}
        {airQuality.time ? <span className="air__time">Updated {relativeTime(airQuality.time)}</span> : null}
      </footer>
    </section>
  );
};

export default AirQuality;
