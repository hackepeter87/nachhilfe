# Mathe-Reise

## iPhone-Regressionskorrektur 0.31.1

- Es kommt keine neue mathematische Kompetenz hinzu. Drei Befunde aus der realen iPhone-Nutzung werden gemeinsam in Katalog, Generator, Runtime und Rendering korrigiert.
- Der Symmetrie-Transfer verlangt keinen unsichtbaren Wechsel auf eine zweite Achse mehr. Er fragt eindeutig nach der Spiegelung an der sichtbaren grünen Achse; dieses Spiegelbild ist auch die interne Zielantwort.
- Geführtes Tabellenlesen verlangt das Zusammenführen zweier benannter Tabellenwerte. Das bloße Abschreiben eines sichtbaren Einzelwerts entfällt, und Feedback spricht nicht mehr über eine Strichliste, wenn ausschließlich eine Tabelle sichtbar ist.
- Strichlisten werden in eigenständigen Fünfergruppen gerendert. Der schräge fünfte Strich liegt innerhalb der Gruppe und verschiebt auf kleinen Bildschirmen keine nachfolgenden Striche mehr.
- App 0.31.1 verwendet Katalog 0.30.1 bei unverändertem Schema 19 und Status `ready-for-review`.

Die Ausgangsfehler wurden auf einem echten iPhone dokumentiert. Eine erneute vollständige Geräteabnahme der korrigierten Version und eine Lehrkraftprüfung sind noch nicht erfolgt.

Lokal erfolgreich geprüft wurden Katalogabgleich, Curriculum-Matrix, Typecheck, Lint, 451 Unit-/Komponententests, Produktionsbuild und 19 Playwright-Szenarien gegen Vite Preview sowie erneut 19 Szenarien gegen den gehärteten Read-only-Container. Das explizit für AMD64 gebaute Image `mathe-reise:0.31.1-local` beziehungsweise `mathe-reise:local` (`sha256:966fe915a8b7977a0b03257829d9d865098db4b74684da6ee032b10af549c669`) lief als UID 101 mit ausschließlich `/tmp` als tmpfs, ohne Capabilities und meldete `healthy`. Einstieg, Manifest, Service Worker, Katalog und Healthcheck wurden erfolgreich abgerufen; Docker Compose validierte die Deployment-Datei. Die Container-E2E lief auf `127.0.0.1:8094`. WebKit bleibt eine Mobile-Safari-Näherung; die korrigierte Version wurde nicht auf dem echten iPhone erneut geprüft.

## Reproduzierbarer didaktischer Prüfstand 0.31.0

- Es kommt keine neue mathematische Kompetenz hinzu. Ein ausschließlich in der Vite-Entwicklungsumgebung verfügbarer Prüfstand stellt alle 34 aktiven Kompetenzen über Lernphase, Schwierigkeit, Seed und Remediationspfad reproduzierbar bereit.
- Der Prüfstand verwendet den produktiven Katalog, die produktiven Generatoren und dieselbe `ExerciseCard` wie eine Mathe-Runde. Die technische Lösung bleibt standardmäßig verborgen; Hilfe, Fehler, Feedback und Remediation können kontrolliert durchlaufen werden.
- Eine verbindliche Prüfliste und eine Markdown-Befundvorlage erfassen Arbeitsauftrag, Lernhandlung, Darstellung, Antwortform, Hilfe, Feedback, Remediation, mobiles Layout und Klasse-3-Niveau.
- Der Produktionsbuild scheitert, falls Kennzeichen des Prüfstands in `dist` enthalten sind. Im Kinderbereich entsteht keine zweite Navigation oder Aufgabenruntime.
- Einfache Sachaufgaben enthalten keinen passiven Modellbestätigungsschritt mehr. Das unbekanntenhaltige Modell bleibt bis zur eigenen Rechnung sichtbar; Ergebnis und Antwortsatz erscheinen weiterhin erst danach.
- Nachbarzahlaufgaben erzeugen auch an der oberen Zahlenraumgrenze eindeutige plausible Optionen.
- Katalog 0.30.0 und App 0.31.0 bleiben bei Schema 19 und Status `ready-for-review`.

Der Prüfstand wurde intern bei `375 × 812` für alle 34 Kompetenzen in einer geführten und einer Transferkonfiguration ohne horizontalen Seitenüberlauf durchlaufen. Das ist keine vollständige Variantenprüfung und keine echte iPhone-Abnahme. Zahlen/Modellieren, Größen/Daten/Raum, die vollständige Gerätecheckliste und die externe Lehrkraftprüfung bleiben offen.

Lokal erfolgreich geprüft wurden Katalogabgleich, Curriculum-Matrix, Typecheck, Lint, 448 Unit-/Komponententests, Produktionsbuild und 19 Playwright-Szenarien gegen Vite Preview sowie erneut 19 Szenarien gegen den gehärteten Read-only-Container. Das mit Docker Desktop explizit für AMD64 gebaute Image `mathe-reise:0.31.0-local` beziehungsweise `mathe-reise:local` (`sha256:d2e97e9e6db1928f2ad6763393b854d625e80b5dc1700b3debfd9339d0a38b96`) lief als UID 101 mit ausschließlich `/tmp` als tmpfs, ohne Capabilities und meldete `healthy`. Einstieg, Manifest, Service Worker, Katalog und Healthcheck wurden erfolgreich abgerufen; Docker Compose validierte die Deployment-Datei. Die Container-E2E lief auf `127.0.0.1:8093`. WebKit bleibt eine Mobile-Safari-Näherung.

## iPhone-Regressionskorrektur 0.30.2

- Es kommt keine neue mathematische Kompetenz hinzu. Drei weitere Befunde aus der realen iPhone-Nutzung werden als gemeinsame Korrektur von Katalog, Generator und Runtime behandelt.
- Kombinatorik listet nicht mehr alle richtigen Paarungen als auswählbare Antworten auf. Eine beschriftete Zeilen-/Spaltentabelle enthält genau eine offene Paarung; das Kind ergänzt sie aus den beiden Merkmalen und zählt anschließend den vollständigen Ergebnisraum.
- Die künstliche Boots-/Anlegergeschichte wurde durch das Gestalten einer Trinkflasche aus Farbe und Aufkleber ersetzt.
- Zahlenbeschriftungen am Zahlenstrahl sind direkt an die berechnete Markerposition gebunden. `801` steht auf einer Skala von `0` bis `1000` bei `80,1 %` statt unabhängig vom Marker in der Mitte.
- Sachaufgaben erhalten in der Runtime zwingend einen eigenen numerischen Rechenschritt, falls ein älterer unvollständiger Schrittplan keinen solchen Ergebnisschritt enthält. Die Erklärung mit der Lösung erscheint erst danach.
- App 0.30.2 verwendet Katalog 0.29.2 bei unverändertem Schema 19 und Status `ready-for-review`.

Die Korrekturen wurden noch nicht erneut auf einem echten iPhone abgenommen. Eine Lehrkraftfreigabe oder Unterrichtserprobung wird nicht behauptet.

Lokal erfolgreich geprüft wurden Katalogabgleich, Curriculum-Matrix, Typecheck, Lint, 439 Unit-/Komponententests, Produktionsbuild und 19 Playwright-Szenarien gegen Vite Preview sowie erneut 19 Szenarien gegen den gehärteten Read-only-Container. Das explizit für AMD64 gebaute Image `mathe-reise:0.30.2-local` beziehungsweise `mathe-reise:local` (`sha256:dda15dea2f3e1ad6aafe1a79780f9938dfdf2e70d4bb1c2b68d7ef4b5295d8b1`) lief als UID 101 mit ausschließlich `/tmp` als tmpfs, ohne Capabilities und meldete `healthy`. Einstieg, Manifest, Service Worker, Katalog und Healthcheck wurden erfolgreich abgerufen. Die Container-E2E lief auf `127.0.0.1:8092`. WebKit bleibt eine Mobile-Safari-Näherung.

## Kritische didaktische Korrektur 0.30.1

