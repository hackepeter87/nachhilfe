# Verbindlicher didaktischer Qualitätsstandard ab 0.21

Stand: 18. Juli 2026. Dieser Standard gilt für jede neue Kompetenz und für jede Migration einer bestehenden Kompetenz. Er konkretisiert das [didaktische Gesamtmodell](didactics/README.md), die [Darstellungsrichtlinie](representation-policy.md) und die [Roadmap](roadmap.md).

## Qualitätsziel

Eine Kompetenz ist nicht fertig, wenn die App korrekte Aufgaben erzeugt. Sie ist fertig, wenn ein Kind mit Förderbedarf die mathematische Idee wahrnehmen, aufbauen, angeleitet und selbstständig anwenden, festigen und übertragen kann. Die App unterstützt diesen Prozess ohne Zeitdruck und ohne eine diagnostische Sicherheit vorzutäuschen.

## Vollständiger Kompetenzvertrag

Jede Kompetenz dokumentiert und implementiert:

- ein beobachtbares mathematisches Lernziel
- fachlich notwendige Voraussetzungen und deren produktive Prüfung
- typische Fehlvorstellungen mit vorsichtig formulierten Reaktionswegen
- eine Progression nach mathematischer Idee, Darstellung, Strategie und Selbstständigkeit
- didaktisch begründete Darstellungen
- konkrete Lernhandlungen für alle sechs Lernphasen
- transferierbare Anwendung in einer neuen Darstellung oder Situation
- gestufte Hilfe und eine leichtere verwandte Remediation
- kompetenzspezifisches Erfolgs- und Fehlerfeedback
- mathematische, curriculare, Runtime-, UI-, Mobile-, Offline- und Regressionstests

Fehlt einer dieser Bestandteile, darf eine neue Kompetenz nicht `active` werden. Bei einer Bestandskompetenz bleibt die Lücke bis zu ihrer Roadmap-Migration offen dokumentiert.

## Lernphasenvertrag

| Phase | Mathematische Funktion | Typische Handlung | Nicht ausreichend |
| --- | --- | --- | --- |
| `activate` | notwendige Grundlage reaktivieren | erkennen, sortieren, zuordnen, eine bekannte Struktur finden | dieselbe Ergebnisaufgabe mit kleineren Zahlen |
| `understand` | Beziehung zwischen Handlung, Bild, Sprache und Symbol aufbauen | untersuchen, markieren, Modell passend machen, Veränderung beobachten | fertige Darstellung ansehen und Ergebnis wählen |
| `guided-practice` | Strategie mit tragender Struktur selbst ausführen | Modell schrittweise vervollständigen, Sprung setzen, Gruppen bilden | Lösungsweg vollständig vorgeben |
| `independent-practice` | Kernidee ohne lösungsgebende Stützung anwenden | rechnen, darstellen oder begründet auswählen | nur die Darstellung ausblenden |
| `automate` | bereits verstandene Beziehung sicher und effizient abrufen | Aufgabenfamilien, Umkehrungen oder Strategien flexibel nutzen | Zeitdruck oder reine Wiederholungsmenge |
| `transfer` | Idee in neuem Kontext oder Darstellungswechsel anwenden | Strategie vergleichen, Fehler erkennen, Modell wechseln, Situation erklären | schwerere Standardaufgabe oder nur angezeigter Transfertext |

Nicht jede Phase benötigt eine einzigartige UI-Komponente. Sie benötigt aber eine unterscheidbare mathematische Handlung, die Generator, Katalog, Runtime und Test gemeinsam abbilden.

## Darstellungsvertrag

- Jede Darstellung hat einen benannten mathematischen Zweck.
- Alle für den aktuellen Schritt bekannten Werte und Beziehungen sind sichtbar.
- Unbekannte Werte bleiben bis zur erfolgreichen Bearbeitung maskiert.
- Aufgedeckte Werte werden erst nach dem zugehörigen Lernschritt numerisch gezeigt.
- Eine Hilfe verweist nur auf eine Darstellung, die sichtbar ist oder durch diese Hilfe sichtbar wird.
- Die Darstellung verändert sich mit Lernphase und Handlung, nicht bloß dekorativ.
- Generator und Renderer verwenden dieselben Rollen für bekannte, unbekannte und aufgedeckte Größen.

Die repositoryweiten Detailregeln stehen in der [Darstellungsrichtlinie](representation-policy.md).

## Runtime- und Adaptivitätsvertrag

Die nächste Lernhandlung wird nicht allein aus richtig oder falsch bestimmt. Berücksichtigt werden mindestens:

- Kompetenz und fachlich notwendige Unterkompetenz
- aktuelle Lernphase
- bisher benötigte Hilfe
- robuste Hinweise auf eine Fehlvorstellung
- verwendete Darstellung und bearbeitete Lernhandlung
- zeitlicher Abstand und jüngste Fehler

