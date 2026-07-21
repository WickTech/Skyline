import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { OWM_LAYERS, owmTileUrl, getRainviewerTileUrl } from '../api/maps';

// Interactive map: an OpenStreetMap base with a single toggleable overlay —
// OpenWeather Weather Maps 1.0 layers (free `appid`) plus a keyless RainViewer
// radar frame. Overlays are best-effort; a failed tile just shows the base map.

// Keeps the Leaflet view centred on the active location as searches change.
function Recenter({ lat, lon }) {
  const map = useMap();
  useEffect(() => {
    if (typeof lat === 'number' && typeof lon === 'number') {
      map.setView([lat, lon], map.getZoom());
    }
  }, [lat, lon, map]);
  return null;
}

// The map's container can resize after mount — e.g. when the async air-quality
// data grows the column beside it on wide screens, or on viewport changes.
// Leaflet needs an explicit invalidateSize() to repaint tiles into the new box.
function AutoResize() {
  const map = useMap();
  useEffect(() => {
    const el = map.getContainer();
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(el);
    return () => ro.disconnect();
  }, [map]);
  return null;
}

const OVERLAYS = [
  { key: 'radar', label: 'Radar' },
  ...Object.entries(OWM_LAYERS).map(([key, { label }]) => ({ key, label })),
];

const WeatherMap = ({ lat, lon }) => {
  const [active, setActive] = useState('precipitation');
  const [radarUrl, setRadarUrl] = useState(null);

  useEffect(() => {
    let alive = true;
    getRainviewerTileUrl()
      .then((url) => alive && setRadarUrl(url))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (typeof lat !== 'number' || typeof lon !== 'number') return null;

  const overlayUrl = active === 'radar' ? radarUrl : owmTileUrl(active);

  return (
    <section className="card map" aria-label="Weather map">
      <h3 className="card__title">Map</h3>

      <div className="map__canvas">
        <MapContainer
          center={[lat, lon]}
          zoom={7}
          scrollWheelZoom={false}
          /* Default zoom buttons sit top-left, where the layer pill lives —
             move them to the bottom-right so the two never overlap. */
          zoomControl={false}
          style={{ height: '100%', width: '100%' }}
        >
          <ZoomControl position="bottomright" />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {overlayUrl ? <TileLayer key={active} url={overlayUrl} opacity={0.6} /> : null}
          <Recenter lat={lat} lon={lon} />
          <AutoResize />
        </MapContainer>

        {/* Layer switcher floats over the map, the way map apps present it —
            keeps the control next to what it changes and saves vertical space. */}
        <div className="map__layers" role="group" aria-label="Map layer">
          {OVERLAYS.map((o) => (
            <button
              key={o.key}
              type="button"
              className={`map__layer ${active === o.key ? 'map__layer--active' : ''}`}
              onClick={() => setActive(o.key)}
              disabled={o.key === 'radar' && !radarUrl}
              aria-pressed={active === o.key}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WeatherMap;
