import fallbackCatalogJson from './task-catalog.fallback.json'
import { SKILL_IDS, type LearningPhase, type SkillId } from '../domain/types'

export const TASK_CATALOG_URL = '/content/task-catalog.json'
export const CATALOG_SCHEMA_VERSION = 5
export const TASK_CATALOG_ID = 'nrw-klasse3-foerderkern'

export type ContentStatus = 'draft' | 'ready-for-review' | 'active' | 'disabled'
export type CatalogStatus = ContentStatus
export type CatalogFieldUsage = 'runtime' | 'review' | 'planned'
export type SkillReleaseStatus = ContentStatus

export interface ProcessCompetency {
  id: 'problem-solving' | 'modelling' | 'reasoning' | 'representing' | 'communicating'
  elicitedBy: string
}

export interface CatalogMetadata {
  catalogId: string
  catalogVersion: string
  schemaVersion: number
  releasedAt: string
  status: CatalogStatus
}

export interface DifficultyBounds {
  minLevel: 1 | 2 | 3
  maxLevel: 1 | 2 | 3
  minValue: number
  maxValue: number
}

export interface CatalogSkill {
  id: SkillId
  label: string
  curriculumArea: string
  processCompetencies: ProcessCompetency[]
  supportGoal: string
  prerequisites: string[]
  learningPhases: CatalogLearningPhase[]
  difficultyLevels: [CatalogDifficultyLevel, CatalogDifficultyLevel, CatalogDifficultyLevel]
  representations: string[]
  misconceptions: string[]
  hints: [string, string]
  workedExample: string
  prompt: string
  successFeedback: string
  errorFeedback: string
  explanation: string
  remediation: CatalogRemediation
  transferPrompt: string
  successCriteria: string[]
  releaseStatus: SkillReleaseStatus
  halfExplanation?: string
  difficultyBounds: DifficultyBounds
}

export interface CatalogDifficultyLevel {
  level: 1 | 2 | 3
  description: string
  numberRange: string
  representation: 'always' | 'hint' | 'none'
  learningPhase: LearningPhase
  requirements: {
    requiresNeighborIdentification: boolean
    requiresRepresentationChoice: boolean
    requiresOperationChoice: boolean
    requiresJustification: boolean
    requiresMultiStepCalculation: boolean
  }
}

export interface CatalogLearningPhase {
  id: LearningPhase
  goal: string
  exerciseTypes: string[]
  releaseStatus: ContentStatus
}

export interface CatalogRemediation {
  strategy: string
  foundationStrategy: string
  representation: string
  keepSubskill: boolean
}

export interface PreparedTopic {
  id: 'spatial-reasoning'
  label: string
  curriculumArea: string
  supportGoal: string
  prerequisites: string[]
  representations: string[]
  misconceptions: string[]
  progression: string[]
  remediation: string
  releaseStatus: 'disabled'
}

export interface QuantityContent {
  money: {
    countPrompt: string
    changePrompt: string
    countExplanation: string
    changeExplanation: string
    coinsLabel: string
    priceLabel: string
    paidLabel: string
  }
  lengths: {
    readPrompt: string
    toCentimetersPrompt: string
    toMetersPrompt: string
    calculationPrompt: string
    readExplanation: string
    conversionExplanation: string
    calculationExplanation: string
    rulerLabel: string
    equivalenceLabel: string
  }
}

export interface StrategySteps {
  placeValue: {
    digitPrompt: string
    digitError: string
    digitSuccess: string
    valuePrompt: string
    valueError: string
    valueSuccess: string
  }
  rounding: {
    neighborsPrompt: string
    neighborsError: string
    neighborsSuccess: string
    resultPrompt: string
    resultError: string
    resultSuccess: string
    reasonPrompt: string
    reasonError: string
    reasonSuccess: string
    closerLower: string
    closerUpper: string
    halfwayUp: string
    wrongLower: string
    wrongUpper: string
  }
  arithmetic1000: {
    bridgePrompt: string
    bridgeError: string
    bridgeSuccess: string
    resultPrompt: string
    resultError: string
    resultSuccess: string
  }
}

