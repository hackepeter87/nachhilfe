# Software-Wartung vom 04.09.2026

Status: lokal umgesetzt, noch nicht veröffentlicht. App-Version bleibt 0.32.6.
Keine neuen fachlichen Aufgaben oder Katalogänderungen in diesem Update.
Die bereits vorhandene Inhaltskorrektur in Commit `3a84610` und Katalog 0.31.4
bleibt unverändert und wird in den Release Notes getrennt geführt.

## Umgesetzte Updates

| Paketgruppe | Neuer Stand |
| --- | --- |
| React / React DOM | 19.2.8 |
| lucide-react | 1.40.0 |
| Vite / Vitest | 8.2.2 / 4.1.11 |
| Playwright | 1.62.1 einschließlich Chromium/WebKit |
| Testing Library React / user-event | 16.3.3 / 14.6.7 |
| React-/React-DOM-Typen | 19.2.18 / 19.2.7 |
| Node-Typen | 24.13.3 statt 26.1.1 |
| ESLint / typescript-eslint / react-refresh | 10.9.1 / 8.69.0 / 0.5.6 |
| fast-uri / undici / postcss | 3.1.7 / 7.29.0 / 8.5.28 |
| brace-expansion | 2.1.4 und 5.0.9, beide Vorkommen gepatcht |
| browserslist | 4.28.8 |

Die ersten drei Sicherheitspatches sind separat als `b9435ca` committed.
Die letzten beiden Pakete wurden durch den ergänzenden Trivy-Lockfile-Scan
gefunden: CVE-2026-14257, CVE-2026-69152, CVE-2026-73088 und CVE-2026-73089.
Alle wurden innerhalb der erlaubten Versionsbereiche aktualisiert, ohne
Overrides, `--force` oder `--legacy-peer-deps`.

Node 24.20.0 und npm 11.19.0 wurden isoliert unter `/tmp` verwendet; das offizielle
Node-Archiv wurde gegen SHA256 geprüft. Die globale Node-Installation wurde nicht
verändert. `.nvmrc`, Docker und CI bleiben auf Node 24. Der JSON-Import in der
Vite-Konfiguration besitzt nun das notwendige Importattribut für native Loader.

## CI und Container

- checkout/setup-node auf v7; ihre ESM-/Sicherheitsänderungen betreffen keine
  verwendeten Sonderoptionen. Weiterhin GitHub-hosted Runner und Node 24.
- Wöchentliche Dependabot-PRs für npm, Docker und Actions; npm Minor/Patch gruppiert,
  Majors separat, kein Auto-Merge.
- CI ist wiederverwendbar. Publish benötigt ihren erfolgreichen Abschluss für
  denselben Commit. Schreibrechte auf Packages erhält nur der Publish-Job.
- npm audit blockiert ab moderate und bei Dienstausfall. Trivy blockiert das
  Runtime-Image bei high/critical, ohne ungepatchte Funde auszublenden.
- Container-CI baut AMD64 mit `pull: true`, startet read-only und führt die ganze
  Browser-/Offline-Suite aus. Der Publish-Build bezieht ebenfalls frische Basen.
- Trivy-Action v0.36.0 ist auf Commit-SHA festgelegt, Scanner explizit 0.74.0.

Lokaler Testtag: `mathe-reise:maintenance-20260904`, ausschließlich AMD64.
Image-ID: `sha256:994a184b3349fd1ca8fd1232dc53239360e38c03d49d9ac5fb47475e397a9a42`.
Der vorhandene Container auf Port 8080 wurde nicht angefasst; Tests laufen auf
einem separaten Container mit Port 18080. UID/GID 101, read-only Rootfs, alle
Capabilities entfernt, no-new-privileges, `/tmp` als einziges tmpfs, healthy.
Runtime: Alpine 3.24.1, NGINX 1.30.4, NJS 1.0.1, keine Node-Runtime.

Beim Build aufgelöste Basisdigests (Index):

