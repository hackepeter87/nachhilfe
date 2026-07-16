export type SkillId =
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'place-value'
  | 'decompose'
  | 'compose'
  | 'neighbor-tens'
  | 'neighbor-hundreds'
  | 'round-tens'
  | 'round-hundreds'
  | 'word-problem'
  | 'symmetry'

export type Difficulty = 1 | 2 | 3
export type AnswerMode = 'number' | 'choice' | 'guided-word' | 'symmetry'

export interface Hint {
  level: 1 | 2
  text: string
}

export interface AnswerOption {
  value: string
  label: string
  grid?: number[][]
}

export interface ExerciseStep {
  id: string
  prompt: string
  options: AnswerOption[]
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
  title: string
  prompt: string
  answerMode: AnswerMode
  correctAnswer: string
  options?: AnswerOption[]
  steps?: ExerciseStep[]
  sourceGrid?: number[][]
  hints: [Hint, Hint]
  errorFeedback: string
  explanation: string
  variant: ExerciseVariant
  testMetadata: {
    min: number
    max: number
    uniqueSolution: true
  }
}

export interface AttemptResult {
  exerciseId: string
  skillId: SkillId
  variantKey: string
  correct: boolean
  hintsUsed: number
  attempts: number
  completedAt: string
}

export type LearningStatus = 'not_started' | 'learning' | 'practicing' | 'secure'

export interface SkillProgress {
  skillId: SkillId
  attempts: number
  correctAnswers: number
  hintsUsed: number
  lastPracticedAt: string | null
  difficulty: Difficulty
  mastery: number
  recentErrors: number
  correctStreak: number
  lastVariantKey: string | null
  status: LearningStatus
}

export interface SessionPlan {
  id: string
  seed: number
  startedAt: string
  exercises: Exercise[]
}

export type SelfAssessment = 'material' | 'hint' | 'thinking'

export interface CompletedSession {
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
