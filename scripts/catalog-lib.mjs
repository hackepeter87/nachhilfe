import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const CATALOG_SCHEMA_VERSION = 4
export const CATALOG_ID = 'nrw-klasse3-foerderkern'

export const SKILL_IDS = [
  'addition', 'subtraction', 'multiplication', 'division', 'place-value', 'decompose', 'compose',
  'neighbor-tens', 'neighbor-hundreds', 'round-tens', 'round-hundreds', 'addition-1000',
  'subtraction-1000', 'complement-1000', 'word-problem', 'symmetry'
]

const KNOWN_PLACEHOLDERS = new Set([
  'answer', 'answerSentence', 'axis', 'bridge', 'digit', 'dividend', 'divisor', 'first', 'hundreds',
  'hundredsValue', 'irrelevant', 'lower', 'lowerDistance', 'number', 'ones', 'operation',
  'operationHint', 'position', 'quotient', 'result', 'second', 'story', 'strategy',
  'sumExpression', 'target', 'tens', 'tensValue', 'third', 'total', 'upper', 'upperDistance',
  'intermediate', 'secondOperation'
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
  if (!['draft', 'ready-for-review', 'active', 'disabled'].includes(catalog.status)) fail('status muss draft, ready-for-review, active oder disabled sein')
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
  for (const field of ['label', 'curriculumArea', 'supportGoal', 'workedExample', 'prompt', 'successFeedback', 'errorFeedback', 'explanation', 'transferPrompt']) {
    requireText(skill, field, context)
  }
  if (!Array.isArray(skill.processCompetencies) || !skill.processCompetencies.every((competency) =>
    isRecord(competency) && ['problem-solving', 'modelling', 'reasoning', 'representing', 'communicating'].includes(competency.id) && isText(competency.elicitedBy)
  )) fail(`${context}.processCompetencies ist ungültig`)
  for (const field of ['representations', 'misconceptions']) {
    if (!Array.isArray(skill[field]) || skill[field].length === 0 || !skill[field].every(isText)) fail(`${context}.${field} ist unvollständig`)
  }
  if (!Array.isArray(skill.prerequisites) || !skill.prerequisites.every(isText)) fail(`${context}.prerequisites ist ungültig`)
  const phases = ['activate', 'understand', 'guided-practice', 'independent-practice', 'automate', 'transfer']
  const statuses = ['draft', 'ready-for-review', 'active', 'disabled']
  if (!Array.isArray(skill.learningPhases) || skill.learningPhases.length !== phases.length ||
    !skill.learningPhases.every((phase) => isRecord(phase) && phases.includes(phase.id) && isText(phase.goal) &&
      Array.isArray(phase.exerciseTypes) && phase.exerciseTypes.length > 0 && phase.exerciseTypes.every(isText) && statuses.includes(phase.releaseStatus))) {
    fail(`${context}.learningPhases ist unvollständig`)
  }
  requireUnique(skill.learningPhases.map((phase) => phase.id), `${context}.learningPhases`)
  if (!Array.isArray(skill.hints) || skill.hints.length !== 2 || !skill.hints.every(isText)) fail(`${context}.hints muss zwei Texte enthalten`)
  if (!statuses.includes(skill.releaseStatus)) fail(`${context}.releaseStatus ist ungültig`)
  if (!Array.isArray(skill.successCriteria) || skill.successCriteria.length === 0 || !skill.successCriteria.every(isText)) fail(`${context}.successCriteria ist unvollständig`)
  if (!isRecord(skill.remediation) || !isText(skill.remediation.strategy) || !isText(skill.remediation.foundationStrategy) ||
    !isText(skill.remediation.representation) || typeof skill.remediation.keepSubskill !== 'boolean') fail(`${context}.remediation ist ungültig`)
  if (!Array.isArray(skill.difficultyLevels) || skill.difficultyLevels.length !== 3) fail(`${context}.difficultyLevels muss drei Stufen enthalten`)
  skill.difficultyLevels.forEach((level, index) => {
    const requirements = level.requirements
    const requirementFields = ['requiresNeighborIdentification', 'requiresRepresentationChoice', 'requiresOperationChoice', 'requiresJustification', 'requiresMultiStepCalculation']
    if (!isRecord(level) || level.level !== index + 1 || !isText(level.description) || !isText(level.numberRange) ||
      !['always', 'hint', 'none'].includes(level.representation) || !phases.includes(level.learningPhase) || !isRecord(requirements) || !requirementFields.every((field) => typeof requirements[field] === 'boolean')) {
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
  for (const field of ['id', 'story', 'question', 'relationshipLabel', 'relevant', 'answer', 'operationHint', 'operationError']) requireText(template, field, context)
  if (!['join', 'separate', 'combine', 'compare', 'complement', 'equal-groups', 'sharing'].includes(template.relationship)) fail(`${context}.relationship ist ungültig`)
  if (!['+', '−', '·', ':'].includes(template.operation)) fail(`${context}.operation ist ungültig`)
  const expectedOperation = { join: '+', combine: '+', separate: '−', compare: '−', complement: '−', 'equal-groups': '·', sharing: ':' }[template.relationship]
  if (expectedOperation !== template.operation) fail(`${context}.operation passt nicht zur Mengenbeziehung`)
  if (![1, 2, 3].includes(template.minDifficulty)) fail(`${context}.minDifficulty ist ungültig`)
  if (!['bar-model', 'groups'].includes(template.representation)) fail(`${context}.representation ist ungültig`)
  for (const field of ['firstRange', 'secondRange']) {
    const range = template[field]
    if (!isRecord(range) || !Number.isInteger(range.min) || !Number.isInteger(range.max) || range.min < numberRange.min || range.max > numberRange.max || range.min > range.max) {
      fail(`${context}.${field} ist ungültig`)
    }
  }
  const hasSecondStep = template.secondOperation !== undefined || template.thirdRange !== undefined
  if (hasSecondStep) {
    if (!['+', '−'].includes(template.secondOperation) || !isRecord(template.thirdRange) ||
      !Number.isInteger(template.thirdRange.min) || !Number.isInteger(template.thirdRange.max) ||
      template.thirdRange.min < numberRange.min || template.thirdRange.max > numberRange.max || template.thirdRange.min > template.thirdRange.max) {
      fail(`${context} hat einen unvollständigen zweiten Rechenschritt`)
    }
    if (!template.story.includes('{third}') || template.minDifficulty !== 3) fail(`${context} muss den zweiten Schritt als Stufe 3 ausweisen`)
  }
  if (!template.story.includes('{first}') || !template.answer.includes('{result}') ||
    (template.relationship === 'sharing' ? !template.story.includes('{total}') : !template.story.includes('{second}'))) fail(`${context} enthält nicht alle benötigten Platzhalter`)
  for (const field of ['questionDistractors', 'relationshipDistractors']) {
    if (!Array.isArray(template[field]) || template[field].length !== 2 || !template[field].every(isText)) fail(`${context}.${field} ist ungültig`)
  }
  requireUnique([template.question, ...template.questionDistractors], `${context} Fragen`)
  requireUnique([template.relationshipLabel, ...template.relationshipDistractors], `${context} Mengenbeziehungen`)
  if (!isRecord(template.plausibility) || !isText(template.plausibility.prompt) || !Array.isArray(template.plausibility.options) || template.plausibility.options.length !== 3) {
    fail(`${context}.plausibility ist ungültig`)
  }
  if (!template.plausibility.options.every((option) => isRecord(option) && isText(option.label) && typeof option.correct === 'boolean')) fail(`${context}.plausibility.options ist ungültig`)
  requireUnique(template.plausibility.options.map((option) => option.label), `${context} Plausibilitätsoptionen`)
  if (template.plausibility.options.filter((option) => option.correct).length !== 1) fail(`${context}.plausibility braucht genau eine richtige Antwort`)
  const firstMin = template.firstRange.min
  const firstMax = template.firstRange.max
  const secondMin = template.secondRange.min
  const secondMax = template.secondRange.max
  const firstResults = [firstMin, firstMax].flatMap((first) => [secondMin, secondMax].map((second) =>
    template.operation === '+' ? first + second : template.operation === '−' ? first - second : template.operation === ':' ? second : first * second
  ))
  const results = hasSecondStep
    ? firstResults.flatMap((intermediate) => [template.thirdRange.min, template.thirdRange.max].map((third) => template.secondOperation === '+' ? intermediate + third : intermediate - third))
    : firstResults
  const minResult = Math.min(...results)
  const maxResult = Math.max(...results)
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
    const size = template.difficulty + 2
    const isGrid = (grid) => Array.isArray(grid) && grid.length === size && grid.every((row) => Array.isArray(row) && row.length === size && row.every((cell) => cell === 0 || cell === 1))
    if (!isRecord(template) || !isText(template.id) || ![1, 2, 3].includes(template.difficulty) || !['vertical', 'horizontal'].includes(template.axis) ||
      !isGrid(template.grid) || !isGrid(template.shiftGrid) || !isGrid(template.wrongAxisGrid)) {
      fail(`Symmetrievorlage ${String(template?.id)} ist ungültig`)
    }
    const mirror = template.grid.map((row) => [...row].reverse())
    const flip = [...template.grid].reverse().map((row) => [...row])
    if (new Set([template.grid, mirror, flip].map((variant) => JSON.stringify(variant))).size !== 3) {
      fail(`Symmetrievorlage ${template.id} hat keine eindeutigen Varianten`)
    }
    const correct = template.axis === 'vertical' ? mirror : flip
    const wrongAxis = template.axis === 'vertical' ? flip : mirror
    if (JSON.stringify(wrongAxis) !== JSON.stringify(template.wrongAxisGrid) ||
      new Set([correct, template.shiftGrid, template.wrongAxisGrid].map((variant) => JSON.stringify(variant))).size !== 3) {
      fail(`Symmetrievorlage ${template.id} hat keine drei geprüften Antwortvarianten`)
    }
  })
}

export function validateCatalog(catalog) {
  if (!isRecord(catalog)) fail('Wurzel muss ein Objekt sein')
  validateMetadata(catalog)
  const usageFields = ['workedExample', 'remediation', 'transferPrompt', 'processCompetencies', 'learningPhases', 'difficultyLevels', 'representations', 'misconceptions', 'successCriteria', 'successFeedback', 'errorFeedback', 'releaseStatus']
  if (!isRecord(catalog.fieldUsage) || !usageFields.every((field) => ['runtime', 'review', 'planned'].includes(catalog.fieldUsage[field]))) fail('fieldUsage ist unvollständig')
  const numberRange = catalog.numberRange
  if (!isRecord(numberRange) || numberRange.min !== 0 || numberRange.max !== 1000) fail('numberRange muss 0 bis 1000 sein')
  if (!Array.isArray(catalog.skills) || catalog.skills.length !== SKILL_IDS.length) fail('Kompetenzliste ist unvollständig')
  const skillIds = catalog.skills.map((skill) => skill.id)
  requireUnique(skillIds, 'Kompetenz-IDs')
  if (!SKILL_IDS.every((id) => skillIds.includes(id))) fail('mindestens eine bekannte Kompetenz fehlt')
  catalog.skills.forEach((skill) => validateSkill(skill, numberRange))
  if (!Array.isArray(catalog.preparedTopics) || catalog.preparedTopics.length !== 3) fail('preparedTopics muss drei deaktivierte Themen enthalten')
  requireUnique(catalog.preparedTopics.map((topic) => topic.id), 'preparedTopics IDs')
  for (const topic of catalog.preparedTopics) {
    if (!isRecord(topic) || !['money', 'lengths', 'spatial-reasoning'].includes(topic.id) || topic.releaseStatus !== 'disabled') fail('preparedTopics enthält ein ungültiges oder aktives Thema')
    for (const field of ['label', 'curriculumArea', 'supportGoal', 'remediation']) requireText(topic, field, `preparedTopics.${topic.id}`)
    for (const field of ['prerequisites', 'representations', 'misconceptions', 'progression']) {
      if (!Array.isArray(topic[field]) || topic[field].length === 0 || !topic[field].every(isText)) fail(`preparedTopics.${topic.id}.${field} ist unvollständig`)
    }
  }
  if (!isRecord(catalog.strategySteps) || !isRecord(catalog.strategySteps.placeValue) || !isRecord(catalog.strategySteps.rounding) || !isRecord(catalog.strategySteps.arithmetic1000)) fail('strategySteps fehlt')
  for (const field of ['digitPrompt', 'digitError', 'digitSuccess', 'valuePrompt', 'valueError', 'valueSuccess']) requireText(catalog.strategySteps.placeValue, field, 'strategySteps.placeValue')
  for (const field of ['neighborsPrompt', 'neighborsError', 'neighborsSuccess', 'resultPrompt', 'resultError', 'resultSuccess', 'reasonPrompt', 'reasonError', 'reasonSuccess', 'closerLower', 'closerUpper', 'halfwayUp', 'wrongLower', 'wrongUpper']) requireText(catalog.strategySteps.rounding, field, 'strategySteps.rounding')
  for (const field of ['bridgePrompt', 'bridgeError', 'bridgeSuccess', 'resultPrompt', 'resultError', 'resultSuccess']) requireText(catalog.strategySteps.arithmetic1000, field, 'strategySteps.arithmetic1000')
  if (!Array.isArray(catalog.wordProblems) || catalog.wordProblems.length === 0) fail('wordProblems fehlt')
  requireUnique(catalog.wordProblems.map((template) => template.id), 'Sachaufgaben-IDs')
  catalog.wordProblems.forEach((template) => validateWordProblem(template, numberRange))
  if (!isRecord(catalog.wordProblemSteps)) fail('wordProblemSteps fehlt')
  for (const field of ['questionPrompt', 'questionError', 'questionSuccess', 'relevantPrompt', 'relevantError', 'relevantSuccess', 'relationshipPrompt', 'relationshipError', 'relationshipSuccess', 'operationPrompt', 'operationSuccess', 'representationPrompt', 'representationError', 'representationSuccess', 'calculatePrompt', 'calculateError', 'calculateSuccess', 'secondOperationPrompt', 'secondOperationError', 'secondOperationSuccess', 'finalCalculationPrompt', 'finalCalculationError', 'finalCalculationSuccess', 'checkPrompt', 'checkError', 'checkSuccess', 'plausibilityError', 'plausibilitySuccess']) {
    requireText(catalog.wordProblemSteps, field, 'wordProblemSteps')
  }
  const operationOptions = catalog.wordProblemSteps.operationOptions
  if (!Array.isArray(operationOptions) || operationOptions.length !== 4) fail('operationOptions muss vier Optionen enthalten')
  requireUnique(operationOptions.map((option) => option.value), 'operationOptions Werte')
  requireUnique(operationOptions.map((option) => option.label), 'operationOptions Beschriftungen')
  for (const field of ['relevantDistractors']) {
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
  if (['draft', 'disabled'].includes(sourceCatalog.status)) fail(`${sourceCatalog.status} darf nicht als Produktionsartefakt gebaut werden`)
  const source = canonicalCatalog(sourceCatalog)
  for (const [name, artifactPath] of [['öffentlicher Katalog', paths.publicArtifact], ['Fallback-Katalog', paths.fallbackArtifact]]) {
    if (!fs.existsSync(artifactPath)) fail(`${name} fehlt; npm run catalog:build ausführen`)
    const artifact = fs.readFileSync(artifactPath, 'utf8')
    parseAndValidateCatalog(artifact)
    if (artifact !== source) fail(`${name} weicht von der zentralen Quelle ab; npm run catalog:build ausführen`)
  }
  return true
}
