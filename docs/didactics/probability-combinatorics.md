# Wahrscheinlichkeit und Kombinatorik

**Produktstatus 0.32.3:** `combinatorics` ist aktiv. `probability` ist im Katalog auf `disabled` gesetzt und wird weder in Kinderrunden noch im Entwicklungs-Prüfstand ausgewählt. Die folgenden Wahrscheinlichkeitsabschnitte dokumentieren die bisherige fachliche Grundlage und die Anforderungen an eine mögliche Neuentwicklung, nicht einen produktiv freigegebenen Lernweg.

## 1. Bezug zum Förderbedarf
Kinder sollen Zufallssituationen anhand sichtbarer möglicher Ergebnisse beurteilen und kleine Anzahlen von Kombinationen systematisch bestimmen. Begriffe werden an konkrete Versuche gebunden; Bruchwahrscheinlichkeiten sind nicht Teil dieses Lernwegs.
## 2. Lehrplanbereich
Daten, Häufigkeiten und Wahrscheinlichkeiten; Problemlösen, Argumentieren, Kommunizieren und Darstellen.
## 3. Konkretes Lernziel
Produktiv zählt das Kind kleine zweistufige Auswahlmöglichkeiten vollständig und ohne Doppelungen. Das Unterscheiden sicherer, möglicher und unmöglicher Ereignisse bleibt ein curriculares Ziel, ist mit der derzeit deaktivierten Aufgabenfamilie aber nicht Bestandteil der produktiven Runde.
## 4. Voraussetzungen
Sicheres Zählen bis zehn, Verständnis von „alle“, „einige“ und „keine“ sowie strukturiertes Ordnen in Zeilen und Spalten.
## 5. Typische Fehlvorstellungen
Ein sichtbares Ergebnis wird für sicher gehalten; ein nicht sichtbares Ergebnis wird dennoch für möglich gehalten; Farben werden statt gleich großer Felder verglichen; Auswahlmengen werden addiert statt gepaart; eine Paarung wird doppelt gezählt; eine ausgeschlossene Paarung wird mitgezählt.
## 6. Fachliche Kernidee
Ein Ereignis ist sicher, wenn alle möglichen Ergebnisse dazugehören, möglich, wenn mindestens eines dazugehört, und unmöglich, wenn keines dazugehört. Bei zweistufigen Auswahlen wird jedes Element der ersten Menge systematisch mit jedem Element der zweiten Menge gepaart.
## 7. Methodischer Zugang
Der Einstieg nutzt sichtbare Beutelinhalte. Danach folgen Münze, Würfel und Drehscheibe. Erst im Transfer werden zwei Ereignisse anhand gleich großer Ergebnisfelder verglichen. Kombinatorik beginnt mit dem Erkennen einer gültigen Paarung. Danach bildet das Kind alle Paarungen eines `2×2`- beziehungsweise `3×2`-Raums aktiv; erst anschließend wird gezählt. Im Transfer kommt bei `3×3` genau eine sichtbare Ausnahme hinzu.
## 8. Geeignete Darstellungen
Gleichartig dargestellte Ergebnisfelder machen den Ergebnisraum sichtbar. Zwei geordnete Auswahlmengen und auswählbare Paarungskarten machen das systematische Bilden vollständig beobachtbar; ein bloßes Zählen leerer Rasterzellen reicht nicht. Die gesuchte Klassifikation beziehungsweise Anzahl bleibt numerisch und sprachlich unbekannt.
## 9. Lernprogression
Die katalogisierte, derzeit deaktivierte `probability`-Progression reicht vom sichtbaren Beutel über bekannte Zufallsgeräte zum Vergleich gleich großer Ergebnisfelder. Sie genügt nach dem Praxisbefund aus 0.32.3 nicht für eine Reaktivierung. Eine Neuentwicklung muss Vorhersage, tatsächliche Durchführung und Auswertung als zusammenhängende Lernhandlung umsetzen. Produktiv nutzt `combinatorics` die Stufen `2×2`, `3×2` und `3×3` mit genau einer ausgeschlossenen Paarung.
## 10. Aufgabentypen
Produktiv sind ausschließlich die Kombinationsfolgen `combinations-identify-pair`, `combinations-understand-build`, `combinations-2x2`, `combinations-3x2` und `combinations-with-exclusion`. Die Kombinationsaufgaben verwenden `build-pairing`: Das Kind markiert jede gültige Paarung und prüft die vollständige Auswahl. Die sechs Wahrscheinlichkeitstypen von `chance-identify-outcome` bis `chance-predict-and-evaluate` bleiben als nicht produktive Generatorgrundlage im Code, werden aber nicht ausgeliefert.
## 11. Hilfestufen
Die erste Hilfe lenkt auf alle sichtbaren Ergebnisse oder auf eine vollständige Zeile des Paarungsrasters. Die zweite erklärt die Begriffe beziehungsweise das paarweise Vorgehen, ohne die richtige Antwort zu nennen.
## 12. Remediation
Kombinatorik reduziert nach einem Fehler auf zwei mal zwei Möglichkeiten und behält die systematische Reihenfolge bei. Die Folgevariante ist verwandt, aber nicht identisch. Die katalogisierte Probability-Remediation wird wegen des deaktivierten Kompetenzstatus nicht produktiv ausgeführt.
## 13. Transfer
Das Kind begründet einen Vergleich zweier Ereignisse oder erklärt, wie es alle Paarungen gefunden hat. Brüche, Prozentangaben und große Ergebnisräume folgen erst später.
## 14. Wiederholung
Bei Kombinatorik erhöhen niedriger Lernwert, Fehler und lange Abstände das Auswahlgewicht. Vorhandene Probability-Lernstände bleiben lokal erhalten, können die deaktivierte Kompetenz aber nicht erneut auswählen.
## 15. Erfolgskriterien
Für die aktive Kombinatorik wird jede Paarung höchstens einmal gezählt und eine Ausnahme eindeutig markiert. Eindeutige Klassifikationen und Vergleichsrichtungen bleiben technische Regressionen der deaktivierten Generatoren, gelten aber nicht als didaktische Abnahme oder Reaktivierungskriterium. Eine Reaktivierung benötigt zusätzlich eine vollständige interne und manuelle Abnahme des neu entwickelten Lernwegs.
## 16. Grenzen der aktuellen Umsetzung
Wahrscheinlichkeit ist vollständig aus der produktiven Auswahl entfernt. Es gibt keine Bruchwahrscheinlichkeiten, langfristigen empirischen Versuchstabellen, mehrstufigen Zufallsversuche, Baumdiagramme oder großen kombinatorischen Räume.
## 17. Punkte für die Gesamtprüfung
Für Kombinatorik sind Erkennbarkeit der Ausnahme und Bedienbarkeit auf einem echten iPhone zu untersuchen. Wahrscheinlichkeit darf in der Gesamtprüfung dieses Releases nicht als aktive Kompetenz bewertet werden. Eine spätere Neuentwicklung benötigt eine eigene didaktische Prüfung; eine Lehrkraftfreigabe oder Unterrichtserprobung liegt nicht vor.
