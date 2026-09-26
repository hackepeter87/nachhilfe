# Verlässliche Einführung neuer Aufgabenfamilien 0.32.10

Releaseumfang: App 0.32.10, Katalog 0.31.7, Schema 20.

## Änderungen

- Neue Aufgabenfamilien besitzen im Katalog eine stabile ID, ihre fachliche
  Mindestlernphase, die Katalogversion ihrer Einführung und den vorgesehenen
  Aufgabentyp.
- Die nächste fachlich passende Runde enthält garantiert genau eine noch nicht
  vollständig bearbeitete Familie. Neuere Katalogergänzungen werden zuerst
  eingeführt; Voraussetzungen der jeweiligen Kompetenz bleiben verbindlich.
- Der Abschluss wird erst beim Verlassen der vollständig bearbeiteten Aufgabe
  gespeichert. Fehler und Tipps wirken wie bisher auf den Lernstand, führen
  aber nicht zu einer dauerhaften Wiederholung derselben Einführung.
- Bestehende Profile werden beim Lesen um eine leere Abschlussliste ergänzt.
  Lernstände, Sitzungen und die IndexedDB-Struktur bleiben erhalten.
- Katalog-, Generator-, Sitzungs-, Komponenten- und Migrationstests prüfen alle
  sechs aktuell katalogisierten Familien und deren Reihenfolge.

## Freigabe

Vor dem Release werden Katalog- und Curriculum-Abgleich, Typecheck, Lint, alle
Unit- und Komponententests, Produktionsbuild sowie Chromium- und
WebKit-Szenarien ausgeführt. Der Tag `v0.32.10` wird erst nach grüner CI gesetzt;
das GitHub Release wird erst nach erfolgreichem GHCR-Publish veröffentlicht.

Zielartefakte:

- Git-Tag und GitHub Release `v0.32.10`
- `ghcr.io/hackepeter87/nachhilfe:0.32.10`, ausschließlich `linux/amd64`
- zusätzliche Tags `sha-<kurzsha>` und `latest` auf demselben Manifest

Rollback: `ghcr.io/hackepeter87/nachhilfe:0.32.9` verwenden. Browserprofil und
Lernstand bleiben bei diesem Release erhalten.

## Grenzen

- Die familienweise manuelle Prüfung aller Varianten ist nicht abgeschlossen.
- Eine vollständige Abnahme von 0.32.10 auf einem echten iPhone steht aus.
- Eine externe Lehrkraftprüfung und eine Unterrichtserprobung sind nicht erfolgt.
