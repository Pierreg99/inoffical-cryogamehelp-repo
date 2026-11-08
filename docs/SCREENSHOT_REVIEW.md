# P5 Screenshot Review – Sicherheits- und Funktionsgrenzen

Die [deutschsprachige Screenshot-Review-Seite](screenshot-review.html) ist ein unabhängiger experimenteller Browser-Arbeitsplatz. Kein KI-Modell, keine Cloud-API, keine Kamera- oder Game-Verbindung.

- Ohne Einwilligung kein aktivierter Datei-Input.
- PNG/JPEG/WebP, maximal 8 MiB; Header-Signatur wird geprüft.
- Lokale \`blob:\`-Vorschau mit \`URL.revokeObjectURL()\` beim Entfernen oder Verlassen.
- Nur manuelle Beobachtungen, offene Fragen und Quellenhinweise; kein OCR, keine Gesichts-/Spielererkennung.
- JSON-Report enthält \`modelUsed:null\`, \`aiInferencePerformed:false\`, \`uploaded:false\`, \`embedded:false\`; keine Screenshot-Bildbytes oder Dateinamen.
- Keine lokal persistierte Bilddatei, kein Login, keine Netzwerkanfrage für Bilddaten.

Browser/OS/Erweiterungen können eigene Caches halten: Das Freigeben der Vorschau ist **keine sichere geräteweite Löschung**. Textberichte können private Informationen aus selbst eingegebenen Notizen enthalten. Vor Auswahl und Weitergabe sensible Inhalte entfernen.

**Echte optionale KI später:** benötigt separate Nutzer-Einwilligung je Übertragung, dokumentierten Anbieter/Retention, Redaction, Backend-Secret-Schutz, Quellen und Review-Gate. Noch nicht implementiert.

Testmethodik: P5-Playwright-Checks (Consent, Bildsignatur, JSON ohne Bild, Widerruf, 320-px-Tastatur). Selektiv übernommen: \`better-design\` acht Audit-Achsen aus Cryo-Omega-Skill-Katalog bei Repo-HEAD \`25fdb00ba5e51628bc9fd8ce91d06f849f8c4091\`; kein Agent gestartet.

## Zusätzliche Browser-Sicherheitsgrenze

Der Screenshot-Prüfplatz trennt HTML, CSS und JavaScript in lokale Dateien und setzt eine CSP mit `connect-src 'none'`, `script-src 'self'`, `img-src 'self' blob:`, `form-action 'none'` und `object-src 'none'`. Die Vorschau bleibt lokal und wird nach Widerruf freigegeben. Dies ist eine Browser-Richtlinie, kein Schutz gegen kompromittierte Erweiterungen oder eine sichere Löschung des Geräts.
