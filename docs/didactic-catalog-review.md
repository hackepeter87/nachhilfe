# Didaktischer Katalog-Runtime-Abgleich

Stand: App 0.18.0, Katalog 0.17.0, Schema 16, Status ready-for-review. Diese Datei ist keine Lehrkraftfreigabe.

## Feldmatrix

| Katalogfeld | Verwendung | Laufzeitwirkung |
| --- | --- | --- |
| `difficultyLevels` | Runtime | Zahlenstruktur, Anforderungen, Darstellung und wirksame Lernphase ändern sich |
| `learningPhases` | Review | dokumentiert den vollständigen Kompetenzweg; die Runtimephase stammt aus Lernstand und `difficultyLevels[].learningPhase` |
| `remediation` | Runtime | Strategie, Folgeschwierigkeit, Darstellung und Unterkompetenzbindung steuern die Folgeaufgabe |
| `successFeedback` / `errorFeedback` | Runtime | konkrete Rückmeldung ohne behauptete Diagnose |
| `releaseStatus` | Runtime | nur `active` wird in Sitzungen geplant |
| `wordProblems[].modelType`, `modelHint`, Gleichungen und Feedback | Runtime | bestimmen Modell, Hilfe, Rechnung und konkrete Rückmeldung |
| `wordProblems[].situation` / `situationDistractors` | Review | fachlicher Konsistenztext; bewusst keine zusätzliche Kinderauswahl |
| `wordProblemSteps.runtimeSequence` | Runtime | alleinige Reihenfolge, Interaktion, Pflichtdarstellung und optionale Zweitschritte |
| `wordProblemSteps.modellingProgression` | Review | begründet die acht fachlichen Stationen |
| `symmetry.progression`, `axisPosition`, `figureComplexity`, `distractorSimilarity` | Runtime | Progressionsphase, Achsenlage, Vorlage, Hilfen und Distraktortransformation ändern sich |
| `spatialViews` | Runtime | geprüfte Würfelgebäude, Blickrichtungen und Stufengrenzen steuern Projektion und Antwortdarstellungen |
| `spatialRotations` | Runtime | geprüfte Ausgangsgebäude, 90-Grad-Richtung, Achsenbezeichnung und Stufengrenzen steuern Transformation und Folgezustände |
| `spatialFolding` | Runtime | Einzelfaltung, Achse, bewegte Papierhälfte und Faltschnittvorlagen steuern Spiegeltransformation und Ergebnisraster |
| `representationPolicy` | Runtime | alle Renderer trennen bekannte, unbekannte und erst nach Erfolg aufgedeckte Größen |
| `workedExample`, `processCompetencies`, `successCriteria` | Review | fachliche Konsistenz und spätere Gesamtprüfung |
| `transferPrompt` | Planned | dokumentiert nächsten sinnvollen Transfer, wird nicht als aktive UI behauptet |

## Aktive Veränderungen bis 0.17.0

