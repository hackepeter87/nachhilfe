# Mathematisches Modellieren in Version 0.26.0

Stand: App 0.26.0, Katalog 0.25.0, Schema 19. Die Umsetzung ist intern konsistent geprüft, aber nicht durch eine Lehrkraft evaluiert.

## Fachliche Änderung

Sachaufgaben werden nicht als Rechenartquiz behandelt. Der Lernweg beginnt bei der gesuchten Größe und der Handlung der Geschichte. Das Kind ordnet bekannte Größen in einem Modell, trägt die daraus entstehende Rechnung selbst ein, rechnet und prüft das Ergebnis an der Situation.

| Phase | Mathematische Handlung |
| --- | --- |
| `activate` | gesuchte und bekannte Mengen unterscheiden |
| `understand` | bekannte Größen und offene Suchgröße im Modell untersuchen |
| `guided-practice` | vollständigen Modellierungsweg mit sichtbarem Modell und eigener Rechnung durchlaufen |
| `independent-practice` | passendes Modell aus plausiblen Bildern wählen und die Rechnung selbst eintragen |
| `automate` | eine vertraute Situation ohne erneute Modellwahl sicher in Rechnung und Antwort übertragen |
| `transfer` | unwichtige Angaben oder zwei Veränderungen modellieren und plausibilisieren |

## Katalog und Runtime

`wordProblemSteps.phaseSequences` legt für jede Lernphase die tatsächlich gerenderten Schritte fest. `runtimeSequence` beschreibt weiterhin die vollständige zulässige Reihenfolge und die Pflichtdarstellung. Der Produktionsbuild lehnt fehlende, vertauschte oder unbekannte Schritte ab. Die Runtime erzeugt keine eigene Reihenfolge.

Die neue Interaktion `guided-equation` verlangt eine selbst eingetragene Gleichung. Leerzeichen sind bedeutungslos; `*` und `/` werden zu `·` und `:` normalisiert. Die anschließende Zahleneingabe bleibt eine eigene Lernhandlung.

## Darstellung und Rückmeldung

Balken-, Gruppen- und Verteilmodelle zeigen alle bekannten Mengen, aber nie die gesuchte Zahl. Fehlvorstellungskennungen steuern konkrete Rückmeldungen zu Suchgröße, relevanten Angaben, mathematischer Beziehung, Plausibilität und Antwortsatz. Einzelne Schlüsselwörter entscheiden niemals über die Operation.

## Abgrenzung

Produktiv sind Hinzufügen, Wegnehmen, Zusammenfassen, Vergleichen, Ergänzen, gleich große Gruppen, Verteilen und zwei kurze Veränderungsschritte. Freie Zeichnungen, alternative frei formulierte Rechenwege, längere Lesetexte und automatisch bewertete freie Antwortsätze bleiben ausgeschlossen.
