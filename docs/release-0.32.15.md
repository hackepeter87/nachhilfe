# Vorhersehbare und unterstützende Lernrunden 0.32.15

Releaseumfang: App 0.32.15, Katalog 0.31.7, Schema 20.

## Änderungen

- Eine Etappe enthält verlässlich acht Aufgaben. Fehler verlängern die laufende
  Runde nicht mehr unbemerkt; Zähler und Fortschrittsbalken bleiben stabil.
- Bei Auswahlaufgaben sind Auswählen und Prüfen getrennte Handlungen. Eine
  versehentliche Berührung wird damit nicht sofort als fachlicher Fehler
  gespeichert.
- Nach zwei Fehlversuchen wählt das Kind selbst zwischen einem weiteren eigenen
  Versuch, einem sichtbaren Tipp und einer gemeinsamen schrittweisen Lösung.
- Die Abschlussansicht nennt geübte Bereiche und unterscheidet Aufgaben, die
  direkt klappten, von Lernwegen mit Nachdenken oder Hilfe.
- Ein Abschluss wird auch bei einem schnellen Doppelklick nur einmal gespeichert.
  Der Fortschrittsbalken ist für assistive Technik als Fortschritt ausgezeichnet.
- Gezielte npm-Overrides heben die ausschließlich zur Entwicklung verwendeten
  transitiven Abhängigkeiten `glob` auf 14.0.2 und `minimatch` auf 11.0.1. Damit
  sind `CVE-2026-118773` und `CVE-2026-118764` behoben, ohne die nicht betroffene
  alte `minimatch`-5-Kette unnötig zu verändern.

Die Änderungen setzen die fünf priorisierten Befunde des versionierten
Impeccable-Reviews um. Aufgabeninhalte, Katalog, IndexedDB-Struktur und
gespeicherte Profile bleiben unverändert.

## Freigabe

Lokal erfolgreich geprüft:

- Katalog- und Curriculum-Abgleich im Produktionsbuild
- Typecheck und ESLint
- 528 Unit- und Komponententests in 28 Dateien
- Produktionsbuild und PWA-Precache
- 22 Chromium-, WebKit-, Offline- und mobile Browser-Szenarien
- visuelle Kontrolle der mobilen Auswahl-, Aufgaben- und Abschlusszustände

Zielartefakte:

- Git-Tag und GitHub Release `v0.32.15`
- `ghcr.io/hackepeter87/nachhilfe:0.32.15`, ausschließlich `linux/amd64`
- zusätzliche Tags `sha-<kurzsha>` und `latest` auf demselben Manifest

Rollback: `ghcr.io/hackepeter87/nachhilfe:0.32.14` verwenden. Browserprofil und
Lernstand bleiben bei diesem Release erhalten.

## Grenzen

- Eine vollständige Abnahme von 0.32.15 auf einem echten iPhone ist nicht
  erfolgt; WebKit bleibt eine Mobile-Safari-Näherung.
- Eine externe Lehrkraftprüfung und Unterrichtserprobung sind weiterhin nicht
  erfolgt.
- Der Produktionsbuild meldet weiterhin das bekannte Hauptbundle über 500 kB;
  dies blockiert die fachlichen Korrekturen nicht.
