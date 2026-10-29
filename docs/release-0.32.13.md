# Sicherheitsrelease 0.32.13

Releaseumfang: App 0.32.13, Katalog 0.31.7, Schema 20.

## Änderungen

- `jsdom` wurde auf 30.1.3 aktualisiert und verwendet damit `undici` 8.12.3.
- Die transitiven Build- und Testabhängigkeiten `zod`, `fast-uri` und
  `serialize-javascript` wurden auf gepatchte Versionen aktualisiert.
- npm Audit meldet keine Funde ab `moderate`. Der verbleibende Low-Risk-Fund
  `GHSA-gcqx-w48m-w2h4` in `deepmerge` besitzt noch keinen kompatiblen
  Upstream-Fix und wird in Issue #170 verfolgt.
- Aufgaben, Katalog, Lernlogik, IndexedDB-Struktur und gespeicherte Profile
  bleiben unverändert.

## Freigabe

Vor dem Release laufen Katalog- und Curriculum-Abgleich, Typecheck, Lint, 524
Unit- und Komponententests, Produktionsbuild, npm Audit, Trivy-Scans sowie 22
Chromium-, WebKit-, Offline- und Container-Szenarien. Der Tag `v0.32.13` wird
erst nach grüner Main-CI gesetzt; das GitHub Release wird erst nach
erfolgreichem GHCR-Publish veröffentlicht.

Zielartefakte:

- Git-Tag und GitHub Release `v0.32.13`
- `ghcr.io/hackepeter87/nachhilfe:0.32.13`, ausschließlich `linux/amd64`
- zusätzliche Tags `sha-<kurzsha>` und `latest` auf demselben Manifest

Rollback: `ghcr.io/hackepeter87/nachhilfe:0.32.12` verwenden. Browserprofil und
Lernstand bleiben bei diesem Release erhalten.

## Grenzen

- `deepmerge` 4.3.1 bleibt als Low-Risk-Befund in einer ausschließlich zur
  Buildzeit verwendeten PWA-Werkzeugkette bestehen. Ein Downgrade von
  `vite-plugin-pwa` ist keine sichere oder funktional gleichwertige Behebung.
- Eine vollständige Abnahme von 0.32.13 auf einem echten iPhone sowie eine
  externe Lehrkraftprüfung und Unterrichtserprobung sind nicht erfolgt.
