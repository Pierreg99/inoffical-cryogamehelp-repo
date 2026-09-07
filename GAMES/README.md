# CRYOGAMEHELP · Universal Game Hub

A modular gaming knowledge base for guides, builds, decks, teams, PvP/PvE strategy, collection systems, events, progression, assets, reports, and visual documentation.

## Interactive dashboard

Open the [CRYOGAMEHELP Interactive Hub](../docs/) for game filters, visual cards, Team & Deck Builder, search, stat previews, guide modals and direct module navigation.

## Supported game modules

| Game | Module | Core documentation |
|---|---|---|
| Dragon Ball Legends | `DB_Legends/` | PvP, teams, equipment, Bilderbuch, meta |
| Pokémon Trading Card Game Pocket | `GAMES/Pokemon_TCG_Pocket/` | collecting, 20-card decks, battle guides, expansions |
| Pokémon Trading Card Game Live | `GAMES/Pokemon_TCG_Live/` | deck building, ladder, card legality, strategy |
| Pokémon GO | `GAMES/Pokemon_GO/` | catching, raids, PvP, events, progression |

## Universal architecture

Every game follows the same documentation layers:

1. **Overview** — identity, platforms, modes, terminology.
2. **Guides** — beginner → advanced workflows.
3. **Builds** — decks, teams, loadouts, counters and variants.
4. **Meta** — dated snapshots, usage/evidence, strategic evaluation.
5. **Progression** — ranks, collections, resources and milestones.
6. **Events** — time-limited activities and rewards.
7. **Assets** — original diagrams, covers, dashboards and game-specific visual systems.
8. **Reports** — DE/EN research and change history.

## Shared quality model

`FACTS → SOURCES → ANALYSIS → BUILD → TEST → UPDATE`

Live-service claims must carry an explicit date. Strategic judgement is labeled as analysis and must not be presented as an official ranking.

## Current game-source anchors

- [Pokémon TCG Pocket — official](https://tcgpocket.pokemon.com/en-gb/)
- [Pokémon TCG Live — official support](https://support.pokemon.com/hc/en-us/categories/360005098131)
- [Pokémon GO — official](https://www.pokemon.com/de/pokemon-videospiele/pokemon-go)
- [Pokémon Support](https://support.pokemon.com/hc/en-us/)

## Adding another game

Copy `GAME_MODULE_TEMPLATE.md`, create `GAMES/<Game_Name>/`, then add DE/EN landing pages, guides, build/meta sections, source links, data fields and a visual identity. Register the module in the Universal Hub and Builder data model.
