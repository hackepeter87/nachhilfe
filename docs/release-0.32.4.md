# Navigation und lokales Zurücksetzen 0.32.4

Stand: App 0.32.4, Katalog 0.31.2, Schema 19, Status `ready-for-review`.

## Umfang

- Die Startseite, eine laufende Runde und der Abschluss besitzen eine sichtbare Navigation.
- Das Verlassen oder Ersetzen einer laufenden Runde benötigt eine ausdrückliche Bestätigung.
- Abbrechen erhält den aktuellen Aufgabenstand unverändert.
- Eine neue Runde beginnt mit einem neuen Sitzungsplan bei Aufgabe 1.
- „App zurücksetzen“ löscht Profil, Einstellungen, Kompetenzstände und abgeschlossene Runden aus IndexedDB des aktuellen Geräts.
- Die installierte PWA und ihr Offline-Cache bleiben beim Zurücksetzen erhalten.

Es wurden keine mathematischen Kompetenzen oder Kataloginhalte verändert. Der Katalog bleibt deshalb bei Version 0.31.2 und Schema 19.

## Abnahme

Erfolgreich geprüft wurden:

- Katalogabgleich und Curriculum-Matrix,
- Typecheck und Lint,
- 490 Unit- und Komponententests,
- Produktionsbuild mit PWA-Precache,
- 21 Playwright-Szenarien in Chromium und WebKit,
- Navigation bei 375 × 812 und 812 × 375 ohne horizontalen Überlauf,
- gehärteter AMD64-Containerbetrieb mit Read-only-Rootfs, Healthcheck und HTTP-Vertrag.

## Veröffentlichung

- Git-Tag: [`v0.32.4`](https://github.com/hackepeter87/nachhilfe/tree/v0.32.4)
- GitHub Release: [`Mathe-Reise 0.32.4`](https://github.com/hackepeter87/nachhilfe/releases/tag/v0.32.4)
- Image: `ghcr.io/hackepeter87/nachhilfe:0.32.4`
- Plattform: `linux/amd64`

Das GHCR-Image wird ausschließlich durch GitHub Actions aus dem Release-Tag gebaut. Registry-Digest und Workflow-Lauf werden nach erfolgreicher Veröffentlichung im Release dokumentiert.

Ein echter iPhone-Test dieser Änderung und eine externe Lehrkraftprüfung wurden nicht durchgeführt. WebKit ist lediglich eine technische Mobile-Safari-Näherung.
