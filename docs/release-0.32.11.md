# Sicherheits- und Wartungsrelease 0.32.11

Releaseumfang: App 0.32.11, Katalog 0.31.7, Schema 20.

## Änderungen

- Die transitiven Abhängigkeiten `undici`, `brace-expansion`, `fast-uri` und
  `source-map-js` wurden auf gepatchte Versionen aktualisiert. npm Audit und
  der Trivy-Lockfile-Scan melden keine Funde ab `MEDIUM`.
- React, Vite, Playwright, ESLint, Lucide und weitere Werkzeuge wurden innerhalb
  ihrer freigegebenen Hauptversionen aktualisiert. Node bleibt auf Version 24
  LTS; Major-Migrationen sind nicht Bestandteil dieses Releases.
- Der Runtime-Layer aktualisiert alle installierten Alpine-Pakete. Der
  Container-Scan verwendet Trivy 0.75.0 und blockiert ab `MEDIUM`.
- Aufgaben, Katalog, Lernlogik, IndexedDB-Struktur und gespeicherte Profile
  bleiben unverändert.

## Freigabe

Vor dem Release werden Katalog- und Curriculum-Abgleich, Typecheck, Lint, alle
Unit- und Komponententests, Produktionsbuild, npm Audit, Trivy-Scans sowie die
Chromium-, WebKit-, Offline- und Container-Szenarien ausgeführt. Der Tag
`v0.32.11` wird erst nach grüner Main-CI gesetzt; das GitHub Release wird erst
nach erfolgreichem GHCR-Publish veröffentlicht.

Zielartefakte:

- Git-Tag und GitHub Release `v0.32.11`
- `ghcr.io/hackepeter87/nachhilfe:0.32.11`, ausschließlich `linux/amd64`
- zusätzliche Tags `sha-<kurzsha>` und `latest` auf demselben Manifest

Rollback: `ghcr.io/hackepeter87/nachhilfe:0.32.10` verwenden. Browserprofil und
Lernstand bleiben bei diesem Release erhalten.

## Grenzen

- `@vitejs/plugin-react` bleibt auf 6.0.3, weil neuere 6.x-Patches in der
  vorhandenen Abhängigkeitskette einen nicht auflösbaren optionalen
  Babel-8-Peer-Konflikt erzeugen. Es wird kein Peer-Override erzwungen.
- TypeScript 7, Vitest 5, jest-dom 7, jsdom 30 und PWA 2 bleiben separate
  Migrationen.
- Eine vollständige Abnahme von 0.32.11 auf einem echten iPhone sowie eine
  externe Lehrkraftprüfung und Unterrichtserprobung sind nicht erfolgt.
