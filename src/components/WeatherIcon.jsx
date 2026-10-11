import React from 'react';
import {
  WiDaySunny,
  WiNightClear,
  WiDayCloudy,
  WiNightAltCloudy,
  WiCloud,
  WiCloudy,
  WiShowers,
  WiRain,
  WiThunderstorm,
  WiSnow,
  WiFog,
} from 'react-icons/wi';

// Maps an OpenWeatherMap icon code (e.g. "10d") to a react-icons glyph.
// Takes a plain icon code string — no more reaching into nested .weather[].
const ICON_MAP = {
  '01d': WiDaySunny,
  '01n': WiNightClear,
  '02d': WiDayCloudy,
  '02n': WiNightAltCloudy,
  '03d': WiCloud,
  '03n': WiCloud,
  '04d': WiCloudy,
  '04n': WiCloudy,
  '09d': WiShowers,
  '09n': WiShowers,
  '10d': WiRain,
  '10n': WiRain,
  '11d': WiThunderstorm,
  '11n': WiThunderstorm,
  '13d': WiSnow,
  '13n': WiSnow,
  '50d': WiFog,
  '50n': WiFog,
};

const WeatherIcon = ({ code, size = 64, className = '', title }) => {
  const Glyph = ICON_MAP[code] || WiDaySunny;
  return (
    <span className={`weather-icon ${className}`} role="img" aria-label={title || 'weather'}>
      <Glyph size={size} />
    </span>
  );
};

export default WeatherIcon;
