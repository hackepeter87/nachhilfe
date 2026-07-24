# Erreichbarkeit der Lehrkraft-Übungsformen 0.32.1

Stand: App 0.32.1, Katalog 0.31.0, Schema 19, Status `ready-for-review`.

## Befund und Ursache

Die in 0.32.0 implementierten Übungsformen waren in Generator und Prüfstand vorhanden, erschienen aber in einer normalen Runde nicht zuverlässig. Pro Runde wurde aus zwölf Zahlenkompetenzen nur eine ausgewählt. Mehrere neue Formen waren zusätzlich ausschließlich an `guided-practice` oder `transfer` gebunden. Damit konnte ein Kind viele Runden bearbeiten, ohne eine der konkret aus den Lehrkraftbeispielen abgeleiteten Lernhandlungen zu sehen.

## Korrektur

Jede normale Runde reserviert einen ihrer vier Fokusplätze für eine Abdeckungsrotation. Über acht abgeschlossene Runden erscheinen:

1. Stellenwertmaterial in die H-Z-E-Tafel übertragen
2. Zahlen vergleichen und ordnen
3. ein Zahlwort als Zahl schreiben
4. Vorgänger, Nachfolger und Nachbarzehner bestimmen
5. Vorgänger, Nachfolger und Nachbarhunderter bestimmen
6. eine Zahlenfolge mit konstanter Schrittweite fortsetzen
7. Addition über den nächsten vollen Zehner
8. Subtraktion über den nächsten vollen Zehner

Der Rotationsindex ist die Zahl der lokal gespeicherten abgeschlossenen Runden. Er bleibt nach Reload und Browserneustart erhalten. Eine nicht abgeschlossene Runde ändert den Index nicht. Die übrigen Fokusplätze, beide Grundaufgaben, Sachaufgabe und Symmetrie bleiben adaptiv geplant. Kompetenzstände werden weder überschrieben noch zurückgesetzt.

## Grenzen

Die Rotation stellt Erreichbarkeit her; sie ist keine Lehrkraftabnahme oder Wirksamkeitsevaluation. Sie ersetzt auch nicht die adaptive Wiederholung erkannter Unsicherheiten. Die erneute vollständige Prüfung auf einem echten iPhone bleibt offen.

## Technische Abnahme

- Katalogabgleich, Curriculum-Matrix, Typecheck, Lint, 476 Unit-/Komponententests und Produktionsbuild sind erfolgreich.
- 20 Playwright-Szenarien gegen Vite Preview und dieselben 20 Szenarien gegen den Container sind erfolgreich. Dazu gehören mobile Hoch-/Querformate, Mobile-Safari-Näherung, Reload, Offline-Neustart und eine vollständige Offline-Runde.
- Das lokal für AMD64 gebaute Image `mathe-reise:0.32.1-local` hat den Digest `sha256:e7e866e15d126bf2653ede969357ad7e6db42eab937768860864d30113b7e286`.
- Der Container lief als UID `101:101` mit Read-only-Rootfs, ausschließlich `/tmp` als tmpfs, ohne Capabilities und mit erfolgreichem Healthcheck.
- Einstieg, Manifest, Service Worker, Katalog und Healthcheck wurden erfolgreich abgerufen. Manifest und Katalog werden revalidiert; der Service Worker wird mit `no-cache, no-store, must-revalidate` ausgeliefert.

Docker Desktop wurde verwendet. Podman war in der Entwicklungsumgebung nicht installiert. Die reale erneute iPhone-Prüfung steht aus.
