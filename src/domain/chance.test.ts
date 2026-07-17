import { describe, expect, it } from 'vitest'
import { getTaskCatalog } from '../content/catalog'
import { generateExercise, isAnswerCorrect } from './generators'
import { createRemediationExercise } from './session'
import {
  classifyEvent,
  combinationCount,
  compareEventFrequency,
  isValidCombinationTemplate,
  isValidProbabilityTemplate
} from './chance'

describe('Wahrscheinlichkeit und Kombinatorik', () => {
  it('klassifiziert Ereignisse aus gleich wahrscheinlichen Ergebnissen fachlich korrekt', () => {
    expect(classifyEvent(['rot', 'rot'], ['rot'])).toBe('sure')
    expect(classifyEvent(['rot', 'blau'], ['rot'])).toBe('possible')
    expect(classifyEvent(['rot', 'blau'], ['grün'])).toBe('impossible')
    expect(compareEventFrequency(['rot', 'rot', 'blau'], ['rot'], ['blau'])).toBe('first')
    expect(compareEventFrequency(['Kopf', 'Zahl'], ['Kopf'], ['Zahl'])).toBe('equal')
  })

  it('validiert alle katalogisierten Vorlagen und lehnt inkonsistente Vorlagen ab', () => {
    const content = getTaskCatalog().chanceContent
    expect(content.probabilityTemplates.every(isValidProbabilityTemplate)).toBe(true)
    expect(content.combinationTemplates.every(isValidCombinationTemplate)).toBe(true)
    expect(isValidProbabilityTemplate({ ...content.probabilityTemplates[0], outcomes: [] })).toBe(false)
    expect(isValidCombinationTemplate({ ...content.combinationTemplates[0], firstOptions: ['rot', 'rot'] })).toBe(false)
  })

  it('erzeugt über 1.000 Seeds je Stufe eindeutige Wahrscheinlichkeitsaufgaben ohne Bruchrechnung', () => {
    const templates = getTaskCatalog().chanceContent.probabilityTemplates
    const seenAnswers = new Set<string>()
    for (const difficulty of [1, 2, 3] as const) {
      const expectedSubskill = difficulty === 1 ? 'chance-classify-visible' : difficulty === 2 ? 'chance-classify-experiment' : 'chance-compare-frequency'
      for (let seed = 1; seed <= 1_000; seed += 1) {
        const exercise = generateExercise('probability', seed, difficulty)
        const template = templates.find((entry) => entry.id === exercise.variant.values.templateId)
        expect(template).toBeDefined()
        if (!template) throw new Error('Erzeugte Wahrscheinlichkeitsvorlage fehlt im Katalog.')
        const expected = difficulty === 3
          ? compareEventFrequency(template.outcomes, template.eventA, template.eventB ?? [])
          : classifyEvent(template.outcomes, template.eventA)
        expect(exercise.correctAnswer).toBe(expected)
        expect(exercise.subskillId).toBe(expectedSubskill)
        expect(exercise.options).toHaveLength(3)
        expect(new Set(exercise.options?.map((option) => option.value)).size).toBe(3)
        expect(exercise.options?.filter((option) => option.value === expected)).toHaveLength(1)
        expect(isAnswerCorrect(exercise, expected)).toBe(true)
        expect(exercise.prompt).not.toMatch(/\d+\s*\/\s*\d+/)
        expect(exercise.representation?.valueRoles.unknownValues).toContain('classification')
        expect(exercise.representation?.valueRoles.revealedValues).toEqual([])
        seenAnswers.add(expected)
      }
    }
    expect(seenAnswers).toEqual(new Set(['sure', 'possible', 'impossible', 'first', 'equal', 'second']))
  })

  it('erzeugt über 1.000 Seeds je Stufe systematisch zählbare Kombinationen', () => {
    const templates = getTaskCatalog().chanceContent.combinationTemplates
    for (const difficulty of [1, 2, 3] as const) {
      const expected = difficulty === 1 ? 4 : difficulty === 2 ? 6 : 8
      for (let seed = 1; seed <= 1_000; seed += 1) {
        const exercise = generateExercise('combinatorics', seed, difficulty)
        const template = templates.find((entry) => entry.id === exercise.variant.values.templateId)
        expect(template).toBeDefined()
        if (!template) throw new Error('Erzeugte Kombinationsvorlage fehlt im Katalog.')
        expect(combinationCount(template)).toBe(expected)
        expect(exercise.correctAnswer).toBe(String(expected))
        expect(exercise.options).toHaveLength(3)
        expect(new Set(exercise.options?.map((option) => option.value)).size).toBe(3)
        expect(exercise.options?.filter((option) => option.value === String(expected))).toHaveLength(1)
        expect(exercise.representation?.valueRoles.unknownValues).toContain('combinationCount')
        expect(exercise.representation?.valueRoles.revealedValues).toEqual([])
        expect(exercise.variant.key).toBe(generateExercise('combinatorics', seed, difficulty).variant.key)
      }
    }
  })

  it.each(['probability', 'combinatorics'] as const)('führt %s nach Fehlern verwandt, leichter und nicht identisch fort', (skillId) => {
    const exercise = generateExercise(skillId, 817, 3)
    const remediation = createRemediationExercise(exercise, 991)
    expect(remediation.skillId).toBe(skillId)
    expect(remediation.difficulty).toBe(2)
    expect(remediation.variant.key).not.toBe(exercise.variant.key)
    expect(remediation.representation?.kind).toBe(skillId === 'probability' ? 'chance-display' : 'combination-display')
  })
})
