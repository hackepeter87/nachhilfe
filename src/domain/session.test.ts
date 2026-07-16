import { describe, expect, it } from 'vitest'
import { createRepetitionExercise, createSessionPlan } from './session'
import { createSkillProgress } from './progress'

describe('Sitzungsplanung', () => {
  it('erstellt sieben Aufgaben mit Grundlagen, Transfer und Symmetrie', () => {
    const session = createSessionPlan({}, 12_345)
    expect(session.exercises).toHaveLength(7)
    expect(session.exercises.slice(0, 2).map((exercise) => exercise.skillId)).toEqual(['subtraction', 'division'])
    expect(session.exercises.at(-2)?.skillId).toBe('word-problem')
    expect(session.exercises.at(-1)?.skillId).toBe('symmetry')
    expect(new Set(session.exercises.map((exercise) => exercise.variant.key)).size).toBe(7)
  })

  it('bevorzugt einen schwachen Fokusbereich über viele Sitzungen', () => {
    const weak = { ...createSkillProgress('round-tens'), mastery: 5, recentErrors: 3 }
    const secure = { ...createSkillProgress('place-value'), attempts: 8, mastery: 95, status: 'secure' as const }
    let weakSelections = 0
    let secureSelections = 0
    for (let seed = 1; seed <= 200; seed += 1) {
      const skills = createSessionPlan({ 'round-tens': weak, 'place-value': secure }, seed).exercises.map((exercise) => exercise.skillId)
      if (skills.includes('round-tens')) weakSelections += 1
      if (skills.includes('place-value')) secureSelections += 1
    }
    expect(weakSelections).toBeGreaterThan(secureSelections)
  })

  it('erzeugt nach einem Fehler eine leichtere, andere Wiederholung', () => {
    const session = createSessionPlan({}, 900)
    const original = session.exercises[2]!
    const repetition = createRepetitionExercise(original.skillId, 900, 3, original.variant.key)
    expect(repetition.difficulty).toBe(2)
    expect(repetition.variant.key).not.toBe(original.variant.key)
  })
})
