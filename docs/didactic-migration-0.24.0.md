# Runden und Abschätzen in Version 0.24.0

Stand: App 0.24.0, Katalog 0.23.0, Schema 18. Die Umsetzung ist intern konsistent geprüft, aber nicht durch eine Lehrkraft evaluiert.

## Fachliche Änderung

Runden auf Zehner und Hunderter wird als Abstandsentscheidung aufgebaut. Die Endziffer ist keine isolierte Regel. Direkte Nachbarn, beide Abstände und der Halbpunkt werden vor dem Rundungsergebnis bearbeitet. Bei gleichem Abstand gilt die dokumentierte Grundschulregel: aufrunden.

| Phase | Mathematische Handlung |
| --- | --- |
| `activate` | direkte Nachbarzehner beziehungsweise Nachbarhunderter bestimmen |
| `understand` | Abstände vergleichen und den Halbpunkt als Gleichstand erkennen |
| `guided-practice` | Nachbarn, Abstandsbegründung und Ergebnis nacheinander bearbeiten |
| `independent-practice` | mit abrufbarem Zahlenstrahl selbstständig runden |
| `automate` | ohne Zeitdruck und ohne sichtbare Darstellung runden |
| `transfer` | in einem Alltagsszenario eine passende ungefähre Angabe auswählen |

## Darstellung und Rückmeldung

Der Zahlenstrahl zeigt in der Aktivierung nur die bekannte Zahl und die Lage innerhalb des Intervalls; die gesuchten Nachbarwerte bleiben maskiert. In späteren Phasen sind beide Kandidaten bekannt, aber keine zusätzliche Ergebnisrolle wird vorweggenommen. Fehlvorstellungsrouten unterscheiden falsche Nachbarn, starres Auf- oder Abrunden, Abrunden am Halbpunkt und eine unpassende Genauigkeitswahl.

## Abgrenzung

Alle Zahlen und numerischen Optionen bleiben im Bereich 0 bis 1000. Dezimalzahlen, wissenschaftliche Diagnoseaussagen und Merksatztraining ohne Abstandsverständnis bleiben ausgeschlossen. Die Alltagstexte prüfen eine vorgegebene passende Genauigkeit; freie Begründungstexte werden noch nicht automatisch ausgewertet.

