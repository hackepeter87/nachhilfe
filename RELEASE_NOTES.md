# Mathe-Reise 0.1.0

## Lieferumfang

- Mobile deutschsprachige Oberfläche mit lokalem Onboarding und kindgerechter Startseite
- Vollständige Mathe-Runde aus Grundrechnen, adaptiven Zahlenraumaufgaben, geführter Sachaufgabe, Symmetrie und Selbsteinschätzung
- Deterministische, React-unabhängige Aufgabengeneratoren und Lösungsprüfung
- Freundliches Fehlerfeedback, zwei Hilfestufen und schrittweise Auflösung
- Versionierter lokaler Lernstand in IndexedDB mit dokumentierter adaptiver Heuristik
- Installierbare PWA mit vollständigem Precache und kontrollierter Aktualisierung
- Unprivilegiertes OCI-Runtime-Image auf Port 8080 mit Healthcheck, SPA-Fallback und differenzierten Cache-Regeln

## Abnahme

Lokal erfolgreich ausgeführt:

- `npm run typecheck`
- `npm run lint`
- `npm test` (36 Tests in 6 Dateien)
- `npm run build`
- `npm run test:e2e` (2 Playwright-Tests)
- `docker build -t mathe-reise:local .`
- Container-Start und gesunder Docker-Healthcheck
- Abruf von Startseite, Manifest, Service Worker und Healthcheck
- `npm run test:e2e:container` (2 Playwright-Tests inklusive Offline-Runde)

Alle genannten Prüfungen wurden vor dem GitHub-Abschluss erneut erfolgreich ausgeführt. Ein echter iPhone-Test und ein Podman-Lauf waren in der Arbeitsumgebung nicht möglich und werden nicht als bestanden ausgewiesen.

## Bewusst verschoben

Schriftliche Addition und Subtraktion, Geld, Längen, Elternbereich, PIN, Backup, Körperansichten, Würfelkippen und Falten sind nicht Teil dieses Releases.
