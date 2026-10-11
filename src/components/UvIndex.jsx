import React from 'react';

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

// Position on the 0–11+ scale, as a percentage.
const pct = (uv) => Math.max(0, Math.min(100, (uv / 11) * 100));

const UvIndex = ({ uv }) => {
  if (!uv || uv.now == null) return null;

  const band = uvBand(uv.now);
  const nowPct = pct(uv.now);
  const peakPct = uv.max != null ? pct(uv.max) : null;

  return (
    <section className="card uv" aria-label="UV index">
      <h3 className="card__title">UV Index</h3>

      <div className="uv__main">
        <span className="uv__value">{Math.round(uv.now)}</span>
        <span className="uv__band" style={{ color: band.color }}>
          {band.label}
        </span>
      </div>

      {/* Continuous WHO colour scale with the current reading marked on it —
          shows severity in context instead of as a bare number. */}
      <div
        className="uv__scale"
        role="img"
        aria-label={`UV ${Math.round(uv.now)} of 11+, ${band.label}`}
      >
        {peakPct != null && (
          <span
            className="uv__peak"
            style={{ left: `${peakPct}%` }}
            title={`Peak ${Math.round(uv.max)}`}
          />
        )}
        <span className="uv__marker" style={{ left: `${nowPct}%`, borderColor: band.color }} />
      </div>

      <div className="uv__ticks">
        <span>0</span>
        {uv.max != null ? <span>Peak today · {Math.round(uv.max)}</span> : <span />}
        <span>11+</span>
      </div>
    </section>
  );
};

export default UvIndex;
