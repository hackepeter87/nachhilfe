# Software-Aktualisierung: Mathe-Reise

Prüfstand: 04.09.2026. Ursprünglicher Planungsstand; die anschließend beauftragte
Umsetzung und ihre Abnahme stehen im [Wartungsbericht](../docs/software-maintenance-2026-09-04.md).
Die folgenden Versionsziele und Grenzen dokumentieren die ursprüngliche Prüfung.
Aufgaben werden in GitHub Issues geführt, nicht in einer zweiten lokalen Todo-Liste.

## Ausgangslage und Evidenz

- Lokale Basis: main, App 0.32.6, Commit 3a84610; ein Commit vor dem lokal
  bekannten origin/main. Kein Fetch durchgeführt. Arbeitsbaum zu Beginn sauber.
- GitHub Latest Release: v0.32.6, veröffentlicht am 05.08.2026.
- npm outdated wurde erfolgreich gegen die Registry ausgeführt; installierte
  direkte Versionen entsprechen dem Lockfile. 17 von 22 direkten Paketen haben
  neuere Latest-Versionen. Das allein ist kein Sicherheitsbefund.
- npm audit scheiterte zweimal am Timeout des Advisory-Endpunkts. Ein sauberer
  Auditstatus wird nicht behauptet.
- GitHub Dependabot: zwölf offene Meldungen, davon sieben high und fünf medium,
  verteilt auf fast-uri, undici und postcss. Alle sind als development eingeordnet.
  Geschlossene/auto-dismissed Meldungen wurden nicht als offen gezählt.
- Das Runtime-Image liefert statische Dateien aus. Die gemeldeten Entwicklungs-
  Pakete sind nicht als Node-Server im Container aktiv. Dies belegt weder
  Ausnutzbarkeit im Produkt noch generelle Unbedenklichkeit der Buildkette.

## Priorität 1: Sicherheitspatches

| Paket | Lockfile | Kompatibles Ziel | Befund |
| --- | --- | --- | --- |
| fast-uri | 3.1.3 | 3.1.7 | Sechs offene Alarme; neuere Fixes benötigen mindestens 3.1.6, nicht nur 3.1.4 |
| undici | 7.28.0 | 7.29.0 | Fünf offene Alarme; transitiv über jsdom 29.1.1 |
| postcss | 8.5.19 | 8.5.28 | Ein offener Alarm; mindestens 8.5.23, transitiv über Vite |

fast-uri stammt aus vite-plugin-pwa -> workbox-build -> ajv. Zuerst reguläre
transitive Lockfile-Aktualisierung innerhalb erlaubter Bereiche; danach npm ls
und Lockfile auf sämtliche Vorkommen prüfen. Keine neue direkte Abhängigkeit nur
zur Übersteuerung, kein audit fix --force. Overrides nur bei nachgewiesener
Notwendigkeit mit dokumentiertem Entfernen-Kriterium.

Abnahme: keine verwundbare Version der genannten Pakete im aufgelösten Baum,
vollständige Tests und PWA-Build; nach Merge alle zwölf Alarme erneut lesen.
Bei erneutem Audit-Ausfall verbleibt dieser explizit dokumentierte Prüfrest.

## Priorität 2: Kompatible Wartungsupdates

Die Ziele sind am Prüftag verifiziert und vor Umsetzung erneut zu prüfen.
Caret-Bereiche plus Lockfile beibehalten, keine unnötigen Patch-Pins.

| Paket | Aktuell | Ziel |
| --- | --- | --- |
| react / react-dom | 19.2.7 | 19.2.8, gemeinsam |
| lucide-react | 1.24.0 | 1.40.0 |
| vite | 8.1.5 | 8.2.2 |
| @vitejs/plugin-react | 6.0.3 | 6.1.1 |
| @playwright/test | 1.61.1 | 1.62.1 samt passender Chromium-/WebKit-Binaries |
| vitest | 4.1.10 | 4.1.11, noch nicht 5 |
| @testing-library/react | 16.3.2 | 16.3.3 |
| @testing-library/user-event | 14.6.1 | 14.6.7 |
| @types/react | 19.2.17 | 19.2.18 |
| @types/react-dom | 19.2.3 | 19.2.7 |
| eslint | 10.7.0 | 10.9.1 |
| eslint-plugin-react-refresh | 0.5.3 | 0.5.6 |
| typescript-eslint | 8.64.0 | 8.69.0 |
| @types/node | 26.1.1 | 24.13.3, passend zur Build-/CI-Runtime |

