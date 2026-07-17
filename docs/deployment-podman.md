# Deployment mit GHCR und Podman Compose

Mathe-Reise ist eine vollständig statische PWA. Das Container-Image enthält nur `nginx-unprivileged`, läuft als UID 101 auf Port 8080 und benötigt weder Backend noch Datenbank. Profile, Lernstände und abgeschlossene Runden bleiben ausschließlich im IndexedDB-Speicher des jeweiligen Browsers oder Geräts. Auf dem Server werden keine personenbezogenen Daten gespeichert und es werden keine Volumes benötigt.

## Image und Tags

Der Workflow `.github/workflows/publish-container.yml` veröffentlicht nach:

```text
ghcr.io/hackepeter87/nachhilfe
```

Ein Git-Tag wie v0.13.1 erzeugt die Image-Tags 0.13.1, sha-<kurzsha> und latest. Eine manuelle Ausführung über workflow_dispatch erzeugt nur das nachvollziehbare SHA-Tag. Normale Pushes auf main veröffentlichen kein Image.

Der Workflow setzt die OCI-Labels für Quelle, Revision, Version, Erstellungszeit, Lizenz, Titel und Beschreibung. Die dynamischen Werte kommen aus Git-Referenz und Build-Metadaten; im Dockerfile ist deshalb keine konkrete App-Version doppelt hinterlegt.

Release-Images werden ausschließlich für die DMZ-Zielarchitektur `linux/amd64` gebaut. Die Compose-Datei deklariert diese Plattform ausdrücklich, damit eine unpassende Hostarchitektur nicht stillschweigend über Emulation betrieben wird. Historische Tags behalten ihre bereits veröffentlichten Manifeste; erst Releases ab `0.10.1` sind AMD64-only.

## Voraussetzungen auf dem DMZ-Host

- Linux-Host mit Architektur `x86_64` beziehungsweise `linux/amd64`, Podman und einem Compose-Provider
- ein eigener unprivilegierter Betriebsbenutzer
- ausgehender HTTPS-Zugriff auf `ghcr.io`
- Reverse Proxy mit öffentlichem DNS-Namen und TLS-Zertifikat
- lokal freier TCP-Port `127.0.0.1:8080`

`podman compose` ist ein Wrapper um einen installierten Compose-Provider. Vor dem Deployment müssen beide Befehle funktionieren:

```bash
podman --version
podman compose version
uname -m
```

