# Sachaufgaben als mathematisches Modellieren

## 1. Bezug zum Förderbedarf
Kurze Geschichten sollen als mathematische Handlungen verstanden werden. Einzelne Wörter wie „zusammen“, „mehr“, „übrig“ oder „je“ dürfen nicht allein die Operation bestimmen.

## 2. Lehrplanbereich
Zahlen und Operationen sowie Größen und Messen; Modellieren, Problemlösen, Darstellen und Kommunizieren.

## 3. Konkretes Lernziel
Das Kind bestimmt die gesuchte Größe, ordnet bekannte Mengen in einer passenden Darstellung und bildet erst daraus eine Rechnung und einen Antwortsatz.

## 4. Voraussetzungen
Grundvorstellungen zu den vier Rechenarten, Mengen vergleichen und kurze Texte sinnentnehmend lesen.

## 5. Typische Fehlvorstellungen
Ein Schlüsselwort entscheidet; alle Zahlen müssen verwendet werden; eine bekannte Zahl wird mit der gesuchten Größe verwechselt; ein Balkenbild wird gelesen, ohne bekannte und unbekannte Teile zu unterscheiden.

## 6. Fachliche Kernidee
Die Handlung und die gesuchte Größe bestimmen die Mengenbeziehung. Technische Beziehung und Operation bleiben intern; der Kinderablauf arbeitet mit konkreten Situationen, Bildern und Gleichungen.

## 7. Methodischer Zugang
Der Katalog dokumentiert die Folge Geschichte verstehen, gesuchte Größe erkennen, wichtige Angaben bestimmen, Modell wählen, Gleichung bilden, selbst rechnen, Ergebnis prüfen und im Antwortsatz auf die Geschichte beziehen. `wordProblemSteps.runtimeSequence` definiert die vollständige Reihenfolge; `phaseSequences` legt fest, welche zusammenhängenden Stationen in jeder Lernphase tatsächlich bearbeitet werden. Nur die zweite Gleichung und zweite Berechnung sind ausdrücklich an `second-operation` gebunden.

## 8. Geeignete Darstellungen
Aktiv sind Veränderungs-, Teil-Ganzes-, Vergleichs-, Ergänzungs- und zweistufige Balkenmodelle sowie Gruppenbilder für unbekannte Gesamtzahl oder unbekannte Gruppengröße. Jedes Modell trägt intern `unknownQuantity`; der Renderer lehnt eine unpassende Kennung sichtbar ab. Alle Bilder zeigen nur bekannte Zahlen, die gesuchte Zahl bleibt bis nach der eigenen Berechnung `?`.

## 9. Lernprogression
- **Stufe 1:** Suchgröße und wichtige Angaben klären; das korrekte unbekanntenhaltige Modell gemeinsam untersuchen; Gleichung selbst eintragen, Ergebnis eingeben, plausibilisieren und Antwort prüfen.
- **Stufe 2:** denselben Ablauf nutzen, genau ein passendes Modell aus drei konkreten Bildern auswählen und die Gleichung selbst eintragen.
- **Stufe 3:** eine unwichtige Angabe unterscheiden und ausgewählte zweischrittige Situationen im selben Ablauf bearbeiten.

Die Schwierigkeit entsteht durch mathematische Selbstständigkeit und zusätzliche relevante Handlungsschritte, nicht durch künstlich lange Texte.

## 10. Aufgabentypen
Hinzufügen, Wegnehmen, Zusammenfassen, Vergleichen, Ergänzen, gleich große Gruppen, gleichmäßig Verteilen sowie „dazu, dann weg“ und „weg, dann dazu“.

## 11. Hilfestufen
Zuerst wird geklärt, was bekannt und was gesucht ist. Danach beschreibt eine vorlagenspezifische Hilfe, wo die bekannten Mengen und das `?` im Modell stehen, ohne den Ergebniswert vorzugeben.

## 12. Remediation
Nach wiederholten Fehlern wird die Geschichte mit bekannten Größen und sichtbarer Unbekannter als Balken- oder Gruppenbild aufgebaut. Anschließend folgt eine verwandte leichtere Aufgabe. Die App behauptet keine sichere Diagnose der Fehlvorstellung.

## 13. Transfer
Dieselbe mathematische Handlung kann mit einer anderen Geschichte oder einer zweiten geeigneten Darstellung erklärt werden. Freie Antworten werden derzeit nicht automatisch bewertet.

## 14. Wiederholung
Eine Wiederholungsaufgabe behält die fachliche Grundlage, verändert aber Zahlen und konkrete Geschichte. Dieselbe deterministische Variante erscheint nicht unmittelbar erneut.

## 15. Erfolgskriterien
Suchgröße, konkrete Handlung, Modelltyp, Gleichung, berechnetes Ergebnis und Antwortsatz sind konsistent. Jede Modellwahl besitzt genau eine passende Darstellung und zwei plausible Alternativen.

## 16. Grenzen der aktuellen Umsetzung
Freie Skizzen, frei formulierte Antwortsätze und alternative Rechenwege werden nicht bewertet. Eine strukturgleiche Gleichung wird selbst eingetragen; mobile Alternativen `*` und `/` werden als Mal- und Geteiltzeichen akzeptiert. Komplexere mehrstufige Modellierungen bleiben offen. Geld und Längen sind eigenständige Größenkompetenzen und keine bloße Textverkleidung.

## 17. Punkte für die Gesamtprüfung
Sprachliche Zugänglichkeit, Lebensnähe, Qualität der visuellen Modelle und tatsächliche Förderwirkung benötigen eine menschliche didaktische Prüfung und Unterrichtserprobung. Eine Lehrkraftfreigabe ist nicht dokumentiert; automatisierte Konsistenzprüfungen belegen keine pädagogische Wirksamkeit.

### Katalog-/Code-Grenze
Im Katalog liegen Geschichte, Suchfrage, die fachliche Situationsbeschreibung, relevante Angaben, plausible Alternativen, Modelltyp, Modellhilfe, Gleichungen, Feedback, `modellingProgression`, `runtimeSequence` und die schwierigkeitsabhängige Modellinteraktion. `situation` und `situationDistractors` bleiben interne Review-Texte und werden nicht als zusätzliches Kinder-Quiz gerendert. TypeScript verantwortet Zahlenwahl, mathematische Operationen, Ergebnisprüfung, deterministische Varianten und Rendering. JSON enthält keine ausführbare Logik.

### Gegen Schlüsselwortstrategien
„Zusammen“ kommt sowohl bei Addition zweier Teilmengen als auch bei Multiplikation gleich großer Gruppen vor. „Mehr“ bezeichnet in einer Vergleichsgeschichte den gesuchten Abstand. Hinweise beziehen sich deshalb immer auf bekannte, veränderte und gesuchte Mengen.
