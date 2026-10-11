// European Air Quality Index (Open-Meteo / CAMS) → category, colour, guidance.
// Bands: 0–20 Good · 20–40 Fair · 40–60 Moderate · 60–80 Poor ·
// 80–100 Very Poor · 100+ Extremely Poor.

const LEVELS = [
  {
    max: 20,
    label: 'Good',
    color: '#34d399',
    text: '#064e3b',
    message: 'Air quality is satisfactory and air pollution poses little or no risk.',
  },
  {
    max: 40,
    label: 'Fair',
    color: '#a3e635',
    text: '#365314',
    message: 'Air quality is acceptable. Unusually sensitive people should watch for symptoms.',
  },
  {
    max: 60,
    label: 'Moderate',
    color: '#fbbf24',
    text: '#713f12',
    message: 'Members of sensitive groups may experience health effects; the general public is less likely to be affected.',
  },
  {
    max: 80,
    label: 'Poor',
    color: '#fb923c',
    text: '#7c2d12',
    message: 'Everyone may begin to experience health effects; sensitive groups may see more serious effects.',
  },
  {
    max: 100,
    label: 'Very Poor',
    color: '#f87171',
    text: '#7f1d1d',
    message: 'Health alert: everyone may experience more serious health effects. Limit outdoor exertion.',
  },
  {
    max: Infinity,
    label: 'Extremely Poor',
    color: '#c084fc',
    text: '#3b0764',
    message: 'Health warning of emergency conditions. Avoid outdoor activity.',
  },
];

export function aqiInfo(aqi) {
  // 0 is a valid (very clean) reading, so only null/NaN count as missing.
  if (aqi == null || Number.isNaN(aqi)) {
    return { label: 'Unknown', color: '#94a3b8', text: '#0f172a', message: 'No reading available.', percent: 0 };
  }
  const level = LEVELS.find((l) => aqi <= l.max);
  const { max, ...info } = level;
  return { ...info, percent: Math.min(100, Math.max(0, aqi)) };
}

export const POLLUTANT_LABELS = {
  pm25: 'PM2.5',
  pm10: 'PM10',
  o3: 'Ozone',
  no2: 'NO₂',
  so2: 'SO₂',
  co: 'CO',
  nh3: 'NH₃',
};

// Open-Meteo reports every component in µg/m³.
export const POLLUTANT_UNIT = 'µg/m³';
