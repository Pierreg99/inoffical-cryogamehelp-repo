# CRYOGAMEHELP website

The production website is the self-contained `docs/` directory, published with GitHub Pages:

**https://pierreg99.github.io/inoffical-cryogamehelp-repo/**

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

The browser suite covers all languages, search/filter combinations, bookmarks, saved plans, copy/capacity limits, safe custom entry rendering, export, theme persistence, image loading, and dialogs. Layout regression checks cover seven viewport widths from 320 to 1440 pixels, 200% text enlargement, long custom names, readable text, non-overlapping hero content, sticky dialog controls, and keyboard navigation in the mobile drawer.

## Edit content

- `data.js`: game metadata, starter entries, guides in all three languages.
- `i18n.js`: interface strings.
- `app.js`: interactions, storage, rendering.
- `styles.css`: visual design and breakpoints.
- `assets/sources.json`: original URLs and attribution for third-party imagery.

The planner is a planning aid, not a complete database or legality checker. Exact card printings, formats, abilities, equipment, and competitive recommendations must be checked against current in-game rules. Website guides are evergreen guidance; repository research snapshots retain their original dates.

## Deployment

The GitHub Pages workflow checks and tests the website, then publishes `docs/` after every push to `main`. No repository variable or build step is required.

For a new repository, select **GitHub Actions** as the source in [Pages settings](https://github.com/Pierreg99/inoffical-cryogamehelp-repo/settings/pages). This repository already has Pages enabled. You can also publish manually through **Test and deploy CRYOGAMEHELP → Run workflow**.

The workflow publishes the self-contained `docs/` directory at the repository’s root Pages URL. A root `index.html` and `.nojekyll` also support the existing branch-based Pages setting by forwarding to `docs/` while preserving language and section links.

`Website/index.html` redirects the older duplicate entrypoint to the maintained `docs/` website.
