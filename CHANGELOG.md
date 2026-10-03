# CRYOGAMEHELP Changelog

## 2026-09-07 — Universal Interactive Hub

### Added
- Multi-game architecture under `GAMES/`.
- Pokémon TCG Pocket module.
- Pokémon TCG Live module.
- Pokémon GO module.
- Universal game data model and reusable module template.
- Interactive `docs/` web application.
- Visual game-card gallery and universal dashboard SVG.
- Game filtering for All / PvP / TCG / Mobile.
- Interactive Team & Deck Builder with six slots.
- Searchable builder picker and editable build slots.
- Build stat preview for Offense / Defense / Support / Synergy.
- Visual Guide / Meta / Collection / Assets modal tools.
- Responsive layout and light/dark presentation switch.
- GitHub Pages workflow for the `docs/` interface.

### Changed
- Root README promoted from DB-Legends-only presentation to Universal Game Hub.
- Repository art direction expanded from a single-game system to shared multi-game visual standards.
- Repository profile aligned with the universal game architecture.

## Existing DB Legends work

The complete Dragon Ball Legends In-Game documentation remains under `DB_Legends/`, including PvP teams, equipment, Bilderbuch, reports and established visual assets.

## Quality rule

Live-service facts remain dated and source-backed. Strategic recommendations are labeled as analysis rather than official ranking.

## 2.0 — Multilingual website redesign (3 October 2026)

- Replaced the prototype dashboard with a complete responsive game-help website.
- Added English, German, and French UI and eight practical guides.
- Added genuine official game artwork and publisher screenshots with a source manifest.
- Repaired deployed asset and repository links; consolidated the older Website entrypoint.
- Added persistent bookmarks and per-game team/deck plans, custom entries, copy limits, and export.
- Added desktop/mobile browser checks before GitHub Pages deployment.


## 2.1 — Responsive layout repairs and GitHub Pages deployment

- Removed malformed font CSS that prevented the default design variables from applying.
- Replaced overlapping hero positioning with a responsive grid and independent artwork area.
- Increased body, control, and metadata sizes; restored theme colors and legible light-theme labels.
- Made game/guide cards stretch consistently; based image framing on the asset rather than card order.
- Reflowed filters, builder tabs, plan actions, long names, and decks at narrow widths and enlarged text.
- Added an accessible mobile drawer with focus containment and resize recovery, a scrollable sidebar, and sticky dialog close controls.
- Enabled the Pages deployment job without an extra repository variable; documented the one-time owner setup.
- Added browser layout regression checks across seven widths and all three languages.

- GitHub Pages publication verified; repository links now point to the live Pages site, with a root entrypoint for branch-based Pages configurations.
