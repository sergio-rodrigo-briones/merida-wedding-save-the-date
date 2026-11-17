import { TestBed } from '@angular/core/testing';
import { parseChart } from './embroidery';
import type { Chart } from './embroidery.model';
import { EmbroideryView } from './embroidery-view';
import { SEAL } from './motifs';

async function render(chart: Chart, guide = false) {
  const fixture = TestBed.createComponent(EmbroideryView);
  fixture.componentRef.setInput('chart', chart);
  fixture.componentRef.setInput('guide', guide);
  await fixture.whenStable();
  const element = fixture.nativeElement as HTMLElement;
  return { component: fixture.componentInstance, element };
}

describe('EmbroideryView', () => {
  const stitches = parseChart(SEAL).length;

  it('sizes the drawing to the chart, 10 units per cell', async () => {
    const { element } = await render(SEAL);
    expect(element.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 50 50');
  });

  it('draws two legs per stitch, each a thread line and a sheen line', async () => {
    const { component, element } = await render(SEAL);
    expect(component.legCount()).toBe(stitches * 2);
    expect(element.querySelectorAll('line.body')).toHaveLength(stitches * 2);
    expect(element.querySelectorAll('line.sheen')).toHaveLength(stitches * 2);
  });

  it('prints the guide pattern only when asked', async () => {
    expect((await render(SEAL)).element.querySelectorAll('.guide rect')).toHaveLength(0);
    expect((await render(SEAL, true)).element.querySelectorAll('.guide rect')).toHaveLength(
      stitches,
    );
  });

  it('is decorative for assistive technology', async () => {
    const { element } = await render(SEAL);
    expect(element.getAttribute('aria-hidden')).toBe('true');
  });

  it('sews the whole chart in about the requested time', async () => {
    const { component } = await render(SEAL);
    const timeline = component.sew(2);
    // The last leg starts just before 2 s and takes at most 0.14 s.
    expect(timeline.duration()).toBeGreaterThan(1.8);
    expect(timeline.duration()).toBeLessThanOrEqual(2.14);
    timeline.kill();
  });
});
