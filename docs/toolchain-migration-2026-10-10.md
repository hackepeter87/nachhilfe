# Toolchain-Migration vom 10.10.2026

## Ziel und Ergebnis

Issue #150 trennt größere Werkzeugwechsel von Sicherheits- und Fachänderungen.
Die Migration verändert weder Aufgaben noch Katalog, Lernlogik, Speicherung oder
sichtbare App-Funktionen.

Migriert wurden:

- Vitest 4.1.11 auf 5.0.3
- `@testing-library/jest-dom` 6.9.1 auf 7.0.1
- jsdom 29.1.1 auf 30.1.2
- `vite-plugin-pwa` 1.3.0 auf 2.0.0
- `@testing-library/dom` 10.4.2 als direkter Peer von jest-dom

Node 24 bleibt die LTS-Basis. Wegen der jsdom-Engine wird die Untergrenze von
Node 24 auf 24.15.0 angehoben.

## Bewertete Brüche

### Vitest 5

Vitest 5 setzt Vite mindestens 6.4 und Node mindestens 22.12 voraus. Das Projekt
verwendet Vite 8 und Node 24. Die neue Voreinstellung `clearMocks: true` wurde
gegen die vollständige Suite geprüft; keine Prüfung hängt von Aufrufshistorien
eines vorherigen Tests ab. Entfernte sequentielle und Benchmark-Optionen sowie
Browser-Runner-Änderungen werden im Projekt nicht verwendet.

Quelle: https://vitest.dev/guide/migration/

### jest-dom 7

jest-dom 7 verlangt Node 22 oder neuer und `@testing-library/dom` 10 als direkten
Peer. Der Vitest-Einstieg `@testing-library/jest-dom/vitest` bleibt gültig. Das
Projekt deklariert den Peer nun ausdrücklich; Test-Setup und Assertions benötigen
keine Anpassung.

Quelle: https://github.com/testing-library/jest-dom/releases/tag/v7.0.1

### jsdom 30

jsdom 30.1.2 verlangt Node `^22.22.2 || ^24.15.0 || >=26.0.0` und enthält
umfangreiche DOM-, CSSOM-, Fokus- und Selektorkorrekturen. Die Anwendung nutzt
jsdom ausschließlich als Testumgebung. Alle 524 Unit- und Komponententests
bleiben ohne Abschwächung grün.

Quelle: https://github.com/jsdom/jsdom/releases

### vite-plugin-pwa 2

Version 2 hebt die Node-Untergrenze auf 20.19 an und unterstützt Vite 8. Die
vorhandene `VitePWA`-Konfiguration bleibt API-kompatibel. Produktionsbuild,
Manifest, generierter Service Worker, Offline-Neustart und kontrolliertes
Service-Worker-Update wurden geprüft.

Quelle: https://github.com/vite-pwa/vite-plugin-pwa

## Bewusst verschoben

TypeScript 7.0.2 wird nicht installiert. `typescript-eslint` 8.71.1 unterstützt
offiziell nur TypeScript `>=4.8.4 <6.1.0`. Ein Peer-Override würde Lint-Ergebnisse
außerhalb des zugesicherten Bereichs erzeugen und ist ausgeschlossen. TypeScript
bleibt deshalb auf 6.0.3, bis typescript-eslint TypeScript 7 offiziell freigibt.

Quelle: https://typescript-eslint.io/users/dependency-versions/

`@vitejs/plugin-react` bleibt auf 6.0.3. Neuere 6.x-Versionen erzeugen im
vorhandenen Graphen weiterhin einen Babel-8-Peer-Konflikt; weder `--force` noch
`--legacy-peer-deps` werden verwendet.

## Verifikation

- Katalog und Curriculum-Matrix stimmen mit ihren generierten Artefakten überein.
- Typecheck und ESLint laufen ohne Befund.
- 28 Vitest-Dateien mit 524 Tests bestehen.
- Der Produktionsbuild erzeugt Manifest und Service Worker mit
  `vite-plugin-pwa` 2.0.0.
- 22 Playwright-Szenarien für Chromium, Mobile Safari, Offlinebetrieb,
  Persistenz und PWA-Update bestehen.
- npm Audit und Trivy prüfen den finalen Lockfile- und Containerstand vor der
  Freigabe.

Die vorhandene Warnung zum mehr als 500 kB großen Hauptchunk bleibt bestehen und
ist nicht Teil dieser reinen Toolchain-Migration.
