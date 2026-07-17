export const SKILL_IDS = [
  'addition',
  'subtraction',
  'multiplication',
  'division',
  'place-value',
  'decompose',
  'compose',
  'neighbor-tens',
  'neighbor-hundreds',
  'round-tens',
  'round-hundreds',
  'addition-1000',
  'written-addition',
  'subtraction-1000',
  'written-subtraction',
  'complement-1000',
  'money',
  'lengths',
  'word-problem',
  'symmetry',
  'body-views',
  'cube-rotation'
] as const

export type SkillId = typeof SKILL_IDS[number]

export type Difficulty = 1 | 2 | 3
export type AnswerMode = 'number' | 'choice' | 'guided-choice' | 'guided-number' | 'guided-word' | 'symmetry'

export type LearningPhase =
  | 'activate'
  | 'understand'
  | 'guided-practice'
  | 'independent-practice'
  | 'automate'
  | 'transfer'

export interface Hint {
  level: 1 | 2
  text: string
}

export interface AnswerOption {
  value: string
  label: string
  grid?: number[][]
  representation?: ExerciseRepresentation
  misconception?: string
}

export type RepresentationKind = 'place-value' | 'column-calculation' | 'number-line' | 'bar-model' | 'groups' | 'money' | 'length' | 'cube-building' | 'cube-view' | 'cube-rotation'

export interface NumberLineJump {
  from: number
  to: number
  label: string
}

export interface DifficultyRequirements {
  requiresNeighborIdentification: boolean
  requiresRepresentationChoice: boolean
  requiresOperationChoice: boolean
  requiresJustification: boolean
  requiresMultiStepCalculation: boolean
}

export interface ExerciseRepresentation {
  kind: RepresentationKind
  visibility: 'always' | 'hint'
  label: string
  values: Record<string, number | string | number[] | NumberLineJump[]>
}

export interface ExerciseStep {
  id: string
  curriculumStage?: string
  prompt: string
  interaction?: 'choice' | 'number' | 'continue'
  options?: AnswerOption[]
  representation?: ExerciseRepresentation
  continueLabel?: string
  correctAnswer: string
  errorFeedback: string
  successFeedback: string
}

export interface ExerciseVariant {
  seed: number
  key: string
  values: Record<string, number | string>
}

export interface Exercise {
  id: string
  typeId: string
  skillId: SkillId
  difficulty: Difficulty
  learningPhase: LearningPhase
  title: string
  prompt: string
  answerMode: AnswerMode
  correctAnswer: string
  options?: AnswerOption[]
  steps?: ExerciseStep[]
  sourceGrid?: number[][]
  symmetry?: {
    axis: 'vertical' | 'horizontal'
    axisPosition: 'between-cells' | 'through-cells'
    progressionPhase: 1 | 2 | 3 | 4 | 5
    axisLegend: string
  }
  subskillId?: string
  representation?: ExerciseRepresentation
  hints: [Hint, Hint]
  successFeedback: string
  errorFeedback: string
  explanation: string
  remediation: {
    helpLevel: 4 | 5
    nextDifficulty: Difficulty
    keepSubskill: boolean
    strategy: string
    representation: string
  }
  variant: ExerciseVariant
  testMetadata: {
    min: number
    max: number
    uniqueSolution: true
    requirements: DifficultyRequirements
    representation: RepresentationKind | 'none'
    distractorSources: string[]
    learningPhase: LearningPhase
  }
}

export interface AttemptResult {
  exerciseId: string
  skillId: SkillId
  subskillId?: string
  variantKey: string
  correct: boolean
  hintsUsed: number
  attempts: number
  completedAt: string
}

export type LearningStatus = 'not_started' | 'learning' | 'practicing' | 'secure'

export interface SubskillProgress {
  attempts: number
  correctAnswers: number
  hintsUsed: number
  mastery: number
  recentErrors: number
  lastPracticedAt: string | null
}

export interface SkillProgress {
  skillId: SkillId
  attempts: number
  correctAnswers: number
  hintsUsed: number
  lastPracticedAt: string | null
  difficulty: Difficulty
  learningPhase: LearningPhase
  mastery: number
  recentErrors: number
  correctStreak: number
  lastVariantKey: string | null
  status: LearningStatus
  subskills: Record<string, SubskillProgress>
}

export interface SessionReleaseMetadata {
  catalogId: string
  catalogVersion: string
  schemaVersion: number
  appVersion: string
}

export interface SessionPlan extends SessionReleaseMetadata {
  id: string
  seed: number
  startedAt: string
  exercises: Exercise[]
}

export type SelfAssessment = 'material' | 'hint' | 'thinking'

export interface CompletedSession extends SessionReleaseMetadata {
  id: string
  startedAt: string
  completedAt: string
  results: AttemptResult[]
  selfAssessment: SelfAssessment
}

export interface Profile {
  id: 'local-profile'
  nickname: string
  createdAt: string
}

export interface AppSettings {
  key: 'app-settings'
  installHelpDismissed: boolean
  schemaVersion: 1
}

export type ProgressMap = Partial<Record<SkillId, SkillProgress>>