- Es kommt keine neue mathematische Kompetenz hinzu. Die manuellen iPhone-Befunde aus 0.30.0 werden als Release-Blocker und nicht als kosmetische Einzelprobleme behandelt.
- Einfache Sachaufgaben verzichten auf künstliche Pflichtschritte. Das unbekanntenhaltige Modell bleibt bis zur Rechnung sichtbar, Gleichungen werden aus plausiblen Möglichkeiten gewählt und nicht mehr über eine erklärungsbedürftige Texteingabe erfasst.
- Schriftliche Addition und Subtraktion lassen einen bewusst kürzeren zweiten Operanden über getrennte H/Z/E-Felder ausrichten. Rückmeldungen nennen die konkrete Spalte und nur tatsächlich verwendete Überträge oder Entbündelungen.
- Tauschaufgaben tauschen die sichtbaren Mengen wirklich. Wahrscheinlichkeit verwendet eine echte Drehscheibe beziehungsweise Münzseiten und eine verständliche Vorhersage statt eines Listenquiz mit Fantasieausgang.
- Die mehrdeutige Wasserflaschen-Schätzung wurde entfernt. Ebene Figuren beginnen mit einem Vergleich von Quadrat und Rechteck statt mit dem Zählen offensichtlicher Ecken.
- Redundante Ergebniszeilen verschwinden, solange das Ergebnis unbekannt ist. Der mobile Sitzungsheader berücksichtigt den sicheren oberen Bildschirmbereich und bleibt beim Scrollen erreichbar.
- Generische Remediation wie „Grundlage von ... neu aufbauen“ wurde aus allen Kompetenzen entfernt. Leichtere Folgeaufgaben nennen stattdessen eine konkrete mathematische Handlung.
- Der kritische Audit trennt technische Konsistenz von kindgerechter Didaktik und kennzeichnet weitere Aufgabenfamilien offen als manuell prüfbedürftig.
- App 0.30.1 verwendet Katalog 0.29.1 bei unverändertem Schema 19 und Status `ready-for-review`.

Eine Lehrkraftfreigabe, Unterrichtserprobung und vollständige Abnahme der korrigierten Version auf einem echten iPhone sind nicht erfolgt.

Lokal erfolgreich geprüft wurden Katalogabgleich, Curriculum-Matrix, Typecheck, Lint, 437 Unit-/Komponententests, Produktionsbuild und 19 Playwright-Szenarien gegen Vite Preview sowie erneut 19 Szenarien gegen den gehärteten Read-only-Container. Das explizit für AMD64 gebaute Image `mathe-reise:0.30.1-local` beziehungsweise `mathe-reise:local` (`sha256:99cefa23d747c09af0d6b01c6a31a5059718aba4735c00071cab38262071143e`) lief als UID 101 mit ausschließlich `/tmp` als tmpfs, ohne Capabilities und meldete `healthy`. Einstieg, Manifest, Service Worker und Katalog wurden erfolgreich mit den vorgesehenen MIME-, Cache- und Security-Headern abgerufen. Die Container-E2E lief auf `127.0.0.1:8091`. WebKit bleibt eine Mobile-Safari-Näherung.

## Curriculare Konvergenz 0.30.0

- Es kommt keine neue mathematische Kompetenz hinzu. Alle 34 aktiven Kompetenzen laufen verbindlich über `activate`, `understand`, `guided-practice`, `independent-practice`, `automate` und `transfer`.
- Der Katalog ist nun auch für direkte Generatoraufrufe die Quelle von Lernphase und produktiver Typkennung. Der frühere phasenlose Ausführungspfad wurde entfernt.
- Wiederholungs- und Remediationsaufgaben übernehmen die zur Zielstufe katalogisierte Lernphase. Damit bleiben Darstellung, Hilfe, Lernhandlung und Schwierigkeit auch in adaptiven Folgeaufgaben konsistent.
- Die generierte Curriculum-Matrix weist für jede aktive Kompetenz den Standard 0.21 und alle sechs katalogisierten Laufzeittypen aus.
- Repositoryweite Konvergenztests prüfen 204.000 deterministische Varianten, eindeutige Optionen, Remediation und die Trennung bekannter, unbekannter und aufgedeckter Darstellungswerte.
- Katalog 0.29.0 bleibt bei Schema 19 und Status `ready-for-review`. Eine Lehrkraftprüfung, Unterrichtserprobung und ein echter iPhone-Test sind nicht erfolgt.

Lokal erfolgreich geprüft wurden Katalogabgleich, Curriculum-Matrix, Typecheck, Lint, 427 Unit-/Komponententests, Produktionsbuild und 19 Playwright-Szenarien gegen Vite Preview sowie erneut 19 Szenarien gegen den finalen gehärteten Read-only-Container. Das explizit für AMD64 gebaute Image `mathe-reise:0.30.0-local` beziehungsweise `mathe-reise:local` (`sha256:ec93c762a626e2fe8123999c9b61ef570ff83c625c5bbe39ed30435b0eed7ff3`) läuft als UID 101 mit ausschließlich `/tmp` als tmpfs, ohne Capabilities und meldet `healthy`. Einstieg, Manifest, Service Worker, Katalog und Healthcheck wurden erfolgreich abgerufen; MIME-, Cache- und Security-Header entsprechen der Containerkonfiguration. Die finale Container-E2E lief auf `127.0.0.1:8090`. Podman war nicht installiert; die Compose-Datei wurde mit Docker Compose erfolgreich validiert. WebKit bleibt eine Mobile-Safari-Näherung.

## Raum und Form 0.29.0

- Es kommt keine neue mathematische Kompetenz hinzu. Ebene Figuren, Muster, Fläche, Umfang, Symmetrie, Körperansichten, Würfelrotation und Falten wurden auf den Qualitätsstandard ab 0.21 migriert.
- Jede Kompetenz besitzt sechs fachlich verschiedene Lernhandlungen. Beobachten und Begründen stehen vor Zuordnung, Berechnung oder Transformation; Transfer besteht aus Zusammensetzen oder einer konkreten Fehleranalyse.
- Fläche beginnt beim Einheitsquadrat, Umfang bei der Einheitskante. Katalogisierte Fehlvorstellungen unterscheiden Bedeckung, Gitterlinien, Innenkanten und Außenrand.
- Symmetrie verwendet produktiv nur gerade Raster mit Achsen zwischen den Zellen. Körperansichten, Rotation und Falten trennen Blickrichtung, Projektion, Achse, Richtung und Transformation.
- Katalog 0.28.0 bleibt bei Schema 19. Achsen durch Felder, Formeln, Maßstab, freie 3D-Rotation, Mehrfachfaltungen und Körpernetze bleiben ausgeschlossen. Eine Lehrkraftprüfung, Unterrichtserprobung und ein echter iPhone-Test sind nicht erfolgt.

Lokal erfolgreich geprüft wurden Katalogabgleich, Curriculum-Matrix, Typecheck, Lint, 425 Unit-/Komponententests, Produktionsbuild und 19 Playwright-Szenarien gegen Vite Preview sowie erneut 19 Szenarien gegen den gehärteten Read-only-Container. Das explizit für AMD64 gebaute Image `mathe-reise:0.29.0-local` beziehungsweise `mathe-reise:local` (`sha256:463c8a8a58a62b1133e5a9b9c4f4351ed907b630d6994a6eecf43bb5a83e5377`) läuft als UID 101 mit ausschließlich `/tmp` als tmpfs, ohne Capabilities und meldet `healthy`. Einstieg, Manifest, Service Worker, Katalog und Healthcheck wurden erfolgreich abgerufen; MIME-, Cache- und Security-Header entsprechen der Containerkonfiguration. Die Container-E2E liefen auf `127.0.0.1:8089`. Podman war nicht installiert; die Compose-Datei wurde mit Docker Compose erfolgreich validiert. WebKit bleibt eine Mobile-Safari-Näherung.

## Daten und Wahrscheinlichkeit 0.28.0

