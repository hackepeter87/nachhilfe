import { describe, expect, it } from 'vitest'
import { getLearningPhaseModel, getTaskCatalog } from '../content/catalog'
import { defaultLearningPhaseForDifficulty, generateExercise } from './generators'
import type { Exercise, ExerciseRepresentation, LearningPhase } from './types'

const PHASES: LearningPhase[] = ['activate', 'understand', 'guided-practice', 'independent-practice', 'automate', 'transfer']

function difficultyForPhase(phase: LearningPhase) {
  return phase === 'independent-practice' ? 2 : phase === 'automate' || phase === 'transfer' ? 3 : 1
}

function representationsOf(exercise: Exercise): ExerciseRepresentation[] {
  return [
    exercise.representation,
    ...(exercise.options ?? []).map((option) => option.representation),
    ...(exercise.steps ?? []).flatMap((step) => [step.representation, ...(step.options ?? []).map((option) => option.representation)])
  ].filter((entry): entry is ExerciseRepresentation => Boolean(entry))
}

describe('curriculare Konvergenz 0.30', () => {
  it('führt auch direkte Generatoraufrufe ausschließlich über den sechsphasigen Runtimepfad', () => {
    for (const skill of getTaskCatalog().skills.filter((entry) => entry.releaseStatus === 'active')) {
      for (const difficulty of [1, 2, 3] as const) {
        const exercise = generateExercise(skill.id, 30_000 + difficulty, difficulty)
        const phase = defaultLearningPhaseForDifficulty(skill.id, difficulty)
        expect(phase).toBe(skill.difficultyLevels[difficulty - 1].learningPhase)
        const allowedTypes = skill.learningPhases.find((entry) => entry.id === phase)?.exerciseTypes ?? []
        expect(exercise.learningPhase, `${skill.id}/Stufe ${difficulty}`).toBe(phase)
        expect(allowedTypes, `${skill.id}/${phase}/${exercise.typeId}`).toContain(`${skill.id}:${exercise.typeId}`)
      }
    }
  })

  it('prüft alle aktiven Kompetenzen in sechs Lernphasen über je 1.000 Seeds', () => {
    const activeSkills = getTaskCatalog().skills.filter((entry) => entry.releaseStatus === 'active')
    expect(activeSkills).toHaveLength(34)
    let generated = 0
    for (const skill of activeSkills) {
      expect(skill.learningPhases.map((phase) => phase.id)).toEqual(PHASES)
      expect(new Set(skill.learningPhases.map((phase) => phase.goal)).size, `${skill.id}: doppelte Lernziele`).toBe(6)
      expect(skill.misconceptionFeedback?.length, `${skill.id}: keine produktive Fehlvorstellungsroute`).toBeGreaterThan(0)
      const seenTypes = new Set<string>()
      for (const phase of PHASES) {
        const difficulty = difficultyForPhase(phase)
        const catalogPhase = skill.learningPhases.find((entry) => entry.id === phase)!
        expect(catalogPhase.exerciseTypes.length, `${skill.id}/${phase}: kein katalogisierter Typ`).toBeGreaterThan(0)
        for (let seed = 1; seed <= 1_000; seed += 1) {
          const exercise = generateExercise(skill.id, seed, difficulty, undefined, phase)
          const context = `${skill.id}/${phase}/Seed ${seed}`
          expect(exercise.learningPhase, context).toBe(phase)
          expect(exercise.learningAction, context).toBe(getLearningPhaseModel(phase).learningAction)
          expect(catalogPhase.exerciseTypes, `${context}/${exercise.typeId}`).toContain(`${skill.id}:${exercise.typeId}`)
          expect(exercise.remediation.strategy.trim().length, context).toBeGreaterThan(0)
          for (const representation of representationsOf(exercise)) {
            expect(representation.valueRoles.revealedValues, `${context}/${representation.kind}`).toEqual([])
            expect(representation.valueRoles.unknownValues.some((key) => representation.valueRoles.knownValues.includes(key)), `${context}/${representation.kind}`).toBe(false)
          }
          if (exercise.options) {
            expect(new Set(exercise.options.map((option) => option.value)).size, context).toBe(exercise.options.length)
            expect(exercise.options.filter((option) => option.value === exercise.correctAnswer), context).toHaveLength(1)
          }
          seenTypes.add(exercise.typeId)
          generated += 1
        }
      }
      expect(seenTypes.size, `${skill.id}: keine sechs unterschiedlichen Runtime-Typen`).toBe(6)
    }
    expect(generated).toBe(34 * 6 * 1_000)
  }, 120_000)
})
