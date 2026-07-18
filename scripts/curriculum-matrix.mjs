import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { catalogPaths, parseAndValidateCatalog } from './catalog-lib.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const curriculumMatrixPath = path.join(root, 'docs/curriculum-matrix.md')
const appVersion = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version

const SPECIALIZED_TESTS = {
  'body-views': 'src/domain/cubeViews.test.ts',
  'cube-rotation': 'src/domain/cubeViews.test.ts',
  folding: 'src/domain/folding.test.ts',
  'read-tables': 'src/domain/dataDisplays.test.ts',
  'read-charts': 'src/domain/dataDisplays.test.ts',
  probability: 'src/domain/chance.test.ts',
  combinatorics: 'src/domain/chance.test.ts',
  time: 'src/domain/measurements.test.ts',
  mass: 'src/domain/measurements.test.ts',
  capacity: 'src/domain/measurements.test.ts',
  'plane-shapes': 'src/domain/planeGeometry.test.ts',
  patterns: 'src/domain/planeGeometry.test.ts',
  area: 'src/domain/planeGeometry.test.ts',
  perimeter: 'src/domain/planeGeometry.test.ts'
}

function cell(value) {
  return String(value).replaceAll('|', '\\|').replaceAll('\n', ' ').trim()
}

function testsFor(skill) {
  const tests = ['scripts/catalog.test.mjs', 'src/domain/generators.test.ts']
  if (skill.representations.length > 0) tests.push('src/domain/representationRoles.test.ts')
  const specialized = SPECIALIZED_TESTS[skill.id]
  if (specialized) tests.push(specialized)
  return [...new Set(tests)].map((test) => `\`${test}\``).join('; ')
}

export function renderCurriculumMatrix(catalog) {
  const activeSkills = catalog.skills.filter((skill) => skill.releaseStatus === 'active')
  const lines = [
    '# Curriculum-Matrix',
    '',
    '> Automatisch aus `content/catalogs/nrw-klasse3-foerderkern/catalog.json` erzeugt. Nicht manuell bearbeiten; `npm run curriculum:build` verwenden.',
    '',
    `- App-Release: ${appVersion}`,
    `- Katalog: ${catalog.catalogId} ${catalog.catalogVersion}`,
    `- Schema: ${catalog.schemaVersion}`,
    `- Katalogstatus: ${catalog.status}`,
    `- Aktive Kompetenzen: ${activeSkills.length}`,
    '',
    '| ID | Standard | Kompetenz und Bereich | Förderziel | Sechs Lernhandlungen | Drei Stufen | Darstellungen | Typische Fehlvorstellungen | Remediation | Automatisierte Abdeckung |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |'
  ]

  for (const skill of activeSkills) {
    const stages = skill.difficultyLevels
      .map((level) => `Stufe ${level.level}: ${level.description} [${level.representation}]`)
      .join('; ')
    const representations = skill.representations.length > 0 ? skill.representations.join('; ') : 'keine verpflichtende Darstellung'
    const phases = skill.learningPhases
      .map((phase) => `${phase.id}: ${phase.exerciseTypes.join(', ')}`)
      .join('; ')
    lines.push(`| \`${skill.id}\` | **0.21** | **${cell(skill.label)}**<br>${cell(skill.curriculumArea)} | ${cell(skill.supportGoal)} | ${cell(phases)} | ${cell(stages)} | ${cell(representations)} | ${cell(skill.misconceptions.join('; '))} | ${cell(`${skill.remediation.strategy} Darstellung: ${skill.remediation.representation}.`)} | ${testsFor(skill)}; \`src/domain/curricularConvergence.test.ts\` |`)
  }

  lines.push(
    '',
    '## Verbindliche Integrationsregeln',
    '',
    '- Jede aktive Kompetenz erfüllt den Qualitätsstandard 0.21 und besitzt sechs fachlich verschiedene, katalogsynchrone Runtime-Typen.',
    '- Generator, Katalog und Runtime verwenden dieselben Lernphasen, drei Stufen und Darstellungsarten.',
    '- Bekannte, unbekannte und aufgedeckte Werte werden für jede Darstellung explizit getrennt.',
    '- Eine Runde enthält zwei adaptive Grundaufgaben sowie je einen Fokus aus Zahlen, Größen, Daten und Geometrie; Sachaufgabe und Symmetrie schließen die Runde ab.',
    '- `ready-for-review` bezeichnet die ausstehende externe Gesamtbewertung und blockiert keine intern vollständig geprüfte aktive Kompetenz.',
    '- Ein echter iPhone-Test und eine Lehrkraftprüfung werden nur nach tatsächlicher Durchführung als bestanden dokumentiert.',
    ''
  )
  return `${lines.join('\n')}\n`
}

function loadCatalog() {
  return parseAndValidateCatalog(fs.readFileSync(catalogPaths.source, 'utf8'))
}

export function buildCurriculumMatrix(outputPath = curriculumMatrixPath) {
  const output = renderCurriculumMatrix(loadCatalog())
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, output)
  return output
}

export function checkCurriculumMatrix(outputPath = curriculumMatrixPath) {
  const expected = renderCurriculumMatrix(loadCatalog())
  if (!fs.existsSync(outputPath) || fs.readFileSync(outputPath, 'utf8') !== expected) {
    throw new Error('Curriculum-Matrix weicht vom Katalog ab; npm run curriculum:build ausführen')
  }
  return true
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const command = process.argv[2]
  if (command === 'build') {
    buildCurriculumMatrix()
    console.log('Curriculum-Matrix wurde aus dem Katalog erzeugt.')
  } else if (command === 'check') {
    checkCurriculumMatrix()
    console.log('Curriculum-Matrix entspricht dem Katalog.')
  } else {
    console.error('Aufruf: node scripts/curriculum-matrix.mjs <build|check>')
    process.exitCode = 1
  }
}
