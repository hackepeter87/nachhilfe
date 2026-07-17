import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const CATALOG_SCHEMA_VERSION = 13
export const CATALOG_ID = 'nrw-klasse3-foerderkern'

export const SKILL_IDS = [
  'addition', 'subtraction', 'multiplication', 'division', 'place-value', 'decompose', 'compose',
  'neighbor-tens', 'neighbor-hundreds', 'round-tens', 'round-hundreds', 'addition-1000',
  'written-addition', 'subtraction-1000', 'written-subtraction', 'complement-1000', 'money', 'lengths', 'word-problem', 'symmetry', 'body-views', 'cube-rotation', 'folding'
]

const KNOWN_PLACEHOLDERS = new Set([
  'answer', 'answerSentence', 'axis', 'bridge', 'digit', 'dividend', 'divisor', 'first', 'hundreds',
  'hundredsValue', 'irrelevant', 'lower', 'lowerDistance', 'number', 'ones', 'operation',
  'operationHint', 'position', 'quotient', 'result', 'second', 'story', 'strategy',
  'sumExpression', 'target', 'taskPrompt', 'tens', 'tensValue', 'third', 'total', 'upper', 'upperDistance',
  'intermediate', 'secondOperation', 'quantityExplanation', 'amount', 'price', 'paid', 'change',
  'length', 'firstLength', 'secondLength', 'answerLength', 'modelHint', 'equation', 'secondEquation',
  'onesResult', 'tensResult', 'hundredsResult', 'carry', 'viewLabel', 'turnLabel', 'foldLabel'
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
  for (const field of ['id', 'story', 'question', 'situation', 'relevant', 'answer', 'modelHint', 'equation', 'equationError']) requireText(template, field, context)
  if (!['join', 'separate', 'combine', 'compare', 'complement', 'equal-groups', 'sharing'].includes(template.relationship)) fail(`${context}.relationship ist ungültig`)
  if (!['+', '−', '·', ':'].includes(template.operation)) fail(`${context}.operation ist ungültig`)
  const expectedOperation = { join: '+', combine: '+', separate: '−', compare: '−', complement: '−', 'equal-groups': '·', sharing: ':' }[template.relationship]
  if (expectedOperation !== template.operation) fail(`${context}.operation passt nicht zur Mengenbeziehung`)
  if (![1, 2, 3].includes(template.minDifficulty)) fail(`${context}.minDifficulty ist ungültig`)
  const modelTypes = ['change-increase', 'change-decrease', 'part-whole', 'comparison', 'missing-part', 'equal-groups-total', 'equal-groups-share', 'increase-then-decrease', 'decrease-then-increase']
  if (!modelTypes.includes(template.modelType)) fail(`${context}.modelType ist ungültig`)
  const expectedModel = {
    join: template.secondOperation ? 'increase-then-decrease' : 'change-increase',
    separate: template.secondOperation ? 'decrease-then-increase' : 'change-decrease',
    combine: 'part-whole', compare: 'comparison', complement: 'missing-part',
    'equal-groups': 'equal-groups-total', sharing: 'equal-groups-share'
  }[template.relationship]
  if (expectedModel !== template.modelType) fail(`${context}.modelType passt nicht zur Geschichte`)
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
    if (!template.story.includes('{third}') || template.minDifficulty !== 3 || !isText(template.secondEquation) ||
      !Array.isArray(template.secondEquationDistractors) || template.secondEquationDistractors.length !== 2 || !template.secondEquationDistractors.every(isText)) {
      fail(`${context} muss den zweiten Schritt als Stufe 3 vollständig ausweisen`)
    }
    requireUnique([template.secondEquation, ...template.secondEquationDistractors], `${context} zweite Rechnungen`)
  } else if (template.secondEquation !== undefined || template.secondEquationDistractors !== undefined) {
    fail(`${context} enthält unerwartete Daten für einen zweiten Rechenschritt`)
  }
  if (!template.story.includes('{first}') || !template.answer.includes('{result}') ||
    (template.relationship === 'sharing' ? !template.story.includes('{total}') : !template.story.includes('{second}'))) fail(`${context} enthält nicht alle benötigten Platzhalter`)
  for (const field of ['questionDistractors', 'situationDistractors', 'relevantDistractors', 'equationDistractors']) {
    if (!Array.isArray(template[field]) || template[field].length !== 2 || !template[field].every(isText)) fail(`${context}.${field} ist ungültig`)
  }
  requireUnique([template.question, ...template.questionDistractors], `${context} Fragen`)
  requireUnique([template.situation, ...template.situationDistractors], `${context} Situationen`)
  requireUnique([template.relevant, ...template.relevantDistractors], `${context} wichtige Angaben`)
  requireUnique([template.equation, ...template.equationDistractors], `${context} Rechnungen`)
  if (!Array.isArray(template.modelDistractors) || template.modelDistractors.length !== 2 ||
    !template.modelDistractors.every((model) => modelTypes.includes(model))) fail(`${context}.modelDistractors ist ungültig`)
  requireUnique([template.modelType, ...template.modelDistractors], `${context} Darstellungen`)
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
  if (!isRecord(symmetry) || !isText(symmetry.entryRationale) || !isText(symmetry.axisLegend) ||
    !Array.isArray(symmetry.optionLabels) || symmetry.optionLabels.length !== 3 || !symmetry.optionLabels.every(isText)) fail('symmetry Grunddaten sind ungültig')
  requireUnique(symmetry.optionLabels, 'symmetry.optionLabels')
  for (const position of ['between-cells', 'through-cells']) {
    const guidance = symmetry.guidance?.[position]
    if (!isRecord(guidance) || !['hint1', 'hint2', 'explanation', 'errorFeedback', 'successFeedback'].every((field) => isText(guidance[field]))) {
      fail(`symmetry.guidance.${position} ist ungültig`)
    }
  }
  if (!Array.isArray(symmetry.progression) || symmetry.progression.length !== 5) fail('symmetry.progression muss fünf Phasen enthalten')
  symmetry.progression.forEach((phase, index) => {
    if (!isRecord(phase) || phase.phase !== index + 1 || !isText(phase.title) || !isText(phase.goal) ||
      !['even', 'odd', 'mixed'].includes(phase.gridParity) || !['between-cells', 'through-cells', 'mixed'].includes(phase.axisPosition) ||
      !['simple', 'connected', 'complex'].includes(phase.figureComplexity) || !['clear', 'plausible', 'close'].includes(phase.distractorSimilarity) ||
      !Array.isArray(phase.axes) || phase.axes.length === 0 || !phase.axes.every((axis) => ['vertical', 'horizontal'].includes(axis)) ||
      !isRecord(phase.occupiedCells) || !Number.isInteger(phase.occupiedCells.min) || !Number.isInteger(phase.occupiedCells.max) ||
      phase.occupiedCells.min < 1 || phase.occupiedCells.min > phase.occupiedCells.max) fail(`symmetry.progression Phase ${index + 1} ist ungültig`)
  })
  if (!Array.isArray(symmetry.templates) || symmetry.templates.length === 0) fail('symmetry.templates fehlt')
  const ids = symmetry.templates.map((template) => template.id)
  requireUnique(ids, 'symmetry.templates IDs')
  symmetry.templates.forEach((template) => {
    const grid = template.grid
    const width = Array.isArray(grid?.[0]) ? grid[0].length : 0
    const isGrid = Array.isArray(grid) && grid.length >= 2 && width >= 2 && grid.every((row) => Array.isArray(row) && row.length === width && row.every((cell) => cell === 0 || cell === 1))
    if (!isRecord(template) || !isText(template.id) || ![1, 2, 3].includes(template.difficulty) || ![1, 2, 3, 4, 5].includes(template.progressionPhase) ||
      !['vertical', 'horizontal'].includes(template.axis) || !['between-cells', 'through-cells'].includes(template.axisPosition) ||
      !['simple', 'connected', 'complex'].includes(template.figureComplexity) || !['clear', 'plausible', 'close'].includes(template.distractorSimilarity) ||
      JSON.stringify(template.distractorStrategies) !== JSON.stringify(['shift-within-side', 'wrong-axis']) || !isGrid) fail(`Symmetrievorlage ${String(template?.id)} ist ungültig`)

    const phase = symmetry.progression[template.progressionPhase - 1]
    const axisSize = template.axis === 'vertical' ? width : grid.length
    const expectedPosition = axisSize % 2 === 0 ? 'between-cells' : 'through-cells'
    const expectedDifficulty = template.progressionPhase === 1 ? 1 : template.progressionPhase === 2 ? 2 : 3
    const occupied = grid.flat().filter(Boolean).length
    const middle = Math.floor(axisSize / 2)
    const sourceOnOneSide = grid.every((row, rowIndex) => row.every((cell, columnIndex) => !cell ||
      (axisSize % 2 === 0
        ? (template.axis === 'vertical' ? columnIndex < middle : rowIndex < middle)
        : (template.axis === 'vertical' ? columnIndex <= middle : rowIndex <= middle))))
    const hasAxisCell = template.axis === 'vertical' ? grid.some((row) => row[middle] === 1) : grid[middle]?.some((cell) => cell === 1)
    if (template.difficulty !== expectedDifficulty || template.axisPosition !== expectedPosition || !sourceOnOneSide ||
      (template.axisPosition === 'through-cells' && !hasAxisCell) || !phase.axes.includes(template.axis) ||
      (phase.gridParity !== 'mixed' && phase.gridParity !== (axisSize % 2 === 0 ? 'even' : 'odd')) ||
      (phase.axisPosition !== 'mixed' && phase.axisPosition !== template.axisPosition) || phase.figureComplexity !== template.figureComplexity ||
      phase.distractorSimilarity !== template.distractorSimilarity || occupied < phase.occupiedCells.min || occupied > phase.occupiedCells.max) {
      fail(`Symmetrievorlage ${template.id} passt nicht zur Progressionsphase`)
    }

    const reflect = (axis) => axis === 'vertical' ? grid.map((row) => [...row].reverse()) : [...grid].reverse().map((row) => [...row])
    const correct = reflect(template.axis)
    const wrongAxis = reflect(template.axis === 'vertical' ? 'horizontal' : 'vertical')
    const deltas = template.axis === 'vertical' ? [[0, 1], [1, 0], [-1, 0], [0, -1]] : [[1, 0], [0, 1], [0, -1], [-1, 0]]
    const shifts = deltas.map(([rowDelta, columnDelta]) => {
      const shifted = Array.from({ length: grid.length }, () => Array(width).fill(0))
      for (let row = 0; row < grid.length; row += 1) for (let column = 0; column < width; column += 1) {
        if (!grid[row][column]) continue
        const nextRow = row + rowDelta
        const nextColumn = column + columnDelta
        if (nextRow < 0 || nextRow >= grid.length || nextColumn < 0 || nextColumn >= width) return null
        shifted[nextRow][nextColumn] = 1
      }
      const staysOnSide = shifted.every((row, rowIndex) => row.every((cell, columnIndex) => !cell ||
        (axisSize % 2 === 0
          ? (template.axis === 'vertical' ? columnIndex < middle : rowIndex < middle)
          : (template.axis === 'vertical' ? columnIndex <= middle : rowIndex <= middle))))
      return staysOnSide ? shifted : null
    }).filter(Boolean)
    const shift = shifts.find((candidate) => new Set([grid, correct, wrongAxis, candidate].map((variant) => JSON.stringify(variant))).size === 4)
    if (!shift || new Set([correct, shift, wrongAxis].map((variant) => JSON.stringify(variant))).size !== 3) fail(`Symmetrievorlage ${template.id} hat keine drei geprüften Antwortvarianten`)
  })
}

