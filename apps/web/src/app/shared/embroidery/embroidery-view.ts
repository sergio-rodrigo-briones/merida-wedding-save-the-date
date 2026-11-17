import { Component, computed, ElementRef, inject, input } from '@angular/core';
import { gsap } from 'gsap';
import { chartSize, orderStitches, parseChart } from './embroidery';
import type { Chart, StitchOrder } from './embroidery.model';
import { THREAD_ORDER, THREADS } from './motifs';

/** Size of one cell in SVG units. Everything else scales with the viewBox. */
const CELL = 10;
/** How far each leg stays from the cell corners, so neighbouring crosses don't touch. */
const INSET = CELL * 0.14;

interface Leg {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}

interface Cross {
  readonly color: string;
  /** The two diagonals, in the order they are sewn: bottom-left → top-right, then top-left → bottom-right. */
  readonly legs: readonly [Leg, Leg];
}

/**
 * Draws a chart as SVG cross-stitches and knows how to sew itself.
 *
 * The SVG is rendered complete, so without JavaScript (or with reduced motion)
 * the embroidery is simply there. `sew()` returns a GSAP timeline that unpicks
 * the stitches and sews them back in order; the page composes those timelines.
 */
@Component({
  selector: 'app-embroidery',
  templateUrl: './embroidery-view.html',
  styleUrl: './embroidery-view.scss',
  host: { 'aria-hidden': 'true' },
})
export class EmbroideryView {
  readonly chart = input.required<Chart>();
  readonly order = input<StitchOrder>('color');
  /** Faint printed pattern under the stitches, like a stamped embroidery kit. */
  readonly guide = input(false);

  private readonly host: HTMLElement = inject(ElementRef).nativeElement;

  protected readonly viewBox = computed(() => {
    const { cols, rows } = chartSize(this.chart());
    return `0 0 ${cols * CELL} ${rows * CELL}`;
  });

  protected readonly cells = computed(() =>
    parseChart(this.chart()).map(({ col, row, thread }) => ({
      x: col * CELL + 2,
      y: row * CELL + 2,
      color: THREADS[thread],
    })),
  );

  protected readonly crosses = computed<Cross[]>(() =>
    orderStitches(parseChart(this.chart()), this.order(), THREAD_ORDER).map(
      ({ col, row, thread }) => {
        const left = col * CELL + INSET;
        const top = row * CELL + INSET;
        const right = (col + 1) * CELL - INSET;
        const bottom = (row + 1) * CELL - INSET;
        return {
          color: THREADS[thread],
          legs: [
            { x1: left, y1: bottom, x2: right, y2: top },
            { x1: left, y1: top, x2: right, y2: bottom },
          ],
        };
      },
    ),
  );

  /** Number of legs, i.e. needle passes: two per cross. */
  readonly legCount = computed(() => this.crosses().length * 2);

  /**
   * A timeline that sews every stitch in order in about `duration` seconds.
   * Each leg is a body line and a sheen line drawn together.
   */
  sew(duration: number): gsap.core.Timeline {
    const lines = this.lines();
    const legStep = duration / Math.max(1, this.legCount());
    return gsap.timeline().fromTo(
      lines,
      { strokeDashoffset: 1 },
      {
        strokeDashoffset: 0,
        duration: Math.min(0.14, legStep * 4),
        ease: 'power1.out',
        // Lines come in pairs (body + sheen): both halves of a leg start together.
        stagger: (index) => Math.floor(index / 2) * legStep,
      },
    );
  }

  /** Hides every stitch, ready to be sewn. */
  unpick(): void {
    gsap.set(this.lines(), { strokeDashoffset: 1 });
  }

  /** Shows every stitch at once, e.g. after "skip animation". */
  finish(): void {
    gsap.set(this.lines(), { strokeDashoffset: 0 });
  }

  private lines(): SVGLineElement[] {
    return Array.from(this.host.querySelectorAll<SVGLineElement>('line'));
  }
}
