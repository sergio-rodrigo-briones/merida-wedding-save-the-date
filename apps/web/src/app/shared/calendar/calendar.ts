import { parseIsoDate } from '../time/time';

/** An all-day event: the save the date announces a day, the time comes with the invitation. */
export interface CalendarEvent {
  readonly title: string;
  /** ISO date, e.g. "2028-03-18". */
  readonly date: string;
  readonly location: string;
  readonly timeZone: string;
}

/** "20280318" and the day after, as all-day events need an exclusive end date. */
function compactDays(isoDate: string): { start: string; end: string } {
  const { year, month, day } = parseIsoDate(isoDate);
  const compact = (ms: number) => new Date(ms).toISOString().slice(0, 10).replaceAll('-', '');
  return {
    start: compact(Date.UTC(year, month - 1, day)),
    end: compact(Date.UTC(year, month - 1, day + 1)),
  };
}

/** Link that opens Google Calendar with the event filled in. */
export function googleCalendarUrl(event: CalendarEvent): string {
  const { start, end } = compactDays(event.date);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
    location: event.location,
    ctz: event.timeZone,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

/** Escapes text for an iCalendar property value (RFC 5545, section 3.3.11). */
function icsText(value: string): string {
  return value.replace(/[\\;,]/g, (char) => `\\${char}`).replace(/\r?\n/g, '\\n');
}

/**
 * An .ics file for Apple Calendar, Outlook and any other calendar app.
 * `now` is a parameter so the output is deterministic in tests.
 */
export function icsCalendar(event: CalendarEvent, now: Date): string {
  const { start, end } = compactDays(event.date);
  const stamp = now
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//merida-wedding-save-the-date//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${start}-save-the-date@merida-wedding`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${icsText(event.title)}`,
    `LOCATION:${icsText(event.location)}`,
    'TRANSP:TRANSPARENT',
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}
