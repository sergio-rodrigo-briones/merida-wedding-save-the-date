import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { DEFAULT_LANG, LANGS, type Lang, MESSAGES } from './i18n';

/**
 * Language from a URL: the default language lives at the root ("/"), every
 * other language under its own prefix ("/en", "/en/stay"…).
 */
export function langFromUrl(url: string): Lang {
  const firstSegment = url.split(/[/?#]/).find((segment) => segment !== '');
  return LANGS.find((lang) => lang !== DEFAULT_LANG && lang === firstSegment) ?? DEFAULT_LANG;
}

/** Home page of a language: "/" for the default one, "/en" for English. */
export function homePath(lang: Lang): string {
  return lang === DEFAULT_LANG ? '/' : `/${lang}`;
}

/**
 * Current language, derived from the URL so that every prerendered page
 * (and every link shared on WhatsApp) has exactly one language.
 */
@Injectable({ providedIn: 'root' })
export class Language {
  private readonly router = inject(Router);

  readonly current = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => langFromUrl(event.urlAfterRedirects)),
    ),
    { initialValue: langFromUrl(this.router.url) },
  );

  /** UI texts in the current language. */
  readonly t = computed(() => MESSAGES[this.current()]);

  /** The language the switcher offers. */
  readonly other = computed<Lang>(() => (this.current() === 'es' ? 'en' : 'es'));

  constructor() {
    // Keeps <html lang> right for screen readers, hyphenation and search engines.
    const document = inject(DOCUMENT);
    effect(() => {
      document.documentElement.lang = this.current();
    });
  }
}
