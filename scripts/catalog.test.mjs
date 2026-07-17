import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { buildCatalogArtifacts, catalogPaths, checkCatalogArtifacts, parseAndValidateCatalog } from './catalog-lib.mjs'

const temporaryDirectories = []

function sourceCatalog() {
  return JSON.parse(fs.readFileSync(catalogPaths.source, 'utf8'))
}

function temporaryPaths(catalog = sourceCatalog()) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'mathe-reise-catalog-'))
  temporaryDirectories.push(directory)
  const paths = {
    source: path.join(directory, 'catalog.json'),
    publicArtifact: path.join(directory, 'public.json'),
    fallbackArtifact: path.join(directory, 'fallback.json')
  }
  fs.writeFileSync(paths.source, `${JSON.stringify(catalog, null, 2)}\n`)
  return paths
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) fs.rmSync(directory, { recursive: true, force: true })
})

describe('Katalog-Buildpipeline', () => {
  it('enthält vollständige didaktische Themenpfade', () => {
    const root = path.resolve(path.dirname(catalogPaths.source), '../../..')
    const directory = path.join(root, 'docs/didactics')
    const files = [
      'addition.md', 'subtraction.md', 'multiplication.md', 'division.md', 'place-value.md',
      'decompose-compose.md', 'neighbor-numbers.md', 'rounding.md', 'word-problems.md', 'symmetry.md',
      'addition-subtraction-1000.md', 'written-addition.md', 'written-subtraction.md', 'money.md', 'lengths.md', 'body-views.md', 'spatial-reasoning.md'
    ]
    for (const file of files) {
      const text = fs.readFileSync(path.join(directory, file), 'utf8')
      for (let section = 1; section <= 17; section += 1) expect(text).toContain(`## ${section}.`)
    }
    expect(fs.readFileSync(path.join(directory, 'teacher-review-package.md'), 'utf8')).toContain('## Fragen für die Gesamtbeurteilung')
  })
  it('validiert die getrennten Katalogmetadaten', () => {
    const catalog = parseAndValidateCatalog(fs.readFileSync(catalogPaths.source, 'utf8'))
    expect(catalog).toMatchObject({
      schemaVersion: 9,
      catalogVersion: '0.11.0',
      catalogId: 'nrw-klasse3-foerderkern',
      status: 'ready-for-review'
    })
  })

  it.each([
    ['schemaVersion', 99, 'schemaVersion'],
    ['catalogVersion', 'Version zwei', 'catalogVersion'],
    ['catalogId', '', 'catalogId'],
    ['status', 'published', 'status']
  ])('lehnt ungültiges Feld %s ab', (field, value, message) => {
    const catalog = sourceCatalog()
    catalog[field] = value
    expect(() => parseAndValidateCatalog(JSON.stringify(catalog))).toThrow(message)
  })

  it('lehnt doppelte IDs und unbekannte Platzhalter ab', () => {
    const duplicate = sourceCatalog()
    duplicate.wordProblems[1].id = duplicate.wordProblems[0].id
    expect(() => parseAndValidateCatalog(JSON.stringify(duplicate))).toThrow('doppelte Werte')

    const placeholder = sourceCatalog()
    placeholder.skills[0].prompt = 'Unbekannt: {secret}'
    expect(() => parseAndValidateCatalog(JSON.stringify(placeholder))).toThrow('unbekannten Platzhalter')
  })

  it('lehnt widersprüchliche Mengenbeziehungen und Plausibilitätsoptionen ab', () => {
    const wrongOperation = sourceCatalog()
    wrongOperation.wordProblems[0].operation = '−'
    expect(() => parseAndValidateCatalog(JSON.stringify(wrongOperation))).toThrow('passt nicht zur Mengenbeziehung')

    const ambiguousPlausibility = sourceCatalog()
    ambiguousPlausibility.wordProblems[0].plausibility.options[1].correct = true
    expect(() => parseAndValidateCatalog(JSON.stringify(ambiguousPlausibility))).toThrow('genau eine richtige Antwort')
  })

  it('lehnt einen unvollständigen zweiten Rechenschritt ab', () => {
    const catalog = sourceCatalog()
    const template = catalog.wordProblems.find((candidate) => candidate.secondOperation)
    delete template.thirdRange
    expect(() => parseAndValidateCatalog(JSON.stringify(catalog))).toThrow('unvollständigen zweiten Rechenschritt')
  })

  it('lehnt unvollständige Größeninhalte ab', () => {
    const catalog = sourceCatalog()
    catalog.quantityContent.money.countPrompt = ''
    expect(() => parseAndValidateCatalog(JSON.stringify(catalog))).toThrow('quantityContent.money.countPrompt')
  })

  it('lehnt eine Symmetriefigur auf beiden Achsenseiten ab', () => {
    const catalog = sourceCatalog()
    const template = catalog.symmetry.templates.find((candidate) => candidate.progressionPhase === 1)
    template.grid[0][template.grid[0].length - 1] = 1
    expect(() => parseAndValidateCatalog(JSON.stringify(catalog))).toThrow('passt nicht zur Progressionsphase')
  })

  it('lehnt verfrühte ungerade Raster und fehlende Achsenzellen ab', () => {
    const earlyOdd = sourceCatalog()
    earlyOdd.symmetry.templates[0].grid = [[1, 0, 0], [0, 0, 0]]
    earlyOdd.symmetry.templates[0].axisPosition = 'through-cells'
    expect(() => parseAndValidateCatalog(JSON.stringify(earlyOdd))).toThrow('passt nicht zur Progressionsphase')

    const missingAxisCell = sourceCatalog()
    const template = missingAxisCell.symmetry.templates.find((candidate) => candidate.progressionPhase === 4 && candidate.axis === 'vertical')
    const middle = Math.floor(template.grid[0].length / 2)
    template.grid.forEach((row) => { row[middle] = 0 })
    expect(() => parseAndValidateCatalog(JSON.stringify(missingAxisCell))).toThrow('passt nicht zur Progressionsphase')
  })

  it('erzeugt beide Artefakte deterministisch aus einer Quelle', () => {
    const paths = temporaryPaths()
    buildCatalogArtifacts(paths)
    expect(fs.readFileSync(paths.publicArtifact, 'utf8')).toBe(fs.readFileSync(paths.source, 'utf8'))
    expect(fs.readFileSync(paths.fallbackArtifact, 'utf8')).toBe(fs.readFileSync(paths.source, 'utf8'))
    expect(checkCatalogArtifacts(paths)).toBe(true)
  })

  it('lässt die Prüfung bei einem abweichenden Artefakt fehlschlagen', () => {
    const paths = temporaryPaths()
    buildCatalogArtifacts(paths)
    fs.writeFileSync(paths.publicArtifact, `${fs.readFileSync(paths.publicArtifact, 'utf8')} `)
    expect(() => checkCatalogArtifacts(paths)).toThrow('weicht von der zentralen Quelle ab')
  })

  it('verhindert einen Produktionsbuild mit draft-Status', () => {
    const catalog = sourceCatalog()
    catalog.status = 'draft'
    const paths = temporaryPaths(catalog)
    buildCatalogArtifacts(paths)
    expect(() => checkCatalogArtifacts(paths)).toThrow('draft darf nicht als Produktionsartefakt gebaut werden')
  })

  it('bindet die Katalogprüfung an den Produktionsbuild', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'))
    expect(packageJson.scripts.prebuild).toBe('npm run catalog:check')
  })
})
