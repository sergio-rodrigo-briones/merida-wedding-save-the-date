import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { gsap } from 'gsap';
import { headLinks, shareTags } from '../../../content/share';
import { WEDDING } from '../../../content/wedding.example';
import { format, LOCALES } from '../../../i18n/i18n';
import { Language } from '../../../i18n/language';
import { PageHead } from '../../shared/head/page-head';
import { longDate } from '../../shared/time/time';
import { Envelope } from '../envelope/envelope';
import { InvitationCard } from './card/invitation-card';
import { Story } from './story/story';

/**
 * closed → opening (envelope timeline) → stitching (card timeline) → done.
 * "Skip" jumps to done from any step; "watch again" goes back to closed.
 */
export type Stage = 'closed' | 'opening' | 'stitching' | 'done';

function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

@Component({
  selector: 'app-save-the-date',
  imports: [Envelope, InvitationCard, Story],
  templateUrl: './save-the-date.html',
  styleUrl: './save-the-date.scss',
})
export class SaveTheDate {
  protected readonly language = inject(Language);
  protected readonly t = this.language.t;
  protected readonly wedding = WEDDING;
  protected readonly names = WEDDING.couple.map((person) => person.firstName).join(' & ');
  protected readonly city = computed(() => WEDDING.city[this.language.current()]);
  protected readonly envelopeLabel = computed(() =>
    format(this.t().envelope.open, { names: this.names }),
  );

  readonly stage = signal<Stage>('closed');
  /** The envelope stays in the DOM until it has faded out... */
  protected readonly introShown = signal(true);
  /** ...while the card is already there, hidden, so the two can cross-fade. */
  protected readonly cardShown = signal(false);

  private readonly intro = viewChild<ElementRef<HTMLElement>>('intro');
  private readonly envelope = viewChild(Envelope);
  private readonly card = viewChild(InvitationCard);
  private readonly injector = inject(Injector);
  private timeline?: gsap.core.Timeline;

  constructor() {
    const head = inject(PageHead);
    effect(() => {
      const lang = this.language.current();
      const title = `${this.names} · ${this.t().saveTheDate.headline}`;
      const description = format(this.t().share.description, {
        names: this.names,
        date: longDate(WEDDING.date, LOCALES[lang], { midSentence: true }),
        city: this.city(),
      });
      head.set({
        title,
        tags: shareTags(WEDDING.share, { lang, title, description }),
        links: headLinks(WEDDING.share, lang),
      });
    });
    inject(DestroyRef).onDestroy(() => this.timeline?.kill());
  }

  protected open(): void {
    if (this.stage() !== 'closed') return;
    // The card is rendered now (hidden) so its stitches exist when the timeline is built.
    this.stage.set('opening');
    afterNextRender(() => (prefersReducedMotion() ? this.done() : this.play()), {
      injector: this.injector,
    });
  }

  /**
   * One master timeline, so "skip" is just "jump to the end":
   * the intro texts fade as the envelope opens; the envelope lifts away and the
   * card rises in right behind it (no empty frame, barely any overlap); the card is sewn.
   */
  private play(): void {
    const envelope = this.envelope();
    const intro = this.intro()?.nativeElement;
    const card = this.card();
    if (!envelope || !intro || !card) return;

    this.timeline = gsap
      .timeline({ onComplete: () => this.done() })
      .to(intro.querySelectorAll('.eyebrow, .hint'), { autoAlpha: 0, duration: 0.3 }, 0)
      .add(envelope.open(), 0)
      .to(intro, { autoAlpha: 0, y: -28, duration: 0.4, ease: 'power2.in' }, 1.4)
      .call(() => this.cardShown.set(true), [], 1.65)
      .call(() => this.introShown.set(false), [], 1.85)
      .call(() => this.stage.set('stitching'), [], 1.9)
      .add(card.sew(), 1.9);
  }

  protected toStory(): void {
    document.getElementById('story')?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });
  }

  protected skip(): void {
    this.timeline?.progress(1).kill();
    this.done();
  }

  protected replay(): void {
    this.timeline?.kill();
    this.stage.set('closed');
    this.cardShown.set(false);
    this.introShown.set(true);
    afterNextRender(() => this.envelope()?.focus(), { injector: this.injector });
  }

  /** The finished card, whatever happened before (played, skipped or reduced motion). */
  private done(): void {
    this.introShown.set(false);
    this.cardShown.set(true);
    this.stage.set('done');
    afterNextRender(
      () => {
        this.card()?.finish();
        this.card()?.focusHeading();
      },
      { injector: this.injector },
    );
  }
}
