# Software-Wartung und Kombinatorik-Klarstellung 0.32.7

Releaseumfang: App 0.32.7, Katalog 0.31.4, Schema 19. Keine neue Kompetenz.

## Änderungen

- Sicherheitsupdates für fast-uri, undici, postcss, brace-expansion und browserslist.
- Kompatible Updates für React, Lucide, Vite, Playwright, Testing Library, ESLint
  und Vitest; Node-Typen auf die Node-24-LTS-Buildumgebung abgestimmt.
- checkout/setup-node v7, wöchentliche Dependabot-PRs und frische Containerbasen.
- Der Image-Publish setzt erfolgreiche Qualitäts-, Sicherheits-, Browser- und
  Containerprüfungen für denselben Commit voraus. Keine Umgehung bei Audit-Ausfall.
- Zusätzlicher echter Service-Worker-Update-Test prüft Bestätigung, Aktivierung
  und Erhalt des lokalen Profils einschließlich Offline-Neustart.
- Die separat vorbereitete Kombinatorik-Korrektur fragt nach einer konkreten
  Auswahl aus zwei benannten Gruppen. Hilfen und Feedback bleiben beim aktuellen
  Lernschritt; Antworttexte verbinden die beiden Dinge mit „und“.

## Freigabe und Betrieb

Die Wartungsbasis wurde lokal mit 503 Unit-/Komponententests, jeweils 22
Chromium-/WebKit-Szenarien gegen Preview und gehärteten Container, Typecheck,
Lint, Katalog-/Curriculum-Abgleich, Produktionsbuild und actionlint geprüft.
Trivy 0.74.0 fand keine bekannten Schwachstellen im Runtime-Image und im
Lockfile einschließlich Dev-Abhängigkeiten. Der damalige npm-Audit-Ausfall
(HTTP 503) ist im [Wartungsbericht](software-maintenance-2026-09-04.md) dokumentiert.
Die Releasefreigabe benötigt zusätzlich eine erfolgreiche Remote-CI.

Zielartefakte nach Freigabe:

- Git-Tag und [GitHub Release v0.32.7](https://github.com/hackepeter87/nachhilfe/releases/tag/v0.32.7)
- `ghcr.io/hackepeter87/nachhilfe:0.32.7`, ausschließlich `linux/amd64`
- Zusätzliche SHA- und `latest`-Tags aus dem Publish-Workflow

UID 101, read-only Rootfs, keine Capabilities, no-new-privileges, Port 8080 und
`/tmp`-tmpfs bleiben erhalten. Kein automatisches DMZ-Deployment; ein Release
ersetzt weder den laufenden Benutzercontainer noch löscht es Browserdaten.
Rollback: vorheriges Image `ghcr.io/hackepeter87/nachhilfe:0.32.6` verwenden,
Profil und Lernstand unverändert lassen.

## Bewusst zurückgestellt

- React-Buildplugin 6.0.5/6.1.1 wegen reproduziertem Babel-Peer-Konflikt.
- TypeScript 7, Vitest 5 und jest-dom 7 als separate Migrationen in #150.
- Echte iPhone-Abnahme und externe Lehrkraftprüfung sind nicht erfolgt.
- Bekannte Bundlegrößen-/Upstream-Deprecation-Warnungen bleiben dokumentiert.

Nachverfolgung: [#143](https://github.com/hackepeter87/nachhilfe/issues/143),
[#149](https://github.com/hackepeter87/nachhilfe/issues/149),
[#150](https://github.com/hackepeter87/nachhilfe/issues/150).
