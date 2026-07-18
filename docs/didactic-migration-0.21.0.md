# Didaktische Korrekturgruppe 0.21.0

Stand: App 0.21.0, Katalog 0.20.0, Schema 18. Diese interne Umsetzung ist nicht extern durch eine Lehrkraft evaluiert.

## Ausgangsbefund

Der Audit 0.20.1 zeigte drei wiederkehrende Systemursachen: Lernphasen veränderten häufig nur Zahlenraum oder Sichtbarkeit, Darstellungen blieben zu passiv, und Fehlvorstellungen waren katalogisiert, steuerten aber die konkrete Rückmeldung nicht zuverlässig. Uhr, Kombinatorik und Muster hatten zusätzlich fachlich zu grobe Lernsprünge.

## Gemeinsames Modell

Der Katalog definiert für jede Lernphase eine konkrete `learningAction` und zulässige, wiederverwendbare Interaktionen. Produktiv verwendet werden unter anderem Auswählen, Markieren, Modell vervollständigen, geführte Zahleneingabe, Strategie wählen, Paarungen bilden und Folgen fortsetzen. Rechenlogik bleibt in TypeScript.

Antwortoptionen können eine stabile `misconceptionId` tragen. Bei einer falschen Auswahl verwendet die Runtime den dazu katalogisierten, vorsichtig formulierten Hinweis. Bei freien Zahleneingaben erkennt TypeScript nur robuste Fehlermuster, etwa ausgelassenen Zehnerübergang oder Verwechslung von Ziffer und Stellenwert. Die App behauptet keine sichere Diagnose.

Produktiv geroutet werden derzeit:

- Addition/Subtraktion: Rechenart beziehungsweise Zahlenreihenfolge verwechselt, Übergangsschritt oder Zählstart fehlerhaft.
- Stellenwert/Zerlegen/Zusammensetzen: Ziffer statt Wert, Stelle vertauscht, Ziffern ohne Stellenwert oder Platzhalternull ausgelassen.
- Nachbarzahlen: falsches Intervall, nur eine Seite betrachtet oder Zehner statt Hunderter verwendet.
- Uhrzeit: Zeigerrollen vertauscht oder Dauer nur aus Minutenangaben subtrahiert.
- Kombinatorik: Paarung fehlt, doppelt, aus derselben Gruppe oder trotz Ausschluss gewählt.
- Muster: nur letztes Zeichen wiederholt, Blockreihenfolge vertauscht oder wachsendes mit periodischem Muster verwechselt.

Die stabilen IDs stehen im zentralen Katalog, beispielsweise `addition-bridge-step`, `place-value-digit-as-value`, `neighbor-tens-wrong-interval`, `time-hands-swapped`, `combinations-duplicate` und `patterns-block-order`.

Nach dem ersten Fehler wird eine tragende Hilfe sichtbar und ein eigener neuer Versuch bleibt möglich. Nach wiederholten Fehlern folgt die schrittweise Remediation. Aufgabe, Auswahl, Fokus, Hinweise und Modellzustand werden beim Aufgabenwechsel zurückgesetzt.

## Migrierte Kompetenzen

| Bereich | Aktivieren und Verstehen | Üben, Automatisieren und Transfer |
| --- | --- | --- |
| Addition bis 20 | Ergänzen zur 10 und passende Zerlegung erkennen | in zwei Sprüngen über 10 rechnen; später Tauschaufgabe nutzen |
| Subtraktion bis 20 | Teil-Ganzes-Beziehung und Zerlegung bis 10 erkennen | in zwei Sprüngen bis 10 und weiter; später Plusprobe nutzen |
| Stellenwert | gebündeltes Material einer Zahl zuordnen | Ziffer, Stelle und Wert verbinden; Änderung einer Stelle untersuchen |
| Zerlegen/Zusammensetzen | Material und Stellenwertsumme verbinden | kanonische und nichtkanonische Zehnerbündelungen bearbeiten |
| Nachbarzehner/-hunderter | volle Referenzzahlen erkennen | Intervallgrenzen nacheinander aufdecken; danach Nähe begründen |
| Uhrzeit | Stunden- und Minutenzeiger unterscheiden | volle, halbe, Viertel- und Fünfminutenzeiten; zuletzt Zeitspannen |
| Kombinatorik | gültige Paarung erkennen | alle Paarungen aktiv bilden, prüfen und anschließend zählen |
| Muster | kleinsten Wiederholungsblock finden | Folge fortsetzen; im Transfer eine fehlerhafte Stelle identifizieren |

Die analoge Uhr berechnet den Stundenzeiger kontinuierlich: Zu jeder Minute bewegt er sich um 0,5 Grad weiter. Dadurch stehen die Zeiger bei 1:30 und 1:45 fachlich korrekt zwischen den Stundenmarken.

## Bewusst offen

Die übrigen Aufgabenarten sind noch nicht vollständig auf dieses Lernhandlungsmodell migriert. Insbesondere Multiplikation/Division, Rechnen bis 1000, Sachaufgaben, Runden, schriftliche Verfahren, Größen, Daten und weitere Geometriebereiche behalten vorerst ihre bestehende geprüfte Runtime. Sie werden nicht als bereits didaktisch neu abgenommen dargestellt.

## Qualitätssicherung

Die Migration prüft phasenabhängige Aufgabentypen, deterministische Varianten, nichtkanonische Zerlegungen, schrittweises Aufdecken von Nachbargrenzen, exakte Uhrzeigerwinkel, aktives Paaren, Mustertransfer, Fehlvorstellungsfeedback und vollständigen Zustandsreset. Katalogquelle, öffentlicher Katalog, eingebetteter Fallback und Curriculum-Matrix werden weiterhin gemeinsam erzeugt und abgeglichen.

Ein echter iPhone-Test, eine Unterrichtserprobung und eine externe Lehrkraftprüfung sind nicht erfolgt.