- Node 24 Alpine: `sha256:e67514e5d0f6c46656005e1b693b2ec9d52e80b641307de684d4a015ba7a4eaf`
- NGINX stable Alpine: `sha256:9b87ad3dd9f431c733f19dfb278c7eb3dba9dca381942c79818bb42f1a566a83`

## Prüfungen

- Baseline und aktualisierter Stand: 503 Unit-/Komponententests grün.
- Saubere Neuinstallation, Typecheck, Lint, Katalog-/Curriculum-Abgleich und
  Produktions-/PWA-Build erfolgreich. Keine neuen Peer-Konflikte im installierten Baum.
- Final jeweils 22 mobile Szenarien gegen Preview und Container erfolgreich.
- Zusätzlicher echter Worker-Update-Test erfolgreich: neue Worker-Bytes über
  lokalen Proxy, sichtbare Bestätigung, aktivierter Worker, Profil auch offline erhalten.
- Screenshots bei 375 x 812 und 812 x 375 kontrolliert; keine erkennbaren neuen
  Layoutprobleme. WebKit ist kein echter iPhone-Test.
- actionlint einschließlich Shellcheck erfolgreich.
- Trivy 0.74.0: keine bekannten Funde im npm-Lockfile einschließlich Dev-Abhängigkeiten
  nach allen Patches; keine bekannten Funde im Runtime-Image (alle Schweregrade).

## Grenzen und offene Freigaben

- npm audit lieferte am Prüftag HTTP 503. Trivy ist eine zusätzliche unabhängige
  Prüfung, kein behaupteter erfolgreicher npm-Audit. Vor Veröffentlichung muss
  der neue CI-Sicherheitsjob erfolgreich sein. Remote-CI wurde noch nicht gestartet.
- Trivy erkennt Alpine 3.24.1 und scannt dessen Pakete, warnt aber, dass die Version
  nicht in seiner EOL-Liste steht. Ein Scanner ohne Funde beweist keine generelle
  Schwachstellenfreiheit. Docker Scout war mangels Anmeldung nicht verfügbar.
- Workbox zieht weiterhin das deprecated glob 11.1.0 und source-map 0.8.0-beta.0
  ein. Kein neuer kompatibler glob-11-Patch verfügbar; kein erzwungener Majorwechsel.
  Der erfolgreiche Trivy-Scan ersetzt keine allgemeine Wartungszusage für diese Pakete.
- Die vorhandene Bundlegrößenwarnung über 500 kB bleibt bestehen; kein unbestelltes
  Code-Splitting oder fachliches Refactoring.
- `@vitejs/plugin-react` 6.1.1 und der kleinere Patch 6.0.5 wurden wegen
  reproduziertem ERESOLVE zurückgestellt:
  optionale `@rolldown/plugin-babel`-Peers ziehen Babel 8, während Workbox/ESLint
  Babel 7 verwenden. Bis zur separaten Auflösung bleibt der Bereich `~6.0.3`.
- TypeScript 7 bleibt wegen typescript-eslint-Peergrenze `<6.1` zurückgestellt.
  Vitest 5 und jest-dom 7 werden ebenfalls separat geprüft.
- App-Version, Compose-Release-Tag und produktives Deployment bleiben unverändert.
  Keine Veröffentlichung oder Aktualisierung eines Benutzercontainers durch diesen Lauf.

## Nachverfolgung

- [#143: fast-uri](https://github.com/hackepeter87/nachhilfe/issues/143)
- [#149: Wartungsupdate und Freigabe](https://github.com/hackepeter87/nachhilfe/issues/149)
- [#150: separate Major-Prüfung](https://github.com/hackepeter87/nachhilfe/issues/150)

Nach grüner Remote-CI: Release-Scope mit der vorbereiteten Inhaltskorrektur explizit
festlegen, Versionsnummer/Compose/Release-Dokumentation gemeinsam aktualisieren,
Tag veröffentlichen und GHCR-Workflow abwarten. Kein automatisches DMZ-Deployment.