function validateSpatialViews(spatialViews) {
  if (!isRecord(spatialViews) || !isText(spatialViews.entryRationale) || !isText(spatialViews.prompt) ||
    !Array.isArray(spatialViews.optionLabels) || spatialViews.optionLabels.length !== 3 || !spatialViews.optionLabels.every(isText)) {
    fail('spatialViews Grunddaten sind ungültig')
  }
  requireUnique(spatialViews.optionLabels, 'spatialViews.optionLabels')
  for (const direction of ['front', 'right', 'top']) {
    if (!isText(spatialViews.directionLabels?.[direction]) || !isText(spatialViews.directionGuidance?.[direction])) {
      fail(`spatialViews ${direction} ist unvollständig`)
    }
  }
  if (!Array.isArray(spatialViews.templates) || spatialViews.templates.length < 6) fail('spatialViews.templates ist unvollständig')
  requireUnique(spatialViews.templates.map((template) => template.id), 'spatialViews.templates IDs')
  const difficulties = new Set()
  spatialViews.templates.forEach((template) => {
    if (!isRecord(template) || !isText(template.id) || ![1, 2, 3].includes(template.difficulty) ||
      !Number.isInteger(template.width) || template.width < 2 || template.width > 3 ||
      !Number.isInteger(template.depth) || template.depth < 1 || template.depth > 3 ||
      !Array.isArray(template.heights) || template.heights.length !== template.width * template.depth ||
      !template.heights.every((height) => Number.isInteger(height) && height >= 0 && height <= 2)) fail(`Körpervorlage ${String(template?.id)} ist ungültig`)
    const cubeCount = template.heights.reduce((sum, height) => sum + height, 0)
    const [min, max] = template.difficulty === 1 ? [2, 3] : template.difficulty === 2 ? [3, 4] : [4, 5]
    if (cubeCount < min || cubeCount > max) fail(`Körpervorlage ${template.id} passt nicht zur Schwierigkeit`)
    const fillsBoundingBox = template.heights.some((height, index) => height > 0 && index % template.width === 0) &&
      template.heights.some((height, index) => height > 0 && index % template.width === template.width - 1) &&
      template.heights.slice(0, template.width).some((height) => height > 0) &&
      template.heights.slice((template.depth - 1) * template.width).some((height) => height > 0)
    if (!fillsBoundingBox) fail(`Körpervorlage ${template.id} enthält einen unsichtbaren äußeren Rasterrand`)
    const occupied = template.heights.map((height, index) => height > 0 ? index : -1).filter((index) => index >= 0)
    const visited = new Set(occupied.slice(0, 1))
    const queue = [...visited]
    while (queue.length > 0) {
      const index = queue.shift()
      const x = index % template.width
      const y = Math.floor(index / template.width)
      for (const [nextX, nextY] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
        const nextIndex = nextY * template.width + nextX
        if (nextX >= 0 && nextX < template.width && nextY >= 0 && nextY < template.depth && template.heights[nextIndex] > 0 && !visited.has(nextIndex)) {
          visited.add(nextIndex)
          queue.push(nextIndex)
        }
      }
    }
    if (visited.size !== occupied.length) fail(`Körpervorlage ${template.id} ist nicht zusammenhängend`)
    difficulties.add(template.difficulty)
  })
  if (![1, 2, 3].every((difficulty) => difficulties.has(difficulty))) fail('spatialViews braucht Vorlagen für alle drei Stufen')
}

