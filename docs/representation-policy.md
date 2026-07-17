# Darstellungsrichtlinie

Stand: App 0.19.0, Katalog 0.18.0, Schema 17.

## Verbindliche Regel

Darstellungen visualisieren bekannte mathematische Informationen. Eine gesuchte Größe wird vor Abschluss des zugehörigen Bearbeitungsschritts weder sichtbar noch in einer zugänglichen Beschreibung numerisch ausgegeben. Nach erfolgreicher Bearbeitung darf die Runtime sie kontrolliert ergänzen.

Jede `ExerciseRepresentation` deklariert deshalb drei Rollen:

- `knownValues`: bekannte Eingaben, die dargestellt werden dürfen.
- `unknownValues`: gesuchte mathematische Rollen oder Werte, die maskiert bleiben.
- `revealedValues`: bereits erfolgreich bearbeitete unbekannte Rollen, die nun sichtbar sein dürfen.

Der Renderer lehnt doppelte, überlappende, unvollständige oder unzulässig aufgedeckte Rollen sichtbar ab. TypeScript verlangt die Rollen für jede neue Darstellung. Generatorentests prüfen alle produktiven Kompetenzen über viele deterministische Varianten.

## Repositoryweiter Befund

| Darstellung | Befund vor 0.15.1 | Regel ab 0.15.1 |
| --- | --- | --- |
| Rechenstrich Addition/Subtraktion | Zielwert stand am Ende und in Sprungbeschreibungen. | Start und Rechenschritt bleiben sichtbar; Ziel und zugängliche Zielbeschreibung bleiben `?` bis zur richtigen Lösung. |
| Rechenstrich bis 1000 | Teilsprünge nannten Zwischen- und Zielwerte. | Rechenschritte dürfen sichtbar sein, numerische Ziele bleiben maskiert. |
| Nachbarzehner/-hunderter | Beide gesuchten Nachbarn waren beschriftet. | Nur die gegebene Zahl ist beschriftet; beide Nachbarn bleiben `?`. |
| Ergänzen | Sprungbeschriftungen ergaben unmittelbar die gesuchte Ergänzung. | Start und bekannte Zielzahl bleiben sichtbar; Sprünge bleiben bis zur Lösung unbekannt. |
| Gruppenbild Division | Die Anzahl gezeichneter Gruppen entsprach bereits dem Quotienten. | Gesamtmenge und eine bekannte Gruppengröße werden gezeigt; die Anzahl der Gruppen bleibt offen. |
| Geld | Der summierte Betrag stand im `aria-label`. | Einzelne bekannte Münzen bleiben sichtbar; der Gesamtbetrag ist visuell und für Screenreader unbekannt. |
| Messstrecke | Der gesuchte Endwert stand als Zahl und im `aria-label`. | Die Strecke bleibt messbar, ihr Zahlenwert wird bis zur Lösung durch `?` ersetzt. |
| Balkenmodelle | Gesuchte Teile waren bereits maskiert. | Die bestehende Maskierung bleibt verbindlich und verwendet dieselben Rollen. |
| Stellenwerttafel | Zeigt bekannte Ziffern beziehungsweise Material, nicht das Rechenergebnis. | Ergebnisrollen werden ausdrücklich unbekannt geführt; bekannte Stellen bleiben sichtbar. |
| Schriftliches Rechnen | Ergebnisziffern wurden schrittweise eingetragen. | `result` bleibt unbekannt; nur erfolgreich bearbeitete Spalten werden ergänzt. |
| Körperansichten, Rotation, Falten und Symmetrie | Ausgangsdaten und auswählbare Kandidaten waren getrennt. | Gesuchte Transformationen werden als unbekannte Rollen geführt; Antwortoptionen bleiben bewusst prüfbare Kandidaten. |
| Uhr, Masse und Rauminhalt | Neu in 0.18. | Zeigerpositionen, Start/Ende und bekannte Mengen sind sichtbar; digitale Uhrzeit, Dauer oder gesuchte Menge bleiben visuell und zugänglich unbekannt. |
| Figuren, Muster, Fläche und Umfang | Neu in 0.19. | Außenform, Folge, belegte Einheitsfelder und Randkanten sind bekannte Lerninformationen; Formname, Fortsetzung und numerischer Wert bleiben unbekannt. |

Bei Rundungsaufgaben dürfen die beiden bekannten Nachbarzahlen als Entscheidungsgrundlage sichtbar sein. Die Darstellung entscheidet jedoch nicht, welche davon das Rundungsergebnis ist. Bei Stellenwertaufgaben darf eine bekannte Ziffer sichtbar sein, auch wenn ihre Zahl zufällig dem gesuchten Stellenwert entspricht; maßgeblich ist ihre mathematische Rolle, nicht bloße Zeichengleichheit.

## Regeln für neue Darstellungen

1. Generator und Renderer verwenden dieselben mathematischen Rollen.
2. Alle Werte eines Darstellungsobjekts werden als bekannt oder unbekannt klassifiziert.
3. Gesuchte Ergebnisse werden nicht als versteckter Text, `aria-label`, Datenattribut oder Beschriftung ausgegeben.
4. Interne Geometrie darf einen unbekannten Messpunkt positionieren, aber nicht numerisch beschriften.
5. Aufdeckung erfolgt ausschließlich über `revealedValues` nach erfolgreicher Bearbeitung.
6. Ungültige Rollen oder Darstellungsdaten erzeugen einen sichtbaren Fehler statt einer fachlich falschen Grafik.
7. Neue Kompetenzen ergänzen Generator-, Renderer-, Komponenten- und mobile E2E-Tests für die Maskierung.

## Abgrenzung

Antwortoptionen zeigen notwendigerweise mögliche Antworten. Diese Kandidaten sind keine vorweggenommene Lösung, solange keine Option vorausgewählt oder als richtig markiert ist. Eine bildliche Grundvorstellung, etwa Punkte in bekannten Gruppen oder die Länge einer zu messenden Strecke, darf mathematische Beziehungen sichtbar machen; sie darf den gesuchten Zahlenwert nicht zusätzlich nennen.

Diese Richtlinie ist intern didaktisch begründet, aber nicht extern durch eine Lehrkraft evaluiert.
