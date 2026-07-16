import { describe, expect, it } from 'vitest'
import { createRoundingExercise, generateExercise, isAnswerCorrect, mirrorGrid, roundToUnit } from './generators'
import type { SkillId } from './types'

const skills: SkillId[] = [
  'addition', 'subtraction', 'multiplication', 'division', 'place-value', 'decompose', 'compose',
  'neighbor-tens', 'neighbor-hundreds', 'round-tens', 'round-hundreds',
  'addition-1000', 'subtraction-1000', 'complement-1000', 'word-problem', 'symmetry'
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

  it.each([
    [5, 10, 10],
    [14, 10, 10],
    [15, 10, 20],
    [994, 10, 990],
    [995, 10, 1000],
    [949, 100, 900],
    [950, 100, 1000]
  ] as const)('rundet %i auf den nächsten %i korrekt zu %i', (number, unit, expected) => {
    const exercise = createRoundingExercise(number, unit)
    expect(roundToUnit(number, unit)).toBe(expected)
    expect(Number(exercise.correctAnswer)).toBe(expected)
    expect(exercise.options).toHaveLength(3)
    expect(exercise.options?.every((option) => Number(option.value) >= 0 && Number(option.value) <= 1000)).toBe(true)
  })

  it.each([
    [995, 10],
    [950, 100]
  ] as const)('erklärt den Halbpunkt bei %i fachlich korrekt', (number, unit) => {
    const exercise = createRoundingExercise(number, unit)
    expect(exercise.explanation).toContain('beide')
    expect(exercise.explanation).toContain('Halbpunkt')
    expect(exercise.explanation).toContain('aufgerundet')
  })

  it.each(['round-tens', 'round-hundreds'] as const)('erzeugt für %s ausschließlich Antwortoptionen von 0 bis 1000', (skill) => {
    for (let seed = 1; seed <= 5_000; seed += 1) {
      const exercise = generateExercise(skill, seed)
      expect(exercise.options?.every((option) => {
        const value = Number(option.value)
        return Number.isInteger(value) && value >= 0 && value <= 1000
      })).toBe(true)
    }
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
    for (const difficulty of [1, 2, 3] as const) {
      for (let seed = 1; seed <= 200; seed += 1) {
        const exercise = generateExercise('word-problem', seed, difficulty)
        const first = Number(exercise.variant.values.first)
        const second = Number(exercise.variant.values.second)
        const operation = exercise.variant.values.operation
        const expected = operation === '+' ? first + second : operation === '−' ? first - second : first * second
        expect(Number(exercise.variant.values.result)).toBe(expected)
        expect(exercise.steps).toHaveLength(difficulty === 1 ? 4 : difficulty === 2 ? 6 : 7)
        expect(exercise.prompt).not.toMatch(/\{\w+\}/)
        exercise.steps?.forEach((step) => {
          expect(step.options).toHaveLength(3)
          expect(new Set(step.options.map((option) => option.value)).size).toBe(3)
          expect(step.options.filter((option) => option.value === step.correctAnswer)).toHaveLength(1)
        })
      }
    }
  })

  it('liefert für jede produktive Auswahlaufgabe drei eindeutige Optionen', () => {
    for (const skill of skills) {
      for (const difficulty of [1, 2, 3] as const) {
        for (let seed = 1; seed <= 120; seed += 1) {
          const exercise = generateExercise(skill, seed, difficulty)
          if (exercise.options) {
            expect(exercise.options).toHaveLength(3)
            expect(new Set(exercise.options.map((option) => option.value)).size).toBe(3)
          }
        }
      }
    }
  })

  it.each([
    'addition', 'subtraction', 'multiplication', 'division', 'place-value', 'decompose', 'compose',
    'neighbor-tens', 'neighbor-hundreds', 'round-tens', 'round-hundreds',
    'addition-1000', 'subtraction-1000', 'complement-1000', 'word-problem'
  ] as SkillId[])('macht die didaktischen Stufen bei %s wirksam', (skill) => {
    const easy = generateExercise(skill, 315, 1)
    const medium = generateExercise(skill, 315, 2)
    const hard = generateExercise(skill, 315, 3)
    expect(easy.testMetadata.cognitiveSteps).toBeLessThan(medium.testMetadata.cognitiveSteps)
    expect(medium.testMetadata.cognitiveSteps).toBeLessThan(hard.testMetadata.cognitiveSteps)
    expect(easy.representation?.visibility).toBe('always')
    expect(medium.representation?.visibility).toBe('hint')
    expect(hard.representation).toBeUndefined()
  })

  it('vergrößert das Symmetrieraster und stärkt die Distraktoren stufenweise', () => {
    const easy = generateExercise('symmetry', 22, 1)
    const medium = generateExercise('symmetry', 22, 2)
    const hard = generateExercise('symmetry', 22, 3)
    expect(easy.sourceGrid).toHaveLength(3)
    expect(medium.sourceGrid).toHaveLength(4)
    expect(hard.sourceGrid).toHaveLength(5)
    ;[easy, medium, hard].forEach((exercise) => {
      expect(new Set(exercise.options?.map((option) => JSON.stringify(option.grid))).size).toBe(3)
    })
  })

  it('spiegelt auf Stufe 3 passend zur angegebenen Achse', () => {
    for (let seed = 1; seed <= 100; seed += 1) {
      const exercise = generateExercise('symmetry', seed, 3)
      const correct = exercise.options?.find((option) => option.value === 'mirror')?.grid
      const expected = exercise.variant.values.axis === 'waagerechten'
        ? [...exercise.sourceGrid!].reverse().map((row) => [...row])
        : mirrorGrid(exercise.sourceGrid!)
      expect(correct).toEqual(expected)
      expect(exercise.prompt).toContain(String(exercise.variant.values.axis))
    }
  })

  it('hält Rechenstrategien bis 1000 im Zahlenraum und fachlich konsistent', () => {
    for (const skill of ['addition-1000', 'subtraction-1000', 'complement-1000'] as const) {
      for (const difficulty of [1, 2, 3] as const) {
        for (let seed = 1; seed <= 300; seed += 1) {
          const exercise = generateExercise(skill, seed, difficulty)
          const first = Number(exercise.variant.values.first)
          const answer = Number(exercise.correctAnswer)
          expect(answer).toBeGreaterThanOrEqual(0)
          expect(answer).toBeLessThanOrEqual(1000)
          if (skill === 'addition-1000') expect(answer).toBe(first + Number(exercise.variant.values.second))
          if (skill === 'subtraction-1000') expect(answer).toBe(first - Number(exercise.variant.values.second))
          if (skill === 'complement-1000') expect(answer).toBe(Number(exercise.variant.values.target) - first)
          expect(exercise.hints.join(' ')).not.toMatch(/\{\w+\}/)
          expect(exercise.explanation).not.toMatch(/\{\w+\}/)
        }
      }
    }
  })
})
