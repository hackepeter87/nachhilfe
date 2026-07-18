# Didaktische Migration Raum und Form 0.29.0

Stand: App 0.29.0, Katalog 0.28.0, Schema 19. Eine externe Lehrkraftfreigabe oder Unterrichtserprobung liegt nicht vor.

## Ziel

Die acht bereits produktiven Geometriekompetenzen werden auf den seit 0.21 verbindlichen Standard gebracht. Es kommen keine neuen Kompetenzen hinzu. Die Aufgaben beginnen bei einer beobachtbaren Eigenschaft oder Handlung und führen erst danach zur selbstständigen Zuordnung, Transformation oder Berechnung.

## Lernhandlungen

| Kompetenz | Aktivieren | Verstehen | Geführt | Selbstständig | Automatisieren | Transfer |
| --- | --- | --- | --- | --- | --- | --- |
| Ebene Figuren | Ecken beobachten | Merkmale verbinden | Form über Seiten und Ecken erkennen | sichtbare Teilflächen zählen | Formmerkmale flüssig zuordnen | Teile zur Außenform zusammensetzen |
| Muster | kleinsten Block finden | Neustart des Blocks bestimmen | Folge mit markierten Blöcken fortsetzen | Folge ohne Markierung fortsetzen | zwei folgende Zeichen bestimmen | Regelverletzung finden |
| Fläche | Einheitsquadrat erkennen | lückenlose Bedeckung beschreiben | kleine Fläche zählen | größere Fläche zählen | strukturiert zeilenweise zählen | Randzählfehler erklären |
| Umfang | Einheitskante erkennen | geschlossenen Außenrand beschreiben | kurzen Rand verfolgen | größeren Rand verfolgen | Rand flüssig bestimmen | Flächenzählfehler erklären |
| Körperansichten | Blickrichtung erkennen | Projektion hintereinanderstehender Würfel verstehen | Vorderansicht zuordnen | Vorder-/Seitenansicht zuordnen | Blickrichtungen flüssig wechseln | fehlerhafte Projektion analysieren |
| Würfelrotation | Drehrichtung lesen | Gegenrichtung als Rückweg verstehen | Vierteldrehung geführt verfolgen | Vierteldrehung selbstständig ausführen | bekannte Drehungen flüssig zuordnen | entgegengesetzte Drehung als Fehler erkennen |
| Falten | bewegte Papierhälfte erkennen | gleichen Achsenabstand verstehen | Punktfaltung geführt verfolgen | Punktfaltung selbstständig lösen | Achsenlagen flüssig wechseln | einfachen Faltschnitt aufklappen |
| Symmetrie | Seitenwechsel beobachten | gleichen Achsenabstand verstehen | einfache Spiegelung zuordnen | komplexere Spiegelung zuordnen | Achsenlagen flüssig wechseln | Spiegelung an der falschen Achse erkennen |

## Fachliche Entscheidungen

- Rastergröße ist kein eigenständiges Schwierigkeitsmaß. Figurenkomplexität, Achsenlage, Distraktorähnlichkeit und Selbstständigkeit bestimmen die Anforderung.
- Produktive Symmetrie verwendet ausschließlich gerade Raster senkrecht zur Achse. Achsen liegen zwischen Zellen; Achseninvarianz bleibt ein späterer eigener Lerninhalt.
- Fläche und Umfang beginnen mit verschiedenen Einheiten und Handlungen. Transfer verlangt eine Fehleranalyse statt einer weiteren bloßen Zahlenaufgabe.
- Körperansicht, Drehung und Spiegelung bleiben getrennte Transformationen. Ihre Distraktoren tragen konkrete Fehlvorstellungskennungen.
- Falt- und Rotationsdarstellungen zeigen Ausgangslage, Achse und Richtung, führen die gesuchte Transformation aber nicht vorab aus.
- Ergebnisrollen bleiben maskiert und werden erst nach einer richtigen Antwort aufgedeckt.

## Runtime und Adaptivität

Der Sitzungsplan übergibt die gespeicherte Lernphase an jeden Geometriegenerator. Der Generator erzeugt dafür einen eigenen `typeId`, eine passende Interaktion, Darstellung, Fehlvorstellungsroute und Erklärung. Fehler erzeugen weiterhin eine verwandte leichtere Aufgabe derselben Unterkompetenz; unmittelbare Variantenwiederholung bleibt ausgeschlossen.

## Qualitätssicherung

`geometryDidactics.test.ts` prüft über alle sechs Lernphasen und jeweils 1.000 Seeds pro Kompetenz die katalogisierte Typfolge, Determinismus, Eindeutigkeit der Optionen und maskierte Ergebnisrollen. Zusätzliche Prüfungen sichern gerade Symmetrieraster, die Trennung von Fläche und Umfang sowie die Fehleranalyse bei Rotation und Faltung. Mobile End-to-End-Prüfungen decken den neutralen Einstieg, Hoch- und Querformat sowie horizontales Overflow ab.

## Bewusste Grenzen

Nicht enthalten sind Achsen durch Rasterfelder, diagonale Achsen, freie Konstruktionen, Flächen- und Umfangsformeln, Maßstab, verdeckte Würfel, freie 3D-Rotation, 180-Grad-Drehfolgen, Mehrfachfaltungen, Körpernetze und komplexe Faltschnitte.
