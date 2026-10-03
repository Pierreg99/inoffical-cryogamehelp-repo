# CRYOGAMEHELP website

The production website is the self-contained `docs/` directory, published with Sites:

**https://cryogamehelp.pierrepriv99.chatgpt.site/**

- Complete English, German, and French interfaces and eight practical guides.
- Four game modules with real publisher artwork, screenshots, and source links.
- Combined game search and category filters, searchable guides, persistent bookmarks.
- Separate team/deck plans per game, editable quantities, custom entries, and text export.
- Six-member Legends/GO raid plans; 20-card Pocket and 60-card Live deck targets with basic copy limits.
- Browser-local saving, color theme preferences, responsive navigation, keyboard access, native dialogs, and reduced motion support.
- Locally hosted WebP images and fonts; no external service is needed for the website to run.

## Preview and checks

```sh
npm ci
npm start
```

Open http://localhost:4173. The ES modules require an HTTP server; double-clicking `index.html` is not supported.

```sh
npm run check
npx playwright install chromium
npm test
```

The browser suite covers all languages, search/filter combinations, bookmarks, saved plans, copy/capacity limits, safe custom entry rendering, export, theme persistence, image loading, dialogs, and mobile overflow.

## Edit content

- `data.js`: game metadata, starter entries, guides in all three languages.
- `i18n.js`: interface strings.
- `app.js`: interactions, storage, rendering.
- `styles.css`: visual design and breakpoints.
- `assets/sources.json`: original URLs and attribution for third-party imagery.

The planner is a planning aid, not a complete database or legality checker. Exact card printings, formats, abilities, equipment, and competitive recommendations must be checked against current in-game rules. Website guides are evergreen guidance; repository research snapshots retain their original dates.

## Deployment

The live site is hosted with Sites. GitHub Pages is an optional additional target: enable Pages with **GitHub Actions** as its source, then set the repository variable `ENABLE_GITHUB_PAGES` to `true`. The workflow checks and tests the website before publishing `docs/`. Without that opt-in, the workflow runs tests only. The connected GitHub app cannot enable Pages on this repository.

`Website/index.html` redirects the older duplicate entrypoint to the maintained `docs/` website.