- Tabellen, Diagramme und Wahrscheinlichkeit besitzen nun sechs fachlich verschiedene Lernhandlungen vom Erkennen der Datenrollen beziehungsweise des Ergebnisraums bis zum Transfer.
- Säulendiagramme verwenden eine sichtbare ganzzahlige Skala und keine aufgedruckten Werte. Gesuchte Differenzen bleiben bis zur richtigen Antwort maskiert.
- Der Darstellungswechsel prüft Kategorie und Wert über Tabelle und Diagramm hinweg; Wahrscheinlichkeit verbindet im Transfer eine Vorhersage mit der angemessenen Auswertung eines einzelnen Versuchs.
- Katalogisierte Fehlvorstellungsrouten reagieren auf Kategorie-Wert-Verwechslungen, falsche Zeilen, Symbolschlüssel, Säulenhöhe, unvollständige Ergebnisräume und die Überdeutung eines Einzelversuchs.
- Katalog 0.27.0 bleibt bei Schema 19. Freie Datenerhebungen, Kreisdiagramme, manipulierte Achsen und Bruchwahrscheinlichkeiten bleiben ausgeschlossen. Eine Lehrkraftprüfung, Unterrichtserprobung und ein echter iPhone-Test sind nicht erfolgt.

Lokal erfolgreich geprüft wurden Katalogabgleich, Curriculum-Matrix, Typecheck, Lint, 406 Unit-/Komponententests, Produktionsbuild und 19 Playwright-Szenarien gegen Vite Preview sowie erneut 19 Szenarien gegen den gehärteten Read-only-Container. Das explizit für AMD64 gebaute Image `mathe-reise:0.28.0-local` beziehungsweise `mathe-reise:local` (`sha256:e880b9929ab22199069b82759af2e2b2b7befdb5e6630e37884c1edadb370df3`) läuft als UID 101 mit ausschließlich `/tmp` als tmpfs, ohne Capabilities und meldet `healthy`. Einstieg, Manifest, Service Worker, Katalog und Healthcheck wurden erfolgreich abgerufen; MIME-, Cache- und Security-Header entsprechen der Containerkonfiguration. Die Container-E2E liefen auf `127.0.0.1:8088`. Podman war nicht installiert; die Compose-Datei wurde mit Docker Compose erfolgreich validiert. WebKit bleibt eine Mobile-Safari-Näherung.

## Größen und Messen 0.27.0

- Geld, Längen, Masse und Rauminhalt besitzen nun sechs fachlich verschiedene Lernhandlungen von Einheit und Bezugsgröße bis zum Transfer.
- Umrechnen ist nicht mehr die erste Lernhandlung. Messstrecke, Münzbild, Waage und Messgefäß zeigen bekannte Informationen und maskieren Messwert, Ergänzung oder Rückgeld.
- Fehlende Ergänzungsgrundlagen reduzieren Schwierigkeit und Lernphase gemeinsam; eine gespeicherte Transferphase kann die fachliche Sperre nicht mehr umgehen.
- Katalogisierte Fehlvorstellungsrouten reagieren auf Einheitenwechsel, falsche Größenart, Umrechnungsfaktor, Nullpunkt und Geldrichtung.
- Katalog 0.26.0 bleibt bei Schema 19. Dezimalzahlen, Millimeter, Kilometer und komplexe Kaufsituationen bleiben ausgeschlossen. Eine Lehrkraftprüfung, Unterrichtserprobung und ein echter iPhone-Test sind nicht erfolgt.

Lokal erfolgreich geprüft wurden Katalogabgleich, Typecheck, Lint, 401 Unit-/Komponententests, Produktionsbuild und 19 Playwright-Szenarien gegen Vite Preview sowie erneut 19 Szenarien gegen den gehärteten Read-only-Container. Das explizit für AMD64 gebaute Image `mathe-reise:0.27.0-local` beziehungsweise `mathe-reise:local` (`sha256:a262af41fdf579b3dca159ccde00eba904f8c9a32adfb16732ee8775a0c3de0a`) läuft als UID 101 mit ausschließlich `/tmp` als tmpfs, ohne Capabilities und meldet `healthy`. Einstieg, Manifest, Service Worker, Katalog und Healthcheck wurden erfolgreich abgerufen; MIME-, Cache- und Security-Header entsprechen der Containerkonfiguration. Die Container-E2E liefen auf `127.0.0.1:8087`. Podman war nicht installiert; die Compose-Datei wurde mit Docker Compose erfolgreich validiert. WebKit bleibt eine Mobile-Safari-Näherung.

## Mathematisches Modellieren 0.26.0

- Es kommt keine neue mathematische Kompetenz hinzu. Sachaufgaben wurden als vollständiger Modellierungsprozess auf den Qualitätsstandard ab 0.21 migriert.
- Die sechs Lernphasen besitzen katalogisierte unterschiedliche Folgen: Suchgröße und Angaben aktivieren, das unbekanntenhaltige Modell verstehen, den vollständigen Weg geführt oder selbstständig bearbeiten, vertraute Situationen verdichten und komplexere beziehungsweise zweischrittige Situationen übertragen.
- Rechnungen werden in den produktiven Lernphasen selbst eingetragen. Die Runtime akzeptiert für Mal und Geteilt sowohl `·` und `:` als auch die mobilen Eingabealternativen `*` und `/`.
- Modelle zeigen alle bekannten Größen, maskieren die gesuchte Größe und bleiben mit Geschichte, Rechnung, Plausibilitätsprüfung und Antwortsatz synchron.
- Katalogisierte Fehlvorstellungsrouten reagieren auf bekannte statt gesuchte Mengen, ausgelassene Angaben, Schlüsselwortheuristik, unplausible Größenbeziehungen und unpassende Antwortsätze.
- Katalog 0.25.0 und Schema 19 ergänzen validierte `phaseSequences` und `guided-equation`. Freie Skizzen, frei formulierte Antwortsätze und lange komplexe Mehrschrittprobleme bleiben ausgeschlossen. Eine Lehrkraftprüfung, Unterrichtserprobung und ein echter iPhone-Test sind nicht erfolgt.

Lokal erfolgreich geprüft wurden Katalogabgleich, Typecheck, Lint, 398 Unit-/Komponententests, Produktionsbuild und 19 Playwright-Szenarien gegen Vite Preview sowie erneut 19 Szenarien gegen den gehärteten Read-only-Container. Das explizit für AMD64 gebaute Image `mathe-reise:0.26.0-local` beziehungsweise `mathe-reise:local` (`sha256:bb3d6c1086419c104b3195f3a87dafd893867b377777c5750d61b7b7e3a22581`) läuft als UID 101 mit ausschließlich `/tmp` als tmpfs, ohne Capabilities und meldet `healthy`. Einstieg, Manifest, Service Worker, Katalog und Healthcheck wurden erfolgreich abgerufen; MIME-, Cache- und Security-Header entsprechen der Containerkonfiguration. Die Container-E2E liefen auf `127.0.0.1:8086`. Podman war nicht installiert; die Compose-Datei wurde mit Docker Compose erfolgreich validiert. WebKit bleibt eine Mobile-Safari-Näherung.

## Schriftliche Verfahren 0.25.0

- Es kommt keine neue mathematische Kompetenz hinzu. Schriftliche Addition und Subtraktion wurden als gemeinsamer Stellenwert- und Prüfstrang auf den Qualitätsstandard ab 0.21 migriert.
- Alle sechs Lernphasen besitzen unterschiedliche mathematische Handlungen: Zahlen stellengerecht anordnen, Bündeln beziehungsweise Entbündeln verstehen, ohne Übergang geführt rechnen, einen sichtbaren Übergang bearbeiten, einen Übergang selbstständig erkennen und die Rechnung mit der Umkehraufgabe prüfen.
- Die Spaltendarstellung startet neutral. Der zweite Operand und alle Ergebnisziffern bleiben bis zum jeweiligen erfolgreichen Bearbeitungsschritt maskiert; ein Übertrag erscheint erst nach seiner Bearbeitung.
- Katalogisierte Fehlvorstellungsrouten unterscheiden vollständige zweistellige Spaltensummen, falsch platzierte Überträge, falsche Tauschrichtung und ungeeignete Probeaufgaben.
- Katalog 0.24.0 bleibt bei Schema 18. Mehrere Überträge, Entbündelungen über Nullstellen und schriftliche Multiplikation beziehungsweise Division bleiben ausgeschlossen. Eine Lehrkraftprüfung, Unterrichtserprobung und ein echter iPhone-Test sind nicht erfolgt.

