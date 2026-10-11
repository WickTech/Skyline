import { HAS_OPENWEATHER, OWM_TILE_BASE, OPENWEATHER_KEY, RAINVIEWER_API, getJson } from './config';

// Map tile sources for the interactive map. RainViewer radar is keyless and
// always available; the OpenWeather Weather Maps layers appear only when the
// optional VITE_OPENWEATHER_KEY is set. All are XYZ tile layers that drop
// straight into react-leaflet's TileLayer.

const ALL_OWM_LAYERS = {
  precipitation: { id: 'precipitation_new', label: 'Precipitation' },
  clouds: { id: 'clouds_new', label: 'Clouds' },
  temp: { id: 'temp_new', label: 'Temperature' },
  wind: { id: 'wind_new', label: 'Wind' },
  pressure: { id: 'pressure_new', label: 'Pressure' },
};

export const OWM_LAYERS = HAS_OPENWEATHER ? ALL_OWM_LAYERS : {};

export function owmTileUrl(layerKey) {
  const layer = OWM_LAYERS[layerKey];
  if (!layer) return null;
  return `${OWM_TILE_BASE}/${layer.id}/{z}/{x}/{y}.png?appid=${OPENWEATHER_KEY}`;
}

/**
 * Latest RainViewer radar frame as an XYZ tile template. RainViewer publishes a
 * manifest of available frames; we take the most recent past frame. Returns null
 * if the manifest can't be read (radar overlay is best-effort).
 */
export async function getRainviewerTileUrl() {
  const data = await getJson(RAINVIEWER_API);
  const past = data && data.radar && Array.isArray(data.radar.past) ? data.radar.past : [];
  const latest = past[past.length - 1];
  if (!data.host || !latest) return null;
  // path/{z}/{x}/{y}/{color}/{smooth}_{snow}.png — color 2 = Universal Blue.
  return `${data.host}${latest.path}/256/{z}/{x}/{y}/2/1_1.png`;
}
