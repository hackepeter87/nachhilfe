# Test- und PWA-Werkzeugmigration 0.32.12

Releaseumfang: App 0.32.12, Katalog 0.31.7, Schema 20.

## Änderungen

- Vitest wurde auf 5.0.3, jest-dom auf 7.0.1, jsdom auf 30.1.2 und
  vite-plugin-pwa auf 2.0.0 migriert.
- `@testing-library/dom` ist als direkte Abhängigkeit deklariert, wie es der
  Peer-Vertrag von jest-dom 7 verlangt.
- Die Node-Untergrenze steigt auf 24.15.0. Damit ist der von jsdom 30
  unterstützte Node-24-Bereich ausdrücklich dokumentiert.
- TypeScript bleibt auf 6.0.3, weil typescript-eslint 8.71.1 weiterhin nur
  TypeScript-Versionen kleiner 6.1 unterstützt. Es wird kein Peer-Override
  eingesetzt.
- Aufgaben, Katalog, Lernlogik, IndexedDB-Struktur und gespeicherte Profile
  bleiben unverändert.

Die technischen Entscheidungen und geprüften Upstream-Verträge stehen im
[Migrationsbericht](toolchain-migration-2026-10-10.md).

## Freigabe

Vor dem Release wurden Katalog- und Curriculum-Abgleich, Typecheck, Lint, 524
Unit- und Komponententests, Produktionsbuild, npm Audit, Trivy-Scans sowie 22
Chromium-, WebKit-, Offline- und Container-Szenarien erfolgreich ausgeführt.
Die vollständige Main-CI für den Migrationscommit ist grün. Der Release-Tag
wird erst nach grüner CI des Versionscommits gesetzt; das GitHub Release wird
erst nach erfolgreichem GHCR-Publish veröffentlicht.

Zielartefakte:

- Git-Tag und GitHub Release `v0.32.12`
- `ghcr.io/hackepeter87/nachhilfe:0.32.12`, ausschließlich `linux/amd64`
- zusätzliche Tags `sha-<kurzsha>` und `latest` auf demselben Manifest

Rollback: `ghcr.io/hackepeter87/nachhilfe:0.32.11` verwenden. Browserprofil
und Lernstand bleiben bei diesem Release erhalten.

## Grenzen

- `@vitejs/plugin-react` bleibt auf 6.0.3, weil die neuere Version in der
  vorhandenen Abhängigkeitskette einen optionalen Babel-8-Peer-Konflikt
  erzeugt.
- TypeScript 7 wird erst migriert, wenn typescript-eslint einen passenden
  Peer-Vertrag veröffentlicht.
- Eine vollständige Abnahme von 0.32.12 auf einem echten iPhone sowie eine
  externe Lehrkraftprüfung und Unterrichtserprobung sind nicht erfolgt.
