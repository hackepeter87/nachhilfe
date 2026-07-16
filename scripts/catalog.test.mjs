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
  it('validiert die getrennten Katalogmetadaten', () => {
    const catalog = parseAndValidateCatalog(fs.readFileSync(catalogPaths.source, 'utf8'))
    expect(catalog).toMatchObject({
      schemaVersion: 2,
      catalogVersion: '0.2.0',
      catalogId: 'nrw-klasse3-foerderkern',
      status: 'review'
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
