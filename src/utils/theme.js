// Maps the current conditions to a full-page sky. Each theme is a layered
// gradient: a coloured light source (sun glow, moonlight, storm haze) over a
// vertical sky wash, so the page reads as the weather it is describing.
//
// OpenWeather icon codes end in 'd' (day) or 'n' (night); the leading digits
// describe the condition group.

const SKIES = {
  clearDay:
    'radial-gradient(60% 55% at 80% 8%, rgba(255,214,120,.55), transparent 55%), linear-gradient(180deg,#3f7fce 0%,#6ea6e6 48%,#a6cbf1 100%)',
  dusk:
    'radial-gradient(100% 80% at 82% 112%, rgba(255,160,95,.26), transparent 55%), linear-gradient(180deg,#2c2c63 0%,#3a2f5e 34%,#241d3f 74%,#161227 100%)',
  night:
    'radial-gradient(70% 50% at 20% 8%, rgba(120,150,255,.20), transparent 60%), linear-gradient(180deg,#0d1230 0%,#12183a 52%,#080a1c 100%)',
  storm:
    'radial-gradient(80% 60% at 50% -6%, rgba(160,180,215,.22), transparent 58%), linear-gradient(180deg,#2a3140 0%,#363c4d 42%,#191d26 100%)',
  cloudsDay:
    'radial-gradient(70% 55% at 74% 6%, rgba(255,236,200,.30), transparent 58%), linear-gradient(180deg,#5b7fae 0%,#7f9cc0 46%,#aebed4 100%)',
  cloudsNight:
    'radial-gradient(70% 50% at 24% 6%, rgba(140,165,230,.16), transparent 60%), linear-gradient(180deg,#1a2138 0%,#232c46 52%,#121728 100%)',
  rainDay:
    'radial-gradient(80% 60% at 60% -4%, rgba(170,200,230,.22), transparent 58%), linear-gradient(180deg,#3c5670 0%,#4a6377 44%,#22303e 100%)',
  rainNight:
    'radial-gradient(80% 60% at 40% -4%, rgba(120,155,200,.16), transparent 60%), linear-gradient(180deg,#182534 0%,#1e2c3d 50%,#0d151f 100%)',
  snow:
    'radial-gradient(65% 55% at 70% 6%, rgba(255,255,255,.34), transparent 58%), linear-gradient(180deg,#7f9fc4 0%,#a3bcd8 48%,#cfdcea 100%)',
  mist:
    'radial-gradient(80% 60% at 50% 10%, rgba(220,228,240,.24), transparent 62%), linear-gradient(180deg,#5a6479 0%,#6f7889 46%,#414959 100%)',
};

/**
 * Pick a sky for an OpenWeather icon code.
 *
 * `sunTimes` is optional; when the current time is within ~an hour of sunset (or
 * just after) on an otherwise clear/cloudy day, we swap in the dusk sky so the
 * page matches the golden hour rather than jumping straight to midday blue.
 */
export function skyForIcon(iconCode, sunTimes) {
  if (!iconCode) return SKIES.dusk;

  const isDay = iconCode.endsWith('d');
  const group = iconCode.slice(0, 2);

  if (isDay && isGoldenHour(sunTimes) && ['01', '02', '03', '04'].includes(group)) {
    return SKIES.dusk;
  }

  switch (group) {
    case '01':
      return isDay ? SKIES.clearDay : SKIES.night;
    case '02':
    case '03':
    case '04':
      return isDay ? SKIES.cloudsDay : SKIES.cloudsNight;
    case '09':
    case '10':
      return isDay ? SKIES.rainDay : SKIES.rainNight;
    case '11':
      return SKIES.storm;
    case '13':
      return SKIES.snow;
    case '50':
      return SKIES.mist;
    default:
      return isDay ? SKIES.clearDay : SKIES.night;
  }
}

// Within an hour either side of sunset counts as golden hour.
function isGoldenHour({ dt, sunset } = {}) {
  if (!dt || !sunset) return false;
  return Math.abs(dt - sunset) <= 3600;
}

/**
 * Accent pair for the aurora blobs, so the ambient glow tracks the sky rather
 * than staying a fixed blue/orange in every condition.
 */
export function auroraForIcon(iconCode) {
  const group = (iconCode || '').slice(0, 2);
  const isDay = (iconCode || '').endsWith('d');

  if (group === '11') return ['rgba(150,170,210,.26)', 'rgba(120,140,190,.20)'];
  if (group === '13') return ['rgba(255,255,255,.30)', 'rgba(180,205,235,.24)'];
  if (group === '09' || group === '10') return ['rgba(130,180,230,.28)', 'rgba(90,140,190,.20)'];
  if (group === '50') return ['rgba(220,228,240,.24)', 'rgba(180,190,205,.18)'];
  if (isDay) return ['rgba(255,214,120,.30)', 'rgba(143,180,255,.26)'];
  return ['rgba(143,180,255,.24)', 'rgba(255,180,120,.18)'];
}
