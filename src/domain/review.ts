import { generateExercise } from './generators'
import { createRemediationExercise } from './session'
import type { Exercise, ReviewScenario } from './types'

export function reviewScenarioKey(scenario: ReviewScenario): string {
  return [scenario.skillId, scenario.phase, scenario.difficulty, scenario.seed, scenario.errorPath ?? 'base'].join(':')
}

export function createReviewExercise(scenario: ReviewScenario): Exercise {
  const exercise = generateExercise(scenario.skillId, scenario.seed, scenario.difficulty, undefined, scenario.phase)
  return scenario.errorPath === 'remediation'
    ? createRemediationExercise(exercise, scenario.seed)
    : exercise
}
