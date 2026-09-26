# Schriftliche Subtraktion und Divisionszerlegung 0.32.9

Releaseumfang: App 0.32.9, Katalog 0.31.6, Schema 19.

## Änderungen

- Die schriftliche Subtraktion ergänzt zwei Entbündelungen, den Tausch über
  eine Null, Überschlagsprüfungen, Strategiewahl und Aufgabenpäckchen nach den
  vorgelegten Übungsformen.
- Dreistellige Divisionen ohne Rest verwenden eine neue geführte Strategie:
  einen möglichst großen Anteil mit vollem Zehnerquotienten wählen, diesen
  teilen, den Rest bestimmen und teilen, anschließend beide Teilquotienten
  addieren.
- Eine eigene Darstellung hält unbekannte Werte bis zum jeweiligen Schritt
  verborgen und macht die Zerlegung auf mobilen Viewports nachvollziehbar.
- Generator-, Komponenten- und Browsertests sichern die neue Aufgabenfamilie
  sowie ihre mobile Darstellung ab. Das Divisionsszenario ist für CI
  deterministisch isoliert.
- Das Runtime-Image aktualisiert `libexpat` auf den gepatchten Alpine-Stand
  `2.8.5-r0` und behebt `CVE-2026-93990`.

## Freigabe

Vor dem Release erfolgreich geprüft: Katalog- und Curriculum-Abgleich,
Typecheck, Lint, 515 Unit- und Komponententests, Produktionsbuild, 22
Chromium-/WebKit-Szenarien sowie dieselben Browser- und Offline-Szenarien gegen
das gehärtete AMD64-Image. Trivy meldete weder im Lockfile noch im Runtime-Image
Funde innerhalb der konfigurierten Schweregrade.

Der Tag `v0.32.9` wird erst nach grüner CI gesetzt; das GitHub Release wird erst
nach erfolgreichem GHCR-Publish veröffentlicht.

Zielartefakte:

- Git-Tag und GitHub Release `v0.32.9`
- `ghcr.io/hackepeter87/nachhilfe:0.32.9`, ausschließlich `linux/amd64`
- zusätzliche Tags `sha-<kurzsha>` und `latest` auf demselben Manifest

Rollback: `ghcr.io/hackepeter87/nachhilfe:0.32.8` verwenden. Browserprofil und
Lernstand bleiben bei diesem Release erhalten.

## Grenzen

- Die familienweise manuelle Prüfung aller Varianten ist nicht abgeschlossen.
- Eine vollständige Abnahme von 0.32.9 auf einem echten iPhone steht aus.
- Eine externe Lehrkraftprüfung und eine Unterrichtserprobung sind nicht erfolgt.
