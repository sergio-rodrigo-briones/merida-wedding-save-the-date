/**
 * A cross-stitch chart, read like the ones in an embroidery book: one string
 * per row, one character per cell. A letter names the thread for that cell;
 * `.` (or a space) is bare fabric.
 *
 * ```ts
 * const SEAL: Chart = [
 *   '.B.B.',
 *   'BBMBB',
 *   '.BMB.',
 * ];
 * ```
 */
export type Chart = readonly string[];

/** One character of a chart that is not fabric, e.g. `'B'` for bugambilia. */
export type ThreadKey = string;

/** One cross (two diagonal legs) on the fabric grid. */
export interface Stitch {
  /** Column, 0 at the left. */
  readonly col: number;
  /** Row, 0 at the top. */
  readonly row: number;
  readonly thread: ThreadKey;
}

/**
 * The order in which a needle works the stitches.
 *
 * - `rows`: top to bottom, left to right, like reading.
 * - `color`: one thread at a time (rows within each), the way an embroiderer
 *   finishes a colour before rethreading the needle.
 * - `needle`: one thread at a time, always moving to the nearest stitch left,
 *   so the animation follows a natural path instead of a scanline.
 */
export type StitchOrder = 'rows' | 'color' | 'needle';

/** Width and height of a chart in cells. */
export interface ChartSize {
  readonly cols: number;
  readonly rows: number;
}
