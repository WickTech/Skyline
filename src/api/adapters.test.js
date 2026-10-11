import { afterEach, describe, expect, it, vi } from 'vitest';
import { localIsoToUnix, normalizeForecast } from './openMeteo';
import { normalizeAirQuality } from './airQuality';
import { describeWmo } from './wmo';
import { geocodeCity, reverseGeocode } from './geocoding';
import { aqiInfo } from '../utils/aqi';
import { weekdayOfDate } from '../utils/format';

// Shaped like a live Open-Meteo response for London (UTC+1 in October).
const OFFSET = 3600;
const forecastFixture = {
  latitude: 51.5,
  longitude: -0.12,
  utc_offset_seconds: OFFSET,
  current: {
    time: '2026-10-11T12:00',
    temperature_2m: 13.1,
    relative_humidity_2m: 56,
    apparent_temperature: 10.8,
    is_day: 1,
    weather_code: 3,
    wind_speed_10m: 1.8,
    visibility: 17700,
  },
  hourly: {
    time: ['2026-10-11T10:00', '2026-10-11T11:00', '2026-10-11T12:00', '2026-10-11T21:00'],
    temperature_2m: [11, 12, 13, 9],
    precipitation_probability: [0, 5, 10, 40],
    weather_code: [0, 1, 3, 61],
    uv_index: [1.5, 2, 2.4, 0],
    is_day: [1, 1, 1, 0],
  },
  daily: {
    time: ['2026-10-11', '2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16'],
    weather_code: [3, 61, 0, 95, 71, 2],
    temperature_2m_max: [14.6, 15.2, 13.9, 12.1, 3.4, 10],
    temperature_2m_min: [8.2, 9.9, 7.1, 6.4, -1.2, 4],
    sunrise: ['2026-10-11T07:17'],
    sunset: ['2026-10-11T18:21'],
    uv_index_max: [2.6],
  },
};
// "Now" = 12:30 London time, as unix ms.
const NOW = Date.parse('2026-10-11T11:30:00Z');

describe('localIsoToUnix', () => {
  it('treats the ISO string as wall-clock time at the given offset', () => {
    expect(localIsoToUnix('2026-10-11T12:00', OFFSET)).toBe(Date.parse('2026-10-11T11:00:00Z') / 1000);
    expect(localIsoToUnix('2026-10-11T12:00', -5 * 3600)).toBe(Date.parse('2026-10-11T17:00:00Z') / 1000);
  });

  it('maps a bare date to local noon', () => {
    expect(localIsoToUnix('2026-10-11', 0)).toBe(Date.parse('2026-10-11T12:00:00Z') / 1000);
  });
});

describe('normalizeForecast', () => {
  const out = normalizeForecast(forecastFixture, NOW);

  it('builds current conditions in the shape the UI consumes', () => {
    const c = out.current;
    expect(c.coord).toEqual({ lat: 51.5, lon: -0.12 });
    expect(c.timezone).toBe(OFFSET);
    expect(c.dt).toBe(Date.parse('2026-10-11T11:00:00Z') / 1000);
    expect(c.main).toEqual({ temp: 13.1, feels_like: 10.8, temp_min: 8.2, temp_max: 14.6, humidity: 56 });
    expect(c.wind.speed).toBe(1.8);
    expect(c.visibility).toBe(17700);
    expect(c.weather[0]).toEqual({ icon: '04d', main: 'Clouds', description: 'overcast' });
    expect(c.sys.sunrise).toBe(Date.parse('2026-10-11T06:17:00Z') / 1000);
    expect(c.sys.sunset).toBe(Date.parse('2026-10-11T17:21:00Z') / 1000);
  });

  it('caps the daily outlook at 5 days with rounded temps', () => {
    expect(out.daily).toHaveLength(5);
    expect(out.daily[1]).toMatchObject({ date: '2026-10-12', min: 10, max: 15, icon: '10d', condition: 'Rain' });
    expect(out.daily[4]).toMatchObject({ min: -1, max: 3, condition: 'Snow' });
  });

  it('drops hours more than 1h in the past, using the location offset', () => {
    // 10:00 local is 2.5h ago → dropped; 11:00 local is 1.5h ago → dropped.
    // A browser-timezone parse would get this wrong for remote locations.
    expect(out.hourly.map((h) => h.time)).toEqual(['2026-10-11T12:00', '2026-10-11T21:00']);
    expect(out.hourly[1].icon).toBe('10n'); // night variant from hourly is_day
  });

  it('reports UV now and today\'s peak', () => {
    expect(out.uvNow).toBe(2.4);
    expect(out.uvMax).toBe(2.6);
  });

  it('uses night icons when it is dark', () => {
    const night = normalizeForecast(
      { ...forecastFixture, current: { ...forecastFixture.current, is_day: 0, weather_code: 0 } },
      NOW
    );
    expect(night.current.weather[0].icon).toBe('01n');
  });

  it('throws a friendly error on an unusable payload', () => {
    expect(() => normalizeForecast({})).toThrow('Forecast unavailable');
  });
});