function validateSpatialRotations(spatialRotations) {
  if (!isRecord(spatialRotations) || !isText(spatialRotations.entryRationale) || !isText(spatialRotations.prompt) ||
    !isText(spatialRotations.axisLabel) || !Array.isArray(spatialRotations.optionLabels) ||
    spatialRotations.optionLabels.length !== 3 || !spatialRotations.optionLabels.every(isText)) {
    fail('spatialRotations Grunddaten sind ungültig')
  }
  requireUnique(spatialRotations.optionLabels, 'spatialRotations.optionLabels')
  for (const turn of ['left', 'right']) {
    if (!isText(spatialRotations.turnLabels?.[turn]) || !isText(spatialRotations.turnGuidance?.[turn])) {
      fail(`spatialRotations ${turn} ist unvollständig`)
    }
  }
  if (!Array.isArray(spatialRotations.templates) || spatialRotations.templates.length < 6) fail('spatialRotations.templates ist unvollständig')
  requireUnique(spatialRotations.templates.map((template) => template.id), 'spatialRotations.templates IDs')
  const difficulties = new Set()
  const turnsByDifficulty = new Map()
  const key = (building) => `${building.width}x${building.depth}:${building.heights.join(',')}`
  const everyCubeIsVisible = (building) => {
    const heightAt = (x, y) => x < 0 || x >= building.width || y < 0 || y >= building.depth ? 0 : building.heights[y * building.width + x]
    for (let y = 0; y < building.depth; y += 1) for (let x = 0; x < building.width; x += 1) {
      const height = heightAt(x, y)
      for (let z = 0; z < height; z += 1) {
        if (z !== height - 1 && y !== 0 && heightAt(x, y - 1) > z && x !== building.width - 1 && heightAt(x + 1, y) > z) return false
      }
    }
    return true
  }
  const rotate = (building, turn) => {
    const width = building.depth
    const depth = building.width
    const heights = Array(width * depth).fill(0)
    for (let y = 0; y < building.depth; y += 1) for (let x = 0; x < building.width; x += 1) {
      const nextX = turn === 'right' ? building.depth - 1 - y : y
      const nextY = turn === 'right' ? x : building.width - 1 - x
      heights[nextY * width + nextX] = building.heights[y * building.width + x]
    }
    return { width, depth, heights }
  }
  spatialRotations.templates.forEach((template) => {
    if (!isRecord(template) || !isText(template.id) || ![1, 2, 3].includes(template.difficulty) ||
      !['left', 'right'].includes(template.turn) || !Number.isInteger(template.width) || template.width < 2 || template.width > 3 ||
      !Number.isInteger(template.depth) || template.depth < 1 || template.depth > 3 ||
      !Array.isArray(template.heights) || template.heights.length !== template.width * template.depth ||
      !template.heights.every((height) => Number.isInteger(height) && height >= 0 && height <= 2)) {
      fail(`Rotationsvorlage ${String(template?.id)} ist ungültig`)
    }
    const cubeCount = template.heights.reduce((sum, height) => sum + height, 0)
    const [min, max] = template.difficulty === 1 ? [3, 3] : template.difficulty === 2 ? [3, 4] : [4, 5]
    if (cubeCount < min || cubeCount > max) fail(`Rotationsvorlage ${template.id} passt nicht zur Schwierigkeit`)
    const fillsBoundingBox = template.heights.some((height, index) => height > 0 && index % template.width === 0) &&
      template.heights.some((height, index) => height > 0 && index % template.width === template.width - 1) &&
      template.heights.slice(0, template.width).some((height) => height > 0) &&
      template.heights.slice((template.depth - 1) * template.width).some((height) => height > 0)
    if (!fillsBoundingBox || !everyCubeIsVisible(template)) fail(`Rotationsvorlage ${template.id} enthält unsichtbare Würfel oder äußere Leerränder`)
    const occupied = template.heights.map((height, index) => height > 0 ? index : -1).filter((index) => index >= 0)
    const visited = new Set(occupied.slice(0, 1))
    const queue = [...visited]
    while (queue.length > 0) {
      const index = queue.shift()
      const x = index % template.width
      const y = Math.floor(index / template.width)
      for (const [nextX, nextY] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
        const nextIndex = nextY * template.width + nextX
        if (nextX >= 0 && nextX < template.width && nextY >= 0 && nextY < template.depth && template.heights[nextIndex] > 0 && !visited.has(nextIndex)) {
          visited.add(nextIndex)
          queue.push(nextIndex)
        }
      }
    }
    if (visited.size !== occupied.length) fail(`Rotationsvorlage ${template.id} ist nicht zusammenhängend`)
    const opposite = template.turn === 'right' ? 'left' : 'right'
    const correct = rotate(template, template.turn)
    const oppositeBuilding = rotate(template, opposite)
    if (!everyCubeIsVisible(correct) || !everyCubeIsVisible(oppositeBuilding)) fail(`Rotationsvorlage ${template.id} wird nach der Drehung nicht vollständig sichtbar`)
    if (new Set([key(template), key(correct), key(oppositeBuilding)]).size !== 3) {
      fail(`Rotationsvorlage ${template.id} unterscheidet Ausgangslage und Drehrichtungen nicht eindeutig`)
    }
    difficulties.add(template.difficulty)
    const turns = turnsByDifficulty.get(template.difficulty) ?? new Set()
    turns.add(template.turn)
    turnsByDifficulty.set(template.difficulty, turns)
  })
  if (![1, 2, 3].every((difficulty) => difficulties.has(difficulty)) || turnsByDifficulty.get(1)?.size !== 1 || !turnsByDifficulty.get(1)?.has('right') ||
    ![2, 3].every((difficulty) => ['left', 'right'].every((turn) => turnsByDifficulty.get(difficulty)?.has(turn)))) {
    fail('spatialRotations braucht die katalogisierte Richtungsprogression in allen drei Stufen')
  }
}

