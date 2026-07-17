import { generateExercise } from './generators'
import { dailySeed, seededRandom } from './random'
import { selectionWeight, subskillWeight } from './progress'
import { getActiveCatalogMetadata, isSkillEnabled } from '../content/catalog'
import { APP_VERSION } from '../version'
import type { Difficulty, Exercise, LearningPhase, ProgressMap, SessionPlan, SessionReleaseMetadata, SkillId, SkillProgress } from './types'

const FOCUS_SKILLS: SkillId[] = [
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
  'body-views',
  'cube-rotation',
  'folding',
  'read-tables',
  'read-charts',
  'probability',
  'combinatorics',
  'time',
  'mass',
  'capacity'
]

const WARMUP_SKILLS: SkillId[] = ['addition', 'subtraction', 'multiplication', 'division']

function weightedIndex(weights: number[], random: () => number): number {
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  let target = random() * total
  for (let index = 0; index < weights.length - 1; index += 1) {
    target -= weights[index] as number
    if (target <= 0) return index
  }
  return weights.length - 1
}

const PHASE_ORDER: LearningPhase[] = [
  'activate',
  'understand',
  'guided-practice',
  'independent-practice',
  'automate',
  'transfer'
]

function hasReachedPhase(progress: SkillProgress | undefined, minimum: LearningPhase): boolean {
  return Boolean(progress && PHASE_ORDER.indexOf(progress.learningPhase) >= PHASE_ORDER.indexOf(minimum))
}

export function isSkillEligible(skillId: SkillId, progress: ProgressMap): boolean {
  if (!isSkillEnabled(skillId)) return false
  if (skillId === 'written-addition') {
    return hasReachedPhase(progress['place-value'], 'independent-practice') &&
      hasReachedPhase(progress['addition-1000'], 'independent-practice')
  }
  if (skillId === 'written-subtraction') {
    return hasReachedPhase(progress['place-value'], 'independent-practice') &&
      hasReachedPhase(progress['subtraction-1000'], 'independent-practice')
  }
  if (skillId === 'cube-rotation') {
    const bodyViews = progress['body-views']
    return Boolean(bodyViews && bodyViews.attempts >= 5 && bodyViews.mastery >= 60)
  }
  if (skillId === 'folding') {
    return hasReachedPhase(progress.symmetry, 'automate')
  }
  if (skillId === 'read-charts') {
    const tables = progress['read-tables']
    return Boolean(tables && tables.attempts >= 5 && tables.mastery >= 60)
  }
  return true
}

function weightedSkills(progress: ProgressMap, seed: number, count: number): SkillId[] {
  const random = seededRandom(seed)
  const available = FOCUS_SKILLS.filter((skillId) => isSkillEligible(skillId, progress))
  const selected: SkillId[] = []
  while (selected.length < count && available.length > 0) {
    const weights = available.map((skill) => selectionWeight(progress[skill]))
    const index = weightedIndex(weights, random)
    selected.push(available[index] as SkillId)
    available.splice(index, 1)
  }
  return selected
}

function warmupSkills(progress: ProgressMap, seed: number): SkillId[] {
  const random = seededRandom(seed)
  const available = WARMUP_SKILLS.filter(isSkillEnabled)
  const selected: SkillId[] = []
  for (let round = 0; round < 2; round += 1) {
    const weights = available.map((skill) => selectionWeight(progress[skill]) * (selected.includes(skill) ? 0.45 : 1))
    selected.push(available[weightedIndex(weights, random)] as SkillId)
  }
  return selected
}

function selectSubskill(skillId: SkillId, progress: ProgressMap, seed: number, difficulty: Difficulty): string | undefined {
  if (skillId === 'symmetry') {
    if (difficulty === 1) return 'symmetry-phase-1'
    if (difficulty === 2) return 'symmetry-phase-2'
    const skillProgress = progress.symmetry
    if (skillProgress?.learningPhase !== 'transfer') return 'symmetry-phase-3'
    const axisCellProgress = skillProgress.subskills?.['symmetry-phase-4']
    return axisCellProgress && axisCellProgress.attempts >= 3 && axisCellProgress.mastery >= 65
      ? 'symmetry-phase-5'
      : 'symmetry-phase-4'
  }
  if (skillId === 'cube-rotation') {
    const candidates = difficulty === 1
      ? ['cube-rotation-right']
      : ['cube-rotation-right', 'cube-rotation-left']
    const random = seededRandom(seed)
    const weights = candidates.map((candidate) => subskillWeight(progress[skillId], candidate))
    return candidates[weightedIndex(weights, random)]
  }
  if (skillId === 'folding') {
    return difficulty === 3 ? 'fold-cut-unfold' : 'fold-point'
  }
  if (skillId === 'read-tables') {
    return difficulty === 1 ? 'table-read-value' : difficulty === 2 ? 'tally-compare-values' : 'table-complete-total'
  }
  if (skillId === 'read-charts') {
    return difficulty === 1 ? 'pictogram-read-one-to-one' : difficulty === 2 ? 'bar-compare-values' : 'table-to-bar-match'
  }
  if (skillId === 'probability') return difficulty === 1 ? 'chance-classify-visible' : difficulty === 2 ? 'chance-classify-experiment' : 'chance-compare-frequency'
  if (skillId === 'combinatorics') return difficulty === 3 ? 'combinations-one-exclusion' : 'combinations-systematic'
  if (skillId === 'time') return difficulty === 1 ? 'time-full-half-hours' : difficulty === 2 ? 'time-five-minute-reading' : 'time-forward-duration'
  if (skillId === 'mass' || skillId === 'capacity') return difficulty === 1 ? `${skillId}-reference-estimate` : difficulty === 2 ? `${skillId}-complement-to-1000` : undefined
  const candidates = skillId === 'addition'
    ? (difficulty === 1 ? ['addition-within-10'] : ['addition-bridge-10'])
    : skillId === 'subtraction'
      ? (difficulty === 1 ? ['subtraction-within-10'] : ['subtraction-bridge-10'])
      : skillId === 'multiplication'
        ? (difficulty === 1 ? [2, 5, 10] : difficulty === 2 ? [3, 4, 6] : [6, 7, 8, 9]).map((row) => `times-${row}`)
        : skillId === 'division'
          ? (difficulty === 1 ? [2, 5, 10] : difficulty === 2 ? [3, 4, 6] : [6, 7, 8, 9]).map((row) => `division-by-${row}`)
          : []
  if (candidates.length === 0) return undefined
  const random = seededRandom(seed)
  const weights = candidates.map((candidate) => subskillWeight(progress[skillId], candidate))
  return candidates[weightedIndex(weights, random)]
}

