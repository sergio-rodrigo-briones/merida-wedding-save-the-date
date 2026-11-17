import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { WEDDING } from '../../../../content/wedding.example';
import { Story } from './story';

async function render() {
  vi.stubGlobal('matchMedia', () => ({ matches: true })); // reduced motion: no scroll effects
  TestBed.configureTestingModule({ imports: [Story], providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(Story);
  fixture.componentRef.setInput('story', WEDDING.story);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('Story', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('shows every photo in order, described for screen readers', async () => {
    const element = await render();
    const images = [...element.querySelectorAll('img')];

    expect(images).toHaveLength(WEDDING.story.photos.length);
    expect(images.map((img) => img.alt)).toEqual(WEDDING.story.photos.map((p) => p.alt.es));
  });

  it('offers AVIF first, then WebP, and reserves the space before loading', async () => {
    const element = await render();
    const picture = element.querySelector('picture');
    const types = [...(picture?.querySelectorAll('source') ?? [])].map((s) => s.type);
    const img = picture?.querySelector('img');

    expect(types).toEqual(['image/avif', 'image/webp']);
    expect(img?.getAttribute('width')).toBe('1200');
    expect(img?.getAttribute('height')).toBe('1800');
    expect(img?.getAttribute('loading')).toBe('lazy');
  });

  it('names both ends of the thread and closes with the destination', async () => {
    const element = await render();

    expect(element.querySelector('.route svg')?.getAttribute('aria-label')).toBe(
      'Un hilo que va de Barcelona a Mérida',
    );
    expect(element.querySelector('#closing-title')?.textContent).toBe('Nos vemos en Mérida');
  });
});