function validateSpatialFolding(spatialFolding) {
  if (!isRecord(spatialFolding) || !isText(spatialFolding.entryRationale) || !isText(spatialFolding.pointPrompt) ||
    !isText(spatialFolding.cutPrompt) || !isText(spatialFolding.axisLabel) || !Array.isArray(spatialFolding.optionLabels) ||
    spatialFolding.optionLabels.length !== 3 || !spatialFolding.optionLabels.every(isText)) {
    fail('spatialFolding Grunddaten sind ungültig')
  }
  requireUnique(spatialFolding.optionLabels, 'spatialFolding.optionLabels')
  for (const side of ['left', 'right', 'top', 'bottom']) {
    if (!isText(spatialFolding.foldLabels?.[side])) fail(`spatialFolding.foldLabels.${side} fehlt`)
  }
  for (const mode of ['point-fold', 'cut-unfold']) {
    if (!isText(spatialFolding.modeGuidance?.[mode])) fail(`spatialFolding.modeGuidance.${mode} fehlt`)
  }
  if (!Array.isArray(spatialFolding.templates) || spatialFolding.templates.length < 8) fail('spatialFolding.templates ist unvollständig')
  requireUnique(spatialFolding.templates.map((template) => template.id), 'spatialFolding.templates IDs')
  const stages = new Set()
  const axesByDifficulty = new Map()
  const reflect = (template) => {
    const row = Math.floor(template.sourceCell / template.columns)
    const column = template.sourceCell % template.columns
    return template.axis === 'vertical'
      ? row * template.columns + template.columns - 1 - column
      : (template.rows - 1 - row) * template.columns + column
  }
  spatialFolding.templates.forEach((template) => {
    if (!isRecord(template) || !isText(template.id) || !isText(template.instruction) || ![1, 2, 3].includes(template.difficulty) ||
      !['point-fold', 'cut-unfold'].includes(template.mode) || !['vertical', 'horizontal'].includes(template.axis) ||
      !['left', 'right', 'top', 'bottom'].includes(template.foldSide) || !Number.isInteger(template.rows) ||
      !Number.isInteger(template.columns) || template.rows < 2 || template.rows > 6 || template.columns < 2 || template.columns > 8 ||
      !Number.isInteger(template.sourceCell) || template.sourceCell < 0 || template.sourceCell >= template.rows * template.columns) {
      fail(`Faltvorlage ${String(template?.id)} ist ungültig`)
    }
    if (template.axis === 'vertical' ? template.columns % 2 !== 0 : template.rows % 2 !== 0) fail(`Faltvorlage ${template.id} braucht eine Achse zwischen Zellen`)
    const row = Math.floor(template.sourceCell / template.columns)
    const column = template.sourceCell % template.columns
    const sideMatches = template.foldSide === 'left' ? template.axis === 'vertical' && column < template.columns / 2
      : template.foldSide === 'right' ? template.axis === 'vertical' && column >= template.columns / 2
        : template.foldSide === 'top' ? template.axis === 'horizontal' && row < template.rows / 2
          : template.axis === 'horizontal' && row >= template.rows / 2
    if (!sideMatches || reflect(template) === template.sourceCell) fail(`Faltvorlage ${template.id} passt nicht zur Faltrichtung`)
    if (template.difficulty === 1 && (template.mode !== 'point-fold' || template.axis !== 'vertical')) fail(`Faltvorlage ${template.id} verletzt Stufe 1`)
    if (template.difficulty === 2 && template.mode !== 'point-fold') fail(`Faltvorlage ${template.id} verletzt Stufe 2`)
    if (template.difficulty === 3 && template.mode !== 'cut-unfold') fail(`Faltvorlage ${template.id} verletzt Stufe 3`)
    stages.add(template.difficulty)
    const axes = axesByDifficulty.get(template.difficulty) ?? new Set()
    axes.add(template.axis)
    axesByDifficulty.set(template.difficulty, axes)
  })
  if (![1, 2, 3].every((stage) => stages.has(stage)) || axesByDifficulty.get(1)?.size !== 1 || !axesByDifficulty.get(1)?.has('vertical') ||
    ![2, 3].every((difficulty) => ['vertical', 'horizontal'].every((axis) => axesByDifficulty.get(difficulty)?.has(axis)))) {
    fail('spatialFolding braucht die katalogisierte Achsen- und Modusprogression')
  }
}

