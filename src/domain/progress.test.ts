import { describe, expect, it } from 'vitest'
import { createSkillProgress, LEARNING_RULES, selectionWeight, subskillWeight, updateSkillProgress } from './progress'
import type { AttemptResult } from './types'

function result(overrides: Partial<AttemptResult> = {}): AttemptResult {
  return {
    exerciseId: 'exercise-1',
    skillId: 'addition',
    variantKey: 'addition:1',
    correct: true,
    hintsUsed: 0,
    attempts: 1,
    completedAt: '2026-07-16T10:00:00.000Z',
    ...overrides
  }
}

describe('Lernstandsmodell', () => {
  it('verwendet zentrale und dokumentierbare Gewichtungen', () => {
    expect(LEARNING_RULES.correctWithoutHint).toBeGreaterThan(LEARNING_RULES.correctWithHint)
    expect(LEARNING_RULES.incorrect).toBeLessThan(0)
  })

  it('bewertet richtige Antworten mit und ohne Hilfe unterschiedlich', () => {
    const initial = createSkillProgress('addition')
    const withoutHint = updateSkillProgress(initial, result())
    const withHint = updateSkillProgress(initial, result({ hintsUsed: 1 }))
    expect(withoutHint.mastery).toBeGreaterThan(withHint.mastery)
    expect(withHint.hintsUsed).toBe(1)
  })

  it('begrenzt den Lernwert und macht nicht nach einer Antwort sicher', () => {
    let progress = createSkillProgress('addition')
    progress = updateSkillProgress(progress, result())
    expect(progress.status).not.toBe('secure')
    for (let index = 0; index < 20; index += 1) progress = updateSkillProgress(progress, result({ variantKey: `addition:${index}` }))
    expect(progress.mastery).toBe(100)
    expect(progress.status).toBe('secure')
  })

  it('senkt nach Fehlern Schwierigkeit und Lernwert', () => {
    const initial = { ...createSkillProgress('addition'), difficulty: 3 as const, mastery: 60 }
    const updated = updateSkillProgress(initial, result({ correct: false, attempts: 2 }))
    expect(updated.mastery).toBe(50)
    expect(updated.difficulty).toBe(2)
    expect(updated.recentErrors).toBe(1)
  })

  it('gewichtet unsichere, fehlerhafte und lange ungeübte Skills höher', () => {
    const now = new Date('2026-07-16T12:00:00.000Z')
    const secure = { ...createSkillProgress('addition'), attempts: 8, mastery: 90, recentErrors: 0, lastPracticedAt: now.toISOString() }
    const weak = { ...createSkillProgress('addition'), attempts: 4, mastery: 25, recentErrors: 2, lastPracticedAt: '2026-07-01T12:00:00.000Z' }
    expect(selectionWeight(weak, now)).toBeGreaterThan(selectionWeight(secure, now))
  })

  it('führt benötigte Unterkompetenzen getrennt und gewichtet schwache höher', () => {
    let progress = createSkillProgress('multiplication')
    progress = updateSkillProgress(progress, result({ skillId: 'multiplication', subskillId: 'times-7', correct: false }))
    progress = updateSkillProgress(progress, result({ skillId: 'multiplication', subskillId: 'times-8', correct: true }))
    progress = updateSkillProgress(progress, result({ skillId: 'multiplication', subskillId: 'times-8', correct: true }))
    expect(progress.subskills['times-7']?.recentErrors).toBe(1)
    expect(progress.subskills['times-8']?.mastery).toBeGreaterThan(progress.subskills['times-7']?.mastery ?? 0)
    expect(subskillWeight(progress, 'times-7')).toBeGreaterThan(subskillWeight(progress, 'times-8'))
  })
})
