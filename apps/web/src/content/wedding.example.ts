import type { WeddingContent } from './wedding.model';

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
};
