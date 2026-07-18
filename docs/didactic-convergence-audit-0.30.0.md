# Curriculare Konvergenz 0.30.0

Stand: App 0.30.0, Katalog 0.29.0, Schema 19, Status `ready-for-review`. Dieser Audit dokumentiert interne Konsistenz und automatisierte Abnahme. Er ist keine Lehrkraftfreigabe und keine Wirksamkeitsstudie.

## Ziel und Umfang

Version 0.30.0 führt keine neue mathematische Kompetenz ein. Sie beendet die zeitlich begrenzte Migration der 34 aktiven Kompetenzen auf den seit 0.21 verbindlichen Qualitätsstandard. Geprüft werden Katalog, Generatoren, adaptive Folgeaufgaben, Runtime-Metadaten, Darstellungsrollen, Curriculum-Matrix und Tests.

## Ausgangsbefund

- Direkte Aufrufe von `generateExercise()` konnten ohne Lernphase noch den älteren, nur über Schwierigkeit gesteuerten Generatorpfad verwenden.
- Wiederholungs- und Remediationsaufgaben erzeugten eine leichtere Stufe, banden diese aber nicht ausdrücklich an die im Katalog vorgesehene Lernphase.
- Generatorinterne Typkennungen und katalogisierte Typkennungen wurden unabhängig gepflegt. Die Runtime konnte deshalb fachlich richtig arbeiten, ohne die Katalogkennung exakt zu tragen.
- Die Curriculum-Matrix zeigte Stufen und Darstellungen, aber weder den Standard 0.21 noch die sechs produktiven Laufzeittypen je Kompetenz.
- Bei einzelnen Stellenwertvarianten konnten mathematisch plausible Distraktoren durch gleiche Ziffern zusammenfallen.
- Mehrere ältere Tests setzten Schwierigkeit und Lernphase gleich und prüften dadurch nicht mehr die tatsächlich katalogisierte Lernhandlung.

## Behobene gemeinsame Ursachen

### Ein Runtimepfad

Jeder Generatoraufruf bestimmt nun entweder die ausdrücklich angeforderte Lernphase oder die zur Schwierigkeit katalogisierte Standardphase. Ein separater phasenloser Rückgabepfad existiert nicht mehr. Die produktive Typkennung wird aus dem Katalog der aktiven Phase übernommen; fehlt sie oder gehört sie nicht zur Kompetenz, schlägt die Erzeugung sichtbar fehl.

### Adaptive Folgehandlungen

Wiederholungs- und Remediationsaufgaben übernehmen neben der leichteren Schwierigkeit auch deren katalogisierte Lernphase. Unterkompetenz und Variantenabstand bleiben erhalten, wenn die Remediationsregel dies vorsieht. Dadurch können Folgeaufgaben nicht unbemerkt in eine fachlich andere oder alte Ausführungslogik fallen.

### Curriculares Migrationsregister

Die generierte Curriculum-Matrix weist für jede aktive Kompetenz aus:

- Qualitätsstandard 0.21,
- Förderziel und Lehrplanbereich,
- alle sechs Lernphasen mit produktiven Typkennungen,
- drei Stufen und Darstellungen,
- Fehlvorstellungen und Remediation,
- zugeordnete Tests einschließlich des Konvergenztests.

### Eindeutige Aufgaben

Für Zerlegen und Zusammensetzen wurden zusätzliche stellenwertbezogene Distraktoren ergänzt. Sie dienen nur als geprüfte Alternativen, wenn Zifferngleichheit andere Fehlermodelle identisch macht. Aufgaben mit weniger als einer eindeutigen richtigen und zwei unterschiedlichen falschen Optionen werden weiterhin nicht ausgeliefert.

## Automatisierte Konvergenz

`src/domain/curricularConvergence.test.ts` prüft alle 34 aktiven Kompetenzen in allen sechs Lernphasen über je 1.000 Seeds. Das sind 204.000 deterministische Varianten. Für jede Variante werden mindestens geprüft:

