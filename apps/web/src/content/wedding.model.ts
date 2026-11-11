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
}
