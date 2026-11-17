import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { Language } from '../../../i18n/language';
import { timeLeft } from '../time/time';

/**
 * Days, hours, minutes and seconds until `target`. The clock only ticks in the
 * browser: during prerendering there is no "now" worth freezing into the HTML.
 */
@Component({
  selector: 'app-countdown',
  templateUrl: './countdown.html',
  styleUrl: './countdown.scss',
})
export class Countdown {
  /** Instant to count down to, in ms since epoch. */
  readonly target = input.required<number>();

  protected readonly t = inject(Language).t;
  private readonly now = signal(Date.now());
  protected readonly left = computed(() => timeLeft(this.target(), this.now()));
  protected readonly units = computed(() => {
    const { days, hours, minutes, seconds } = this.left();
    const texts = this.t().countdown;
    const two = (n: number) => String(n).padStart(2, '0');
    return [
      { value: String(days), label: texts.days },
      { value: two(hours), label: texts.hours },
      { value: two(minutes), label: texts.minutes },
      { value: two(seconds), label: texts.seconds },
    ];
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const timer = setInterval(() => this.now.set(Date.now()), 1000);
      destroyRef.onDestroy(() => clearInterval(timer));
    });
  }
}
