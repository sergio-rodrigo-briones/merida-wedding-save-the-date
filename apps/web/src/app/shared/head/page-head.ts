import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import type { HeadLink, MetaTag } from '../../../content/share';

/**
 * Writes the page's <title>, <meta> tags and <link>s. Runs during prerendering
 * too, so the tags are in the static HTML that link previews read.
 */
@Injectable({ providedIn: 'root' })
export class PageHead {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  set(page: { title: string; tags: readonly MetaTag[]; links: readonly HeadLink[] }): void {
    this.title.setTitle(page.title);
    for (const tag of page.tags) {
      // updateTag adds the tag or replaces the one with the same name/property.
      this.meta.updateTag({ ...tag });
    }
    for (const link of page.links) this.setLink(link);
  }

  private setLink({ rel, href, hreflang }: HeadLink): void {
    const selector = hreflang
      ? `link[rel="${rel}"][hreflang="${hreflang}"]`
      : `link[rel="${rel}"]:not([hreflang])`;
    let element = this.document.head.querySelector<HTMLLinkElement>(selector);
    if (!element) {
      element = this.document.createElement('link');
      element.rel = rel;
      if (hreflang) element.hreflang = hreflang;
      this.document.head.appendChild(element);
    }
    element.href = href;
  }
}