export interface WordProblemTemplate {
  id: string
  relationship: 'join' | 'separate' | 'combine' | 'compare' | 'complement' | 'equal-groups' | 'sharing'
  operation: '+' | '−' | '·' | ':'
  story: string
  question: string
  questionDistractors: [string, string]
  relationshipLabel: string
  relationshipDistractors: [string, string]
  relevant: string
  irrelevant?: string
  answer: string
  minDifficulty: 1 | 2 | 3
  representation: 'bar-model' | 'groups'
  operationHint: string
  operationError: string
  firstRange: { min: number; max: number }
  secondRange: { min: number; max: number }
  secondOperation?: '+' | '−'
  thirdRange?: { min: number; max: number }
  plausibility: {
    prompt: string
    options: [
      { label: string; correct: boolean },
      { label: string; correct: boolean },
      { label: string; correct: boolean }
    ]
  }
}

export interface WordProblemSteps {
  questionPrompt: string
  questionError: string
  questionSuccess: string
  relevantPrompt: string
  relevantDistractors: [string, string]
  relevantError: string
  relevantSuccess: string
  relationshipPrompt: string
  relationshipError: string
  relationshipSuccess: string
  operationPrompt: string
  operationOptions: Array<{ value: '+' | '−' | '·' | ':'; label: string }>
  additionError: string
  subtractionError: string
  multiplicationError: string
  operationSuccess: string
  representationPrompt: string
  barModelLabel: string
  groupsLabel: string
  noModelLabel: string
  representationError: string
  representationSuccess: string
  calculatePrompt: string
  calculateError: string
  calculateSuccess: string
  secondOperationPrompt: string
  secondOperationError: string
  secondOperationSuccess: string
  finalCalculationPrompt: string
  finalCalculationError: string
  finalCalculationSuccess: string
  checkPrompt: string
  checkError: string
  checkSuccess: string
  plausibilityError: string
  plausibilitySuccess: string
  additionHint: string
  subtractionHint: string
  multiplicationHint: string
}

export interface SymmetryTemplate {
  id: string
  difficulty: 1 | 2 | 3
  axis: 'vertical' | 'horizontal'
  grid: number[][]
  shiftGrid: number[][]
  wrongAxisGrid: number[][]
}

export interface TaskCatalog extends CatalogMetadata {
  fieldUsage: Record<'workedExample' | 'remediation' | 'transferPrompt' | 'processCompetencies' | 'learningPhases' | 'difficultyLevels' | 'representations' | 'misconceptions' | 'successCriteria' | 'successFeedback' | 'errorFeedback' | 'releaseStatus', CatalogFieldUsage>
  numberRange: { min: number; max: number }
  skills: CatalogSkill[]
  preparedTopics: PreparedTopic[]
  quantityContent: QuantityContent
  strategySteps: StrategySteps
  wordProblems: WordProblemTemplate[]
  wordProblemSteps: WordProblemSteps
  symmetry: {
    optionLabels: [string, string, string]
    templates: SymmetryTemplate[]
  }
}

type FetchCatalog = (input: string) => Promise<{ ok: boolean; json: () => Promise<unknown> }>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

const KNOWN_PLACEHOLDERS = new Set([
  'answer', 'answerSentence', 'axis', 'bridge', 'digit', 'dividend', 'divisor', 'first', 'hundreds',
  'hundredsValue', 'irrelevant', 'lower', 'lowerDistance', 'number', 'ones', 'operation',
  'operationHint', 'position', 'quotient', 'result', 'second', 'story', 'strategy',
  'sumExpression', 'target', 'taskPrompt', 'tens', 'tensValue', 'third', 'total', 'upper', 'upperDistance',
  'intermediate', 'secondOperation', 'quantityExplanation', 'amount', 'price', 'paid', 'change',
  'length', 'firstLength', 'secondLength', 'answerLength'
])

