import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  viewChild,
  viewChildren,
} from '@angular/core';
import { gsap } from 'gsap';
import { format, LOCALES } from '../../../../i18n/i18n';
import { Language } from '../../../../i18n/language';
import { googleCalendarUrl, icsCalendar } from '../../../shared/calendar/calendar';
import { Countdown } from '../../../shared/countdown/countdown';
import { textChart } from '../../../shared/embroidery/embroidery';
import { EmbroideryView } from '../../../shared/embroidery/embroidery-view';
import { DIGITS, diamondBand, FLOWER } from '../../../shared/embroidery/motifs';
import { longDate, stitchedDate, zonedMidnightUtc } from '../../../shared/time/time';

/** Seconds to sew the whole card; each piece gets a share proportional to its stitches. */
const SEWING_SECONDS = 6;

/**
 * The card inside the envelope: everything a guest needs at a glance (who,
 * when, where, and a way to keep the date), framed by embroidery.
 */
@Component({
  selector: 'app-invitation-card',
  imports: [Countdown, EmbroideryView],
  templateUrl: './invitation-card.html',
  styleUrl: './invitation-card.scss',
})
export class InvitationCard {
  readonly names = input.required<string>();
  /** ISO date of the wedding in the venue's time zone. */
  readonly date = input.required<string>();
  readonly timeZone = input.required<string>();
  readonly city = input.required<string>();

  private readonly language = inject(Language);
  protected readonly t = this.language.t;

  protected readonly band = diamondBand(42);
  protected readonly flower = FLOWER;
  protected readonly dateChart = computed(() =>
    textChart(stitchedDate(this.date()), DIGITS, 'C', { threadFor: { '·': 'B' } }),
  );
  protected readonly dateLong = computed(() =>
    longDate(this.date(), LOCALES[this.language.current()]),
  );
  protected readonly start = computed(() => zonedMidnightUtc(this.date(), this.timeZone()));

  private readonly event = computed(() => ({
    title: format(this.t().calendar.eventTitle, { names: this.names() }),
    date: this.date(),
    location: this.city(),
    timeZone: this.timeZone(),
  }));
  protected readonly googleUrl = computed(() => googleCalendarUrl(this.event()));

  private readonly pieces = viewChildren(EmbroideryView);
  private readonly heading = viewChild.required<ElementRef<HTMLElement>>('heading');

  /** Sews every embroidered piece, top to bottom, as one timeline. */
  sew(): gsap.core.Timeline {
    const pieces = this.pieces();
    const legs = pieces.reduce((sum, piece) => sum + piece.legCount(), 0);
    pieces.forEach((piece) => piece.unpick());
    const timeline = gsap.timeline();
    for (const piece of pieces) {
      timeline.add(piece.sew((SEWING_SECONDS * piece.legCount()) / legs));
    }
    return timeline;
  }

  /** Every stitch in place at once. */
  finish(): void {
    this.pieces().forEach((piece) => piece.finish());
  }

  /** Moves focus to the names, so screen readers start reading the card. */
  focusHeading(): void {
    this.heading().nativeElement.focus({ preventScroll: true });
  }

  protected downloadIcs(): void {
    const file = new Blob([icsCalendar(this.event(), new Date())], { type: 'text/calendar' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = 'save-the-date.ics';
    link.click();
    // Revoking right away cancels the download in some browsers.
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }
}
