# Automatisierte und gehärtete Wartung 0.32.14

Releaseumfang: App 0.32.14, Katalog 0.31.7, Schema 20.

## Änderungen

- Renovate 44 erkennt 56 Versionsreferenzen in npm, `.nvmrc`, Dockerfile,
  Compose und GitHub Actions. Auto-Merge ist deaktiviert; Major-Updates
  benötigen eine Freigabe im Dependency Dashboard.
- GitHub Actions und die Basisimages für Node und nginx sind auf unveränderliche
  Commit- beziehungsweise Image-Digests festgelegt.
- CI installiert npm-Abhängigkeiten mit deaktivierten Paketskripten und startet
  Playwright ausschließlich aus dem vorhandenen Lockfile.
- Trivy 0.76.1 prüft das npm-Lockfile und das gebaute Runtime-Image weiterhin
  verpflichtend ab Schweregrad `MEDIUM`.
- Aufgaben, Katalog, Lernlogik, IndexedDB-Struktur und gespeicherte Profile
  bleiben unverändert.

## Freigabe

Die Renovate-Konfiguration wurde strikt validiert und in einem vollständigen
GitHub-Dry-Run geprüft. Vor dem Release laufen Katalog- und Curriculum-Abgleich,
Typecheck, Lint, 524 Unit- und Komponententests, Produktionsbuild, npm Audit,
Trivy-Scans sowie 22 Chromium-, WebKit-, Offline- und Container-Szenarien. Der
Tag `v0.32.14` wird erst nach grüner Main-CI gesetzt; das GitHub Release wird
erst nach erfolgreichem GHCR-Publish veröffentlicht.

Zielartefakte:

- Git-Tag und GitHub Release `v0.32.14`
- `ghcr.io/hackepeter87/nachhilfe:0.32.14`, ausschließlich `linux/amd64`
- zusätzliche Tags `sha-<kurzsha>` und `latest` auf demselben Manifest

Rollback: `ghcr.io/hackepeter87/nachhilfe:0.32.13` verwenden. Browserprofil und
Lernstand bleiben bei diesem Release erhalten.

## Grenzen

- Die einmalige Installation der Renovate-GitHub-App benötigt eine interaktive
  GitHub-Anmeldung. Konfiguration und Online-Dry-Run sind bereits erfolgreich.
- `deepmerge` 4.3.1 bleibt als Low-Risk-Befund in einer ausschließlich zur
  Buildzeit verwendeten PWA-Werkzeugkette bestehen und wird in Issue #170
  verfolgt.
- Eine vollständige Abnahme von 0.32.14 auf einem echten iPhone sowie eine
  externe Lehrkraftprüfung und Unterrichtserprobung sind nicht erfolgt.
