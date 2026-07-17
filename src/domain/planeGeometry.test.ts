import { describe, expect, it } from 'vitest'
import { generateExercise, isAnswerCorrect } from './generators'
import { areaInUnitSquares, isConnectedGridFigure, perimeterInUnitEdges, validateGridCells } from './planeGeometry'
import type { Difficulty, Exercise, SkillId } from './types'

function assertChoice(exercise: Exercise) {
  expect(exercise.options).toHaveLength(3)
  expect(new Set(exercise.options?.map((option) => option.value)).size).toBe(3)
  expect(exercise.options?.filter((option) => option.value === exercise.correctAnswer)).toHaveLength(1)
  expect(isAnswerCorrect(exercise, exercise.correctAnswer)).toBe(true)
}

describe('Ebene Figuren, Muster, Fläche und Umfang', () => {
  it('berechnet Fläche und Umfang reiner Rasterfiguren exakt', () => {
    const rectangle = [1, 1, 1, 1, 1, 1]
    expect(validateGridCells(2, 3, rectangle)).toBe(true)
    expect(isConnectedGridFigure(2, 3, rectangle)).toBe(true)
    expect(areaInUnitSquares(2, 3, rectangle)).toBe(6)
    expect(perimeterInUnitEdges(2, 3, rectangle)).toBe(10)

    const lShape = [1, 0, 1, 0, 1, 1]
    expect(isConnectedGridFigure(3, 2, lShape)).toBe(true)
    expect(areaInUnitSquares(3, 2, lShape)).toBe(4)
    expect(perimeterInUnitEdges(3, 2, lShape)).toBe(10)
    expect(isConnectedGridFigure(2, 2, [1, 0, 0, 1])).toBe(false)
    expect(() => perimeterInUnitEdges(2, 2, [1])).toThrow(RangeError)
  })

  it.each(['plane-shapes', 'patterns', 'area', 'perimeter'] as SkillId[])('erzeugt %s je Stufe über 1.000 Seeds eindeutig und deterministisch', (skillId) => {
    for (const difficulty of [1, 2, 3] as Difficulty[]) {
      const typeIds = new Set<string>()
      for (let seed = 1; seed <= 1_000; seed += 1) {
        const exercise = generateExercise(skillId, seed, difficulty)
        const repeat = generateExercise(skillId, seed, difficulty)
        expect(repeat).toEqual(exercise)
        assertChoice(exercise)
        expect(exercise.representation?.valueRoles.unknownValues).toEqual(['answerLabel'])
        typeIds.add(exercise.typeId)
        if (skillId === 'area' || skillId === 'perimeter') {
          const values = exercise.representation!.values
          const rows = Number(values.rows)
          const columns = Number(values.columns)
          const cells = (values.cells as number[]).map(Number)
          expect(validateGridCells(rows, columns, cells)).toBe(true)
          expect(isConnectedGridFigure(rows, columns, cells)).toBe(true)
          const expected = skillId === 'area' ? areaInUnitSquares(rows, columns, cells) : perimeterInUnitEdges(rows, columns, cells)
          expect(Number(exercise.correctAnswer)).toBe(expected)
          if (difficulty < 3) expect(cells.every((cell) => cell === 1)).toBe(true)
          else expect(cells.some((cell) => cell === 0)).toBe(true)
        }
        if (skillId === 'patterns') {
          const values = exercise.representation!.values
          const count = Number(values.sequenceCount)
          const blockLength = Number(values.blockLength)
          const sequence = Array.from({ length: count }, (_, index) => String(values[`symbol${index}`]))
          expect(exercise.correctAnswer).toBe(sequence[count % blockLength])
        }
      }
      expect(typeIds.size).toBeGreaterThanOrEqual(1)
    }
  })

  it.each(['plane-shapes', 'patterns', 'area', 'perimeter'] as SkillId[])('liefert für %s eine leichtere nicht identische Remediation', (skillId) => {
    const hard = generateExercise(skillId, 7_701, 3)
    const easier = generateExercise(skillId, 7_702, 2)
    expect(easier.difficulty).toBe(2)
    expect(easier.variant.key).not.toBe(hard.variant.key)
    expect(easier.representation?.visibility).toBe('always')
  })
})
