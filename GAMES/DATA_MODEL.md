# Universal Game Data Model

This repository uses a common metadata vocabulary so different game modules can be indexed consistently.

| Field | Purpose |
|---|---|
| `game` | canonical game/module name |
| `mode` | PvP, PvE, collection, raid, ladder, story, etc. |
| `snapshot` | date/time context for live-service information |
| `source` | official or community evidence |
| `build` | deck, team, loadout or encounter setup |
| `role` | offensive, defensive, support, control, collection, utility, etc. |
| `tier` | repository analysis label only, never implied official ranking |
| `confidence` | high / medium / low evidence confidence |
| `status` | active / archived / experimental |

## Evidence classes

**A — Official:** game site, support, patch notes or primary announcement.

**B — Verified research:** reproducible databases or structured data with clear provenance.

**C — Community evidence:** guides, discussion, testing reports or usage observations.

A and B establish factual baselines. C may inform strategic analysis but should not silently replace primary facts.

## Universal content contract

Every mature game module should eventually provide:

`README → GUIDES → BUILDS → META → PROGRESSION → EVENTS → ASSETS → REPORTS`
