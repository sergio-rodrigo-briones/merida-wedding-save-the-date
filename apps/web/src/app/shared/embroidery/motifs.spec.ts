import { chartSize, parseChart, textChart } from './embroidery';
import type { Chart } from './embroidery.model';
import { DIGITS, diamondBand, FLOWER, SEAL, THREAD_ORDER, THREADS } from './motifs';

const threadsOf = (chart: Chart) => new Set(parseChart(chart).map((stitch) => stitch.thread));

describe('motifs', () => {
  it.each([
    ['FLOWER', FLOWER, { cols: 11, rows: 16 }],
    ['SEAL', SEAL, { cols: 5, rows: 5 }],
  ])('%s is a valid chart of the expected size', (_, chart, size) => {
    expect(chartSize(chart)).toEqual(size);
  });

  it.each([
    ['FLOWER', FLOWER],
    ['SEAL', SEAL],
    ['diamondBand', diamondBand(42)],
  ])('%s only uses threads from the palette', (_, chart) => {
    for (const thread of threadsOf(chart)) expect(THREADS).toHaveProperty(thread);
  });

  it('lists every palette thread exactly once in the rethreading order', () => {
    expect([...THREAD_ORDER].sort()).toEqual(Object.keys(THREADS).sort());
  });

  it('points every thread at a design token', () => {
    for (const color of Object.values(THREADS)) expect(color).toMatch(/^var\(--color-thread-\d\)$/);
  });
});

describe('diamondBand', () => {
  it('is as wide as asked and has a border above and below the diamonds', () => {
    const band = diamondBand(42);
    expect(chartSize(band)).toEqual({ cols: 42, rows: 11 });
    expect(band[0]).toBe(band[band.length - 1]);
    expect(band[0].startsWith('H.H.')).toBe(true);
  });

  it('has one golden centre per full diamond', () => {
    const centres = parseChart(diamondBand(42)).filter((stitch) => stitch.thread === 'M');
    expect(centres).toHaveLength(7);
  });
});

describe('DIGITS', () => {
  it('has a 5-row glyph for every digit and the separator', () => {
    expect(Object.keys(DIGITS).sort()).toEqual([...'0123456789·'].sort());
    for (const glyph of Object.values(DIGITS)) expect(chartSize(glyph).rows).toBe(5);
  });

  it('sews a full date', () => {
    const date = textChart('18·03·2028', DIGITS, 'C', { threadFor: { '·': 'B' } });
    expect(chartSize(date)).toEqual({ cols: 35, rows: 5 });
    expect(threadsOf(date)).toEqual(new Set(['C', 'B']));
  });
});
