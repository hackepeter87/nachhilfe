# Mathe-Reise

## AMD64-Containerrelease 0.10.1

- Der GHCR-Publish-Workflow baut neue Release-Images ausschließlich für die tatsächliche DMZ-Zielarchitektur `linux/amd64`.
- `deploy/compose.yaml` pinnt `0.10.1` und deklariert `platform: linux/amd64`, damit ein unpassender Host nicht stillschweigend per Emulation betrieben wird.
- README und Podman-Dokumentation beschreiben Architekturprüfung, Pull, Update und Rollback konsistent. Historische Registry-Tags und ihre vorhandenen Manifeste bleiben unverändert.
- Der fachliche Katalog bleibt unverändert bei Version `0.8.0` und Schema `7`; Lerninhalte, PWA-Cache-Verhalten und lokale Persistenz ändern sich nicht.

Lokal erfolgreich geprüft wurden Katalogabgleich, Typecheck, Lint, 184 Unit-/Komponententests, Produktionsbuild, Compose-Konfiguration und sechs Playwright-Szenarien jeweils gegen Vite Preview und den AMD64-Container. Das Image `mathe-reise:0.10.1` meldet `linux/amd64`, läuft als UID 101 mit Read-only-Rootfs, ausschließlich `/tmp` als tmpfs, ohne Capabilities und ist `healthy`. Einstieg, Manifest, Service Worker und Katalog besitzen die vorgesehenen MIME-, Cache- und Security-Header. Podman war nicht installiert; ein echter iPhone-Test wurde ebenfalls nicht durchgeführt.

## Didaktische Symmetrieprogression 0.10.0

- Symmetrie beginnt mit geraden rechteckigen Rastern und einer senkrechten Achse zwischen Spalten. Dadurch besitzt jede belegte Zelle genau einen Spiegelpartner; achsenfeste Zellen sind kein gleichzeitiger Sonderfall.
- Fünf katalogisierte Phasen steigern Belegung, Figurenkomplexität und Distraktorähnlichkeit, wechseln danach zu waagerechten Achsen und führen ungerade Raster mit Achsen durch Zellen erst im sicheren Transfer ein.
- Die Rastergröße ist vom Schwierigkeitswert entkoppelt. Ein 6×4-Einstiegsraster kann einfacher sein als ein kompakteres 4×4-Raster mit komplexerer Figur.
- Die grüne Spiegelachse ist in Vorlage und allen Antwortbildern sichtbar. Achsen zwischen Zellen sind durchgezogen; spätere Achsen durch Zellen werden gestrichelt dargestellt.
- Distraktoren werden aus den katalogisierten Fehlstrategien „Verschiebung auf derselben Achsenseite“ und „Spiegelung an der falschen Achse“ deterministisch in TypeScript erzeugt.
- Katalogversion `0.8.0` und Schema `7` validieren Progressionsphase, relevante Parität, Achsenposition, Belegungsgrenzen, Figurenkomplexität, Distraktorähnlichkeit und vollständige Seitenlage.

Diese Progression ist intern didaktisch begründet und automatisiert konsistent geprüft. Eine Freigabe durch eine Lehrkraft, Unterrichtserprobung und ein echter iPhone-Test sind weiterhin nicht dokumentiert; eine pädagogische Wirksamkeit wird nicht behauptet.

Lokal erfolgreich geprüft wurden Katalogabgleich, Typecheck, Lint, 184 Unit-/Komponententests, Produktionsbuild, Compose-Konfiguration und sechs Playwright-Szenarien jeweils gegen Vite Preview und den Container. Der neue Symmetrietest prüft bei `375 x 812` rechteckige Zellproportionen, die mittige sichtbare Achse und horizontales Overflow. Das OCI-Image `mathe-reise:0.10.0` und `mathe-reise:local` läuft als UID 101 mit Read-only-Rootfs, ausschließlich `/tmp` als tmpfs, ohne Capabilities und meldet `healthy`. Einstieg, Manifest, Service Worker und Katalog wurden mit den vorgesehenen MIME-, Cache- und Security-Headern abgerufen. Podman war nicht installiert und wurde nicht als ausgeführt behauptet.

## Sachaufgabenmodell-UI-Hotfix 0.9.1

- Veränderungsmodelle stellen bekannte Anfangsmenge und hinzukommende Menge jetzt proportional dar. Bei `13 + 3` belegt der obere Balken deshalb `13/16` der Gesamtbreite statt fälschlich die volle Breite.
- Richtige Antworten in Zwischenschritten verwenden wieder das grüne Erfolgsfeedback. Rot bleibt falschen Antworten und konkreten Korrekturhinweisen vorbehalten.
- Komponenten- und Mobile-Regressionstests sichern Proportionen, Feedbackzustände und die Darstellung bei `375 x 812` ab.

