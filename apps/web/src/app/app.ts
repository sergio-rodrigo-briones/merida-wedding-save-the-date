import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WEDDING } from '../content/wedding.example';
import { DEFAULT_LANG, MESSAGES } from '../i18n/i18n';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  // Temporary placeholder wiring; language switching comes with the /en/ routes.
  protected readonly lang = DEFAULT_LANG;
  protected readonly t = MESSAGES[this.lang];
  protected readonly wedding = WEDDING;
  protected readonly names = WEDDING.couple.map((person) => person.firstName).join(' & ');
}
