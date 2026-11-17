import type { Chart, ThreadKey } from './embroidery.model';

/**
 * Thread palette. Each key is one letter of a chart; the value is a design token,
 * so the colours stay defined in one place (styles/_tokens.scss) and work in SVG.
 * The colours follow the traditional meanings of hipil embroidery:
 * green is nature, red/pink is life, yellow is abundance, turquoise is the spiritual.
 */
export const THREADS: Readonly<Record<ThreadKey, string>> = {
  H: 'var(--color-thread-1)', // hoja (leaf green)
  B: 'var(--color-thread-2)', // bugambilia (pink)
  M: 'var(--color-thread-3)', // maíz (corn yellow)
  C: 'var(--color-thread-4)', // cenote (turquoise)
  F: 'var(--color-thread-5)', // flamboyán (coral)
};

/** Rethreading order for `color` and `needle` stitching: greens first, golden centres last. */
export const THREAD_ORDER: readonly ThreadKey[] = ['H', 'C', 'B', 'F', 'M'];

/** Xmanikté-style flower with leaves, the centrepiece of the card. */
export const FLOWER: Chart = [
  '....BBB....',
  '...BBBBB...',
  '...BBFBB...',
  '.BB..F..BB.',
  'BBBB.M.BBBB',
  'BFFFMMMFFFB',
  'BBBB.M.BBBB',
  '.BB..F..BB.',
  '...BBFBB...',
  '...BBBBB...',
  '....BBB....',
  '.....H.....',
  '..HH.H.HH..',
  '.HHHHHHHHH.',
  '..HH.H.HH..',
  '.....H.....',
];

/** A small sewn flower that closes the envelope instead of a wax seal. */
export const SEAL: Chart = ['.B.B.', 'BBMBB', '.BMB.', 'BBMBB', '.B.B.'];

/**
 * A band of diamonds between two dotted leaf borders, like the edge of a hipil
 * neckline or hem. Diamonds repeat every 6 columns; `height` is the diamond row
 * height (odd numbers give a centred point).
 */
export function diamondBand(cols: number, height = 7): Chart {
  const middle = (height - 1) / 2;
  const diamonds = Array.from({ length: height }, (_, row) =>
    Array.from({ length: cols }, (_, col) => {
      const distance = Math.abs((col % 6) - 3) + Math.abs(row - middle);
      return distance === 3 ? 'C' : distance === 1 ? 'F' : distance === 0 ? 'M' : '.';
    }).join(''),
  );
  const border = Array.from({ length: cols }, (_, col) => (col % 2 === 0 ? 'H' : '.')).join('');
  const fabric = '.'.repeat(cols);
  return [border, fabric, ...diamonds, fabric, border];
}

/** A 3×5 stitch alphabet for dates: digits and the middle dot used as separator. */
export const DIGITS: Readonly<Record<string, Chart>> = {
  '0': ['###', '#.#', '#.#', '#.#', '###'],
  '1': ['.#.', '##.', '.#.', '.#.', '###'],
  '2': ['###', '..#', '###', '#..', '###'],
  '3': ['###', '..#', '.##', '..#', '###'],
  '4': ['#.#', '#.#', '###', '..#', '..#'],
  '5': ['###', '#..', '###', '..#', '###'],
  '6': ['###', '#..', '###', '#.#', '###'],
  '7': ['###', '..#', '.#.', '.#.', '.#.'],
  '8': ['###', '#.#', '###', '#.#', '###'],
  '9': ['###', '#.#', '###', '..#', '###'],
  '·': ['.', '.', '#', '.', '.'],
};
