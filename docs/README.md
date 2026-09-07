# CRYOGAMEHELP Interactive Hub

The `docs/` directory is the visual and interactive presentation layer of the Universal Game Hub.

## Features

- Visual game dashboard
- Game filters: All, PvP, TCG, Mobile
- Interactive Team & Deck Builder
- Six build slots with add/remove controls
- Build stat preview: Offense, Defense, Support, Synergy
- Search across game cards and builder items
- Guide/Meta/Collection/Visual modal tools
- Responsive mobile layout
- Light/dark presentation toggle
- SVG visuals with descriptive accessibility metadata

## Local preview

Open `index.html` in a browser.

## GitHub Pages

The repository contains `.github/workflows/pages.yml`, which publishes the `docs/` directory through GitHub Pages after pushes to `main`.

## Architecture

`Overview → Games → Guides → Builder → Meta → Progression → Events → Assets → Reports`

The dashboard is intentionally dependency-free: HTML, CSS, JavaScript and SVG only.
