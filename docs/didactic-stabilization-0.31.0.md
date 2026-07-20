# Didaktische Stabilisierung 0.31.0

Stand: App 0.31.0, Katalog 0.30.0, Schema 19, Status `ready-for-review`.

Version 0.31.0 führt keine neue Kompetenz ein. Sie schafft einen reproduzierbaren Prüfweg und korrigiert gemeinsame Ursachen, die bei der manuellen Erprobung sichtbar wurden. Die Version ist keine vollständige didaktische Abnahme aller 34 Kompetenzen.

## Gefundene Ursachen und Korrekturen

| Ursache | Auswirkung | Korrektur |
| --- | --- | --- |
| Ein passiver Sachaufgabenschritt bestätigte ein bereits fertiges Bild. | Das Kind erhielt Bestätigung, ohne mathematisch gehandelt zu haben. | Einfache Lernphasen beginnen direkt mit einer passenden Rechnung beziehungsweise dem eigenen Rechnen. Eine Modellauswahl bleibt nur dort, wo sie selbst Lernhandlung ist. |
| Das offene Balkenmodell verschwand vor der Rechnung. | Frage und Hilfe verwiesen auf eine nicht mehr sichtbare Darstellung. | Das unbekanntenhaltige Modell bleibt in den folgenden Modellierungsschritten sichtbar; das Ergebnis bleibt bis zur eigenen Rechnung maskiert. |
| Nachbarzahl-Distraktoren waren an der oberen Zahlenraumgrenze nicht robust. | Künstlich gewählte Review-Szenarien konnten zu doppelten oder zu wenigen Optionen führen. | Alternative Intervalle und Grenzdistraktoren werden innerhalb `0..1000` eindeutig erzeugt. |
| Aufgaben waren nur über zufällige Sitzungen erreichbar. | Ein Befund ließ sich fachlich nur schwer reproduzieren. | Der Entwicklungsprüfstand bindet Kompetenz, Phase, Schwierigkeit, Seed und Remediationspfad an dieselbe produktive Runtime. |

## Interne Prüfung

Der Prüfstand wurde bei `375 × 812` für alle 34 aktiven Kompetenzen in `guided-practice`/Stufe 1 und `transfer`/Stufe 3 durchlaufen. Dabei waren alle Aufgabenkomponenten vorhanden und es trat kein horizontaler Seitenüberlauf auf. Eine geführte Sachaufgabe wurde zusätzlich schrittweise geprüft: Rechnung wählen, selbst rechnen, Antwortsatz; das unbekannte Ergebnis blieb zuvor verborgen.

Der neue automatisierte Klarheits-Gate prüft unter anderem interne Fachsprache, passive Weiter-Schritte, unbekannte Darstellungsrollen, eindeutige Bezugsgrößen sowie die überarbeiteten Wahrscheinlichkeits- und Kombinatorikhandlungen. Diese Prüfungen sind Regressionen, keine menschliche Verständlichkeitsbewertung.

## Offene Abnahme

- Die vollständige manuelle Variantenprüfung der Zahlen- und Modellierungsfamilien bleibt Aufgabe von 0.32.
- Größen, Daten und Raum werden familienweise in 0.33 geprüft.
- Die vorhandenen echten iPhone-Screenshots sind eine reale Teilprüfung. Gerät, iOS-Version und die vollständige Installations-, Offline-, Persistenz- und Updatecheckliste sind noch nicht vollständig dokumentiert; Issue #59 bleibt offen.
- Eine Lehrkraftprüfung oder Unterrichtserprobung ist nicht erfolgt; Issue #58 bleibt offen.
