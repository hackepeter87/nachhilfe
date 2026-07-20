# Didaktische iPhone-Regressionskorrektur 0.31.1

Stand: App 0.31.1, Katalog 0.30.1, Schema 19, Status `ready-for-review`.

## Befunde und Ursachen

| Bereich | Befund | Ursache | Korrektur |
| --- | --- | --- | --- |
| Symmetrie | Ein sichtbar korrektes Spiegelbild wurde im Transfer als falsch behandelt. | Der Arbeitsauftrag verlangte intern das Spiegeln an einer nicht sichtbaren zweiten Achse und wertete `wrong-axis` als Lösung. | Transfer fragt nach der Spiegelung an der sichtbaren grünen Achse; `mirror` ist in jeder Lernphase die Zielantwort. |
| Tabellen | Eine bereits gedruckte Tabellenzahl musste lediglich ausgewählt werden. | `guided-practice` bildete nur direktes Abschreiben ab. Das allgemeine Kompetenzfeedback erwähnte zusätzlich Strichlisten. | Zwei benannte Tabellenwerte werden gelesen und addiert. Hilfe, Fehler- und Erfolgsfeedback beziehen sich ausschließlich auf diese beiden sichtbaren Zeilen. |
| Strichliste | Der fünfte Strich überlagerte andere Striche und die Bündelung war auf dem iPhone unsauber. | Die Diagonale war ein negativ verschobenes Element innerhalb einer frei umbrechenden Flex-Zeile. | Jede Fünfergruppe besitzt einen stabilen Rahmen aus vier senkrechten Strichen und einer absolut innerhalb dieser Gruppe positionierten Diagonale. |

## Didaktische Entscheidung

Fehleranalyse ist nur sinnvoll, wenn alle dafür benötigten Bezugsgrößen sichtbar sind. Die bisherige Symmetrieaufgabe zeigte nur eine Achse, fragte aber nach dem Ergebnis einer anderen Achsenrichtung. Sie wurde deshalb nicht sprachlich repariert, sondern aus dem produktiven Lernpfad entfernt.

Direktes Ablesen bleibt als vorbereitende Datenhandlung in den frühen Lernphasen möglich. Im geführten Üben wird nun jedoch eine kleine, klar erkennbare Rechenhandlung verlangt. Die Aufgabe prüft damit, ob zwei Tabellenzeilen als mathematische Informationen genutzt werden können.

## Absicherung

- Symmetrie und Datendarstellungen werden je Lernphase über 1.000 deterministische Seeds geprüft.
- Eine Komponentenprüfung klickt im Symmetrie-Transfer ausdrücklich die Option `mirror` und erwartet positives Feedback.
- Tabellenprüfungen sichern zwei im Prompt genannte Kategorien, die Summe beider Werte und darstellungsspezifisches Feedback.
- Renderingtests prüfen die Anzahl der Fünfergruppen, senkrechten Striche und Diagonalen für 8, 5 und 4 Striche.

Diese interne Korrektur ist keine Aussage über pädagogische Wirksamkeit. Die erneute Abnahme auf dem echten iPhone und die externe Lehrkraftprüfung bleiben offen.