Lokal erfolgreich geprüft wurden Katalogabgleich, Typecheck, Lint, 395 Unit-/Komponententests, Produktionsbuild und 19 Playwright-Szenarien gegen Vite Preview sowie erneut 19 Szenarien gegen den gehärteten Read-only-Container. Das explizit für AMD64 gebaute Image `mathe-reise:0.25.0-local` beziehungsweise `mathe-reise:local` (`sha256:9163786b4082b0b4e4c7e5e834d72517077ab71cf68b5ba5523313f731daf1a8`) läuft als UID 101 mit ausschließlich `/tmp` als tmpfs, ohne Capabilities und meldet `healthy`. Einstieg, Manifest, Service Worker, Katalog und Healthcheck wurden erfolgreich abgerufen; MIME-, Cache- und Security-Header entsprechen der Containerkonfiguration. Die Container-E2E liefen auf `127.0.0.1:8085`. Podman war nicht installiert; die Compose-Datei wurde mit Docker Compose erfolgreich validiert. WebKit bleibt eine Mobile-Safari-Näherung.

## Runden und Abschätzen 0.24.0

- Es kommt keine neue mathematische Kompetenz hinzu. Runden auf Zehner und Hunderter wurde als gemeinsamer Abstands- und Genauigkeitsstrang auf den Qualitätsstandard ab 0.21 migriert.
- Alle sechs Lernphasen besitzen unterschiedliche mathematische Handlungen: Nachbarn bestimmen, Abstände und Halbpunkt verstehen, geführt entscheiden, selbstständig runden, ohne Zeitdruck abrufen und eine passende ungefähre Angabe im Kontext wählen.
- Der Zahlenstrahl maskiert gesuchte Nachbarn in der Aktivierung. Spätere Darstellungen zeigen nur bekannte Kandidaten und Lage; keine zusätzliche Ergebnisrolle wird vorweggenommen.
- Katalogisierte Fehlvorstellungsrouten unterscheiden falsche Nachbarn, starres Auf- oder Abrunden, Abrunden am Halbpunkt und unpassende Genauigkeit.
- Katalog 0.23.0 bleibt bei Schema 18. Dezimalzahlen und reine Merksatz-Automatisierung ohne Abstandsverständnis bleiben ausgeschlossen. Eine Lehrkraftprüfung, Unterrichtserprobung und ein echter iPhone-Test sind nicht erfolgt.

Lokal erfolgreich geprüft wurden Katalogabgleich, Typecheck, Lint, 392 Unit-/Komponententests, Produktionsbuild und 19 Playwright-Szenarien gegen Vite Preview sowie erneut 19 Szenarien gegen den gehärteten Read-only-Container. Das explizit für AMD64 gebaute Image `mathe-reise:0.24.0-local` beziehungsweise `mathe-reise:local` (`sha256:b23e055e3329576bd6a25b91f8a05d3fa5b76c3135e2d70a88e11794d63a8465`) läuft als UID 101 mit ausschließlich `/tmp` als tmpfs, ohne Capabilities und meldet `healthy`. Einstieg, Manifest, Service Worker, Katalog und Healthcheck wurden erfolgreich abgerufen; MIME-, Cache- und Security-Header entsprechen der Containerkonfiguration. Die Container-E2E liefen auf `127.0.0.1:8084`. Podman war nicht installiert; die Compose-Datei wurde mit Docker Compose erfolgreich validiert. WebKit bleibt eine Mobile-Safari-Näherung.

## Rechenstrategien bis 1000 in Version 0.23.0

- Es kommt keine neue mathematische Kompetenz hinzu. Addition, Subtraktion und Ergänzen bis 1000 wurden als gemeinsamer Strategie-Strang auf den Qualitätsstandard ab 0.21 migriert.
- Alle sechs Lernphasen besitzen unterschiedliche mathematische Handlungen: Stelle oder Richtung aktivieren, Zwischenziel und Zerlegung verstehen, Teilschritte geführt ausführen, selbstständig rechnen, ohne Zeitdruck abrufen und Strategie beziehungsweise Umkehraufgabe übertragen.
- Rechenstriche führen bekannte Startwerte, aber maskieren Zwischenziel, Sprünge und Ergebnis. Stellenwertmaterial zeigt in der Aktivierung nur die bekannte Ausgangszahl und verrät keine Ergebnismenge.
- Katalogisierte Fehlvorstellungsrouten unterscheiden Stellenverwechslung, falsche Rechenrichtung, verfehltes Zwischenziel, ausgelassenen Rest und Mitzählen der Zielzahl.
- Katalog 0.22.0 bleibt bei Schema 18. Mehrere gleichzeitige Übergänge und schriftliche Notation als Einstieg bleiben ausgeschlossen. Eine Lehrkraftprüfung, Unterrichtserprobung und ein echter iPhone-Test sind nicht erfolgt.

Lokal erfolgreich geprüft wurden Katalogabgleich, Typecheck, Lint, 387 Unit-/Komponententests, Produktionsbuild und 19 Playwright-Szenarien gegen Vite Preview sowie erneut 19 Szenarien gegen den gehärteten Read-only-Container. Das explizit für AMD64 gebaute Image `mathe-reise:0.23.0-local` beziehungsweise `mathe-reise:local` (`sha256:0dda9cec88682845867d074dc5d428383bd7f1e051c89db88c2c3796f732539d`) läuft als UID 101 mit ausschließlich `/tmp` als tmpfs, ohne Capabilities und meldet `healthy`. Einstieg, Manifest, Service Worker, Katalog und Healthcheck wurden erfolgreich abgerufen; MIME-, Cache- und Security-Header entsprechen der Containerkonfiguration. Die Container-E2E liefen auf `127.0.0.1:8083`. Podman war nicht installiert; die Compose-Datei wurde mit Docker Compose erfolgreich validiert. WebKit bleibt eine Mobile-Safari-Näherung.

## Multiplikatives Denken 0.22.0

- Es kommt keine neue mathematische Kompetenz hinzu. Multiplikation und Division wurden als zusammenhängender Begriffsstrang auf den Qualitätsstandard ab 0.21 migriert.
- Multiplikation führt von gleich großen Gruppen über wiederholte Addition und gestütztes Rechnen bis zur Tausch- und Umkehraufgabe. Division unterscheidet Gruppieren und Verteilen in Lernhandlung, Darstellung, Text und adaptiver Unterkompetenz.
- Alle sechs Lernphasen erzeugen unterschiedliche mathematische Handlungen. Transfer besteht jeweils aus zwei tatsächlich bearbeiteten Schritten und nicht nur aus einem angezeigten Katalogtext.
- Katalogisierte Fehlvorstellungskennungen steuern Rückmeldungen zu addierten Faktoren, ausgelassenen Gruppen, vertauschten Gruppenrollen und unvollständiger Aufteilung. Freie Eingaben werden nur bei robusten Mustern zugeordnet.
- Katalog 0.21.0 bleibt bei Schema 18, weil keine neue Datenstruktur nötig war. Die zentrale Quelle, der öffentliche Katalog, der Fallback und die Curriculum-Matrix sind identisch.
- Restdivision, schriftliche Multiplikation/Division und freie sprachliche Modellkonstruktion bleiben ausgeschlossen. Eine Lehrkraftprüfung, Unterrichtserprobung und ein echter iPhone-Test sind nicht erfolgt.

