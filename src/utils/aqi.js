// US EPA AQI scale → category, color, and guidance.
// Mirrors the AirNow ranges but centralised and richer.

const LEVELS = [
  {
    max: 50,
    label: 'Good',
    color: '#34d399',
    text: '#064e3b',
    message:
      'Air quality is satisfactory and air pollution poses little or no risk.',
  },
  {
    max: 100,
    label: 'Moderate',
    color: '#fbbf24',
    text: '#713f12',
    message:
      'Air quality is acceptable. Unusually sensitive people should consider limiting prolonged outdoor exertion.',
  },
  {
    max: 150,
    label: 'Unhealthy for Sensitive Groups',
    color: '#fb923c',
    text: '#7c2d12',
    message:
      'Members of sensitive groups may experience health effects. The general public is less likely to be affected.',
  },
  {
    max: 200,
    label: 'Unhealthy',
    color: '#f87171',
    text: '#7f1d1d',
    message:
      'Everyone may begin to experience health effects; sensitive groups may experience more serious effects.',
  },
  {
    max: 300,
    label: 'Very Unhealthy',
    color: '#c084fc',
    text: '#581c87',
    message:
      'Health alert: the risk of health effects is increased for everyone.',
  },
  {
    max: Infinity,
    label: 'Hazardous',
    color: '#9f1239',
    text: '#fff1f2',
    message:
      'Health warning of emergency conditions: everyone is more likely to be affected.',
  },
];

export function aqiInfo(aqi) {
  if (aqi === null || aqi === undefined || Number.isNaN(aqi)) {
    return { label: 'Unknown', color: '#94a3b8', text: '#0f172a', message: 'No reading available.', percent: 0 };
  }
  const level = LEVELS.find((l) => aqi <= l.max) || LEVELS[LEVELS.length - 1];
  // Position on the gauge, capped at the "Very Unhealthy/Hazardous" boundary.
  const percent = Math.min(100, (aqi / 300) * 100);
  return { ...level, percent };
}

export const POLLUTANT_LABELS = {
  pm25: 'PM2.5',
  pm10: 'PM10',
  o3: 'Ozone',
  no2: 'NO₂',
  so2: 'SO₂',
  co: 'CO',
};
