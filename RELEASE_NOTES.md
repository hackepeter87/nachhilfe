# Mathe-Reise

## Didaktische Qualitätsoffensive 0.5.0

- Katalogschema 4 führt die einheitlichen Status `draft`, `ready-for-review`, `active` und `disabled`, sechs Lernphasen, Erfolgskriterien und strukturierte Remediation ein.
- Der Lernstand speichert die aktuelle Lernphase; neue, im Aufbau befindliche, fällige, sichere und lange nicht geprüfte Inhalte werden als nachvollziehbare Wiederholungszustände abgeleitet.
- Nach zwei Fehlern folgen konkrete Erklärung und eine leichtere verwandte beziehungsweise grundlegende Folgeaufgabe.
- Stellenwert Stufe 3 trennt Ziffer und Stellenwert in zwei prüfbare Schritte. Runden Stufe 2 bestimmt Nachbarzahlen und Ergebnis; Stufe 3 ergänzt eine Abstandsbegründung einschließlich Halbpunkt.
- Sachrechnen ergänzt gleichmäßiges Verteilen als Division ohne Rest und führt nun über sieben Mengenbeziehungen.
- Geld, Längen und Raumvorstellung sind methodisch im Katalog und in der Dokumentation vorbereitet, bleiben aber `disabled` und unsichtbar.
- Das didaktische Gesamtmodell, 14 Themenpfade und ein einziges Lehrkraft-Review-Paket liegen unter `docs/didactics/`.

Der Gesamtkatalog steht auf `ready-for-review`, alle tatsächlich produktiven Kompetenzen auf `active`. Das bedeutet interne technische, mathematische und didaktische Konsistenz, nicht die Freigabe durch eine Lehrkraft. Ein echter iPhone-Test wurde nicht durchgeführt.

Erfolgreich geprüft wurden Katalogabgleich, Typecheck, Lint, 129 Unit-/Komponententests, Produktionsbuild, Compose-Konfiguration sowie zwei Playwright-Szenarien gegen Vite Preview und gegen den Container. Die vollständige Runde lief bei `375 x 812` nach Reload und Offline-Neustart bis zum Abschluss; Landscape `812 x 375` blieb ohne horizontales Overflow. Das OCI-Image läuft als UID 101 mit Read-only-Rootfs, nur `/tmp` als tmpfs, ohne Capabilities und meldet `healthy`. Es ist öffentlich als Multi-Arch-Image für `linux/amd64` und `linux/arm64` unter `ghcr.io/hackepeter87/nachhilfe:0.5.0` und `latest` mit Manifest-Digest `sha256:0d820f63d1c6c3002c03219e2e8376dddc9e1bae4f580bd127dce4a95483e745` veröffentlicht; beide Plattformvarianten wurden unter den Read-only-Sicherheitsbedingungen gestartet und meldeten `healthy`. Das Revisionslabel `workspace-dirty-2eefd15` kennzeichnet transparent, dass das direkt veröffentlichte Image aus dem noch nicht committen Arbeitsbaum gebaut wurde. Podman war nicht installiert und wurde nicht als ausgeführt behauptet.

## Didaktische Katalogkonsistenz 0.4.0

- Katalogschema 3 klassifiziert didaktische Felder als `runtime`, `review` oder `planned`; abstrakte `cognitiveSteps` wurden durch konkrete Anforderungen ersetzt.
- Erfolgsfeedback bestätigt nur beobachtbare Ergebnisse oder Auswahlen. Nicht abgefragte Zerlegungs-, Ergänzungs- oder Stellenwertstrategien werden nicht mehr gelobt.
- Sachaufgaben führen über die Mengenbeziehung zur Rechenart. Jede Vorlage besitzt eigene mathematische Alternativfragen und eine situationsbezogene Plausibilitätsprüfung mit genau einer richtigen Aussage.
- Wertebereiche von Addition, Einmaleins, Division, Stellenwert, Nachbarhundertern und Rundung wurden mit den Generatoren synchronisiert.
- Stellenwert, Zerlegen und Zusammensetzen fragen Nullstellen als Platzhalter auf den höheren Stufen tatsächlich ab.
- Symmetrie verwendet explizite, validierte 3x3-, 4x4- und 5x5-Vorlagen statt periodisch vergrößerter Raster.
- Rechenstriche können echte, lückenlose Vorwärts- und Rückwärtssprünge mit mathematisch geprüften Beschriftungen darstellen.
- Der neue Runtime-Abgleich dokumentiert für alle produktiven Typen Interaktion, beobachtbare Lernhandlung, Stufen und Grenzen.
- Browser-Favicon, Apple-Touch-Icon sowie PWA-Icons wurden aus einer vollflächigen Mastergrafik ohne schwarze Eckartefakte neu erzeugt.

