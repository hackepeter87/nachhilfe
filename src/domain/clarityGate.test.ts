import { describe, expect, it } from 'vitest'
import { getTaskCatalog } from '../content/catalog'
import { generateExercise } from './generators'
import type { Exercise, ExerciseRepresentation, LearningPhase } from './types'

const PHASES: LearningPhase[] = ['activate', 'understand', 'guided-practice', 'independent-practice', 'automate', 'transfer']
const INTERNAL_LANGUAGE = /Grundlage von|Mengenbeziehung|Subskill|Runtime|Katalogeintrag|Kompetenzwert|Diagnosewert/i

function learnerFacingText(exercise: Exercise): string[] {
  return [
    exercise.title,
    exercise.prompt,
    exercise.successFeedback,
    exercise.errorFeedback,
    exercise.explanation,
    exercise.remediation.strategy,
    ...exercise.hints.map((hint) => hint.text),
    ...(exercise.options ?? []).flatMap((option) => [option.label, option.misconceptionFeedback ?? '']),
    ...(exercise.steps ?? []).flatMap((step) => [
      step.prompt,
      step.errorFeedback,
      step.successFeedback,
      ...(step.options ?? []).flatMap((option) => [option.label, option.misconceptionFeedback ?? ''])
    ])
  ].filter(Boolean)
}

function representations(exercise: Exercise): ExerciseRepresentation[] {
  return [
    exercise.representation,
    ...(exercise.options ?? []).map((option) => option.representation),
    ...(exercise.steps ?? []).flatMap((step) => [step.representation, ...(step.options ?? []).map((option) => option.representation)])
  ].filter((entry): entry is ExerciseRepresentation => Boolean(entry))
}

describe('verbindliches Verstaendlichkeits-Gate ab 0.31', () => {
  it('verwendet in keiner aktiven Familie interne Projekt- oder Diagnosesprache', () => {
    const activeSkills = getTaskCatalog().skills.filter((skill) => skill.releaseStatus === 'active')
    for (const skill of activeSkills) {
      for (const phase of PHASES) {
        for (let seed = 1; seed <= 100; seed += 1) {
          const exercise = generateExercise(skill.id, seed, phase === 'transfer' || phase === 'automate' ? 3 : phase === 'independent-practice' ? 2 : 1, undefined, phase)
          for (const text of learnerFacingText(exercise)) expect(text, `${skill.id}/${phase}/${seed}`).not.toMatch(INTERNAL_LANGUAGE)
        }
      }
    }
  }, 20_000)

  it('verwendet keine passiven Weiter-Schritte als Ersatz fuer eine mathematische Handlung', () => {
    for (const skill of getTaskCatalog().skills.filter((entry) => entry.releaseStatus === 'active')) {
      for (const phase of PHASES) {
        for (let seed = 1; seed <= 100; seed += 1) {
          const exercise = generateExercise(skill.id, seed, 2, undefined, phase)
          expect(exercise.steps?.some((step) => step.interaction === 'continue') ?? false, `${skill.id}/${phase}/${seed}`).toBe(false)
        }
      }
    }
  })

  it('zeigt bei einfachen Sachaufgaben das offene Modell waehrend Rechnung und eigener Berechnung ohne passiven Modellschritt', () => {
    for (const phase of ['activate', 'understand', 'guided-practice'] as const) {
      for (let seed = 1; seed <= 1_000; seed += 1) {
        const exercise = generateExercise('word-problem', seed, 1, undefined, phase)
        expect(exercise.steps?.some((step) => step.id === 'model')).toBe(false)
        expect(exercise.steps?.some((step) => step.interaction === 'guided-number')).toBe(true)
        expect(exercise.representation?.valueRoles.unknownValues.length).toBeGreaterThan(0)
        expect(exercise.representation?.valueRoles.revealedValues).toEqual([])
        expect(exercise.steps?.findIndex((step) => step.interaction === 'guided-number')).toBeLessThan(
          exercise.steps?.findIndex((step) => step.id === 'check') ?? Number.MAX_SAFE_INTEGER
        )
      }
    }
  })

  it('haelt mathematische Rollen auch in allen Auswahl- und Schrittdarstellungen widerspruchsfrei', () => {
    for (const skill of getTaskCatalog().skills.filter((entry) => entry.releaseStatus === 'active')) {
      for (const phase of PHASES) {
        for (let seed = 1; seed <= 100; seed += 1) {
          for (const representation of representations(generateExercise(skill.id, seed, 2, undefined, phase))) {
            const roles = representation.valueRoles
            expect(roles.knownValues.some((value) => roles.unknownValues.includes(value)), `${skill.id}/${phase}/${seed}`).toBe(false)
            expect(roles.revealedValues, `${skill.id}/${phase}/${seed}`).toEqual([])
          }
        }
      }
    }
  })

  it('verwendet eindeutige Bezugsgrößen und beobachtbare Aufgaben statt der beanstandeten Listenquizfragen', () => {
    const catalog = getTaskCatalog()
    for (const content of [catalog.quantityContent.mass, catalog.quantityContent.capacity]) {
      for (const estimate of content.referenceEstimates) {
        expect(new Set(estimate.options).size, estimate.id).toBe(estimate.options.length)
        expect(estimate.options.filter((option) => option === estimate.correct), estimate.id).toHaveLength(1)
        expect(estimate.label, estimate.id).not.toMatch(/^eine? (Flasche|Becher|Dose)$/i)
      }
    }
    for (let seed = 1; seed <= 1_000; seed += 1) {
      const probability = generateExercise('probability', seed, 2, undefined, 'understand')
      const combinations = generateExercise('combinatorics', seed, 2, undefined, 'guided-practice')
      expect(probability.prompt).not.toMatch(/Welche Liste/)
      expect(probability.options?.map((option) => option.label).join(' ')).not.toMatch(/anderes Ergebnis/i)
      expect(combinations.steps?.map((step) => step.id)).toEqual(['missingPair', 'count'])
      expect(combinations.representation?.valueRoles.unknownValues).toEqual(expect.arrayContaining(['missingPair', 'combinationCount']))
    }
  })
})
