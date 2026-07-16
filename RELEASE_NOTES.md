# Mathe-Reise

## Didaktische Vertiefung 0.2.0

- Alle 16 produktiven Kompetenzen besitzen dokumentierte Vorkenntnisse, drei konkrete Stufen, Hilfen, Remediation, Transfer und Ausbaugrenzen.
- Stufe 1 zeigt mathematisch relevante Darstellungen, Stufe 2 bietet sie als Hilfe an und Stufe 3 erhöht Denkschritte sowie Selbstständigkeit.
- Grundaufgaben werden nach Lernstand ausgewählt; Zehnerübergänge, konkrete Einmaleinsreihen und passende Divisoren werden als kleine Unterkompetenzen berücksichtigt.
- Auswahlaufgaben liefern genau drei eindeutige, fachlich motivierte Optionen. Identische oder nicht plausible Distraktoren werden nicht ausgeliefert.
- Sachaufgaben decken Hinzufügen, Wegnehmen, Zusammenfassen, Vergleichen, Ergänzen und gleich große Gruppen ab. Höhere Stufen ergänzen Frageerkennung, Modellauswahl, unwichtige Angaben und Plausibilitätsprüfung.
- Addition und Subtraktion bis 1000 sowie Ergänzen zum nächsten Zehner oder Hunderter sind als getrennte erste Strategiegeneratoren umgesetzt. Vollständige schriftliche Verfahren bleiben offen.
- Symmetrie verwendet je Stufe 3×3-, 4×4- oder 5×5-Raster; Stufe 3 wechselt zwischen senkrechter und waagerechter Achse.
- Der JSON-Katalog enthält zusätzliche didaktische Metadaten und beziehungsspezifische Hilfen. Öffentlicher Katalog und geprüfter Fallback nutzen dasselbe Schema.
- Die didaktische Review-Checkliste verlangt weiterhin eine menschliche fachliche Prüfung neuer Inhalte; eine Prüfung durch eine Lehrkraft wurde für dieses Release nicht durchgeführt.

Lokal erfolgreich ausgeführt wurden Typecheck, Lint, 87 Unit-/Komponententests in 8 Dateien, Produktionsbuild, 2 Playwright-Szenarien gegen Vite Preview sowie gegen den Container und `docker build -t mathe-reise:local .`. Das Image läuft als UID 101, trägt das OCI-Versionslabel `0.2.0`, meldet `healthy` und liefert Einstieg, Manifest, Service Worker und JSON-Katalog mit passenden MIME- und Cache-Headern. Ein echter iPhone-Test und eine Prüfung durch eine Lehrkraft wurden nicht durchgeführt. Podman ist in der Arbeitsumgebung nicht installiert und wurde nicht als getestet ausgewiesen.

## Review-Nacharbeiten 0.1.1

- Rundungsoptionen sind strikt auf den Zahlenraum `0..1000` begrenzt.
- Die Grenzfälle `995 -> 1000` und `950 -> 1000` sind direkt und parametrisch getestet.
- Halbpunkte erklären gleiche Abstände und die Grundschulregel zum Aufrunden ausdrücklich.
- `verifyOfflineReadiness()` prüft Service Worker, IndexedDB-Roundtrip, zentrale Cache-Ressourcen, lokale Aufgabenerzeugung samt Lösungsprüfung und den Lernstands-Store.
- Fachliche Texte, Labels, Förderbereiche, Fehlvorstellungen, Hilfen, Sachaufgaben und Symmetrievorlagen liegen im versionierten JSON-Katalog.
- Eine kleine TypeScript-Validierung lehnt ungültige Kataloge ab; die App verwendet dann den gebündelten geprüften JSON-Fallback.
- GitHub Actions prüft Pull Requests und Pushes auf `main` mit Node.js 24, Unit-/Komponententests, Build, Playwright und Container-Build ohne Publish.

Lokal erfolgreich ausgeführt wurden Typecheck, Lint, 61 Unit-/Komponententests in 8 Dateien, Produktionsbuild, 2 Playwright-Szenarien gegen Vite Preview und gegen den Container sowie der Docker-Build `mathe-reise:local`. Das Image läuft als UID 101, meldet `healthy` und liefert Einstiegspunkt, Manifest, Service Worker und JSON-Katalog mit passenden MIME- und Cache-Headern. Ein echter iPhone-Test bleibt eine manuelle Abnahme und wird nicht als durchgeführt ausgewiesen.

## MVP 0.1.0

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
