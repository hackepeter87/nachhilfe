# Mathe-Reise

Mathe-Reise ist eine mobile, deutschsprachige Mathematik-Förderapp für Kinder am Ende der dritten Klasse. Die App läuft vollständig im Browser, speichert Profil und Lernstand ausschließlich lokal und kann nach der ersten Initialisierung als PWA offline verwendet werden.

## MVP-Funktionen

- Optionales lokales Onboarding mit frei wählbarem Spitznamen
- Vollständige Mathe-Runden mit sieben Aufgaben und höchstens drei gezielten Wiederholungen
- Addition und Subtraktion bis 20, Einmaleins und Division ohne Rest
- Stellenwerte bis 1000, Zerlegen und Zusammensetzen von Zahlen
- Nachbarzehner, Nachbarhunderter sowie Runden auf Zehner und Hunderter
- Geführte Sachaufgaben in vier Schritten und Raster-Symmetrie ohne Drag-and-drop
- Zwei Hilfestufen, konkretes Fehlerfeedback und eine schrittweise Erklärung nach wiederholten Fehlern
- Lokaler Lernstand mit einfacher adaptiver Aufgabenauswahl
- Installierbare PWA mit vollständig vorgehaltenen MVP-Ressourcen
- OCI-Container mit unprivilegiertem Nginx, Healthcheck und passenden Cache-Regeln

Nicht Bestandteil dieses MVP sind schriftliche Addition und Subtraktion, Geld, Längen, Elternbereich, PIN, Backup, Körperansichten, Würfelkippen und Falten. Dafür existieren keine sichtbaren Attrappen.

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
npm run build
```

Die Unit- und Komponententests prüfen Generatoren, fachliche Grenzen, Lernstandsregeln, Adaptivität, IndexedDB-Persistenz, Onboarding, Hilfen und Feedback.

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
npm run test:e2e:container
```

Podman verwendet dieselben OCI-Artefakte:

```bash
podman build -t mathe-reise:local .
podman run --rm -p 8080:8080 mathe-reise:local
```

Podman war in der Entwicklungsumgebung nicht installiert; diese beiden Befehle wurden daher nicht ausgeführt.

## Reverse Proxy und Caching

Der Reverse Proxy muss HTTPS terminieren, WebSocket-Unterstützung ist nicht erforderlich. Die Anwendung wird am URL-Pfad `/` erwartet. Weitergeleitete Requests gehen an Container-Port `8080`; `/healthz` kann für Bereitschaftsprüfungen verwendet werden.

Die mitgelieferte Nginx-Konfiguration setzt folgende Regeln:

- Hash-basierte Dateien unter `/assets/`: ein Jahr und `immutable`
- `/sw.js`: keine Speicherung, immer neu validieren
- `/manifest.webmanifest` und `/index.html`: keine dauerhafte Speicherung, immer neu validieren
- Andere Routen: SPA-Fallback und Revalidierung

Diese Regeln sollten bei einem anderen statischen Host oder vorgeschalteten CDN beibehalten werden. Insbesondere darf `sw.js` niemals mit einer langfristigen Immutable-Regel ausgeliefert werden.

## iOS-Installation und Offline-Test

1. Mathe-Reise in Safari öffnen.
2. Auf **Teilen** tippen.
3. **Zum Home-Bildschirm** auswählen und bestätigen.
4. Die installierte App einmal online starten und warten, bis **Offline bereit** angezeigt wird.
5. Die App schließen, Flugmodus einschalten und sie über das Home-Bildschirm-Symbol erneut öffnen.
6. Eine vollständige Runde abschließen, die App schließen und erneut öffnen. Begrüßung, Rundenzahl und Lernstand müssen erhalten bleiben.

Die Offline- und Mobilabläufe wurden automatisiert mit Playwright geprüft. Ein Test auf einem echten iPhone 13 mini wurde nicht durchgeführt und bleibt eine manuelle Release-Abnahme.

## Daten und Adaptivität

Profil, Einstellungen, Kompetenzstände und abgeschlossene Sitzungen liegen versioniert in nativer IndexedDB. Es gibt kein Backend, Tracking, Werbung oder externe Laufzeit-API.

Die heuristischen Lernstandsregeln stehen zentral in `src/domain/progress.ts`: richtig ohne Hilfe `+12`, richtig mit Hilfe `+6`, falsch `-10`, begrenzt auf `0..100`. Der Status `secure` erfordert mindestens fünf Versuche und einen Lernwert von mindestens 80. Niedrige Lernwerte, kürzliche Fehler und lange nicht geübte Kompetenzen erhöhen das Auswahlgewicht. Diese Regeln sind anpassbare Produktheuristiken und kein wissenschaftlich validiertes Diagnosemodell.

## Release-Stand 0.1.0

Der vertikale MVP umfasst Onboarding, Startseite, vollständige adaptive Runde, alle oben genannten Aufgabenfamilien, lokale Persistenz, PWA/Offline-Betrieb, automatisierte Tests und das OCI-Image `mathe-reise:local`. Details zu ausgeführten Prüfungen und bewusst verschobenen Funktionen stehen in [RELEASE_NOTES.md](RELEASE_NOTES.md).