- Lernphase und Lernhandlung stimmen mit dem Katalog überein,
- produktive Typkennung gehört zur Kompetenz und Phase,
- Remediation ist vorhanden,
- bekannte und unbekannte Darstellungsrollen überschneiden sich nicht,
- vor der Lösung existieren keine aufgedeckten Werte,
- Auswahloptionen sind eindeutig und enthalten genau eine Lösung.

Die vorhandenen mathematischen, fachfamilienspezifischen, Komponenten-, Persistenz- und Runtimeprüfungen bleiben zusätzlich bestehen. Ältere Tests wurden auf explizite Lernphasen umgestellt, wenn sie eine bestimmte mathematische Handlung prüfen.

## Didaktische Bewertung

**Mathematische Korrektheit:** Die bestehenden fachfamilienspezifischen Invarianten bleiben erhalten. 0.30 verändert keine Lösungslogik und keinen Zahlenraum.

**Lernhandlungen:** Jede aktive Kompetenz besitzt sechs unterschiedliche katalogisierte Typkennungen und sechs unterschiedliche Phasenziele. Dies belegt strukturelle Unterscheidbarkeit, aber noch keine empirische Förderwirkung.

**Darstellungen:** Alle erzeugten Darstellungen führen bekannte, unbekannte und aufgedeckte Werte explizit. Aufgedeckte Werte bleiben bis zur erfolgreichen Bearbeitung leer. Die detaillierten fachlichen Regeln stehen in `docs/representation-policy.md`.

**Fehlvorstellungen und Remediation:** Jede aktive Kompetenz besitzt katalogisierte Fehlvorstellungsrouten und eine produktive Remediation. Die App bietet passende Strategien an, behauptet aber keine sichere Diagnose.

**Transfer und Adaptivität:** Transfer ist für jede Kompetenz ein eigener Laufzeittyp. Adaptive Wiederholung reduziert Schwierigkeit und Lernphase gemeinsam und vermeidet die unmittelbar identische Variante.

## Verbleibende Risiken

- Eine Lehrkraft hat das zusammenhängende Curriculum noch nicht geprüft.
- Es liegt keine Unterrichtserprobung und keine Aussage zur pädagogischen Wirksamkeit vor.
- Ein echter Test auf einem iPhone 13 mini ist weiterhin offen; WebKit ist nur eine Mobile-Safari-Näherung.
- Die Generatoren wählen pro Lernphase aktuell jeweils einen katalogisierten Haupttyp. Fachlich sinnvolle Untervarianten werden über Unterkompetenzen und Variantendaten unterschieden; mehrere alternative Haupttypen pro Phase wären eine spätere, begründungspflichtige Erweiterung.
- Der unabhängige Remote-Katalogkanal bleibt bewusst nachgelagert.

## Releaseabnahme

Am 18. Juli 2026 wurden erfolgreich ausgeführt:

- `npm run catalog:check` und `npm run curriculum:check`,
- `npm run typecheck` und `npm run lint`,
- `npm test`: 427 bestandene Unit- und Komponententests,
- `npm run build`: erfolgreicher Produktions- und PWA-Build mit 12 Precache-Einträgen,
- `npm run test:e2e`: 19 bestandene Chromium-/WebKit-Szenarien,
- `docker build --platform linux/amd64`: erfolgreiches Image `sha256:ec93c762a626e2fe8123999c9b61ef570ff83c625c5bbe39ed30435b0eed7ff3`,
- Read-only-Start als UID 101 mit `/tmp` als einzigem tmpfs, ohne Capabilities und mit `no-new-privileges`,
- erfolgreicher Healthcheck und Abruf von Einstieg, Manifest, Service Worker und Katalog mit passenden MIME-, Cache- und Security-Headern,
- `npm run test:e2e:container`: erneut 19 bestandene Szenarien gegen das finale Image auf `127.0.0.1:8090`.

Docker Compose hat `deploy/compose.yaml` erfolgreich validiert. Podman war nicht installiert und wurde deshalb nicht als ausgeführt dokumentiert. Es lief nach der Abnahme kein Testcontainer weiter.