function hasOnlyKnownPlaceholders(value: unknown): boolean {
  for (const match of JSON.stringify(value).matchAll(/\{([a-zA-Z]+)\}/g)) {
    if (!KNOWN_PLACEHOLDERS.has(match[1] as string)) return false
  }
  return true
}

function isRange(value: unknown, outer: { min: number; max: number }): value is { min: number; max: number } {
  return isRecord(value) && Number.isInteger(value.min) && Number.isInteger(value.max) &&
    (value.min as number) >= outer.min && (value.max as number) <= outer.max && (value.min as number) <= (value.max as number)
}

function isGrid(value: unknown, size: number): value is number[][] {
  return Array.isArray(value) && value.length === size && value.every((row) =>
    Array.isArray(row) && row.length === size && row.every((cell) => cell === 0 || cell === 1)
  )
}

function mirror(grid: number[][]): number[][] {
  return grid.map((row) => [...row].reverse())
}

function flip(grid: number[][]): number[][] {
  return [...grid].reverse().map((row) => [...row])
}

function hasThreeDistinctSymmetryVariants(grid: number[][]): boolean {
  return new Set([grid, mirror(grid), flip(grid)].map((variant) => JSON.stringify(variant))).size === 3
}

const REQUIREMENT_FIELDS = [
  'requiresNeighborIdentification',
  'requiresRepresentationChoice',
  'requiresOperationChoice',
  'requiresJustification',
  'requiresMultiStepCalculation'
] as const

function hasValidRequirements(value: unknown): boolean {
  return isRecord(value) && REQUIREMENT_FIELDS.every((field) => typeof value[field] === 'boolean')
}

const LEARNING_PHASES: LearningPhase[] = ['activate', 'understand', 'guided-practice', 'independent-practice', 'automate', 'transfer']
const CONTENT_STATUSES: ContentStatus[] = ['draft', 'ready-for-review', 'active', 'disabled']

function isLearningPhase(value: unknown): value is CatalogLearningPhase {
  return isRecord(value) && LEARNING_PHASES.includes(value.id as LearningPhase) && isNonEmptyString(value.goal) &&
    Array.isArray(value.exerciseTypes) && value.exerciseTypes.length > 0 && value.exerciseTypes.every(isNonEmptyString) &&
    CONTENT_STATUSES.includes(value.releaseStatus as ContentStatus)
}

function isRemediation(value: unknown): value is CatalogRemediation {
  return isRecord(value) && isNonEmptyString(value.strategy) && isNonEmptyString(value.foundationStrategy) &&
    isNonEmptyString(value.representation) && typeof value.keepSubskill === 'boolean'
}

