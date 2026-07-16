import { generateExercise } from './generators'
import { dailySeed, seededRandom } from './random'
import { selectionWeight, subskillWeight } from './progress'
import type { Difficulty, Exercise, ProgressMap, SessionPlan, SkillId } from './types'

const FOCUS_SKILLS: SkillId[] = [
  'place-value',
  'decompose',
  'compose',
  'neighbor-tens',
  'neighbor-hundreds',
  'round-tens',
  'round-hundreds',
  'addition-1000',
  'subtraction-1000',
  'complement-1000'
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

function weightedSkills(progress: ProgressMap, seed: number, count: number): SkillId[] {
  const random = seededRandom(seed)
  const available = [...FOCUS_SKILLS]
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
  const selected: SkillId[] = []
  for (let round = 0; round < 2; round += 1) {
    const weights = WARMUP_SKILLS.map((skill) => selectionWeight(progress[skill]) * (selected.includes(skill) ? 0.45 : 1))
    selected.push(WARMUP_SKILLS[weightedIndex(weights, random)] as SkillId)
  }
  return selected
}

function selectSubskill(skillId: SkillId, progress: ProgressMap, seed: number, difficulty: Difficulty): string | undefined {
  const candidates = skillId === 'addition'
    ? ['addition-within-10', 'addition-bridge-10']
    : skillId === 'subtraction'
      ? ['subtraction-within-10', 'subtraction-bridge-10']
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

export function createSessionPlan(progress: ProgressMap, seed = dailySeed() + Date.now() % 10_000): SessionPlan {
  const warmups = warmupSkills(progress, seed + 17)
  const focus = weightedSkills(progress, seed + 31, 3)
  const skills = [...warmups, ...focus, 'word-problem', 'symmetry'] as SkillId[]
  const exercises = skills.map((skillId, index) => {
    const skillProgress = progress[skillId]
    const difficulty = skillProgress?.difficulty ?? 1
    const exerciseSeed = seed + (index + 1) * 113
    const focus = selectSubskill(skillId, progress, exerciseSeed + 41, difficulty)
    return uniqueExercise(skillId, exerciseSeed, difficulty, skillProgress?.lastVariantKey, focus)
  })
  return {
    id: `session-${seed}`,
    seed,
    startedAt: new Date().toISOString(),
    exercises
  }
}

export function createRepetitionExercise(skillId: SkillId, seed: number, difficulty: Difficulty, lastVariantKey: string, subskillId?: string): Exercise {
  const easier = Math.max(1, difficulty - 1) as Difficulty
  return uniqueExercise(skillId, seed + 7_919, easier, lastVariantKey, subskillId)
}
