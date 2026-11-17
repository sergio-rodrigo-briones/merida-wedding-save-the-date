import { DEFAULT_LANG, LANGS, type Lang, LOCALES } from '../i18n/i18n';
import type { Share } from './wedding.model';

/** Size the preview image is generated at (scripts/photos.mjs), as Open Graph recommends. */
export const SHARE_IMAGE = { width: 1200, height: 630 } as const;

/** One <meta>: Open Graph uses `property`, everything else `name`. */
export type MetaTag =
  | { readonly property: string; readonly content: string }
  | { readonly name: string; readonly content: string };

/** One <link> in <head>, e.g. the canonical URL or a language alternate. */
export interface HeadLink {
  readonly rel: 'canonical' | 'alternate';
  readonly href: string;
  readonly hreflang?: string;
}

/** Absolute address of a language's page: the site root for Spanish, "<site>/en/" for English. */
export function pageUrl(share: Share, lang: Lang): string {
  return lang === DEFAULT_LANG ? share.siteUrl : new URL(`${lang}/`, share.siteUrl).href;
}

/**
 * Tags a link preview needs. WhatsApp reads only the HTML it downloads (no JavaScript),
 * which is why the pages are prerendered with these tags already in place.
 */
export function shareTags(
  share: Share,
  page: { readonly lang: Lang; readonly title: string; readonly description: string },
): MetaTag[] {
  return [
    { name: 'description', content: page.description },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: page.title },
    { property: 'og:description', content: page.description },
    { property: 'og:url', content: pageUrl(share, page.lang) },
    { property: 'og:locale', content: LOCALES[page.lang].replace('-', '_') },
    { property: 'og:image', content: new URL(share.image, share.siteUrl).href },
    { property: 'og:image:width', content: String(SHARE_IMAGE.width) },
    { property: 'og:image:height', content: String(SHARE_IMAGE.height) },
    { property: 'og:image:alt', content: page.title },
    { name: 'twitter:card', content: 'summary_large_image' },
  ];
}

/** Canonical URL plus one alternate per language, so search engines pair "/" and "/en/". */
export function headLinks(share: Share, lang: Lang): HeadLink[] {
  return [
    { rel: 'canonical', href: pageUrl(share, lang) },
    ...LANGS.map((other) => ({
      rel: 'alternate' as const,
      hreflang: other,
      href: pageUrl(share, other),
    })),
    { rel: 'alternate', hreflang: 'x-default', href: pageUrl(share, DEFAULT_LANG) },
  ];
}
