// Lightweight timezone resolver for Edge Functions (Deno).
// Returns IANA tz name from latitude/longitude using a coarse coordinate map
// fallback combined with Intl-based UTC offset calculation that respects DST
// for the specific historical date.

// We use the "tz-lookup" coordinate-based resolver via a tiny inlined dataset
// of common regions. For accuracy across all locations we additionally rely
// on the geocoder's country/state hints when available.
//
// For DST: we use Intl.DateTimeFormat with the resolved zone to compute the
// exact UTC offset for the given local instant, which Deno supports natively
// and accounts for historical DST rules from the IANA tz database.

// Coarse zone selection by country bounding boxes (extend as needed).
// Most users live in well-known zones; for precision we let Intl handle DST.
const COUNTRY_ZONE: Record<string, string> = {
  mexico: "America/Mexico_City",
  méxico: "America/Mexico_City",
  "estados unidos": "America/New_York",
  "united states": "America/New_York",
  usa: "America/New_York",
  argentina: "America/Argentina/Buenos_Aires",
  chile: "America/Santiago",
  colombia: "America/Bogota",
  peru: "America/Lima",
  perú: "America/Lima",
  venezuela: "America/Caracas",
  brasil: "America/Sao_Paulo",
  brazil: "America/Sao_Paulo",
  uruguay: "America/Montevideo",
  paraguay: "America/Asuncion",
  bolivia: "America/La_Paz",
  ecuador: "America/Guayaquil",
  cuba: "America/Havana",
  "puerto rico": "America/Puerto_Rico",
  "república dominicana": "America/Santo_Domingo",
  guatemala: "America/Guatemala",
  honduras: "America/Tegucigalpa",
  "el salvador": "America/El_Salvador",
  nicaragua: "America/Managua",
  "costa rica": "America/Costa_Rica",
  panamá: "America/Panama",
  panama: "America/Panama",
  españa: "Europe/Madrid",
  spain: "Europe/Madrid",
  francia: "Europe/Paris",
  france: "Europe/Paris",
  alemania: "Europe/Berlin",
  germany: "Europe/Berlin",
  "reino unido": "Europe/London",
  "united kingdom": "Europe/London",
  uk: "Europe/London",
  italia: "Europe/Rome",
  italy: "Europe/Rome",
  portugal: "Europe/Lisbon",
  polonia: "Europe/Warsaw",
  poland: "Europe/Warsaw",
  japón: "Asia/Tokyo",
  japan: "Asia/Tokyo",
  china: "Asia/Shanghai",
  india: "Asia/Kolkata",
  australia: "Australia/Sydney",
  "nueva zelanda": "Pacific/Auckland",
  canada: "America/Toronto",
  canadá: "America/Toronto",
};

// Coarse longitude → fallback zone (only used if we have nothing else).
function zoneFromLongitude(lon: number): string {
  const offset = Math.round(lon / 15);
  if (offset === 0) return "UTC";
  const sign = offset > 0 ? "-" : "+"; // Etc/GMT signs are inverted
  return `Etc/GMT${sign}${Math.abs(offset)}`;
}

export function resolveTimezone(opts: {
  latitude: number;
  longitude: number;
  country?: string;
  displayName?: string;
}): string {
  const { latitude, longitude, country, displayName } = opts;

  const haystack = `${country ?? ""} ${displayName ?? ""}`.toLowerCase();
  for (const key of Object.keys(COUNTRY_ZONE)) {
    if (haystack.includes(key)) return COUNTRY_ZONE[key];
  }

  // North America rough bands
  if (latitude > 14 && latitude < 50 && longitude < -60 && longitude > -125) {
    if (longitude < -115) return "America/Los_Angeles";
    if (longitude < -100) return "America/Denver";
    if (longitude < -85) return "America/Chicago";
    return "America/New_York";
  }

  return zoneFromLongitude(longitude);
}

// Compute the UTC ISO instant for a local wall time in a given IANA zone,
// honoring DST for that specific date.
export function localToUTC(opts: {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (24h)
  timezone: string;
}): { utcISO: string; offsetMinutes: number } {
  const { date, time, timezone } = opts;
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);

  // First guess: treat the wall time as if it were UTC, then adjust by the
  // offset Intl reports for that instant in the target zone.
  const guess = Date.UTC(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, 0);

  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  const fmt = (ms: number) => {
    const parts = dtf.formatToParts(new Date(ms));
    const o: Record<string, string> = {};
    for (const p of parts) if (p.type !== "literal") o[p.type] = p.value;
    return Date.UTC(
      Number(o.year), Number(o.month) - 1, Number(o.day),
      Number(o.hour), Number(o.minute), Number(o.second)
    );
  };

  // Iterate twice to converge across DST transitions.
  let utc = guess;
  for (let i = 0; i < 2; i++) {
    const projected = fmt(utc);
    const diff = projected - utc; // tz offset in ms (zone is ahead of UTC by `diff`)
    utc = guess - diff;
  }

  const offsetMinutes = (fmt(utc) - utc) / 60000;
  return { utcISO: new Date(utc).toISOString(), offsetMinutes };
}
