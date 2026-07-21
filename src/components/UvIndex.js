import React from 'react';
import { FiSun } from 'react-icons/fi';

// UV index category per WHO bands. Open-Meteo supplies the value (OpenWeather
// moved free UV behind the paid One Call plan).
function uvBand(uv) {
  if (uv == null || Number.isNaN(uv)) return { label: 'Unknown', color: '#94a3b8' };
  if (uv < 3) return { label: 'Low', color: '#34d399' };
  if (uv < 6) return { label: 'Moderate', color: '#fbbf24' };
  if (uv < 8) return { label: 'High', color: '#fb923c' };
  if (uv < 11) return { label: 'Very High', color: '#f87171' };
  return { label: 'Extreme', color: '#c084fc' };
}

const UvIndex = ({ uv }) => {
  if (!uv || uv.now == null) return null;
  const band = uvBand(uv.now);

  return (
    <section className="card uv" aria-label="UV index">
      <h3 className="card__title">UV Index</h3>
      <div className="uv__main">
        <span className="uv__glyph" style={{ color: band.color }}>
          <FiSun size={34} aria-hidden="true" />
        </span>
        <div>
          <span className="uv__value">{Math.round(uv.now)}</span>
          <span className="uv__band" style={{ color: band.color }}>
            {band.label}
          </span>
        </div>
      </div>
      {uv.max != null ? <p className="uv__max">Peak today: {Math.round(uv.max)}</p> : null}
    </section>
  );
};

export default UvIndex;
