import type { AttemptResult, Difficulty, LearningPhase, LearningStatus, SkillId, SkillProgress } from './types'

export const LEARNING_RULES = {
  initialMastery: 35,
  correctWithoutHint: 12,
  correctWithHint: 6,
  incorrect: -10,
  secureMastery: 80,
  secureAttempts: 5,
  maxMastery: 100,
  minMastery: 0
} as const

export function createSkillProgress(skillId: SkillId): SkillProgress {
  return {
    skillId,
    attempts: 0,
    correctAnswers: 0,
    hintsUsed: 0,
    lastPracticedAt: null,
    difficulty: 1,
    learningPhase: 'activate',
    mastery: LEARNING_RULES.initialMastery,
    recentErrors: 0,
    correctStreak: 0,
    lastVariantKey: null,
    status: 'not_started',
    subskills: {}
  }
}

export function learningPhaseFor(attempts: number, mastery: number, difficulty: Difficulty, status: LearningStatus): LearningPhase {
  if (attempts === 0) return 'activate'
  if (mastery < 45) return 'understand'
  if (difficulty === 1) return 'guided-practice'
  if (difficulty === 2) return 'independent-practice'
  if (status !== 'secure') return 'independent-practice'
  return mastery >= 92 ? 'transfer' : 'automate'
}

export type RepetitionState = 'new' | 'building' | 'review' | 'secure' | 'overdue'

export function repetitionState(progress: SkillProgress | undefined, now = new Date()): RepetitionState {
  if (!progress || progress.attempts === 0) return 'new'
  const daysSincePractice = progress.lastPracticedAt
    ? Math.max(0, (now.getTime() - new Date(progress.lastPracticedAt).getTime()) / 86_400_000)
    : 14
  if (daysSincePractice >= 14) return 'overdue'
  if (progress.status === 'secure') return daysSincePractice >= 7 ? 'review' : 'secure'
  return daysSincePractice >= 3 ? 'review' : 'building'
}

function statusFor(attempts: number, mastery: number): LearningStatus {
  if (attempts === 0) return 'not_started'
  if (attempts >= LEARNING_RULES.secureAttempts && mastery >= LEARNING_RULES.secureMastery) return 'secure'
  if (mastery >= 55) return 'practicing'
  return 'learning'
}

function nextDifficulty(current: Difficulty, correctStreak: number, correct: boolean): Difficulty {
  if (!correct) return Math.max(1, current - 1) as Difficulty
  if (correctStreak >= 2) return Math.min(3, current + 1) as Difficulty
  return current
}

export function updateSkillProgress(current: SkillProgress | undefined, result: AttemptResult): SkillProgress {
  const previous = current ?? createSkillProgress(result.skillId)
  const delta = result.correct
    ? result.hintsUsed > 0
      ? LEARNING_RULES.correctWithHint
      : LEARNING_RULES.correctWithoutHint
    : LEARNING_RULES.incorrect
  const mastery = Math.max(LEARNING_RULES.minMastery, Math.min(LEARNING_RULES.maxMastery, previous.mastery + delta))
  const attempts = previous.attempts + 1
  const correctStreak = result.correct ? previous.correctStreak + 1 : 0
  const previousSubskills = previous.subskills ?? {}
  const previousSubskill = result.subskillId ? previousSubskills[result.subskillId] : undefined
  const subskillMastery = previousSubskill
    ? Math.max(0, Math.min(100, previousSubskill.mastery + delta))
    : Math.max(0, Math.min(100, LEARNING_RULES.initialMastery + delta))
  const subskills = result.subskillId
    ? {
        ...previousSubskills,
        [result.subskillId]: {
          attempts: (previousSubskill?.attempts ?? 0) + 1,
          correctAnswers: (previousSubskill?.correctAnswers ?? 0) + (result.correct ? 1 : 0),
          hintsUsed: (previousSubskill?.hintsUsed ?? 0) + result.hintsUsed,
          mastery: subskillMastery,
          recentErrors: result.correct ? Math.max(0, (previousSubskill?.recentErrors ?? 0) - 1) : Math.min(3, (previousSubskill?.recentErrors ?? 0) + 1),
          lastPracticedAt: result.completedAt
        }
      }
    : previousSubskills

  const difficulty = nextDifficulty(previous.difficulty, correctStreak, result.correct)
  const status = statusFor(attempts, mastery)
  return {
    ...previous,
    attempts,
    correctAnswers: previous.correctAnswers + (result.correct ? 1 : 0),
    hintsUsed: previous.hintsUsed + result.hintsUsed,
    lastPracticedAt: result.completedAt,
    difficulty,
    learningPhase: learningPhaseFor(attempts, mastery, difficulty, status),
    mastery,
    recentErrors: result.correct ? Math.max(0, previous.recentErrors - 1) : Math.min(3, previous.recentErrors + 1),
    correctStreak,
    lastVariantKey: result.variantKey,
    status,
    subskills
  }
}

export function subskillWeight(progress: SkillProgress | undefined, subskillId: string, now = new Date()): number {
  const subskill = progress?.subskills?.[subskillId]
  if (!subskill) return 120
  const daysSincePractice = subskill.lastPracticedAt
    ? Math.max(0, (now.getTime() - new Date(subskill.lastPracticedAt).getTime()) / 86_400_000)
    : 14
  return Math.max(10, 110 - subskill.mastery + subskill.recentErrors * 24 + Math.min(30, daysSincePractice * 3))
}

export function selectionWeight(progress: SkillProgress | undefined, now = new Date()): number {
  if (!progress) return 120
  const daysSincePractice = progress.lastPracticedAt
    ? Math.max(0, (now.getTime() - new Date(progress.lastPracticedAt).getTime()) / 86_400_000)
    : 14
  const state = repetitionState(progress, now)
  const spacingBoost = state === 'overdue' ? 24 : state === 'review' ? 12 : 0
  return Math.max(10, 110 - progress.mastery + progress.recentErrors * 24 + Math.min(30, daysSincePractice * 3) + spacingBoost)
}
