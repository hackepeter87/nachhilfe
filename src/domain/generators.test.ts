import { describe, expect, it } from 'vitest'
import { generateExercise, isAnswerCorrect, mirrorGrid } from './generators'
import type { SkillId } from './types'

const skills: SkillId[] = [
  'addition', 'subtraction', 'multiplication', 'division', 'place-value', 'decompose', 'compose',
  'neighbor-tens', 'neighbor-hundreds', 'round-tens', 'round-hundreds', 'word-problem', 'symmetry'
]

describe('deterministische Aufgabengeneratoren', () => {
  it.each(skills)('erzeugt für %s reproduzierbare eindeutige Varianten', (skill) => {
    const first = generateExercise(skill, 4_242, 2)
    const second = generateExercise(skill, 4_242, 2)
    expect(second).toEqual(first)
    expect(first.hints).toHaveLength(2)
    expect(first.explanation.length).toBeGreaterThan(10)
    expect(isAnswerCorrect(first, first.correctAnswer)).toBe(true)
    if (first.options) {
      expect(first.options.filter((option) => option.value === first.correctAnswer)).toHaveLength(1)
    }
    first.steps?.forEach((step) => {
      expect(step.options.filter((option) => option.value === step.correctAnswer)).toHaveLength(1)
    })
  })

  it('hält Addition und Subtraktion über viele Seeds im Zahlenraum bis 20', () => {
    for (let seed = 1; seed <= 400; seed += 1) {
      const addition = generateExercise('addition', seed, 3)
      const subtraction = generateExercise('subtraction', seed, 3)
      expect(Number(addition.correctAnswer)).toBeGreaterThanOrEqual(0)
      expect(Number(addition.correctAnswer)).toBeLessThanOrEqual(20)
      expect(Number(subtraction.correctAnswer)).toBeGreaterThanOrEqual(0)
      expect(Number(subtraction.correctAnswer)).toBeLessThanOrEqual(20)
    }
  })

  it('erzeugt ausschließlich Divisionen ohne Rest', () => {
    for (let seed = 1; seed <= 400; seed += 1) {
      const exercise = generateExercise('division', seed, 3)
      const dividend = Number(exercise.variant.values.dividend)
      const divisor = Number(exercise.variant.values.divisor)
      expect(dividend % divisor).toBe(0)
      expect(dividend / divisor).toBe(Number(exercise.correctAnswer))
    }
  })

  it.each([
    ['neighbor-tens', 10],
    ['neighbor-hundreds', 100]
  ] as const)('bestimmt korrekte Nachbarzahlen für %s', (skill, unit) => {
    for (let seed = 1; seed <= 300; seed += 1) {
      const exercise = generateExercise(skill, seed)
      const number = Number(exercise.variant.values.number)
      const lower = Number(exercise.variant.values.lower)
      const upper = Number(exercise.variant.values.upper)
      expect(lower).toBe(Math.floor(number / unit) * unit)
      expect(upper).toBe(lower + unit)
      expect(exercise.correctAnswer).toBe(`${lower} und ${upper}`)
    }
  })

  it.each([
    ['round-tens', 10],
    ['round-hundreds', 100]
  ] as const)('rundet für %s einschließlich Grenzfällen korrekt', (skill, unit) => {
    let halfBoundarySeen = false
    for (let seed = 1; seed <= 2_000; seed += 1) {
      const exercise = generateExercise(skill, seed)
      const number = Number(exercise.variant.values.number)
      if (number % unit === unit / 2) halfBoundarySeen = true
      expect(Number(exercise.correctAnswer)).toBe(Math.round(number / unit) * unit)
    }
    expect(halfBoundarySeen).toBe(true)
  })

  it('zerlegt und baut Zahlen stellenwertgerecht', () => {
    for (let seed = 1; seed <= 300; seed += 1) {
      const decomposition = generateExercise('decompose', seed)
      const composition = generateExercise('compose', seed)
      const decomposedValue = decomposition.correctAnswer.split(' + ').reduce((sum, value) => sum + Number(value), 0)
      expect(decomposedValue).toBe(Number(decomposition.variant.values.number))
      expect(Number(composition.correctAnswer)).toBe(
        Number(composition.variant.values.hundreds) * 100 +
        Number(composition.variant.values.tens) * 10 +
        Number(composition.variant.values.ones)
      )
    }
  })

  it('liefert für Symmetrie genau eine echte Spiegelung', () => {
    for (let seed = 1; seed <= 100; seed += 1) {
      const exercise = generateExercise('symmetry', seed)
      const correct = exercise.options?.find((option) => option.value === exercise.correctAnswer)
      expect(correct?.grid).toEqual(mirrorGrid(exercise.sourceGrid ?? []))
      expect(new Set(exercise.options?.map((option) => JSON.stringify(option.grid))).size).toBe(3)
    }
  })

  it('hält alle Sachaufgabenschritte eindeutig und rechnerisch konsistent', () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const exercise = generateExercise('word-problem', seed)
      const first = Number(exercise.variant.values.first)
      const second = Number(exercise.variant.values.second)
      const operation = exercise.variant.values.operation
      const expected = operation === '+' ? first + second : first - second
      expect(Number(exercise.variant.values.result)).toBe(expected)
      expect(exercise.steps).toHaveLength(4)
      exercise.steps?.forEach((step) => {
        expect(step.options.filter((option) => option.value === step.correctAnswer)).toHaveLength(1)
      })
    }
  })
})
