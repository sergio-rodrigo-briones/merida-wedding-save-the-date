import type { Photo, WeddingContent } from './wedding.model';

/** Generated placeholders (scripts/photos.mjs demo): no real people in the public repo. */
const sample = (n: number, landscape = false): Photo => ({
  file: `demo-0${n}`,
  width: landscape ? 1800 : 1200,
  height: landscape ? 1200 : 1800,
  alt: {
    es: `Foto de ejemplo ${n}: una flor bordada en punto de cruz sobre una pared de color pastel.`,
    en: `Sample photo ${n}: a cross-stitch flower on a pastel wall.`,
  },
  title: { es: `Foto de ejemplo ${n}`, en: `Sample photo ${n}` },
  place: { es: 'Barcelona', en: 'Barcelona' },
});

/**
 * Public demo content: a fictional couple and date.
 *
 * The real build (`npm run build:real`) swaps this file for the git-ignored
 * wedding.local.ts through `fileReplacements` in angular.json, so the app
 * always imports this path and never knows which data it got.
 */
export const WEDDING: WeddingContent = {
  couple: [{ firstName: 'Itzel' }, { firstName: 'Jordi' }],
  date: '2028-03-18',
  timeZone: 'America/Merida',
  city: {
    es: 'Mérida, Yucatán',
    en: 'Mérida, Yucatán, Mexico',
  },
  story: {
    from: { name: 'Barcelona', region: 'Catalunya' },
    to: { name: 'Mérida', region: 'Yucatán' },
    photos: [sample(1), sample(2), sample(3), sample(4), sample(5, true)],
  },
  share: {
    siteUrl: 'https://sergio-rodrigo-briones.github.io/merida-wedding-save-the-date/',
    image: 'share/og-demo.jpg',
    indexable: true,
  },
};
