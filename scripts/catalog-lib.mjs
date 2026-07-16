import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const CATALOG_SCHEMA_VERSION = 2
export const CATALOG_ID = 'nrw-klasse3-foerderkern'

export const SKILL_IDS = [
  'addition', 'subtraction', 'multiplication', 'division', 'place-value', 'decompose', 'compose',
  'neighbor-tens', 'neighbor-hundreds', 'round-tens', 'round-hundreds', 'addition-1000',
  'subtraction-1000', 'complement-1000', 'word-problem', 'symmetry'
]

const KNOWN_PLACEHOLDERS = new Set([
  'answer', 'answerSentence', 'axis', 'digit', 'dividend', 'divisor', 'first', 'hundreds',
  'hundredsValue', 'irrelevant', 'lower', 'lowerDistance', 'number', 'ones', 'operation',
  'operationHint', 'position', 'quotient', 'result', 'second', 'story', 'strategy',
  'sumExpression', 'target', 'tens', 'tensValue', 'upper', 'upperDistance'
])

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const catalogPaths = {
  source: path.join(root, 'content/catalogs/nrw-klasse3-foerderkern/catalog.json'),
  publicArtifact: path.join(root, 'public/content/task-catalog.json'),
  fallbackArtifact: path.join(root, 'src/content/task-catalog.fallback.json')
}

function fail(message) {
  throw new Error(`Katalog ungültig: ${message}`)
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function requireText(record, field, context) {
  if (!isText(record[field])) fail(`${context}.${field} fehlt oder ist leer`)
}

function requireUnique(values, context) {
  if (new Set(values).size !== values.length) fail(`${context} enthält doppelte Werte`)
}

function validateMetadata(catalog) {
  if (catalog.schemaVersion !== CATALOG_SCHEMA_VERSION) fail(`schemaVersion muss ${CATALOG_SCHEMA_VERSION} sein`)
  if (!isText(catalog.catalogVersion) || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(catalog.catalogVersion)) {
    fail('catalogVersion muss eine semantische Version x.y.z sein')
  }
  if (!isText(catalog.catalogId) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(catalog.catalogId)) fail('catalogId fehlt oder ist ungültig')
  if (catalog.catalogId !== CATALOG_ID) fail(`catalogId muss ${CATALOG_ID} sein`)
  if (!isText(catalog.releasedAt) || !/^\d{4}-\d{2}-\d{2}$/.test(catalog.releasedAt) || Number.isNaN(Date.parse(`${catalog.releasedAt}T00:00:00Z`))) {
    fail('releasedAt muss ein gültiges ISO-Datum YYYY-MM-DD sein')
  }
  if (!['draft', 'review', 'approved'].includes(catalog.status)) fail('status muss draft, review oder approved sein')
}

function validatePlaceholders(value, pathLabel = 'catalog') {
  if (typeof value === 'string') {
    for (const match of value.matchAll(/\{([a-zA-Z]+)\}/g)) {
      if (!KNOWN_PLACEHOLDERS.has(match[1])) fail(`${pathLabel} verwendet unbekannten Platzhalter {${match[1]}}`)
    }
    return
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => validatePlaceholders(entry, `${pathLabel}[${index}]`))
    return
  }
  if (isRecord(value)) {
    Object.entries(value).forEach(([key, entry]) => validatePlaceholders(entry, `${pathLabel}.${key}`))
  }
}