describe('describeWmo', () => {
  it('falls back to clear sky for unknown codes', () => {
    expect(describeWmo(1234)).toEqual({ icon: '01d', main: 'Clear', description: 'clear sky' });
  });
});

describe('normalizeAirQuality', () => {
  it('maps European AQI and pollutants, treating GMT time as UTC', () => {
    const aq = normalizeAirQuality({
      current: {
        time: '2026-10-11T11:00',
        european_aqi: 68,
        pm2_5: 64.5,
        pm10: 80,
        ozone: 20,
        nitrogen_dioxide: 11,
        sulphur_dioxide: 1,
        carbon_monoxide: 180,
        ammonia: null,
      },
    });
    expect(aq.aqi).toBe(68);
    expect(aq.time).toBe('2026-10-11T11:00:00.000Z');
    expect(aq.pollutants.pm25).toBe(64.5);
    expect(aq.pollutants.nh3).toBeNull();
  });

  it('throws when there is no reading', () => {
    expect(() => normalizeAirQuality({ current: { european_aqi: null } })).toThrow();
  });
});

describe('aqiInfo (European AQI bands)', () => {
  it.each([
    [0, 'Good'],
    [20, 'Good'],
    [21, 'Fair'],
    [55, 'Moderate'],
    [68, 'Poor'],
    [95, 'Very Poor'],
    [140, 'Extremely Poor'],
  ])('%i → %s', (aqi, label) => {
    expect(aqiInfo(aqi).label).toBe(label);
  });

  it('caps the gauge at 100% and handles missing readings', () => {
    expect(aqiInfo(140).percent).toBe(100);
    expect(aqiInfo(null).label).toBe('Unknown');
  });
});

describe('geocoding', () => {
  afterEach(() => vi.unstubAllGlobals());

  function stubFetch(body) {
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => body }));
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
  }

  it('maps Open-Meteo search results to places', async () => {
    const fetchMock = stubFetch({
      results: [
        { name: 'Springfield', admin1: 'Illinois', country: 'United States', country_code: 'US', latitude: 39.8, longitude: -89.6 },
      ],
    });
    const [p] = await geocodeCity(' Springfield ', 3);
    expect(p).toEqual({
      name: 'Springfield',
      state: 'Illinois',
      country: 'United States',
      countryCode: 'US',
      lat: 39.8,
      lon: -89.6,
      label: 'Springfield, Illinois, United States',
    });
    expect(fetchMock.mock.calls[0][0]).toContain('name=Springfield&count=3');
  });

  it('returns [] when nothing matches (no `results` key)', async () => {
    stubFetch({ generationtime_ms: 0.1 });
    expect(await geocodeCity('zzzzqqq')).toEqual([]);
  });

  it('reverse-geocodes via BigDataCloud, null when unnamed', async () => {
    stubFetch({ city: '', locality: 'Durg', principalSubdivision: 'Chhattisgarh', countryCode: 'IN', countryName: 'India' });
    expect(await reverseGeocode(21.19, 81.28)).toMatchObject({ name: 'Durg', countryCode: 'IN', lat: 21.19 });
    stubFetch({ city: '', locality: '' });
    expect(await reverseGeocode(0, 0)).toBeNull();
  });
});

describe('weekdayOfDate', () => {
  it('names the location-local date regardless of the browser timezone', () => {
    // 2026-10-12 is a Monday everywhere it is that calendar date.
    expect(weekdayOfDate('2026-10-12', { short: true })).toBe(
      new Date(Date.UTC(2026, 9, 12, 12)).toLocaleDateString(undefined, { weekday: 'short', timeZone: 'UTC' })
    );
    expect(weekdayOfDate('not-a-date')).toBe('—');
  });
});