Lokal erfolgreich geprüft wurden Katalogabgleich, Typecheck, Lint, 381 Unit-/Komponententests, Produktionsbuild und 19 Playwright-Szenarien gegen Vite Preview sowie erneut 19 Szenarien gegen den gehärteten Read-only-Container. Das explizit für AMD64 gebaute Image `mathe-reise:0.22.0-local` beziehungsweise `mathe-reise:local` (`sha256:a33cdbc648eac0009ef51b23a13e213ce9f8db377f72c01df52c25df4d6b609a`) läuft als UID 101 mit ausschließlich `/tmp` als tmpfs, ohne Capabilities und meldet `healthy`. Einstieg, Manifest, Service Worker, Katalog und Healthcheck wurden erfolgreich abgerufen; MIME-, Cache- und Security-Header entsprechen der Containerkonfiguration. Die Container-E2E liefen auf `127.0.0.1:8082`. Podman war nicht installiert; WebKit bleibt eine Mobile-Safari-Näherung.

## Didaktische Korrekturgruppe 0.21.0

- Es kommt keine neue mathematische Kompetenz hinzu. Die sechs Lernphasen sind nun als konkrete Lernhandlungen und zulässige Interaktionen im Katalog modelliert; Generator und Runtime verwenden dieses Modell gemeinsam.
- Addition und Subtraktion bauen den Zehnerübergang über Ergänzen beziehungsweise Zerlegen bis 10 auf. Stellenwert sowie Zerlegen/Zusammensetzen nutzen gebündeltes Material; die höchste Zerlegungsstufe enthält erstmals nichtkanonische Zehnerbündelungen.
- Nachbarzehner und Nachbarhunderter starten mit Referenzpunkten und decken die beiden gesuchten Grenzen schrittweise auf. Die analoge Uhr berechnet den Stundenzeiger einschließlich Minutenanteil exakt; die Phasenfolge reicht von Zeigerrollen über volle, halbe und Viertelstunden zu Fünfminutenschritten und Zeitspannen.
- Kombinatorik verlangt das aktive Bilden aller gültigen Paarungen. Musteraufgaben wechseln zwischen kleinstem Wiederholungsblock, Fortsetzung und Fehlerstelle, ohne die gesuchte Lösung in der Darstellung vorwegzunehmen.
- Antwortoptionen tragen stabile Fehlvorstellungskennungen. Die Runtime nutzt katalogisierte, vorsichtig formulierte Rückmeldung und zeigt nach dem ersten Fehler eine tragende Hilfe, nach wiederholten Fehlern die Remediation.
- Katalog 0.20.0 und Schema 18 ergänzen `learningPhaseModel`, zulässige Interaktionen und kompetenzspezifische Fehlvorstellungsrouten. Die zentrale Quelle, der öffentliche Katalog, der Fallback und die Curriculum-Matrix bleiben deterministisch identisch.

Lokal erfolgreich geprüft wurden Katalogabgleich, Typecheck, Lint, 372 Unit-/Komponententests, Produktionsbuild und 19 Playwright-Szenarien gegen Vite Preview sowie erneut 19 Szenarien gegen den gehärteten Read-only-Container. Das AMD64-Image `mathe-reise:0.21.0-local` beziehungsweise `mathe-reise:local` (`sha256:29afb3875f6db0cac344c9322a497780947390e4e6bbef5fa74c2e58d772741e`) läuft als UID 101 mit ausschließlich `/tmp` als tmpfs, ohne Capabilities und meldet `healthy`. Einstieg, Manifest, Service Worker, Katalog und Healthcheck wurden erfolgreich abgerufen; MIME-, Cache- und Security-Header entsprechen der Containerkonfiguration. Port 8080 war lokal belegt, daher lief diese Abnahme auf `127.0.0.1:8081`. Podman war nicht installiert; die Compose-Datei wurde mit Docker Compose erfolgreich validiert. WebKit bleibt eine Mobile-Safari-Näherung. Eine Lehrkraftprüfung, Unterrichtserprobung und ein echter iPhone-Test sind nicht erfolgt.

## Darstellungs- und Runtime-Konsistenz 0.20.1

- Es kommt keine neue mathematische Kompetenz hinzu. Produktive Symmetrie endet bei Phase 3 und verwendet ausschließlich gerade Achsendimensionen mit Achsen zwischen Rasterfeldern; die vorbereiteten Achsensonderfälle bleiben nicht produktiv.
- Division trennt Gruppieren und Verteilen in zwei vollständige Modelle. Alle Punkte der Gesamtmenge werden verarbeitet; Gruppenanzahl beziehungsweise Gruppengröße bleiben bis zur richtigen Lösung numerisch unbekannt.
- `representation: none` erzeugt eine ausschließlich in der Remediation sichtbare `scaffold`-Darstellung. Normale Tipps können sie nicht vorzeitig einblenden.
- Modellbezogene Sachaufgabentipps erscheinen nur im sichtbaren Modellschritt. Der Audit aller Darstellungsfamilien ist in `docs/representation-runtime-audit-0.20.1.md` dokumentiert.
- Katalog 0.19.1 bleibt bei Schema 17 und Status `ready-for-review`. Eine Lehrkraftprüfung und ein echter iPhone-Test sind weiterhin nicht erfolgt.

Lokal erfolgreich geprüft wurden Katalogabgleich, Typecheck, Lint, 342 Unit-/Komponententests, Produktionsbuild und 19 Playwright-Szenarien jeweils gegen Vite Preview und den gehärteten Read-only-Container. Das lokale AMD64-Image `mathe-reise:local` (`sha256:cac679388794f65668b7d6625e06f15845ea500c59fdc4a28831b40fc9e8ea53`) läuft als UID 101 mit ausschließlich `/tmp` als tmpfs, ohne Capabilities und meldet `healthy`. Einstieg, Manifest, Service Worker, Katalog und Healthcheck wurden erfolgreich abgerufen; MIME-, Cache- und Security-Header entsprechen der Containerkonfiguration. WebKit bleibt eine Mobile-Safari-Näherung. Podman, ein echtes iPhone und eine externe Lehrkraftprüfung standen nicht zur Verfügung.

## Curriculare Integration 0.20.0

- Es kommt keine neue mathematische Kompetenz hinzu. Eine vollständige Runde enthält weiterhin zwei adaptive Grundaufgaben und jetzt je einen Fokus aus Zahlen, Größen, Daten und Geometrie sowie Sachaufgabe und Symmetrie.
- Die adaptive Gewichtung wirkt innerhalb jeder Fokusgruppe. Fachliche Voraussetzungen für schriftliches Rechnen, Diagramme, Rotation, Falten, Fläche und Umfang bleiben unverändert wirksam.
- Katalog 0.19.0 und Schema 17 werden durch `docs/curriculum-matrix.md` ergänzt. `catalog:build` erzeugt öffentliche Datei, Fallback und Matrix aus derselben zentralen Quelle; `catalog:check` erkennt jede Abweichung.
- Der repositoryweite Integrationslauf erzeugt alle 34 aktiven Kompetenzen auf drei Stufen über jeweils 1.000 Seeds und prüft Lernphase, Anforderungen, Eindeutigkeit, Determinismus und mathematische Rollen.
- Bekannte, unbekannte und aufgedeckte Werte bleiben für alle bestehenden Darstellungen verbindlich getrennt. Es wurde keine externe pädagogische Wirksamkeit validiert.
- Lehrkraftprüfung, Unterrichtserprobung und echter iPhone-Test sind nicht erfolgt und bleiben in #58 und #59 offen. Der unabhängige Katalogkanal aus #38 bleibt nachgelagert.

Lokal erfolgreich geprüft wurden Katalog- und Curriculum-Matrix-Abgleich, Typecheck, Lint, 335 Unit-/Komponententests, Produktionsbuild, Compose-Konfiguration und 18 Playwright-Szenarien jeweils gegen Vite Preview und den Read-only-Container. Der Integrationslauf erzeugte dabei 102.000 Aufgabenvarianten. Das AMD64-Image `mathe-reise:0.20.0` beziehungsweise `mathe-reise:local` läuft als UID 101 mit ausschließlich `/tmp` als tmpfs, ohne Capabilities und meldet `healthy`. Einstieg, Manifest, Service Worker und Katalog besitzen die vorgesehenen MIME-, Cache- und Security-Header. Podman war nicht installiert. WebKit bleibt eine Mobile-Safari-Näherung.

