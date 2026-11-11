import { Component, effect, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { WEDDING } from '../../../content/wedding.example';
import { Language } from '../../../i18n/language';

@Component({
  selector: 'app-save-the-date',
  templateUrl: './save-the-date.html',
})
export class SaveTheDate {
  protected readonly language = inject(Language);
  protected readonly t = this.language.t;
  protected readonly wedding = WEDDING;
  protected readonly names = WEDDING.couple.map((person) => person.firstName).join(' & ');

  constructor() {
    const title = inject(Title);
    effect(() => title.setTitle(`${this.names} · ${this.t().saveTheDate.headline}`));
  }
}
