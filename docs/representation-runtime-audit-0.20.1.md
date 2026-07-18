# Darstellungs- und Runtime-Audit 0.20.1

Stand: App 0.20.1, Katalog 0.19.1, Schema 17. Der Audit ist eine interne Konsistenzprüfung, keine externe pädagogische Evaluation.

## Prüfkette

Für jede aktive Kompetenz wurde die Kette Didaktik -> Katalog -> Generator -> Rollenvertrag -> Runtime -> UI -> Hilfe/Feedback -> Tests geprüft. Mathematische Transformationen und Datenvalidierung bleiben TypeScript; fachliche Ziele, Progression, Sichtbarkeit, Texte und Remediation kommen aus dem Katalog.

## Behobene Inkonsistenzen

| Bereich | Ursache | Korrektur |
| --- | --- | --- |
| Symmetrie | Die Sitzungsplanung schaltete in der Transferphase produktiv auf Phasen 4 und 5 mit Achsen durch Rasterfelder. | Produktive Auswahl endet bei Phase 3. Alle regulären Aufgaben besitzen eine gerade Achsendimension und eine Achse zwischen Zellen. Phasen 4/5 bleiben nur als spätere curriculare Erweiterung dokumentiert. |
| Division | `division-groups` zeigte Gesamtmenge und nur eine Beispielgruppe; der vollständige Gruppierungsprozess fehlte. Gruppieren und Verteilen waren nicht getrennt. | Eigene Renderer `grouping-model` und `sharing-model` zeigen die vollständige Aufteilung. Je nach Situation bleibt Gruppenanzahl oder Gruppengröße numerisch unbekannt. |
| Remediation | Katalogtexte versprachen sichtbare Modelle, obwohl Stufe 3 wegen `representation: none` gar kein Darstellungsobjekt besaß. | Generatoren liefern für `none` eine `scaffold`-Darstellung. Sie erscheint weder initial noch beim Tipp, sondern erst nach wiederholten Fehlern zusammen mit der Remediation. |
| Sachaufgaben-Hilfe | Der zweite globale Tipp konnte ein Balken- oder Gruppenmodell beschreiben, bevor der Modellschritt sichtbar war. | Modellbezogene Tipps sind nur im Modellschritt verfügbar. In der Sachaufgaben-Remediation wird das referenzierte Modell sichtbar gezeigt. |
| Runtime-Sichtbarkeit | Ein allgemeiner Ausdruck `hintsShown > 0` hätte jede vorhandene Darstellung eingeblendet. | Die UI unterscheidet verbindlich `always`, `hint` und `scaffold`. |

## Audit aller Darstellungsfamilien

| Darstellung | Bekannte Information | Unbekannte Information | Ergebnis |
| --- | --- | --- | --- |
| Spiegelbild | Ausgangsfigur, Achsenlage, Antwortkandidaten | richtige Auswahl | Produktiv nur gerade Achsendimensionen; keine Achsenzellen. |
| Rechenstrich/Zahlengerade | Start, bekannte Sprünge oder gegebene Markierung gemäß Aufgabe | Ziel, Nachbarn oder Ergänzung gemäß Rollen | Numerische Beschriftung und zugängliche Beschreibung bleiben maskiert; Sprungziele werden nicht vorgelesen. |
| Balkenmodell | bekannte Teile, Ganzes oder Veränderungen | gesuchter Teil, Unterschied oder Endwert | Unbekannte Segmente tragen `?`; Aufdeckung erst nach erfolgreichem Schritt. |
| Teil-Ganzes-Modell | bekanntes Ganzes und bekannter Teil beziehungsweise bekannte Teile | fehlender Teil oder Ganzes | Gesuchter Wert wird weder im Balken noch im `aria-label` genannt. |
| Gruppierungsmodell | vollständige Gesamtmenge und Gruppengröße | Anzahl der Gruppen | Alle Punkte werden in exakte Gruppen gelegt; nur das numerische Ergebnis bleibt `?`. |
| Verteilmodell | vollständige Gesamtmenge und Gruppenanzahl | Punkte je Gruppe | Alle Punkte werden auf die bekannten Gruppen verteilt; Gruppengröße bleibt numerisch `?`. |
| Punktefelder | Gruppenanzahl und Punkte je Gruppe | Gesamtzahl | Die Grundvorstellung ist vollständig sichtbar; die gesuchte Gesamtzahl bleibt unbeschriftet. |
| Stellenwerttafel | bekannte Ziffern, Stellen und gegebenenfalls Markierung | gesuchter Stellenwert oder Ergebnis | Es werden nur gegebene Stellenwerte dargestellt. |
| Münzbild | einzelne Münzen und gegebenenfalls Preis/Zahlung | zu bestimmender Gesamt- oder Wechselbetrag | Münzen bleiben als zählbares Material sichtbar; Summe bleibt numerisch und zugänglich maskiert. |
| Messstrecke | Nullpunkt, Skala und messbare Strecke | abzulesende Maßzahl | Strecke bleibt als Messgegenstand sichtbar; Maßzahl bleibt `?`. |
| Schriftliche Rechnung | Summanden/Minuend/Subtrahend, aktive Spalte, bestätigter Übertrag/Entbündelung | noch nicht bearbeitete Ergebnisstellen | Ergebnisstellen werden nur schrittweise nach korrekter Eingabe aufgedeckt. |
| Uhr, Masse, Rauminhalt | Zeiger beziehungsweise bekannte Mengen und Vergleichsgrößen | Uhrzeit, Dauer oder gesuchte Menge | Numerisches Ergebnis bleibt bis zur Lösung maskiert. |
| Daten, Zufall, Kombinationen | Datensätze, Versuchsausgänge und Auswahlmengen | fehlender Wert, Klassifikation oder Anzahl | Bekannte Daten vollständig; gesuchte Zahl beziehungsweise Kategorie nicht vorweggenommen. |
| Ebene Geometrie | Figur, Muster, Einheitsfelder und Randweg | Name, Fortsetzung, Fläche oder Umfang | Zähl- und Messgrundlage bleibt sichtbar; Ergebnis bleibt numerisch offen. |

## Verbindliche Tests

- Alle aktiven Generatoren werden je Stufe über 1.000 Seeds auf Determinismus, Rollen und Kataloganforderungen geprüft.
- Produktive Symmetrie wird über 1.000 Seeds je Phase auf gerade Achsendimension, Achse zwischen Zellen, einseitige Ausgangsfigur, eindeutige Spiegelpartner und drei unterschiedliche Optionen geprüft.
- Division wird über alle Stufen und 1.000 Seeds auf beide Grundvorstellungen, restlose vollständige Aufteilung und passende unbekannte Rolle geprüft.
- Renderer-Tests prüfen vollständige Punktmengen, Maskierung, kontrollierte Aufdeckung und sichtbares Scheitern bei widersprüchlichen Daten.
- Komponenten-Tests prüfen `always`, `hint`, `scaffold`, modellbezogene Tipps und vollständigen State-Reset.

## Bewusste Grenzen

- Achsen durch Rasterfelder bleiben katalogisiert, sind aber nicht produktiv erreichbar. Eine spätere Aktivierung benötigt einen eigenen Lernpfad und erneute Abnahme.
- Bildliche und handelnde Darstellungen dürfen eine Menge zähl- oder messbar machen. Sie dürfen den gesuchten Wert nicht zusätzlich numerisch oder zugänglich beschriften.
- Eine Lehrkraftprüfung und ein Test auf einem echten iPhone sind weiterhin offen.
