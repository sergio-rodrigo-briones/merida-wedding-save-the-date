import { homePath, langFromUrl } from './language';

describe('langFromUrl', () => {
  it.each([
    ['/', 'es'],
    ['', 'es'],
    ['/en', 'en'],
    ['/en/', 'en'],
    ['/en/stay', 'en'],
    ['/en?utm_source=whatsapp', 'en'],
    ['/en#date', 'en'],
    ['/es', 'es'],
    ['/english', 'es'],
    ['/programa', 'es'],
  ])('%s → %s', (url, lang) => {
    expect(langFromUrl(url)).toBe(lang);
  });
});

describe('homePath', () => {
  it('serves the default language from the root', () => {
    expect(homePath('es')).toBe('/');
  });

  it('prefixes every other language', () => {
    expect(homePath('en')).toBe('/en');
  });
});
