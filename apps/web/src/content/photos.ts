import type { Photo } from './wedding.model';

/** Widths written by scripts/photos.mjs. Keep both lists in sync. */
export const PHOTO_WIDTHS = [480, 800, 1200] as const;

export type PhotoFormat = 'avif' | 'webp';

/** URL of one prepared file, relative so it works under any base href (GitHub Pages). */
export function photoUrl(photo: Photo, width: number, format: PhotoFormat): string {
  return `photos/${photo.file}-${width}.${format}`;
}

/** "photos/x-480.avif 480w, photos/x-800.avif 800w, …" for a <source> or <img>. */
export function srcset(photo: Photo, format: PhotoFormat): string {
  return PHOTO_WIDTHS.map((width) => `${photoUrl(photo, width, format)} ${width}w`).join(', ');
}
