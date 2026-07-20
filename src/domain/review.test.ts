import { describe, expect, it } from 'vitest'
import { createReviewExercise, reviewScenarioKey } from './review'
import type { ReviewScenario } from './types'

const scenario: ReviewScenario = {
  skillId: 'round-hundreds',
  phase: 'guided-practice',
  difficulty: 2,
  seed: 801
}

describe('didaktischer Pruefstand', () => {
  it('erzeugt ein Szenario deterministisch mit der angeforderten Lernphase', () => {
    const first = createReviewExercise(scenario)
    const second = createReviewExercise(scenario)

    expect(second).toEqual(first)
    expect(first.skillId).toBe('round-hundreds')
    expect(first.learningPhase).toBe('guided-practice')
    expect(first.difficulty).toBe(2)
    expect(reviewScenarioKey(scenario)).toBe('round-hundreds:guided-practice:2:801:base')
  })

  it('erzeugt eine leichtere verwandte Remediationsaufgabe statt einer zweiten Runtime', () => {
    const base = createReviewExercise(scenario)
    const remediation = createReviewExercise({ ...scenario, errorPath: 'remediation' })

    expect(remediation.skillId).toBe(base.skillId)
    expect(remediation.variant.key).not.toBe(base.variant.key)
    expect(remediation.difficulty).toBeLessThanOrEqual(base.difficulty)
  })
})
