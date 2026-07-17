# Fachliche Roadmap ab 0.10.1

Stand: 17. Juli 2026. Die Roadmap ordnet die technische Arbeit der fachlichen Lernprogression unter. Eine Kompetenz wird erst produktiv, wenn Didaktik, Katalog, Domäne, Adaptivität, Darstellung, UI, Remediation, Feedback, Tests und Dokumentation vollständig umgesetzt sind.

## Reihenfolge und Begründung

Schriftliche Addition und Subtraktion folgen direkt aufeinander, weil beide Stellenwerttafel, Spaltendarstellung und dieselbe Interaktionslogik verwenden. Erst danach folgt Raum und Form. Daten, Wahrscheinlichkeit, Größen und ebene Geometrie ergänzen die Inhaltsbereiche des NRW-Lehrplans für den Förderkern am Ende von Klasse 3. Anforderungen des vollständigen Klasse-4-Niveaus bleiben nachgelagert.

| Version | Kompetenzbereich | Verbindlicher Umfang | Nicht enthalten |
| --- | --- | --- | --- |
| 0.11 | Schriftliche Addition bis 1000 | Stellen ausrichten; ohne Übertrag; ein sichtbarer und anschließend ein selbstständiger Übertrag | mehrere Überträge |
| 0.12 | Schriftliche Subtraktion bis 1000 | ohne Entbündelung; eine sichtbare und eine selbstständige Entbündelung; Additionsprobe | negative Ergebnisse, Entbündelung über Nullstellen |
| 0.13 | Körperansichten | Würfelgebäude aus 2 bis 5 sichtbaren Würfeln; Vorder-, rechte Seiten- und Draufsicht | mentale Rotation, verdeckte Würfel |
| 0.14 | Würfel und räumliche Rotation | kontrollierte 90-Grad-Drehungen mit sichtbarer Achse und Richtung | freie beliebige Rotation |
| 0.15 | Falten und Spiegeln | eine Faltachse, Punktlage, einfacher Faltschnitt und Aufklappen | Mehrfachfaltungen, Körpernetze |
| 0.16 | Daten und Diagramme | Tabellen, Strichlisten, Bild- und Säulendiagramme lesen, ergänzen und wählen | Kreisdiagramme, manipulierte Achsen |
| 0.17 | Wahrscheinlichkeit und Kombinatorik | sicher/möglich/unmöglich; einfache Zufallsversuche; wenige Kombinationen systematisch bestimmen | Bruchwahrscheinlichkeiten |
| 0.18 | Zeit, Masse und Rauminhalt | Uhrzeiten, einfache Zeitspannen, g/kg und ml/l mit Bezugsgrößen | Dezimalzahlen, Millimeter, Kilometer |
| 0.19 | Ebene Figuren, Muster, Fläche und Umfang | erkennen, zerlegen, zusammensetzen; Einheitsquadrate; Umfang als Randlänge | Formeln, Maßstab |
| 0.20 | Curriculare Integration und Gesamtevaluation | gemischter Transfer, Curriculum-Matrix, iPhone-Test und Gesamtbewertung durch eine Lehrkraft | Wirksamkeitsbehauptung ohne Erprobung |

## Fachliche Abhängigkeiten

- `written-addition` wird erst ab `independent-practice` in Stellenwert und `addition-1000` adaptiv ausgewählt.
- `written-subtraction` benötigt denselben Stellenwertstand sowie `subtraction-1000`.
- Würfelrotation folgt erst nach mindestens fünf Versuchen zu Körperansichten und Lernwert 60.
- Falten setzt mindestens Symmetriephase 3 voraus.
- Diagramme beginnen mit Tabellen; fehlende Werte und Darstellungswechsel folgen später.
- Fläche und Umfang setzen das sichere Erkennen und Zusammensetzen ebener Figuren voraus.
- Schwierigkeit steigt durch eine neue Idee, weniger sichtbare Unterstützung oder höhere Selbstständigkeit, nicht nur durch größere Zahlen oder mehr Text.