Der fachliche Katalog bleibt unverändert bei Version `0.7.0` und Schema `6`.

Lokal erfolgreich geprüft wurden Katalogabgleich, Typecheck, Lint, 176 Unit-/Komponententests, Produktionsbuild, Compose-Konfiguration und fünf Playwright-Szenarien jeweils gegen Vite Preview und den Container. Der mobile Sachaufgabentest misst das gerenderte Mengenverhältnis, prüft grünes Erfolgsfeedback und horizontales Overflow bei `375 x 812`. Das OCI-Image `mathe-reise:0.9.1` und `mathe-reise:local` läuft als UID 101 mit Read-only-Rootfs, ausschließlich `/tmp` als tmpfs, ohne Capabilities und meldet `healthy`. Einstieg, Manifest, Service Worker und Katalog wurden mit den vorgesehenen MIME-, Cache- und Security-Headern abgerufen. Podman war nicht installiert und wurde nicht als ausgeführt behauptet; ein echter iPhone-Test wurde ebenfalls nicht durchgeführt.

## Sachaufgaben als Modellierungsprozess 0.9.0

- Sachaufgaben beginnen mit der konkret gesuchten Größe und der Handlung der Geschichte. Technische Kategorien wie „Mengenbeziehung“ und eine isolierte Rechenartauswahl sind aus dem Kinderablauf entfernt.
- Stufe 1 untersucht ein sichtbares unbekanntenhaltiges Modell; Stufe 2 und 3 wählen genau ein passendes Balken- oder Gruppenbild aus drei konkreten Darstellungen. Das Modell steht immer vor der Gleichung.
- Balkenmodelle zeigen nur bekannte Größen und markieren die gesuchte Größe mit `?`. Veränderung, Teil-Ganzes, Vergleich, Ergänzen und zwei aufeinanderfolgende Veränderungen besitzen eigene Darstellungen.
- Gruppenmodelle unterscheiden eine unbekannte Gesamtzahl von einer unbekannten Gruppengröße. Das Kind berechnet Ergebnisse anschließend selbst über eine Zahleneingabe statt über Ergebnis-Multiple-Choice.
- Der zentrale Katalog steigt auf Version 0.7.0 und Schema 6. Vorlagen enthalten konkrete Situationen, relevante Alternativen, Modelltypen, Modellalternativen, Gleichungen, Gleichungsalternativen und eine dokumentierte siebenstufige Modellierungsfolge; Mathematik und Rendering bleiben in TypeScript.
- Generator-, Katalog-, Komponenten- und Mobile-E2E-Tests prüfen Reihenfolge, eindeutige Modelle, unbekannte Ergebnisdarstellung, Gegenbeispiele zu Schlüsselwortregeln, eigene Berechnung und mobile Bedienbarkeit.

Der Katalog bleibt `ready-for-review`. Eine Freigabe durch eine Lehrkraft, Unterrichtserprobung und ein echter iPhone-Test sind weiterhin nicht dokumentiert. Automatisierte Konsistenzprüfungen belegen keine pädagogische Wirksamkeit.

Lokal erfolgreich geprüft wurden Katalogabgleich, Typecheck, Lint, 174 Unit-/Komponententests, Produktionsbuild, Compose-Konfiguration und fünf Playwright-Szenarien jeweils gegen Vite Preview und den Container. Die vollständige Runde lief nach Reload und Offline-Neustart; der neue Sachaufgabentest prüfte bei `375 x 812` die Reihenfolge von Suchgröße, Handlung, unbekanntenhaltigem Modell, Gleichung und eigener Berechnung ohne horizontales Overflow. Das OCI-Image `mathe-reise:0.9.0` und `mathe-reise:local` läuft als UID 101 mit Read-only-Rootfs, ausschließlich `/tmp` als tmpfs, ohne Capabilities und meldet `healthy`. Einstieg, Manifest, Service Worker und Katalog wurden mit den vorgesehenen MIME-, Cache- und Security-Headern abgerufen. Podman war nicht installiert und wurde nicht als ausgeführt behauptet.

## Größen und Messen 0.8.0

