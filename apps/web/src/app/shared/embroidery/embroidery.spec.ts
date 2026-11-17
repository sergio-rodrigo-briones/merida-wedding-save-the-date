import {
  beside,
  blank,
  chartSize,
  orderStitches,
  parseChart,
  recolor,
  repeat,
  stack,
  textChart,
} from './embroidery';
import type { Chart, Stitch } from './embroidery.model';

const at = (stitches: readonly Stitch[]) => stitches.map((s) => `${s.thread}${s.col},${s.row}`);

describe('chartSize', () => {
  it('measures columns and rows', () => {
    expect(chartSize(['B.B', '.M.'])).toEqual({ cols: 3, rows: 2 });
  });

  it('treats an empty chart as 0 × 0', () => {
    expect(chartSize([])).toEqual({ cols: 0, rows: 0 });
  });

  it('rejects rows of different lengths, naming the bad row', () => {
    expect(() => chartSize(['BBB', 'BB', 'BBB'])).toThrow('Chart row 1 has 2 cells, expected 3.');
  });
});

describe('parseChart', () => {
  it('turns every thread cell into a stitch, in reading order', () => {
    expect(parseChart(['B.C', '.M.'])).toEqual([
      { col: 0, row: 0, thread: 'B' },
      { col: 2, row: 0, thread: 'C' },
      { col: 1, row: 1, thread: 'M' },
    ]);
  });

  it('treats dots and spaces as bare fabric', () => {
    expect(parseChart(['. .', ' . '])).toEqual([]);
  });

  it('returns no stitches for an empty chart', () => {
    expect(parseChart([])).toEqual([]);
  });

  it('rejects a ragged chart', () => {
    expect(() => parseChart(['BB', 'B'])).toThrow();
  });
});

describe('orderStitches', () => {
  //   col 0 1 2
  // row 0  B C B
  // row 1  C B .
  const stitches = parseChart(['BCB', 'CB.']);

  it('rows: reads top to bottom, left to right', () => {
    expect(at(orderStitches(stitches, 'rows'))).toEqual(['B0,0', 'C1,0', 'B2,0', 'C0,1', 'B1,1']);
  });

  it('color: sews one thread at a time, in order of first appearance', () => {
    expect(at(orderStitches(stitches, 'color'))).toEqual(['B0,0', 'B2,0', 'B1,1', 'C1,0', 'C0,1']);
  });

  it('color: follows the given thread order, then any unlisted thread', () => {
    const withGold = parseChart(['BMC']);
    expect(at(orderStitches(withGold, 'color', ['C', 'X']))).toEqual(['C2,0', 'B0,0', 'M1,0']);
  });

  it('needle: moves to the nearest stitch instead of scanning rows', () => {
    // Rows would go 0,0 → 3,0 → 0,1. The needle stays close: 0,0 → 0,1 → 3,0.
    const spread = parseChart(['B..B', 'B...']);
    expect(at(orderStitches(spread, 'needle'))).toEqual(['B0,0', 'B0,1', 'B3,0']);
  });

  it.each(['rows', 'color', 'needle'] as const)('%s: keeps every stitch exactly once', (order) => {
    const result = orderStitches(stitches, order);
    expect(result).toHaveLength(stitches.length);
    expect(new Set(at(result))).toEqual(new Set(at(stitches)));
  });

  it('never mutates its input', () => {
    const input = parseChart(['CB']);
    const copy = [...input];
    orderStitches(input, 'rows');
    orderStitches(input, 'needle');
    expect(input).toEqual(copy);
  });
});

describe('composition', () => {
  const dot: Chart = ['B'];
  const bar: Chart = ['CCC'];

  it('blank: fabric of the given size', () => {
    expect(blank(3, 2)).toEqual(['...', '...']);
  });

  it('beside: joins charts with a gap, centring the shorter one', () => {
    expect(beside([['C', 'C', 'C'], dot], 1)).toEqual(['C..', 'C.B', 'C..']);
  });

  it('stack: piles charts with a gap, centring the narrower one', () => {
    expect(stack([bar, dot], 1)).toEqual(['CCC', '...', '.B.']);
  });

  it('repeat: a band of the same motif', () => {
    expect(repeat(['B.'], 3)).toEqual(['B.B.B.']);
    expect(chartSize(repeat(['BB', 'BB'], 4, 2))).toEqual({ cols: 14, rows: 2 });
  });

  it('returns an empty chart when there is nothing to compose', () => {
    expect(beside([])).toEqual([]);
    expect(stack([])).toEqual([]);
  });

  it('recolor: swaps threads and leaves fabric alone', () => {
    expect(recolor(['B.F', 'FB.'], { B: 'C' })).toEqual(['C.F', 'FC.']);
  });

  it('keeps the stitch count when composing', () => {
    const flower: Chart = ['.B.', 'BMB', '.B.'];
    expect(parseChart(repeat(flower, 5, 1))).toHaveLength(5 * parseChart(flower).length);
  });
});

describe('textChart', () => {
  const glyphs = { '1': ['#', '#'], '-': ['.', '#'] };

  it('sews text with one thread and a gap between letters', () => {
    expect(textChart('1-1', glyphs, 'C')).toEqual(['C...C', 'C.C.C']);
  });

  it('can sew some characters with their own thread', () => {
    expect(textChart('1-', glyphs, 'C', { gap: 0, threadFor: { '-': 'B' } })).toEqual(['C.', 'CB']);
  });

  it('rejects characters the alphabet does not have', () => {
    expect(() => textChart('1/1', glyphs, 'C')).toThrow('No stitch glyph for "/".');
  });
});
