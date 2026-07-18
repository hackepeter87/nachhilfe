# Didaktischer Katalog-Runtime-Abgleich

Stand: App 0.26.0, Katalog 0.25.0, Schema 19, Status ready-for-review. Diese Datei ist keine Lehrkraftfreigabe.

## Feldmatrix

| Katalogfeld | Verwendung | Laufzeitwirkung |
| --- | --- | --- |
| `difficultyLevels` | Runtime | Zahlenstruktur, Anforderungen, Darstellung und wirksame Lernphase ändern sich |
| `learningPhaseModel` | Runtime | ordnet jeder Phase eine konkrete Lernhandlung und zulässige Interaktionen zu |
| `learningPhases` | Review | dokumentiert den vollständigen Kompetenzweg; die Runtimephase stammt aus Lernstand und `difficultyLevels[].learningPhase` |
| `misconceptionFeedback` | Runtime | verbindet robuste Antwortmuster mit vorsichtig formuliertem Hinweis und passender Remediation |
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

## Aktive Veränderungen bis 0.26.0

- App 0.26.0, Katalog 0.25.0 und Schema 19: Sachaufgaben verwenden katalogisierte Phasenfolgen und eine selbst eingetragene Rechnung innerhalb des Modellierungsprozesses. Details stehen in `docs/didactic-migration-0.26.0.md`.

- App 0.25.0, Katalog 0.24.0 und Schema 18: Schriftliche Addition und Subtraktion trennen Stellenordnung, Bündelungshandlung, geführtes Verfahren, selbstständigen Übergang und Umkehrprobe. Details stehen in `docs/didactic-migration-0.25.0.md`.

- App 0.24.0, Katalog 0.23.0 und Schema 18: Runden auf Zehner und Hunderter verwendet sechs phasenspezifische Lernhandlungen, maskierte Nachbarwerte in der Aktivierung und einen produktiven Genauigkeitstransfer. Details stehen in `docs/didactic-migration-0.24.0.md`.

- App 0.23.0, Katalog 0.22.0 und Schema 18: Addition, Subtraktion und Ergänzen bis 1000 verwenden sechs phasenspezifische Lernhandlungen, gemeinsame maskierte Zwischenzielmodelle und katalogisierte Fehlvorstellungsrouten. Details stehen in `docs/didactic-migration-0.23.0.md`.

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
- App 0.19.0, Katalog 0.18.0 und Schema 17: Ebene Figuren, Muster, Fläche und Umfang sind vier adaptive Kompetenzen. Einheitsfelder und Außenkanten sind bekannte zählbare Informationen; Formname, Fortsetzung und Zahlenwert bleiben bis zur Antwort unbekannt.
- App 0.20.0, Katalog 0.19.0 und Schema 17: Die Sitzungsplanung wählt je einen Fokus aus Zahlen, Größen, Daten und Geometrie. Eine automatisch erzeugte Curriculum-Matrix und ein 1.000-Seed-Test je aktiver Kompetenz und Stufe sichern den Abgleich; neue mathematische Kompetenzen kommen nicht hinzu.
- App 0.20.1, Katalog 0.19.1 und Schema 17: Produktive Symmetrie verwendet nur Phasen 1 bis 3 mit Achsen zwischen Zellen. Division trennt vollständiges Gruppieren und Verteilen. `scaffold`-Darstellungen und modellbezogene Tipps sind an den tatsächlich sichtbaren Hilfezustand gebunden.
- App 0.21.0, Katalog 0.20.0 und Schema 18: Die erste Korrekturgruppe bindet Lernphasen an unterschiedliche Lernhandlungen. Addition/Subtraktion bis 20, Stellenwert, Zerlegen/Zusammensetzen, Nachbarzehner/-hunderter, Uhrzeit, Kombinatorik und Muster verwenden phasenspezifische Interaktionen und katalogisierte Fehlvorstellungsrouten. Der genaue Umfang und die bewusst offenen Auditbefunde stehen in `docs/didactic-migration-0.21.0.md`.
- App 0.22.0, Katalog 0.21.0 und Schema 18: Multiplikation und Division folgen phasenspezifischen Lernhandlungen. Division führt Gruppieren und Verteilen als getrennte adaptive Unterkompetenzen; Aufgabenfamilien werden im Transfer tatsächlich bearbeitet. Details stehen in `docs/didactic-migration-0.22.0.md`.

## Bewusst deaktiviert

Kippen bleibt unter `preparedTopics` methodisch vorbereitet und steht auf `disabled`. Millimeter/Kilometer, komplexe Kaufsituationen, mehrere gleichzeitige Übergänge, verdeckte Würfel, freie Rotation, Kippen, Mehrfachfaltungen und Körpernetze werden nicht als aktiv dargestellt.

## Menschliche Gesamtprüfung

Erst der zusammenhängende Stand wird anhand von [docs/didactics/teacher-review-package.md](didactics/teacher-review-package.md) beurteilt. Besonders relevant sind Lesbarkeit, Unterrichtsanschluss, Qualität der Hilfen und Erfassbarkeit auf einem echten iPhone.