## Ebene Figuren, Muster, Fläche und Umfang 0.19.0

- Die neuen adaptiven Kompetenzen `plane-shapes`, `patterns`, `area` und `perimeter` trennen Form, Regelmäßigkeit, Bedeckung und Randlänge fachlich.
- Drei wirksame Stufen führen von Grundform, AB-Muster und kleinen Rechtecken zu Zusammensetzung, komplexerem Musterblock und unregelmäßigen zusammenhängenden Rasterfiguren.
- Katalog 0.18.0 und Schema 17 ergänzen `planeGeometry`, vollständige Kompetenzakten und mobile Bezeichnungen. Rastervalidierung, Zusammenhang, Fläche und Randberechnung bleiben reine TypeScript-Logik.
- Fläche und Umfang werden erst nach fünf Figurenversuchen und Lernwert 60 ausgewählt. Fehler führen zu einer leichteren verwandten, nicht identischen Aufgabe.
- Außenform, Folge, Einheitsfelder und Randkanten sind bekannte Lerninformationen; Formname, Fortsetzung und Zahlenwert bleiben bis zur richtigen Antwort unbekannt.
- Formeln, Maßstab, freie Konstruktion und komplex zusammengesetzte Umfänge bleiben ausgeschlossen. Eine externe Lehrkraftprüfung und ein echter iPhone-Test sind nicht erfolgt.

Lokal erfolgreich geprüft wurden Katalogabgleich, Typecheck, Lint, 333 Unit-/Komponententests, Produktionsbuild, Compose-Konfiguration und 18 Playwright-Szenarien jeweils gegen Vite Preview und den Read-only-Container. Das AMD64-Image `mathe-reise:0.19.0` beziehungsweise `mathe-reise:local` läuft als UID 101 mit ausschließlich `/tmp` als tmpfs, ohne Capabilities und meldet `healthy`. Einstieg, Manifest, Service Worker und Katalog besitzen die vorgesehenen MIME-, Cache- und Security-Header. Podman war nicht installiert. WebKit bleibt eine Mobile-Safari-Näherung.

## Zeit, Masse und Rauminhalt 0.18.0

- Die neuen adaptiven Kompetenzen `time`, `mass` und `capacity` führen von vertrauten Angaben über Ergänzen zu einfachen Zeitspannen, Summen und Unterschieden.
- Zeit nutzt volle und halbe Stunden, Fünfminutenschritte und vorwärts gerichtete Spannen von 15 bis 90 Minuten. Masse und Rauminhalt bleiben bei ganzzahligen Gramm/Kilogramm und Milliliter/Liter bis 1000 Basiseinheiten.
- Katalog 0.17.0 und Schema 16 ergänzen Uhrtexte und geprüfte alltagsnahe Bezugsgrößen. Zeitrechnung, Mengenrechnung, Eindeutigkeit und Lösungsprüfung bleiben in TypeScript.
- Uhr, Waage und Messgefäß zeigen bekannte Angaben; digitale Uhrzeit, Dauer und gesuchte Menge bleiben bis zur richtigen Antwort visuell und für Screenreader unbekannt.
- Dezimalzahlen, Sekunden, Zeitspannen über Mitternacht, künstliche Umrechnungsserien und komplexe Größensachaufgaben bleiben ausgeschlossen. Eine externe Lehrkraftprüfung und ein echter iPhone-Test sind nicht erfolgt.

Lokal erfolgreich geprüft wurden Katalogabgleich, Typecheck, Lint, 311 Unit-/Komponententests, Produktionsbuild, Compose-Konfiguration und 16 Playwright-Szenarien jeweils gegen Vite Preview und den Read-only-Container. Das AMD64-Image `mathe-reise:0.18.0` beziehungsweise `mathe-reise:local` läuft als UID 101 mit ausschließlich `/tmp` als tmpfs, ohne Capabilities und meldet `healthy`. Einstieg, Manifest, Service Worker und Katalog besitzen die vorgesehenen MIME-, Cache- und Security-Header. Podman war nicht installiert. WebKit bleibt eine Mobile-Safari-Näherung.

## Wahrscheinlichkeit und Kombinatorik 0.17.0

- Die neuen adaptiven Kompetenzen `probability` und `combinatorics` führen von sichtbaren Ergebnisräumen über bekannte Zufallsgeräte zu Häufigkeitsvergleichen sowie von `2×2`-Paarungen zu `3×3` mit genau einer Ausnahme.
- Alle drei Ereignisklassen und beide Vergleichsrichtungen sind katalogisiert. Gleich große Ergebnisfelder werden gezählt; Brüche oder Prozentangaben bleiben ausgeschlossen.
- Katalog 0.16.0 und Schema 15 ergänzen zehn Zufalls- und sechs Kombinationsvorlagen. Klassifikation, Häufigkeitsvergleich, systematisches Zählen und Lösungsprüfung bleiben in TypeScript.
- Die mobile Runtime zeigt Ergebnisfelder und Auswahlmengen vollständig. Klassifikation und Anzahl sind mathematische unbekannte Rollen und werden nicht vorweggenommen.
- Bruchwahrscheinlichkeiten, Baumdiagramme, große Ergebnisräume und empirische Versuchsreihen bleiben ausgeschlossen. Eine externe Lehrkraftprüfung und ein echter iPhone-Test sind nicht erfolgt.

Lokal erfolgreich geprüft wurden Katalogabgleich, Typecheck, Lint, 289 Unit-/Komponententests, Produktionsbuild und 15 Playwright-Szenarien jeweils gegen Vite Preview und den Read-only-Container. Das AMD64-Image `mathe-reise:0.17.0` beziehungsweise `mathe-reise:local` läuft als UID 101 mit ausschließlich `/tmp` als tmpfs, ohne Capabilities und meldet `healthy`. Einstieg, Manifest, Service Worker und Katalog besitzen die vorgesehenen MIME-, Cache- und Security-Header. Podman war nicht installiert. WebKit bleibt eine Mobile-Safari-Näherung.

## Daten und Diagramme 0.16.0

- Die neuen adaptiven Kompetenzen `read-tables` und `read-charts` führen von direktem Tabellenlesen über Strichlisten und Bilddiagramme zu Vergleichen, fehlenden Werten und dem Darstellungswechsel Tabelle zu Säulendiagramm.
- Diagramme werden erst nach mindestens fünf Tabellenversuchen und Lernwert 60 ausgewählt. Schwierigkeit entsteht durch Vergleich, Ergänzen und Darstellungswechsel, nicht bloß durch größere Zahlen.
- Katalog 0.15.0 und Schema 14 ergänzen sechs geprüfte Datensätze sowie verbindliche Beschriftungen. Berechnung, Variation, Eindeutigkeit und Distraktoren bleiben in TypeScript.
- Die mobile Runtime rendert Tabellen, gebündelte Strichlisten, 1:1-Bilddiagramme und gleich skalierte Säulen. Fehlende Werte bleiben bis zur richtigen Lösung maskiert.
- Kreisdiagramme, manipulierte Achsen, freie Diagrammerstellung und eigene Datenerhebungen bleiben ausgeschlossen. Eine externe Lehrkraftprüfung und ein echter iPhone-Test sind nicht erfolgt.

Lokal erfolgreich geprüft wurden Katalogabgleich, Typecheck, Lint, 276 Unit-/Komponententests, Produktionsbuild und 14 Playwright-Szenarien jeweils gegen Vite Preview und den Read-only-Container. Das AMD64-Image `mathe-reise:0.16.0` beziehungsweise `mathe-reise:local` läuft als UID 101 mit ausschließlich `/tmp` als tmpfs, ohne Capabilities und meldet `healthy`. Einstieg, Manifest, Service Worker und Katalog besitzen die vorgesehenen MIME-, Cache- und Security-Header. Podman war nicht installiert. WebKit bleibt eine Mobile-Safari-Näherung.

## Darstellungen ohne vorweggenommene Lösung 0.15.1

