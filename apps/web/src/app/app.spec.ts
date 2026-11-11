import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  async function renderAt(url: string) {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    });
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl(url);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    return {
      element,
      text: (selector: string) => element.querySelector(selector)?.textContent?.trim(),
      switcher: element.querySelector<HTMLAnchorElement>('nav.language a'),
      htmlLang: TestBed.inject(DOCUMENT).documentElement.lang,
      title: TestBed.inject(Title).getTitle(),
    };
  }

  it('renders Spanish at the root', async () => {
    const page = await renderAt('/');

    expect(page.text('h1')).toBe('Save the date');
    expect(page.element.textContent).toContain('Itzel & Jordi');
    expect(page.element.textContent).toContain('Mérida, Yucatán');
    expect(page.htmlLang).toBe('es');
    expect(page.title).toBe('Itzel & Jordi · Save the date');
  });

  it('offers English from the Spanish page', async () => {
    const { switcher } = await renderAt('/');

    expect(switcher?.textContent?.trim()).toBe('English');
    expect(switcher?.getAttribute('href')).toBe('/en');
    expect(switcher?.getAttribute('lang')).toBe('en');
  });

  it('renders English under /en', async () => {
    const page = await renderAt('/en');

    expect(page.element.textContent).toContain('Mérida, Yucatán, Mexico');
    expect(page.htmlLang).toBe('en');
    expect(page.switcher?.textContent?.trim()).toBe('Español');
    expect(page.switcher?.getAttribute('href')).toBe('/');
  });

  it('redirects unknown paths to the Spanish home', async () => {
    await renderAt('/does-not-exist');

    expect(TestBed.inject(Router).url).toBe('/');
  });
});
