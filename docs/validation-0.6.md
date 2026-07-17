# Validierung und Konsolidierung 0.6

Stand: App 0.10.0, Katalog 0.8.0, Schema 7. Dieses Dokument trennt automatisierte und interne Prüfungen von noch ausstehenden externen Abnahmen.

## Intern prüfbar

- Katalogquelle, öffentlicher Katalog und eingebetteter Fallback werden deterministisch abgeglichen.
- Generator-, Komponenten-, Persistenz-, Mobile-, Offline- und Containerprüfungen sind Bestandteil der Release-Abnahme.
- Die didaktische Progression und der Runtime-Abgleich nennen nur produktiv wirksame Funktionen.
- Geld und Längen sind seit 0.8 mit eigenen Darstellungen und Grenzwerttests aktiv. Schriftliche Verfahren, mehrere gleichzeitige Übergänge, Millimeter/Kilometer und Raumvorstellung bleiben deaktiviert.

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

Nachweis und Arbeitsstand werden in GitHub Issue #59 geführt. Playwright bei 375 x 812 und 812 x 375 ist eine mobile Browserprüfung, aber kein echter Gerätetest.
