import fallbackCatalogJson from './task-catalog.fallback.json'
import { SKILL_IDS, type InteractionKind, type LearningAction, type LearningPhase, type SkillId } from '../domain/types'
import {
  createShiftDistractor,
  expectedAxisPosition,
  hasOccupiedAxisCell,
  isRectangularBinaryGrid,
  occupiedCellCount,
  reflectGrid,
  sourceStaysOnOneAxisSide,
  type SymmetryAxis,
  type SymmetryAxisPosition
} from '../domain/symmetry'
import {
  createCubeRotationDistractors,
  isValidCubeBuilding,
  type CubeBuilding,
  type CubeTurnDirection,
  type CubeViewDirection
} from '../domain/cubeViews'
import {
  createFoldingOutcomes,
  isValidFoldingTemplate,
  type FoldAxis,
  type FoldSide,
  type FoldingMode,
  type FoldingTemplate
} from '../domain/folding'
import { isValidDataSetTemplate, type DataSetTemplate } from '../domain/dataDisplays'
import { isValidCombinationTemplate, isValidProbabilityTemplate, type CombinationTemplate, type ProbabilityTemplate } from '../domain/chance'

export const TASK_CATALOG_URL = '/content/task-catalog.json'
export const CATALOG_SCHEMA_VERSION = 18
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

