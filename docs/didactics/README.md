# Didaktisches Gesamtmodell

Stand: App 0.5.0, Katalog 0.4.0, Schema 4. Verbindliche curriculare Quelle ist der [Lehrplan Mathematik Primarstufe NRW, Erlass vom 01.07.2021](https://www.schulentwicklung.nrw.de/lehrplaene/lehrplannavigator-primarstufe-neu/lehrplaene.html). Die Zuordnung orientiert sich an den Inhaltsbereichen Zahlen und Operationen, Raum und Form sowie Größen und Messen und an den Prozessen Problemlösen, Modellieren, Argumentieren, Kommunizieren und Darstellen.

## Lernphasen

1. `activate`: Vorwissen mit einer vertrauten Aufgabe aufgreifen.
2. `understand`: Handlung, Bild, Sprache und Symbol verbinden.
3. `guided-practice`: kleine Schritte, sichtbare Darstellung und konkrete Hinweise.
4. `independent-practice`: Hilfen reduzieren und Varianten erhöhen.
5. `automate`: Aufgabenfamilien sicher und ohne Zeitdruck abrufen.
6. `transfer`: begründen, Darstellung wechseln oder Alltagssituation lösen.

Die aktive Runtime nutzt geführt üben, selbstständig üben und je Kompetenz Automatisieren oder Transfer. Aktivieren und Verstehen sind vollständig beschrieben und werden bei niedrigem Lernwert über Darstellung, Hinweise und Remediation aufgegriffen. Sie sind noch keine eigenständigen Sitzungsblöcke.

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
