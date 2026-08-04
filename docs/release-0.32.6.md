# Katalog- und Darstellungsabgleich 0.32.6

Stand: lokaler, noch unveröffentlichter Arbeitsstand mit App 0.32.6, Katalog 0.31.3, Schema 19 und Status `ready-for-review`.

## Behobene Befunde

- Ein Subtraktions-Rechenstrich beschriftete die bekannte Ausgangszahl nicht, sobald sie geometrisch am rechten Ende lag. Nun wird jeder Endpunkt nach seiner mathematischen Rolle beschriftet: Bei `7 − 4` bleibt links das gesuchte Ergebnis `?`, rechts ist die bekannte 7 sichtbar. Nach richtiger Lösung erscheint links die 3.
- Mehrschrittige Nachbaraufgaben fragten trotz der Überschrift zu Nachbarzehnern oder Nachbarhundertern zuerst nach Vorgänger und Nachfolger. Der Ablauf fragt jetzt ausschließlich den unteren und den oberen Nachbarzehner beziehungsweise Nachbarhunderter ab. Hinweise, Rückmeldungen und akzeptierte Eingaben beziehen sich auf genau diesen Schritt.
- Rückmeldungen, Tipps, Eingaben und Auswahlen konnten in den nächsten Teilschritt übernommen werden. Jeder Schritt beginnt nun neutral, erhält den Fokus und zeigt nur seine eigene Hilfe und Rückmeldung.
- Divisionsbilder zeigten die gesuchte Anzahl bereits vollständig. Beim Gruppieren ist vor der Antwort nur eine Beispielgruppe bekannter Größe sichtbar; beim Verteilen sind nur die bekannte Anzahl leerer Gruppen sichtbar. Erst nach einer richtigen Antwort wird die vollständige Aufteilung gezeigt. Arbeitsauftrag, Hilfe und Rückmeldung unterscheiden Gruppieren und Verteilen ausdrücklich.
- Die Stellenwertzerlegung eines Zahlworts konnte nicht kanonische Summen wie `600 + 130 + 0` anzeigen. Zahlwörter werden nun ausschließlich in Hunderter, Zehner und Einer zerlegt, Nullsummanden entfallen.
- Ein Kombinatorik-Einstieg zeigte bereits eine ausgefüllte Kreuztabelle und verwendete abstrakte Kategoriesprache. Der Einstieg zeigt nun zwei benannte Auswahlgruppen und einen konkreten kindgerechten Arbeitsauftrag; die systematische Tabelle bleibt späteren Lernphasen vorbehalten.
- Plausibilitätsfragen in Sachaufgaben verwendeten interne Begriffe wie `Gesamtzahl` oder `Teilmenge`. Die Kinderausgabe fragt nun kurz und situationsbezogen, ob das errechnete Ergebnis zur Geschichte passen kann.
- Farbpunkte in Zufallsdarstellungen waren unabhängig von ihrer Beschriftung blau. Die Darstellung verwendet nun die tatsächliche Farbe des jeweiligen Ergebnisses. Die Kompetenz bleibt produktiv deaktiviert.
- Eine fehlerhafte Stellenwert-Ordnungsaufgabe führte als Remediation zu einer anderen Lernhandlung über den Wert einer Nullziffer. Die leichtere Folgeaufgabe ordnet nun drei statt vier Zahlen und behält Vergleich, Richtung, Unterkompetenz und Hilfestrategie bei.
- Der Runtime-Typ wurde bislang pauschal durch den ersten Katalogtyp der Lernphase ersetzt. Ein konkret erzeugter und katalogisierter Typ bleibt nun erhalten.
- `probability` war als Kompetenz deaktiviert, während ihre sechs Unterphasen noch `active` meldeten. Kompetenz und Phasen sind jetzt konsistent deaktiviert; ein solcher Mischzustand ist katalogseitig ungültig.

## Katalogänderungen

- Katalogversion `0.31.3`, unverändertes Schema 19.
- Stellenwert-Förderziel um Vergleichen und Ordnen ergänzt.
- Fehlvorstellungen für erste unterschiedliche Stelle und Richtung des Vergleichszeichens ergänzt.
- `place-value:independent-order` als leichtere Ordnungsfamilie katalogisiert.
- Remediation trennt Ziffernwert und Zahlenordnung ausdrücklich, statt das Lernziel zu wechseln.
- Sachaufgaben-Plausibilitätstexte und Kombinatorik-Auswahlfragen wurden in der zentralen Quelle überarbeitet; öffentlicher Katalog und eingebauter Fallback werden daraus neu erzeugt.

## Prüfung

Lokal erfolgreich ausgeführt wurden:

- `npm run catalog:check`
- `npm run curriculum:check`
- `npm run typecheck`
- `npm run lint`
- `npm test`: 501 Unit- und Komponententests
- `npm run build`: Produktionsbuild und PWA-Precache mit 12 Einträgen
- `npm run test:e2e`: 21 Playwright-Szenarien in Chromium und WebKit
- `docker build --platform linux/amd64 -t mathe-reise:local .`
- gehärteter Containerbetrieb als UID 101 mit Read-only-Rootfs, ohne Capabilities und mit `/tmp` als einzigem `tmpfs`
- Healthcheck sowie Abruf von Einstieg, Manifest, Service Worker und Katalog mit den vorgesehenen MIME-, Cache- und Security-Headern
- `npm run test:e2e:container`: 21 Playwright-Szenarien gegen den gehärteten Container

Das lokale AMD64-Testimage trägt den Tag `mathe-reise:local`. Es wurde kein Git-Tag, GitHub Release oder GHCR-Image erzeugt. Ein erneuter Test dieses Arbeitsstands auf dem echten iPhone und eine externe Lehrkraftprüfung sind nicht erfolgt; WebKit bleibt lediglich eine Mobile-Safari-Näherung.
