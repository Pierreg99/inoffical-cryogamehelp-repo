# CRYOGAMEHELP – Vision 3.0 Release Gate

**Stand: Automatisierte Prüfschritte, kein freigegebener Release.**

## Automatisierbarer Nachweis

\`\`\`sh
npm ci
npm run check
npm run release:audit
npx playwright install --with-deps chromium
npm test
\`\`\`

\`scripts/release-audit.mjs\` vergleicht die real vorhandenen \`docs/assets/games/*.webp\` mit \`docs/assets/sources.json\`. Jedes Bild muss einen HTTPS-Quellenlink, ein Abrufdatum und einen Rechtehinweis haben. Auch Font-Lizenzhinweise und wichtige Projektdateien werden geprüft. CI führt die Metadatenprüfung vor den Browsertests aus.

**Ein Quellenverzeichnis ist keine Nutzungserlaubnis.** Ein grüner Lauf bestätigt weder gültige Publisher-Rechte noch WCAG-Zertifizierung, Game-Regelaktualität oder eine KI-Funktion.

## Manueller Release-Checkpoint

- [ ] Publisher-Rechte und Markenrichtlinien unabhängig verifizieren.
- [ ] Echte Android-/Desktop-Geräte und Screenreader prüfen.
- [ ] 200 %-Zoom, Tastatur-Fokus, Touch-Flächen, Kontrast und reduzierte Bewegung prüfen.
- [ ] Aktuelle Regeln, Kartenversionen und Synergien mit datierten Primärquellen prüfen.
- [ ] P5-Datenschutzangaben und JSON-Inhalte reviewen.
- [ ] PR-Diff, exakten Release-SHA, Abhängigkeiten, CI und offene Bugs kontrollieren.
- [ ] Veröffentlichung, Tag und ggf. neue externe Dienste **explizit durch einen Menschen** freigeben.

P5 ist ein ausschließlich lokaler Screenshot-Notizworkflow ohne AI-Modell, Upload oder serverseitige Speicherung. Eine echte KI-Anbindung erfordert neue geprüfte Einwilligungs-, Quellen-, Lösch- und Sicherheitsmechanismen.