function uniqueExercise(skillId: SkillId, seed: number, difficulty: Difficulty, lastVariantKey?: string | null, focus?: string): Exercise {
  let exercise = generateExercise(skillId, seed, difficulty, focus)
  let attempt = 1
  while (exercise.variant.key === lastVariantKey && attempt < 5) {
    exercise = generateExercise(skillId, seed + attempt * 97, difficulty, focus)
    attempt += 1
  }
  return exercise
}

function settingsForProgress(progress: SkillProgress | undefined): { difficulty: Difficulty; phase: LearningPhase } {
  const phase = progress?.learningPhase ?? 'activate'
  const difficulty: Difficulty = phase === 'independent-practice'
    ? 2
    : phase === 'automate' || phase === 'transfer'
      ? 3
      : 1
  return { difficulty, phase }
}

function settingsForSkill(skillId: SkillId, progress: ProgressMap): { difficulty: Difficulty; phase: LearningPhase } {
  const settings = settingsForProgress(progress[skillId])
  if ((skillId === 'mass' || skillId === 'capacity') && !hasReachedPhase(progress['complement-1000'], 'independent-practice')) {
    return { difficulty: 1, phase: settings.phase }
  }
  return settings
}

function applyLearningPhase(exercise: Exercise, phase: LearningPhase): Exercise {
  const showRepresentation = ['activate', 'understand', 'guided-practice'].includes(phase)
  return {
    ...exercise,
    learningPhase: phase,
    representation: exercise.representation
      ? {
          ...exercise.representation,
          visibility: exercise.representation.visibility === 'always' || showRepresentation ? 'always' : 'hint'
        }
      : exercise.representation,
    testMetadata: { ...exercise.testMetadata, learningPhase: phase }
  }
}

export function currentSessionReleaseMetadata(): SessionReleaseMetadata {
  const catalog = getActiveCatalogMetadata()
  return {
    catalogId: catalog.catalogId,
    catalogVersion: catalog.catalogVersion,
    schemaVersion: catalog.schemaVersion,
    appVersion: APP_VERSION
  }
}

export function createSessionPlan(
  progress: ProgressMap,
  seed = dailySeed() + Date.now() % 10_000,
  releaseMetadata = currentSessionReleaseMetadata()
): SessionPlan {
  const warmups = warmupSkills(progress, seed + 17)
  const focus = weightedSkills(progress, seed + 31, 3)
  const skills = [...warmups, ...focus, ...(['word-problem', 'symmetry'] as SkillId[]).filter(isSkillEnabled)]
  const exercises = skills.map((skillId, index) => {
    const skillProgress = progress[skillId]
    const { difficulty, phase } = settingsForSkill(skillId, progress)
    const exerciseSeed = seed + (index + 1) * 113
    const focus = selectSubskill(skillId, progress, exerciseSeed + 41, difficulty)
    return applyLearningPhase(uniqueExercise(skillId, exerciseSeed, difficulty, skillProgress?.lastVariantKey, focus), phase)
  })
  return {
    id: `session-${seed}`,
    seed,
    ...releaseMetadata,
    startedAt: new Date().toISOString(),
    exercises
  }
}

export function createRepetitionExercise(skillId: SkillId, seed: number, difficulty: Difficulty, lastVariantKey: string, subskillId?: string): Exercise {
  const easier = Math.max(1, difficulty - 1) as Difficulty
  return uniqueExercise(skillId, seed + 7_919, easier, lastVariantKey, subskillId)
}

export function createRemediationExercise(exercise: Exercise, seed: number): Exercise {
  return uniqueExercise(
    exercise.skillId,
    seed + 7_919,
    exercise.remediation.nextDifficulty,
    exercise.variant.key,
    exercise.remediation.keepSubskill ? exercise.subskillId : undefined
  )
}
