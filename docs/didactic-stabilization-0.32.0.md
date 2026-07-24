# Didaktische Stabilisierung 0.32.0

Stand: App 0.32.0, Katalog 0.31.0, Schema 19, Status `ready-for-review`.

## Ausgangslage

Reale iPhone-Screenshots belegten eine Geldaufgabe ohne sichtbare Münzen sowie unpassende oder zu abstrakte Lernhandlungen. Zusätzlich wurden von einer Lehrkraft bearbeitete Übungsblätter als fachliche Beispiele für Stellenwertmaterial, Zahlzerlegung, Zahlwort, Nachbarzahlen, Zahlenfolgen und den schrittweisen Zehnerübergang bereitgestellt. Die Abbildungen werden nur als Referenz genutzt und nicht in die App oder das Repository übernommen.

Die Beispiele sind keine vollständige Lehrkraftabnahme der Anwendung. Sie zeigen jedoch tragfähige Lernhandlungen, die gegenüber bloßem Ablesen, Abschreiben oder Kategorienraten bevorzugt werden.

## Umgesetzte Korrekturen

### Geld

- Jede Geldaufgabe zeigt die zur Lösung benötigten Münzen oder bei Wechselgeld Preis und Zahlbetrag.
- Der gesuchte Gesamtbetrag beziehungsweise das Wechselgeld bleibt bis zur Bearbeitung maskiert.
- Eine Aufgabe ohne sichtbare Geldinformation kann nicht mehr produktiv erzeugt werden.

### Stellenwert und Zahlverständnis

- Stellenwertmaterial wird zunächst gezählt und anschließend in feste H-, Z- und E-Spalten übertragen.
- Die feste Spalteneingabe verhindert, dass Ziffern beim Bearbeiten zwischen den Stellen verrutschen.
- Zusammensetzen verbindet H/Z/E, Stellenwertzerlegung, Ziffernschreibweise und deutsches Zahlwort.
- Transfer verlangt zuerst den aktiven Vergleich zweier Zahlen mit `<` oder `>` und danach das Ordnen mehrerer verschiedener Zahlen.

### Zahlbeziehungen

- Eine geführte Aufgabe verbindet Vorgänger, Nachfolger, Nachbarzehner und Nachbarhunderter.
- Zahlenstrahlen verwenden den mathematisch passenden lokalen Ausschnitt. Beispielsweise liegt 801 zwischen 800 und 900 unmittelbar hinter 800 und nicht in der Mitte einer Skala von 0 bis 1000.
- Zahlenfolgen besitzen eine konstante sichtbare Schrittweite und verlangen das Fortsetzen der Regel.

### Zehnerübergang

- Addition und Subtraktion zerlegen den zweiten Operanden in den Schritt bis zum vollen Zehner und den verbleibenden Rest.
- Der volle Zehner ist ein bekanntes Zwischenergebnis; die endgültige Lösung bleibt unbekannt.
- Geführte Aufgaben beginnen mit zweistelligen Zahlen. Größere Zahlen bis 1000 folgen erst in selbstständigeren Lernphasen.

## Technische Absicherung

- Die neuen Generatorregeln werden je betroffener Kompetenz und Lernphase über mindestens 1.000 deterministische Seeds geprüft.
- Komponentenprüfungen decken sichtbare Münzen, feste H/Z/E-Eingabe, Zahlwort, Ordnen und lokale Zahlenstrahlpositionen ab.
- Katalogquelle, öffentlicher Katalog, eingebetteter Fallback und Curriculum-Matrix werden aus derselben Quelle erzeugt und gemeinsam geprüft.
- 473 Unit- und Komponententests sowie 20 Playwright-Szenarien gegen Vite Preview sind erfolgreich.
- Dieselben 20 Szenarien einschließlich Offline-Neustart sind gegen das gehärtete AMD64-Container-Image erfolgreich.
- Das lokale Image `mathe-reise:0.32.0-local` hat den Digest `sha256:737c51fb4ebb8566d0360348d224ee2c920cbf3b27b9d9ac92da7c6c1ed11cb9`. Es lief als UID 101 mit Read-only-Rootfs, nur `/tmp` als tmpfs, ohne Capabilities und mit erfolgreichem Healthcheck.
- Hoch- und Querformat-Screenshots bei `375 × 812` und `812 × 375` wurden für Stellenwert, Nachbarhunderter und Zehnerübergang visuell geprüft. Eine dabei gefundene Überlappung zwischen Sprungpfeil und Zwischenzehner wurde vor der finalen E2E-Abnahme korrigiert.

## Grenzen

Die Korrektur ist eine interne fachliche und technische Absicherung. Die Lehrkraft hat weder den vollständigen Katalog noch diese konkrete App-Version abgenommen. Eine erneute Prüfung auf dem echten iPhone, eine Unterrichtserprobung und eine Aussage zur pädagogischen Wirksamkeit stehen aus. Die übrigen Varianten der Familien Zahlen und Modellieren sowie Größen, Daten und Raum bleiben Gegenstand der folgenden manuellen Audits.
