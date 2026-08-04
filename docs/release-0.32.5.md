# Direkter Rundenabschluss 0.32.5

Stand: App 0.32.5, Katalog 0.31.2, Schema 19, Status `ready-for-review`.

## Umfang

- Eine abgeschlossene Runde wird unmittelbar nach der letzten Aufgabe in IndexedDB gespeichert.
- Die bisher verpflichtende Frage „Was hat dir heute geholfen?“ entfällt, weil ihre Antwort weder Adaptivität noch Hilfen oder Aufgabenauswahl beeinflusste.
- Der Abschluss bietet „Neue Runde beginnen“ als primäre und „Zur Startseite“ als sekundäre Aktion.
- Beide Aktionen benötigen nach einer fertigen Runde keine Verwerfungsbestätigung.
- Das Navigationsmenü unterscheidet zwischen einer laufenden und einer bereits abgeschlossenen Runde.
- Historische Sitzungen mit einer früheren Selbsteinschätzung bleiben lesbar; neue Sitzungen kennzeichnen ehrlich, dass keine Einschätzung abgefragt wurde.

Es wurden keine mathematischen Kompetenzen oder Kataloginhalte verändert. Der Katalog bleibt deshalb bei Version 0.31.2 und Schema 19.

## Abnahme

Erfolgreich geprüft wurden:

- Katalogabgleich und Curriculum-Matrix,
- Typecheck und Lint,
- 490 Unit- und Komponententests,
- Produktionsbuild mit PWA-Precache,
- 21 Playwright-Szenarien in Chromium und WebKit,
- automatisches Speichern vor jeder Abschlussaktion,
- direkter Rundenneustart und Rückkehr zur Startseite,
- Abschlussdarstellung bei 375 × 812 und 812 × 375 ohne horizontalen Überlauf,
- GitHub-Actions-Jobs für Quality, E2E und AMD64-Containerbuild.

## Veröffentlichung

- Git-Tag: [`v0.32.5`](https://github.com/hackepeter87/nachhilfe/tree/v0.32.5)
- GitHub Release: [`Mathe-Reise 0.32.5`](https://github.com/hackepeter87/nachhilfe/releases/tag/v0.32.5)
- Image: `ghcr.io/hackepeter87/nachhilfe:0.32.5`
- Plattform: `linux/amd64`

Das GHCR-Image wird ausschließlich durch GitHub Actions aus dem Release-Tag gebaut. Registry-Digest und Workflow-Lauf werden nach erfolgreicher Veröffentlichung im GitHub Release dokumentiert.

Ein echter iPhone-Test dieser Änderung und eine externe Lehrkraftprüfung wurden nicht durchgeführt. WebKit ist lediglich eine technische Mobile-Safari-Näherung.
