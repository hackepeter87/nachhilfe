import fallbackCatalogJson from './task-catalog.fallback.v1.json'
import { SKILL_IDS, type SkillId } from '../domain/types'

export const TASK_CATALOG_URL = '/content/task-catalog.v1.json'

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
  processCompetencies: string[]
  supportGoal: string
  prerequisites: string[]
  difficultyLevels: [CatalogDifficultyLevel, CatalogDifficultyLevel, CatalogDifficultyLevel]
  representations: string[]
  misconceptions: string[]
  hints: [string, string]
  workedExample: string
  prompt: string
  successFeedback: string
  errorFeedback: string
  explanation: string
  remediation: string
  transferPrompt: string
  releaseStatus: 'active' | 'planned'
  halfExplanation?: string
  difficultyBounds: DifficultyBounds
}

export interface CatalogDifficultyLevel {
  level: 1 | 2 | 3
  description: string
  numberRange: string
  representation: 'always' | 'hint' | 'none'
  cognitiveSteps: number
}

export interface WordProblemTemplate {
  id: string
  relationship: 'join' | 'separate' | 'combine' | 'compare' | 'complement' | 'equal-groups' | 'sharing'
  operation: '+' | '−' | '·'
  story: string
  question: string
  relevant: string
  irrelevant?: string
  answer: string
  minDifficulty: 1 | 2 | 3
  representation: 'bar-model' | 'groups'
  operationHint: string
  operationError: string
  firstRange: { min: number; max: number }
  secondRange: { min: number; max: number }
}

export interface WordProblemSteps {
  questionPrompt: string
  questionDistractors: [string, string]
  questionError: string
  questionSuccess: string
  relevantPrompt: string
  relevantDistractors: [string, string]
  relevantError: string
  relevantSuccess: string
  operationPrompt: string
  operationOptions: Array<{ value: '+' | '−' | '·'; label: string }>
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
  checkPrompt: string
  checkError: string
  checkSuccess: string
  plausibilityPrompt: string
  plausibleLabel: string
  tooSmallLabel: string
  tooLargeLabel: string
  plausibilityError: string
  plausibilitySuccess: string
  additionHint: string
  subtractionHint: string
  multiplicationHint: string
}

export interface SymmetryTemplate {
  id: string
  grid: number[][]
}

