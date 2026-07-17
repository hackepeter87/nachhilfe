# Katalogverwaltung und Releases

Der Aufgabenkatalog ist ein eigenständig versionierter fachlicher Bestandteil von Mathe-Reise. Katalogänderungen werden derzeit gemeinsam mit Anwendung und Container veröffentlicht. Ein unabhängiger Downloadkanal ist bewusst noch nicht implementiert.

## Quelle und Build-Artefakte

Die einzige zu pflegende fachliche Quelle ist:

```text
content/catalogs/nrw-klasse3-foerderkern/catalog.json
```

`npm run catalog:build` validiert diese Quelle und erzeugt deterministisch:

```text
public/content/task-catalog.json
src/content/task-catalog.fallback.json
```

Der öffentliche Katalog wird beim Start geladen. Der zweite Katalog wird in das App-Bundle eingebettet und ist der geprüfte Rückfall, wenn die öffentliche Datei fehlt oder ungültig ist. Beide Artefakte werden nicht manuell bearbeitet. `npm run catalog:check` schlägt fehl, wenn eines davon von der Quelle abweicht.

## Metadaten und Status

Das aktuelle Schema verwendet diese getrennten Metadaten:

```json
{
  "schemaVersion": 10,
  "catalogVersion": "0.13.0",
  "catalogId": "nrw-klasse3-foerderkern",
  "releasedAt": "2026-07-17",
  "status": "ready-for-review"
}
```

- `schemaVersion` bezeichnet die technische JSON-Struktur. Eine inkompatible Änderung erfordert kompatiblen Anwendungscode.
- `catalogVersion` bezeichnet die fachliche Inhaltsversion und folgt SemVer.
- `catalogId` ist die stabile Kennung dieses Förderkatalogs.
- `releasedAt` ist das geplante Veröffentlichungsdatum im Format `YYYY-MM-DD`.
- `status` ist `draft`, `ready-for-review`, `active` oder `disabled`.

`draft` ist inkonsistent oder in Entwicklung. `ready-for-review` ist intern vollständig und technisch geprüft. `active` wird für tatsächlich von Generator, UI und Tests getragene Inhalte verwendet. `disabled` bleibt unsichtbar. Der Gesamtkatalog steht auf `ready-for-review`, die produktiven Kompetenzen auf `active`; dies behauptet keine externe Lehrkraftfreigabe.

## Versionsregeln

- Patch, zum Beispiel `0.2.0 -> 0.2.1`: Rechtschreibung, verständlichere Texte, bessere Hilfen, korrigierte Distraktoren oder zusätzliche Vorlagen ohne neue technische Anforderungen.
- Minor, zum Beispiel `0.2.1 -> 0.3.0`: neue Kompetenz, neue Schwierigkeitsstufe, neue Darstellung oder neue vom vorhandenen Code unterstützte didaktische Metadaten.
- Schemaänderung: Pflichtfelder, Feldbedeutungen oder Datenstrukturen werden inkompatibel. Dann wird `schemaVersion` erhöht und der passende Anwendungscode im selben Release ausgeliefert. Ein App-Major ist nur nötig, wenn die Anwendung selbst inkompatibel geändert wird.

Jede fachliche Änderung erhöht `catalogVersion` und aktualisiert `releasedAt`. Mehrere Änderungen dürfen in einem gemeinsam geprüften Katalogrelease gebündelt werden.

## Fachliche Änderung umsetzen

1. Die Rückmeldung als GitHub Issue mit konkretem Beispiel, erwartetem Verhalten und betroffener Kompetenz erfassen.
2. Nur die zentrale Quelldatei ändern und Katalogversion sowie Datum anpassen.
3. `npm run catalog:build` ausführen.
4. `npm run catalog:check`, `npm test` und `npm run build` ausführen.
5. Im Pull Request die didaktische Checkliste ausfüllen und nicht belegte Prüfungen offenlassen.
6. Anwendung und OCI-Image gemeinsam veröffentlichen. Release Notes nennen App- und Katalogversion.

Die Lehrkraft muss kein JSON bearbeiten. Ihre Rückmeldung wird im Issue dokumentiert und durch einen Entwickler in einen prüfbaren Katalog-PR überführt.

## Validierung

```bash
npm run catalog:validate  # zentrale Quelle fachlich-strukturell prüfen
npm run catalog:build     # öffentliche und eingebettete Artefakte erzeugen
npm run catalog:check     # Artefakte und Produktionsstatus abgleichen
```

Die Validierung prüft Metadaten, bekannte und eindeutige Kompetenz-IDs, Pflichtfelder, Platzhalter, Zahlenbereiche, Sachaufgaben, Symmetrievarianten und eindeutige Optionen. `npm run build` führt `catalog:check` automatisch vor Vite aus. CI führt dieselbe Prüfung explizit aus.

