import type { Localized } from '../i18n/i18n';

export interface Person {
  readonly firstName: string;
}

/**
 * Everything that differs between the public demo and the real wedding.
 * Generic UI texts live in src/i18n/*.json instead.
 *
 * Phase 2 (wedding website) will add sections such as events, travel,
 * stay and gifts next to these core fields.
 */
export interface WeddingContent {
  /** Shown in this order: "first & second". */
  readonly couple: readonly [Person, Person];
  /** Calendar date in the wedding's time zone, ISO 8601 (YYYY-MM-DD). */
  readonly date: `${number}-${number}-${number}`;
  /** IANA time zone of the venue. Mérida is UTC-6 all year (no DST). */
  readonly timeZone: 'America/Merida';
  readonly city: Localized<string>;
  readonly story: Story;
}

/** "Our story": where the thread starts, where it is tied, and the photos along the way. */
export interface Story {
  readonly from: Place;
  readonly to: Place;
  readonly photos: readonly Photo[];
}

export interface Place {
  /** Short name, e.g. "Mérida" ("Nos vemos en Mérida"). */
  readonly name: string;
  /** Smaller line under the name on the map, e.g. "Yucatán". */
  readonly region: string;
}

/**
 * A photo prepared by scripts/photos.mjs as `<file>-<width>.<avif|webp>` under /photos.
 * Width and height are the original's, so the browser reserves the right space
 * before the image arrives (no layout shift).
 */
export interface Photo {
  readonly file: string;
  readonly width: number;
  readonly height: number;
  /** What the photo shows, for screen readers. */
  readonly alt: Localized<string>;
  readonly title: Localized<string>;
  readonly place: Localized<string>;
}
