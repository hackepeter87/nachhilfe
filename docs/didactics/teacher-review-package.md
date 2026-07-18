# Gesamtprüfung durch eine Lehrkraft

## Lauffähige Version

Nach Deployment ist die URL des konkreten Testsystems hier einzutragen. Lokal startet die App mit npm run dev; der AMD64-Container mit docker run --rm -p 8080:8080 mathe-reise:0.30.0. Das öffentliche OCI-Image ist ghcr.io/hackepeter87/nachhilfe:0.30.0, sobald der Release-Workflow für `v0.30.0` erfolgreich gelaufen ist. Dieses Paket bereitet die Gesamtprüfung vor; eine tatsächliche Prüfung ist noch nicht dokumentiert.

## Förderziel

Mathe-Reise unterstützt ein etwa neunjähriges Kind am Ende der Klasse 3 dabei, Grundvorstellungen, Rechenstrategien und Sicherheit in ausgewählten Förderbereichen aufzubauen. Die App ist eine Übungsunterstützung und keine Diagnose oder Schulnote.

## Behandelte Themen

Aktiv sind Addition/Subtraktion bis 20, Einmaleins/Division, Stellenwert, Zerlegen/Zusammensetzen, Nachbarzehner/-hunderter, Runden, kontrollierte Rechenstrategien bis 1000, schriftliche Addition/Subtraktion mit genau einem Übergang, sieben Sachaufgabenbeziehungen einschließlich erster zweischrittiger Situationen, fünfphasige Raster-Symmetrie, Geld, Längen, Zeit, Masse, Rauminhalt, Tabellen, Diagramme, Wahrscheinlichkeit, Kombinatorik, ebene Figuren, Muster, Fläche, Umfang, fest orientierte Körperansichten, kontrollierte 90-Grad-Würfelrotation und einzelne Faltungen samt einfachem Faltschnitt. Freie Rotation, Kippen, Mehrfachfaltungen und Körpernetze bleiben deaktiviert.

## Methodischer Aufbau

Die Lernwege reichen von sichtbarer Darstellung und geführten Schritten zu reduzierter Hilfe, Automatisierung oder Transfer. Die tägliche Runde wählt unsichere und länger nicht geübte Inhalte häufiger, bleibt auf höchstens zehn Aufgaben begrenzt und arbeitet ohne Zeitdruck.

## Hilfestufen

Zwei Hinweise lenken zuerst Aufmerksamkeit und Strategie. Nach wiederholtem Fehler folgt eine konkrete Erklärung; anschließend wird eine leichtere verwandte oder grundlegende Aufgabe eingefügt. Fehler gelten als Lerninformation, nicht als Bewertung.

## Schwierigkeitsprogression

Stufe 1 nutzt kleinere Zahlen und sichtbare Darstellung. Stufe 2 reduziert die Darstellung und erhöht den Denkschritt. Stufe 3 verlangt selbstständige Lösung, Begründung oder Transfer. Die konkrete Ausprägung steht in den Kompetenzdokumenten dieses Ordners.

## Fragen für die Gesamtbeurteilung

- Sind Themen und Reihenfolge für den Förderstand am Ende der Klasse 3 angemessen?
- Sind Sprache, Darstellungen und Touch-Interaktionen altersgerecht?
- Werden typische Fehlvorstellungen sachgerecht aufgegriffen?
- Helfen Hinweise und Erklärungen, ohne die Lösung zu früh vorzugeben?
- Sind die Übergänge zwischen Darstellung, Strategie und abstrakter Rechnung tragfähig?
- Welche aktiven Aufgabenformen wirken im Unterrichtskontext ungeeignet oder fehlen?
- Welche vorbereiteten Themen sollten als Nächstes fachlich aktiviert werden?

## Bekannte Grenzen

Es liegt keine dokumentierte Lehrkraftfreigabe vor. Ein echter iPhone-Test ist noch offen. Freie Rechenwege oder Freitextbegründungen werden nicht diagnostisch ausgewertet. Millimeter/Kilometer, komplexe Kaufsituationen, freie Rotation, Kippen, Mehrfachfaltungen und Körpernetze sind nicht sichtbar. Das adaptive Modell ist eine getestete Produktheuristik, kein wissenschaftlich validiertes Diagnosemodell.