Schema 6 ersetzt die frühere kindseitige Auswahl technischer Mengenbeziehungen und Rechenarten durch konkrete `situation`-, `modelType`- und `equation`-Felder. Schema 7 trennt bei Symmetrie Rasterdimension, Progressionsphase, Achsenposition, Figurenkomplexität und Distraktorähnlichkeit. Schema 8 ergänzt katalogisierte Schritte für die schriftliche Addition. Schema 9 ergänzt `spatialViews` mit geprüften Würfelgebäuden und Blickrichtungen. Schema 10 ergänzt die verbindliche Sachaufgabenfolge `runtimeSequence`, die Schwierigkeit der Modellinteraktion und eine achtstufige Progression einschließlich wichtiger Angaben. Schema 11 ergänzt `spatialRotations` mit 90-Grad-Richtung, Achse und geprüften Folgezuständen. Generator, Renderer und Validierung müssen gemeinsam mit der jeweiligen Schemaversion ausgeliefert werden. Runtime-, Review- und Planned-Felder sind in [didactic-catalog-review.md](didactic-catalog-review.md) abgegrenzt.

## Sitzungen und Altdaten

Beim Start einer Runde werden `catalogId`, `catalogVersion`, `schemaVersion` und `appVersion` in den Sitzungsplan kopiert. Alle Aufgaben dieser Runde werden mit diesem unveränderlichen Katalog-Snapshot erzeugt. Eine abgeschlossene Sitzung übernimmt dieselben Angaben.

Alte Sitzungen ohne Metadaten bleiben lesbar. Beim Laden ergänzt die App die belegbar ehrlichen Werte `unknown`, `unknown`, `0`, `unknown`. Die Datensätze werden weder gelöscht noch fälschlich einer späteren Katalogversion zugeordnet. Weil sich keine IndexedDB-Objektspeicher geändert haben, bleibt die Datenbankversion bei `1`; die Migration geschieht rückwärtskompatibel beim Lesen.

## PWA-Update

1. Der neue Service Worker lädt Anwendung und Katalog im Hintergrund.
2. Die aktive Version bleibt bis zur kontrollierten Aktivierung vollständig nutzbar.
3. Während einer laufenden Runde erscheint kein Aktualisierungsbefehl; deren Katalog-Snapshot bleibt unverändert.
4. Nach Rückkehr zur Startseite kann das Update bestätigt werden. Ein kontrollierter Neustart aktiviert ebenfalls den wartenden Build.
5. IndexedDB-Lernstand und Sitzungen bleiben erhalten.
6. Schlägt Download oder Validierung fehl, bleibt die bisher aktive Offline-Version nutzbar. Ein ungültiger öffentlicher Katalog fällt zusätzlich auf den eingebetteten geprüften Katalog zurück.

Der stabile Pfad `/content/task-catalog.json` wird mit `Cache-Control: no-cache, must-revalidate` ausgeliefert. Service Worker, Manifest und Einstiegspunkt werden ebenfalls revalidiert; nur hash-basierte Assets erhalten langfristige Immutable-Regeln.

## Container-Release und Rollback

Für Releases sollte das Image zusätzlich zum lokalen Namen unveränderlich mit der App-Version oder einem Commit-Hash getaggt werden:

```bash
docker build --platform linux/amd64 -t mathe-reise:0.14.0 -t mathe-reise:local .
docker run --rm -p 8080:8080 mathe-reise:0.14.0
```

Ein Rollback startet das vorherige Image erneut unter derselben HTTPS-Origin. Browserseitige Lernstände werden dadurch nicht gelöscht. Die technische Versionsanzeige nennt die aktive App- und Katalogversion; bestehende Sessions behalten ihre ursprünglichen Metadaten.

Bei einer zukünftigen inkompatiblen IndexedDB-Änderung muss vor dem Release ein Vorwärts-/Rückwärtskompatibilitätsplan oder ein verlustfreier Exportpfad vorliegen. Ein Rollback darf niemals durch Löschen lokaler Daten erzwungen werden.

## Späterer unabhängiger Updatekanal

GitHub Issue #38 beschreibt eine spätere, noch nicht implementierte Ausbaustufe mit Manifest, `latestVersion`, `minimumAppVersion`, SHA-256-Prüfsumme, validiertem Download, einem `last known good`-Katalog in IndexedDB und Aktivierung ausschließlich vor einer neuen Runde. Bis dahin bleiben Katalog und Anwendung ein gemeinsames, reproduzierbares Release.