- Geld ist als produktive Kompetenz aktiviert: ganze Euro mit sichtbaren Münzgruppen, gemischte Euro-/Cent-Beträge und Wechselgeld aus 10 Euro. Alle Rechnungen erfolgen intern exakt in Cent.
- Längen sind als produktive Kompetenz aktiviert: Zentimeter an einer Messstrecke ablesen, ganze Meter und Zentimeter umrechnen sowie Längen addieren oder vergleichen. Alle Rechnungen verwenden intern Zentimeter.
- Beide Kompetenzen besitzen drei tatsächlich unterschiedliche Schwierigkeitsstufen, zwei fachliche Hilfen, konkrete Fehlertexte, Remediation und adaptive Auswahl über den bestehenden Lernstand.
- Das Katalogschema steigt auf 5 und der fachliche Katalog auf 0.6.0. Neue Texte und Darstellungsbegriffe liegen in `quantityContent`; Generatoren, Umrechnung und Lösungsprüfung bleiben in TypeScript.
- Münzsumme, Messwert, Wertebereiche, eindeutige Optionen und mobile Darstellungen werden durch Generator-, Komponenten- und E2E-Tests abgesichert.
- Raumvorstellung bleibt vorbereitet und deaktiviert. Millimeter/Kilometer, komplexe Kaufsituationen und schriftliche Verfahren sind nicht Teil dieses Releases.

Eine Freigabe durch eine Lehrkraft und ein Test auf einem echten iPhone sind weiterhin nicht dokumentiert. Die offenen manuellen Nachweise stehen in `docs/validation-0.6.md` und den Issues #58 und #59.

Lokal erfolgreich geprüft wurden Katalogabgleich, Typecheck, Lint, 164 Unit-/Komponententests, Produktionsbuild, Compose-Konfiguration und vier Playwright-Szenarien jeweils gegen Vite Preview und den Container. Die vollständige Runde lief bei `375 x 812` nach Reload und Offline-Neustart bis zum Abschluss; Landscape `812 x 375` sowie die Geld- und Längenansichten blieben ohne horizontales Overflow. Das OCI-Image `mathe-reise:0.8.0` läuft als UID 101 mit Read-only-Rootfs, ausschließlich `/tmp` als tmpfs, ohne Capabilities und meldet `healthy`. Einstieg, Manifest, Service Worker und Katalog wurden mit den vorgesehenen MIME-, Cache- und Security-Headern abgerufen. Podman war nicht installiert und wurde nicht als ausgeführt behauptet. Das Multi-Arch-Release-Image wird ausschließlich durch den tag-gesteuerten GitHub-Workflow gebaut.

## Rechenstrategien und Transfer 0.7.0

- Addition bis 1000 prüft bei Einer- und Zehnerübergängen zuerst die passende volle Zwischenzahl und danach das Endergebnis.
- Subtraktion bis 1000 ergänzt kontrolliertes Entbündeln an genau einer Einer- oder Zehnerstelle. Mehrere gleichzeitige Übergänge und schriftliche Verfahren bleiben ausgeschlossen.
- Der Katalog enthält zwei kurze zweischrittige Sachaufgaben. Zwischenergebnis, zweite Rechenart, Endergebnis, Antwortsatz und Plausibilität werden konsistent geführt.
- Lernphasen wirken nun auf die tatsächliche Generatorschwierigkeit und Hilfsdarstellung: Einstieg und Verstehen nutzen Stufe 1, selbstständiges Üben Stufe 2, Automatisieren und Transfer Stufe 3.
- Der Katalog steigt inhaltlich auf 0.5.0; das kompatible Schema bleibt bei 4 und der Status bei `ready-for-review`.
- Dokumentation, PR-Checkliste und historischer Backlog wurden gegen den tatsächlich produktiven Umfang abgeglichen.

Eine Freigabe durch eine Lehrkraft und ein Test auf einem echten iPhone sind weiterhin nicht dokumentiert. Die offenen manuellen Nachweise stehen in `docs/validation-0.6.md` und den Issues #58 und #59.

Lokal erfolgreich geprüft wurden Katalogabgleich, Typecheck, Lint, 149 Unit-/Komponententests, Produktionsbuild, Compose-Konfiguration und drei Playwright-Szenarien jeweils gegen Vite Preview und den Container. Die vollständige Runde lief bei `375 x 812` nach Reload und Offline-Neustart bis zum Abschluss; Landscape `812 x 375` blieb ohne horizontales Overflow. Das OCI-Image `mathe-reise:0.7.0` läuft als UID 101 mit Read-only-Rootfs, ausschließlich `/tmp` als tmpfs, ohne Capabilities und meldet `healthy`. Einstieg, Manifest, Service Worker und Katalog wurden mit den vorgesehenen MIME-, Cache- und Security-Headern abgerufen. Podman war nicht installiert und wurde nicht als ausgeführt behauptet.

## Punktgruppen-Hotfix 0.5.1

