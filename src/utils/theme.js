// Maps an OpenWeatherMap icon code to an animated background gradient so the
// whole page reacts to the conditions being shown. Icon codes end in 'd' (day)
// or 'n' (night); the leading digits describe the condition group.

const THEMES = {
  clearDay: ['#48a7f2', '#2f80ed', '#1e5fc4'],
  clearNight: ['#1b2845', '#2b3a67', '#3b4a7a'],
  cloudsDay: ['#6a85b6', '#8aa1c1', '#bac8e0'],
  cloudsNight: ['#232a3b', '#33405c', '#475377'],
  rain: ['#3a6073', '#16222a', '#2c3e50'],
  drizzle: ['#4b6cb7', '#3a5a9f', '#243b66'],
  thunder: ['#141e30', '#243b55', '#3a4a6b'],
  snow: ['#83a4d4', '#9cb6da', '#b6d0e2'],
  mist: ['#606c88', '#3f4c6b', '#535d77'],
  default: ['#2f80ed', '#56ccf2', '#1e5fc4'],
};

export function themeForIcon(iconCode) {
  if (!iconCode) return THEMES.default;
  const isDay = iconCode.endsWith('d');
  const group = iconCode.slice(0, 2);

  switch (group) {
    case '01':
      return isDay ? THEMES.clearDay : THEMES.clearNight;
    case '02':
    case '03':
    case '04':
      return isDay ? THEMES.cloudsDay : THEMES.cloudsNight;
    case '09':
      return THEMES.drizzle;
    case '10':
      return THEMES.rain;
    case '11':
      return THEMES.thunder;
    case '13':
      return THEMES.snow;
    case '50':
      return THEMES.mist;
    default:
      return THEMES.default;
  }
}

export function gradientCss(stops) {
  return `linear-gradient(160deg, ${stops[0]} 0%, ${stops[1]} 55%, ${stops[2]} 100%)`;
}
