import { Routes } from '@angular/router';

const saveTheDate = () =>
  import('./features/save-the-date/save-the-date').then((m) => m.SaveTheDate);

// Spanish (default) at the root, English under /en. The language comes from
// the URL (see Language), so both routes render the same feature.
export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: saveTheDate },
  { path: 'en', loadComponent: saveTheDate },
  { path: '**', redirectTo: '' },
];