function validateSkill(skill, numberRange) {
  if (!isRecord(skill) || !SKILL_IDS.includes(skill.id)) fail(`unbekannte Kompetenz ${String(skill?.id)}`)
  const context = `skills.${skill.id}`
  for (const field of ['label', 'curriculumArea', 'supportGoal', 'workedExample', 'prompt', 'successFeedback', 'errorFeedback', 'explanation', 'remediation', 'transferPrompt']) {
    requireText(skill, field, context)
  }
  for (const field of ['processCompetencies', 'representations', 'misconceptions']) {
    if (!Array.isArray(skill[field]) || skill[field].length === 0 || !skill[field].every(isText)) fail(`${context}.${field} ist unvollständig`)
  }
  if (!Array.isArray(skill.prerequisites) || !skill.prerequisites.every(isText)) fail(`${context}.prerequisites ist ungültig`)
  if (!Array.isArray(skill.hints) || skill.hints.length !== 2 || !skill.hints.every(isText)) fail(`${context}.hints muss zwei Texte enthalten`)
  if (!['active', 'planned'].includes(skill.releaseStatus)) fail(`${context}.releaseStatus ist ungültig`)
  if (!Array.isArray(skill.difficultyLevels) || skill.difficultyLevels.length !== 3) fail(`${context}.difficultyLevels muss drei Stufen enthalten`)
  skill.difficultyLevels.forEach((level, index) => {
    if (!isRecord(level) || level.level !== index + 1 || !isText(level.description) || !isText(level.numberRange) ||
      !['always', 'hint', 'none'].includes(level.representation) || !Number.isInteger(level.cognitiveSteps) || level.cognitiveSteps < 1) {
      fail(`${context}.difficultyLevels[${index}] ist ungültig`)
    }
  })
  const bounds = skill.difficultyBounds
  if (!isRecord(bounds) || !Number.isInteger(bounds.minLevel) || !Number.isInteger(bounds.maxLevel) ||
    bounds.minLevel < 1 || bounds.maxLevel > 3 || bounds.minLevel > bounds.maxLevel ||
    !Number.isFinite(bounds.minValue) || !Number.isFinite(bounds.maxValue) ||
    bounds.minValue < numberRange.min || bounds.maxValue > numberRange.max || bounds.minValue > bounds.maxValue) {
    fail(`${context}.difficultyBounds ist ungültig`)
  }
}

function validateWordProblem(template, numberRange) {
  if (!isRecord(template)) fail('Sachaufgabenvorlage ist kein Objekt')
  const context = `wordProblems.${String(template.id)}`
  for (const field of ['id', 'story', 'question', 'relevant', 'answer', 'operationHint', 'operationError']) requireText(template, field, context)
  if (!['join', 'separate', 'combine', 'compare', 'complement', 'equal-groups', 'sharing'].includes(template.relationship)) fail(`${context}.relationship ist ungültig`)
  if (!['+', '−', '·'].includes(template.operation)) fail(`${context}.operation ist ungültig`)
  if (![1, 2, 3].includes(template.minDifficulty)) fail(`${context}.minDifficulty ist ungültig`)
  if (!['bar-model', 'groups'].includes(template.representation)) fail(`${context}.representation ist ungültig`)
  for (const field of ['firstRange', 'secondRange']) {
    const range = template[field]
    if (!isRecord(range) || !Number.isInteger(range.min) || !Number.isInteger(range.max) || range.min < numberRange.min || range.max > numberRange.max || range.min > range.max) {
      fail(`${context}.${field} ist ungültig`)
    }
  }
  if (!template.story.includes('{first}') || !template.story.includes('{second}') || !template.answer.includes('{result}')) fail(`${context} enthält nicht alle benötigten Platzhalter`)
  const firstMin = template.firstRange.min
  const firstMax = template.firstRange.max
  const secondMin = template.secondRange.min
  const secondMax = template.secondRange.max
  const minResult = template.operation === '+' ? firstMin + secondMin : template.operation === '−' ? firstMin - secondMax : firstMin * secondMin
  const maxResult = template.operation === '+' ? firstMax + secondMax : template.operation === '−' ? firstMax - secondMin : firstMax * secondMax
  if (minResult < numberRange.min || maxResult > numberRange.max) fail(`${context} erzeugt Ergebnisse außerhalb des Zahlenraums`)
}

function validateSymmetry(symmetry) {
  if (!isRecord(symmetry) || !Array.isArray(symmetry.optionLabels) || symmetry.optionLabels.length !== 3 || !symmetry.optionLabels.every(isText)) {
    fail('symmetry.optionLabels ist ungültig')
  }
  requireUnique(symmetry.optionLabels, 'symmetry.optionLabels')
  if (!Array.isArray(symmetry.templates) || symmetry.templates.length === 0) fail('symmetry.templates fehlt')
  const ids = symmetry.templates.map((template) => template.id)
  requireUnique(ids, 'symmetry.templates IDs')
  symmetry.templates.forEach((template) => {
    if (!isRecord(template) || !isText(template.id) || !Array.isArray(template.grid) || template.grid.length !== 4 ||
      !template.grid.every((row) => Array.isArray(row) && row.length === 4 && row.every((cell) => cell === 0 || cell === 1))) {
      fail(`Symmetrievorlage ${String(template?.id)} ist ungültig`)
    }
    const mirror = template.grid.map((row) => [...row].reverse())
    const flip = [...template.grid].reverse().map((row) => [...row])
    if (new Set([template.grid, mirror, flip].map((variant) => JSON.stringify(variant))).size !== 3) {
      fail(`Symmetrievorlage ${template.id} hat keine eindeutigen Varianten`)
    }
  })
}

