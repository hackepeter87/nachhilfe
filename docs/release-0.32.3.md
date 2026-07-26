# Deaktivierung der Zufallsaufgaben 0.32.3

Stand: App 0.32.3, Katalog 0.31.2, Schema 19, Status `ready-for-review`.

## Entscheidung

Der Bereich „Zufall einschätzen“ wird nicht mehr in produktiven Runden angeboten. Die wiederholte manuelle Prüfung hat gezeigt, dass die vorhandenen Aufgaben trotz mathematischer Korrektheit keinen ausreichenden Förderwert besitzen. Eine weitere sprachliche Einzelkorrektur wäre dafür nicht ausreichend.

## Technische Umsetzung

- `probability.releaseStatus` steht in der zentralen Katalogquelle auf `disabled`.
- `probability` wurde aus dem produktiven Daten-Fokuspool entfernt.
- Öffentlicher Katalog, eingebetteter Fallback und Curriculum-Matrix werden aus der geänderten Quelle neu erzeugt.
- Vorhandene lokale Lernstände werden nicht gelöscht. Sie können die deaktivierte Kompetenz aber nicht erneut auswählen.
- Kombinatorik, Tabellen und Diagramme bleiben unverändert auswählbar.

Generatoren und Tests für Probability bleiben als nicht produktive Grundlage erhalten. Eine erneute Aktivierung ist nur nach einer vollständigen fachlichen Neuentwicklung und erneuter manueller Abnahme zulässig.

## Abnahme

Der Regressionstest erzeugt 1.000 Sitzungspläne mit stark negativem Probability-Lernstand und prüft, dass keine Runde eine Zufallsaufgabe enthält. Lokal erfolgreich geprüft wurden:

- Katalogabgleich und Curriculum-Matrix,
- Typecheck und Lint,
- 486 Unit- und Komponententests,
- Produktionsbuild mit vollständigem PWA-Precache,
- 20 Playwright-Szenarien gegen Vite Preview,
- dieselben 20 Szenarien gegen das gehärtete Container-Image.

Das mit Docker Desktop explizit für `linux/amd64` gebaute Image `mathe-reise:0.32.3-local` beziehungsweise `mathe-reise:local` lief als UID 101 mit schreibgeschütztem Root-Dateisystem, ohne Capabilities und ausschließlich `/tmp` als `tmpfs`. Healthcheck, Einstieg, Manifest, Service Worker und Katalog wurden erfolgreich abgerufen. Das veröffentlichte GHCR-Image wird ausschließlich vom GitHub-Workflow aus dem Release-Tag gebaut.

Der Ausgangsbefund stammt aus einer realen Gerätenutzung. Die korrigierte Fassung wurde noch nicht erneut vollständig auf dem echten Gerät abgenommen. Eine Lehrkraftfreigabe oder pädagogische Wirksamkeit wird nicht behauptet.