Bereits auf Latest laut Registry-Abgleich: @eslint/js 10.0.1,
eslint-plugin-react-hooks 7.1.1, fake-indexeddb 6.2.5, jsdom 29.1.1 und
vite-plugin-pwa 1.3.0. Aktuelle direkte Pakete können trotzdem ältere transitive
Pakete im Lockfile besitzen, wie jsdom/undici und PWA/fast-uri zeigen.

### Node und Container

- Node 24 bleibt LTS-Basis in .nvmrc, CI und Dockerfile; engines >=24 kann bleiben.
  Lokal ist 24.14.0 aktiv, die offizielle aktuelle LTS-Version ist 24.20.0.
  Lokale Entwicklungsumgebung aktualisieren, ohne global andere Projekte umzustellen.
- @types/node 26 nicht bloß weiter aktualisieren: Node-26-APIs könnten sonst trotz
  Node-24-Runtime typseitig erlaubt werden. An 24 ausrichten und Typprüfung ausführen.
- Lokales node:24-alpine stammt aus Juni, nginx stable-alpine aus Juli.
  mathe-reise:local wurde am 05.08. gebaut und enthält NGINX 1.30.4/NJS 1.0.0.
  Der Stable-Image-Tag wurde am 02.09. aktualisiert; aktuelle upstream Dockerfile-
  Quelle nutzt weiterhin nginx 1.30.4, aber NJS 1.0.1. Gleiche nginx-Version
  bedeutet nicht gleiche oder aktuelle Betriebssystempakete.
- Images beim Wartungsbuild frisch auflösen (--pull bzw. pull: true in Buildx),
  Basisdigests und OS-Paketstand dokumentieren. Kein automatischer Mainline-Wechsel.
  Optional Stable-Tag plus Digest für reproduzierbare Releases verwenden; bei
  Digest-Pinning muss der automatische Updateweg mit eingerichtet werden.
- Das DMZ-Image selbst und seine installierten OS-Pakete wurden nicht gescannt.
  Vor Freigabe Container-Schwachstellenscan (etwa Trivy oder Docker Scout) ausführen;
  Funde bewerten, keine Sicherheit nur aus Versionsnummern ableiten.
- AMD64, UID 101, Port 8080, Read-only-Rootfs, /tmp-tmpfs, keine Node-Runtime und
  keine Datenvolumes bleiben unverändert.

### GitHub Actions und laufende Pflege

checkout@v6 -> v7.0.1 und setup-node@v6 -> v7.0.0 separat prüfen.
Release-/Migrationshinweise und Runner-Anforderungen beachten; App-Node bleibt 24.
Docker-Actions verwenden bereits aktuelle Majorlinien: setup-buildx@v4
(Latest 4.3.0), login@v4 (4.6.0), metadata@v6 (6.2.0), build-push@v7 (7.3.0).
Floating Major-Tags erlauben neuere Patches, belegen aber keine konkrete gelaufene
Revision. Bei SHA-Pinning automatisierte Update-PRs sicherstellen.

Kleine Dependabot-Konfiguration für npm, Docker und Actions vorsehen: wöchentliche
Wartungs-PRs, kompatible npm-Patches gruppieren, Majors getrennt, kein Auto-Merge.
Keine neue Plattform. Publish-Workflow vor Release gegen grüne CI absichern:
Der vorhandene Tag-/Dispatch-Workflow hat keine technische Abhängigkeit zum CI-Job.
Der Container-CI-Job prüft HTTP, führt aber noch keine Container-E2E aus; diese
Abnahme für das Wartungsrelease ausdrücklich ergänzen oder dokumentiert ausführen.

## Priorität 3: Major-Wechsel getrennt bewerten

- TypeScript 6.0.3 -> 7.0.2 vorerst NICHT: typescript-eslint 8.69.0 verlangt
  >=4.8.4 <6.1.0. Erst bei offiziell kompatiblem Linter; keine force-Installation.
