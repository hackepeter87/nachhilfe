import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const forbiddenMarkers = ['Didaktischer Prüfstand', 'Prüfstand wird geladen', 'Prüfliste für diese Variante', 'data-review-scenario']

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  return (await Promise.all(entries.map((entry) => entry.isDirectory()
    ? filesBelow(join(directory, entry.name))
    : [join(directory, entry.name)]))).flat()
}

const files = await filesBelow('dist')
for (const file of files.filter((name) => /\.(?:html|js|css)$/.test(name))) {
  const content = await readFile(file, 'utf8')
  const marker = forbiddenMarkers.find((candidate) => content.includes(candidate))
  if (marker) throw new Error(`Der Produktionsbuild enthält den Entwicklungs-Prüfstand (${marker}) in ${file}.`)
}

console.log('Produktionsbuild enthält keinen didaktischen Entwicklungs-Prüfstand.')
