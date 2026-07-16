# Didaktischer Katalog-Runtime-Abgleich

Stand: App `0.5.1`, Katalog `0.4.0`, Schema `4`, Status `ready-for-review`. Diese Datei ist keine Lehrkraftfreigabe.

## Feldmatrix

| Katalogfeld | Verwendung | Laufzeitwirkung |
| --- | --- | --- |
| `difficultyLevels` | Runtime | Zahlenstruktur, Anforderungen, Darstellung und Lernphase ändern sich |
| `learningPhases` | Runtime | jede Stufe benennt ihren didaktischen Schwerpunkt; aktive Phasen referenzieren Aufgabentypen |
| `remediation` | Runtime | Strategie, Folgeschwierigkeit, Darstellung und Unterkompetenzbindung steuern die Folgeaufgabe |
| `successFeedback` / `errorFeedback` | Runtime | konkrete Rückmeldung ohne behauptete Diagnose |
| `releaseStatus` | Runtime | nur `active` wird in Sitzungen geplant |
| `workedExample`, `processCompetencies`, `successCriteria` | Review | fachliche Konsistenz und spätere Gesamtprüfung |
| `transferPrompt` | Planned | dokumentiert nächsten sinnvollen Transfer, wird nicht als aktive UI behauptet |

## Aktive Veränderungen in 0.5.0

- Stellenwert Stufe 3: Ziffer bestimmen, danach Wert der Ziffer bestimmen.
- Runden Stufe 2: Nachbarzahlen und Rundungsergebnis; Stufe 3 zusätzlich Begründung.
- Sachaufgaben: Frage, Angaben, Mengenbeziehung, Rechenart, Darstellung, Ergebnis, Antwortsatz und auf Stufe 3 Plausibilität; neu ist gleichmäßiges Verteilen mit Division ohne Rest.
- Remediation: Nach Erklärung folgt eine leichtere verwandte Aufgabe, auf Stufe 1 eine Grundlagenvariante mit sichtbarer Darstellung.
- Wiederholung: zeitlicher Abstand ergänzt Lernwert und Fehlergewicht; eine identische Variante wird nicht direkt wiederholt.

## Bewusst deaktiviert

Geld, Längen und Raumvorstellung sind unter `preparedTopics` und in `docs/didactics/` vollständig methodisch beschrieben, besitzen aber weder Generator noch UI und stehen deshalb auf `disabled`. Schriftliche Verfahren, Entbündeln, Körperansichten, Kippen und Falten werden ebenfalls nicht als aktiv dargestellt.

## Menschliche Gesamtprüfung

Erst der zusammenhängende Stand wird anhand von [docs/didactics/teacher-review-package.md](didactics/teacher-review-package.md) beurteilt. Besonders relevant sind Lesbarkeit, Unterrichtsanschluss, Qualität der Hilfen und Erfassbarkeit auf einem echten iPhone.
