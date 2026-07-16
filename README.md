# Mathe-Reise

Mathe-Reise ist eine mobile, deutschsprachige Mathematik-Förderapp für Kinder am Ende der dritten Klasse. Die App läuft vollständig im Browser, speichert Profil und Lernstand ausschließlich lokal und kann nach der ersten Initialisierung als PWA offline verwendet werden.

## MVP-Funktionen

- Optionales lokales Onboarding mit frei wählbarem Spitznamen
- Vollständige Mathe-Runden mit sieben Aufgaben und höchstens drei gezielten Wiederholungen
- Adaptive Addition und Subtraktion bis 20 sowie reihenspezifisches Einmaleins und Division ohne Rest
- Stellenwerte bis 1000, Zerlegen und Zusammensetzen von Zahlen
- Nachbarzehner, Nachbarhunderter sowie Runden auf Zehner und Hunderter
- Additions-, Subtraktions- und Ergänzungsstrategien bis 1000 mit geprüftem Zwischenschritt, Stellenwerttafel oder Rechenstrich
- Geführte ein- und zweischrittige Sachaufgaben mit sieben Mengenbeziehungen und Raster-Symmetrie ohne Drag-and-drop
- Geldbeträge in Euro und Cent mit lokaler Münzdarstellung sowie Wechselgeld aus 10 Euro
- Längen in Zentimetern und Metern mit Messstrecke, Umrechnung und einfachen Rechnungen
- Drei inhaltlich wirksame Stufen mit sichtbarer, abrufbarer oder entfallender Darstellung
- Zwei Hilfestufen, konkretes Fehlerfeedback und eine schrittweise Erklärung nach wiederholten Fehlern
- Lokaler Lernstand mit einfacher adaptiver Aufgabenauswahl
- Installierbare PWA mit vollständig vorgehaltenen MVP-Ressourcen
- OCI-Container mit unprivilegiertem Nginx, Healthcheck und passenden Cache-Regeln

Nicht Bestandteil dieses MVP sind vollständige schriftliche Verfahren, mehrere gleichzeitige Stellenübergänge, Millimeter/Kilometer, komplexe Kaufsituationen, Elternbereich, PIN, Backup, Körperansichten, Würfelkippen und Falten. Dafür existieren keine sichtbaren Attrappen.

## Voraussetzungen

- Node.js 24 oder neuer
- npm (im Lockfile wurde npm 11 verwendet)
- Für E2E-Tests: Playwright Chromium
- Optional: Docker oder Podman für das Container-Image

Entwickelt und geprüft wurde mit Node.js `v24.14.0` und npm `11.18.0`. Die Datei `.nvmrc` legt nur den unterstützten Major-Release fest, keinen Patchstand.

## Lokale Entwicklung

```bash
npm ci
npm run dev
```

Vite zeigt die lokale URL beim Start an, standardmäßig `http://localhost:5173`.

## Qualitätsprüfungen

```bash
npm run typecheck
npm run lint
npm test
npm run catalog:check
npm run build
```

Die Unit- und Komponententests prüfen Generatoren, fachliche Grenzen, Lernstandsregeln, Adaptivität, IndexedDB-Persistenz, Onboarding, Hilfen und Feedback.

Bei Pull Requests und Pushes auf `main` führt `.github/workflows/ci.yml` dieselben Qualitätsbefehle mit Node.js 24 aus. Separate, bewusst kleine Jobs prüfen Chromium-E2E und den Container-Build ohne Registry-Publish.

Für die Browser-Tests wird Chromium einmalig installiert:

```bash
npx playwright install chromium
npm run test:e2e
```

Die E2E-Suite verwendet den Produktionsbuild über Vite Preview und prüft eine vollständige Runde bei `375 x 812`, Landscape bei `812 x 375`, horizontales Overflow, Konsolenfehler, Reload, Offline-Neustart und eine vollständige Offline-Runde.

## Produktionsbuild

```bash
npm run build
npm run preview
```

Der statische Build liegt in `dist/`. Für ein statisches Deployment muss die Anwendung unter HTTPS ausgeliefert werden, damit Service Worker und PWA-Installation außerhalb von `localhost` funktionieren. Alle Routen benötigen einen SPA-Fallback auf `index.html`.

## Versionierter Aufgabenkatalog

Die einzige fachlich zu pflegende Quelle ist `content/catalogs/nrw-klasse3-foerderkern/catalog.json`. Daraus erzeugt `npm run catalog:build` deterministisch den öffentlichen Katalog `public/content/task-catalog.json` und den eingebetteten Fallback `src/content/task-catalog.fallback.json`. Der Katalog enthält:

