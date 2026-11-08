# CRYOGAMEHELP website

The production website is the self-contained `docs/` directory, published with GitHub Pages:

**https://pierreg99.github.io/inoffical-cryogamehelp-repo/**

- Complete English, German, and French interfaces and eight practical guides.
- Four game modules with real publisher artwork, screenshots, and source links.
- Combined game search and category filters, searchable guides, persistent bookmarks.
- Separate team/deck plans per game, editable quantities, custom entries, and text export. Pocket/Live additionally support versioned local JSON import/export with input-size, schema, per-name copy and deck-size checks; this is not a live game legality check.
- Six-member Legends/GO raid plans; Legends adds 3 battle + 3 bench slots with manual move controls and notes. GO retains its raid layout. Pocket/Live retain 20/60-card limits.
- Browser-local saving, color theme preferences, responsive navigation, keyboard access, native dialogs, and reduced motion support.
- All eight guides feature independent three-step learning checklists, progress previews and reset controls. Versioned browser-only storage (`cryo-guide-progress-v1`) preserves older Legends progress. Completion is self-reported, never a verified gameplay result.
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

The browser suite covers all languages, search/filter combinations, bookmarks, saved plans, copy/capacity limits, safe custom entry rendering, export, theme persistence, image loading, dialogs, and Legends checklist persistence, invalid storage and reset. Layout regression checks cover seven viewport widths from 320 to 1440 pixels, 200% text enlargement, long custom names, readable text, non-overlapping hero content, sticky dialog controls, and keyboard navigation in the mobile drawer.

## Edit content

- `data.js`: game metadata, starter entries, guides in all three languages.
- `i18n.js`: interface strings.
- `app.js`: interactions, storage, rendering; guide progress uses schema `{version:1,guides:{[guideId]:number[]}}`. Legends roles are stored in `cryo-plans` and notes in `cryo-legends-notes-v1`. Deck JSON uses `format:'cryogamehelp-deck', version:1, game:'pocket'|'live', entries:[{id,name,type,qty}]`, with a 64 KB browser file-input cap.
- `styles.css`: visual design and breakpoints.
- `assets/sources.json`: original URLs and attribution for third-party imagery.

Legends assigns the first three added units to battle and the next three to the bench. Move buttons allow changing groups if the destination has capacity. Legacy teams retain their units and default to the original order. Manual team-tag and Z-Ability notes are local and included in text export. This does not check character abilities, synergies, or the current meta.

The planner is a planning aid, not a complete database or legality checker. Exact card printings, formats, abilities, equipment, and competitive recommendations must be checked against current in-game rules. Website guides are evergreen guidance; repository research snapshots retain their original dates.

## Deployment

The GitHub Pages workflow checks and tests the website, then publishes `docs/` after every push to `main`. No repository variable or build step is required.

For a new repository, select **GitHub Actions** as the source in [Pages settings](https://github.com/Pierreg99/inoffical-cryogamehelp-repo/settings/pages). This repository already has Pages enabled. You can also publish manually through **Test and deploy CRYOGAMEHELP → Run workflow**.

The workflow publishes the self-contained `docs/` directory at the repository’s root Pages URL. A root `index.html` and `.nojekyll` also support the existing branch-based Pages setting by forwarding to `docs/` while preserving language and section links.

`Website/index.html` redirects the older duplicate entrypoint to the maintained `docs/` website.

## Omega Build Review Lab — experimental DE-only workspace

[Open the standalone Omega Review Lab](omega-lab.html). This optional German-language page complements, **does not replace or synchronize with**, the multilingual main planner. It supports four game profiles, simplified structural hints, local entry editing and JSON export with explicit `verifiedMeta: false` and `verifiedLegality: false`. Drafts stay in the separate `cryogamehelp-omega-lab-v1` browser storage key. This page does not validate current in-game rules.

It uses an original abstract Precision-Neon design rather than new third-party images. Playwright test coverage is in `tests/omega-lab.spec.js`; see [scope and evidence](OMEGA_REVIEW.md).