function isSkill(value: unknown, numberRange: { min: number; max: number }): value is CatalogSkill {
  if (!isRecord(value) || !SKILL_IDS.includes(value.id as SkillId)) return false
  if (![value.label, value.curriculumArea, value.supportGoal, value.workedExample, value.prompt, value.successFeedback, value.errorFeedback, value.explanation, value.transferPrompt].every(isNonEmptyString)) return false
  if (!Array.isArray(value.processCompetencies) || !value.processCompetencies.every((competency) =>
    isRecord(competency) && ['problem-solving', 'modelling', 'reasoning', 'representing', 'communicating'].includes(competency.id as string) && isNonEmptyString(competency.elicitedBy)
  )) return false
  if (!Array.isArray(value.prerequisites) || !value.prerequisites.every(isNonEmptyString)) return false
  if (!Array.isArray(value.learningPhases) || value.learningPhases.length !== LEARNING_PHASES.length || !value.learningPhases.every(isLearningPhase) ||
    new Set(value.learningPhases.map((phase) => (phase as CatalogLearningPhase).id)).size !== LEARNING_PHASES.length) return false
  if (!Array.isArray(value.representations) || value.representations.length === 0 || !value.representations.every(isNonEmptyString)) return false
  if (!Array.isArray(value.difficultyLevels) || value.difficultyLevels.length !== 3 || !value.difficultyLevels.every((level, index) =>
    isRecord(level) && level.level === index + 1 && isNonEmptyString(level.description) && isNonEmptyString(level.numberRange) &&
    ['always', 'hint', 'none'].includes(level.representation as string) && LEARNING_PHASES.includes(level.learningPhase as LearningPhase) && hasValidRequirements(level.requirements)
  )) return false
  if (!CONTENT_STATUSES.includes(value.releaseStatus as ContentStatus)) return false
  if (!Array.isArray(value.misconceptions) || value.misconceptions.length === 0 || !value.misconceptions.every(isNonEmptyString)) return false
  if (!Array.isArray(value.hints) || value.hints.length !== 2 || !value.hints.every(isNonEmptyString)) return false
  if (!Array.isArray(value.successCriteria) || value.successCriteria.length === 0 || !value.successCriteria.every(isNonEmptyString) || !isRemediation(value.remediation)) return false
  if (!isRecord(value.difficultyBounds)) return false
  const bounds = value.difficultyBounds
  return Number.isInteger(bounds.minLevel) && Number.isInteger(bounds.maxLevel) &&
    (bounds.minLevel as number) >= 1 && (bounds.maxLevel as number) <= 3 &&
    (bounds.minLevel as number) <= (bounds.maxLevel as number) &&
    Number.isFinite(bounds.minValue) && Number.isFinite(bounds.maxValue) &&
    (bounds.minValue as number) >= numberRange.min && (bounds.maxValue as number) <= numberRange.max &&
    (bounds.minValue as number) <= (bounds.maxValue as number) &&
    (value.halfExplanation === undefined || isNonEmptyString(value.halfExplanation))
}

function isWordProblem(value: unknown, numberRange: { min: number; max: number }): value is WordProblemTemplate {
  if (!isRecord(value) || !isNonEmptyString(value.id) || !['+', '−', '·', ':'].includes(value.operation as string)) return false
  if (!['join', 'separate', 'combine', 'compare', 'complement', 'equal-groups', 'sharing'].includes(value.relationship as string)) return false
  if (![value.story, value.question, value.relationshipLabel, value.relevant, value.answer, value.operationHint, value.operationError].every(isNonEmptyString)) return false
  if (!Array.isArray(value.questionDistractors) || value.questionDistractors.length !== 2 || !value.questionDistractors.every(isNonEmptyString)) return false
  if (!Array.isArray(value.relationshipDistractors) || value.relationshipDistractors.length !== 2 || !value.relationshipDistractors.every(isNonEmptyString)) return false
  if (new Set([value.question, ...value.questionDistractors]).size !== 3 || new Set([value.relationshipLabel, ...value.relationshipDistractors]).size !== 3) return false
  if (![1, 2, 3].includes(value.minDifficulty as number) || !['bar-model', 'groups'].includes(value.representation as string)) return false
  if (!isRange(value.firstRange, numberRange) || !isRange(value.secondRange, numberRange)) return false
  const hasSecondStep = value.secondOperation !== undefined || value.thirdRange !== undefined
  if (hasSecondStep && (!['+', '−'].includes(value.secondOperation as string) || !isRange(value.thirdRange, numberRange))) return false
  if (hasSecondStep && (!(value.story as string).includes('{third}') || value.minDifficulty !== 3)) return false
  if (!(value.story as string).includes('{first}') || !(value.answer as string).includes('{result}')) return false
  if (value.relationship === 'sharing' ? !(value.story as string).includes('{total}') : !(value.story as string).includes('{second}')) return false
  const firstRange = value.firstRange as { min: number; max: number }
  const secondRange = value.secondRange as { min: number; max: number }
  if (!isRecord(value.plausibility) || !isNonEmptyString(value.plausibility.prompt) || !Array.isArray(value.plausibility.options) || value.plausibility.options.length !== 3) return false
  const plausibilityOptions = value.plausibility.options
  if (!plausibilityOptions.every((option) => isRecord(option) && isNonEmptyString(option.label) && typeof option.correct === 'boolean')) return false
  if (plausibilityOptions.filter((option) => (option as { correct: boolean }).correct).length !== 1) return false
  if (new Set(plausibilityOptions.map((option) => (option as { label: string }).label)).size !== 3) return false
  const firstResults = [firstRange.min, firstRange.max].flatMap((first) => [secondRange.min, secondRange.max].map((second) =>
    value.operation === '+' ? first + second : value.operation === '−' ? first - second : value.operation === ':' ? second : first * second
  ))
  const results = hasSecondStep
    ? firstResults.flatMap((intermediate) => {
        const thirdRange = value.thirdRange as { min: number; max: number }
        return [thirdRange.min, thirdRange.max].map((third) => value.secondOperation === '+' ? intermediate + third : intermediate - third)
      })
    : firstResults
  const minResult = Math.min(...results)
  const maxResult = Math.max(...results)
  return minResult >= numberRange.min && maxResult <= numberRange.max
}

