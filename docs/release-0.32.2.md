# Darstellungs- und Verständlichkeitskorrekturen 0.32.2

Stand: App 0.32.2, Katalog 0.31.1, Schema 19, Status `ready-for-review`.

## Behobene Befunde

- **Aufgabenfamilien:** Zehnerfelder unterstützen einzelne Mengen bis 20. Eine Zerlegung wie 20 in 8 und 12 wird vollständig und ohne Laufzeitfehler dargestellt.
- **Division:** Probe und zweite Geteiltaufgabe besitzen eigene Darstellungen. Die zweite Aufgabe wechselt die Handlung sichtbar zwischen Gruppieren und Verteilen.
- **Nachbarzahlen:** Technische Skalenenden gelten nicht länger als bekannte mathematische Werte. Grenzen starten maskiert, werden schrittweise aufgedeckt und nicht doppelt beschriftet.
- **Zufall:** Der Einstieg beschreibt zuerst den konkreten Versuch. Das Kind entscheidet, ob das genannte Ereignis sicher, möglich oder unmöglich ist.
- **Muster:** Zwei vollständige Musterblöcke bleiben in einer Reihe. Die Frage benennt die beobachtbare Handlung; Zahlenfolgen werden als Zahlen gerendert.
- **Bezugsgrößen:** Teelöffel, Trinkglas, Trinkpäckchen sowie Massebeispiele erhalten konkrete Objektbilder. Eine Umrechnung erscheint nur noch in Lernschritten, in denen sie benötigt wird.

## Katalog

Katalog 0.31.1 enthält die korrigierten kindseitigen Texte für Wahrscheinlichkeit, Muster und Rauminhalt. Das technische Schema bleibt 19. Quelle, öffentliches Artefakt, eingebetteter Fallback und Curriculum-Matrix werden weiterhin aus derselben Quelle erzeugt und geprüft.

## Prüfung

- `npm run catalog:check`
- `npm run curriculum:check`
- `npm run typecheck`
- `npm run lint`
- `npm test`: 485 Tests bestanden
- `npm run build`
- `npm run test:e2e`: 20 Szenarien bestanden
- `E2E_BASE_URL=http://127.0.0.1:8097 npm run test:e2e:container`: 20 Szenarien bestanden
- AMD64-Image `mathe-reise:0.32.2-local` und `mathe-reise:local`: `sha256:dca7a372954953421c6e7c3bb93d1eea6c044f0778f5dc625501e360876d4968`
- Laufzeit: UID `101:101`, Read-only-Rootfs, keine Capabilities, `no-new-privileges`, ausschließlich `/tmp` als tmpfs, Healthcheck `healthy`
- HTTP: Einstieg, Manifest, Service Worker, Katalog und `/healthz` erfolgreich; MIME- und Revalidierungsregeln korrekt

Die Ausgangsbefunde stammen von einem echten iPhone. Die korrigierte Fassung wurde automatisiert in Chromium bei 375 × 812 und 812 × 375 sowie in WebKit geprüft, aber noch nicht erneut vollständig auf einem echten iPhone abgenommen. Eine pädagogische Wirksamkeit oder Lehrkraftfreigabe wird nicht behauptet.
