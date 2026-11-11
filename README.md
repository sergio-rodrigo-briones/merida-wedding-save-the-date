# Mérida Wedding · Save the Date

An animated save-the-date for a wedding in Mérida, Yucatán. A cotton envelope opens,
and the invitation is embroidered stitch by stitch in SVG. The motifs and the pastel
palette come from the façades of the Santiago and Santa Ana neighbourhoods and from
Yucatecan cement tiles (_mosaicos de pasta_).

> 🚧 **Work in progress.** The app is still a scaffold, built in public one milestone at
> a time.

## Roadmap (phase 1)

- [x] 1. Project skeleton: monorepo, Angular app, linting and formatting
- [ ] 2. Design tokens and typed content
- [ ] 3. Embroidery generator (SVG stitch paths from motifs)
- [ ] 4. Embroidery component and GSAP animation
- [ ] 5. Envelope and 3D opening
- [ ] 6. Scroll-driven journey with MotionPath
- [ ] 7. Date, countdown (America/Merida) and `.ics` download
- [ ] 8. Parallax photos (AVIF/WebP)
- [ ] 9. Hem, reduced motion and accessibility
- [x] CI: format, lint, test and build on every pull request
- [ ] 10. GitHub Pages demo
- [ ] 11. Open Graph, final README and demo GIF
- [ ] 12. Production deploy on Cloudflare Pages with a custom domain

## Stack

- [Angular 22](https://angular.dev): zoneless, standalone components, static prerendering
  (no server at runtime)
- SVG for the embroidery, animated with [GSAP](https://gsap.com) (coming in milestone 4)
- SCSS with design tokens as CSS custom properties
- [Vitest](https://vitest.dev) for unit tests
- ESLint ([angular-eslint](https://github.com/angular-eslint/angular-eslint)) and
  [Prettier](https://prettier.io)
- npm workspaces: `apps/web` today, with an `apps/api` planned for phase 2

## Getting started

Requires Node 24 (see [`.nvmrc`](.nvmrc)).

```sh
npm ci          # install dependencies
npm start       # dev server at http://localhost:4200
npm test        # unit tests
npm run lint    # ESLint
npm run format  # Prettier
npm run build   # static build in apps/web/dist/web
```

## Privacy by design

The public repo and demo use a fictional couple, **Itzel & Jordi**, with sample data.
The real wedding details live in a `wedding.local.ts` file that is ignored by git. The
production build reads that file, so personal data never reaches the repository.

## License

Not decided yet. Until a license is added, all rights are reserved.