export function validateCatalog(catalog) {
  if (!isRecord(catalog)) fail('Wurzel muss ein Objekt sein')
  validateMetadata(catalog)
  const numberRange = catalog.numberRange
  if (!isRecord(numberRange) || numberRange.min !== 0 || numberRange.max !== 1000) fail('numberRange muss 0 bis 1000 sein')
  if (!Array.isArray(catalog.skills) || catalog.skills.length !== SKILL_IDS.length) fail('Kompetenzliste ist unvollständig')
  const skillIds = catalog.skills.map((skill) => skill.id)
  requireUnique(skillIds, 'Kompetenz-IDs')
  if (!SKILL_IDS.every((id) => skillIds.includes(id))) fail('mindestens eine bekannte Kompetenz fehlt')
  catalog.skills.forEach((skill) => validateSkill(skill, numberRange))
  if (!Array.isArray(catalog.wordProblems) || catalog.wordProblems.length === 0) fail('wordProblems fehlt')
  requireUnique(catalog.wordProblems.map((template) => template.id), 'Sachaufgaben-IDs')
  catalog.wordProblems.forEach((template) => validateWordProblem(template, numberRange))
  if (!isRecord(catalog.wordProblemSteps)) fail('wordProblemSteps fehlt')
  const operationOptions = catalog.wordProblemSteps.operationOptions
  if (!Array.isArray(operationOptions) || operationOptions.length !== 3) fail('operationOptions muss drei Optionen enthalten')
  requireUnique(operationOptions.map((option) => option.value), 'operationOptions Werte')
  requireUnique(operationOptions.map((option) => option.label), 'operationOptions Beschriftungen')
  for (const field of ['questionDistractors', 'relevantDistractors']) {
    const values = catalog.wordProblemSteps[field]
    if (!Array.isArray(values) || values.length !== 2 || !values.every(isText)) fail(`wordProblemSteps.${field} ist ungültig`)
    requireUnique(values, `wordProblemSteps.${field}`)
  }
  validateSymmetry(catalog.symmetry)
  validatePlaceholders(catalog)
  return catalog
}

export function parseAndValidateCatalog(text) {
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch (error) {
    fail(`JSON kann nicht gelesen werden: ${error instanceof Error ? error.message : String(error)}`)
  }
  return validateCatalog(parsed)
}

export function canonicalCatalog(catalog) {
  return `${JSON.stringify(catalog, null, 2)}\n`
}

export function buildCatalogArtifacts(paths = catalogPaths) {
  const catalog = parseAndValidateCatalog(fs.readFileSync(paths.source, 'utf8'))
  const output = canonicalCatalog(catalog)
  fs.mkdirSync(path.dirname(paths.publicArtifact), { recursive: true })
  fs.mkdirSync(path.dirname(paths.fallbackArtifact), { recursive: true })
  fs.writeFileSync(paths.publicArtifact, output)
  fs.writeFileSync(paths.fallbackArtifact, output)
  return catalog
}

export function checkCatalogArtifacts(paths = catalogPaths) {
  const sourceCatalog = parseAndValidateCatalog(fs.readFileSync(paths.source, 'utf8'))
  if (sourceCatalog.status === 'draft') fail('draft darf nicht als Produktionsartefakt gebaut werden')
  const source = canonicalCatalog(sourceCatalog)
  for (const [name, artifactPath] of [['öffentlicher Katalog', paths.publicArtifact], ['Fallback-Katalog', paths.fallbackArtifact]]) {
    if (!fs.existsSync(artifactPath)) fail(`${name} fehlt; npm run catalog:build ausführen`)
    const artifact = fs.readFileSync(artifactPath, 'utf8')
    parseAndValidateCatalog(artifact)
    if (artifact !== source) fail(`${name} weicht von der zentralen Quelle ab; npm run catalog:build ausführen`)
  }
  return true
}