Eine unsichere Antwort führt zunächst zu einer passenden Rückfrage, Darstellung oder Strategiehilfe. Nach wiederholten Fehlern folgt eine schrittweise Erklärung und danach eine leichtere verwandte, nicht identische Aufgabe. Eine sichere Antwort kann Selbstständigkeit oder Transfer erhöhen; eine einzelne richtige Antwort begründet keinen sicheren Status.

## Feedbackvertrag

- Feedback beschreibt die bearbeitete mathematische Handlung konkret.
- Ein plausibler Distraktor trägt eine stabile Fehlvorstellungskennung, sofern daraus eine fachlich passende Hilfe folgt.
- Freie Eingaben werden nur bei robusten Mustern einer Fehlvorstellungsroute zugeordnet.
- Formulierungen bleiben hypothetisch: Die App bietet eine Strategie an und behauptet keine Ursache.
- Die Lösung wird nicht beim ersten Fehler vollständig vorgegeben.
- Positives Feedback bezieht sich auf Strategie, Darstellung oder Fortschritt, nicht auf allgemeines Dauerlob.

## Wiederverwendung

Bevor eine neue Interaktion entsteht, wird geprüft, ob `auswählen`, `markieren`, `zuordnen`, `ordnen`, `Modell vervollständigen`, `Zahl eingeben`, `Strategie auswählen` oder `Fehler erkennen` den Lernprozess trägt. Eine Speziallösung benötigt eine dokumentierte fachliche Begründung und eigene mobile sowie barrierearme Tests.

## Prüfbare Abnahme

### Fachlichkeit und Katalog

- Lernziel, Voraussetzungen, Fehlvorstellungen, Progression, Darstellungen, Transfer und Remediation sind vollständig.
- Katalog, Fallback und generierte Curriculum-Matrix stimmen überein.
- Alle produktiven Texte sind konkret zur erzeugten Variante und enthalten nur gültige Platzhalter.
- Eine neue Katalogstruktur wird nur eingeführt, wenn die Runtime sie tatsächlich nutzt.

### Generator und Runtime

- Mindestens 1.000 deterministische Seeds je variierender Kompetenz, Stufe und Lernphase bleiben im Zahlenraum und besitzen genau eine Lösung.
- Lernphasen erzeugen objektiv unterschiedliche Lernhandlungen.
- Pflichtdarstellungen erscheinen im vorgesehenen Schritt und verraten keine unbekannte Größe.
- Fehlvorstellung, Feedback, Hilfe und Remediation bleiben synchron.
- Eine verwandte Wiederholungsaufgabe ist leichter, aber nicht identisch.
- Zustandswechsel setzen Auswahl, Fokus, Eingaben, Hilfen, Modell, Animation und aufgabeninternen Scrollstand zurück.

### Produktabnahme

- Komponentenprüfungen decken Erstversuch, Fehler, Hilfe, zweiten Versuch, Remediation, Erfolg und Transfer ab.
- Playwright prüft mindestens `375 x 812` und `812 x 375` ohne horizontales Overflow oder unbehandelte Konsolenfehler.
- Eine vollständige Runde funktioniert nach Reload und offline; Lernstand und Sitzungsmetadaten bleiben in IndexedDB erhalten.
- Katalogcheck, Typecheck, Lint, Unit-/Komponententests, Produktionsbuild, E2E und gehärteter AMD64-Container sind erfolgreich.

### Didaktischer Audit

Nach jedem Milestone wird für die betroffene Familie dokumentiert:

- Ausgangsbefund und behobene gemeinsame Ursache
- mathematische Korrektheit
- Verständlichkeit und kognitive Belastung
- Eigenständigkeit der sechs Lernhandlungen
- Nutzen und Grenzen der Darstellungen
- verwendete Fehlvorstellungsrouten
- tatsächlich bearbeiteter Transfer
- adaptive Folgehandlung
- verbleibende Risiken und notwendige menschliche Prüfung

Ein kritischer interner Befund blockiert `active`. Eine noch ausstehende externe Lehrkraftprüfung oder ein echter iPhone-Test wird offen ausgewiesen, blockiert aber nicht den Entwicklungsrelease.

## Migrationsregel

Die Anwendung behält eine Runtime und einen Katalog. Es wird kein dauerhafter Legacy-Ausführungspfad aufgebaut. Gemeinsame Fähigkeiten werden zentral ergänzt und an einer Referenzkompetenz abgenommen; danach werden Kompetenzfamilien entlang der Roadmap migriert.

Die Curriculum-Matrix ist das sichtbare Migrationsregister. Bis Version 0.30 müssen alle aktiven Kompetenzen diesen Standard erfüllen. Danach darf eine Kompetenz unterhalb des Standards weder neu aktiviert noch als abgeschlossen dokumentiert werden.
