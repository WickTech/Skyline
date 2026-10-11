// WMO weather interpretation codes (as used by Open-Meteo) → the OpenWeather
// icon codes the UI already understands (<WeatherIcon>, sky themes), plus a
// condition group and a human description.

const CODES = {
  0: ['01', 'Clear', 'clear sky'],
  1: ['02', 'Clear', 'mainly clear'],
  2: ['03', 'Clouds', 'partly cloudy'],
  3: ['04', 'Clouds', 'overcast'],
  45: ['50', 'Fog', 'fog'],
  48: ['50', 'Fog', 'depositing rime fog'],
  51: ['09', 'Drizzle', 'light drizzle'],
  53: ['09', 'Drizzle', 'moderate drizzle'],
  55: ['09', 'Drizzle', 'dense drizzle'],
  56: ['09', 'Drizzle', 'light freezing drizzle'],
  57: ['09', 'Drizzle', 'dense freezing drizzle'],
  61: ['10', 'Rain', 'slight rain'],
  63: ['10', 'Rain', 'moderate rain'],
  65: ['10', 'Rain', 'heavy rain'],
  66: ['10', 'Rain', 'light freezing rain'],
  67: ['10', 'Rain', 'heavy freezing rain'],
  71: ['13', 'Snow', 'slight snowfall'],
  73: ['13', 'Snow', 'moderate snowfall'],
  75: ['13', 'Snow', 'heavy snowfall'],
  77: ['13', 'Snow', 'snow grains'],
  80: ['09', 'Rain', 'slight rain showers'],
  81: ['09', 'Rain', 'moderate rain showers'],
  82: ['09', 'Rain', 'violent rain showers'],
  85: ['13', 'Snow', 'slight snow showers'],
  86: ['13', 'Snow', 'heavy snow showers'],
  95: ['11', 'Thunderstorm', 'thunderstorm'],
  96: ['11', 'Thunderstorm', 'thunderstorm with slight hail'],
  99: ['11', 'Thunderstorm', 'thunderstorm with heavy hail'],
};

/**
 * @param {number} code  WMO weather code
 * @param {boolean} [isDay=true]
 * @returns {{ icon: string, main: string, description: string }}
 */
export function describeWmo(code, isDay = true) {
  const [group, main, description] = CODES[code] || CODES[0];
  return { icon: `${group}${isDay ? 'd' : 'n'}`, main, description };
}
