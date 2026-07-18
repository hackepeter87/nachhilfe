# Multiplikatives Denken 0.22.0

Stand: App 0.22.0, Katalog 0.21.0, Schema 18. Diese interne Umsetzung ist nicht extern durch eine Lehrkraft evaluiert.

## Ausgangsbefund

Multiplikation und Division waren mathematisch korrekt und besaßen tragfähige Gruppenmodelle. Die Lernphasen erzeugten jedoch dieselbe Ergebnisaufgabe mit unterschiedlicher Sichtbarkeit. Multiplikation blieb überwiegend Ergebnisabfrage; Division unterschied Gruppieren und Verteilen in der Darstellung, führte beide Grundvorstellungen im adaptiven Lernstand aber gemeinsam.

## Behobene gemeinsame Ursache

Beide Generatoren erhalten die aktive Lernphase und erzeugen daraus unterschiedliche mathematische Handlungen. Die Runtime verwendet dafür bestehende Interaktionen: auswählen, Modell vervollständigen, Zahl eingeben und Strategie auswählen. Es wurde kein zweiter Ausführungspfad und keine neue Spezialkomponente eingeführt.

Stabile Fehlvorstellungskennungen verbinden plausible Fehler mit vorsichtig formulierten Rückfragen. Freie Zahleneingaben werden nur bei robusten Mustern zugeordnet, beispielsweise Addieren der Faktoren oder unvollständiges Aufteilen.

## Lernhandlungen

| Phase | Multiplikation | Division |
| --- | --- | --- |
| `activate` | Anzahl und Größe gleich großer Gruppen erkennen | aus bekannten Größen bestimmen, ob Gruppenanzahl oder Gruppengröße gesucht ist |
| `understand` | Gruppenbild mit wiederholter Addition verbinden | Gruppieren und Verteilen über bekannte und unbekannte Rollen unterscheiden |
| `guided-practice` | mit sichtbarem Gruppenbild rechnen | passenden Arbeitsplan wählen und das vollständige Modell auswerten |
| `independent-practice` | mit Gruppenbild auf Hilfe rechnen | mit Gruppierungs- oder Verteilmodell auf Hilfe rechnen |
| `automate` | verstandene Reihen ohne Zeitdruck abrufen | verstandene Divisionsfamilien ohne Zeitdruck abrufen |
| `transfer` | Tausch- und Umkehraufgabe bilden | Malprobe und zweite Geteiltaufgabe bilden |

## Adaptivität und Remediation

Multiplikation behält den Lernstand je `times-n`. Division unterscheidet nun `division-grouping-by-n` und `division-sharing-by-n`; Unsicherheit in einer Grundvorstellung erhöht nur deren Auswahlgewicht. Nach Fehlern bleibt die passende Darstellung sichtbar. Wiederholte Fehler führen zu einer kleineren verwandten Variante derselben Reihe und Situation.

## Interner Audit

- **Mathematische Korrektheit:** Faktoren, Divisoren und Quotienten bleiben `2..10`; Division bleibt ohne Rest.
- **Lernhandlungen:** Aktivieren, Verstehen und Transfer besitzen eigene Typen und Interaktionen.
- **Darstellungen:** Gesamtmenge und bekannte Rollen sind vollständig; das numerische Ergebnis bleibt bis zur Lösung unbekannt.
- **Fehlvorstellungen:** Faktoren addieren, Gruppenrollen vertauschen, Gruppen auslassen und unpassende Aufgabenfamilien steuern konkrete Rückmeldungen.
- **Transfer:** Zwei Antworten werden tatsächlich bearbeitet und im Versuch berücksichtigt; der Transfer ist kein bloßer Text.
- **Grenzen:** Freies Legen von Punkten und eine Unterrichtserprobung sind nicht erfolgt. Gruppen können im geführten Modell gezählt werden; das ist dort beabsichtigte Strukturhilfe und keine Automatisierungsaufgabe.

## Qualitätssicherung

Generator- und Phasentests laufen über 1.000 Seeds je Phase, prüfen eindeutige Optionen, Wertebereiche und exakte Aufgabenfamilien. Komponentenprüfungen decken Gruppierungsablauf, Transfer und fehlvorstellungsspezifisches Feedback ab. Mobile, Offline-, Persistenz- und Containerabnahme erfolgen im vollständigen Release-Gate.