Der Katalogstatus und alle technisch aktiven Kompetenzen stehen auf `review`. Eine Freigabe durch eine Lehrkraft und ein Test auf einem echten iPhone wurden nicht durchgeführt.

Erfolgreich geprüft wurden Katalogabgleich, Typecheck, Lint, 120 Unit-/Komponententests, Produktionsbuild sowie zwei Playwright-Szenarien mit vollständiger Offline-Runde bei `375 x 812` und Landscape-Prüfung bei `812 x 375`. Das OCI-Image wurde als `mathe-reise:0.4.0` und `mathe-reise:local` gebaut. Es läuft als UID 101 mit Read-only-Rootfs, ausschließlich `/tmp` als tmpfs, ohne Capabilities und mit `no-new-privileges`, meldet `healthy` und bestand dieselbe Offline-E2E-Suite. Katalog, Manifest, Service Worker und Icons wurden mit den vorgesehenen MIME-, Cache- und Security-Headern abgerufen.

## GHCR- und Podman-Deployment 0.3.0

- Ein eigener Workflow veröffentlicht Git-Tags `vX.Y.Z` nach `ghcr.io/hackepeter87/nachhilfe` und erzeugt SemVer-, SHA- sowie kontrollierte `latest`-Tags.
- Dynamische OCI-Labels ersetzen die zuvor im Dockerfile fest eingetragene Versionsnummer.
- `deploy/compose.yaml` pinnt Version `0.3.0`, bindet nur an `127.0.0.1:8080` und benötigt weder Umgebungsvariablen noch Volumes.
- Der Container läuft mit schreibgeschütztem Root-Dateisystem, nur `/tmp` als tmpfs, ohne Capabilities und mit `no-new-privileges`.
- CI prüft Compose-Syntax, Read-only-Start, Healthcheck, zentrale PWA-Ressourcen sowie Security- und Cache-Header.
- Die Deployment-Dokumentation beschreibt GHCR-Sichtbarkeit, Betrieb, Reverse Proxy, HTTPS, Update, Rollback und den Tag-basierten Releaseprozess.

Podman war in der Entwicklungsumgebung nicht installiert und wird nicht als lokal getestet ausgewiesen. Ein GitHub Release wird durch den Publish-Workflow nicht automatisch erstellt.

Lokal erfolgreich geprüft wurden Compose-Parsing und -Start mit Docker Compose, Read-only-Rootfs mit ausschließlich `/tmp` als tmpfs, UID 101, vollständiger Capability-Drop, `no-new-privileges`, Healthcheck, alle zentralen PWA-Ressourcen, Security-/Cache-Header sowie die vollständige Offline-E2E-Suite gegen den gehärteten Container. Podman-Befehle sind dokumentiert, aber mangels lokaler Podman-Installation nicht ausgeführt.

## Katalog-Releases 0.3.0

- Schema- und Inhaltsversion sind als `schemaVersion: 2` und `catalogVersion: 0.2.0` getrennt; Katalog-ID, Veröffentlichungsdatum und Freigabestatus werden validiert.
- Eine zentrale fachliche Quelldatei erzeugt den öffentlichen Katalog und den eingebetteten Fallback deterministisch. Abweichungen und `draft`-Kataloge stoppen den Produktionsbuild.
- Sitzungspläne und abgeschlossene Sitzungen speichern App-, Katalog- und Schemaversion. Alte Sitzungen bleiben lesbar und werden ohne unbelegte Versionsannahme als `unknown` gekennzeichnet.
- Eine laufende Runde bleibt an ihren Katalog-Snapshot gebunden. Ein wartendes PWA-Update kann erst nach der Runde auf der Startseite aktiviert werden.
- Die technische Versionsanzeige nennt App-Version, Katalog-ID, Katalogversion, Schema und Status, ohne den Kinderbereich damit zu belasten.
- Die PR-Vorlage und `docs/catalog-management.md` beschreiben Versionsregeln, didaktische Prüfung, Release, Cache-Verhalten und verlustfreien Container-Rollback.
- Ein unabhängiger Remote-Katalogkanal bleibt bewusst offen und ist in GitHub Issue #38 beschrieben.

Der Katalogstatus ist `review`. Eine fachliche Freigabe durch eine Lehrkraft und ein Test auf einem echten iPhone wurden nicht durchgeführt.

Lokal erfolgreich ausgeführt wurden Katalogabgleich, Typecheck, Lint, 107 Unit-/Komponententests in 9 Dateien, Produktionsbuild, 2 Playwright-Szenarien gegen Vite Preview sowie gegen den Container und der Docker-Build mit den Tags `mathe-reise:0.3.0` und `mathe-reise:local`. Das Image läuft als UID 101, trägt das OCI-Versionslabel `0.3.0`, meldet `healthy` und liefert Katalog, Manifest und Service Worker mit den vorgesehenen MIME- und Cache-Headern aus.

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