- Katalogversion und Zahlenraum `0..1000`
- alle Kompetenz-IDs, Anzeigenamen und Lehrplanbereiche
- Förderziele, Prozesskompetenzen, Vorkenntnisse und typische Fehlvorstellungen
- sechs Lernphasen, drei konkret beschriebene Schwierigkeitsstufen und zulässige Darstellungen
- zwei Hinweise, gearbeitetes Beispiel, Erklärung, strukturierte Remediation und Transferimpuls
- überprüfbare Erfolgskriterien, produktive Größenkompetenzen für Geld und Längen sowie eine deaktivierte Vorbereitung für Raumvorstellung
- kompetenzbezogene Erfolgs- und Fehlertexte sowie Release-Status
- strukturierte Sachaufgabenvorlagen mit Mengenbeziehung, vorlagenspezifischen Fragen, Modell, unwichtiger Angabe und Plausibilitätsprüfung
- explizite 3x3-, 4x4- und 5x5-Vorlagen für Symmetrieaufgaben

Die Metadaten trennen `schemaVersion` (technische Struktur), `catalogVersion` (fachlicher Inhalt), `catalogId`, `releasedAt` und den Status `draft`, `ready-for-review`, `active` oder `disabled`. Der Gesamtkatalog steht auf `ready-for-review`; technisch, mathematisch und intern didaktisch geprüfte Laufzeitkompetenzen stehen auf `active`. Das ist keine dokumentierte Freigabe durch eine Lehrkraft.

Die Rechenlogik bleibt bewusst in TypeScript: Zufallsgeneratoren, Addition/Subtraktion, Multiplikation/Division, Stellenwertberechnung, Nachbarzahlen, Rundung, Spiegelung, Distraktorprüfung, Lösungsprüfung, Sitzungsplanung und Adaptivität stehen weiterhin unter `src/domain/`. Der JSON-Katalog enthält keine ausführbare Logik.

Beim Start lädt `src/content/catalog.ts` den öffentlichen Katalog und prüft ihn mit einer kleinen TypeScript-Validierung. Geprüft werden unter anderem Metadaten, bekannte und vollständige Skill-IDs, Pflichttexte, Hilfen, Wertebereiche, lösbare Sachaufgaben und unterscheidbare Symmetrievarianten. Ist die Datei nicht erreichbar oder fachlich strukturell ungültig, verwendet die App den gebündelten, getesteten Letztstand. Ein ungültiger Austausch-Katalog verhindert daher den App-Start nicht.

Der Produktionsbuild scheitert bei einem ungültigen Katalog, `draft`/`disabled` als Gesamtstatus oder abweichenden Artefakten. Die vollständigen Versions-, Release-, Update- und Rollbackregeln stehen in [docs/catalog-management.md](docs/catalog-management.md). Das aktuelle Gesamtmodell und alle Kompetenzwege stehen unter [docs/didactics/](docs/didactics/README.md); die tatsächliche Runtime-Wirkung ist in [docs/didactic-catalog-review.md](docs/didactic-catalog-review.md) abgeglichen. Neue Inhalte werden zusätzlich mit der [didaktischen Review-Checkliste](docs/didaktische-review-checkliste.md) und der PR-Vorlage geprüft.

## Container

Das Multi-Stage-Image baut die App mit Node.js 24 und liefert anschließend nur die statischen Dateien über einen unprivilegierten Nginx auf Port `8080` aus. Die Runtime enthält kein Node.js.

```bash
docker build -t mathe-reise:local .
docker run --rm --name mathe-reise -p 8080:8080 mathe-reise:local
```

Prüfung:

```bash
curl --fail http://127.0.0.1:8080/healthz
curl --fail http://127.0.0.1:8080/
curl --fail http://127.0.0.1:8080/manifest.webmanifest
curl --fail http://127.0.0.1:8080/sw.js
curl --fail http://127.0.0.1:8080/content/task-catalog.json
npm run test:e2e:container
```

Podman verwendet dieselben OCI-Artefakte:

```bash
podman build -t mathe-reise:local .
podman run --rm -p 8080:8080 mathe-reise:local
```

Podman war in der Entwicklungsumgebung nicht installiert; diese beiden Befehle wurden daher nicht ausgeführt.

## GHCR und Podman Compose

Versionierte Multi-Arch-Release-Images für `linux/amd64` und `linux/arm64` werden unter `ghcr.io/hackepeter87/nachhilfe` veröffentlicht. Das Compose-Deployment pinnt ein konkretes Release und bindet die App nur an die lokale Reverse-Proxy-Schnittstelle:

```bash
podman pull ghcr.io/hackepeter87/nachhilfe:0.8.0
podman compose -f deploy/compose.yaml up -d
```

Voraussetzungen, GHCR-Sichtbarkeit, Read-only-Rootfs, Start, Update, Rollback, Reverse Proxy und PWA-Cache-Verhalten stehen in [docs/deployment-podman.md](docs/deployment-podman.md).

