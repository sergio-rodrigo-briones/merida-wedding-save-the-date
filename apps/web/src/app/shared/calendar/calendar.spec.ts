import { type CalendarEvent, googleCalendarUrl, icsCalendar } from './calendar';

const event: CalendarEvent = {
  title: 'Boda de Itzel & Jordi',
  date: '2028-03-18',
  location: 'Mérida, Yucatán',
  timeZone: 'America/Merida',
};

describe('googleCalendarUrl', () => {
  const url = new URL(googleCalendarUrl(event));

  it('opens the Google Calendar event template', () => {
    expect(url.origin + url.pathname).toBe('https://calendar.google.com/calendar/render');
    expect(url.searchParams.get('action')).toBe('TEMPLATE');
  });

  it('creates an all-day event with an exclusive end date', () => {
    expect(url.searchParams.get('dates')).toBe('20280318/20280319');
  });

  it('carries title, place and time zone, encoded', () => {
    expect(url.searchParams.get('text')).toBe('Boda de Itzel & Jordi');
    expect(url.searchParams.get('location')).toBe('Mérida, Yucatán');
    expect(url.searchParams.get('ctz')).toBe('America/Merida');
  });

  it('rolls the end date over months and years', () => {
    const newYearsEve = new URL(googleCalendarUrl({ ...event, date: '2028-12-31' }));
    expect(newYearsEve.searchParams.get('dates')).toBe('20281231/20290101');
  });
});

describe('icsCalendar', () => {
  const ics = icsCalendar(event, new Date('2026-11-17T10:20:30.456Z'));
  const lines = ics.split('\r\n');

  it('uses CRLF line endings, as RFC 5545 requires', () => {
    expect(ics).toContain('\r\n');
    expect(ics.replaceAll('\r\n', '')).not.toContain('\n');
  });

  it('describes one all-day event', () => {
    expect(lines).toContain('DTSTART;VALUE=DATE:20280318');
    expect(lines).toContain('DTEND;VALUE=DATE:20280319');
    expect(lines.filter((line) => line === 'BEGIN:VEVENT')).toHaveLength(1);
  });

  it('escapes commas in text values', () => {
    expect(lines).toContain('LOCATION:Mérida\\, Yucatán');
  });

  it('stamps the creation time in UTC basic format', () => {
    expect(lines).toContain('DTSTAMP:20261117T102030Z');
  });
});
