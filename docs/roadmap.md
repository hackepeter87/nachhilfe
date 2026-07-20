# Fachliche Roadmap ab 0.21

Stand: 19. Juli 2026. Seit Version 0.21 gilt der [didaktische Qualitätsstandard](didactic-quality-standard.md) verbindlich für jede neue und migrierte Kompetenz. Mathematische Korrektheit ist Voraussetzung; abgeschlossen ist eine Kompetenz erst, wenn die App den zugehörigen Denkprozess aufbaut, begleitet und in einen neuen Zusammenhang übertragen lässt.

Die curriculare Zuordnung folgt dem [Lehrplan Mathematik Primarstufe NRW, Erlass vom 01.07.2021](https://www.schulentwicklung.nrw.de/lehrplaene/lehrplannavigator-primarstufe-neu/lehrplaene.html): Zahlen und Operationen, Raum und Form, Größen und Messen sowie Daten, Häufigkeiten und Wahrscheinlichkeiten werden mit Problemlösen, Modellieren, Argumentieren, Kommunizieren und Darstellen verbunden.

## Ausgangslage

Der Förderkern am Ende von Klasse 3 ist in Version 0.21 bereits breit abgedeckt. Die nächsten Releases erfinden diese Inhalte nicht neu, sondern bringen sie auf einen einheitlichen Qualitätsstand.

**Korrigierter Umsetzungsstand 0.30.2:** Die Migrationen 0.22 bis 0.29 und Version 0.30 haben einen gemeinsamen technischen Vertrag hergestellt. Die manuelle Erprobung hat jedoch gezeigt, dass daraus nicht auf gleichwertige Verständlichkeit oder Förderqualität geschlossen werden darf. Der [kritische Audit 0.30.1](didactic-critical-audit-0.30.1.md) ersetzt diese frühere pauschale Bewertung; 0.30.2 korrigiert zusätzlich die danach gefundenen Befunde bei Kombinatorik, Zahlenstrahl und Sachaufgabenfluss. Neue Kompetenzen bleiben zurückgestellt, bis die Kernabläufe aus Sachrechnen, Grundrechnen, schriftlichen Verfahren, Größen und den beanstandeten Auswahlaufgaben manuell abgenommen sind. Die folgende Releasefolge bleibt als Entwicklungs- und Abnahmehistorie erhalten.

Bereits nach dem Standard 0.21 migriert sind:

- Addition und Subtraktion bis 20
- Stellenwert, Zerlegen und Zusammensetzen
- Nachbarzehner und Nachbarhunderter
- Uhrzeit
- Kombinatorik
- Muster

Der [didaktische Audit 0.20.1](didactic-audit-0.20.1.md) bleibt die historische Befundgrundlage. Der [Konvergenz-Audit 0.30.0](didactic-convergence-audit-0.30.0.md) weist technische Konsistenz nach; seine didaktische Reichweite wird durch den [kritischen Audit 0.30.1](didactic-critical-audit-0.30.1.md) verbindlich begrenzt.

Neue Klasse-4-Inhalte werden nicht allein deshalb vorgezogen, um die Zahl der Kompetenzen zu erhöhen. Schriftliche Multiplikation und Division, mehrere Überträge oder Entbündelungen, komplexe Umrechnungen, Millimeter, Kilometer, Körpernetze und Mehrfachfaltungen bleiben bis nach der Konvergenz des Klasse-3-Förderkerns zurückgestellt.

## Kritische Reihenfolgeentscheidung

Die vorgeschlagene Reihenfolge wird fachlich angepasst:

1. Multiplikation und Division werden gemeinsam migriert. Gleich große Gruppen, Punktefelder, Gruppieren, Verteilen und Umkehraufgaben bilden einen zusammenhängenden Begriffsaufbau.
2. Halbschriftliche Addition, Subtraktion und Ergänzen bis 1000 kommen vor den schriftlichen Verfahren. Eine Spaltennotation darf tragfähige Stellenwert- und Rechenstrategien nicht ersetzen.
3. Runden folgt auf Stellenwert, Nachbarzahlen und Rechnen im Zahlenraum. Dadurch kann es als Abschätzen und Beurteilen von Genauigkeit gelernt werden, nicht als isolierte Endziffernregel.
4. Sachrechnen wird nach der Migration der grundlegenden Operationsvorstellungen gebündelt. Modellieren bleibt jedoch bereits in jedem vorherigen Release ein Transferkriterium.
5. Daten und Wahrscheinlichkeit werden ausdrücklich eingeplant. Sie gehören zum curricularen Förderkern und dürfen nicht hinter Zahlen und Geometrie verschwinden.
6. Die Releasefolge ist keine Reihenfolge für eine Kindersitzung. Die App mischt weiterhin passende vertraute Bereiche; die Reihenfolge steuert nur Entwicklung und Abnahme.

## Releasefolge

| Version | Qualitätsmigration | Verbindlicher Umfang | Bewusst nicht enthalten |
| --- | --- | --- | --- |
| **0.22** | Multiplikatives Denken | Multiplikation und Division aus gleich großen Gruppen; Gruppieren und Verteilen unterscheiden; Tausch-, Nachbar- und Umkehraufgaben als echte Lernhandlungen; unsichere Reihen adaptiv berücksichtigen | schriftliche Multiplikation/Division, Restdivision |
| **0.23** | Rechenstrategien bis 1000 | Addition und Subtraktion ohne und mit einem Stellenübergang; Ergänzen zu Zehnern/Hundertern; Rechenstrich und Stellenwertmaterial aktiv vervollständigen; Strategien vergleichen | mehrere gleichzeitige Übergänge, schriftliche Notation als Einstieg |
| **0.24** | Runden und Abschätzen | Nachbarzehner/-hunderter als Voraussetzung nutzen; Abstände untersuchen; Halbpunkt begründen; Genauigkeit passend zur Situation wählen; Runden auf Zehner und Hunderter | Dezimalzahlen, Rundung ohne Sachbezug als alleiniger Transfer |
| **0.25** | Schriftliche Addition und Subtraktion | Stellen selbst ausrichten; Bündeln und Entbündeln mit Material und Spalte verbinden; genau ein Übertrag beziehungsweise eine Entbündelung; Probe und Fehleranalyse | mehrere Überträge, Entbündeln über mehrere Nullstellen |
| **0.26** | Mathematisches Modellieren | Sachaufgaben von Situation und Suchgröße über eigene Modellvervollständigung und Rechnung bis Plausibilität und Antwort führen; Hinzufügen, Wegnehmen, Ergänzen, Vergleichen, Zusammenfassen, Aufteilen und Verteilen | lange Texte, reine Schlüsselwortstrategien, komplexe Mehrschrittaufgaben |
| **0.27** | Größen und Messen | Geld, Länge, Masse und Rauminhalt über tragfähige Bezugsgrößen, Vergleiche und Messhandlungen migrieren; Uhrzeit integrieren; einfache Größen-Sachaufgaben | Dezimalzahlen, Millimeter, Kilometer, unrealistische eindeutige Schätzwerte |
| **0.28** | Daten und Wahrscheinlichkeit | Tabellen und Diagramme aktiv erstellen, ergänzen und wechseln; Vorhersage, einfache Erprobung und Auswertung bei Wahrscheinlichkeit; Kombinatorik als bereits migrierte Grundlage integrieren | Kreisdiagramme, manipulierte Achsen, Bruchwahrscheinlichkeiten |
| **0.29** | Raum und Form | Ebene Figuren, Fläche, Umfang, Symmetrie, Körperansichten, Rotation und Falten mit Beobachten, Konstruieren und Begründen migrieren; Muster integrieren | freie 3D-Rotation, Körpernetze, Mehrfachfaltungen, Formeltraining |
| **0.30** | Curriculare Konvergenz | keine neue Kompetenz; alle aktiven Kompetenzen erfüllen denselben Standard; domanenübergreifender Transfer, adaptive Folgehandlungen, Curriculum-Matrix und repositoryweiter Audit | Wirksamkeitsbehauptung ohne Erprobung, unabhängiger Remote-Katalogkanal |

Ein Release darf kleiner geschnitten werden, wenn die Abnahme sonst unübersichtlich wird. Eine Kompetenzfamilie darf dabei nicht halb migriert als abgeschlossen markiert werden. Versionsnummern bezeichnen Lieferziele, keine Kalendertermine.

## Abhängigkeiten

- Multiplikation beginnt mit gleich großen Gruppen und strukturierten Feldern; Division nutzt diese Grundvorstellung anschließend für Gruppieren und Verteilen.
- Rechnen bis 1000 setzt Stellenwert, Zerlegen und Zusammensetzen auf Standard 0.21 voraus.
- Schriftliche Verfahren werden erst adaptiv angeboten, wenn die entsprechende halbschriftliche Grundkompetenz mindestens `independent-practice` erreicht hat.
- Runden setzt sichere Nachbarzehner beziehungsweise Nachbarhunderter voraus.
- Sachaufgaben dürfen eine Operation nur verlangen, deren Grundvorstellung zuvor aufgebaut wurde; ein Grundlagenmodus bleibt erreichbar.
- Größenaufgaben trennen zunächst Bezugsgröße, Messen, Vergleichen und Rechnen. Umrechnen ist kein Einstieg.
- Diagramme beginnen mit Daten sammeln und ordnen; das Lesen fertiger Skalen ist nicht der einzige Lernweg.
- Wahrscheinlichkeit verbindet Vorhersage, Ergebnisraum und Auswertung, ohne einzelne Zufallsergebnisse als Gesetz zu deuten.
- Rotation setzt Körperansichten voraus; Falten setzt Spiegelung voraus; Fläche und Umfang setzen das Erkennen und Zusammensetzen ebener Figuren voraus.

## Ein Runtime-Modell

Es entsteht keine zweite Ausführungsarchitektur für neue Kompetenzen. Alle Kompetenzfamilien verwenden dieselben kleinen Interaktionsbausteine:

- auswählen
- markieren
- zuordnen
- ordnen
- Modell vervollständigen
- Zahl eingeben
- Strategie auswählen
- Fehler erkennen

Neue Spezialinteraktionen sind nur zulässig, wenn eine mathematische Handlung mit diesen Bausteinen nicht angemessen darstellbar ist. Lernphase, Darstellung, Fehlvorstellung, Hilfe und Remediation kommen aus dem Katalog; Generator und Runtime führen die mathematische Transformation aus.

Die Migration ist zeitlich begrenzt transparent: Die Curriculum-Matrix weist aus, welche Kompetenzen den Standard 0.21 vollständig erfüllen. Eine noch nicht migrierte Kompetenz bleibt technisch nutzbar, gilt aber nicht als didaktisch neu abgenommen. Spätestens mit 0.30 gibt es keine aktive Kompetenz unterhalb des Standards mehr.

## Arbeitspakete je Milestone

Jeder Milestone besteht aus vier zusammenhängenden Abnahmepaketen. Sie dürfen in einem oder wenigen Issues geführt werden, aber nicht in technische Kleinst-Issues zerfallen.

1. **Didaktik und Katalog:** Lernziel, Voraussetzungen, Fehlvorstellungen, konkrete Lernhandlungen aller sechs Phasen, Progression, Darstellungen, Transfer und Remediation.
2. **Domäne und Runtime:** deterministische Generatoren, Lösungsprüfung, Adaptivität, Fehlvorstellungsrouten und leichtere verwandte Folgehandlungen.
3. **Interaktion und Darstellung:** wiederverwendbare mobile Bedienung; bekannte, unbekannte und aufgedeckte Werte; zugängliche Beschriftung; Hilfe nur zu sichtbaren Darstellungen.
4. **Tests, Audit und Release:** mathematische, curriculare, Komponenten-, Mobile-, Offline-, Persistenz- und AMD64-Containerabnahme sowie dokumentierter didaktischer Vorher-/Nachher-Audit.

## Release-Gate

Eine neue oder migrierte Kompetenz wird nur dann `active`, wenn alle Punkte des [didaktischen Qualitätsstandards](didactic-quality-standard.md) belegt sind. Besonders verbindlich sind:

- Jede Lernphase verlangt eine andere mathematische Handlung; andere Zahlen allein reichen nicht.
- Schwierigkeit entsteht durch Idee, Darstellung, Strategie, Selbstständigkeit oder Transfer, nicht lediglich durch größere Zahlen, mehr Text oder das Entfernen notwendiger Hilfen.
- Fehlvorstellungen beeinflussen Rückfrage, Darstellung oder Remediation. Die App behauptet keine Diagnose.
- Darstellungen zeigen alle bekannten Informationen, maskieren alle unbekannten Werte und werden erst nach Bearbeitung vervollständigt.
- Transfer ist eine bearbeitete und gespeicherte Handlung, kein bloß angezeigter Katalogtext.
- Generatoren laufen je Kompetenz, Stufe und Lernphase über mindestens 1.000 deterministische Seeds, soweit die Aufgabe variiert.
- Mobile Hoch- und Querformatprüfung, Offline-Runde, Reload, IndexedDB, Katalogabgleich, Typecheck, Lint, Tests, Build, E2E und gehärteter AMD64-Container sind bestanden.

Nach jedem Milestone wird der didaktische Audit aktualisiert. Er bewertet mathematische Korrektheit, Verständlichkeit, Lernhandlungen, Darstellungen, Fehlvorstellungen, Transfer und Adaptivität. Ein nicht behobener kritischer Befund blockiert den Kompetenzstatus `active`; eine externe Lehrkraftprüfung blockiert Entwicklung und Release nicht.

## Parallele Entwicklung ohne Qualitätsbruch

Neue curriculare Lücken dürfen parallel bearbeitet werden, wenn die Abhängigkeiten klar sind und die Kompetenz von Beginn an das vollständige Gate erfüllt. Bis 0.30 hat jedoch die Migration Vorrang, weil der Klasse-3-Förderkern bereits breit vorhanden ist. Parallelität bedeutet nicht, mehrere halbfertige Kompetenzpfade produktiv zu schalten.

Gemeinsame Ursachen werden vor Kompetenzdetails gelöst. Beispiele sind ein einheitlicher Interaktionszustand, fehlvorstellungsspezifisches Feedback, mathematische Rollen in Darstellungen, messbarer Transfer und adaptive Wahl der nächsten Lernhandlung. Eine solche Änderung wird an mindestens einer Referenzkompetenz endgültig abgenommen und anschließend auf die betroffenen Familien ausgerollt.

## Evaluation und Nachlauf

Lehrkraftprüfung und echter iPhone-Test bleiben offen, bis sie tatsächlich stattgefunden haben. Die Lehrkraft bewertet das zusammenhängende Curriculum und die Unterrichtssprache; sie ist kein Freigabegremium für einzelne Entwicklungsreleases. Ergebnisse werden als konkrete Korrektur-Issues erfasst.

Nach 0.30 werden nur curricular begründete Erweiterungen geplant. Kandidaten sind schriftliche Multiplikation und Division, mehrere Überträge und Entbündelungen, komplexere Geld- und Größenaufgaben, Millimeter, Kilometer, Körpernetze und weitere Klasse-4-Inhalte. Der unabhängige Remote-Katalogkanal bleibt eine getrennte technische Zukunftsaufgabe.