function isWordProblemSteps(value: unknown): value is WordProblemSteps {
  if (!isRecord(value)) return false
  const stringFields = [
    'questionPrompt', 'questionError', 'questionSuccess', 'relevantPrompt', 'relevantError', 'relevantSuccess',
    'relationshipPrompt', 'relationshipError', 'relationshipSuccess',
    'operationPrompt', 'additionError', 'subtractionError', 'multiplicationError', 'operationSuccess',
    'representationPrompt', 'barModelLabel', 'groupsLabel', 'noModelLabel', 'representationError', 'representationSuccess',
    'calculatePrompt', 'calculateError', 'calculateSuccess',
    'secondOperationPrompt', 'secondOperationError', 'secondOperationSuccess',
    'finalCalculationPrompt', 'finalCalculationError', 'finalCalculationSuccess',
    'checkPrompt', 'checkError', 'checkSuccess',
    'plausibilityError', 'plausibilitySuccess',
    'additionHint', 'subtractionHint', 'multiplicationHint'
  ]
  if (!stringFields.every((field) => isNonEmptyString(value[field]))) return false
  if (!Array.isArray(value.relevantDistractors) || value.relevantDistractors.length !== 2 || !value.relevantDistractors.every(isNonEmptyString)) return false
  if (!Array.isArray(value.operationOptions) || value.operationOptions.length !== 4 || !value.operationOptions.every((option) =>
    isRecord(option) && ['+', '−', '·', ':'].includes(option.value as string) && isNonEmptyString(option.label)
  )) return false
  const operations = value.operationOptions as Array<{ value: string; label: string }>
  return new Set(operations.map((option) => option.value)).size === 4 && new Set(operations.map((option) => option.label)).size === 4
}