## Arbeitspakete je Release

Jede Version besitzt vier prüfbare GitHub-Issues:

1. **Didaktik und Katalog:** Lernziel, Voraussetzungen, Fehlvorstellungen, drei konkrete Stufen, Lernphasen, Remediation, Feedback und Transfer.
2. **Domäne und Adaptivität:** reine Generatoren, Lösungsprüfung, Varianten, fachlich notwendige Unterkompetenzen, Auswahlregeln und leichtere Folgeaufgaben.
3. **Darstellung und UI:** mobile Interaktion, zugängliche Beschriftung, mathematische Grundvorstellung, Hilfen und sichtbare Fehlerzustände.
4. **Tests und Release:** Katalogvalidierung, mindestens 1.000 Seeds je Stufe, Komponenten-, Mobile-, Offline-, Persistenz- und AMD64-Containerabnahme.

Eine Kompetenz erhält erst `active`, wenn diese vier Pakete abgeschlossen sind. Eine externe Einzelabnahme blockiert die Aktivierung nicht.

## Katalog und Schnittstellen

`SkillId` wird nur pro adaptiv relevantem Fachbereich erweitert. Version 0.11 führt `written-addition`, `guided-number` und `column-calculation` ein und erhöht das Katalogschema deshalb auf 8. Version 0.12 nutzt dieselbe Spalteninfrastruktur. Version 0.13 erhöht das Schema auf 9 und ergänzt `spatialViews` mit geprüften Gebäuden; Projektion und Prüfung bleiben TypeScript. Raumthemen bleiben getrennte Kompetenzen für Ansichten, Rotation und Falten. Daten werden später in Tabellen und Diagramme, Stochastik in Wahrscheinlichkeit und Kombinatorik getrennt. Zeit, Masse und Rauminhalt bleiben eigene adaptive Kompetenzen.

Neue Kompetenzen erhöhen die Katalog-Minor-Version. `schemaVersion` steigt nur bei einer tatsächlich genutzten inkompatiblen Datenstruktur. Der Gesamtkatalog bleibt bis zur Evaluation `ready-for-review`; intern vollständig umgesetzte Kompetenzen stehen auf `active`.

## Qualitätsstandard

- Generatorprüfungen laufen über mindestens 1.000 Seeds je Kompetenz und Stufe.
- Lösungen, Wertebereiche und Darstellungen sind eindeutig und vollständig.
- Die drei Stufen unterscheiden sich objektiv in Idee, Unterstützung oder Selbstständigkeit.
- Fehlvorstellungen, Hinweise, Erklärung, Remediation und leichtere Wiederholung werden getestet.
- Playwright prüft `375 x 812` und `812 x 375` ohne horizontales Overflow oder Konsolenfehler.
- Interaktive 3D-Inhalte verwenden lokal gebündeltes Three.js und erhalten Screenshot- sowie Canvas-Pixelprüfungen. Die Körperansichten 0.13 nutzen bewusst ein statisches axonometrisches SVG-Diagramm; freie 3D-Interaktion gehört erst zu späteren Rotationsaufgaben.
- Offline-Runde, Reload, IndexedDB, Katalogabgleich, Typecheck, Lint, Tests, Build, E2E und AMD64-Container werden vor jedem Tag geprüft.
- GHCR veröffentlicht ausschließlich `linux/amd64`.

## Evaluation und Nachlauf

Die offenen Issues zur Lehrkraftprüfung und zum echten iPhone-Test gehören zu 0.20. Die Lehrkraft bewertet das zusammenhängende Curriculum, keine Einzelreleases. Ergebnisse führen zu Korrektur-Issues und gegebenenfalls `0.20.x`. Der unabhängige Katalogkanal bleibt nachgelagert.

Nach 0.20 folgen schriftliche Multiplikation und Division, mehrere Überträge und Entbündelungen, komplexere Geld- und Größenaufgaben, Millimeter, Kilometer, Körpernetze und weitere Klasse-4-Inhalte.
