# Didaktischer Audit aller produktiven Aufgabenarten

Stand: App `0.20.1`, Katalog `0.19.1`, Schema `17`, 18. Juli 2026

## Auftrag und Abgrenzung

Dieser Bericht bewertet alle 34 produktiven Kompetenzen unabhängig von technischer Korrektheit. Maßstab ist, ob eine Aufgabe den mathematischen Denkprozess eines Kindes mit Förderbedarf am Ende der dritten Klasse unterstützt. Untersucht wurden zentrale Katalogquelle, Generatoren, Darstellungen, Runtime, Hilfen, Feedback, Remediation, adaptive Voraussetzungen und vorhandene Didaktikdokumente.

Es wurden keine Generatoren, Kataloginhalte oder UI-Komponenten verändert. Der Bericht ist eine interne fachliche Analyse, keine Lehrkraftfreigabe und kein Nachweis pädagogischer Wirksamkeit. Als curricularer Bezugsrahmen dient der aktuelle [Lehrplan Mathematik für die Primarstufe NRW](https://www.schulentwicklung.nrw.de/lehrplaene/lehrplan/289/ps_lp_m_einzeldatei_2025_03_18.pdf), insbesondere die Verbindung inhaltsbezogener Kompetenzen mit Problemlösen, Modellieren, Kommunizieren, Argumentieren und Darstellen.

## Bewertungsmaßstab

Alle Werte beziehen sich auf die derzeit produktive Aufgabe, nicht auf die Qualität des zugehörigen Konzeptdokuments.

- `5`: fachlich sehr tragfähig; mehrere Denkwege oder Darstellungswechsel werden tatsächlich unterstützt.
- `4`: gut nutzbar; begrenzte, klar benennbare Lücke.
- `3`: brauchbare Übung, aber Verständnisaufbau oder Transfer bleiben schmal.
- `2`: erhebliche didaktische Lücke; Ergebnisabfrage dominiert oder Darstellung/Progression passt nicht zum Ziel.
- `1`: kann eine Fehlstrategie fördern oder bildet den behaupteten Lerngegenstand nicht angemessen ab.

`Förderwirksamkeit` bewertet nur das begründete Potenzial der Gestaltung. Ohne Unterrichtserprobung ist sie nicht empirisch belegt.

Abkürzungen in der Matrix: `MK` mathematische Korrektheit, `DQ` didaktische Qualität, `V` Verständlichkeit, `A` Altersangemessenheit, `F` Förderwirksamkeit, `D` Darstellung, `P` Progression, `H` Hilfen, `R` Remediation.

## Gesamturteil

Der fachliche Katalog ist wesentlich reifer als eine gewöhnliche Aufgaben-App: Lernziele, Voraussetzungen, Fehlvorstellungen, Hilfen, Darstellungsrollen und Remediation sind fast überall explizit dokumentiert. Sachaufgaben besitzen einen echten Modellierungsablauf, Symmetrie vermeidet produktiv Achsensonderfälle, schriftliches Rechnen wird spaltenweise geführt und mathematische Ergebnisse werden in Darstellungen überwiegend nicht numerisch vorweggenommen.

Die produktive Runtime bleibt dennoch häufig auf dem Niveau eines gut abgesicherten Tests. Meist sieht das Kind eine fertige Aufgabe oder Darstellung und antwortet sofort. Beobachten, Material strukturieren, eine Strategie auswählen, einen Zusammenhang erklären oder eine Darstellung selbst vervollständigen sind selten Teil der Interaktion. Dadurch kann ein richtiges Ergebnis deutlich mehr Lernwert suggerieren, als tatsächlich nachgewiesen wurde.

Der größte Abstand zwischen Konzept und Förderpraxis liegt nicht in mathematischer Korrektheit, sondern in vier Punkten:

1. Lernphasen verändern häufig nur Sichtbarkeit und Zahlenbereich, nicht die Tätigkeit des Kindes.
2. Hinterlegte Fehlvorstellungen steuern Distraktoren, aber nicht das konkrete Feedback.
3. Mehrere Darstellungen sind statische Endprodukte statt Werkzeuge für einen eigenen Denkweg.
4. Transferziele werden beschrieben, aber fast nie erhoben oder ausgewertet.

## Priorisierte Befunde

### Kritische didaktische Mängel

#### K1: `activate` und `understand` besitzen kaum eigene Lernhandlungen

Die adaptive Runtime setzt für neue oder unsichere Kompetenzen zwar die Lernphase `activate` beziehungsweise `understand`, erzeugt aber in der Regel dieselbe Stufe-1-Ergebnisaufgabe wie in `guided-practice`. Geändert wird vor allem, ob eine Darstellung sichtbar ist. Das Kind muss damit bereits rechnen, klassifizieren oder auswählen, bevor eine mathematische Idee gezielt beobachtet, aufgebaut oder versprachlicht wurde.

Folge: Ein fehlendes Vorwissen wird nicht aufgebaut, sondern nur mit mehr Sichtbarkeit erneut abgefragt. Vor jeder Kompetenz sollten mindestens eine Beobachtungs-/Zuordnungsaufgabe und eine angeleitete Aufbauhandlung definiert werden.

#### K2: Fehlvorstellungsspezifisches Feedback ist vorbereitet, wird aber nicht verwendet

Antwortoptionen tragen `misconception`-Metadaten, die Runtime übergibt beim Anklicken jedoch nur den Antwortwert. Jede falsche Option erhält denselben allgemeinen Fehlertext. Damit bleibt der zentrale Förderanspruch, auf Ziffer-Stellenwert-Verwechslung, falsche Rechenrichtung, Innenkanten oder vertauschte Kategorien passend zu reagieren, unerfüllt.

Folge: Plausible Distraktoren verbessern derzeit vor allem die Testqualität, nicht die individuelle Hilfe. Das konkrete Distraktormuster sollte nach dem ersten Fehler eine passende Rückfrage, Darstellung oder Strategie auswählen.

#### K3: Addition und Subtraktion fördern teilweise genau die zählenden Strategien, die sie ablösen sollen

Die erste Hilfe lautet sinngemäß „zähle weiter“ beziehungsweise „gehe Schritte zurück“. Der Rechenstrich zeigt einen einzigen großen Sprung; die im Generator berechneten Zerlegungen bis 10 werden nicht als zwei sichtbare Sprünge genutzt. Punktefelder und Teil-Ganzes-Modelle stehen im Katalog, werden aber produktiv nicht erzeugt.

Folge: Kinder mit Förderbedarf können im zählenden Rechnen stabilisiert werden. Der Einstieg sollte Mengenstruktur und Ergänzen zur 10 sichtbar machen; Zählen darf höchstens Rückfallebene sein.

#### K4: Stellenwert, Zerlegen und Zusammensetzen bauen Bündelung nicht auf

Die Runtime zeigt ausschließlich Ziffern in einer H-Z-E-Tafel. Hunderterflächen, Zehnerstangen, Einerpunkte, aktives Bündeln und Entbündeln fehlen trotz Katalogbeschreibung. Bei `decompose` und `compose` erzeugt Stufe 3 ausschließlich Zahlen der Form `x00`; diese sind objektiv oft einfacher als Stufe 2 mit einer einzelnen Null.

Folge: Die Progression kann Schwierigkeit falsch einschätzen und symbolisches Stellenlesen mit Stellenwertverständnis verwechseln. Material, Darstellungswechsel und nichtkanonische Zerlegungen müssen vor Automatisierung aufgebaut werden.

#### K5: Einige Pflichtdarstellungen bilden den Lerngegenstand nicht vollständig ab

- Nachbarzehner/-hunderter: Die gesuchten Endpunkte werden korrekt maskiert, der Zahlenstrahl besitzt dann aber keine beschriftete Skala oder tragfähige Zwischenmarken. Die zweite Hilfe nennt dagegen beide gesuchten Nachbarn vollständig.
- Addition/Subtraktion bis 1000, Stufe 1: Die Stellenwerttafel zeigt nur die Ziffern des ersten Operanden; der zweite Operand und seine Veränderung fehlen.
- Längen, Stufe 3: Die Darstellung nutzt nur die erste Länge. `secondLengthCm` und `operation` werden vom Renderer nicht dargestellt.
- Säulendiagramme: Säulen tragen die Werte als Text; Achse, Teilstriche und Skala fehlen. Das Kind kann Zahlen vergleichen, ohne ein Diagramm zu lesen.

Folge: Die Darstellung ist entweder zu informationsarm oder umgeht den behaupteten Denkprozess.

#### K6: Transfer wird katalogisiert, aber nicht geprüft

Tauschaufgabe nennen, Rechenweg vergleichen, Ergebnis begründen, eigene Geschichte bilden, Musterregel beschreiben oder gleiche Fläche bei anderem Umfang erklären sind nur Texte im Katalog. Die Runtime erzeugt daraus keine Interaktion und speichert keine Transferleistung.

Folge: `transfer` ist vielfach eine schwierigere Auswahlaufgabe, kein Nachweis der Übertragung. Lernstand und Status dürfen Transfer erst ausweisen, wenn eine passende Transferhandlung tatsächlich bearbeitet wurde.

### Hohe Priorität

#### H1: Division zeigt eine fertige Aufteilung statt den Aufteilungsprozess

Gruppieren und Verteilen sind fachlich sauber unterschieden. Das statische Modell zeichnet jedoch bereits alle Gruppen mit vollständiger Punktzahl. Das Kind kann die gesuchte Größe abzählen, muss die Gesamtmenge aber nicht selbst gruppieren oder verteilen. Für Stufe 1 ist dies eine sinnvolle Anschauung, aber noch keine eigenständige Handlung.

#### H2: Multiplikation bleibt überwiegend Ergebnisabfrage

Gleich große Gruppen sind korrekt sichtbar. Tauschaufgaben, Verdoppeln/Halbieren, Nachbaraufgaben und Ableitungsstrategien werden nicht aktiv bearbeitet. Die Progression sortiert hauptsächlich Reihen und blendet Darstellung aus; sie baut Strategiekompetenz nicht systematisch auf.

#### H3: Größenprogressionen vermischen unterschiedliche Ideen

Geld springt von Münzenzählen über gemischte Beträge direkt zu Wechselgeld. Masse und Rauminhalt springen von unscharfen Alltags-Schätzungen zum Ergänzen auf 1000 und anschließend zu symbolischen Rechnungen. Zu einer Packung, einem Glas oder einer Flasche wird dabei trotz realer Streuung genau ein Schätzwert als einzig akzeptierte Antwort hinterlegt.

#### H4: Schriftliche Verfahren prüfen die Notation nur teilweise

Die Stellen sind im Renderer bereits korrekt untereinander angeordnet; das Kind übt das Ausrichten nicht selbst. Bei schriftlicher Addition wird der Übertrag auf Stufe 3 nicht als eigener Wert eingegeben. Die fachliche Bündelungs- beziehungsweise Entbündelungsidee ist dokumentiert, aber kaum mit Materialhandlung verknüpft.

#### H5: Sachaufgaben sind gut geführt, bleiben aber stark auswahlbasiert

Suchgröße, relevante Angaben, Modell, Gleichung, Plausibilität und Antwortsatz folgen einer sinnvollen Reihenfolge. Modell, Gleichung und Antwortsatz werden jedoch überwiegend gewählt statt konstruiert. Ein Kind kann durch Ausschluss erfolgreich sein, ohne selbst ein Modell oder einen Satz zu bilden.

#### H6: Kombinatorik zeigt das Tableau, ohne systematisches Erzeugen zu verlangen

Das leere Raster und sogar das Multiplikationszeichen machen die Anzahl strukturell sichtbar. Das Kind füllt keine Paarungen und dokumentiert keine Zählreihenfolge. Die Aufgabe prüft eher das Ablesen der Rastergröße als vollständiges systematisches Finden.

#### H7: Raumvorstellung beginnt direkt mit abstrakten Projektionen

Körperansichten, Rotation und Falten sind mathematisch sauber begrenzt. Es fehlt jedoch eine vorangehende Beobachtungs- oder Manipulationsphase mit einzelnen markierten Würfeln, Schichtaufbau oder schrittweiser Blickrichtungsänderung. Für Kinder ohne Erfahrung mit axonometrischen Bildern ist die Darstellung selbst ein zusätzlicher Lerngegenstand.

### Mittlere Priorität

- Rundung besitzt eine gute Abstandsprogression; Hilfe 2 gibt Abstände jedoch vollständig vor und Transfer zu sinnvoller Genauigkeit fehlt.
- Symmetrie trennt das Spiegelprinzip überzeugend von Achseninvarianz; produktiv bleibt nur das Wiedererkennen einer fertigen Lösung statt eigenes Ergänzen.
- Uhrzeit führt volle und halbe Stunden gemeinsam ein und wechselt danach sofort zu beliebigen Fünfminutenschritten.
- Tabellen und Strichlisten sind brauchbar, führen aber Darstellung und Differenzbildung teilweise gleichzeitig ein.
- Wahrscheinlichkeit klassifiziert nachvollziehbar, enthält aber keine Vorhersage-Erprobung-Auswertung und keine Begründungseingabe.
- Muster beschränken sich auf das nächste Symbol in periodischen Folgen; wachsende Muster und mehrere Fortsetzungen fehlen.
- Fläche und Umfang beginnen verständlich am Raster, bleiben aber beim Abzählen; Strukturieren, Vergleichen und Erklären sind nicht produktiv.

### Geringe Priorität

- Formulierungen sind überwiegend kurz, freundlich und auf kleinen Bildschirmen erfassbar.
- Antwortoptionen sind technisch eindeutig und überwiegend aus plausiblen Fehlern abgeleitet.
- Die Maskierung unbekannter numerischer Werte ist repositoryweit deutlich verbessert.
- Symmetrieachsen, schriftliche Spalten und Rasterdarstellungen sind visuell stabil; eine echte Geräte- und Lehrkraftprüfung steht dennoch aus.

## Bewertungsmatrix

| Kompetenz | MK | DQ | V | A | F | D | P | H | R | Kurzbegründung |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Addition bis 20 | 5 | 2 | 4 | 4 | 2 | 2 | 2 | 2 | 3 | Zählen und Einzelsprung statt Zehnerstruktur |
| Subtraktion bis 20 | 5 | 2 | 4 | 4 | 2 | 2 | 2 | 2 | 3 | Rückwärtszählen dominiert; Grundvorstellungen fehlen |
| Multiplikation | 5 | 3 | 4 | 4 | 3 | 4 | 3 | 3 | 3 | Gruppenbild gut, Strategien und Ableitungen fehlen |
| Division | 5 | 3 | 4 | 4 | 3 | 3 | 3 | 3 | 3 | Grundvorstellungen getrennt, Aufteilung bereits fertig |
| Stellenwert | 5 | 2 | 4 | 4 | 2 | 2 | 2 | 3 | 3 | Tafel ohne Bündelungsmaterial; Stufe 3 sehr schmal |
| Zerlegen | 5 | 2 | 4 | 4 | 2 | 2 | 1 | 3 | 3 | `x00` auf Stufe 3 ist keine Steigerung |
| Zusammensetzen | 5 | 2 | 4 | 4 | 2 | 2 | 1 | 3 | 3 | Symbolisches Bilden ohne Material- oder Darstellungswechsel |
| Nachbarzehner | 5 | 2 | 3 | 4 | 2 | 1 | 3 | 2 | 3 | Maskierter Zahlenstrahl hilft kaum, Hilfe 2 verrät Ergebnis |
| Nachbarhunderter | 5 | 2 | 3 | 4 | 2 | 1 | 3 | 2 | 3 | Gleiches Problem auf größerer Stellenebene |
| Runden auf Zehner | 5 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 4 | Abstände und Halbpunkt tragfähig, Kontexttransfer fehlt |
| Runden auf Hunderter | 5 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 4 | Gute Parallelprogression, noch stark auswahlbasiert |
| Sachaufgaben | 5 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | Starker Ablauf, aber Modell/Satz werden nicht konstruiert |
| Symmetrie | 5 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | Saubere Achsenprogression, nur Lösungserkennung |
| Addition bis 1000 | 5 | 2 | 4 | 4 | 2 | 1 | 3 | 3 | 3 | Materialdarstellung unvollständig, Sprünge nicht aufgebaut |
| Schriftliche Addition | 5 | 3 | 4 | 4 | 3 | 4 | 3 | 4 | 4 | Gute Spaltenfolge, Ausrichten/Übertrag Stufe 3 nicht erhoben |
| Subtraktion bis 1000 | 5 | 2 | 4 | 4 | 2 | 1 | 3 | 3 | 3 | Darstellung zeigt Rechenhandlung nicht vollständig |
| Schriftliche Subtraktion | 5 | 3 | 4 | 4 | 3 | 4 | 3 | 4 | 4 | Entbündelung sichtbar, Materialgrundlage und freie Notation fehlen |
| Ergänzen bis 1000 | 5 | 3 | 4 | 4 | 3 | 3 | 3 | 3 | 3 | Bekanntes Ziel sinnvoll; Sprünge werden nicht aktiv gebildet |
| Geld | 5 | 2 | 4 | 4 | 2 | 3 | 2 | 3 | 3 | Unnatürlicher Zahlbetrag und fehlende Zwischenstufen |
| Längen | 5 | 2 | 4 | 4 | 2 | 1 | 2 | 3 | 3 | Rechendarstellung ignoriert zweiten Wert und Operation |
| Körperansichten | 5 | 3 | 3 | 3 | 3 | 4 | 3 | 3 | 3 | Korrekte Projektion, abstrakter Einstieg ohne Handlung |
| Würfelrotation | 5 | 3 | 3 | 3 | 3 | 4 | 3 | 3 | 3 | Gut begrenzt, hohe mentale Last und kein Zwischenzustand |
| Falten und Spiegeln | 5 | 3 | 3 | 3 | 3 | 4 | 2 | 3 | 3 | Faltschnitt als neue Idee erst auf Transferstufe |
| Tabellen/Strichlisten | 5 | 3 | 4 | 4 | 3 | 4 | 3 | 3 | 3 | Solide Basis, Differenz und neue Darstellung gleichzeitig |
| Bild-/Säulendiagramme | 5 | 2 | 4 | 4 | 2 | 1 | 3 | 3 | 3 | Gedruckte Werte ersetzen Achse und Skalenlesen |
| Wahrscheinlichkeit | 5 | 3 | 4 | 4 | 3 | 3 | 3 | 3 | 3 | Sichtbarer Ergebnisraum, aber keine Erprobung/Begründung |
| Kombinatorik | 5 | 2 | 4 | 4 | 2 | 2 | 3 | 3 | 3 | Tableau und `×` liefern Struktur ohne eigenes Auflisten |
| Zeit | 5 | 3 | 4 | 4 | 3 | 4 | 2 | 3 | 3 | Gute Uhr, aber volle und halbe Stunde nicht getrennt aufgebaut |
| Masse | 4 | 2 | 4 | 4 | 2 | 2 | 2 | 3 | 3 | Näherungen als eindeutige Werte; Waage weitgehend symbolisch |
| Rauminhalt | 4 | 2 | 4 | 4 | 2 | 2 | 2 | 3 | 3 | Gefäßgrößen variieren; Messgefäß nur teilweise genutzt |
| Ebene Figuren | 5 | 3 | 4 | 4 | 3 | 3 | 3 | 3 | 3 | Außenrandidee gut, Eigenschaften und eigenes Legen fehlen |
| Muster | 5 | 3 | 5 | 4 | 3 | 4 | 3 | 3 | 3 | Klar, aber nur nächstes Symbol periodischer Folgen |
| Fläche | 5 | 3 | 4 | 4 | 3 | 4 | 3 | 3 | 3 | Einheitsquadrate korrekt, Strukturieren/Vergleichen fehlen |
| Umfang | 5 | 3 | 4 | 4 | 3 | 4 | 3 | 4 | 3 | Außenrand klar markiert, überwiegend Abzählaufgabe |

## Audit je Aufgabenart

### Addition bis 20

- **Lernziel und Voraussetzungen:** Tragfähige Zahlzerlegung und Übergang über 10 statt zählender Einzelstrategien; vorausgesetzt werden Mengen bis 10 und Ergänzen zur 10. Diese Grundlagen werden in der App nicht eigenständig aufgebaut oder überprüft.
- **Einstieg, Wahrnehmen, Darstellung:** Die Aufgabe beginnt sofort mit einer Ergebniszahl. Der Rechenstrich zeigt einen Sprung von `first` zu `?`, aber kein Zehnerfeld, keine Teil-Ganzes-Beziehung und keine Zerlegung des zweiten Summanden.
- **Progression und Belastung:** Der Zahlenbereich wächst und die Darstellung verschwindet. Eine neue Strategie wird nicht aktiv aufgebaut; `toTen` und `rest` existieren im Generator, bleiben aber unsichtbar.
- **Hilfen, Feedback, Remediation:** „Zähle weiter“ ist verständlich, aber für diese Zielgruppe didaktisch kontraproduktiv. Feedback ist allgemein; nach zwei Fehlern wird erklärt und zu einer leichteren Aufgabe gewechselt.
- **Transfer und Empfehlung:** Tauschaufgaben stehen nur im Katalog. Gelungen sind kleiner Zahlenraum und fehlender Zeitdruck. Neu zu denken sind Einstieg mit strukturierten Mengen, zwei sichtbaren Sprüngen bis 10, Auswahl/Vergleich von Strategien und echte Tauschaufgaben.

### Subtraktion bis 20

- **Lernziel und Voraussetzungen:** Wegnehmen, Unterschied und Ergänzen sowie Übergang über 10 verstehen. Produktiv wird fast ausschließlich Wegnehmen durch Rückwärtssprung genutzt; Teil-Ganzes und Ergänzen werden vorausgesetzt.
- **Einstieg, Wahrnehmen, Darstellung:** Sofortige Ergebniseingabe; der Rechenstrich macht die Richtung sichtbar, aber weder entfernte Teilmenge noch Ergänzungsbeziehung.
- **Progression und Belastung:** Ohne Übergang, mit Übergang, danach ohne sichtbare Darstellung. Der Wechsel zwischen Wegnehmen und Ergänzen ist keine Lernstufe.
- **Hilfen, Feedback, Remediation:** „Gehe Schritte zurück“ stabilisiert Rückwärtszählen. „Beim Minus wird die Zahl kleiner“ hilft nicht bei Vergleichs- oder Ergänzungsvorstellungen und ist als allgemeine Aussage für spätere Zahlenbereiche zu eng.
- **Transfer und Empfehlung:** Plusprobe wird nicht bearbeitet. Benötigt werden Teil-Ganzes-Bilder, Ergänzen zur 10, Strategieentscheidung und kontrastierende Aufgaben mit gleichem Term, aber anderer Grundvorstellung.

### Multiplikation

- **Lernziel und Voraussetzungen:** Gleich große Gruppen und Ableitung von Einmaleinsfakten verstehen; wiederholte Addition und Mengenstruktur werden vorausgesetzt, aber nicht geprüft.
- **Einstieg, Wahrnehmen, Darstellung:** Das Gruppenbild ist mathematisch korrekt und vollständig. Das Kind beantwortet dennoch sofort die Gesamtzahl; Gruppen werden nicht selbst gebildet oder beschrieben.
- **Progression und Belastung:** Reihenfolge 2/5/10, 3/4/6, 6/7/8/9 ist nachvollziehbar, aber Schwierigkeit wird primär über Reihen und Ausblenden erhöht. Strategien wie Verdoppeln, Tausch- und Nachbaraufgabe fehlen.
- **Hilfen, Feedback, Remediation:** Wiederholte Addition wird konkret genannt. Feedback greift nicht auf den tatsächlich gewählten Fehler zurück; Remediation verspricht eine Nachbarreihe, erzeugt aber nur eine leichtere Reihenfamilie.
- **Transfer und Empfehlung:** Tauschaufgabe und Division werden nicht produktiv. Gruppen sollten zunächst gelegt/zugeordnet, danach in Array, Summe und Malterm übersetzt und erst zuletzt automatisiert werden.

### Division

- **Lernziel und Voraussetzungen:** Gruppieren und Verteilen unterscheiden und Multiplikation als Umkehrung nutzen. Die App setzt bereits tragfähige Einmaleinsvorstellungen voraus.
- **Einstieg, Wahrnehmen, Darstellung:** Gesamtmenge, Gruppenanzahl beziehungsweise Gruppengröße sind korrekt benannt. Die vollständige Partition ist aber schon gezeichnet; die eigentliche Aufteilungsaktivität entfällt.
- **Progression und Belastung:** Divisorfamilien und Sichtbarkeit ändern sich. Gruppieren und Verteilen wechseln zufällig innerhalb derselben Stufe, ohne dass eine Grundvorstellung zuerst gesichert wird.
- **Hilfen, Feedback, Remediation:** Beide Hilfen führen unmittelbar zur Umkehraufgabe und unterscheiden die zwei Situationen nicht. Das Fehlerfeedback nennt den Unterschied, reagiert aber nicht darauf, welche Größe das Kind verwechselt hat.
- **Transfer und Empfehlung:** Malprobe und eigene Verteilgeschichte bleiben Text. Benötigt werden getrennte Einstiegsfolgen, aktives Ziehen/Zuordnen aller Punkte, anschließend Gleichung und erst dann gemischter Transfer.

### Stellenwert

- **Lernziel und Voraussetzungen:** Ziffer, Position und Wert im Dezimalsystem unterscheiden; Bündelung wird vorausgesetzt.
- **Einstieg, Wahrnehmen, Darstellung:** Die H-Z-E-Tafel ist klar, zeigt aber nur Ziffern. Sie hilft beim Ablesen, nicht beim Verständnis, warum eine 7 den Wert 70 besitzt.
- **Progression und Belastung:** Null als Platzhalter ist sinnvoll. Stufe 3 fragt bevorzugt eine Nullstelle in Zahlen mit vielen Nullen ab; das ist schmal und nicht verlässlich anspruchsvoller.
- **Hilfen, Feedback, Remediation:** Begriffe Ziffer und Wert werden passend unterschieden. Das angekündigte Material erscheint in der produktiven Darstellung nicht; Remediation bleibt dadurch symbolisch.
- **Transfer und Empfehlung:** Verschieben einer Ziffer wird nicht durchgeführt. Erforderlich sind Hunderterflächen, Zehnerstangen, Einer, Bündeln/Entbündeln und Wechsel zwischen Material, Tafel, Zahlwort und Zahl.

### Zahlen zerlegen

- **Lernziel und Voraussetzungen:** Additive Stellenwertstruktur verstehen; setzt tragfähigen Stellenwert voraus.
- **Einstieg, Wahrnehmen, Darstellung:** Kind sieht Zahl und gegebenenfalls Zifferntafel, dann wählt es eine fertige Zerlegung. Eigenes Sortieren oder Legen fehlt.
- **Progression und Belastung:** Eine Null erhöht zunächst die Anforderung, zwei Nullen in `x00` reduzieren sie wieder. Nichtkanonische Zerlegungen fehlen.
- **Hilfen, Feedback, Remediation:** Stellenbezogene Hinweise sind klar, aber die Tafel wiederholt nur die Ausgangsziffern. Antwortspezifische Fehler wie Ziffer statt Wert werden nicht gesondert behandelt.
- **Transfer und Empfehlung:** Rückweg zum Zusammensetzen ist nur Katalogtext. Stufe 3 sollte mehrere korrekte Zerlegungen, Entbündelung und Darstellungswechsel statt trivialer Nullmuster nutzen.

### Zahlen zusammensetzen

- **Lernziel und Voraussetzungen:** Aus Stellenwertmengen eine Zahl bilden; Stellenwertwissen wird vorausgesetzt.
- **Einstieg, Wahrnehmen, Darstellung:** Die drei Zahlen sind bereits in H-Z-E-Spalten geordnet. Das Kind muss nur Ziffern aneinanderfügen.
- **Progression und Belastung:** Wie beim Zerlegen wird `x00` fälschlich als höchste Stufe verwendet. Materialmengen und ungeordnete Angaben fehlen.
- **Hilfen, Feedback, Remediation:** Reihenfolgehinweis ist verständlich, diagnostiziert aber Vertauschungen nicht konkret.
- **Transfer und Empfehlung:** Zunächst Material/ungeordnete Stellenkarten sortieren, dann Zahlwort und Zahl bilden; später nichtkanonische Angaben wie `2H 14Z` einführen.

### Nachbarzehner

- **Lernziel und Voraussetzungen:** Intervall zwischen aufeinanderfolgenden Zehnervielfachen verstehen; Zehnerstruktur wird vorausgesetzt.
- **Einstieg, Wahrnehmen, Darstellung:** Sofortige Auswahl eines Zahlenpaares. Der Zahlenstrahl zeigt die Zahl zwischen zwei `?`, aber keine nutzbare Zehnerskala.
- **Progression und Belastung:** Lage in der Mitte, grenznah, beliebig ist fachlich sinnvoll; ohne Skala trägt die sichtbare Stufe diesen Aufbau nicht.
- **Hilfen, Feedback, Remediation:** Hilfe 1 beschreibt die Strategie. Hilfe 2 nennt `lower` und `upper` und damit die komplette Lösung. Remediation zeigt erneut denselben maskierten Ausschnitt.
- **Transfer und Empfehlung:** Zahlenstrahl mit bekannten Referenzmarken, schrittweisem Suchen der kleineren vollen Zahl und erst danach größerem Nachbarn; Nähe/Rundung anschließend als eigener Transfer.

### Nachbarhunderter

- **Lernziel und Voraussetzungen:** Analoges Intervallverständnis auf Hunderterebene; sichere Hunderter- und Zahlordnung vorausgesetzt.
- **Einstieg, Wahrnehmen, Darstellung:** Gleiches Problem wie bei Nachbarzehnern, verstärkt durch den größeren Abstand ohne Zwischenmarken.
- **Progression und Belastung:** Grenznähe ist sinnvoll, doch ein Kind kann ohne Zehnerstützpunkte kaum wahrnehmen, wo die Zahl im Hunderterintervall liegt.
- **Hilfen, Feedback, Remediation:** Zweite Hilfe verrät beide Grenzen. Spezifische Verwechslung mit Nachbarzehnern wird im Feedback nicht aufgegriffen.
- **Transfer und Empfehlung:** Hunderterstrecke mit ausgewählten Zehnermarken, Vergleich von Zehner- und Hunderternachbarn und aktive Einordnung derselben Zahl auf zwei Skalen.

### Runden auf Zehner

- **Lernziel und Voraussetzungen:** Runden als Abstandsentscheidung verstehen; Nachbarzehner und Abstände sind echte Voraussetzungen.
- **Einstieg, Wahrnehmen, Darstellung:** Stufe 1 zeigt bekannte Nachbarn und relative Lage; das unterstützt die Entscheidung, ohne das Ergebnis zu nennen.
- **Progression und Belastung:** Nachbarn wählen, runden, begründen ist eine echte Schrittfolge. Halbpunkt wird explizit als eigener Fall behandelt.
- **Hilfen, Feedback, Remediation:** Abstände werden in Hilfe 2 komplett genannt; das ist starke Hilfe, aber noch eine Erklärung des Weges. Falsche „immer hoch/runter“-Strategien sind als Distraktoren passend.
- **Transfer und Empfehlung:** Gute Basis. Ergänzen sollten Kinder Abstände selbst markieren und entscheiden, wann Runden sinnvoll ist; Transfer darf nicht nur eine vorformulierte Begründung auswählen.

### Runden auf Hunderter

- **Lernziel und Voraussetzungen:** Abstandsentscheidung auf Hunderterebene; setzt Nachbarhunderter und Zahlordnung voraus.
- **Einstieg, Wahrnehmen, Darstellung:** Wie bei Zehnern tragfähig; relative Position wird sichtbar.
- **Progression und Belastung:** Parallelität erleichtert Transfer. Der größere Zahlenraum ist nicht alleinige Schwierigkeit, da Begründung hinzukommt.
- **Hilfen, Feedback, Remediation:** Fachlich korrekt und ruhig, aber nicht aus dem konkreten Distraktor abgeleitet.
- **Transfer und Empfehlung:** Beibehalten, um eigene Markierungen, Überschlagskontexte und verschiedene sinnvolle Genauigkeiten erweitern.

### Sachaufgaben

- **Lernziel und Voraussetzungen:** Situation strukturieren, Suchgröße und relevante Angaben bestimmen, Modell und Gleichung bilden, Ergebnis prüfen und kontextualisieren. Grundvorstellungen zu Rechenarten werden vorausgesetzt, ohne vor der verpflichtenden Sachaufgabe geprüft zu werden.
- **Einstieg, Wahrnehmen, Darstellung:** Der Ablauf beginnt sinnvoll mit Suchgröße und wichtigen Angaben. Stufe 1 untersucht ein Modell, Stufen 2/3 wählen es. Balken und Gruppen lassen die Unbekannte offen.
- **Progression und Belastung:** Stufe 3 kombiniert unwichtige Angabe und teilweise zwei Rechenschritte. Das kann zwei neue Anforderungen gleichzeitig einführen. Alle Aufgaben durchlaufen viele Auswahlstationen, was die Runde lang und testartig machen kann.
- **Hilfen, Feedback, Remediation:** Schrittfeedback ist besser als bei Einzelaufgaben. Dennoch wird eine falsche konkrete Modelloption nicht differenziert erklärt. Nach zwei Fehlern endet die eigene Bearbeitung statt mit einem erneuten Modellierungsversuch.
- **Transfer und Empfehlung:** Große Stärke des Produkts. Nächste Stufe: Angaben direkt im Text markieren, Modelle teilweise ergänzen, Gleichungen aus Bausteinen legen und einen kurzen Antwortsatz vervollständigen statt nur auswählen.

### Symmetrie

- **Lernziel und Voraussetzungen:** Seitenwechsel bei gleichem Achsenabstand verstehen; Richtungen und Rasterlesen werden vorausgesetzt.
- **Einstieg, Wahrnehmen, Darstellung:** Die sichtbare Achse zwischen Zellen reduziert kognitive Last überzeugend. Drei gleichartige Bilder erlauben konzentrierten Vergleich.
- **Progression und Belastung:** Figurkomplexität, Distraktorähnlichkeit und später waagerechte Achse steigern die Idee. Ungerade Raster sind korrekt aus dem produktiven Weg entfernt.
- **Hilfen, Feedback, Remediation:** Hilfen lenken auf Seite und Abstand. Remediation verspricht ein einzelnes Feld, erzeugt aber weiterhin eine komplette Auswahlaufgabe auf niedrigerer Stufe.
- **Transfer und Empfehlung:** Didaktisch einer der stärksten Bereiche. Als nächster Schritt sollte das Kind ein Spiegelpaar markieren oder eine Hälfte zellenweise ergänzen; reine Wiedererkennung reicht nicht für sicheres Verständnis.

### Addition bis 1000

- **Lernziel und Voraussetzungen:** Stellenweise und über volle Zwischenzahlen addieren; Stellenwert und Grundaufgaben werden vorausgesetzt.
- **Einstieg, Wahrnehmen, Darstellung:** Stufe 1 zeigt nur die erste Zahl in einer Stellenwerttafel. Der zweite Summand und die zu verändernde Stelle fehlen; die Darstellung kann den Rechenweg nicht erklären.
- **Progression und Belastung:** H/Z ohne Übergang, Einerübergang, Zehnerübergang ist plausibel. Die Übergangsstufen prüfen eine Zwischenzahl, lassen die Zerlegung des Summanden aber nicht selbst bilden.
- **Hilfen, Feedback, Remediation:** Strategietext ist konkret, Darstellung und Text sind jedoch nicht synchron. Fehlerfeedback bleibt auf „ordne Stellen“ beschränkt.
- **Transfer und Empfehlung:** Operanden mit Material darstellen, betroffene Stelle aktiv verändern, Übergang als zwei selbst gewählte Sprünge legen und alternative Wege vergleichen.

### Schriftliche Addition

- **Lernziel und Voraussetzungen:** Stellen ausrichten, von rechts nach links addieren und Bündelung als Übertrag verstehen. Die Runtime sperrt die Kompetenz anhand von Stellenwert und halbschriftlicher Addition, misst dort aber nur Ergebnisleistung.
- **Einstieg, Wahrnehmen, Darstellung:** Spalten, aktive Stelle und sukzessiv aufgedeckte Ergebnisziffern sind klar. Die korrekte Ausrichtung ist vorgegeben und wird nicht geübt.
- **Progression und Belastung:** Ohne Übertrag, expliziter Einerübertrag, selbstständiger Einer-/Zehnerübertrag ist grundsätzlich schlüssig. Auf Stufe 3 wird der Übertrag nicht als eigener Wert eingegeben.
- **Hilfen, Feedback, Remediation:** Spaltenspezifische Texte sind konkret. Bündelung bleibt aber verbal und wird nicht mit zehn Einern/einem Zehner dargestellt.
- **Transfer und Empfehlung:** Gute Verfahrensführung. Ergänzen: Zahlenkarten ausrichten, Bündelung visuell ausführen, Übertrag auch selbst notieren und Überschlag/Erklärung tatsächlich bearbeiten.

### Subtraktion bis 1000

- **Lernziel und Voraussetzungen:** Stellenweise subtrahieren oder über eine volle Zahl ergänzen; Stellenwert und Subtraktion bis 20 vorausgesetzt.
- **Einstieg, Wahrnehmen, Darstellung:** Stufe 1 zeigt erneut nur die erste Zahl in H-Z-E. Der abgezogene Wert und die Veränderung fehlen.
- **Progression und Belastung:** Ganze Hunderter, Zehner ohne Entbündelung, kontrollierter Übergang ist sinnvoll. In Stufe 3 wird nur ein vom Generator festgelegter Weg abgefragt.
- **Hilfen, Feedback, Remediation:** Strategietext benennt den Zwischenschritt; spezifische Fehler wie falsche Richtung oder stellenweises Vertauschen erhalten keinen eigenen Pfad.
- **Transfer und Empfehlung:** Stellenwertmaterial und Rechenstrich konsistent koppeln, Wegnehmen und Ergänzen kontrastieren und Plusprobe produktiv machen.

### Schriftliche Subtraktion

- **Lernziel und Voraussetzungen:** Stellengerecht subtrahieren, genau einmal entbündeln und durch Addition prüfen. Voraussetzungen werden adaptiv gesperrt, aber nicht konzeptuell diagnostiziert.
- **Einstieg, Wahrnehmen, Darstellung:** Originalziffern, veränderte Stellen und Ergebniszeile sind gut getrennt. Ausrichten ist bereits erledigt.
- **Progression und Belastung:** Ohne Entbündelung, sichtbare Einerentbündelung, selbstständige Entbündelung mit Probe ist schlüssig. Die Additionsprobe wird als weitere Zahleneingabe durchgeführt, nicht als Zusammenhang erklärt.
- **Hilfen, Feedback, Remediation:** Spaltenspezifisch und fachlich korrekt. Das Tauschen einer Einheit bleibt symbolisch; Materialhandlung fehlt.
- **Transfer und Empfehlung:** Entbündeln zunächst mit Material/Stellenwerttafel vollziehen, danach Notation ableiten; Fehler an abgebender und empfangender Stelle getrennt rückmelden.

### Ergänzen bis 1000

- **Lernziel und Voraussetzungen:** Abstand zur nächsten vollen Zehner-/Hunderterzahl in Teilstrecken bestimmen.
- **Einstieg, Wahrnehmen, Darstellung:** Start und Ziel sind bei dieser Aufgabenform bekannte Größen; die gesuchten Sprünge bleiben maskiert. Das ist fachlich korrekt.
- **Progression und Belastung:** Nächster Zehner, nächster Hunderter über Zehner, danach ohne Rechenstrich ist nachvollziehbar.
- **Hilfen, Feedback, Remediation:** Strategie wird passend beschrieben, aber Sprünge werden nicht selbst festgelegt. Nach Fehlern folgt nur eine neue Aufgabe.
- **Transfer und Empfehlung:** Kind sollte Zwischenziel wählen und Sprunglängen eintragen; Verbindung zu Subtraktion, Geldwechsel und Zeitspanne aktiv herstellen.

### Geld

- **Lernziel und Voraussetzungen:** Wertgleichheit von Euro/Cent und Ergänzen in Kaufsituationen verstehen; Stellenwert und Rechnen bis 1000 vorausgesetzt.
- **Einstieg, Wahrnehmen, Darstellung:** Münzbilder sind zählbar und Gesamtwert bleibt offen. Bei 10 Euro werden mangels Scheinen fünf 2-Euro-Münzen gezeigt; das ist lebensweltlich unglücklich.
- **Progression und Belastung:** Ganze Euro, gemischte Beträge, Wechselgeld lässt Zwischenschritte wie gleichwertig legen, vergleichen, passend bezahlen und mehrere Ergänzungswege aus.
- **Hilfen, Feedback, Remediation:** Einheit und Ergänzen werden genannt. Preis/Rückgeld-Verwechslung ist als Distraktor gespeichert, aber nicht gezielt erklärt.
- **Transfer und Empfehlung:** Reale Münz-/Scheinkombinationen, aktives Legen desselben Betrags, passende Zahlung und Ergänzen über volle Euro vor Wechselgeld einführen.

### Längen

- **Lernziel und Voraussetzungen:** Maßzahl und Einheit verbinden, Skalen lesen und `1 m = 100 cm` verstehen.
- **Einstieg, Wahrnehmen, Darstellung:** Stufe 1 besitzt Nullpunkt und Strecke. Die digitale Skala zeigt jedoch nur elf Teilstriche unabhängig von bis zu 20 cm und ist nicht physisch maßstabgetreu.
- **Progression und Belastung:** Ablesen, reine Umrechnung, Rechnen ist eher Themenwechsel als kontinuierlicher Aufbau. Schätzen und Referenzgrößen fehlen produktiv.
- **Hilfen, Feedback, Remediation:** Hinweise sind grundsätzlich sinnvoll. Auf Stufe 3 zeigt der Renderer nur `firstCm`; zweite Länge und Operation sind unsichtbar, obwohl die Hilfe auf beide bekannten Längen zielt.
- **Transfer und Empfehlung:** Darstellung zuerst korrigieren; danach Schätzen, Referenz vergleichen, messen, gleiche Länge in zwei Einheiten und erst anschließend Rechnen aufbauen.

### Körperansichten

- **Lernziel und Voraussetzungen:** Projektion eines festen Würfelgebäudes aus markierter Richtung verstehen. Rasterlesen und Richtungsbegriffe werden vorausgesetzt.
- **Einstieg, Wahrnehmen, Darstellung:** Gebäude und Richtungspfeile sind vollständig sichtbar. Die axonometrische Darstellung selbst wird nicht eingeführt; Kind muss sofort eine Projektion auswählen.
- **Progression und Belastung:** Vorderansicht, rechte Seite, Draufsicht sowie mehr Überdeckung ist schlüssig. Anzahl Würfel und neue Blickrichtung steigen teilweise gemeinsam.
- **Hilfen, Feedback, Remediation:** Reihenweises Betrachten ist passend. Konkrete Fehler „unverändertes Bild“ oder „falsche Seite“ werden nicht individuell adressiert.
- **Transfer und Empfehlung:** Erst einzelne markierte Würfel und Schatten/Abdruck beobachten, dann Schichten ausblenden und Projektion aufbauen; später gleiche Ansicht verschiedener Gebäude begründen.

### Würfelrotation

- **Lernziel und Voraussetzungen:** Erhaltung eines Gebäudes bei einer Vierteldrehung verstehen. Körperansichten werden mit fünf Versuchen und Lernwert 60 vorausgesetzt, nicht mit einer spezifischen Richtungsleistung.
- **Einstieg, Wahrnehmen, Darstellung:** Achse und Pfeil sind klar. Mentale Rotation, Links/Rechts und Perspektivdarstellung wirken gleichzeitig.
- **Progression und Belastung:** Rechtsdrehung ohne Stapel, dann beide Richtungen und Stapel, dann ähnliche Optionen ist plausibel, aber es fehlen Zwischenzustände und handelnde Vorstufen.
- **Hilfen, Feedback, Remediation:** Auffällige Ecke verfolgen ist eine gute Strategie. Die App kann nicht prüfen, welches erhaltene Merkmal das Kind genutzt hat.
- **Transfer und Empfehlung:** Erst Grundriss mit markierter Ecke drehen, dann Stapel ergänzen; Richtungswechsel separat sichern und Begründung über Würfelzahl/Nachbarschaft einfordern.

### Falten und Spiegeln

- **Lernziel und Voraussetzungen:** Eine Faltung als gerichtete Spiegelung und später Faltschnitt als Spiegelpaar verstehen. Symmetriephase 3 ist technisch vorausgesetzt.
- **Einstieg, Wahrnehmen, Darstellung:** Achse, bewegte Seite und Markierung sind sichtbar. Das Kind sieht keinen schrittweisen Faltvorgang, was den Denkanspruch erhält, aber Kinder ohne Falterfahrung wenig unterstützt.
- **Progression und Belastung:** Punktfaltung wird in zwei Stufen variiert. Stufe 3 führt mit Faltschnitt und zwei Papierlagen eine neue Idee direkt als Transfer ein; eine eigene Verständnis-/Übungsphase fehlt.
- **Hilfen, Feedback, Remediation:** Achsenabstand und bewegte Hälfte werden sinnvoll benannt. Ein kurzer kontrollierter Zwischenzustand als Hilfe wäre lernwirksamer als reine Erklärung.
- **Transfer und Empfehlung:** Faltschnitt als eigene Unterprogression behandeln: reale Handlung vorstellen, gefaltete Lage erkennen, Schnitt setzen, aufklappen, erst danach Ergebnis auswählen.

### Tabellen und Strichlisten

- **Lernziel und Voraussetzungen:** Daten Kategorien zuordnen, strukturiert zählen, vergleichen und ergänzen. Addieren/Subtrahieren und Fünferbündel werden vorausgesetzt.
- **Einstieg, Wahrnehmen, Darstellung:** Direktes Tabellenlesen ist ein angemessener Einstieg. Die Strichliste erscheint erst zusammen mit einer Differenzaufgabe.
- **Progression und Belastung:** Darstellungswechsel und neue Rechenanforderung werden auf Stufe 2 gekoppelt; Stufe 3 ergänzt aus einer Gesamtsumme.
- **Hilfen, Feedback, Remediation:** Zeilenfokus und Fünfergruppen sind sinnvoll. Falsche Zeile, größter Wert statt Differenz und Zählfehler erhalten dasselbe Feedback.
- **Transfer und Empfehlung:** Strichliste zunächst nur lesen/zu Tabelle zuordnen, danach vergleichen; Kategorien aktiv markieren und fehlende Werte mit Teil-Ganzes-Modell ergänzen.

### Bild- und Säulendiagramme

- **Lernziel und Voraussetzungen:** Daten aus Diagrammen lesen und Darstellungen desselben Datensatzes verbinden.
- **Einstieg, Wahrnehmen, Darstellung:** Bilddiagramm mit 1:1-Schlüssel ist verständlich. Säulendiagramme zeigen den Zahlenwert direkt über jeder Säule, besitzen aber keine sichtbare Achse oder Skala.
- **Progression und Belastung:** Bild lesen, Säulen vergleichen, Tabelle zu Diagramm zuordnen ist konzeptionell gut. Praktisch kann das Kind ab Stufe 2 nur gedruckte Zahlen vergleichen.
- **Hilfen, Feedback, Remediation:** Texte sprechen von Höhe, Skala und Nullpunkt, obwohl diese Darstellungselemente nicht vollständig sichtbar sind.
- **Transfer und Empfehlung:** Achse, Nullpunkt und gleichmäßige Teilstriche tatsächlich darstellen; Zahlenlabel schrittweise entfernen; Werte durch Ablesen, nicht durch Textvergleich bestimmen.

### Wahrscheinlichkeit

- **Lernziel und Voraussetzungen:** Sicher, möglich, unmöglich sowie relative Häufigkeit in gleich großen Ergebnisfeldern verstehen.
- **Einstieg, Wahrnehmen, Darstellung:** Alle Ergebnisse werden als gleichartige Liste gezeigt. Das ist zählbar, aber Beutel, Münze, Würfel und Drehscheibe unterscheiden sich visuell kaum als Zufallsgeräte.
- **Progression und Belastung:** Sichtbarer Beutel, bekannte Geräte, Ereignisvergleich ist sinnvoll. Vorhersage, tatsächlicher Versuch und Auswertung fehlen.
- **Hilfen, Feedback, Remediation:** „immer/manchmal/nie“ ist altersgerecht. Konkrete Verwechslung von möglich und sicher wird nicht anhand eines Gegenbeispiels bearbeitet.
- **Transfer und Empfehlung:** Ereignis vorhersagen, Versuch mehrfach simulieren, Ergebnisraum davon trennen und Begründung durch Markieren passender Felder aufbauen; keine Bruchrechnung nötig.

### Kombinatorik

- **Lernziel und Voraussetzungen:** Alle Paarungen zweier Auswahlmengen systematisch und ohne Doppelung finden.
- **Einstieg, Wahrnehmen, Darstellung:** Zwei Mengen und leeres Tableau sind sichtbar. Das `×` zwischen den Mengen und die Zahl leerer Zellen machen die Produktstruktur vorweg sichtbar.
- **Progression und Belastung:** `2×2`, `3×2`, `3×3` minus Ausnahme ist mathematisch sauber. Die Ausnahme kommt hinzu, bevor systematisches Auflisten tatsächlich verlangt wurde.
- **Hilfen, Feedback, Remediation:** Zeilenweises Vorgehen wird gut erklärt, aber vom Kind nicht ausgeführt oder gespeichert.
- **Transfer und Empfehlung:** Paarungen einzeln in das Tableau legen, vollständige Zeilen markieren, Doppelungen erkennen und erst aus dem Muster eine Multiplikationsbeziehung ableiten.

### Zeit

- **Lernziel und Voraussetzungen:** Analoge/digitale Uhrzeit verbinden und einfache Zeitspannen bestimmen; Fünferschritte werden vorausgesetzt.
- **Einstieg, Wahrnehmen, Darstellung:** Die Uhr ist klar und der Stundenzeiger bewegt sich passend mit. Volle und halbe Stunden erscheinen jedoch beide bereits auf Stufe 1.
- **Progression und Belastung:** Danach folgen sofort alle Fünfminutenpositionen; Viertelstunden besitzen keine eigene Brücke. Zeitspannen zeigen zusätzlich digitale Start-/Endwerte, sodass die analoge Darstellung umgangen werden kann.
- **Hilfen, Feedback, Remediation:** Zeigerrollen und Vorwärtsschritte werden passend benannt. Fehler „Zeiger vertauscht“ versus „Minutenzahl falsch“ bleiben ununterschieden.
- **Transfer und Empfehlung:** Volle Stunde beobachten, halbe Stunde mit Zeigerbewegung aufbauen, Viertelstunden, Fünferschritte und erst dann Zeitspannen; Zwischenzeit auf einer Zeitlinie markieren.

### Masse

- **Lernziel und Voraussetzungen:** Bezugsgrößen nutzen, Gramm/Kilogramm verbinden und bis 1000 ergänzen/rechnen.
- **Einstieg, Wahrnehmen, Darstellung:** Die Frage verwendet korrekt „ungefähr“, zeigt aber nur Gegenstandsnamen und `?`, keine Waage oder Vergleichsobjekte. Für einen Apfel wird genau ein Schätzwert als einzig akzeptierte Antwort hinterlegt, obwohl reale Werte streuen.
- **Progression und Belastung:** Schätzen, Ergänzen, Rechnen sind drei unterschiedliche Tätigkeiten. Die visuelle Waagenidee wird nur als Füllstrecke umgesetzt.
- **Hilfen, Feedback, Remediation:** Einheit und 1000er-Beziehung sind klar. Für falsche Größenordnung fehlt ein konkreter Vergleich.
- **Transfer und Empfehlung:** Immer „ungefähr“ formulieren, Referenzbereiche statt scheinexakter Werte nutzen, Gegenstände auf einer Balance vergleichen und Ergänzen visuell von Rechnen trennen.

### Rauminhalt

- **Lernziel und Voraussetzungen:** Milliliter/Liter als dieselbe Größe in verschiedenen Einheiten verstehen und Mengen ergänzen/rechnen.
- **Einstieg, Wahrnehmen, Darstellung:** Gegenstandsnamen wie Glas oder Flasche besitzen keine feste Größe; trotz Näherungsfrage akzeptiert die Runtime nur 250 ml beziehungsweise 1 l. Das konkrete Gefäß wird nicht gezeigt, sodass der Schätzwert nicht an einer sichtbaren Referenz geprüft werden kann.
- **Progression und Belastung:** Wie bei Masse werden Schätzen, Ergänzen und Rechnen ohne Messhandlung verbunden.
- **Hilfen, Feedback, Remediation:** 1000-ml-Beziehung ist passend. Füllstand und Skala sollten stärker als Messwerkzeug dienen.
- **Transfer und Empfehlung:** Standardisierte abgebildete Gefäße mit Skala, explizite Näherung, Umfüllen/Ergänzen und Vergleich zweier Füllstände vor symbolischen Rechnungen.

### Ebene Figuren

- **Lernziel und Voraussetzungen:** Figuren über Eigenschaften und Außenrand erkennen, zerlegen und zusammensetzen.
- **Einstieg, Wahrnehmen, Darstellung:** Einzelne große Grundform ist verständlich. Das Kind benennt sie sofort; Ecken, Seiten und Eigenschaften werden nicht beobachtet oder markiert.
- **Progression und Belastung:** Erkennen, Teile zählen, Außenform bestimmen ist sinnvoll, aber Stufe 2 prüft hauptsächlich Zählen sichtbarer Teilflächen.
- **Hilfen, Feedback, Remediation:** Außenrandfokus ist gut. Konkrete Eigenschaftsfehler oder Lageinvarianz werden nicht bearbeitet.
- **Transfer und Empfehlung:** Ecken/Seiten markieren, Figuren drehen, nach Eigenschaften sortieren, Teile verschieben und zusammensetzen; Formname erst nach Beobachtung sichern.

### Muster

- **Lernziel und Voraussetzungen:** Kleinsten Wiederholungsblock erkennen und fortsetzen.
- **Einstieg, Wahrnehmen, Darstellung:** Klarer Streifen und offenes nächstes Feld; geringe sprachliche Last.
- **Progression und Belastung:** AB, ABC, AAB erhöht Blocklänge/-struktur. Es bleiben ausschließlich periodische Symbolfolgen und genau ein nächstes Element.
- **Hilfen, Feedback, Remediation:** Blockstrategie ist angemessen. Falsches Fortsetzen wird nicht auf eine konkrete falsche Periode zurückgeführt.
- **Transfer und Empfehlung:** Blockgrenzen markieren, mehrere Felder fortsetzen, Fehler in einem Muster finden, Regel auswählen/ergänzen und später wachsende Muster separat einführen.

### Fläche

- **Lernziel und Voraussetzungen:** Flächeninhalt als lückenlose Bedeckung mit Einheitsquadraten verstehen; Zählen und Figurenkenntnis werden vorausgesetzt.
- **Einstieg, Wahrnehmen, Darstellung:** Gefüllte Felder sind eindeutig. Das Kind zählt direkt; Bedecken, Verschieben und Vergleichen werden nicht erlebt.
- **Progression und Belastung:** Kleines Rechteck, größeres Rechteck, unregelmäßige Figur ist nachvollziehbar. Stufe 2 fördert reihenweises Strukturieren nur im Hilfetext.
- **Hilfen, Feedback, Remediation:** Reihe für Reihe ist passend. Fehlstrategie `rows + columns` wird als Distraktor erkannt, aber nicht konkret zurückgemeldet.
- **Transfer und Empfehlung:** Reihen markieren, Rechteck in gleiche Streifen zerlegen, zwei Figuren mit gleicher Fläche vergleichen und Einheitsquadrate selbst ergänzen.

### Umfang

- **Lernziel und Voraussetzungen:** Umfang als geschlossenen äußeren Randweg verstehen und von Fläche unterscheiden.
- **Einstieg, Wahrnehmen, Darstellung:** Alle Außenkanten sind kontrastreich markiert; das unterstützt die Idee, kann aber das eigenständige Identifizieren des Randes ersetzen.
- **Progression und Belastung:** Kleines/großes Rechteck und unregelmäßige Figur steigern Wegkomplexität. Formeln werden sinnvoll vermieden.
- **Hilfen, Feedback, Remediation:** Start an einer Ecke und nur Außenkanten zählen ist konkret. Gewählte Innenkante versus ausgelassene Außenkante wird nicht unterschieden.
- **Transfer und Empfehlung:** Kind sollte Randweg antippen oder Kanten abschnittsweise markieren, offene Wege erkennen und Figuren gleicher Fläche mit verschiedenem Umfang vergleichen.

## Systemische Empfehlungen für die nächsten Entwicklungsphasen

1. **Lernphasen operationalisieren:** Für jede Kompetenz festlegen, was das Kind in `activate`, `understand`, `guided-practice`, `independent-practice`, `automate` und `transfer` tatsächlich tut. Reine Sichtbarkeitsänderung reicht nicht.
2. **Fehlvorstellungen zur Laufzeit nutzen:** Auswahlwert und `misconception` an Feedback/Remediation übergeben. Nach dem ersten Fehler eine passende Rückfrage oder Darstellung, nicht sofort eine Erklärung der Lösung.
3. **Darstellungen interaktiv machen:** Wenige wiederkehrende Handlungen genügen: markieren, ordnen, gruppieren, einen Sprung setzen, eine Kante verfolgen, ein Modell ergänzen.
4. **Transfer messbar machen:** Kurze strukturierte Begründungen, Strategieauswahl, Fehleranalyse oder Darstellungswechsel als echte Aufgaben, nicht nur als Katalogtext.
5. **Voraussetzungen fachlich prüfen:** Gating nicht nur anhand globaler Versuche/Mastery, sondern anhand der tatsächlich benötigten Unterkompetenz und Darstellungsleistung.
6. **Progression objektiv auditieren:** Jede Stufe muss eine neue mathematische Idee, geringere Hilfe oder höhere Selbstständigkeit enthalten. Nullmuster, größere Zahlen oder mehr Symbole allein sind keine verlässliche Steigerung.
7. **Einzelkompetenz vor Mischrunde absichern:** Sachaufgaben, Symmetrie und andere verpflichtende Rundenbestandteile benötigen einen zugänglichen Grundlagenmodus, wenn Voraussetzungen noch nicht nachgewiesen sind.

## Empfohlene Umsetzungsreihenfolge nach diesem Audit

1. Systemische Feedback- und Lernphasenlogik konzipieren, ohne weitere Kompetenzen hinzuzufügen.
2. Addition/Subtraktion bis 20 sowie Stellenwert/Zerlegen/Zusammensetzen als Förderfundament neu aufbauen.
3. Nachbarzahlen, Addition/Subtraktion bis 1000, Längen und Säulendiagramme hinsichtlich unvollständiger Darstellungen korrigieren.
4. Multiplikation/Division um aktive Grundvorstellungen und Strategien erweitern.
5. Schriftliche Verfahren an Materialhandlung und tatsächlich geprüfte Voraussetzungen binden.
6. Sachaufgaben, Kombinatorik, Größen und Raumvorstellung von Auswahl zu angeleiteter Konstruktion weiterentwickeln.
7. Erst danach Transferhandlungen und curriculare Mischaufgaben neu kalibrieren.

## Offene menschliche Prüfung

Eine Lehrkraft sollte insbesondere Unterrichtssprache, verwendete Verfahren bei schriftlicher Subtraktion, Reihenfolge der Einmaleinsstrategien, Geld-/Größenreferenzen, Verständlichkeit der räumlichen Diagramme und Belastung der Sachaufgabensequenz prüfen. Ein echter iPhone-Test bleibt für Lesbarkeit und Wahrnehmung erforderlich. Diese Prüfungen sind in diesem Audit nicht erfolgt.
