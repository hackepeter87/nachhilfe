# Renovate-Betrieb

Renovate erkennt Updates für npm und das Lockfile, `.nvmrc`, Dockerfile,
Compose sowie GitHub Actions. Es erstellt ausschließlich Pull Requests und
besitzt keine Berechtigung, Branch-Schutz, CI, Releases oder Deployments zu
umgehen. Auto-Merge ist deaktiviert.

## Aktivierung

1. Die Mend-Renovate-GitHub-App nur für `hackepeter87/nachhilfe` installieren.
2. Den ersten Onboarding- oder Reconfigure-PR prüfen und alle vier CI-Jobs
   abwarten: `security`, `quality`, `e2e` und `container`.
3. Das Dependency Dashboard kontrollieren. Major-Updates werden erst nach der
   dortigen Freigabe als PR erstellt.

Die Konfiguration wird vor Änderungen mit der zum Einsatz kommenden
Renovate-Version geprüft:

```bash
npx --yes --package renovate@44.192.2 \
  renovate-config-validator --strict renovate.json
```

Ein lokaler read-only Lauf darf keine Branches oder Pull Requests erzeugen:

```bash
RENOVATE_PLATFORM=local RENOVATE_DRY_RUN=full \
RENOVATE_ONBOARDING=false RENOVATE_REQUIRE_CONFIG=required \
  npx --yes --package renovate@44.192.2 renovate
```

Der Referenzlauf erkennt sechs Dateien mit insgesamt 56 Referenzen: npm (24),
`.nvmrc` (1), Dockerfile (2), Compose (1) und GitHub Actions (28). Für die
Online-Auflösung von GitHub-Quellen benötigt ein nicht-lokaler Lauf zusätzlich
ein GitHub-Token.

Für einen privaten Lauf ist ein kurzlebiges Token ausschließlich über die
Umgebung bereitzustellen. Tokens werden weder in Dateien noch in Logs oder
Pull Requests abgelegt.

## Update-Regeln

- Reguläre Updates laufen montags vor 06:00 Uhr in `Europe/Berlin` und müssen
  mindestens drei Tage veröffentlicht sein.
- Sicherheitsupdates sind jederzeit zulässig und erhalten erhöhte Priorität.
- Patch- und Minor-Updates werden nach Runtime, Build/Lint, Tests, Actions und
  Container-Basisimages gruppiert. Major-Updates bleiben einzeln.
- Node und `@types/node` bleiben auf Major 24; TypeScript bleibt unter Major 7.
- Das eigene Image in `deploy/compose.yaml` ist ausgeschlossen. Versionierte
  App-Images entstehen ausschließlich durch den manuellen Releaseprozess.
- Installationsskripte sind für Renovate deaktiviert. Lockfile-Updates werden
  wöchentlich reproduzierbar neu aufgelöst.

## Freigabe und Störungen

Jeder Renovate-PR durchläuft die vorhandene CI. Fehlgeschlagene oder fehlende
Checks blockieren den Merge. Release-Tags, GHCR-Publish und Deployments werden
nicht durch Renovate ausgelöst.

Zur vorübergehenden Deaktivierung die GitHub-App für dieses Repository
pausieren oder den Repositoryzugriff entziehen; `renovate.json` bleibt dabei
als nachvollziehbare Konfiguration erhalten. Vor einer erneuten Aktivierung
die Konfiguration wieder strikt validieren. Dependabot-Alerts und
Secret-Scanning bleiben unabhängig von Renovate aktiviert.
