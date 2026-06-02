// Temperature ---------------------------------------------------------------
// API data is fetched in metric (°C); we convert on the client for the toggle.

export function toFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}

export function formatTemp(celsius, unit = 'celsius', withUnit = true) {
  if (celsius === null || celsius === undefined || Number.isNaN(celsius)) return '—';
  const value = unit === 'fahrenheit' ? toFahrenheit(celsius) : celsius;
  const rounded = Math.round(value);
  if (!withUnit) return `${rounded}`;
  return `${rounded}°${unit === 'fahrenheit' ? 'F' : 'C'}`;
}

export function unitSymbol(unit) {
  return unit === 'fahrenheit' ? '°F' : '°C';
}

// Dates & times -------------------------------------------------------------

export function formatTime(unixSeconds, timezoneOffsetSeconds = 0) {
  if (!unixSeconds) return '—';
  // Render in the location's local time using the API's timezone offset.
  const local = new Date((unixSeconds + timezoneOffsetSeconds) * 1000);
  let h = local.getUTCHours();
  const m = local.getUTCMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export function weekday(dateOrUnix, { short = false } = {}) {
  const date =
    typeof dateOrUnix === 'number' ? new Date(dateOrUnix * 1000) : new Date(dateOrUnix);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { weekday: short ? 'short' : 'long' });
}

export function relativeTime(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffMin = Math.round((Date.now() - then) / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const hours = Math.round(diffMin / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.round(hours / 24)} d ago`;
}

export function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
