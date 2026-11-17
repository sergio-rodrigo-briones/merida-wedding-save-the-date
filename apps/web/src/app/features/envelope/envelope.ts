import { Component, ElementRef, input, output, viewChild } from '@angular/core';
import { gsap } from 'gsap';
import { EmbroideryView } from '../../shared/embroidery/embroidery-view';
import { diamondBand, SEAL } from '../../shared/embroidery/motifs';

/**
 * A cotton envelope closed with a sewn flower. It is a real <button>, so it opens
 * with a tap, Enter or Space. It only reports the click (`opened`); the page
 * decides what happens next and plays `open()` as part of its own timeline.
 */
@Component({
  selector: 'app-envelope',
  imports: [EmbroideryView],
  templateUrl: './envelope.html',
  styleUrl: './envelope.scss',
})
export class Envelope {
  readonly names = input.required<string>();
  readonly place = input.required<string>();
  /** Accessible name of the button, e.g. "Abrir el sobre de Itzel & Jordi". */
  readonly label = input.required<string>();
  readonly opened = output<void>();

  protected readonly seal = SEAL;
  protected readonly peekBand = diamondBand(36);

  private readonly button = viewChild.required<ElementRef<HTMLButtonElement>>('button');
  private readonly flap = viewChild.required<ElementRef<HTMLElement>>('flap');
  private readonly letter = viewChild.required<ElementRef<HTMLElement>>('letter');
  // By template ref: the envelope holds two embroideries (letter band and seal).
  private readonly sealEl = viewChild.required('sealStitches', { read: ElementRef });

  /**
   * The seal is unpicked, then the flap turns up over its top edge and, exactly
   * when it is edge-on (90°, halfway through a symmetric ease), drops behind the
   * letter, which then slides out of the pocket.
   */
  open(): gsap.core.Timeline {
    const flap = this.flap().nativeElement;
    const flapStart = 0.15;
    const flapDuration = 0.7;
    return (
      gsap
        .timeline()
        // The hover lift is a CSS transition; left on, it would lag every frame GSAP sets.
        .set(flap, { transition: 'none' }, 0)
        .to(this.sealEl().nativeElement, { autoAlpha: 0, scale: 0.8, duration: 0.25 }, 0)
        .to(flap, { rotationX: 180, duration: flapDuration, ease: 'sine.inOut' }, flapStart)
        .set(flap, { zIndex: 0 }, flapStart + flapDuration / 2)
        .to(this.letter().nativeElement, { yPercent: -46, duration: 0.9, ease: 'power3.out' }, 0.6)
    );
  }

  focus(): void {
    this.button().nativeElement.focus();
  }
}