- Jede `ExerciseRepresentation` deklariert `knownValues`, `unknownValues` und `revealedValues`. Der zentrale Renderer verwirft unvollständige, überlappende oder unzulässig aufgedeckte Rollen sichtbar.
- Rechenstriche maskieren Ziel- und Zwischenwerte, Nachbaraufgaben beide gesuchten Nachbarn und Ergänzungsaufgaben ihre gesuchten Sprünge. Zugängliche Beschreibungen nennen dieselben Werte ebenfalls nicht.
- Division zeigt Gesamtmenge und bekannte Gruppengröße, aber nicht mehr die gesuchte Anzahl fertig gezeichneter Gruppen. Geld- und Messdarstellungen nennen gesuchte Summen beziehungsweise Längen erst nach richtiger Lösung.
- Katalog 0.14.1 und Schema 13 ergänzen eine buildwirksame `representationPolicy`. Die Regel, der Repository-Audit und Anforderungen an künftige Darstellungen stehen in `docs/representation-policy.md`.
- Der mathematische Kompetenzumfang bleibt unverändert. Eine externe Lehrkraftprüfung, Unterrichtserprobung und ein echter iPhone-Test sind nicht erfolgt.

Lokal erfolgreich geprüft wurden Katalogabgleich, Typecheck, Lint, 261 Unit-/Komponententests, Produktionsbuild, Compose-Konfiguration und 13 Playwright-Szenarien jeweils gegen Vite Preview und den Read-only-Container. Das AMD64-Image `mathe-reise:0.15.1` beziehungsweise `mathe-reise:local` läuft als UID 101 mit ausschließlich `/tmp` als tmpfs, ohne Capabilities und meldet `healthy`. Einstieg, Manifest, Service Worker und Katalog besitzen die vorgesehenen MIME-, Cache- und Security-Header. Podman war nicht installiert. WebKit bleibt eine Mobile-Safari-Näherung.

## Falten und Spiegeln 0.15.0

- Die neue Kompetenz `folding` verbindet das bekannte Spiegelprinzip mit genau einer gerichteten Faltung. Stufe 1 verfolgt einen Punkt an einer senkrechten Achse, Stufe 2 wechselt Achse und bewegte Papierhälfte, Stufe 3 öffnet einen einfachen Faltschnitt zu einem symmetrischen Markierungspaar.
- Katalog 0.14.0 und Schema 12 ergänzen `spatialFolding` mit zehn geprüften Vorlagen, Faltbegriffen, Achsenbezeichnung und konkreten Stufengrenzen. Der Gesamtkatalog bleibt `ready-for-review`; eine Lehrkraftfreigabe wird nicht behauptet.
- Reine TypeScript-Domänenlogik spiegelt Rasterzellen, prüft gerade Achsenmaße und erzeugt aus typischen Fehlvorstellungen genau drei unterschiedliche Ergebnisse.
- Die mobile Rasterdarstellung zeigt die Achse eindeutig zwischen Zellen, die bewegte Papierhälfte und Punkt- beziehungsweise Schnittmarken. Optionen starten neutral und bleiben im Hoch- und Querformat ohne horizontales Overflow.
- Die adaptive Auswahl setzt mindestens Symmetriephase 3 voraus. Fehler führen zu einer anderen, leichteren Einzelfaltung; Mehrfachfaltungen, Körpernetze, mehrere Schnitte und Kippen bleiben ausgeschlossen.

Lokal erfolgreich geprüft wurden Katalogabgleich, Typecheck, Lint, 250 Unit-/Komponententests, Produktionsbuild und 13 Playwright-Szenarien jeweils gegen Vite Preview und den Read-only-Container. Das AMD64-Image `mathe-reise:0.15.0` beziehungsweise `mathe-reise:local` läuft als UID 101 mit ausschließlich `/tmp` als tmpfs, ohne Capabilities und meldet `healthy`. Einstieg, Manifest, Service Worker und Katalog besitzen die vorgesehenen MIME-, Cache- und Security-Header. Podman war nicht installiert. Eine Lehrkraftprüfung, Unterrichtserprobung und ein echter iPhone-Test wurden nicht durchgeführt; WebKit ist nur eine Mobile-Safari-Näherung.

## Würfel und räumliche Rotation 0.14.0

- Die neue Kompetenz `cube-rotation` führt genau eine kontrollierte 90-Grad-Drehung bekannter Würfelgebäude nach links oder rechts um die senkrechte Achse ein. Freie Rotation, Kippen, 180-Grad-Folgen und Falten bleiben ausgeschlossen.
- Katalog 0.13.0 und Schema 11 ergänzen `spatialRotations` mit Richtungsbegriffen, Achsenbeschreibung, zehn geprüften Vorlagen und drei konkreten Stufen. Der Gesamtkatalog bleibt `ready-for-review`; eine Lehrkraftfreigabe wird nicht behauptet.
- Reine TypeScript-Domänenlogik dreht Grundfläche und Stapel, erhält Würfelzahl und Nachbarschaften und verwirft Vorlagen, bei denen Ausgangslage, korrekte Drehung und Gegenrichtung nicht paarweise verschieden sind.
- Stufe 1 nutzt drei einzelne Würfel und nur eine Rechtsdrehung. Stufe 2 ergänzt Links-/Rechtsdrehung und einen Stapel. Stufe 3 verwendet längere Grundformen mit vier bis fünf Würfeln und ähnlichere Fehlzustände.
- Die mobile SVG-Darstellung zeigt Vorder-/Rechtsmarken, gestrichelte senkrechte Achse und einen eindeutigen Vierteldrehungspfeil. Sie bleibt absichtlich statisch, damit die geforderte mentale Rotation nicht interaktiv vorweggenommen wird.
- Die adaptive Auswahl setzt mindestens fünf Körperansichtsversuche und Lernwert 60 voraus. Links und rechts werden ab Stufe 2 als fachlich nützliche Unterkompetenzen gewichtet; Fehler führen auf eine leichtere, andere Vorlage zurück.

Lokal erfolgreich geprüft wurden Katalogabgleich, Typecheck, Lint, 238 Unit-/Komponententests, Produktionsbuild, Compose-Konfiguration und zwölf Playwright-Szenarien jeweils gegen Vite Preview und den Read-only-Container. Das 56,5-MB-AMD64-Image `mathe-reise:0.14.0` beziehungsweise `mathe-reise:local` läuft als UID 101 mit ausschließlich `/tmp` als tmpfs, ohne Capabilities und meldet `healthy`. Einstieg, Manifest, Service Worker und Katalog besitzen die vorgesehenen MIME-, Cache- und Security-Header. Podman war nicht installiert. Eine Lehrkraftprüfung, Unterrichtserprobung und ein echter iPhone-Test wurden nicht durchgeführt; WebKit ist nur eine Mobile-Safari-Näherung.

## Curriculum-Runtime-Synchronisation 0.13.1

- Katalog 0.12.0 und Schema 10 definieren für Sachaufgaben eine verbindliche Runtime-Sequenz: gesuchte Größe, wichtige Angaben, Modell, Rechnung, eigene Berechnung, Plausibilität und Antwortsatz. Nur zweischrittige Geschichten ergänzen katalogisiert eine zweite Gleichung und Berechnung.
- Der Generator baut seine Schritte aus dieser Sequenz. Die frühere, schwierigkeitsabhängige Parallelfolge und das zusätzliche Situationsquiz im Kinderbereich entfallen.
- Balken- und Gruppenmodelle tragen `unknownQuantity`; sie erhalten vor der Berechnung keine Ergebnis- oder Zwischenergebniswerte. Widersprüchliche Modelldaten schlagen sichtbar fehl.
- Antwortkarten starten neutral. Hover gilt nur für feine Zeiger, Touch markiert keine Auswahl, und Fokus liegt nach dem Aufgabenwechsel auf der neuen Überschrift.
- Eine mit `exercise.id` gekeyte interne Komponente verwirft Antwort, Eingabe, Hilfe, Feedback, Teilschritte und Modellzustand vollständig.
- Katalog-, Generator-, Modell-, Komponenten- und WebKit-Tests sichern Sequenz, Pflichtdarstellungen, unbekannte Größen, Fokus und Reset ab.

