# Skyline 🌤️

A single-search **weather & air-quality dashboard** built with React. Type a city
once and Skyline resolves it to coordinates, then pulls **current conditions**,
an **hourly** and **5-day forecast**, **UV index**, **air quality**, severe-weather
**alerts**, and an interactive **weather map** for that exact spot — all on a
glassmorphic UI whose background reacts to the live weather.

> Skyline merges two earlier projects (WeatherNow + AirNow) into one product.
> One lookup now answers both *"what's it like outside?"* and *"is the air clean?"*.

## Features

- 🔎 **Autocomplete search** — OpenWeather geocoding disambiguates cities by state/country; pick a result to load it by coordinates.
- 📍 **Geolocation** — one tap to load conditions for where you are.
- 🌡️ **°C / °F toggle** — client-side conversion, never triggers a refetch; remembered in `localStorage`.
- ⏱️ **Next-24-hours strip** — hourly temperature and precipitation chance (Open-Meteo).
- 📅 **5-day forecast** — aggregated from OpenWeather's 3-hourly feed into daily min/max.
- ☀️ **UV index** — current value + daily peak, WHO risk bands (Open-Meteo).
- 🟢 **Air Quality** — OpenWeather Air Pollution index (1–5) on a hand-built SVG gauge, health guidance, and a PM2.5 / PM10 / O₃ / NO₂ / SO₂ / CO / NH₃ breakdown (µg/m³).
- ⚠️ **Severe-weather alerts** — OpenWeather One Call 3.0 (best-effort; shown when the subscription is enabled).
- 🗺️ **Interactive map** — Leaflet + OpenStreetMap base with toggleable OpenWeather layers (precipitation, clouds, temperature, wind, pressure) and a keyless RainViewer radar frame.
- 🎨 **Weather-reactive theme** — the animated background gradient shifts with the conditions and time of day.
- ✨ **Polished states** — shimmer skeletons while loading, friendly empty/error states, fully responsive, reduced-motion support. Every secondary source degrades gracefully if it fails.

## Tech

- **React 18** (Create React App), functional components + hooks
- **react-leaflet** / **leaflet** for the map, **react-icons** for iconography
- Native **`fetch`** (no axios) with a small typed error layer
- **OpenWeather** (current · 5-day · geocoding · air pollution · map tiles · One Call 3.0),
  **Open-Meteo** (hourly · UV), **RainViewer** (radar), **OpenStreetMap** (base tiles)

## Getting started

```bash
git clone https://github.com/WickTech/skyline.git
cd skyline
npm install

# configure your API key
cp .env.example .env
#  → edit .env and add your OpenWeather key

npm start          # http://localhost:3000
```

Get a free key here: https://openweathermap.org/api
(Open-Meteo, RainViewer and OpenStreetMap need no key.)

### Environment variables

| Variable | Purpose |
| --- | --- |
| `REACT_APP_OPENWEATHER_KEY` | OpenWeather API key — powers current, forecast, geocoding, air pollution and map tiles |

> **One Call 3.0** (weather alerts, extended data) is a separate, free OpenWeather
> subscription you enable on your account. The app works without it.

> **Security & deploys:** `.env` is gitignored. CRA inlines `REACT_APP_*` vars into
> the client bundle **at build time**, so set the same variable in your Vercel project
> settings and redeploy — the value isn't picked up by an existing build. Earlier
> versions committed keys in source; **rotate any leaked key** (OpenWeather revokes
> keys it finds on public GitHub). For a public deploy prefer a domain-restricted key
> or a backend proxy.

## Project structure

```
src/
  api/          config · weather.js · airQuality.js · geocoding.js ·
                openMeteo.js · maps.js
  hooks/        useEnvironment.js  — orchestrates the combined lookup
  utils/        format.js · aqi.js · theme.js
  components/   SearchBar · UnitToggle · CurrentWeather · Hourly · Forecast ·
                AirQuality · UvIndex · Alerts · WeatherMap · WeatherIcon ·
                Skeleton · StateMessage
  App.js        layout, state, theming
  index.js / index.css
```

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Run the dev server |
| `npm run build` | Production build into `build/` |
| `npm test` | Run tests |

## Credits

Weather by [OpenWeather](https://openweathermap.org/) & [Open-Meteo](https://open-meteo.com/) ·
radar by [RainViewer](https://www.rainviewer.com/) · base map ©
[OpenStreetMap](https://www.openstreetmap.org/) contributors. Built as a React UI showcase.
