import { describe, expect, it } from 'vitest'
import { getTaskCatalog } from '../content/catalog'
import { generateExercise } from './generators'

describe('Regressionen aus der manuellen Kinderansicht', () => {
  it('stellt die Tauschaufgabe wirklich in getauschter Reihenfolge dar und erklärt genau dieses Lernziel', () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const exercise = generateExercise('addition', seed, 3, undefined, 'transfer')
      const first = Number(exercise.variant.values.first)
      const second = Number(exercise.variant.values.second)
      expect(exercise.correctAnswer).toBe(`${second} + ${first} = ${first + second}`)
      expect(exercise.representation?.values).toMatchObject({ first: second, second: first })
      expect(`${exercise.successFeedback} ${exercise.explanation}`).toMatch(/Tauschaufgabe|tauschen/i)
      expect(`${exercise.successFeedback} ${exercise.explanation}`).not.toMatch(/kleine Schritte|zerlegen/i)
    }
  })

  it('führt einfache Sachaufgaben ohne kopierte Frage und ohne freie Gleichungseingabe', () => {
    for (const phase of ['activate', 'understand', 'guided-practice', 'automate'] as const) {
      for (let seed = 1; seed <= 200; seed += 1) {
        const exercise = generateExercise('word-problem', seed, 1, undefined, phase)
        expect(exercise.steps?.some((step) => step.id === 'question')).toBe(false)
        expect(exercise.steps?.some((step) => step.id === 'relevant')).toBe(false)
        expect(exercise.steps?.some((step) => step.interaction === 'guided-equation')).toBe(false)
        const equation = exercise.steps?.find((step) => step.id === 'equation')
        if (equation) {
          expect(equation.interaction).toBe('select')
          expect(equation.options?.filter((option) => option.value === equation.correctAnswer)).toHaveLength(1)
        }
      }
    }
  })

  it('erklärt schriftliche Subtraktionen ohne Entbündelung auch ohne Entbündelungsjargon', () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const exercise = generateExercise('written-subtraction', seed, 1, undefined, 'guided-practice')
      expect(exercise.variant.values.unbundle).toBe(0)
      expect(exercise.explanation).toMatch(/nichts entbündelt|kein/i)
      expect(exercise.steps?.map((step) => step.errorFeedback).join(' ')).not.toMatch(/zehn Einheiten|linken Stelle/i)
    }
  })

  it('prüft Stellenwertausrichtung mit einer kürzeren zweiten Zahl', () => {
    for (const skillId of ['written-addition', 'written-subtraction'] as const) {
      for (let seed = 1; seed <= 200; seed += 1) {
        const exercise = generateExercise(skillId, seed, 1, undefined, 'activate')
        expect(Number(exercise.variant.values.first)).toBeGreaterThanOrEqual(100)
        expect(Number(exercise.variant.values.second)).toBeLessThan(100)
        expect(exercise.steps?.[0]?.interaction).toBe('place-value-input')
      }
    }
  })

  it('liefert keine Listenfrage und keinen Fantasieausgang beim Zufallsexperiment', () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const exercise = generateExercise('probability', seed, 2, undefined, 'understand')
      expect(exercise.prompt).toMatch(/Vorhersage/)
      expect(exercise.prompt).not.toMatch(/Welche Liste/)
      expect(exercise.options?.map((option) => option.label).join(' ')).not.toMatch(/anderes Ergebnis/)
    }
  })

  it('enthält keine mehrdeutige unbestimmte Wasserflasche als Bezugsgröße', () => {
    const capacity = getTaskCatalog().quantityContent.capacity
    expect(capacity.referenceEstimates.map((estimate) => estimate.id)).not.toContain('bottle')
    expect(capacity.referenceEstimates.map((estimate) => estimate.label).join(' ')).not.toMatch(/Wasserflasche/)
  })

  it('beginnt ebene Geometrie mit einem Eigenschaftsvergleich statt bloßem Eckenabzählen', () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const exercise = generateExercise('plane-shapes', seed, 1, undefined, 'activate')
      expect(exercise.prompt).toMatch(/Vergleiche/)
      expect(exercise.prompt).not.toMatch(/Wie viele Ecken/)
      expect(exercise.representation?.values.mode).toBe('compare')
    }
  })
})
