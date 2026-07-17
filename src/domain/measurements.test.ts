import { describe, expect, it } from 'vitest'
import { formatBaseQuantity, formatClockTime, generateExercise, isAnswerCorrect } from './generators'
import type { Difficulty, Exercise, SkillId } from './types'

function assertUniqueChoice(exercise: Exercise) {
  expect(exercise.options).toHaveLength(3)
  expect(new Set(exercise.options?.map((option) => option.value)).size).toBe(3)
  expect(exercise.options?.filter((option) => option.value === exercise.correctAnswer)).toHaveLength(1)
  expect(isAnswerCorrect(exercise, exercise.correctAnswer)).toBe(true)
}

function clockMinutes(hour: unknown, minute: unknown): number {
  return Number(hour) * 60 + Number(minute)
}

describe('Zeit, Masse und Rauminhalt', () => {
  it('formatiert nur gültige Uhrzeiten und Grundmengen', () => {
    expect(formatClockTime(8, 5)).toBe('08:05 Uhr')
    expect(formatClockTime(17, 45)).toBe('17:45 Uhr')
    expect(() => formatClockTime(24, 0)).toThrow(RangeError)
    expect(() => formatClockTime(8, 60)).toThrow(RangeError)
    expect(formatBaseQuantity(1000, 'mass')).toBe('1 kg')
    expect(formatBaseQuantity(1000, 'capacity')).toBe('1 l')
    expect(formatBaseQuantity(250, 'mass')).toBe('250 g')
    expect(formatBaseQuantity(250, 'capacity')).toBe('250 ml')
    expect(() => formatBaseQuantity(1001, 'mass')).toThrow(RangeError)
  })

  it.each([1, 2, 3] as Difficulty[])('erzeugt Zeitaufgaben der Stufe %i über 1.000 Seeds korrekt', (difficulty) => {
    for (let seed = 1; seed <= 1_000; seed += 1) {
      const exercise = generateExercise('time', seed, difficulty)
      const values = exercise.representation?.values ?? {}
      assertUniqueChoice(exercise)
      expect(exercise.representation?.kind).toBe('clock')
      expect(exercise.representation?.valueRoles.unknownValues).toEqual(['answerLabel'])
      if (difficulty < 3) {
        const hour = Number(values.hour)
        const minute = Number(values.minute)
        expect(hour).toBeGreaterThanOrEqual(1)
        expect(hour).toBeLessThanOrEqual(12)
        expect(exercise.correctAnswer).toBe(formatClockTime(hour, minute))
        if (difficulty === 1) expect([0, 30]).toContain(minute)
        else {
          expect(minute % 5).toBe(0)
          expect([0, 30]).not.toContain(minute)
        }
      } else {
        const start = clockMinutes(values.startHour, values.startMinute)
        const end = clockMinutes(values.endHour, values.endMinute)
        const duration = Number(exercise.correctAnswer)
        expect(start).toBeGreaterThanOrEqual(8 * 60)
        expect(end).toBeLessThanOrEqual(17 * 60)
        expect(end - start).toBe(duration)
        expect([15, 30, 45, 60, 75, 90]).toContain(duration)
      }
    }
  })

  it.each(['mass', 'capacity'] as const)('erzeugt %s über alle Stufen und 1.000 Seeds fachlich konsistent', (skillId) => {
    for (const difficulty of [1, 2, 3] as Difficulty[]) {
      for (let seed = 1; seed <= 1_000; seed += 1) {
        const exercise = generateExercise(skillId, seed, difficulty)
        const values = exercise.representation?.values ?? {}
        assertUniqueChoice(exercise)
        expect(exercise.representation?.kind).toBe(skillId === 'mass' ? 'mass-scale' : 'capacity-vessel')
        expect(exercise.representation?.valueRoles.unknownValues).toEqual(['answerLabel'])
        if (difficulty === 1) {
          expect(values.mode).toBe('reference')
          expect(exercise.options?.map((option) => option.label)).toContain(exercise.correctAnswer)
        } else if (difficulty === 2) {
          const known = Number(values.knownAmountBase)
          const target = Number(values.targetAmountBase)
          expect(target).toBe(1000)
          expect(known).toBeGreaterThan(0)
          expect(known).toBeLessThan(target)
          expect(exercise.correctAnswer).toBe(formatBaseQuantity(target - known, skillId))
        } else {
          const first = Number(values.firstAmountBase)
          const second = Number(values.secondAmountBase)
          const result = values.operation === '+' ? first + second : first - second
          expect(first).toBeGreaterThanOrEqual(0)
          expect(second).toBeGreaterThanOrEqual(0)
          expect(result).toBeGreaterThanOrEqual(0)
          expect(result).toBeLessThanOrEqual(1000)
          expect(exercise.correctAnswer).toBe(formatBaseQuantity(result, skillId))
        }
      }
    }
  })

  it.each(['time', 'mass', 'capacity'] as SkillId[])('erzeugt für %s deterministische und leichtere Remediation', (skillId) => {
    const hard = generateExercise(skillId, 9_101, 3)
    const repeat = generateExercise(skillId, 9_101, 3)
    const remediation = generateExercise(skillId, 9_102, 2)
    expect(repeat).toEqual(hard)
    expect(remediation.difficulty).toBe(2)
    expect(remediation.variant.key).not.toBe(hard.variant.key)
    expect(remediation.representation?.visibility).toBe('always')
  })
})
