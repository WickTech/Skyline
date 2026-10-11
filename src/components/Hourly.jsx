import React, { useMemo } from 'react';
import { toFahrenheit } from '../utils/format';

// Next-24-hours temperature curve. A smoothed SVG line reads the trend at a
// glance far better than a row of separate cells, and scales to any width.
function hourLabel(iso, index) {
  if (index === 0) return 'Now';
  // Open-Meteo hours are local wall-clock ISO strings; the digits are already
  // in the location's timezone, so read them straight off.
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}${ampm}`;
}

const W = 1160;
const MARGIN_X = 46;
const TOP = 56;
const BOTTOM = 118;
const BASELINE = 150;

const Hourly = ({ hourly, unit }) => {
  const model = useMemo(() => {
    if (!hourly || hourly.length === 0) return null;

    // Thin to at most 14 points so labels never collide.
    const stride = Math.max(1, Math.ceil(hourly.length / 14));
    const picked = hourly.filter((_, i) => i % stride === 0).slice(0, 14);
    if (picked.length < 2) return null;

    const temps = picked.map((h) =>
      Math.round(unit === 'fahrenheit' ? toFahrenheit(h.temp) : h.temp)
    );
    const min = Math.min(...temps);
    const max = Math.max(...temps);
    const range = max - min || 1;
    const step = (W - 2 * MARGIN_X) / (picked.length - 1);

    const points = picked.map((h, i) => {
      const x = Math.round((MARGIN_X + i * step) * 10) / 10;
      const y = Math.round((TOP + (1 - (temps[i] - min) / range) * (BOTTOM - TOP)) * 10) / 10;
      return { x, y, temp: temps[i], label: hourLabel(h.time, i) };
    });

    // Horizontal-tangent cubic segments keep the curve smooth without overshoot.
    let line = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i += 1) {
      const a = points[i];
      const b = points[i + 1];
      const cx = (a.x + b.x) / 2;
      line += ` C ${cx} ${a.y} ${cx} ${b.y} ${b.x} ${b.y}`;
    }
    const area = `${line} L ${points[points.length - 1].x} ${BASELINE} L ${points[0].x} ${BASELINE} Z`;

    return { points, line, area };
  }, [hourly, unit]);

  if (!model) return null;

  return (
    <section className="card hourly" aria-label="Next 24 hours">
      <h3 className="card__title">Next 24 Hours</h3>
      <svg
        viewBox={`0 0 ${W} 180`}
        className="hourly__chart"
        role="img"
        aria-label="Hourly temperature trend"
      >
        <defs>
          <linearGradient id="hourlyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,210,122,.42)" />
            <stop offset="100%" stopColor="rgba(255,210,122,0)" />
          </linearGradient>
        </defs>

        <path d={model.area} fill="url(#hourlyGrad)" />
        <path
          d={model.line}
          fill="none"
          stroke="#ffd27a"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {model.points.map((p) => (
          <g key={`${p.label}-${p.x}`}>
            <circle cx={p.x} cy={p.y} r="4" fill="#fff" />
            <text x={p.x} y={p.y - 15} textAnchor="middle" className="hourly__temp-text">
              {p.temp}°
            </text>
            <text x={p.x} y="162" textAnchor="middle" className="hourly__time-text">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </section>
  );
};

export default Hourly;
