import { TestBed } from '@angular/core/testing';
import { Envelope } from './envelope';

async function render() {
  const fixture = TestBed.createComponent(Envelope);
  fixture.componentRef.setInput('names', 'Itzel & Jordi');
  fixture.componentRef.setInput('place', 'Mérida, Yucatán');
  fixture.componentRef.setInput('label', 'Abrir el sobre de Itzel & Jordi');
  await fixture.whenStable();
  return { fixture, element: fixture.nativeElement as HTMLElement };
}

describe('Envelope', () => {
  it('is one button, named for screen readers', async () => {
    const { element } = await render();
    const buttons = element.querySelectorAll('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0].getAttribute('aria-label')).toBe('Abrir el sobre de Itzel & Jordi');
  });

  it('reports the tap and leaves the animation to the page', async () => {
    const { fixture, element } = await render();
    let opened = 0;
    fixture.componentInstance.opened.subscribe(() => opened++);
    element.querySelector('button')?.click();
    expect(opened).toBe(1);
  });

  it('unpicks the seal, not the band on the letter, when it opens', async () => {
    const { fixture, element } = await render();
    fixture.componentInstance.open().progress(1);

    expect(element.querySelector<HTMLElement>('.seal')?.style.opacity).toBe('0');
    expect(element.querySelector<HTMLElement>('.letter app-embroidery')?.style.opacity).toBe('');
  });
});