Eine Lehrkraftprüfung, Unterrichtserprobung und ein echter iPhone-Test wurden nicht durchgeführt. Playwright WebKit ist nur eine Mobile-Safari-Näherung; automatisierte Konsistenzprüfungen belegen keine pädagogische Wirksamkeit.

Lokal erfolgreich geprüft wurden Katalogabgleich, Typecheck, Lint, 223 Unit-/Komponententests, Produktionsbuild und zehn Playwright-Szenarien jeweils gegen Vite Preview und den Read-only-Container. Das AMD64-Image `mathe-reise:0.13.1` beziehungsweise `mathe-reise:local` ist 56,5 MB groß, läuft als UID 101 mit ausschließlich `/tmp` als tmpfs, ohne Capabilities und meldet `healthy`. Einstieg, Manifest, Service Worker und Katalog besitzen die vorgesehenen MIME-, Cache- und Security-Header. Podman war nicht installiert.

## Körperansichten 0.13.0

- Die neue Kompetenz `body-views` verbindet fest ausgerichtete Würfelgebäude aus zwei bis fünf sichtbaren Würfeln mit Vorder-, rechter Seiten- und Draufsicht.
- Drei wirksame Stufen steigern Blickrichtungen, Gebäudekomplexität und Ähnlichkeit der Distraktoren. Freie Rotation und verdeckte Würfel bleiben für spätere Releases ausgeschlossen.
- Katalog 0.11.0 und Schema 9 enthalten geprüfte Gebäudevorlagen, Richtungsbegriffe und didaktische Grenzen; Projektion, Distraktoren und Validierung bleiben reine TypeScript-Logik.
- Die mobile Vektordarstellung markiert vorne und rechts eindeutig. Antwortoptionen verwenden gleichartige Raster und ungültige Darstellungsdaten führen zu einem sichtbaren Fehler.
- Körperansichten werden als eigener Förderbereich adaptiv ausgewählt und benötigen keine künstliche Symmetrie-Sperre. Die statische Darstellung führt keine mentale Drehung vorweg.

Eine Lehrkraftprüfung, Unterrichtserprobung und ein echter iPhone-Test wurden nicht durchgeführt. Automatisierte Konsistenzprüfungen belegen keine pädagogische Wirksamkeit.

Lokal erfolgreich geprüft wurden Katalogabgleich, Typecheck, Lint, 218 Unit-/Komponententests, Produktionsbuild, Compose-Konfiguration und neun Playwright-Szenarien jeweils gegen Vite Preview und den Read-only-Container. Das AMD64-Image `mathe-reise:0.13.0` läuft als UID 101 mit ausschließlich `/tmp` als tmpfs, ohne Capabilities und meldet `healthy`. Einstieg, Manifest, Service Worker und Katalog besitzen die vorgesehenen MIME-, Cache- und Security-Header. Podman war nicht installiert. Eine Lehrkraftprüfung und ein echter iPhone-Test wurden nicht durchgeführt.

## Schriftliche Subtraktion 0.12.0

- Die neue Kompetenz written-subtraction führt dreistellige Aufgaben zunächst ohne Entbündelung, dann mit genau einer sichtbaren Zehner-zu-Einer-Entbündelung und schließlich mit einer selbstständigen Entbündelung aus Zehnern oder Hundertern ein.
- Die H-Z-E-Spaltendarstellung hält das Ergebnis offen. Veränderte Stellen erscheinen in Stufe 2 erst nach dem eigenen Entbündelungsschritt; richtige Ergebnisziffern werden anschließend von rechts nach links sichtbar.
- Stufe 3 schließt mit der Additionsprobe Differenz plus Subtrahend gleich Minuend. Negative Ergebnisse, mehrere Entbündelungen und Entbündeln über Nullstellen bleiben ausgeschlossen.
- Die adaptive Sitzungsplanung aktiviert die Kompetenz erst, wenn Stellenwert und halbschriftliche Subtraktion bis 1000 mindestens independent-practice erreicht haben.
- Katalog 0.10.0 nutzt weiterhin Schema 8. Kompetenzakte, Progressionsübersicht, Katalogtexte, Hilfen, Fehlvorstellungen und Remediation sind synchron zur Runtime.

Lokal erfolgreich geprüft wurden Katalogabgleich, Typecheck, Lint, 205 Unit-/Komponententests, Produktionsbuild, Compose-Konfiguration und acht Playwright-Szenarien jeweils gegen Vite Preview und den Read-only-Container. Das AMD64-Image mathe-reise:0.12.0 läuft als UID 101 mit ausschließlich /tmp als tmpfs, ohne Capabilities und meldet healthy. Einstieg, Manifest, Service Worker und Katalog besitzen die vorgesehenen MIME-, Cache- und Security-Header. Podman war nicht installiert. Eine Lehrkraftprüfung und ein echter iPhone-Test wurden nicht durchgeführt.

## Spaltenfolge und Übertrag 0.11.1

- Ergebnisziffern werden nach korrekter Eingabe von den Einern über die Zehner zu den Hundertern in die Spaltendarstellung übernommen.
- Der Übertrag wird nicht mehr vorweggenommen. Er erscheint erst, nachdem das Kind ihn im eigenen Übertragsschritt korrekt bestimmt hat, und wird anschließend in der Zehnerspalte mitgerechnet.
- Die aktuell bearbeitete Stelle ist sichtbar markiert. Nach dem letzten Schritt steht das vollständig selbst errechnete Ergebnis in der Ergebniszeile.
- Eine Komponentenregression bildet ausdrücklich `618 + 226 = 844` ab; der Mobile-Test prüft dieselbe schrittweise Darstellung bei `375 x 812`.

Katalog `0.9.0` und Schema `8` bleiben unverändert. Eine Lehrkraftprüfung und ein echter iPhone-Test wurden nicht durchgeführt.

Lokal erfolgreich geprüft wurden Katalogabgleich, Typecheck, Lint, 192 Unit-/Komponententests, Produktionsbuild und sieben Playwright-Szenarien jeweils gegen Vite Preview und das AMD64-Image. `mathe-reise:0.11.1` läuft als UID 101 mit Read-only-Rootfs, ausschließlich `/tmp` als tmpfs, ohne Capabilities und meldet `healthy`. Podman war nicht installiert.

## Schriftliche Addition 0.11.0

- Die neue Kompetenz `written-addition` führt dreistellige Summanden zunächst ohne Übertrag, dann mit einem sichtbaren Einerübertrag und schließlich mit genau einem selbstständig erkannten Einer- oder Zehnerübertrag ein.
- Die H-Z-E-Spaltendarstellung zeigt Summanden und gegebenenfalls den Übertrag, lässt das Ergebnis aber offen. Zahlenschritte prüfen Einer, Übertrag, Zehner und Hunderter mit spaltenspezifischem Feedback.
- Die adaptive Sitzungsplanung aktiviert die Kompetenz erst, wenn Stellenwert und halbschriftliche Addition bis 1000 mindestens `independent-practice` erreicht haben.
- Katalog `0.9.0`, Schema `8`, die Kompetenzakte und die fachliche Roadmap dokumentieren Lernziel, Voraussetzungen, Fehlvorstellungen, Progression, Remediation, Grenzen und Gesamtprüfung in Version 0.20.

Lokal erfolgreich geprüft wurden Katalogabgleich, Typecheck, Lint, 191 Unit-/Komponententests, Produktionsbuild, Compose-Konfiguration und sieben Playwright-Szenarien jeweils gegen Vite Preview und den AMD64-Container. Das Image `mathe-reise:0.11.0` und `mathe-reise:local` meldet `amd64`, läuft als UID 101 mit Read-only-Rootfs, ausschließlich `/tmp` als tmpfs, ohne Capabilities und ist `healthy`. Einstieg, Manifest, Service Worker und Katalog besitzen die vorgesehenen MIME-, Cache- und Security-Header. Podman war nicht installiert; eine Lehrkraftprüfung und ein echter iPhone-Test wurden nicht durchgeführt.

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
