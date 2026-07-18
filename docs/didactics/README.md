# Didaktisches Gesamtmodell

Stand: App 0.22.0, Katalog 0.21.0, Schema 18. Verbindliche curriculare Quelle ist der [Lehrplan Mathematik Primarstufe NRW, Erlass vom 01.07.2021](https://www.schulentwicklung.nrw.de/lehrplaene/lehrplannavigator-primarstufe-neu/lehrplaene.html). Die Zuordnung orientiert sich an den Inhaltsbereichen Zahlen und Operationen, Raum und Form, Größen und Messen sowie Daten, Häufigkeiten und Wahrscheinlichkeiten und an den Prozessen Problemlösen, Modellieren, Argumentieren, Kommunizieren und Darstellen. Für alle Kompetenzpfade gilt zusätzlich die [Darstellungsrichtlinie](../representation-policy.md).

Der [didaktische Audit 0.20.1](../didactic-audit-0.20.1.md) bleibt der historische Ausgangsbefund. Die [Korrekturgruppe 0.21.0](../didactic-migration-0.21.0.md) setzt daraus Addition/Subtraktion bis 20, Stellenwert, Zerlegen/Zusammensetzen, Nachbarzehner/-hunderter, Uhrzeit, Kombinatorik und Muster um. [Version 0.22.0](../didactic-migration-0.22.0.md) migriert Multiplikation und Division als gemeinsamen Strang. Die übrigen Auditbefunde bleiben ausdrücklich offen.

Seit 0.21 gelten der [didaktische Qualitätsstandard](../didactic-quality-standard.md) und die [fachliche Roadmap](../roadmap.md) verbindlich. Neue Kompetenzen dürfen nur vollständig nach diesem Standard aktiviert werden. Bestehende Kompetenzen werden familienweise auf dieselbe Runtime und denselben Katalogvertrag migriert; spätestens mit 0.30 darf keine aktive Kompetenz unterhalb dieses Standards verbleiben.

## Lernphasen

1. `activate`: eine tragende Grundlage erinnern oder wiedererkennen.
2. `understand`: eine mathematische Beziehung untersuchen und Bild, Sprache sowie Symbol verbinden.
3. `guided-practice`: mit sichtbarer Struktur und kleinen eigenen Schritten lösen.
4. `independent-practice`: dieselbe Kernidee selbstständig anwenden.
5. `automate`: eine verstandene Aufgabenfamilie ohne Zeitdruck abrufen.
6. `transfer`: die Idee in einem neuen Zusammenhang anwenden oder eine Strategie auswählen.

Die aktive Runtime bindet jede Aufgabe an eine Lernphase und übernimmt die zugehörige `learningAction` aus dem Katalog. Lernphasen ändern dadurch nicht nur Zahlengröße, sondern Aufgabe, Interaktion, Darstellung und Grad der Selbstständigkeit. Der Übergang in Transfer erfolgt erst bei sicherem Status und einem Lernwert ab 92. Die Phasen bleiben eine Produktheuristik und keine Diagnose.

## Hilfestufen

| Stufe | Wirkung |
| --- | --- |
| 0 | eigener Lösungsversuch |
| 1 | Aufmerksamkeit auf die relevante Zahl, Stelle oder Beziehung lenken |
| 2 | passende Strategie benennen, ohne das Ergebnis vorzugeben |
| 3 | nach zwei Fehlern konkrete Erklärung und Darstellung zeigen |
| 4 | leichtere verwandte Variante derselben Unterkompetenz einfügen |
| 5 | auf Stufe 1 mit sichtbarer Grundvorstellung neu aufbauen |

Die Hilfe ist eine Produktheuristik, keine Diagnose. Der Katalog beschreibt mögliche Fehlvorstellungen; die App behauptet nicht, deren Ursache sicher erkannt zu haben.

## Wiederholung

Der Lernstand unterscheidet abgeleitet `new`, `building`, `review`, `secure` und `overdue`. Fehler und niedriger Lernwert erhöhen das Auswahlgewicht. Nach drei Tagen wird ein noch unsicherer Inhalt zur Wiederholung berücksichtigt, nach sieben Tagen ein sicherer Inhalt, nach 14 Tagen jeder bearbeitete Inhalt. Fehler senken die Schwierigkeit; mehrere richtige Antworten erhöhen sie. Es gibt keinen Zeitdruck und keine Schulnote.

## Status

- `draft`: inkonsistent oder in Entwicklung.
- `ready-for-review`: intern vollständig und geprüft, aber nicht produktiv ausgewählt.
- `active`: Generator, Katalog, UI und Tests stimmen überein.
- `disabled`: bewusst nicht im Kinderbereich.

`active` ist keine externe Lehrkraftfreigabe. Die Gesamtprüfung erfolgt erst mit dem vollständigen [Review-Paket](teacher-review-package.md).

Die aktuellen Kompetenzpfade stehen unter anderem in [data-tables-charts.md](data-tables-charts.md), [probability-combinatorics.md](probability-combinatorics.md), [time-mass-capacity.md](time-mass-capacity.md) und [plane-geometry.md](plane-geometry.md). Die [curriculare Integration](curricular-integration.md) beschreibt die gemischte Runde; die [Curriculum-Matrix](../curriculum-matrix.md) wird automatisch aus dem Katalog erzeugt.
