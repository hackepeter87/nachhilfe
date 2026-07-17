# Didaktischer Katalog-Runtime-Abgleich

Stand: App `0.10.1`, Katalog `0.8.0`, Schema `7`, Status `ready-for-review`. Diese Datei ist keine Lehrkraftfreigabe.

## Feldmatrix

| Katalogfeld | Verwendung | Laufzeitwirkung |
| --- | --- | --- |
| `difficultyLevels` | Runtime | Zahlenstruktur, Anforderungen, Darstellung und Lernphase ändern sich |
| `learningPhases` | Runtime | jede Stufe benennt ihren didaktischen Schwerpunkt; aktive Phasen referenzieren Aufgabentypen |
| `remediation` | Runtime | Strategie, Folgeschwierigkeit, Darstellung und Unterkompetenzbindung steuern die Folgeaufgabe |
| `successFeedback` / `errorFeedback` | Runtime | konkrete Rückmeldung ohne behauptete Diagnose |
| `releaseStatus` | Runtime | nur `active` wird in Sitzungen geplant |
| `symmetry.progression`, `axisPosition`, `figureComplexity`, `distractorSimilarity` | Runtime | Progressionsphase, Achsenlage, Vorlage, Hilfen und Distraktortransformation ändern sich |
| `workedExample`, `processCompetencies`, `successCriteria` | Review | fachliche Konsistenz und spätere Gesamtprüfung |
| `transferPrompt` | Planned | dokumentiert nächsten sinnvollen Transfer, wird nicht als aktive UI behauptet |

## Aktive Veränderungen bis 0.10.1

- Stellenwert Stufe 3: Ziffer bestimmen, danach Wert der Ziffer bestimmen.
- Runden Stufe 2: Nachbarzahlen und Rundungsergebnis; Stufe 3 zusätzlich Begründung.
- Sachaufgaben: Suchgröße und konkrete Handlung stehen vor einem unbekanntenhaltigen Mengenbild. Erst danach folgen konkrete Gleichung, eigene Zahleneingabe, Plausibilitätsprüfung und Antwortsatz; technische Beziehungskategorien sind nicht mehr Kinderausgabe.
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

## Bewusst deaktiviert

Raumvorstellung bleibt unter `preparedTopics` methodisch vorbereitet und steht auf `disabled`. Millimeter/Kilometer, komplexe Kaufsituationen, mehrere gleichzeitige Übergänge, schriftliche Verfahren, Körperansichten, Kippen und Falten werden ebenfalls nicht als aktiv dargestellt.

## Menschliche Gesamtprüfung

Erst der zusammenhängende Stand wird anhand von [docs/didactics/teacher-review-package.md](didactics/teacher-review-package.md) beurteilt. Besonders relevant sind Lesbarkeit, Unterrichtsanschluss, Qualität der Hilfen und Erfassbarkeit auf einem echten iPhone.