## Reverse Proxy und Caching

Der Reverse Proxy muss HTTPS terminieren, WebSocket-Unterstützung ist nicht erforderlich. Die Anwendung wird am URL-Pfad `/` erwartet. Weitergeleitete Requests gehen an Container-Port `8080`; `/healthz` kann für Bereitschaftsprüfungen verwendet werden.

Die mitgelieferte Nginx-Konfiguration setzt folgende Regeln:

- Hash-basierte Dateien unter `/assets/`: ein Jahr und `immutable`
- `/sw.js`: keine Speicherung, immer neu validieren
- `/manifest.webmanifest` und `/index.html`: keine dauerhafte Speicherung, immer neu validieren
- `/content/task-catalog.json`: JSON-MIME-Typ und kontrollierte Revalidierung
- Andere Routen: SPA-Fallback und Revalidierung

Zusätzlich werden `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` und `X-Frame-Options: DENY` auf allen Antworten gesetzt.

Diese Regeln sollten bei einem anderen statischen Host oder vorgeschalteten CDN beibehalten werden. Insbesondere darf `sw.js` niemals mit einer langfristigen Immutable-Regel ausgeliefert werden.

## iOS-Installation und Offline-Test

1. Mathe-Reise in Safari öffnen.
2. Auf **Teilen** tippen.
3. **Zum Home-Bildschirm** auswählen und bestätigen.
4. Die installierte App einmal online starten und warten, bis **Offline bereit** angezeigt wird.
5. Die App schließen, Flugmodus einschalten und sie über das Home-Bildschirm-Symbol erneut öffnen.
6. Eine vollständige Runde abschließen, die App schließen und erneut öffnen. Begrüßung, Rundenzahl und Lernstand müssen erhalten bleiben.

Die Offline- und Mobilabläufe wurden automatisiert mit Playwright geprüft. Ein Test auf einem echten iPhone 13 mini wurde nicht durchgeführt und bleibt eine manuelle Release-Abnahme.

**Offline bereit** wird erst angezeigt, wenn `verifyOfflineReadiness()` einen aktivierten Service Worker, schreib- und lesbare IndexedDB, die zentralen Ressourcen im Cache, eine lokal erzeugte und geprüfte Beispielaufgabe sowie eine Schreib-/Leseprobe im Lernstands-Store bestätigt. Eine fehlgeschlagene Teilprüfung lässt die Anzeige auf **Offline wird vorbereitet**; es werden keine Diagnosedaten übertragen oder dauerhaft gespeichert.

## Daten und Adaptivität

Profil, Einstellungen, Kompetenzstände und abgeschlossene Sitzungen liegen versioniert in nativer IndexedDB. Neue Sitzungen speichern App-, Katalog- und Schemaversion. Alte Sitzungen bleiben erhalten und werden beim Lesen ehrlich mit `unknown` beziehungsweise Schema `0` gekennzeichnet. Es gibt kein Backend, Tracking, Werbung oder externe Laufzeit-API.

Die heuristischen Lernstandsregeln stehen zentral in `src/domain/progress.ts`: richtig ohne Hilfe `+12`, richtig mit Hilfe `+6`, falsch `-10`, begrenzt auf `0..100`. Der Status `secure` erfordert mindestens fünf Versuche und einen Lernwert von mindestens 80. Niedrige Lernwerte, kürzliche Fehler und lange nicht geübte Kompetenzen erhöhen das Auswahlgewicht. Für Grundrechenarten werden nur didaktisch wirksame Unterkompetenzen getrennt geführt, etwa Zehnerübergang, konkrete Einmaleinsreihe oder passender Divisor. Die Lernphase steuert die tatsächlich erzeugte Schwierigkeit und Hilfsdarstellung: Aktivieren, Verstehen und geführtes Üben beginnen auf Stufe 1, selbstständiges Üben nutzt Stufe 2, Automatisieren und Transfer Stufe 3. Diese Regeln sind anpassbare Produktheuristiken und kein wissenschaftlich validiertes Diagnosemodell.

## Release-Stand 0.8.0

Der vertikale MVP umfasst Onboarding, Startseite, vollständige adaptive Runde, alle oben genannten Aufgabenfamilien, lokale Persistenz, PWA/Offline-Betrieb, automatisierte Tests und das OCI-Image `mathe-reise:local`. Version 0.8.0 aktiviert Geld und Längen mit jeweils drei wirksamen Schwierigkeitsstufen und eigenen Darstellungen. Die offene externe Abnahme ist in [docs/validation-0.6.md](docs/validation-0.6.md) dokumentiert. Details stehen in [RELEASE_NOTES.md](RELEASE_NOTES.md).
