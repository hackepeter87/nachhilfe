import fs from 'node:fs'
import { buildCatalogArtifacts, catalogPaths, checkCatalogArtifacts, parseAndValidateCatalog } from './catalog-lib.mjs'

const command = process.argv[2]

try {
  if (command === 'validate') {
    const catalog = parseAndValidateCatalog(fs.readFileSync(catalogPaths.source, 'utf8'))
    console.log(`Katalog ${catalog.catalogId} ${catalog.catalogVersion} (Schema ${catalog.schemaVersion}, ${catalog.status}) ist gültig.`)
  } else if (command === 'build') {
    const catalog = buildCatalogArtifacts()
    console.log(`Artefakte für ${catalog.catalogId} ${catalog.catalogVersion} wurden erzeugt.`)
  } else if (command === 'check') {
    checkCatalogArtifacts()
    console.log('Zentrale Quelle, öffentlicher Katalog und Fallback sind gültig und identisch.')
  } else {
    throw new Error('Aufruf: node scripts/catalog.mjs <validate|build|check>')
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
