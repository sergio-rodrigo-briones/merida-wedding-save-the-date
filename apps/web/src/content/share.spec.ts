import { headLinks, pageUrl, shareTags } from './share';
import type { Share } from './wedding.model';

const share: Share = {
  siteUrl: 'https://example.org/save-the-date/',
  image: 'share/og.jpg',
  indexable: true,
};
const tag = (tags: ReturnType<typeof shareTags>, key: string) =>
  tags.find((t) => ('property' in t ? t.property : t.name) === key)?.content;

describe('pageUrl', () => {
  it('serves Spanish from the site root and English under en/', () => {
    expect(pageUrl(share, 'es')).toBe('https://example.org/save-the-date/');
    expect(pageUrl(share, 'en')).toBe('https://example.org/save-the-date/en/');
  });
});

describe('shareTags', () => {
  const tags = shareTags(share, { lang: 'en', title: 'Itzel & Jordi', description: 'Save it' });

  it('gives previews an absolute image URL, which WhatsApp requires', () => {
    expect(tag(tags, 'og:image')).toBe('https://example.org/save-the-date/share/og.jpg');
    expect(tag(tags, 'og:image:width')).toBe('1200');
    expect(tag(tags, 'og:image:height')).toBe('630');
  });

  it("points at the page's own language", () => {
    expect(tag(tags, 'og:url')).toBe('https://example.org/save-the-date/en/');
    expect(tag(tags, 'og:locale')).toBe('en_US');
  });

  it('carries the title and description for previews and search', () => {
    expect(tag(tags, 'og:title')).toBe('Itzel & Jordi');
    expect(tag(tags, 'og:description')).toBe('Save it');
    expect(tag(tags, 'description')).toBe('Save it');
    expect(tag(tags, 'twitter:card')).toBe('summary_large_image');
  });
});

describe('headLinks', () => {
  it('declares the canonical page and every language, with Spanish as the default', () => {
    expect(headLinks(share, 'en')).toEqual([
      { rel: 'canonical', href: 'https://example.org/save-the-date/en/' },
      { rel: 'alternate', hreflang: 'es', href: 'https://example.org/save-the-date/' },
      { rel: 'alternate', hreflang: 'en', href: 'https://example.org/save-the-date/en/' },
      { rel: 'alternate', hreflang: 'x-default', href: 'https://example.org/save-the-date/' },
    ]);
  });
});

describe('robots', () => {
  const page = { lang: 'es' as const, title: 't', description: 'd' };

  it('lets search engines list an indexable site', () => {
    expect(tag(shareTags(share, page), 'robots')).toBe('index, follow');
  });

  it('keeps a private site out of search results', () => {
    expect(tag(shareTags({ ...share, indexable: false }, page), 'robots')).toBe(
      'noindex, nofollow',
    );
  });
});
