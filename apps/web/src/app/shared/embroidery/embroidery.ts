import type { Chart, ChartSize, Stitch, StitchOrder, ThreadKey } from './embroidery.model';

// Pure functions only: charts in, charts or stitches out. Rendering (SVG) and
// animation (GSAP) live in the component, so all of this is tested without a browser.

const FABRIC = '.';

function isFabric(cell: string): boolean {
  return cell === FABRIC || cell === ' ';
}

/**
 * Size of a chart. Throws if its rows have different lengths: charts are
 * hand-written constants, so a typo must fail in the tests, not on a guest's phone.
 */
export function chartSize(chart: Chart): ChartSize {
  const cols = chart[0]?.length ?? 0;
  chart.forEach((row, index) => {
    if (row.length !== cols) {
      throw new Error(`Chart row ${index} has ${row.length} cells, expected ${cols}.`);
    }
  });
  return { cols, rows: chart.length };
}

/** Every stitch of a chart, in reading order (top to bottom, left to right). */
export function parseChart(chart: Chart): Stitch[] {
  chartSize(chart);
  return chart.flatMap((line, row) =>
    [...line].flatMap((cell, col) => (isFabric(cell) ? [] : [{ col, row, thread: cell }])),
  );
}

const byReadingOrder = (a: Stitch, b: Stitch) => a.row - b.row || a.col - b.col;

/**
 * Threads in the order they will be sewn: the ones listed in `threadOrder`
 * first, then any others in the order they first appear on the chart.
 */
function threadSequence(stitches: readonly Stitch[], threadOrder: readonly ThreadKey[]) {
  const appearing = [...new Set([...stitches].sort(byReadingOrder).map((s) => s.thread))];
  return [
    ...threadOrder.filter((thread) => appearing.includes(thread)),
    ...appearing.filter((thread) => !threadOrder.includes(thread)),
  ];
}

/**
 * Greedy nearest-neighbour walk: from the first stitch in reading order, always
 * move to the closest stitch not yet sewn. Ties keep reading order, so the
 * result is deterministic. O(n²), fine for the few hundred stitches of a motif.
 */
function needlePath(stitches: readonly Stitch[]): Stitch[] {
  const left = [...stitches].sort(byReadingOrder);
  const path: Stitch[] = [];
  let current = left.shift();
  while (current) {
    path.push(current);
    const from = current;
    let nearest = -1;
    let best = Infinity;
    left.forEach((stitch, index) => {
      const distance = (stitch.col - from.col) ** 2 + (stitch.row - from.row) ** 2;
      if (distance < best) {
        best = distance;
        nearest = index;
      }
    });
    current = nearest === -1 ? undefined : left.splice(nearest, 1)[0];
  }
  return path;
}

/** The same stitches, in the order the needle will work them. Never mutates its input. */
export function orderStitches(
  stitches: readonly Stitch[],
  order: StitchOrder,
  threadOrder: readonly ThreadKey[] = [],
): Stitch[] {
  if (order === 'rows') return [...stitches].sort(byReadingOrder);

  return threadSequence(stitches, threadOrder).flatMap((thread) => {
    const ofThread = stitches.filter((stitch) => stitch.thread === thread);
    return order === 'needle' ? needlePath(ofThread) : ofThread.sort(byReadingOrder);
  });
}

// Composition --------------------------------------------------------------------
// Composing works on charts, not on stitches, so a composed band is still a chart
// and can be composed again: repeat a flower, put it beside a bird, stack a border.

/** A chart of bare fabric. */
export function blank(cols: number, rows: number): Chart {
  return Array.from({ length: rows }, () => FABRIC.repeat(cols));
}

/** Pads a chart with fabric to the given size, keeping it centred (extra cell goes right/bottom). */
function centerIn(chart: Chart, cols: number, rows: number): Chart {
  const size = chartSize(chart);
  const left = Math.floor((cols - size.cols) / 2);
  const top = Math.floor((rows - size.rows) / 2);
  const right = cols - size.cols - left;
  return [
    ...blank(cols, top),
    ...chart.map((row) => FABRIC.repeat(left) + row + FABRIC.repeat(right)),
    ...blank(cols, rows - size.rows - top),
  ];
}

/** Charts side by side, vertically centred, with `gap` columns of fabric between them. */
export function beside(charts: readonly Chart[], gap = 0): Chart {
  if (charts.length === 0) return [];
  const sizes = charts.map(chartSize);
  const rows = Math.max(...sizes.map((size) => size.rows));
  const centred = charts.map((chart, i) => centerIn(chart, sizes[i].cols, rows));
  const spacer = FABRIC.repeat(gap);
  return Array.from({ length: rows }, (_, row) => centred.map((c) => c[row]).join(spacer));
}

/** Charts one above the other, horizontally centred, with `gap` rows of fabric between them. */
export function stack(charts: readonly Chart[], gap = 0): Chart {
  if (charts.length === 0) return [];
  const sizes = charts.map(chartSize);
  const cols = Math.max(...sizes.map((size) => size.cols));
  return charts.flatMap((chart, i) => [
    ...(i > 0 ? blank(cols, gap) : []),
    ...centerIn(chart, cols, sizes[i].rows),
  ]);
}

/** A chart repeated `times` side by side: the basic move for a band. */
export function repeat(chart: Chart, times: number, gap = 0): Chart {
  return beside(
    Array.from({ length: times }, () => chart),
    gap,
  );
}

/** The same chart sewn with other threads, e.g. a bugambilia flower turned cenote. */
export function recolor(chart: Chart, threads: Readonly<Record<ThreadKey, ThreadKey>>): Chart {
  return chart.map((row) => [...row].map((cell) => threads[cell] ?? cell).join(''));
}

/**
 * Text sewn with a stitch alphabet. In each glyph, `#` marks a stitch; it is
 * sewn with `thread` (or the thread given for that character in `threadFor`).
 * Throws on a character the alphabet does not have.
 */
export function textChart(
  text: string,
  glyphs: Readonly<Record<string, Chart>>,
  thread: ThreadKey,
  {
    gap = 1,
    threadFor = {},
  }: { gap?: number; threadFor?: Readonly<Record<string, ThreadKey>> } = {},
): Chart {
  const letters = [...text].map((char) => {
    const glyph = glyphs[char];
    if (!glyph) throw new Error(`No stitch glyph for "${char}".`);
    return recolor(glyph, { '#': threadFor[char] ?? thread });
  });
  return beside(letters, gap);
}