- Stellenwert Stufe 3: Ziffer bestimmen, danach Wert der Ziffer bestimmen.
- Runden Stufe 2: Nachbarzahlen und Rundungsergebnis; Stufe 3 zusätzlich Begründung.
- Sachaufgaben: Suchgröße und wichtige Angaben stehen vor einem unbekanntenhaltigen Mengenbild. Danach folgen konkrete Gleichung, eigene Zahleneingabe, Plausibilitätsprüfung und Antwortsatz; diese Reihenfolge kommt ausschließlich aus `runtimeSequence`.
- Remediation: Nach Erklärung folgt eine leichtere verwandte Aufgabe, auf Stufe 1 eine Grundlagenvariante mit sichtbarer Darstellung.
- Wiederholung: zeitlicher Abstand ergänzt Lernwert und Fehlergewicht; eine identische Variante wird nicht direkt wiederholt.
- Rechnen bis 1000: Einer- und Zehnerübergänge führen über eine ausgewählte volle Zwischenzahl und ein getrennt geprüftes Ergebnis; Subtraktion entbündelt höchstens an einer Stelle.
- Sachrechnen: Zwei kurze Vorlagen verbinden zwei Handlungen. Zwischenergebnis, zweite konkrete Gleichung und Endergebnis werden getrennt und per Zahleneingabe geprüft.
- Lernphasen: Der gespeicherte Phasenstand bestimmt jetzt die Generatorschwierigkeit und Sichtbarkeit der Darstellung, nicht nur eine Metadatenangabe.
- Geld: Stufe 1 zählt ganze Euro in einer geprüften Münzdarstellung, Stufe 2 verbindet Euro und Cent, Stufe 3 bestimmt Wechselgeld aus 10 Euro ohne vorweggenommene Darstellung.
- Längen: Stufe 1 liest eine Zentimeter-Messstrecke, Stufe 2 wechselt zwischen Metern und Zentimetern, Stufe 3 addiert oder vergleicht Längen mit gemeinsamer Einheit.
- Katalogschema 5: `quantityContent` liefert fachliche Aufgaben-, Erklärungs- und Darstellungsbegriffe für beide Größenkompetenzen; Mathematik und Einheitenprüfung bleiben in TypeScript.
- Katalogschema 6: Sachaufgaben definieren konkrete Situationen, Modelltypen, Modellalternativen, Gleichungen und eine siebenstufig dokumentierte Modellierungsfolge; Rendering und Mathematik bleiben in TypeScript.
- Sachaufgabenmodell 0.9.1: Veränderungsbalken verwenden die tatsächlichen Mengenverhältnisse; positives Zwischenfeedback ist grün, Korrekturfeedback bleibt rot.
- Katalogschema 7: Symmetrie trennt Rasterdimension, relevante Parität, Achsenposition, Figurenkomplexität und Distraktorähnlichkeit. Gerade Raster bilden den Einstieg; Achsen durch Zellen werden erst im sicheren Transfer aktiv.
- Symmetrie-UI 0.10.0: Die grüne Achse ist in Vorlage und Optionen sichtbar. Achsen zwischen Zellen sind durchgezogen, spätere Achsen durch Zellen gestrichelt.
- Katalogschema 8 und App 0.11.0: Schriftliche Addition verwendet drei wirksame Stufen, geführte Zahlenschritte und eine ergebnisoffene H-Z-E-Spaltendarstellung. Die adaptive Auswahl prüft zuvor Stellenwert und halbschriftliche Addition.
- App 0.11.1: Ergebnisziffern werden von rechts nach links erst nach korrekter Eingabe sichtbar; der Übertrag erscheint erst nach dem eigenen Übertragsschritt.
- App 0.12.0: Schriftliche Subtraktion arbeitet ohne oder mit genau einer Entbündelung. Stufe 2 macht die veränderten Stellen nach dem eigenen Entbündelungsschritt sichtbar; Stufe 3 verlangt die Entbündelung selbstständig und schließt mit der Additionsprobe.
- App 0.13.0 und Schema 9: Körperansichten verbinden katalogisierte Gebäude mit berechneter Vorder-, rechter Seiten- und Draufsicht. Die Stufen steigern Blickrichtungen und Gebäudekomplexität; Rotation und verdeckte Würfel bleiben deaktiviert.
- App 0.13.1 und Schema 10: Sachaufgaben verwenden eine katalogisierte, einheitliche Runtime-Sequenz. `unknownQuantity` verhindert Ergebnislecks in Balken- und Gruppenmodellen. Neue Aufgaben remounten ihren lokalen Zustand; Fokus, Hover und Touch gelten nicht als Auswahl.
- App 0.14.0 und Schema 11: `cube-rotation` dreht katalogisierte Gebäude kontrolliert um 90 Grad nach links oder rechts. Achse und Richtung bleiben sichtbar; Ausgangslage, korrekte Drehung und Gegenrichtung müssen paarweise verschieden sein. Die adaptive Auswahl setzt fünf Körperansichtsversuche und Lernwert 60 voraus.
- App 0.15.0 und Schema 12: `folding` verfolgt einen Punkt bei genau einer gerichteten Faltung und öffnet auf Stufe 3 einen einfachen Faltschnitt. Gerade Raster halten die Achse zwischen Zellen; die adaptive Auswahl setzt Symmetriephase 3 voraus.
- App 0.15.1 und Schema 13: Jede Darstellung deklariert mathematische Rollen. Rechenstrich, Nachbarzahlen, Ergänzen, Division, Geld und Messstrecke maskieren gesuchte Werte auch in Screenreader-Texten; widersprüchliche Rollen schlagen sichtbar fehl.
- App 0.16.0, Katalog 0.15.0 und Schema 14: Tabellenlesen, Strichlisten, Bild- und Säulendiagramme sind als zwei adaptive Kompetenzen aktiv. Diagramme setzen tragfähiges Tabellenlesen voraus; fehlende Werte bleiben maskiert.
- App 0.17.0, Katalog 0.16.0 und Schema 15: Wahrscheinlichkeit klassifiziert sichtbare Ergebnisräume und vergleicht gleich große Felder. Kombinatorik zählt kleine Paarungen systematisch und markiert auf Stufe 3 genau eine ausgeschlossene Paarung; Klassifikation und Anzahl bleiben bis zur Antwort unbekannt.
- App 0.18.0, Katalog 0.17.0 und Schema 16: Zeit, Masse und Rauminhalt verwenden getrennte adaptive Kompetenzen. Uhr, Waage und Messgefäß zeigen ausschließlich bekannte Angaben; Uhrzeit, Zeitspanne oder Mengenwert bleiben bis zur richtigen Antwort unbekannt.

## Bewusst deaktiviert

Kippen bleibt unter `preparedTopics` methodisch vorbereitet und steht auf `disabled`. Millimeter/Kilometer, komplexe Kaufsituationen, mehrere gleichzeitige Übergänge, verdeckte Würfel, freie Rotation, Kippen, Mehrfachfaltungen und Körpernetze werden nicht als aktiv dargestellt.

## Menschliche Gesamtprüfung

Erst der zusammenhängende Stand wird anhand von [docs/didactics/teacher-review-package.md](didactics/teacher-review-package.md) beurteilt. Besonders relevant sind Lesbarkeit, Unterrichtsanschluss, Qualität der Hilfen und Erfassbarkeit auf einem echten iPhone.
