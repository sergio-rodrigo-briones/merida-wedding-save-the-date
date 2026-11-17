import en from './en.json';
import es from './es.json';

export const LANGS = ['es', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'es';

/** Shape of the UI texts. Spanish is the source of truth. */
export type Messages = typeof es;

/**
 * UI texts per language. The annotation makes the build fail if en.json is
 * missing a key from es.json. Extra keys in en.json are caught by i18n.spec.ts.
 */
export const MESSAGES: Readonly<Record<Lang, Messages>> = { es, en };

/** A value that must exist in every language, e.g. `{ es: 'Mérida', en: 'Mérida' }`. */
export type Localized<T> = Readonly<Record<Lang, T>>;

/** Locale for dates and numbers in each language. */
export const LOCALES: Readonly<Record<Lang, string>> = { es: 'es-MX', en: 'en-US' };

/**
 * Fills `{placeholders}` in a text: format('Boda de {names}', { names: 'Itzel & Jordi' }).
 * Throws on a missing value, so a renamed placeholder fails in the tests.
 */
export function format(text: string, values: Readonly<Record<string, string>>): string {
  return text.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = values[key];
    if (value === undefined) throw new Error(`Missing value for {${key}} in "${text}".`);
    return value;
  });
}