export interface RepresentationPolicy {
  rule: string
  knownValues: string
  unknownValues: string
  revealedValues: string
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
  misconceptionFeedback?: CatalogMisconceptionFeedback[]
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

export interface CatalogLearningPhaseModel {
  id: LearningPhase
  learningAction: LearningAction
  allowedInteractions: InteractionKind[]
  purpose: string
}

export interface CatalogMisconceptionFeedback {
  id: string
  misconception: string
  feedback: string
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
  time: {
    readPrompt: string
    durationPrompt: string
    readExplanation: string
    durationExplanation: string
    clockLabel: string
    durationLabel: string
  }
  mass: MeasurementQuantityContent
  capacity: MeasurementQuantityContent
}

export interface ReferenceEstimate {
  id: string
  label: string
  correct: string
  options: [string, string, string]
}

export interface MeasurementQuantityContent {
  referencePrompt: string
  complementPrompt: string
  calculationPrompt: string
  referenceExplanation: string
  complementExplanation: string
  calculationExplanation: string
  displayLabel: string
  equivalenceLabel: string
  referenceEstimates: ReferenceEstimate[]
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
  writtenAddition: {
    onesPrompt: string
    onesError: string
    onesSuccess: string
    carryPrompt: string
    carryError: string
    carrySuccess: string
    tensPrompt: string
    tensError: string
    tensSuccess: string
    hundredsPrompt: string
    hundredsError: string
    hundredsSuccess: string
  }
  writtenSubtraction: {
    unbundlePrompt: string
    unbundleError: string
    unbundleSuccess: string
    onesPrompt: string
    onesError: string
    onesSuccess: string
    tensPrompt: string
    tensError: string
    tensSuccess: string
    hundredsPrompt: string
    hundredsError: string
    hundredsSuccess: string
    checkPrompt: string
    checkError: string
    checkSuccess: string
  }
}

export type WordModelType =
  | 'change-increase'
  | 'change-decrease'
  | 'part-whole'
  | 'comparison'
  | 'missing-part'
  | 'equal-groups-total'
  | 'equal-groups-share'
  | 'increase-then-decrease'
  | 'decrease-then-increase'

export type WordUnknownQuantity = 'new-total' | 'remaining' | 'whole' | 'difference' | 'missing-part' | 'total' | 'group-size' | 'final-total'

export const WORD_MODEL_UNKNOWN_QUANTITY: Record<WordModelType, WordUnknownQuantity> = {
  'change-increase': 'new-total',
  'change-decrease': 'remaining',
  'part-whole': 'whole',
  comparison: 'difference',
  'missing-part': 'missing-part',
  'equal-groups-total': 'total',
  'equal-groups-share': 'group-size',
  'increase-then-decrease': 'final-total',
  'decrease-then-increase': 'final-total'
}

export interface WordProblemTemplate {
  id: string
  relationship: 'join' | 'separate' | 'combine' | 'compare' | 'complement' | 'equal-groups' | 'sharing'
  operation: '+' | '−' | '·' | ':'
  story: string
  question: string
  questionDistractors: [string, string]
  situation: string
  situationDistractors: [string, string]
  relevant: string
  relevantDistractors: [string, string]
  irrelevant?: string
  answer: string
  minDifficulty: 1 | 2 | 3
  modelType: WordModelType
  modelDistractors: [WordModelType, WordModelType]
  modelHint: string
  equation: string
  equationDistractors: [string, string]
  equationError: string
  firstRange: { min: number; max: number }
  secondRange: { min: number; max: number }
  secondOperation?: '+' | '−'
  secondEquation?: string
  secondEquationDistractors?: [string, string]
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
  modellingProgression: Array<{
    stage: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
    id: 'understand-story' | 'identify-unknown' | 'identify-relevant' | 'choose-model' | 'form-equation' | 'calculate' | 'check-result' | 'answer-in-context'
    childPrompt: string
    purpose: string
  }>
  runtimeSequence: Array<{
    id: 'question' | 'relevant' | 'model' | 'equation' | 'calculate' | 'second-equation' | 'final-calculation' | 'plausibility' | 'check'
    progressionId: 'identify-unknown' | 'identify-relevant' | 'choose-model' | 'form-equation' | 'calculate' | 'check-result' | 'answer-in-context'
    condition: 'always' | 'second-operation'
    interaction: 'choice' | 'number' | 'model-by-difficulty'
    representation: 'none' | 'word-model'
  }>
  modelInteractionByDifficulty: {
    '1': 'continue'
    '2': 'choice'
    '3': 'choice'
  }
  questionPrompt: string
  questionError: string
  questionSuccess: string
  relevantPrompt: string
  relevantError: string
  relevantSuccess: string
  modelPrompt: string
  modelExplorePrompt: string
  modelContinueLabel: string
  modelError: string
  modelSuccess: string
  equationPrompt: string
  equationError: string
  equationSuccess: string
  calculatePrompt: string
  calculateError: string
  calculateSuccess: string
  secondEquationPrompt: string
  secondEquationError: string
  secondEquationSuccess: string
  finalCalculationPrompt: string
  finalCalculationError: string
  finalCalculationSuccess: string
  checkPrompt: string
  checkError: string
  checkSuccess: string
  plausibilityError: string
  plausibilitySuccess: string
}

export interface SymmetryTemplate {
  id: string
  difficulty: 1 | 2 | 3
  progressionPhase: 1 | 2 | 3 | 4 | 5
  axis: SymmetryAxis
  axisPosition: SymmetryAxisPosition
  figureComplexity: 'simple' | 'connected' | 'complex'
  distractorSimilarity: 'clear' | 'plausible' | 'close'
  distractorStrategies: ['shift-within-side', 'wrong-axis']
  grid: number[][]
}

export interface SymmetryProgressionPhase {
  phase: 1 | 2 | 3 | 4 | 5
  title: string
  goal: string
  gridParity: 'even' | 'odd' | 'mixed'
  axes: SymmetryAxis[]
  axisPosition: SymmetryAxisPosition | 'mixed'
  occupiedCells: { min: number; max: number }
  figureComplexity: SymmetryTemplate['figureComplexity']
  distractorSimilarity: SymmetryTemplate['distractorSimilarity']
}

export interface SymmetryGuidance {
  hint1: string
  hint2: string
  explanation: string
  errorFeedback: string
  successFeedback: string
}

export interface CubeBuildingTemplate extends CubeBuilding {
  id: string
  difficulty: 1 | 2 | 3
}

export interface SpatialViewsContent {
  entryRationale: string
  prompt: string
  optionLabels: [string, string, string]
  directionLabels: Record<CubeViewDirection, string>
  directionGuidance: Record<CubeViewDirection, string>
  templates: CubeBuildingTemplate[]
}

export interface CubeRotationTemplate extends CubeBuilding {
  id: string
  difficulty: 1 | 2 | 3
  turn: CubeTurnDirection
}

export interface SpatialRotationsContent {
  entryRationale: string
  prompt: string
  axisLabel: string
  optionLabels: [string, string, string]
  turnLabels: Record<CubeTurnDirection, string>
  turnGuidance: Record<CubeTurnDirection, string>
  templates: CubeRotationTemplate[]
}

export interface FoldingTemplateContent extends FoldingTemplate {
  instruction: string
}

export interface SpatialFoldingContent {
  entryRationale: string
  pointPrompt: string
  cutPrompt: string
  axisLabel: string
  optionLabels: [string, string, string]
  foldLabels: Record<FoldSide, string>
  modeGuidance: Record<FoldingMode, string>
  templates: FoldingTemplateContent[]
}

export interface DataAndChartsContent {
  entryRationale: string
  valueLabel: string
  totalLabel: string
  missingLabel: string
  displayLabels: Record<'table' | 'tally' | 'pictogram' | 'bar', string>
  prompts: Record<'tableRead' | 'tallyCompare' | 'tableMissing' | 'pictogramRead' | 'barCompare' | 'representationMatch', string>
  distractorFeedback: Record<'wrongRow' | 'wrongDifference' | 'wrongCompletion' | 'wrongPictogram' | 'wrongBarDifference' | 'swappedCategories' | 'changedValue', string>
  templates: DataSetTemplate[]
}

export interface ChanceContent {
  classificationLabels: Record<'sure' | 'possible' | 'impossible', string>
  comparisonLabels: Record<'first' | 'equal' | 'second', string>
  experimentLabels: Record<'bag' | 'coin' | 'die' | 'spinner', string>
  combinationCountPrompt: string
  excludedLabel: string
  probabilityTemplates: ProbabilityTemplate[]
  combinationTemplates: CombinationTemplate[]
}

export interface PlaneGeometryContent {
  entryRationale: string
  shapeLabels: Record<'square' | 'rectangle' | 'triangle', string>
  displayLabels: Record<'shape' | 'pattern' | 'area' | 'perimeter', string>
  patternSymbols: [string, string, string, string]
}

export interface TaskCatalog extends CatalogMetadata {
  representationPolicy: RepresentationPolicy
  learningPhaseModel: CatalogLearningPhaseModel[]
  fieldUsage: Record<'representationPolicy' | 'workedExample' | 'remediation' | 'transferPrompt' | 'processCompetencies' | 'learningPhases' | 'difficultyLevels' | 'representations' | 'misconceptions' | 'successCriteria' | 'successFeedback' | 'errorFeedback' | 'releaseStatus', CatalogFieldUsage>
  numberRange: { min: number; max: number }
  skills: CatalogSkill[]
  preparedTopics: PreparedTopic[]
  quantityContent: QuantityContent
  strategySteps: StrategySteps
  wordProblems: WordProblemTemplate[]
  wordProblemSteps: WordProblemSteps
  symmetry: {
    entryRationale: string
    axisLegend: string
    optionLabels: [string, string, string]
    guidance: Record<SymmetryAxisPosition, SymmetryGuidance>
    progression: SymmetryProgressionPhase[]
    templates: SymmetryTemplate[]
  }
  spatialViews: SpatialViewsContent
  spatialRotations: SpatialRotationsContent
  spatialFolding: SpatialFoldingContent
  dataAndCharts: DataAndChartsContent
  chanceContent: ChanceContent
  planeGeometry: PlaneGeometryContent
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
  'intermediate', 'secondOperation', 'quantityExplanation', 'amount', 'price', 'paid', 'change', 'toTen', 'rest',
  'length', 'firstLength', 'secondLength', 'answerLength', 'modelHint', 'equation', 'secondEquation',
  'onesResult', 'tensResult', 'hundredsResult', 'carry', 'viewLabel', 'turnLabel', 'foldLabel',
  'category', 'larger', 'smaller', 'unitLabel', 'item', 'startTime', 'endTime', 'time', 'duration',
  'knownAmount', 'targetAmount', 'quantityAnswer', 'firstAmount', 'secondAmount'
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

function isSymmetryContent(value: unknown): value is TaskCatalog['symmetry'] {
  if (!isRecord(value) || !isNonEmptyString(value.entryRationale) || !isNonEmptyString(value.axisLegend)) return false
  if (!Array.isArray(value.optionLabels) || value.optionLabels.length !== 3 || !value.optionLabels.every(isNonEmptyString) || new Set(value.optionLabels).size !== 3) return false
  if (!isRecord(value.guidance) || !['between-cells', 'through-cells'].every((position) => {
    const guidance = (value.guidance as Record<string, unknown>)[position]
    return isRecord(guidance) && ['hint1', 'hint2', 'explanation', 'errorFeedback', 'successFeedback'].every((field) => isNonEmptyString(guidance[field]))
  })) return false
  if (!Array.isArray(value.progression) || value.progression.length !== 5) return false
  const progression = value.progression as unknown[]
  if (!progression.every((candidate, index) => {
    if (!isRecord(candidate) || candidate.phase !== index + 1 || !isNonEmptyString(candidate.title) || !isNonEmptyString(candidate.goal)) return false
    if (!['even', 'odd', 'mixed'].includes(candidate.gridParity as string) || !['between-cells', 'through-cells', 'mixed'].includes(candidate.axisPosition as string)) return false
    if (!['simple', 'connected', 'complex'].includes(candidate.figureComplexity as string) || !['clear', 'plausible', 'close'].includes(candidate.distractorSimilarity as string)) return false
    if (!Array.isArray(candidate.axes) || candidate.axes.length === 0 || !candidate.axes.every((axis) => ['vertical', 'horizontal'].includes(axis as string))) return false
    const occupied = candidate.occupiedCells
    return isRecord(occupied) && Number.isInteger(occupied.min) && Number.isInteger(occupied.max) && (occupied.min as number) > 0 && (occupied.min as number) <= (occupied.max as number)
  })) return false
  if (!Array.isArray(value.templates) || value.templates.length === 0) return false
  const ids = value.templates.map((template) => isRecord(template) ? template.id : undefined)
  if (new Set(ids).size !== value.templates.length) return false
  return value.templates.every((candidate) => {
    if (!isRecord(candidate) || !isNonEmptyString(candidate.id) || ![1, 2, 3].includes(candidate.difficulty as number) || ![1, 2, 3, 4, 5].includes(candidate.progressionPhase as number)) return false
    if (!['vertical', 'horizontal'].includes(candidate.axis as string) || !['between-cells', 'through-cells'].includes(candidate.axisPosition as string)) return false
    if (!['simple', 'connected', 'complex'].includes(candidate.figureComplexity as string) || !['clear', 'plausible', 'close'].includes(candidate.distractorSimilarity as string)) return false
    if (!Array.isArray(candidate.distractorStrategies) || JSON.stringify(candidate.distractorStrategies) !== JSON.stringify(['shift-within-side', 'wrong-axis'])) return false
    if (!isRectangularBinaryGrid(candidate.grid)) return false
    const template = candidate as unknown as SymmetryTemplate
    const phase = progression[template.progressionPhase - 1] as unknown as SymmetryProgressionPhase
    const expectedDifficulty = template.progressionPhase === 1 ? 1 : template.progressionPhase === 2 ? 2 : 3
    const axisSize = template.axis === 'vertical' ? template.grid[0]!.length : template.grid.length
    const parity = axisSize % 2 === 0 ? 'even' : 'odd'
    const occupied = occupiedCellCount(template.grid)
    if (template.difficulty !== expectedDifficulty || template.axisPosition !== expectedAxisPosition(template.grid, template.axis)) return false
    if (phase.gridParity !== 'mixed' && phase.gridParity !== parity) return false
    if (phase.axisPosition !== 'mixed' && phase.axisPosition !== template.axisPosition) return false
    if (!phase.axes.includes(template.axis) || phase.figureComplexity !== template.figureComplexity || phase.distractorSimilarity !== template.distractorSimilarity) return false
    if (occupied < phase.occupiedCells.min || occupied > phase.occupiedCells.max || !sourceStaysOnOneAxisSide(template.grid, template.axis)) return false
    if (template.axisPosition === 'through-cells' && !hasOccupiedAxisCell(template.grid, template.axis)) return false
    const shift = createShiftDistractor(template.grid, template.axis)
    if (!shift) return false
    const correct = reflectGrid(template.grid, template.axis)
    const wrongAxis = reflectGrid(template.grid, template.axis === 'vertical' ? 'horizontal' : 'vertical')
    return new Set([correct, shift, wrongAxis].map((grid) => JSON.stringify(grid))).size === 3
  })
}

function isSpatialViewsContent(value: unknown): value is SpatialViewsContent {
  if (!isRecord(value) || !isNonEmptyString(value.entryRationale) || !isNonEmptyString(value.prompt)) return false
  if (!Array.isArray(value.optionLabels) || value.optionLabels.length !== 3 || !value.optionLabels.every(isNonEmptyString) || new Set(value.optionLabels).size !== 3) return false
  const directions: CubeViewDirection[] = ['front', 'right', 'top']
  if (!isRecord(value.directionLabels) || !isRecord(value.directionGuidance)) return false
  const labels = value.directionLabels
  const guidance = value.directionGuidance
  if (!directions.every((direction) => isNonEmptyString(labels[direction]) && isNonEmptyString(guidance[direction]))) return false
  if (!Array.isArray(value.templates) || value.templates.length < 6) return false
  const ids = value.templates.map((template) => isRecord(template) ? template.id : undefined)
  if (new Set(ids).size !== value.templates.length) return false
  const difficulties = new Set<number>()
  if (!value.templates.every((candidate) => {
    if (!isRecord(candidate) || !isNonEmptyString(candidate.id) || ![1, 2, 3].includes(candidate.difficulty as number) ||
      !Number.isInteger(candidate.width) || !Number.isInteger(candidate.depth) || !Array.isArray(candidate.heights)) return false
    const template = candidate as unknown as CubeBuildingTemplate
    difficulties.add(template.difficulty)
    const count = template.heights.reduce((sum, height) => sum + height, 0)
    const bounds = template.difficulty === 1 ? [2, 3] : template.difficulty === 2 ? [3, 4] : [4, 5]
    return isValidCubeBuilding(template) && count >= bounds[0]! && count <= bounds[1]!
  })) return false
  return [1, 2, 3].every((difficulty) => difficulties.has(difficulty))
}

function isSpatialRotationsContent(value: unknown): value is SpatialRotationsContent {
  if (!isRecord(value) || !isNonEmptyString(value.entryRationale) || !isNonEmptyString(value.prompt) || !isNonEmptyString(value.axisLabel)) return false
  if (!Array.isArray(value.optionLabels) || value.optionLabels.length !== 3 || !value.optionLabels.every(isNonEmptyString) || new Set(value.optionLabels).size !== 3) return false
  const turns: CubeTurnDirection[] = ['left', 'right']
  if (!isRecord(value.turnLabels) || !isRecord(value.turnGuidance) ||
    !turns.every((turn) => isNonEmptyString((value.turnLabels as Record<string, unknown>)[turn]) &&
      isNonEmptyString((value.turnGuidance as Record<string, unknown>)[turn]))) return false
  if (!Array.isArray(value.templates) || value.templates.length < 6) return false
  const ids = value.templates.map((template) => isRecord(template) ? template.id : undefined)
  if (new Set(ids).size !== value.templates.length) return false
  const difficulties = new Set<number>()
  const turnsByDifficulty = new Map<number, Set<CubeTurnDirection>>()
  if (!value.templates.every((candidate) => {
    if (!isRecord(candidate) || !isNonEmptyString(candidate.id) || ![1, 2, 3].includes(candidate.difficulty as number) ||
      !turns.includes(candidate.turn as CubeTurnDirection) || !Number.isInteger(candidate.width) ||
      !Number.isInteger(candidate.depth) || !Array.isArray(candidate.heights)) return false
    const template = candidate as unknown as CubeRotationTemplate
    difficulties.add(template.difficulty)
    const difficultyTurns = turnsByDifficulty.get(template.difficulty) ?? new Set<CubeTurnDirection>()
    difficultyTurns.add(template.turn)
    turnsByDifficulty.set(template.difficulty, difficultyTurns)
    const count = template.heights.reduce((sum, height) => sum + height, 0)
    const bounds = template.difficulty === 1 ? [3, 3] : template.difficulty === 2 ? [3, 4] : [4, 5]
    if (!isValidCubeBuilding(template) || count < bounds[0]! || count > bounds[1]!) return false
    try {
      createCubeRotationDistractors(template, template.turn)
      return true
    } catch {
      return false
    }
  })) return false
  return [1, 2, 3].every((difficulty) => difficulties.has(difficulty)) &&
    turnsByDifficulty.get(1)?.size === 1 && turnsByDifficulty.get(1)?.has('right') === true &&
    [2, 3].every((difficulty) => turns.every((turn) => turnsByDifficulty.get(difficulty)?.has(turn)))
}

function isSpatialFoldingContent(value: unknown): value is SpatialFoldingContent {
  if (!isRecord(value) || !isNonEmptyString(value.entryRationale) || !isNonEmptyString(value.pointPrompt) ||
    !isNonEmptyString(value.cutPrompt) || !isNonEmptyString(value.axisLabel)) return false
  if (!Array.isArray(value.optionLabels) || value.optionLabels.length !== 3 ||
    !value.optionLabels.every(isNonEmptyString) || new Set(value.optionLabels).size !== 3) return false
  const sides: FoldSide[] = ['left', 'right', 'top', 'bottom']
  const modes: FoldingMode[] = ['point-fold', 'cut-unfold']
  if (!isRecord(value.foldLabels) || !sides.every((side) => isNonEmptyString((value.foldLabels as Record<string, unknown>)[side]))) return false
  if (!isRecord(value.modeGuidance) || !modes.every((mode) => isNonEmptyString((value.modeGuidance as Record<string, unknown>)[mode]))) return false
  if (!Array.isArray(value.templates) || value.templates.length < 8) return false
  const ids = value.templates.map((template) => isRecord(template) ? template.id : undefined)
  if (new Set(ids).size !== value.templates.length) return false
  const stages = new Set<number>()
  const axesByDifficulty = new Map<number, Set<FoldAxis>>()
  if (!value.templates.every((candidate) => {
    if (!isRecord(candidate) || !isNonEmptyString(candidate.id) || !isNonEmptyString(candidate.instruction) ||
      ![1, 2, 3].includes(candidate.difficulty as number) || !modes.includes(candidate.mode as FoldingMode) ||
      !['vertical', 'horizontal'].includes(candidate.axis as FoldAxis) || !sides.includes(candidate.foldSide as FoldSide)) return false
    const template = candidate as unknown as FoldingTemplateContent
    stages.add(template.difficulty)
    const axes = axesByDifficulty.get(template.difficulty) ?? new Set<FoldAxis>()
    axes.add(template.axis)
    axesByDifficulty.set(template.difficulty, axes)
    if (!isValidFoldingTemplate(template)) return false
    if (template.difficulty === 1 && (template.mode !== 'point-fold' || template.axis !== 'vertical')) return false
    if (template.difficulty === 2 && template.mode !== 'point-fold') return false
    if (template.difficulty === 3 && template.mode !== 'cut-unfold') return false
    const outcomes = createFoldingOutcomes(template)
    return new Set([outcomes.correct, outcomes.unchanged, outcomes.shifted].map((cells) => cells.join(','))).size === 3
  })) return false
  return [1, 2, 3].every((stage) => stages.has(stage)) &&
    axesByDifficulty.get(1)?.size === 1 && axesByDifficulty.get(1)?.has('vertical') === true &&
    ['vertical', 'horizontal'].every((axis) => axesByDifficulty.get(2)?.has(axis as FoldAxis)) &&
    ['vertical', 'horizontal'].every((axis) => axesByDifficulty.get(3)?.has(axis as FoldAxis))
}

function isDataAndChartsContent(value: unknown): value is DataAndChartsContent {
  if (!isRecord(value) || !isNonEmptyString(value.entryRationale) || !isNonEmptyString(value.valueLabel) ||
    !isNonEmptyString(value.totalLabel) || !isNonEmptyString(value.missingLabel) || !isRecord(value.displayLabels)) return false
  const displayLabels = value.displayLabels
  if (!['table', 'tally', 'pictogram', 'bar'].every((key) => isNonEmptyString(displayLabels[key]))) return false
  if (!isRecord(value.prompts)) return false
  const prompts = value.prompts
  if (!['tableRead', 'tallyCompare', 'tableMissing', 'pictogramRead', 'barCompare', 'representationMatch'].every((key) => isNonEmptyString(prompts[key]))) return false
  if (!isRecord(value.distractorFeedback)) return false
  const distractorFeedback = value.distractorFeedback
  if (!['wrongRow', 'wrongDifference', 'wrongCompletion', 'wrongPictogram', 'wrongBarDifference', 'swappedCategories', 'changedValue'].every((key) => isNonEmptyString(distractorFeedback[key]))) return false
  if (!Array.isArray(value.templates) || value.templates.length < 6 || !value.templates.every(isValidDataSetTemplate)) return false
  return new Set(value.templates.map((template) => (template as DataSetTemplate).id)).size === value.templates.length
}

function isChanceContent(value: unknown): value is ChanceContent {
  if (!isRecord(value) || !isRecord(value.classificationLabels) || !isRecord(value.comparisonLabels) || !isRecord(value.experimentLabels) ||
    !isNonEmptyString(value.combinationCountPrompt) || !isNonEmptyString(value.excludedLabel)) return false
  const classificationLabels = value.classificationLabels
  const comparisonLabels = value.comparisonLabels
  const experimentLabels = value.experimentLabels
  if (!['sure', 'possible', 'impossible'].every((key) => isNonEmptyString(classificationLabels[key]))) return false
  if (!['first', 'equal', 'second'].every((key) => isNonEmptyString(comparisonLabels[key]))) return false
  if (!['bag', 'coin', 'die', 'spinner'].every((key) => isNonEmptyString(experimentLabels[key]))) return false
  if (!Array.isArray(value.probabilityTemplates) || value.probabilityTemplates.length < 9 || !value.probabilityTemplates.every(isValidProbabilityTemplate)) return false
  if (!Array.isArray(value.combinationTemplates) || value.combinationTemplates.length < 6 || !value.combinationTemplates.every(isValidCombinationTemplate)) return false
  const probabilityTemplates = value.probabilityTemplates
  const combinationTemplates = value.combinationTemplates
  return new Set(probabilityTemplates.map((template) => (template as ProbabilityTemplate).id)).size === probabilityTemplates.length &&
    new Set(combinationTemplates.map((template) => (template as CombinationTemplate).id)).size === combinationTemplates.length &&
    [1, 2, 3].every((difficulty) => probabilityTemplates.some((template) => (template as ProbabilityTemplate).difficulty === difficulty) && combinationTemplates.some((template) => (template as CombinationTemplate).difficulty === difficulty))
}

function isPlaneGeometryContent(value: unknown): value is PlaneGeometryContent {
  if (!isRecord(value) || !isNonEmptyString(value.entryRationale) || !isRecord(value.shapeLabels) || !isRecord(value.displayLabels)) return false
  const shapeLabels = value.shapeLabels
  const displayLabels = value.displayLabels
  if (!['square', 'rectangle', 'triangle'].every((key) => isNonEmptyString(shapeLabels[key]))) return false
  if (!['shape', 'pattern', 'area', 'perimeter'].every((key) => isNonEmptyString(displayLabels[key]))) return false
  return Array.isArray(value.patternSymbols) &&
    JSON.stringify(value.patternSymbols) === JSON.stringify(['Kreis', 'Quadrat', 'Dreieck', 'Stern'])
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
const LEARNING_ACTIONS: LearningAction[] = ['recall-foundation', 'inspect-relationship', 'solve-with-structure', 'solve-independently', 'retrieve-without-time-pressure', 'apply-in-new-context']
const INTERACTION_KINDS: InteractionKind[] = ['select', 'mark', 'match', 'order', 'complete-model', 'guided-number', 'place-value-input', 'identify-error', 'choose-strategy', 'build-pairing', 'continue']
const CONTENT_STATUSES: ContentStatus[] = ['draft', 'ready-for-review', 'active', 'disabled']
const WORD_MODEL_TYPES: WordModelType[] = [
  'change-increase', 'change-decrease', 'part-whole', 'comparison', 'missing-part',
  'equal-groups-total', 'equal-groups-share', 'increase-then-decrease', 'decrease-then-increase'
]

function isLearningPhase(value: unknown): value is CatalogLearningPhase {
  return isRecord(value) && LEARNING_PHASES.includes(value.id as LearningPhase) && isNonEmptyString(value.goal) &&
    Array.isArray(value.exerciseTypes) && value.exerciseTypes.length > 0 && value.exerciseTypes.every(isNonEmptyString) &&
    CONTENT_STATUSES.includes(value.releaseStatus as ContentStatus)
}

function isLearningPhaseModel(value: unknown): value is CatalogLearningPhaseModel {
  return isRecord(value) && LEARNING_PHASES.includes(value.id as LearningPhase) &&
    LEARNING_ACTIONS.includes(value.learningAction as LearningAction) && isNonEmptyString(value.purpose) &&
    Array.isArray(value.allowedInteractions) && value.allowedInteractions.length > 0 &&
    value.allowedInteractions.every((interaction) => INTERACTION_KINDS.includes(interaction as InteractionKind))
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
  if (value.misconceptionFeedback !== undefined) {
    if (!Array.isArray(value.misconceptionFeedback) || value.misconceptionFeedback.length === 0 ||
      !value.misconceptionFeedback.every((route) => isRecord(route) && isNonEmptyString(route.id) &&
        isNonEmptyString(route.misconception) && isNonEmptyString(route.feedback) &&
        (value.misconceptions as string[]).includes(route.misconception as string)) ||
      new Set(value.misconceptionFeedback.map((route) => (route as CatalogMisconceptionFeedback).id)).size !== value.misconceptionFeedback.length) return false
  }
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
  if (![value.story, value.question, value.situation, value.relevant, value.answer, value.modelHint, value.equation, value.equationError].every(isNonEmptyString)) return false
  if (!Array.isArray(value.questionDistractors) || value.questionDistractors.length !== 2 || !value.questionDistractors.every(isNonEmptyString)) return false
  if (!Array.isArray(value.situationDistractors) || value.situationDistractors.length !== 2 || !value.situationDistractors.every(isNonEmptyString)) return false
  if (!Array.isArray(value.relevantDistractors) || value.relevantDistractors.length !== 2 || !value.relevantDistractors.every(isNonEmptyString)) return false
  if (!Array.isArray(value.equationDistractors) || value.equationDistractors.length !== 2 || !value.equationDistractors.every(isNonEmptyString)) return false
  if (new Set([value.question, ...value.questionDistractors]).size !== 3 || new Set([value.situation, ...value.situationDistractors]).size !== 3 ||
    new Set([value.relevant, ...value.relevantDistractors]).size !== 3 || new Set([value.equation, ...value.equationDistractors]).size !== 3) return false
  if (![1, 2, 3].includes(value.minDifficulty as number) || !WORD_MODEL_TYPES.includes(value.modelType as WordModelType)) return false
  if (!Array.isArray(value.modelDistractors) || value.modelDistractors.length !== 2 || !value.modelDistractors.every((model) => WORD_MODEL_TYPES.includes(model as WordModelType)) ||
    new Set([value.modelType, ...value.modelDistractors]).size !== 3) return false
  const expectedModel: Record<WordProblemTemplate['relationship'], WordModelType> = {
    join: value.secondOperation ? 'increase-then-decrease' : 'change-increase',
    separate: value.secondOperation ? 'decrease-then-increase' : 'change-decrease',
    combine: 'part-whole', compare: 'comparison', complement: 'missing-part',
    'equal-groups': 'equal-groups-total', sharing: 'equal-groups-share'
  }
  if (expectedModel[value.relationship as WordProblemTemplate['relationship']] !== value.modelType) return false
  if (!isRange(value.firstRange, numberRange) || !isRange(value.secondRange, numberRange)) return false
  const hasSecondStep = value.secondOperation !== undefined || value.thirdRange !== undefined
  if (hasSecondStep && (!['+', '−'].includes(value.secondOperation as string) || !isRange(value.thirdRange, numberRange))) return false
  if (hasSecondStep && (!(value.story as string).includes('{third}') || value.minDifficulty !== 3 || !isNonEmptyString(value.secondEquation) ||
    !Array.isArray(value.secondEquationDistractors) || value.secondEquationDistractors.length !== 2 || !value.secondEquationDistractors.every(isNonEmptyString) ||
    new Set([value.secondEquation, ...value.secondEquationDistractors]).size !== 3)) return false
  if (!hasSecondStep && (value.secondEquation !== undefined || value.secondEquationDistractors !== undefined)) return false
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
    'modelPrompt', 'modelExplorePrompt', 'modelContinueLabel', 'modelError', 'modelSuccess',
    'equationPrompt', 'equationError', 'equationSuccess',
    'calculatePrompt', 'calculateError', 'calculateSuccess',
    'secondEquationPrompt', 'secondEquationError', 'secondEquationSuccess',
    'finalCalculationPrompt', 'finalCalculationError', 'finalCalculationSuccess',
    'checkPrompt', 'checkError', 'checkSuccess',
    'plausibilityError', 'plausibilitySuccess'
  ]
  if (!stringFields.every((field) => isNonEmptyString(value[field]))) return false
  const progressionIds = ['understand-story', 'identify-unknown', 'identify-relevant', 'choose-model', 'form-equation', 'calculate', 'check-result', 'answer-in-context']
  if (!Array.isArray(value.modellingProgression) || value.modellingProgression.length !== progressionIds.length ||
    !value.modellingProgression.every((stage, index) => isRecord(stage) && stage.stage === index + 1 && stage.id === progressionIds[index] &&
      isNonEmptyString(stage.childPrompt) && isNonEmptyString(stage.purpose))) return false
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
  if (!Array.isArray(value.runtimeSequence) || value.runtimeSequence.length !== expectedRuntime.length ||
    !value.runtimeSequence.every((step, index) => isRecord(step) &&
      [step.id, step.progressionId, step.condition, step.interaction, step.representation].every((entry, fieldIndex) => entry === expectedRuntime[index]![fieldIndex]))) return false
  return isRecord(value.modelInteractionByDifficulty) && value.modelInteractionByDifficulty['1'] === 'continue' &&
    value.modelInteractionByDifficulty['2'] === 'choice' && value.modelInteractionByDifficulty['3'] === 'choice'
}

export function validateTaskCatalog(value: unknown): value is TaskCatalog {
  if (!isRecord(value) || value.schemaVersion !== CATALOG_SCHEMA_VERSION || !isRecord(value.numberRange)) return false
  if (!isNonEmptyString(value.catalogVersion) || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(value.catalogVersion)) return false
  if (value.catalogId !== TASK_CATALOG_ID) return false
  if (!isNonEmptyString(value.releasedAt) || !/^\d{4}-\d{2}-\d{2}$/.test(value.releasedAt) || Number.isNaN(Date.parse(`${value.releasedAt}T00:00:00Z`))) return false
  if (!CONTENT_STATUSES.includes(value.status as ContentStatus)) return false
  if (!isRecord(value.representationPolicy)) return false
  const representationPolicy = value.representationPolicy
  if (!['rule', 'knownValues', 'unknownValues', 'revealedValues'].every((field) => isNonEmptyString(representationPolicy[field]))) return false
  if (!Array.isArray(value.learningPhaseModel) || value.learningPhaseModel.length !== LEARNING_PHASES.length ||
    !value.learningPhaseModel.every(isLearningPhaseModel) ||
    new Set(value.learningPhaseModel.map((phase) => (phase as CatalogLearningPhaseModel).id)).size !== LEARNING_PHASES.length) return false
  if (!isRecord(value.fieldUsage)) return false
  const fieldUsage = value.fieldUsage
  const usageFields = ['representationPolicy', 'workedExample', 'remediation', 'transferPrompt', 'processCompetencies', 'learningPhases', 'difficultyLevels', 'representations', 'misconceptions', 'successCriteria', 'successFeedback', 'errorFeedback', 'releaseStatus']
  if (!usageFields.every((field) => ['runtime', 'review', 'planned'].includes(fieldUsage[field] as string))) return false
  const numberRange = value.numberRange
  if (!Number.isInteger(numberRange.min) || !Number.isInteger(numberRange.max) || numberRange.min !== 0 || numberRange.max !== 1000) return false
  if (!Array.isArray(value.skills) || value.skills.length !== SKILL_IDS.length || !value.skills.every((skill) => isSkill(skill, numberRange as { min: number; max: number }))) return false
  const skillIds = value.skills.map((skill) => (skill as CatalogSkill).id)
  if (new Set(skillIds).size !== SKILL_IDS.length || !SKILL_IDS.every((id) => skillIds.includes(id))) return false
  const symmetrySkill = value.skills.find((skill) => (skill as CatalogSkill).id === 'symmetry') as CatalogSkill | undefined
  const expectedSymmetryExerciseTypes = [
    ['symmetry:phase-1'], ['symmetry:phase-1'], ['symmetry:phase-1'],
    ['symmetry:phase-2'], ['symmetry:phase-3'], ['symmetry:phase-3']
  ]
  if (!symmetrySkill || JSON.stringify(symmetrySkill.learningPhases.map((phase) => phase.exerciseTypes)) !== JSON.stringify(expectedSymmetryExerciseTypes)) return false
  if (!Array.isArray(value.preparedTopics) || value.preparedTopics.length !== 1 || !value.preparedTopics.every((topic) =>
    isRecord(topic) && topic.id === 'spatial-reasoning' &&
    [topic.label, topic.curriculumArea, topic.supportGoal, topic.remediation].every(isNonEmptyString) &&
    ['prerequisites', 'representations', 'misconceptions', 'progression'].every((field) => Array.isArray(topic[field]) && (topic[field] as unknown[]).length > 0 && (topic[field] as unknown[]).every(isNonEmptyString)) &&
    topic.releaseStatus === 'disabled'
  )) return false
  if (new Set(value.preparedTopics.map((topic) => (topic as PreparedTopic).id)).size !== 1) return false
  if (!isRecord(value.quantityContent) || !isRecord(value.quantityContent.money) || !isRecord(value.quantityContent.lengths) ||
    !isRecord(value.quantityContent.time) || !isRecord(value.quantityContent.mass) || !isRecord(value.quantityContent.capacity)) return false
  const quantityContent = value.quantityContent
  const moneyContent = quantityContent.money as Record<string, unknown>
  const lengthsContent = quantityContent.lengths as Record<string, unknown>
  const timeContent = quantityContent.time as Record<string, unknown>
  if (!['countPrompt', 'changePrompt', 'countExplanation', 'changeExplanation', 'coinsLabel', 'priceLabel', 'paidLabel'].every((field) => isNonEmptyString(moneyContent[field]))) return false
  if (!['readPrompt', 'toCentimetersPrompt', 'toMetersPrompt', 'calculationPrompt', 'readExplanation', 'conversionExplanation', 'calculationExplanation', 'rulerLabel', 'equivalenceLabel'].every((field) => isNonEmptyString(lengthsContent[field]))) return false
  if (!['readPrompt', 'durationPrompt', 'readExplanation', 'durationExplanation', 'clockLabel', 'durationLabel'].every((field) => isNonEmptyString(timeContent[field]))) return false
  for (const key of ['mass', 'capacity'] as const) {
    const content = quantityContent[key]
    if (!isRecord(content) || !['referencePrompt', 'complementPrompt', 'calculationPrompt', 'referenceExplanation', 'complementExplanation', 'calculationExplanation', 'displayLabel', 'equivalenceLabel'].every((field) => isNonEmptyString(content[field]))) return false
    if (!Array.isArray(content.referenceEstimates) || content.referenceEstimates.length < 3 || !content.referenceEstimates.every((estimate) =>
      isRecord(estimate) && isNonEmptyString(estimate.id) && isNonEmptyString(estimate.label) && isNonEmptyString(estimate.correct) &&
      Array.isArray(estimate.options) && estimate.options.length === 3 && estimate.options.every(isNonEmptyString) &&
      new Set(estimate.options).size === 3 && estimate.options.includes(estimate.correct as string)
    )) return false
    if (new Set(content.referenceEstimates.map((estimate) => (estimate as ReferenceEstimate).id)).size !== content.referenceEstimates.length) return false
  }
  if (!isRecord(value.strategySteps) || !isRecord(value.strategySteps.placeValue) || !isRecord(value.strategySteps.rounding) || !isRecord(value.strategySteps.arithmetic1000) || !isRecord(value.strategySteps.writtenAddition) || !isRecord(value.strategySteps.writtenSubtraction)) return false
  const placeValueSteps = value.strategySteps.placeValue
  const roundingSteps = value.strategySteps.rounding
  const arithmeticSteps = value.strategySteps.arithmetic1000
  const writtenAdditionSteps = value.strategySteps.writtenAddition
  const writtenSubtractionSteps = value.strategySteps.writtenSubtraction
  if (!['digitPrompt', 'digitError', 'digitSuccess', 'valuePrompt', 'valueError', 'valueSuccess'].every((field) => isNonEmptyString(placeValueSteps[field]))) return false
  if (!['neighborsPrompt', 'neighborsError', 'neighborsSuccess', 'resultPrompt', 'resultError', 'resultSuccess', 'reasonPrompt', 'reasonError', 'reasonSuccess', 'closerLower', 'closerUpper', 'halfwayUp', 'wrongLower', 'wrongUpper'].every((field) => isNonEmptyString(roundingSteps[field]))) return false
  if (!['bridgePrompt', 'bridgeError', 'bridgeSuccess', 'resultPrompt', 'resultError', 'resultSuccess'].every((field) => isNonEmptyString(arithmeticSteps[field]))) return false
  if (!['onesPrompt', 'onesError', 'onesSuccess', 'carryPrompt', 'carryError', 'carrySuccess', 'tensPrompt', 'tensError', 'tensSuccess', 'hundredsPrompt', 'hundredsError', 'hundredsSuccess'].every((field) => isNonEmptyString(writtenAdditionSteps[field]))) return false
  if (!['unbundlePrompt', 'unbundleError', 'unbundleSuccess', 'onesPrompt', 'onesError', 'onesSuccess', 'tensPrompt', 'tensError', 'tensSuccess', 'hundredsPrompt', 'hundredsError', 'hundredsSuccess', 'checkPrompt', 'checkError', 'checkSuccess'].every((field) => isNonEmptyString(writtenSubtractionSteps[field]))) return false
  if (!Array.isArray(value.wordProblems) || value.wordProblems.length === 0 || !value.wordProblems.every((template) => isWordProblem(template, numberRange as { min: number; max: number }))) return false
  if (new Set(value.wordProblems.map((template) => (template as WordProblemTemplate).id)).size !== value.wordProblems.length) return false
  if (!isWordProblemSteps(value.wordProblemSteps) || !isSymmetryContent(value.symmetry) ||
    !isSpatialViewsContent(value.spatialViews) || !isSpatialRotationsContent(value.spatialRotations) ||
    !isSpatialFoldingContent(value.spatialFolding) || !isDataAndChartsContent(value.dataAndCharts) || !isChanceContent(value.chanceContent) ||
    !isPlaneGeometryContent(value.planeGeometry)) return false
  return hasOnlyKnownPlaceholders(value)
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

export function getLearningPhaseModel(phase: LearningPhase): CatalogLearningPhaseModel {
  return activeCatalog.learningPhaseModel.find((entry) => entry.id === phase) ??
    FALLBACK_TASK_CATALOG.learningPhaseModel.find((entry) => entry.id === phase)!
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
