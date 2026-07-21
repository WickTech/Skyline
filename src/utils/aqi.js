// OpenWeather Air Pollution index (1–5) → category, color, and guidance.
// 1 Good · 2 Fair · 3 Moderate · 4 Poor · 5 Very Poor.

const LEVELS = {
  1: {
    label: 'Good',
    color: '#34d399',
    text: '#064e3b',
    message: 'Air quality is satisfactory and air pollution poses little or no risk.',
  },
  2: {
    label: 'Fair',
    color: '#a3e635',
    text: '#365314',
    message: 'Air quality is acceptable. Unusually sensitive people should watch for symptoms.',
  },
  3: {
    label: 'Moderate',
    color: '#fbbf24',
    text: '#713f12',
    message: 'Members of sensitive groups may experience health effects; the general public is less likely to be affected.',
  },
  4: {
    label: 'Poor',
    color: '#fb923c',
    text: '#7c2d12',
    message: 'Everyone may begin to experience health effects; sensitive groups may see more serious effects.',
  },
  5: {
    label: 'Very Poor',
    color: '#f87171',
    text: '#7f1d1d',
    message: 'Health alert: everyone may experience more serious health effects. Limit outdoor exertion.',
  },
};

export function aqiInfo(aqi) {
  if (!aqi || Number.isNaN(aqi) || !LEVELS[aqi]) {
    return { label: 'Unknown', color: '#94a3b8', text: '#0f172a', message: 'No reading available.', percent: 0 };
  }
  return { ...LEVELS[aqi], percent: (aqi / 5) * 100 };
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

// OpenWeather reports every component in µg/m³.
export const POLLUTANT_UNIT = 'µg/m³';
