import { describe, expect, it } from 'vitest'
import { generateExercise } from './generators'
import { SKILL_IDS, type ExerciseRepresentation } from './types'

function representationsFor(seed: number, difficulty: 1 | 2 | 3): ExerciseRepresentation[] {
  return SKILL_IDS.flatMap((skillId) => {
    const exercise = generateExercise(skillId, seed, difficulty)
    return [
      exercise.representation,
      ...(exercise.options ?? []).map((option) => option.representation),
      ...(exercise.steps ?? []).flatMap((step) => [
        step.representation,
        ...(step.options ?? []).map((option) => option.representation)
      ])
    ].filter((entry): entry is ExerciseRepresentation => Boolean(entry))
  })
}

describe('mathematische Rollen aller Darstellungen', () => {
  it('ordnet bekannte, unbekannte und aufgedeckte Größen widerspruchsfrei zu', () => {
    for (const difficulty of [1, 2, 3] as const) {
      for (let seed = 1; seed <= 200; seed += 1) {
        for (const representation of representationsFor(seed, difficulty)) {
          const { knownValues, unknownValues, revealedValues } = representation.valueRoles
          expect(new Set(knownValues).size, representation.label).toBe(knownValues.length)
          expect(new Set(unknownValues).size, representation.label).toBe(unknownValues.length)
          expect(new Set(revealedValues).size, representation.label).toBe(revealedValues.length)
          expect(knownValues.every((key) => key in representation.values), representation.label).toBe(true)
          expect(Object.keys(representation.values).every((key) => knownValues.includes(key) || unknownValues.includes(key)), representation.label).toBe(true)
          expect(unknownValues.some((key) => knownValues.includes(key)), representation.label).toBe(false)
          expect(revealedValues.every((key) => unknownValues.includes(key)), representation.label).toBe(true)
        }
      }
    }
  })

  it('maskiert die gesuchten Werte in allen betroffenen produktiven Darstellungen', () => {
    const expectedUnknowns: Partial<Record<(typeof SKILL_IDS)[number], string[]>> = {
      addition: ['end'],
      subtraction: ['end'],
      multiplication: ['total'],
      division: ['groups'],
      'neighbor-tens': ['start', 'end'],
      'neighbor-hundreds': ['start', 'end'],
      'addition-1000': ['result'],
      'written-addition': ['result'],
      'subtraction-1000': ['result'],
      'written-subtraction': ['result'],
      'complement-1000': ['jumps'],
      money: ['displayedCents'],
      lengths: ['lengthCm'],
      probability: ['classification'],
      combinatorics: ['combinationCount'],
      time: ['answerLabel'],
      mass: ['answerLabel'],
      capacity: ['answerLabel']
    }
    for (const [skillId, expected] of Object.entries(expectedUnknowns)) {
      const exercise = generateExercise(skillId as (typeof SKILL_IDS)[number], 42, 1)
      expect(exercise.representation?.valueRoles.unknownValues, skillId).toEqual(expect.arrayContaining(expected!))
      expect(exercise.representation?.valueRoles.revealedValues, skillId).toEqual([])
    }
  })
})