export function validateTaskCatalog(value: unknown): value is TaskCatalog {
  if (!isRecord(value) || value.schemaVersion !== CATALOG_SCHEMA_VERSION || !isRecord(value.numberRange)) return false
  if (!isNonEmptyString(value.catalogVersion) || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(value.catalogVersion)) return false
  if (value.catalogId !== TASK_CATALOG_ID) return false
  if (!isNonEmptyString(value.releasedAt) || !/^\d{4}-\d{2}-\d{2}$/.test(value.releasedAt) || Number.isNaN(Date.parse(`${value.releasedAt}T00:00:00Z`))) return false
  if (!CONTENT_STATUSES.includes(value.status as ContentStatus)) return false
  if (!isRecord(value.fieldUsage)) return false
  const fieldUsage = value.fieldUsage
  const usageFields = ['workedExample', 'remediation', 'transferPrompt', 'processCompetencies', 'learningPhases', 'difficultyLevels', 'representations', 'misconceptions', 'successCriteria', 'successFeedback', 'errorFeedback', 'releaseStatus']
  if (!usageFields.every((field) => ['runtime', 'review', 'planned'].includes(fieldUsage[field] as string))) return false
  const numberRange = value.numberRange
  if (!Number.isInteger(numberRange.min) || !Number.isInteger(numberRange.max) || numberRange.min !== 0 || numberRange.max !== 1000) return false
  if (!Array.isArray(value.skills) || value.skills.length !== SKILL_IDS.length || !value.skills.every((skill) => isSkill(skill, numberRange as { min: number; max: number }))) return false
  const skillIds = value.skills.map((skill) => (skill as CatalogSkill).id)
  if (new Set(skillIds).size !== SKILL_IDS.length || !SKILL_IDS.every((id) => skillIds.includes(id))) return false
  if (!Array.isArray(value.preparedTopics) || value.preparedTopics.length !== 1 || !value.preparedTopics.every((topic) =>
    isRecord(topic) && topic.id === 'spatial-reasoning' &&
    [topic.label, topic.curriculumArea, topic.supportGoal, topic.remediation].every(isNonEmptyString) &&
    ['prerequisites', 'representations', 'misconceptions', 'progression'].every((field) => Array.isArray(topic[field]) && (topic[field] as unknown[]).length > 0 && (topic[field] as unknown[]).every(isNonEmptyString)) &&
    topic.releaseStatus === 'disabled'
  )) return false
  if (new Set(value.preparedTopics.map((topic) => (topic as PreparedTopic).id)).size !== 1) return false
  if (!isRecord(value.quantityContent) || !isRecord(value.quantityContent.money) || !isRecord(value.quantityContent.lengths)) return false
  const quantityContent = value.quantityContent
  const moneyContent = quantityContent.money as Record<string, unknown>
  const lengthsContent = quantityContent.lengths as Record<string, unknown>
  if (!['countPrompt', 'changePrompt', 'countExplanation', 'changeExplanation', 'coinsLabel', 'priceLabel', 'paidLabel'].every((field) => isNonEmptyString(moneyContent[field]))) return false
  if (!['readPrompt', 'toCentimetersPrompt', 'toMetersPrompt', 'calculationPrompt', 'readExplanation', 'conversionExplanation', 'calculationExplanation', 'rulerLabel', 'equivalenceLabel'].every((field) => isNonEmptyString(lengthsContent[field]))) return false
  if (!isRecord(value.strategySteps) || !isRecord(value.strategySteps.placeValue) || !isRecord(value.strategySteps.rounding) || !isRecord(value.strategySteps.arithmetic1000)) return false
  const placeValueSteps = value.strategySteps.placeValue
  const roundingSteps = value.strategySteps.rounding
  const arithmeticSteps = value.strategySteps.arithmetic1000
  if (!['digitPrompt', 'digitError', 'digitSuccess', 'valuePrompt', 'valueError', 'valueSuccess'].every((field) => isNonEmptyString(placeValueSteps[field]))) return false
  if (!['neighborsPrompt', 'neighborsError', 'neighborsSuccess', 'resultPrompt', 'resultError', 'resultSuccess', 'reasonPrompt', 'reasonError', 'reasonSuccess', 'closerLower', 'closerUpper', 'halfwayUp', 'wrongLower', 'wrongUpper'].every((field) => isNonEmptyString(roundingSteps[field]))) return false
  if (!['bridgePrompt', 'bridgeError', 'bridgeSuccess', 'resultPrompt', 'resultError', 'resultSuccess'].every((field) => isNonEmptyString(arithmeticSteps[field]))) return false
  if (!Array.isArray(value.wordProblems) || value.wordProblems.length === 0 || !value.wordProblems.every((template) => isWordProblem(template, numberRange as { min: number; max: number }))) return false
  if (new Set(value.wordProblems.map((template) => (template as WordProblemTemplate).id)).size !== value.wordProblems.length) return false
  if (!isWordProblemSteps(value.wordProblemSteps) || !isRecord(value.symmetry)) return false
  if (!Array.isArray(value.symmetry.optionLabels) || value.symmetry.optionLabels.length !== 3 || !value.symmetry.optionLabels.every(isNonEmptyString)) return false
  if (new Set(value.symmetry.optionLabels).size !== 3) return false
  if (!Array.isArray(value.symmetry.templates) || value.symmetry.templates.length === 0) return false
  const symmetryIds = value.symmetry.templates.map((template) => isRecord(template) ? template.id : undefined)
  if (new Set(symmetryIds).size !== value.symmetry.templates.length) return false
  return hasOnlyKnownPlaceholders(value) && value.symmetry.templates.every((template) => {
    if (!isRecord(template) || !isNonEmptyString(template.id) || ![1, 2, 3].includes(template.difficulty as number) || !['vertical', 'horizontal'].includes(template.axis as string)) return false
    const size = (template.difficulty as number) + 2
    if (!isGrid(template.grid, size) || !isGrid(template.shiftGrid, size) || !isGrid(template.wrongAxisGrid, size) || !hasThreeDistinctSymmetryVariants(template.grid)) return false
    const correct = template.axis === 'vertical' ? mirror(template.grid) : flip(template.grid)
    const expectedWrongAxis = template.axis === 'vertical' ? flip(template.grid) : mirror(template.grid)
    return JSON.stringify(template.wrongAxisGrid) === JSON.stringify(expectedWrongAxis) &&
      new Set([correct, template.shiftGrid, template.wrongAxisGrid].map((grid) => JSON.stringify(grid))).size === 3
  })
}

