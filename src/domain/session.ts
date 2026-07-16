import { generateExercise } from './generators'
import { dailySeed, seededRandom } from './random'
import { selectionWeight } from './progress'
import type { Difficulty, Exercise, ProgressMap, SessionPlan, SkillId } from './types'

const FOCUS_SKILLS: SkillId[] = [
  'place-value',
  'decompose',
  'compose',
  'neighbor-tens',
  'neighbor-hundreds',
  'round-tens',
  'round-hundreds'
]

function weightedSkills(progress: ProgressMap, seed: number, count: number): SkillId[] {
  const random = seededRandom(seed)
  const available = [...FOCUS_SKILLS]
  const selected: SkillId[] = []
  while (selected.length < count && available.length > 0) {
    const weights = available.map((skill) => selectionWeight(progress[skill]))
    const total = weights.reduce((sum, weight) => sum + weight, 0)
    let target = random() * total
    let index = 0
    for (; index < available.length - 1; index += 1) {
      target -= weights[index] as number
      if (target <= 0) break
    }
    selected.push(available[index] as SkillId)
    available.splice(index, 1)
  }
  return selected
}

function uniqueExercise(skillId: SkillId, seed: number, difficulty: Difficulty, lastVariantKey?: string | null): Exercise {
  let exercise = generateExercise(skillId, seed, difficulty)
  let attempt = 1
  while (exercise.variant.key === lastVariantKey && attempt < 5) {
    exercise = generateExercise(skillId, seed + attempt * 97, difficulty)
    attempt += 1
  }
  return exercise
}

export function createSessionPlan(progress: ProgressMap, seed = dailySeed() + Date.now() % 10_000): SessionPlan {
  const warmups: SkillId[] = seed % 2 === 0
    ? ['addition', 'multiplication']
    : ['subtraction', 'division']
  const focus = weightedSkills(progress, seed + 31, 3)
  const skills = [...warmups, ...focus, 'word-problem', 'symmetry'] as SkillId[]
  const exercises = skills.map((skillId, index) => {
    const skillProgress = progress[skillId]
    return uniqueExercise(skillId, seed + (index + 1) * 113, skillProgress?.difficulty ?? 1, skillProgress?.lastVariantKey)
  })
  return {
    id: `session-${seed}`,
    seed,
    startedAt: new Date().toISOString(),
    exercises
  }
}

export function createRepetitionExercise(skillId: SkillId, seed: number, difficulty: Difficulty, lastVariantKey: string): Exercise {
  const easier = Math.max(1, difficulty - 1) as Difficulty
  return uniqueExercise(skillId, seed + 7_919, easier, lastVariantKey)
}
