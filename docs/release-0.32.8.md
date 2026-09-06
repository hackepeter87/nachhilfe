# Robuster Security-Gate 0.32.8

Releaseumfang: App 0.32.8, Katalog 0.31.4, Schema 19. Keine Änderung an
Aufgaben, Lernlogik oder Browserdaten.

## Anlass

Der öffentliche Release v0.32.7 besitzt kein Container-Image, weil der
npm-Advisory-Endpunkt in beiden Publish-Versuchen nach aufgebauter Verbindung
ohne Antwort in das Zeitlimit lief. Der bisherige einzelne `npm audit`-Aufruf
konnte Sicherheitsfunde und einen technischen Dienstausfall nicht als getrennte
Freigabezustände behandeln.

## Änderung

- Trivy 0.74.0 scannt das npm-Lockfile einschließlich Entwicklungsabhängigkeiten
  als verpflichtender CI-Gate ab Schweregrad `MEDIUM`.
- `scripts/security-audit.mjs` führt `npm audit` bis zu dreimal mit jeweils
  begrenztem Netzwerk-Zeitlimit aus.
- Ein echter Fund ab `moderate` blockiert sofort. Unerwartete npm-, JSON- oder
  Skriptfehler blockieren ebenfalls.
- Nur eindeutig erkannte Netzwerk-, Rate-Limit- oder HTTP-5xx-Ausfälle erhalten
  nach drei Versuchen Exitcode 75. Nach bereits bestandenem Trivy-Scan wandelt
  der Workflow ausschließlich diesen Zustand in eine sichtbare Warnung um.
- Unit-Tests sichern Klassifikation, Wiederholung und Workflow-Verdrahtung ab.

Die Änderung beseitigt keinen Sicherheits-Gate. Sie ersetzt die unkontrollierte
Abhängigkeit von einem einzelnen externen POST-Aufruf durch einen verpflichtenden
unabhängigen Lockfile-Scan plus bestmögliche npm-Abfrage.

## Freigabe

Lokal erfolgreich: Katalog-/Curriculum-Abgleich, Typecheck, Lint, 510 Unit- und
Komponententests, Produktionsbuild, 22 Chromium-/WebKit-Szenarien gegen Vite
Preview und dieselben 22 Szenarien gegen das gehärtete AMD64-Image. Der Container
lief als UID 101 mit read-only Rootfs, ohne Capabilities und meldete `healthy`.
Trivy 0.74.0 fand im Lockfile einschließlich Entwicklungsabhängigkeiten keine
Funde ab `MEDIUM`; der echte npm-Audit meldete keine Funde ab `moderate`.

Der Tag `v0.32.8` wird erst nach grüner CI gesetzt; das GitHub Release wird erst
nach erfolgreichem GHCR-Publish veröffentlicht.

Zielartefakte:

- Git-Tag und GitHub Release `v0.32.8`
- `ghcr.io/hackepeter87/nachhilfe:0.32.8`, ausschließlich `linux/amd64`
- zusätzliche SHA- und `latest`-Tags auf demselben Manifest

Rollback: `ghcr.io/hackepeter87/nachhilfe:0.32.6` verwenden. Version 0.32.7
besitzt kein veröffentlichtes Container-Image. Browserprofil und Lernstand
bleiben bei diesem Patch unverändert.