Siehe auch die [offizielle Podman-Compose-Dokumentation](https://docs.podman.io/en/latest/markdown/podman-compose.1.html).

## GHCR-Paket sichtbar machen

Das erste erfolgreiche Publish legt das Paket in GitHub Container Registry an. Für einen öffentlichen DMZ-Pull muss in den GitHub-Paketeinstellungen die Sichtbarkeit auf **Public** gesetzt sein. Diese Einstellung wird nicht durch den Workflow erzwungen. Das Paket `hackepeter87/nachhilfe` wurde als **Public** zurückgelesen.

Ein öffentliches Paket kann ohne Anmeldung geladen werden:

```bash
podman pull ghcr.io/hackepeter87/nachhilfe:0.13.1
```

Solange das Paket privat ist, erfolgt die Anmeldung mit einem technisch geeigneten GitHub-Token mit `read:packages`. Tokens gehören weder in die Compose-Datei noch in das Repository:

```bash
podman login ghcr.io
```

## Compose-Deployment

Die Datei `deploy/compose.yaml` verwendet absichtlich ein konkretes Versionstag und bindet Nginx nur an die Loopback-Adresse des Hosts:

```bash
podman compose -f deploy/compose.yaml pull
podman compose -f deploy/compose.yaml up -d
podman compose -f deploy/compose.yaml ps
```

Der Container verwendet:

- `read_only: true`
- `platform: linux/amd64` passend zum DMZ-Host
- ausschließlich `/tmp` als 16-MiB-tmpfs mit `noexec` und `nosuid`
- keine Linux-Capabilities
- `no-new-privileges`
- den Image-Benutzer UID 101
- einen HTTP-Healthcheck auf `/healthz`
- `restart: unless-stopped`

Nginx benötigt in diesem Image nur `/tmp` als Schreibbereich. Zusätzliche tmpfs-Mounts für `/var/cache/nginx` oder `/var/run` und persistente Volumes sind nicht erforderlich.

`unless-stopped` startet den Container nach einem Prozessfehler erneut. Für einen Neustart nach einem Host-Reboot muss der DMZ-Host außerdem den von der Distribution bereitgestellten `podman-restart.service` für den Betriebsmodus aktivieren oder den Compose-Stack anderweitig durch systemd starten. Bei rootless Betrieb muss die Benutzersitzung gegebenenfalls per `loginctl enable-linger <benutzer>` fortbestehen. Die konkrete systemd-Einbindung hängt von der Host-Vorgabe ab und ist nicht Bestandteil dieses Repositories.

## Betrieb

Healthcheck und HTTP-Antwort prüfen:

```bash
podman compose -f deploy/compose.yaml ps
podman healthcheck run "$(podman compose -f deploy/compose.yaml ps -q mathe-reise)"
curl --fail http://127.0.0.1:8080/healthz
curl --fail http://127.0.0.1:8080/
```

Der konkrete Containername hängt vom installierten Compose-Provider und Projektnamen ab. Er wird zuverlässig mit `podman compose -f deploy/compose.yaml ps` ermittelt.

Logs und Stop:

```bash
podman compose -f deploy/compose.yaml logs --tail=200
podman compose -f deploy/compose.yaml down
```

`down` löscht keine Lernstände, weil diese auf den Endgeräten und nicht im Container liegen.

## Update und Rollback

Für ein Update wird in `deploy/compose.yaml` ein geprüftes, konkretes Versionstag eingetragen. Danach:

```bash
podman compose -f deploy/compose.yaml pull
podman compose -f deploy/compose.yaml up -d
podman compose -f deploy/compose.yaml ps
curl --fail http://127.0.0.1:8080/healthz
```

Für einen Rollback wird das vorherige Versionstag wieder eingetragen und derselbe Ablauf ausgeführt. Images sollten nicht ausschließlich über `latest` betrieben werden. Ein Container-Rollback löscht keine Browserdaten. Bei zukünftigen inkompatiblen IndexedDB-Änderungen muss vor dem Release weiterhin ein eigener Kompatibilitätsplan vorliegen.

## Reverse Proxy und HTTPS

Der Reverse Proxy leitet ausschließlich an `http://127.0.0.1:8080` weiter. WebSockets oder Sticky Sessions sind nicht erforderlich. Beispiel für Nginx auf dem Host:

```nginx
location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

Die öffentliche Origin muss HTTPS verwenden; andernfalls stehen Service Worker und PWA-Installation außerhalb von `localhost` nicht zuverlässig zur Verfügung. TLS, HSTS, Zugriffsschutz und externe Rate-Limits gehören auf den Reverse Proxy.

Der Proxy oder ein vorgeschaltetes CDN darf die Cache-Regeln des Containers nicht überschreiben:

- `/sw.js`: `no-cache, no-store, must-revalidate`
- `/manifest.webmanifest`, `/index.html`, `/content/task-catalog.json`: revalidieren
- hash-basierte Dateien unter `/assets/`: langfristig `immutable`

Nach einem Release lädt der neue Service Worker Ressourcen im Hintergrund. Eine laufende Mathe-Runde behält ihren Katalog-Snapshot; aktiviert wird die neue Version kontrolliert auf der Startseite oder beim nächsten Neustart.

## iOS-Installation

1. Die öffentliche HTTPS-Adresse in Safari öffnen.
2. **Teilen** und anschließend **Zum Home-Bildschirm** wählen.
3. Die installierte App einmal online öffnen und auf **Offline bereit** warten.
4. Erst danach den Offline-Neustart prüfen.

Ein echter iPhone-Test bleibt eine manuelle Release-Abnahme, solange er nicht auf einem Gerät durchgeführt wurde.

## Read-only-Prüfung ohne Compose

Die Compose-Härtung kann mit Docker oder Podman direkt nachvollzogen werden:

```bash
docker run --rm -d --name mathe-reise-readonly \
  --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,size=16m \
  --cap-drop ALL \
  --security-opt no-new-privileges:true \
  -p 127.0.0.1:8080:8080 \
  mathe-reise:local
```

Ohne `/tmp`-tmpfs kann Nginx seine temporären Request-Verzeichnisse nicht anlegen. Weitere Schreibpfade wurden für diesen statischen Betrieb nicht benötigt.

## Container-Releaseprozess

1. App-Version in `package.json` erhöhen.
2. `catalogVersion` nur bei einer fachlichen Katalogänderung erhöhen und `npm run catalog:build` ausführen.
3. Katalogprüfung, Typecheck, Lint, Tests, Build, E2E und Containerprüfung ausführen.
4. Pull Request mergen und grünes GitHub Actions CI abwarten.
5. Den gemergten Commit mit `vX.Y.Z` taggen und das Tag pushen.
6. Der Publish-Workflow erzeugt SemVer-, SHA- und `latest`-Tags in GHCR.
7. Auf dem DMZ-Host das konkrete SemVer-Tag eintragen, ziehen und den Healthcheck prüfen.

Der Workflow erstellt kein GitHub Release. Falls zusätzlich ein Release gewünscht ist, wird es separat und erst nach erfolgreichem Publish angelegt.