- Faktoren, Divisoren und Quotienten bleiben im kleinen Einmaleins zwischen 2 und 10; die bestehenden Produkthöchstwerte der Schwierigkeitsstufen bleiben erhalten.
- Gruppenbilder stellen jede Gruppe und jeden Punkt vollständig dar. Es gibt kein stilles Abschneiden mehr.
- Ovale Mengenfelder ersetzen die würfelartig wirkenden Punktkästchen; die zugängliche Beschreibung nennt Gruppenanzahl und Gruppengröße.
- Ungültige Gruppendaten werden sichtbar abgelehnt, statt eine mathematisch falsche Darstellung zu erzeugen.

Der fachliche Katalog bleibt unverändert bei Version 0.4.0 und Schema 4. Eine Freigabe durch eine Lehrkraft und ein Test auf einem echten iPhone sind weiterhin nicht dokumentiert.

Erfolgreich geprüft wurden Katalogabgleich, Typecheck, Lint, 140 Unit-/Komponententests, Produktionsbuild, Compose-Konfiguration und drei Playwright-Szenarien jeweils gegen Vite Preview und den Container. Der neue mobile Test prüft die vollständige Punktzahl bei `375 x 812` und erzeugt ein Screenshot-Artefakt; Landscape bleibt ohne horizontales Overflow. Das lokale OCI-Image `mathe-reise:0.5.1` läuft als UID 101 mit Read-only-Rootfs, ausschließlich `/tmp` als tmpfs, ohne Capabilities und meldet `healthy`. Einstieg, Manifest, Service Worker und Katalog wurden mit den vorgesehenen MIME-, Cache- und Security-Headern abgerufen. Podman war nicht installiert und wurde nicht als ausgeführt behauptet.

## Didaktische Qualitätsoffensive 0.5.0

- Katalogschema 4 führt die einheitlichen Status `draft`, `ready-for-review`, `active` und `disabled`, sechs Lernphasen, Erfolgskriterien und strukturierte Remediation ein.
- Der Lernstand speichert die aktuelle Lernphase; neue, im Aufbau befindliche, fällige, sichere und lange nicht geprüfte Inhalte werden als nachvollziehbare Wiederholungszustände abgeleitet.
- Nach zwei Fehlern folgen konkrete Erklärung und eine leichtere verwandte beziehungsweise grundlegende Folgeaufgabe.
- Stellenwert Stufe 3 trennt Ziffer und Stellenwert in zwei prüfbare Schritte. Runden Stufe 2 bestimmt Nachbarzahlen und Ergebnis; Stufe 3 ergänzt eine Abstandsbegründung einschließlich Halbpunkt.
- Sachrechnen ergänzt gleichmäßiges Verteilen als Division ohne Rest und führt nun über sieben Mengenbeziehungen.
- Geld, Längen und Raumvorstellung sind methodisch im Katalog und in der Dokumentation vorbereitet, bleiben aber `disabled` und unsichtbar.
- Das didaktische Gesamtmodell, 14 Themenpfade und ein einziges Lehrkraft-Review-Paket liegen unter `docs/didactics/`.

Der Gesamtkatalog steht auf `ready-for-review`, alle tatsächlich produktiven Kompetenzen auf `active`. Das bedeutet interne technische, mathematische und didaktische Konsistenz, nicht die Freigabe durch eine Lehrkraft. Ein echter iPhone-Test wurde nicht durchgeführt.

Erfolgreich geprüft wurden Katalogabgleich, Typecheck, Lint, 129 Unit-/Komponententests, Produktionsbuild, Compose-Konfiguration sowie zwei Playwright-Szenarien gegen Vite Preview und gegen den Container. Die vollständige Runde lief bei `375 x 812` nach Reload und Offline-Neustart bis zum Abschluss; Landscape `812 x 375` blieb ohne horizontales Overflow. Das OCI-Image läuft als UID 101 mit Read-only-Rootfs, nur `/tmp` als tmpfs, ohne Capabilities und meldet `healthy`. GitHub Actions hat es öffentlich als Multi-Arch-Image für `linux/amd64` und `linux/arm64` unter `ghcr.io/hackepeter87/nachhilfe:0.5.0` und `latest` mit Manifest-Digest `sha256:80dcaefe67e2dfc06b0291e772e6eb3e83f8a64666e99b95f5c2a95f3a260952` veröffentlicht. Das OCI-Revisionslabel verweist auf Commit `c0c49d7632e24523e73df9d96b0501b65e26a643`; beide Plattformvarianten wurden unter den Read-only-Sicherheitsbedingungen gestartet und meldeten `healthy`. Podman war nicht installiert und wurde nicht als ausgeführt behauptet.

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
