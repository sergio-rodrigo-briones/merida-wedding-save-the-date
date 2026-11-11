import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { homePath, Language } from '../i18n/language';

@Component({
  imports: [RouterLink, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly language = inject(Language);
  protected readonly t = this.language.t;
  protected readonly otherHome = computed(() => homePath(this.language.other()));
}
