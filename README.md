# Skyline 🌤️

A single-search **weather & air-quality dashboard** built with React. Type a city
once and Skyline resolves it to coordinates, then pulls **current conditions**,
a **5-day forecast**, and the **air quality index** for that exact spot — all on a
glassmorphic UI whose background reacts to the live weather.

> Skyline merges two earlier projects (WeatherNow + AirNow) into one product.
> One lookup now answers both *"what's it like outside?"* and *"is the air clean?"*.

## Features

- 🔎 **One search, two answers** — weather and air quality resolved from the same coordinates, so the readings always describe the same place.
- 📍 **Geolocation** — one tap to load conditions for where you are.
- 🌡️ **°C / °F toggle** — client-side conversion, never triggers a refetch; remembered in `localStorage`.
- 📅 **Real 5-day forecast** — aggregated from OpenWeatherMap's 3-hourly feed into daily min/max with a representative icon.
- 🟢 **Air Quality Index** — hand-built SVG gauge, EPA category + health guidance, dominant pollutant, and a PM2.5 / PM10 / O₃ / NO₂ / SO₂ / CO breakdown.
- 🎨 **Weather-reactive theme** — the animated background gradient shifts with the conditions and time of day.
- ✨ **Polished states** — shimmer skeletons while loading, friendly empty/error states, fully responsive down to mobile, and reduced-motion support.

## Tech

- **React 18** (Create React App), functional components + hooks
- **react-icons** for iconography
- Native **`fetch`** (no axios) with a small typed error layer
- **OpenWeatherMap** (current + 5-day/3-hour forecast) & **WAQI** (air quality)

## Getting started

```bash
git clone https://github.com/WickTech/skyline.git
cd skyline
npm install

# configure your API keys
cp .env.example .env
#  → edit .env and add your OpenWeatherMap key and WAQI token

npm start          # http://localhost:3000
```

Get free keys here:
- OpenWeatherMap: https://openweathermap.org/api
- WAQI token: https://aqicn.org/data-platform/token/

### Environment variables

| Variable | Purpose |
| --- | --- |
| `REACT_APP_OPENWEATHER_KEY` | OpenWeatherMap API key |
| `REACT_APP_WAQI_TOKEN` | World Air Quality Index token |

> **Security note:** API keys are read from the environment and `.env` is gitignored.
> Earlier versions committed keys directly in source (`api.txt` / inline) — rotate any
> such key. CRA inlines `REACT_APP_*` vars into the client bundle, so for a public
> deployment use keys that are domain-restricted or proxied through a backend.

## Project structure

```
src/
  api/          config (keys, fetch helper) · weather.js · airQuality.js
  hooks/        useEnvironment.js  — orchestrates the combined lookup
  utils/        format.js · aqi.js · theme.js
  components/   SearchBar · UnitToggle · CurrentWeather · Forecast ·
                AirQuality · WeatherIcon · Skeleton · StateMessage
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

Weather data by [OpenWeatherMap](https://openweathermap.org/) · air-quality data by
[WAQI / aqicn.org](https://aqicn.org/). Built as a React UI showcase.
