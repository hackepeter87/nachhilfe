# Didaktischer Prüfstand

Stand: App 0.31.1, Katalog 0.30.1, Schema 19.

Der Prüfstand macht Aufgabenvarianten reproduzierbar sichtbar. Er ist ein Arbeitswerkzeug für interne Reviews und kein Nachweis pädagogischer Wirksamkeit. Die Ansicht verwendet denselben Katalog, dieselben Generatoren und dieselbe `ExerciseCard` wie eine produktive Mathe-Runde. Es gibt keine zweite Aufgabenruntime.

## Start

```bash
npm ci
npm run dev -- --host 0.0.0.0
```

Anschließend wird `http://localhost:5173/?review=1` geöffnet. Der Prüfstand ist ausschließlich in der Vite-Entwicklungsumgebung verfügbar. `npm run build` prüft zusätzlich, dass seine Kennzeichen nicht im Produktionsartefakt enthalten sind.

Für eine Sichtprüfung über das lokale Netzwerk darf dieselbe URL mit der IP-Adresse des Entwicklungsrechners auf einem iPhone geöffnet werden. Das ersetzt nicht die PWA-Abnahme von Installation, Offline-Neustart, Persistenz und Service-Worker-Update gegen einen Produktionsbuild.

## Reproduzierbares Szenario

Ein Szenario besteht aus:

- Kompetenz
- Lernphase
- Schwierigkeit
- Seed
- Ausgangsaufgabe oder leichtere Remediationsaufgabe

Der Prüfstand zeigt außerdem Typkennung, Variantenkennung, Darstellung und nach einem Versuch erkannte Fehlvorstellungen. Die technische Lösung bleibt standardmäßig geschlossen. Hilfe, falsche Antwort, zweiter Versuch, Erfolg und Remediation werden direkt in der echten Aufgabenkomponente durchlaufen.

## Verbindliche Prüfliste

Für jede geprüfte Variante werden mindestens bewertet:

1. Ist der Arbeitsauftrag sofort verständlich?
2. Verlangt die Aufgabe eine erkennbare mathematische Handlung?
3. Zeigt die Darstellung alle bekannten Informationen, ohne das Gesuchte zu verraten?
4. Passen Antwortform und Arbeitsauftrag zusammen?
5. Bezieht sich die Hilfe ausschließlich auf sichtbare Informationen?
6. Reagiert das Feedback auf den tatsächlich bearbeiteten Schritt?
7. Ist die Remediation leichter und verwandt, aber nicht identisch?
8. Funktioniert die Aufgabe im Hoch- und Querformat ohne Überlauf?
9. Liegt die Aufgabe fachlich und sprachlich auf dem vorgesehenen Niveau Ende Klasse 3?

Die erzeugte Markdown-Vorlage enthält Kompetenz, Seed, Lernphase, Schwierigkeit, Variante, Typ und Aufgabenpfad. Ein GitHub-Befund ergänzt erwartetes und tatsächliches Verhalten sowie bei visuellen Problemen einen Screenshot. Kritische Befunde blockieren den betroffenen Korrekturrelease.

## Grenzen

Automatisierte Generator-, Rollen- und Layoutprüfungen sichern reproduzierbare Eigenschaften. Sie beweisen weder Verständlichkeit für ein konkretes Kind noch Förderwirksamkeit. Die familienweise manuelle Prüfung wird in 0.32 und 0.33 durchgeführt. Die vollständige reale iPhone-Abnahme folgt in 0.34; eine externe Lehrkraftprüfung bleibt davon getrennt.