- Vitest 5.0.0 ist verfügbar und unterstützt Node 24/Vite 8 laut Peer-Vertrag.
  Trotzdem separate Migration mit Release-Notes-Prüfung, nicht mit Sicherheitspatches
  vermischen. Keine Tests abschwächen.
- jest-dom 6.9.1 -> 7.0.1 separat auf geänderte Matcher und Integrationen prüfen.
- Keine Verpflichtung, Majors nur wegen einer höheren Zahl sofort einzusetzen.

## Arbeitsreihenfolge und Issues

1. [#143](https://github.com/hackepeter87/nachhilfe/issues/143): fast-uri-Patchziel
   auf aktuellen Stand gebracht. Kleiner Lockfile-Fix, npm ls und PWA-Tests.
2. [#149](https://github.com/hackepeter87/nachhilfe/issues/149): zunächst undici und
   postcss schließen. Checkpoint: Sicherheitsstand und Tests. Anschließend getrennte
   Commits für Runtime/Build, Test-/Lintwerkzeuge sowie Container/Actions/Wartungsbot.
   Jeder Teil bleibt baubar. Hauptdateien: package.json, package-lock.json,
   Dockerfile, Workflows, neue Dependabot-Konfiguration und Wartungsdokumentation.
3. [#150](https://github.com/hackepeter87/nachhilfe/issues/150): optionale Majors nach
   dem Wartungsrelease; TypeScript-Kompatibilität ist eigenes Go/No-Go-Kriterium.

## Verbindliche Abnahme und Release

- Baseline vor Update prüfen; bestehender lokaler Commit 3a84610 bleibt erhalten
  und wird nicht stillschweigend mit einem reinen Dependency-Release vermischt.
- npm ci; npm run catalog:check; npm run curriculum:check; npm run typecheck;
  npm run lint; npm test; npm run build; npm run test:e2e.
- Gehärteter AMD64-Containerbuild mit frisch aufgelösten Basen; Healthcheck, UID,
  HTTP/MIME/Cache-Header für Einstieg, Manifest, SW und Katalog, Container-Scan.
- npm run test:e2e:container; Offline-Start, ganze Runde, Reload, IndexedDB-Persistenz
  und Service-Worker-Update testen. Screenshots 375x812 und 812x375 prüfen.
- npm ls, Peer-Abhängigkeiten und neue Audit-/Dependabot-Abfrage nach Update.
- Patchrelease (voraussichtlich 0.32.7, beim Release Remote-Stand erneut prüfen),
  Paketversion/Lockfile, README, Release Notes und Compose konsistent aktualisieren.
  Keine Katalogversionserhöhung allein für Softwareupdates; der bereits lokal
  vorbereitete Katalog 0.31.4 ist eine separate Inhaltsänderung.
- Erst grüne CI, dann versioniertes Tag; GHCR ausschließlich über GitHub Actions,
  linux/amd64. Kein automatisches DMZ-Deployment.
- Rollback auf vorheriges konkretes Image-Tag/Digest, ohne lokale Browserdaten zu
  löschen. Echter iPhone-Test und Lehrkraftprüfung werden nicht behauptet.

## Grenzen dieser Prüfung

Keine neuen Builds oder Tests in diesem Planungsdurchlauf, keine Paketänderungen,
kein neuer Containerstart. Keine vollständige Quellcode-Sicherheitsanalyse oder
OS-CVE-Abnahme. Docker Desktop ist vorhanden und sein Imagebestand wurde gelesen.
Die genannten Versionsziele sind eine Momentaufnahme, keine dauerhafte Garantie.

## Quellen

- Offizielle npm-Registry: npm outdated sowie npm view für Versionen und Peer-Verträge.
- [Node Releaseübersicht](https://nodejs.org/en/about/previous-releases)
- [Dependabot-Alarme des Repositories](https://github.com/hackepeter87/nachhilfe/security/dependabot)
- [checkout Releases](https://github.com/actions/checkout/releases)
- [setup-node Releases](https://github.com/actions/setup-node/releases)
- [nginx Stable Dockerfile](https://github.com/nginx/docker-nginx-unprivileged/blob/main/stable/alpine/Dockerfile)
- [Docker-Hub Stable-Tag-Metadaten](https://hub.docker.com/v2/repositories/nginxinc/nginx-unprivileged/tags/stable-alpine)
