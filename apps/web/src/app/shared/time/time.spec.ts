import { longDate, parseIsoDate, stitchedDate, timeLeft, zonedMidnightUtc } from './time';

describe('parseIsoDate', () => {
  it('reads year, month and day', () => {
    expect(parseIsoDate('2028-03-18')).toEqual({ year: 2028, month: 3, day: 18 });
  });

  it.each(['18/03/2028', '2028-03-18T00:00', '2028-3-8', ''])('rejects "%s"', (text) => {
    expect(() => parseIsoDate(text)).toThrow();
  });
});

describe('zonedMidnightUtc', () => {
  it('starts the day at 06:00 UTC in Mérida (UTC-6, no daylight saving)', () => {
    expect(new Date(zonedMidnightUtc('2028-03-18', 'America/Merida')).toISOString()).toBe(
      '2028-03-18T06:00:00.000Z',
    );
  });

  it('follows daylight saving where there is one', () => {
    // Madrid is UTC+1 in winter and UTC+2 in summer.
    expect(new Date(zonedMidnightUtc('2028-01-15', 'Europe/Madrid')).toISOString()).toBe(
      '2028-01-14T23:00:00.000Z',
    );
    expect(new Date(zonedMidnightUtc('2028-07-15', 'Europe/Madrid')).toISOString()).toBe(
      '2028-07-14T22:00:00.000Z',
    );
  });

  it('handles UTC itself', () => {
    expect(new Date(zonedMidnightUtc('2028-03-18', 'UTC')).toISOString()).toBe(
      '2028-03-18T00:00:00.000Z',
    );
  });
});

describe('timeLeft', () => {
  const target = Date.UTC(2028, 2, 18, 6);

  it('splits the remaining time into days, hours, minutes and seconds', () => {
    const now = target - ((2 * 24 + 3) * 3600 + 4 * 60 + 5) * 1000;
    expect(timeLeft(target, now)).toEqual({ days: 2, hours: 3, minutes: 4, seconds: 5 });
  });

  it('rounds partial seconds down', () => {
    expect(timeLeft(target, target - 1500).seconds).toBe(1);
  });

  it('stops at zero once the day has come', () => {
    expect(timeLeft(target, target + 60_000)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });
});

describe('longDate', () => {
  it.each([
    ['es-MX', 'Sábado, 18 de marzo de 2028'],
    ['en-US', 'Saturday, March 18, 2028'],
  ])('formats the wedding day in %s', (locale, text) => {
    expect(longDate('2028-03-18', locale)).toBe(text);
  });

  it('keeps the weekday in lower case inside a Spanish sentence', () => {
    expect(longDate('2028-03-18', 'es-MX', { midSentence: true })).toBe(
      'sábado, 18 de marzo de 2028',
    );
    expect(longDate('2028-03-18', 'en-US', { midSentence: true })).toBe('Saturday, March 18, 2028');
  });
});

describe('stitchedDate', () => {
  it('pads day and month and separates them with middle dots', () => {
    expect(stitchedDate('2028-03-08')).toBe('08·03·2028');
  });
});
