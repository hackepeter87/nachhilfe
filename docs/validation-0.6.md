# Validierung und Konsolidierung 0.6

Stand: App 0.20.1, Katalog 0.19.1, Schema 17. Dieses Dokument trennt automatisierte und interne Prüfungen von noch ausstehenden externen Abnahmen.

## Intern prüfbar

- Katalogquelle, öffentlicher Katalog und eingebetteter Fallback werden deterministisch abgeglichen.
- Generator-, Komponenten-, Persistenz-, Mobile-, Offline- und Containerprüfungen sind Bestandteil der Release-Abnahme.
- Die didaktische Progression und der Runtime-Abgleich nennen nur produktiv wirksame Funktionen.
- Die automatisch erzeugte Curriculum-Matrix erfasst alle 34 aktiven Kompetenzen; der Integrationslauf erzeugt jede Kompetenz auf allen drei Stufen über jeweils 1.000 Seeds.
- Geld und Längen sind seit 0.8 aktiv. Schriftliche Addition mit höchstens einem Übertrag ist seit 0.11 aktiv; schriftliche Subtraktion mit höchstens einer Entbündelung ist seit 0.12 aktiv. Körperansichten sind seit 0.13, kontrollierte 90-Grad-Würfelrotation seit 0.14, einzelne Faltungen samt einfachem Faltschnitt seit 0.15, Daten seit 0.16, Wahrscheinlichkeit seit 0.17, Zeit/Masse/Rauminhalt seit 0.18 und ebene Geometrie seit 0.19 aktiv. Mehrere gleichzeitige Übergänge, Millimeter/Kilometer, freie Rotation, Kippen, Mehrfachfaltungen und Körpernetze bleiben deaktiviert.

Die konkreten ausgeführten Befehle und Ergebnisse stehen in den Release Notes. Automatisierte Tests ersetzen keine Unterrichtserprobung.

## Offene Lehrkraftprüfung

- [ ] geeignete Lehrkraft und Qualifikation dokumentieren
- [ ] geprüfte App-, Katalog- und Schemaversion festhalten
- [ ] alle produktiven Kompetenzbereiche mit mehreren Stufen stichprobenartig prüfen
- [ ] Sprache, Hilfen, Fehlervorstellungen und Progression beurteilen
- [ ] Befunde mit Aufgabe, Seed und Stufe erfassen
- [ ] Freigabe oder Korrekturbedarf ausdrücklich dokumentieren

Nachweis und Arbeitsstand werden in GitHub Issue #58 geführt. Der Katalogstatus bleibt bis dahin `ready-for-review`; eine Lehrkraftfreigabe wird nicht behauptet.

## Offener echter iPhone-Test

- [ ] Gerät und iOS-Version dokumentieren
- [ ] Installation aus Safari prüfen
- [ ] vollständige Runde im Hochformat durchführen
- [ ] Landscape und Touch-Ziele prüfen
- [ ] App schließen, offline neu starten und Runde abschließen
- [ ] lokale Persistenz nach erneutem Start prüfen
- [ ] Service-Worker-Update nach einer Runde prüfen

Nachweis und Arbeitsstand werden in GitHub Issue #59 geführt. Playwright bei 375 x 812 und 812 x 375 sowie die WebKit-Näherung für Mobile Safari sind Browserprüfungen, aber kein echter Gerätetest.