const fallbackCandidate: unknown = fallbackCatalogJson
if (!validateTaskCatalog(fallbackCandidate)) throw new Error('Der eingebaute Aufgabenkatalog ist ungültig.')
export const FALLBACK_TASK_CATALOG: TaskCatalog = fallbackCandidate

let activeCatalog = FALLBACK_TASK_CATALOG

export function setTaskCatalog(catalog: TaskCatalog): void {
  activeCatalog = catalog
}

export function getTaskCatalog(): TaskCatalog {
  return activeCatalog
}

export function getActiveCatalogMetadata(): CatalogMetadata {
  const { catalogId, catalogVersion, schemaVersion, releasedAt, status } = activeCatalog
  return { catalogId, catalogVersion, schemaVersion, releasedAt, status }
}

export function getSkillContent(skillId: SkillId): CatalogSkill {
  return activeCatalog.skills.find((skill) => skill.id === skillId) ?? FALLBACK_TASK_CATALOG.skills.find((skill) => skill.id === skillId)!
}

export function isSkillEnabled(skillId: SkillId): boolean {
  return getSkillContent(skillId).releaseStatus === 'active'
}

export function renderCatalogText(template: string, values: Record<string, number | string>): string {
  return template.replace(/\{([a-zA-Z]+)\}/g, (placeholder, key: string) => key in values ? String(values[key]) : placeholder)
}

export function resolveTaskCatalog(candidate: unknown, allowDraft = import.meta.env.DEV): TaskCatalog {
  return validateTaskCatalog(candidate) && (allowDraft || !['draft', 'disabled'].includes(candidate.status)) ? candidate : FALLBACK_TASK_CATALOG
}

export async function loadTaskCatalog(fetchCatalog: FetchCatalog = (input) => fetch(input)): Promise<TaskCatalog> {
  try {
    const response = await fetchCatalog(TASK_CATALOG_URL)
    if (!response.ok) return FALLBACK_TASK_CATALOG
    return resolveTaskCatalog(await response.json())
  } catch {
    return FALLBACK_TASK_CATALOG
  }
}

export async function initializeTaskCatalog(fetchCatalog?: FetchCatalog): Promise<TaskCatalog> {
  const catalog = await loadTaskCatalog(fetchCatalog)
  setTaskCatalog(catalog)
  return catalog
}
