import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SaveTheDate } from './save-the-date';

async function render({ reducedMotion = false } = {}) {
  vi.stubGlobal('matchMedia', () => ({ matches: reducedMotion }));
  TestBed.configureTestingModule({ imports: [SaveTheDate], providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(SaveTheDate);
  await fixture.whenStable();
  const element = fixture.nativeElement as HTMLElement;
  const click = async (selector: string) => {
    element.querySelector<HTMLElement>(selector)?.click();
    await fixture.whenStable();
  };
  const button = (text: string) =>
    [...element.querySelectorAll('button')].find((b) => b.textContent?.trim() === text);
  return { fixture, element, click, button, stage: () => fixture.componentInstance.stage() };
}

describe('SaveTheDate', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('starts with the closed envelope, named for screen readers', async () => {
    const { element, stage } = await render();

    expect(stage()).toBe('closed');
    expect(element.querySelector('.envelope')?.getAttribute('aria-label')).toBe(
      'Abrir el sobre de Itzel & Jordi',
    );
    expect(element.querySelector('app-invitation-card')).toBeNull();
  });

  it('opens with an animation that can be skipped straight to the card', async () => {
    const page = await render();

    await page.click('.envelope');
    expect(page.stage()).toBe('opening');

    page.button('Saltar animación')?.click();
    await page.fixture.whenStable();

    expect(page.stage()).toBe('done');
    expect(page.element.querySelector('app-envelope')).toBeNull();
    expect(page.element.querySelector('#card-names')?.textContent).toBe('Itzel & Jordi');
  });

  it('shows the finished card at once when the guest prefers reduced motion', async () => {
    const page = await render({ reducedMotion: true });

    await page.click('.envelope');

    expect(page.stage()).toBe('done');
    expect(page.element.textContent).toContain('Sábado, 18 de marzo de 2028');
    expect(page.button('Ver de nuevo')).toBeDefined();
  });

  it('closes the envelope again to watch it once more', async () => {
    const page = await render({ reducedMotion: true });
    await page.click('.envelope');

    page.button('Ver de nuevo')?.click();
    await page.fixture.whenStable();

    expect(page.stage()).toBe('closed');
    expect(page.element.querySelector('.envelope')).not.toBeNull();
  });
});
