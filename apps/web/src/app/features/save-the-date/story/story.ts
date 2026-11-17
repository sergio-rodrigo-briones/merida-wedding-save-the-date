import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { photoUrl, srcset } from '../../../../content/photos';
import type { Photo, Story as StoryContent } from '../../../../content/wedding.model';
import { format } from '../../../../i18n/i18n';
import { Language } from '../../../../i18n/language';
import type { Chart } from '../../../shared/embroidery/embroidery.model';
import { EmbroideryView } from '../../../shared/embroidery/embroidery-view';
import { diamondBand } from '../../../shared/embroidery/motifs';

/** One thread per photo for the cross sewn at each corner. */
const CORNER_THREADS = ['B', 'C', 'H', 'F', 'M'];

function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Below the card: the photos sewn onto cotton and joined by one running thread,
 * the thread's route from one city to the other, and the closing hem.
 *
 * Everything renders finished. With motion allowed, scroll drives three effects:
 * a gentle parallax inside each frame, the route being sewn with a needle on it
 * (MotionPath), and the hem sewn the first time it comes into view.
 */
@Component({
  selector: 'app-story',
  imports: [EmbroideryView],
  templateUrl: './story.html',
  styleUrl: './story.scss',
})
export class Story {
  readonly story = input.required<StoryContent>();

  private readonly language = inject(Language);
  protected readonly t = this.language.t;
  protected readonly lang = this.language.current;

  protected readonly places = computed(() => ({
    from: this.story().from.name,
    to: this.story().to.name,
  }));
  protected readonly subtitle = computed(() => format(this.t().story.subtitle, this.places()));
  protected readonly routeLabel = computed(() => format(this.t().story.route, this.places()));
  protected readonly closing = computed(() => format(this.t().story.closing, this.places()));

  protected readonly hem = diamondBand(42);
  protected readonly corners = ['tl', 'tr', 'bl', 'br'] as const;
  protected readonly srcset = srcset;
  protected readonly photoUrl = photoUrl;

  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly route = viewChild.required<ElementRef<SVGPathElement>>('route');
  private readonly needle = viewChild.required<ElementRef<SVGCircleElement>>('needle');
  private readonly hemStitches = viewChild.required('hemStitches', { read: EmbroideryView });

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (prefersReducedMotion()) return;
      gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
      // A context collects every tween and trigger created here, so one revert() undoes them all.
      const context = gsap.context(() => this.animateOnScroll(), this.host);
      destroyRef.onDestroy(() => context.revert());
    });
  }

  protected cornerChart(index: number): Chart {
    return [CORNER_THREADS[index % CORNER_THREADS.length]];
  }

  protected isWide(photo: Photo): boolean {
    return photo.width > photo.height;
  }

  /** Rendered width of the photo, matching story.scss, so the browser picks the right file. */
  protected sizes(photo: Photo): string {
    return this.isWide(photo) ? '(min-width: 560px) 480px, 94vw' : '(min-width: 560px) 380px, 88vw';
  }

  private animateOnScroll(): void {
    for (const frame of this.host.querySelectorAll<HTMLElement>('.frame')) {
      gsap.fromTo(
        frame.querySelector('img'),
        { yPercent: -7 },
        {
          yPercent: 7,
          ease: 'none',
          scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    }

    const route = this.route().nativeElement;
    gsap
      .timeline({
        scrollTrigger: { trigger: route, start: 'top 85%', end: 'bottom 55%', scrub: 0.6 },
      })
      .fromTo(route, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none' }, 0)
      .to(
        this.needle().nativeElement,
        { motionPath: { path: route, align: route, alignOrigin: [0.5, 0.5] }, ease: 'none' },
        0,
      );

    const hem = this.hemStitches();
    hem.unpick();
    ScrollTrigger.create({
      trigger: this.host.querySelector('.hem'),
      start: 'top 92%',
      once: true,
      onEnter: () => hem.sew(2.4),
    });
  }
}
