# Kritischer didaktischer Audit nach 0.30.0

Stand: 19. Juli 2026. Grundlage sind Quellcode, Katalog, Generatoren, Runtime und die manuellen iPhone-Screenshots aus der Erprobung. Der Audit ist keine Lehrkraftfreigabe und kein Wirksamkeitsnachweis.

## Gesamturteil

Version 0.30.0 war technisch breit abgesichert, aber nicht kindgerecht abgenommen. Die damalige Konvergenzprüfung belegte vor allem eindeutige Lösungen, gültige Rollen, unterschiedliche Typkennungen und deterministische Generatoren. Sie belegte weder verständliche Lernhandlungen noch passende Rückmeldungen. Die Aussage, alle Kompetenzen hätten denselben hohen didaktischen Stand erreicht, war deshalb zu weitgehend.

Fünf gemeinsame Ursachen erklären die manuellen Befunde:

1. Kompetenzweite Standardtexte wurden unabhängig vom konkreten Rechenfall ausgegeben.
2. Sechs formal unterschiedliche Phasen wurden teilweise mit künstlichen Zwischenfragen gefüllt.
3. Die Runtime verlor Darstellungen zwischen aufeinanderfolgenden Schritten.
4. Eingabeformen prüften Syntax oder Abschreiben statt Mathematik.
5. Tests sicherten zum Teil genau dieses problematische Verhalten ab.

## Kritische Befunde und Entscheidung

| Bereich | Befund in 0.30.0 | Entscheidung für 0.30.1 |
| --- | --- | --- |
| Sachaufgaben | Bis zu acht Pflichtschritte auch bei direkter Ein-Schritt-Geschichte; Modell verschwand; freie Gleichungseingabe; abstrakte Hilfen | Einfache Phasen auf Modell, passende Rechnung, Ergebnis und Antwortsatz verkürzt; Modell bleibt sichtbar; Gleichung wird aus plausiblen Modellen gewählt |
| Schriftliche Verfahren | Stellenwertausrichtung war das Abschreiben einer ganzen Zahl; Feedback erklärte Entbündeln auch ohne Entbündelung | Zweiter Operand ist bewusst kürzer; getrennte H/Z/E-Felder; rechenfall- und spaltenspezifische Erklärung |
| Addition/Tauschaufgabe | Darstellung blieb in Originalreihenfolge; Feedback sprach über Zerlegen statt Tauschen | Mengen werden sichtbar getauscht; Rückmeldung benennt Kommutativität konkret |
| Wahrscheinlichkeit | Drehscheibe war eine Kartenliste; „anderes Ergebnis“ war ein künstlicher Distraktor; Ziel blieb unklar | Zusammenhängende Drehscheibe bzw. Münzseiten; konkrete Vorhersage statt Listenquiz; Fantasieausgang entfernt |
| Ebene Figuren | Ecken eines einfachen Rechtecks zählen; Feedback erwähnte nicht vorhandene Teilungslinien | Einstieg vergleicht Quadrat und Rechteck über gemeinsame und unterschiedliche Eigenschaften |
| Rauminhalt | „Wasserflasche“ hatte mit 500 ml und 1 l mehrere plausible Antworten; Darstellung und Ergebniszeile waren redundant | Mehrdeutige Vorlage entfernt; kindgerechte Mengensprache; unbekannte Ergebniszeile entfällt |
| Mobile Eingabe | Texttastatur für Gleichungen; bei Tastaturfokus konnte Inhalt unter die iOS-Statusleiste rutschen | Keine freie Gleichungssyntax; numerische bzw. H/Z/E-Eingaben; Sitzungsleiste schützt den oberen sicheren Bereich |
| Remediation | Interne Formulierungen wie „Grundlage von Sachaufgabe neu aufbauen“ und unmittelbare Komplettlösung | Konkrete Handlung am sichtbaren Modell; keine interne Kompetenzsprache |

Der anschließende repositoryweite Textaudit fand dieselbe Defizitsprache auch in älteren Remediationspfaden für Grundrechnen, Stellenwert, Nachbarzahlen, Runden und Rechnen bis 1000. Diese Texte wurden ebenfalls durch konkrete Handlungen am jeweiligen Modell ersetzt; die Katalogtests verhindern ihre Rückkehr.

## Audit der Aufgabenfamilien

### Fachlich tragfähig, mit vorhandenen gezielten Tests

