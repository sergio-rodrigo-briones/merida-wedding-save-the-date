import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { LANGS } from '../i18n/i18n';
import { headLinks, pageUrl } from './share';
import { WEDDING } from './wedding.example';

// The sitemap is a static file, so this test keeps it in step with the app:
// change the demo's address or add a language, and it fails until the sitemap follows.
const xml = readFileSync(join(process.cwd(), 'public/sitemap.xml'), 'utf8');
const doc = new DOMParser().parseFromString(xml, 'application/xml');
const urls = [...doc.getElementsByTagName('url')];

describe('sitemap.xml', () => {
  it('is well-formed XML', () => {
    expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
  });

  it('lists exactly one entry per language page', () => {
    const locs = urls.map((url) => url.getElementsByTagName('loc')[0]?.textContent);
    expect(locs).toEqual(LANGS.map((lang) => pageUrl(WEDDING.share, lang)));
  });

  it.each(LANGS)('gives the %s page the same alternates as its <head>', (lang) => {
    const entry = urls.find(
      (url) => url.getElementsByTagName('loc')[0]?.textContent === pageUrl(WEDDING.share, lang),
    );
    const alternates = [...(entry?.getElementsByTagName('xhtml:link') ?? [])].map((link) => ({
      rel: link.getAttribute('rel'),
      hreflang: link.getAttribute('hreflang'),
      href: link.getAttribute('href'),
    }));
    const expected = headLinks(WEDDING.share, lang).filter((link) => link.rel === 'alternate');

    expect(alternates).toEqual(expected);
  });
});
