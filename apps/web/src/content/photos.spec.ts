import { LANGS } from '../i18n/i18n';
import { photoUrl, srcset } from './photos';
import { WEDDING } from './wedding.example';
import type { Photo } from './wedding.model';

const photo: Photo = {
  file: 'demo-01',
  width: 1200,
  height: 1800,
  alt: { es: 'a', en: 'a' },
  title: { es: 't', en: 't' },
  place: { es: 'p', en: 'p' },
};

describe('photo URLs', () => {
  it('points at one prepared file, relative to the base href', () => {
    expect(photoUrl(photo, 800, 'avif')).toBe('photos/demo-01-800.avif');
  });

  it('lists every width the script writes, for the browser to choose', () => {
    expect(srcset(photo, 'webp')).toBe(
      'photos/demo-01-480.webp 480w, photos/demo-01-800.webp 800w, photos/demo-01-1200.webp 1200w',
    );
  });
});

describe('demo story content', () => {
  const { photos } = WEDDING.story;

  it('has photos with real dimensions', () => {
    expect(photos.length).toBeGreaterThan(0);
    for (const p of photos) expect(p.width * p.height).toBeGreaterThan(0);
  });

  it.each(LANGS)('describes every photo in %s', (lang) => {
    for (const p of photos) {
      expect(p.alt[lang].trim().length).toBeGreaterThan(10);
      expect(p.title[lang].trim()).not.toBe('');
    }
  });
});
