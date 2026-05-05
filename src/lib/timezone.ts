// Client-side timezone helpers for the expert mode in the birth form.
// Mirrors supabase/functions/_shared/timezone.ts so the user can preview the
// IANA zone, UTC offset and ISO instant before submitting.

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

export function guessTimezoneFromCountry(country?: string): string | null {
  if (!country) return null;
  const key = country.trim().toLowerCase();
  for (const k of Object.keys(COUNTRY_ZONE)) {
    if (key.includes(k)) return COUNTRY_ZONE[k];
  }
  return null;
}

export function listCommonTimezones(): string[] {
  // Try to use Intl.supportedValuesOf when available (modern browsers).
  const intlAny = Intl as unknown as { supportedValuesOf?: (k: string) => string[] };
  if (typeof intlAny.supportedValuesOf === "function") {
    try {
      return intlAny.supportedValuesOf("timeZone");
    } catch {
      // fallthrough
    }
  }
  return Array.from(new Set(Object.values(COUNTRY_ZONE))).sort();
}

export function localToUTC(opts: {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  timezone: string;
}): { utcISO: string; offsetMinutes: number } {
  const { date, time, timezone } = opts;
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
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
  let utc = guess;
  for (let i = 0; i < 2; i++) {
    const projected = fmt(utc);
    const diff = projected - utc;
    utc = guess - diff;
  }
  const offsetMinutes = (fmt(utc) - utc) / 60000;
  return { utcISO: new Date(utc).toISOString(), offsetMinutes };
}

export function formatOffset(minutes: number): string {
  const sign = minutes >= 0 ? "+" : "-";
  const abs = Math.abs(minutes);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  return `UTC${sign}${hh}:${mm}`;
}

// Validate ISO-like UTC string ending in Z and parseable.
export function isValidUtcISO(value: string): boolean {
  if (!value) return false;
  if (!/Z$/.test(value)) return false;
  const t = Date.parse(value);
  return !Number.isNaN(t);
}