export function validateCatalog(catalog) {
  if (!isRecord(catalog)) fail('Wurzel muss ein Objekt sein')
  validateMetadata(catalog)
  if (!isRecord(catalog.representationPolicy) ||
    !['rule', 'knownValues', 'unknownValues', 'revealedValues'].every((field) => isText(catalog.representationPolicy[field]))) {
    fail('representationPolicy ist unvollständig')
  }
  const usageFields = ['representationPolicy', 'workedExample', 'remediation', 'transferPrompt', 'processCompetencies', 'learningPhases', 'difficultyLevels', 'representations', 'misconceptions', 'successCriteria', 'successFeedback', 'errorFeedback', 'releaseStatus']
  if (!isRecord(catalog.fieldUsage) || !usageFields.every((field) => ['runtime', 'review', 'planned'].includes(catalog.fieldUsage[field]))) fail('fieldUsage ist unvollständig')
  const numberRange = catalog.numberRange
  if (!isRecord(numberRange) || numberRange.min !== 0 || numberRange.max !== 1000) fail('numberRange muss 0 bis 1000 sein')
  if (!Array.isArray(catalog.skills) || catalog.skills.length !== SKILL_IDS.length) fail('Kompetenzliste ist unvollständig')
  const skillIds = catalog.skills.map((skill) => skill.id)
  requireUnique(skillIds, 'Kompetenz-IDs')
  if (!SKILL_IDS.every((id) => skillIds.includes(id))) fail('mindestens eine bekannte Kompetenz fehlt')
  catalog.skills.forEach((skill) => validateSkill(skill, numberRange))
  const symmetrySkill = catalog.skills.find((skill) => skill.id === 'symmetry')
  const expectedSymmetryExerciseTypes = [
    ['symmetry:phase-1'], ['symmetry:phase-1'], ['symmetry:phase-1'],
    ['symmetry:phase-2'], ['symmetry:phase-3'], ['symmetry:phase-4', 'symmetry:phase-5']
  ]
  if (!symmetrySkill || JSON.stringify(symmetrySkill.learningPhases.map((phase) => phase.exerciseTypes)) !== JSON.stringify(expectedSymmetryExerciseTypes)) {
    fail('Symmetrie-Lernphasen passen nicht zur fünfphasigen Progression')
  }
  if (!Array.isArray(catalog.preparedTopics) || catalog.preparedTopics.length !== 1) fail('preparedTopics muss genau das deaktivierte Thema Raumvorstellung enthalten')
  requireUnique(catalog.preparedTopics.map((topic) => topic.id), 'preparedTopics IDs')
  for (const topic of catalog.preparedTopics) {
    if (!isRecord(topic) || topic.id !== 'spatial-reasoning' || topic.releaseStatus !== 'disabled') fail('preparedTopics enthält ein ungültiges oder aktives Thema')
    for (const field of ['label', 'curriculumArea', 'supportGoal', 'remediation']) requireText(topic, field, `preparedTopics.${topic.id}`)
    for (const field of ['prerequisites', 'representations', 'misconceptions', 'progression']) {
      if (!Array.isArray(topic[field]) || topic[field].length === 0 || !topic[field].every(isText)) fail(`preparedTopics.${topic.id}.${field} ist unvollständig`)
    }
  }
  if (!isRecord(catalog.quantityContent) || !isRecord(catalog.quantityContent.money) || !isRecord(catalog.quantityContent.lengths)) fail('quantityContent fehlt')
  for (const field of ['countPrompt', 'changePrompt', 'countExplanation', 'changeExplanation', 'coinsLabel', 'priceLabel', 'paidLabel']) requireText(catalog.quantityContent.money, field, 'quantityContent.money')
  for (const field of ['readPrompt', 'toCentimetersPrompt', 'toMetersPrompt', 'calculationPrompt', 'readExplanation', 'conversionExplanation', 'calculationExplanation', 'rulerLabel', 'equivalenceLabel']) requireText(catalog.quantityContent.lengths, field, 'quantityContent.lengths')
  if (!isRecord(catalog.strategySteps) || !isRecord(catalog.strategySteps.placeValue) || !isRecord(catalog.strategySteps.rounding) || !isRecord(catalog.strategySteps.arithmetic1000) || !isRecord(catalog.strategySteps.writtenAddition) || !isRecord(catalog.strategySteps.writtenSubtraction)) fail('strategySteps fehlt')
  for (const field of ['digitPrompt', 'digitError', 'digitSuccess', 'valuePrompt', 'valueError', 'valueSuccess']) requireText(catalog.strategySteps.placeValue, field, 'strategySteps.placeValue')
  for (const field of ['neighborsPrompt', 'neighborsError', 'neighborsSuccess', 'resultPrompt', 'resultError', 'resultSuccess', 'reasonPrompt', 'reasonError', 'reasonSuccess', 'closerLower', 'closerUpper', 'halfwayUp', 'wrongLower', 'wrongUpper']) requireText(catalog.strategySteps.rounding, field, 'strategySteps.rounding')
  for (const field of ['bridgePrompt', 'bridgeError', 'bridgeSuccess', 'resultPrompt', 'resultError', 'resultSuccess']) requireText(catalog.strategySteps.arithmetic1000, field, 'strategySteps.arithmetic1000')
  for (const field of ['onesPrompt', 'onesError', 'onesSuccess', 'carryPrompt', 'carryError', 'carrySuccess', 'tensPrompt', 'tensError', 'tensSuccess', 'hundredsPrompt', 'hundredsError', 'hundredsSuccess']) requireText(catalog.strategySteps.writtenAddition, field, 'strategySteps.writtenAddition')
  for (const field of ['unbundlePrompt', 'unbundleError', 'unbundleSuccess', 'onesPrompt', 'onesError', 'onesSuccess', 'tensPrompt', 'tensError', 'tensSuccess', 'hundredsPrompt', 'hundredsError', 'hundredsSuccess', 'checkPrompt', 'checkError', 'checkSuccess']) requireText(catalog.strategySteps.writtenSubtraction, field, 'strategySteps.writtenSubtraction')
  if (!Array.isArray(catalog.wordProblems) || catalog.wordProblems.length === 0) fail('wordProblems fehlt')
  requireUnique(catalog.wordProblems.map((template) => template.id), 'Sachaufgaben-IDs')
  catalog.wordProblems.forEach((template) => validateWordProblem(template, numberRange))
  if (!isRecord(catalog.wordProblemSteps)) fail('wordProblemSteps fehlt')
  for (const field of ['questionPrompt', 'questionError', 'questionSuccess', 'relevantPrompt', 'relevantError', 'relevantSuccess', 'modelPrompt', 'modelExplorePrompt', 'modelContinueLabel', 'modelError', 'modelSuccess', 'equationPrompt', 'equationError', 'equationSuccess', 'calculatePrompt', 'calculateError', 'calculateSuccess', 'secondEquationPrompt', 'secondEquationError', 'secondEquationSuccess', 'finalCalculationPrompt', 'finalCalculationError', 'finalCalculationSuccess', 'checkPrompt', 'checkError', 'checkSuccess', 'plausibilityError', 'plausibilitySuccess']) {
    requireText(catalog.wordProblemSteps, field, 'wordProblemSteps')
  }
  const progressionIds = ['understand-story', 'identify-unknown', 'identify-relevant', 'choose-model', 'form-equation', 'calculate', 'check-result', 'answer-in-context']
  if (!Array.isArray(catalog.wordProblemSteps.modellingProgression) || catalog.wordProblemSteps.modellingProgression.length !== progressionIds.length ||
    !catalog.wordProblemSteps.modellingProgression.every((stage, index) => isRecord(stage) && stage.stage === index + 1 &&
      stage.id === progressionIds[index] && isText(stage.childPrompt) && isText(stage.purpose))) {
    fail('wordProblemSteps.modellingProgression ist unvollständig')
  }
  const expectedRuntime = [
    ['question', 'identify-unknown', 'always', 'choice', 'none'],
    ['relevant', 'identify-relevant', 'always', 'choice', 'none'],
    ['model', 'choose-model', 'always', 'model-by-difficulty', 'word-model'],
    ['equation', 'form-equation', 'always', 'choice', 'none'],
    ['calculate', 'calculate', 'always', 'number', 'none'],
    ['second-equation', 'form-equation', 'second-operation', 'choice', 'none'],
    ['final-calculation', 'calculate', 'second-operation', 'number', 'none'],
    ['plausibility', 'check-result', 'always', 'choice', 'none'],
    ['check', 'answer-in-context', 'always', 'choice', 'none']
  ]
  if (!Array.isArray(catalog.wordProblemSteps.runtimeSequence) || catalog.wordProblemSteps.runtimeSequence.length !== expectedRuntime.length ||
    !catalog.wordProblemSteps.runtimeSequence.every((step, index) => isRecord(step) &&
      [step.id, step.progressionId, step.condition, step.interaction, step.representation].every((entry, fieldIndex) => entry === expectedRuntime[index][fieldIndex]))) {
    fail('wordProblemSteps.runtimeSequence weicht vom vollständigen Modellierungsablauf ab')
  }
  const modelInteractions = catalog.wordProblemSteps.modelInteractionByDifficulty
  if (!isRecord(modelInteractions) || modelInteractions['1'] !== 'continue' || modelInteractions['2'] !== 'choice' || modelInteractions['3'] !== 'choice') {
    fail('wordProblemSteps.modelInteractionByDifficulty ist ungültig')
  }
  validateSymmetry(catalog.symmetry)
  validateSpatialViews(catalog.spatialViews)
  validateSpatialRotations(catalog.spatialRotations)
  validateSpatialFolding(catalog.spatialFolding)
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
