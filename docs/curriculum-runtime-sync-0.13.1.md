# Curriculum-Runtime-Abgleich 0.13.1

## Umfang

Dieser Patch synchronisiert ausschließlich bestehende Kompetenzen. Es wurden keine neuen mathematischen Inhalte aktiviert. Fachlicher Stand ist Katalog `0.12.0`, Schema `10`, App `0.13.1`.

## Gefundene Inkonsistenzen und Ursachen

| Befund | Ursache | Betroffene Stellen | Korrektur |
| --- | --- | --- | --- |
| Wichtige Angaben und Plausibilität fehlten auf Stufe 1/2 | Schwierigkeit bestimmte im Generator eine zweite Schrittfolge | `wordProblem()` | einheitliche Katalogsequenz für alle Stufen |
| Ein zusätzliches Situationsquiz erschien außerhalb der dokumentierten Folge | `situation` wurde im Generator eigenständig als Kinderschritt eingefügt | Katalogvorlage, Generator | Feld bleibt Review-Inhalt, ist aber keine Kinderausgabe |
| Modelloptionen konnten intern die gesuchte Gruppengröße erhalten | Rohwerte einschließlich Ergebnisgröße wurden an alle Distraktormodelle gereicht | `wordModelRepresentation()` | ausschließlich bekannte Storygrößen plus `unknownQuantity` |
| Hover oder Touch wirkte wie eine vorausgewählte Karte | gemeinsame blaue Fläche für `:hover` und `:active` | `styles.css` | Hover nur für feine Zeiger, Touch nur als kurzer Druckzustand, Antworten starten mit `data-answer-state="idle"` |
| Zustandsreset hing vom Parent-Key ab | lokaler React-State lag direkt in der exportierten Karte | `ExerciseCard` | interne, mit `exercise.id` gekeyte Zustandskomponente |

## Verbindlicher Sachaufgabenablauf

`wordProblemSteps.runtimeSequence` definiert:

1. gesuchte Größe,
2. wichtige Angaben,
3. verpflichtendes Mengenbild,
4. passende Rechnung,
5. eigene Berechnung,
6. optional zweite Rechnung,
7. optional zweite Berechnung,
8. Plausibilitätsprüfung,
9. Antwortsatz.

Die beiden optionalen Schritte tragen ausschließlich die Bedingung `second-operation`. Stufe 1 zeigt das korrekte Modell zum Erkunden; Stufen 2 und 3 lassen aus drei Modellen wählen. Reihenfolge und Pflichtdarstellung werden nicht mehr in React festgelegt.

## Unbekannte Größen

Jedes Sachmodell erhält eine explizite Kennung wie `remaining`, `difference`, `whole`, `group-size` oder `final-total`. Der Renderer akzeptiert nur die zum Modelltyp passende Kennung. Vor der eigenen Berechnung enthält die Darstellung weder `result` noch `intermediate`; die gesuchte Größe erscheint als `?`. Widersprüchliche Daten erzeugen einen sichtbaren Darstellungsfehler.

## State- und Fokusvertrag

Eine neue `exercise.id` erzeugt eine vollständig neue Zustandsinstanz. Damit werden Antwort, Fehlversuche, Hilfen, Feedback, Teilschritt, Eingaben und Spaltenmodell gemeinsam verworfen. Der Aufgabenbereich scrollt an den Anfang und die neue Überschrift erhält Fokus ohne Scrollsprung. Fokus oder Hover setzen keinen Auswahlzustand.

## Katalogfeld-Nutzung

- Runtime: `difficultyLevels`, Skill-`releaseStatus`, `remediation`, Erfolgs-/Fehlerfeedback, Sachaufgaben-Modelltyp/-hilfe/-gleichungen, `runtimeSequence`, Symmetrieprogression und `spatialViews`.
- Review: `workedExample`, `processCompetencies`, `successCriteria`, Kompetenz-`representations`, `misconceptions`, `learningPhases`, Sachaufgaben-`situation` und `modellingProgression`.
- Geplant: `transferPrompt`.
- TypeScript-Vertrag: `answerMode` und mathematische Transformationen bleiben Code, weil sie ausführbares Verhalten und keine fachlichen Texte darstellen.

## Ergänzte Absicherung

- Katalogvalidatoren prüfen die exakte Runtime-Sequenz und Modellinteraktion.
- Generatorprüfungen gleichen Schrittfolge und Pflichtdarstellungen mit dem aktiven Katalog ab.
- Modelltests prüfen alle unbekannten Größen und lehnen widersprüchliche Kennungen ab.
- Komponententests prüfen neutralen Start, Fokus ungleich Auswahl und vollständigen Reset.
- Playwright WebKit prüft den neutralen Touch-Start als Mobile-Safari-Näherung; Chromium deckt Hoch-/Querformat, Offline-Runde und Persistenz ab.

## Verbleibende Grenzen

- Playwright WebKit ist kein echter Test auf Mobile Safari oder einem iPhone. Issue #59 bleibt offen.
- Die fachliche Qualität der Texte und Modelle ist nicht extern evaluiert. Issue #58 bleibt offen.
- `situation` und `situationDistractors` sind absichtlich nur Review-Felder. Eine spätere freie sprachliche Erklärung wird in diesem Patch nicht eingeführt.
- Renderer bleiben TypeScript-Komponenten; der JSON-Katalog enthält weiterhin keine ausführbare Darstellungslogik.

## Ausgeführte Abnahme

- `npm run catalog:check`, `npm run typecheck`, `npm run lint`, `npm test` und `npm run build`: erfolgreich; 223 Unit-/Komponententests.
- `npm run test:e2e`: erfolgreich; zehn Chromium-/WebKit-Szenarien einschließlich Offline-Runde.
- `docker build --platform linux/amd64 -t mathe-reise:0.13.1 -t mathe-reise:local .`: erfolgreich.
- Read-only-Start als UID 101 mit `/tmp`-tmpfs, ohne Capabilities und mit `no-new-privileges`: `healthy`.
- Startseite, Manifest, Service Worker und Katalog: korrekte MIME-, Revalidierungs- und Security-Header.
- `E2E_BASE_URL=http://127.0.0.1:8081 npm run test:e2e:container`: zehn von zehn Szenarien erfolgreich.
- Podman war lokal nicht installiert und wurde nicht als getestet gewertet.