- Addition und Subtraktion bis 20: Zehnerübergang, Zerlegung, Umkehrung und Tauschaufgabe sind fachlich sinnvoll. Rückmeldungen müssen weiterhin pro Phase statt kompetenzweit geprüft werden.
- Multiplikation und Division: Gruppen- und Verteilmodell unterscheiden mathematische Rollen. Vollständige Gruppierung und Faktoren bis 10 sind abgesichert.
- Stellenwert, Zerlegen und Zusammensetzen: stellenwertbezogene Fehlvorstellungen und eindeutige Distraktoren sind vorhanden.
- Nachbarzahlen und Runden: Grenzen und Halbpunktregel sind parametrisch geprüft; Darstellungen maskieren gesuchte Werte.
- Addition und Subtraktion bis 1000: Rechenstrich und Stellenwertmaterial bilden Strategien ab. Die sprachliche Kürze bleibt manuell zu prüfen.
- Symmetrie: reguläre Aufgaben verwenden gerade Raster und Achsen zwischen Feldern; Achseninvarianz wird nicht beiläufig eingeführt.
- Daten, Fläche und Umfang: bekannte Werte und gesuchte Größen sind getrennt. Die Bedienhandlung ist konsistent.

### Hohe Priorität für weitere manuelle Erprobung

- Geld, Längen, Zeit, Masse und Rauminhalt: mathematisch korrekt, aber Bezugsgrößen und Fachsprache können kulturell oder situativ mehrdeutig sein. Jede Schätzvorlage braucht eine eigene Plausibilitätsprüfung.
- Körperansichten, Würfelrotation und Falten: Generatorinvarianten sind stark, die kognitive Verständlichkeit kleiner mobiler Darstellungen ist damit noch nicht belegt.
- Muster und Kombinatorik: systematisches Vorgehen ist angelegt; es muss geprüft werden, ob das Kind eine Regel entdeckt oder nur Antwortkarten vergleicht.
- Wahrscheinlichkeit: der Ergebnisraum ist jetzt visuell erkennbar. Ein echter digitaler Versuch mit Vorhersage und Auswertung bleibt didaktisch stärker als reine Auswahl.
- Ebene Figuren: der beanstandete Einstieg ist ersetzt. Zerlegen und Zusammensetzen benötigen weiterhin eine visuelle menschliche Prüfung, weil technische Teilungsmarken noch keine verständliche Handlung garantieren.

## Verbindliche Abnahmeregeln

- Eine Lernphase braucht eine eigene mathematische Handlung, nicht nur eine andere Typkennung.
- Ein einfacher Aufgabentyp darf unnötige Modellierungsschritte auslassen.
- Eine Darstellung bleibt sichtbar, solange ein Folgeschritt ausdrücklich auf sie Bezug nimmt.
- Feedback nennt den tatsächlich ausgeführten Rechenschritt und keine nicht vorkommende Strategie.
- Freie Texteingabe ist nur zulässig, wenn Sprache oder Notation selbst Lernziel sind und das akzeptierte Format erklärt wird.
- Schätzaufgaben dürfen nur eine im Kontext vertretbare beste Antwort besitzen.
- Eine leichte Aufgabe bleibt fachlich auf Klasse-3-Niveau; Unterstützung entsteht durch Darstellung und Führung, nicht durch Infantilisierung.
- Eine automatisierte Invariante ersetzt keine Prüfung mit einem Kind oder einer Lehrkraft.

## Noch nicht behauptet

- Keine pädagogische Wirksamkeit.
- Keine Freigabe durch eine Lehrkraft.
- Keine vollständige Abnahme aller 34 Kompetenzen auf einem echten iPhone.
- Keine Aussage, dass jede vorhandene Lernphase bereits optimal ist.

Die gesammelten manuellen Befunde werden als Release-Blocker behandelt. Neue Kompetenzen werden bis zur Abnahme der Kernabläufe nicht begonnen.

## Technische Abnahme der Korrekturen

- Zentrale Katalogquelle, öffentlicher Katalog, Fallback und Curriculum-Matrix sind identisch.
- Typecheck und Lint sind fehlerfrei.
- 437 Unit- und Komponententests in 24 Dateien bestehen.
- Der Produktionsbuild erzeugt den vollständigen PWA-Precache.
- 19 Playwright-Szenarien bestehen gegen Vite Preview und erneut gegen den gehärteten Read-only-Container. Darin enthalten sind `375 x 812`, `812 x 375`, WebKit-Näherung, Offline-Runde, Reload und IndexedDB-Persistenz.
- Das lokale OCI-Image ist `linux/amd64`, läuft als UID 101 mit Read-only-Dateisystem und ausschließlich `/tmp` als tmpfs und meldet `healthy`.

Diese Prüfungen belegen technische und fachliche Regressionen der konkret korrigierten Fälle. Sie ersetzen keine Beobachtung eines Kindes, keine vollständige echte iPhone-Abnahme und keine mathematikdidaktische Prüfung durch eine Lehrkraft.