export interface TaskCatalog {
  version: 1
  numberRange: { min: number; max: number }
  skills: CatalogSkill[]
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

function isRange(value: unknown, outer: { min: number; max: number }): value is { min: number; max: number } {
  return isRecord(value) && Number.isInteger(value.min) && Number.isInteger(value.max) &&
    (value.min as number) >= outer.min && (value.max as number) <= outer.max && (value.min as number) <= (value.max as number)
}

function isGrid(value: unknown): value is number[][] {
  return Array.isArray(value) && value.length === 4 && value.every((row) =>
    Array.isArray(row) && row.length === 4 && row.every((cell) => cell === 0 || cell === 1)
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

function isSkill(value: unknown, numberRange: { min: number; max: number }): value is CatalogSkill {
  if (!isRecord(value) || !SKILL_IDS.includes(value.id as SkillId)) return false
  if (![value.label, value.curriculumArea, value.supportGoal, value.workedExample, value.prompt, value.successFeedback, value.errorFeedback, value.explanation, value.remediation, value.transferPrompt].every(isNonEmptyString)) return false
  if (!Array.isArray(value.processCompetencies) || value.processCompetencies.length === 0 || !value.processCompetencies.every(isNonEmptyString)) return false
  if (!Array.isArray(value.prerequisites) || !value.prerequisites.every(isNonEmptyString)) return false
  if (!Array.isArray(value.representations) || value.representations.length === 0 || !value.representations.every(isNonEmptyString)) return false
  if (!Array.isArray(value.difficultyLevels) || value.difficultyLevels.length !== 3 || !value.difficultyLevels.every((level, index) =>
    isRecord(level) && level.level === index + 1 && isNonEmptyString(level.description) && isNonEmptyString(level.numberRange) &&
    ['always', 'hint', 'none'].includes(level.representation as string) && Number.isInteger(level.cognitiveSteps) && (level.cognitiveSteps as number) >= 1
  )) return false
  if (value.releaseStatus !== 'active' && value.releaseStatus !== 'planned') return false
  if (!Array.isArray(value.misconceptions) || value.misconceptions.length === 0 || !value.misconceptions.every(isNonEmptyString)) return false
  if (!Array.isArray(value.hints) || value.hints.length !== 2 || !value.hints.every(isNonEmptyString)) return false
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
  if (!isRecord(value) || !isNonEmptyString(value.id) || !['+', '−', '·'].includes(value.operation as string)) return false
  if (!['join', 'separate', 'combine', 'compare', 'complement', 'equal-groups', 'sharing'].includes(value.relationship as string)) return false
  if (![value.story, value.question, value.relevant, value.answer, value.operationHint, value.operationError].every(isNonEmptyString)) return false
  if (![1, 2, 3].includes(value.minDifficulty as number) || !['bar-model', 'groups'].includes(value.representation as string)) return false
  if (!isRange(value.firstRange, numberRange) || !isRange(value.secondRange, numberRange)) return false
  if (!(value.story as string).includes('{first}') || !(value.story as string).includes('{second}') || !(value.answer as string).includes('{result}')) return false
  return value.operation !== '−' || value.firstRange.min >= value.secondRange.max
}

function isWordProblemSteps(value: unknown): value is WordProblemSteps {
  if (!isRecord(value)) return false
  const stringFields = [
    'questionPrompt', 'questionError', 'questionSuccess', 'relevantPrompt', 'relevantError', 'relevantSuccess',
    'operationPrompt', 'additionError', 'subtractionError', 'multiplicationError', 'operationSuccess',
    'representationPrompt', 'barModelLabel', 'groupsLabel', 'noModelLabel', 'representationError', 'representationSuccess',
    'calculatePrompt', 'calculateError', 'calculateSuccess', 'checkPrompt', 'checkError', 'checkSuccess',
    'plausibilityPrompt', 'plausibleLabel', 'tooSmallLabel', 'tooLargeLabel', 'plausibilityError', 'plausibilitySuccess',
    'additionHint', 'subtractionHint', 'multiplicationHint'
  ]
  if (!stringFields.every((field) => isNonEmptyString(value[field]))) return false
  if (!Array.isArray(value.relevantDistractors) || value.relevantDistractors.length !== 2 || !value.relevantDistractors.every(isNonEmptyString)) return false
  if (!Array.isArray(value.questionDistractors) || value.questionDistractors.length !== 2 || !value.questionDistractors.every(isNonEmptyString)) return false
  return Array.isArray(value.operationOptions) && value.operationOptions.length === 3 && value.operationOptions.every((option) =>
    isRecord(option) && ['+', '−', '·'].includes(option.value as string) && isNonEmptyString(option.label)
  )
}

export function validateTaskCatalog(value: unknown): value is TaskCatalog {
  if (!isRecord(value) || value.version !== 1 || !isRecord(value.numberRange)) return false
  const numberRange = value.numberRange
  if (!Number.isInteger(numberRange.min) || !Number.isInteger(numberRange.max) || numberRange.min !== 0 || numberRange.max !== 1000) return false
  if (!Array.isArray(value.skills) || value.skills.length !== SKILL_IDS.length || !value.skills.every((skill) => isSkill(skill, numberRange as { min: number; max: number }))) return false
  const skillIds = value.skills.map((skill) => (skill as CatalogSkill).id)
  if (new Set(skillIds).size !== SKILL_IDS.length || !SKILL_IDS.every((id) => skillIds.includes(id))) return false
  if (!Array.isArray(value.wordProblems) || value.wordProblems.length === 0 || !value.wordProblems.every((template) => isWordProblem(template, numberRange as { min: number; max: number }))) return false
  if (new Set(value.wordProblems.map((template) => (template as WordProblemTemplate).id)).size !== value.wordProblems.length) return false
  if (!isWordProblemSteps(value.wordProblemSteps) || !isRecord(value.symmetry)) return false
  if (!Array.isArray(value.symmetry.optionLabels) || value.symmetry.optionLabels.length !== 3 || !value.symmetry.optionLabels.every(isNonEmptyString)) return false
  if (!Array.isArray(value.symmetry.templates) || value.symmetry.templates.length === 0) return false
  return value.symmetry.templates.every((template) =>
    isRecord(template) && isNonEmptyString(template.id) && isGrid(template.grid) && hasThreeDistinctSymmetryVariants(template.grid)
  )
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

export function getSkillContent(skillId: SkillId): CatalogSkill {
  return activeCatalog.skills.find((skill) => skill.id === skillId) ?? FALLBACK_TASK_CATALOG.skills.find((skill) => skill.id === skillId)!
}

export function renderCatalogText(template: string, values: Record<string, number | string>): string {
  return template.replace(/\{([a-zA-Z]+)\}/g, (placeholder, key: string) => key in values ? String(values[key]) : placeholder)
}

export function resolveTaskCatalog(candidate: unknown): TaskCatalog {
  return validateTaskCatalog(candidate) ? candidate : FALLBACK_TASK_CATALOG
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
