// Date helpers. A wedding date is a calendar date in the venue's time zone
// ("2028-03-18" in America/Merida), never a moment in the guest's time zone:
// the countdown must reach zero at the same instant in Barcelona and in Mérida.

export interface TimeLeft {
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
}

/** Splits an ISO date ("2028-03-18") into numbers, rejecting anything else. */
export function parseIsoDate(isoDate: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) throw new Error(`Expected a date like 2028-03-18, got "${isoDate}".`);
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

/** UTC offset of a time zone at a given instant, in minutes (Mérida → -360). */
function offsetMinutes(timeZone: string, instant: number): number {
  const name = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
    .formatToParts(instant)
    .find((part) => part.type === 'timeZoneName')?.value;
  const match = /GMT([+-])(\d{2}):(\d{2})/.exec(name ?? '');
  if (!match) return 0; // "GMT" alone means UTC.
  const minutes = Number(match[2]) * 60 + Number(match[3]);
  return match[1] === '-' ? -minutes : minutes;
}

/**
 * The instant (ms since epoch) when a calendar date starts in a time zone.
 * zonedMidnightUtc('2028-03-18', 'America/Merida') → 2028-03-18T06:00:00Z.
 */
export function zonedMidnightUtc(isoDate: string, timeZone: string): number {
  const { year, month, day } = parseIsoDate(isoDate);
  const midnightAsUtc = Date.UTC(year, month - 1, day);
  return midnightAsUtc - offsetMinutes(timeZone, midnightAsUtc) * 60_000;
}

/** Whole days, hours, minutes and seconds from `now` until `target`; all zero once it has passed. */
export function timeLeft(target: number, now: number): TimeLeft {
  const total = Math.max(0, Math.floor((target - now) / 1000));
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor(total / 3600) % 24,
    minutes: Math.floor(total / 60) % 60,
    seconds: total % 60,
  };
}

/**
 * "Sábado, 18 de marzo de 2028" / "Saturday, March 18, 2028".
 * `{ midSentence: true }` keeps the locale's own case ("se casan el sábado, …").
 */
export function longDate(isoDate: string, locale: string, { midSentence = false } = {}): string {
  const { year, month, day } = parseIsoDate(isoDate);
  // Formatting in UTC keeps the calendar date as written, whatever the device's zone.
  const text = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(Date.UTC(year, month - 1, day));
  if (midSentence) return text;
  return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);
}

/** "18·03·2028": the date as it is sewn on the card. */
export function stitchedDate(isoDate: string): string {
  const { year, month, day } = parseIsoDate(isoDate);
  const two = (n: number) => String(n).padStart(2, '0');
  return `${two(day)}·${two(month)}·${year}`;
}
