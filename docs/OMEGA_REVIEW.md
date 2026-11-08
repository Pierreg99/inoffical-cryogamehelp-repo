# Omega Build Review Lab — P4 experimental integration

## Product boundary

The separate [Omega Lab](omega-lab.html) is a **German-only** browser workspace with four profile types: Legends 3+3, Pocket 20-card, Live 60-card, GO Raid 6. It is not a synced extension of the existing planner or an approved live game rule database.

- No account, API, telemetry, game login or new third-party game assets.
- Local browser key: cryogamehelp-omega-lab-v1, independent from primary cryo-plans data.
- JSON export contains schemaVersion:1, source and verifiedMeta:false / verifiedLegality:false.
- No JSON import in Omega Lab; the main Pocket/Live planner already provides validated import/export.
- User-supplied names are DOM text, not dynamic HTML. Stored entries are filtered and bounded on read.
- Offline structural hints do not establish legal decks, accurate meta ratings or real-world team strength.

## Design provenance

Adapted from the standalone concept built in this conversation, with the current OmegaVisionAIProfile Precision-Neon tokens (#080D26, #151B38, #58F4EC, #9898FF, #EE84D6). The better-design eight-axis rubric informs review; no AI agents are running inside the static page.

## Validation

```sh
npm ci
npm run check
npx playwright install chromium
npm test
```

Tests in tests/omega-lab.spec.js cover safe names, capacity, isolation, persistence, JSON export flags, corrupted localStorage and keyboard/mobile behavior. All pre-existing site tests must remain green on the exact PR head SHA.

Manual screenreader testing, publisher asset review and live game rules remain independent tasks. No released source-backed Evidence Center exists yet.
