# Validierung und Konsolidierung 0.6

Stand: App 0.15.0, Katalog 0.14.0, Schema 12. Dieses Dokument trennt automatisierte und interne Prüfungen von noch ausstehenden externen Abnahmen.

## Intern prüfbar

- Katalogquelle, öffentlicher Katalog und eingebetteter Fallback werden deterministisch abgeglichen.
- Generator-, Komponenten-, Persistenz-, Mobile-, Offline- und Containerprüfungen sind Bestandteil der Release-Abnahme.
- Die didaktische Progression und der Runtime-Abgleich nennen nur produktiv wirksame Funktionen.
- Geld und Längen sind seit 0.8 aktiv. Schriftliche Addition mit höchstens einem Übertrag ist seit 0.11 aktiv; schriftliche Subtraktion mit höchstens einer Entbündelung ist seit 0.12 aktiv. Körperansichten sind seit 0.13, kontrollierte 90-Grad-Würfelrotation seit 0.14 und einzelne Faltungen samt einfachem Faltschnitt seit 0.15 aktiv. Mehrere gleichzeitige Übergänge, Millimeter/Kilometer, freie Rotation, Kippen, Mehrfachfaltungen und Körpernetze bleiben deaktiviert.

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
