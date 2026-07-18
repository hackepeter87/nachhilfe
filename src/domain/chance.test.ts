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
import type { LearningPhase } from './types'

const PHASES: LearningPhase[] = ['activate', 'understand', 'guided-practice', 'independent-practice', 'automate', 'transfer']
const PROBABILITY_TYPES = [
  'chance-identify-outcome', 'chance-complete-outcome-space', 'chance-classify-guided',
  'chance-classify-independent', 'chance-classify-fluent', 'chance-predict-and-evaluate'
] as const

describe('Wahrscheinlichkeit und Kombinatorik', () => {
  it('hält die sechs Wahrscheinlichkeitsphasen zwischen Curriculum und Runtime synchron', () => {
    const skill = getTaskCatalog().skills.find((entry) => entry.id === 'probability')
    expect(skill?.learningPhases.map((phase) => phase.exerciseTypes[0])).toEqual(
      PROBABILITY_TYPES.map((typeId) => `probability:${typeId}`)
    )
    expect(skill?.misconceptionFeedback?.map((entry) => entry.id)).toEqual(expect.arrayContaining([
      'chance-outcome-space', 'chance-frequency-count', 'chance-single-result'
    ]))
  })

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

  it('erzeugt über 1.000 Seeds je Lernphase eindeutige Wahrscheinlichkeitsaufgaben ohne Bruchrechnung', () => {
    const templates = getTaskCatalog().chanceContent.probabilityTemplates
    const seenAnswers = new Set<string>()
    for (const [phaseIndex, phase] of PHASES.entries()) {
      const difficulty = phaseIndex < 2 ? 1 : phaseIndex < 4 ? 2 : 3
      for (let seed = 1; seed <= 1_000; seed += 1) {
        const exercise = generateExercise('probability', seed, difficulty, undefined, phase)
        const template = templates.find((entry) => entry.id === exercise.variant.values.templateId)
        expect(template).toBeDefined()
        if (!template) throw new Error('Erzeugte Wahrscheinlichkeitsvorlage fehlt im Katalog.')
        expect(exercise.typeId).toBe(PROBABILITY_TYPES[phaseIndex])
        expect(exercise.learningPhase).toBe(phase)
        if (phase === 'transfer') {
          expect(exercise.steps).toHaveLength(2)
          expect(exercise.steps?.map((step) => step.id)).toEqual(['prediction', 'evaluation'])
          expect(exercise.steps?.every((step) => step.options?.length === 3)).toBe(true)
          expect(exercise.steps?.every((step) => new Set(step.options?.map((option) => option.value)).size === 3)).toBe(true)
          expect(exercise.steps?.[0]?.correctAnswer).toBe(compareEventFrequency(template.outcomes, template.eventA, template.eventB ?? []))
          expect(exercise.steps?.[1]?.correctAnswer).toContain('ändert die Verteilung')
        } else {
          expect(exercise.options).toHaveLength(3)
          expect(new Set(exercise.options?.map((option) => option.value)).size).toBe(3)
          expect(exercise.options?.filter((option) => option.value === exercise.correctAnswer)).toHaveLength(1)
          expect(isAnswerCorrect(exercise, exercise.correctAnswer)).toBe(true)
        }
        expect(exercise.prompt).not.toMatch(/\d+\s*\/\s*\d+/)
        expect(exercise.representation?.valueRoles.unknownValues).toContain('classification')
        expect(exercise.representation?.valueRoles.revealedValues).toEqual([])
        if (phase === 'guided-practice' || phase === 'independent-practice' || phase === 'automate' || phase === 'transfer') {
          seenAnswers.add(phase === 'transfer' ? exercise.steps![0]!.correctAnswer : exercise.correctAnswer)
        }
        expect(generateExercise('probability', seed, difficulty, undefined, phase)).toEqual(exercise)
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
        const pairing = exercise.steps?.find((step) => step.interaction === 'build-pairing')
        const count = exercise.steps?.find((step) => step.id === 'count')
        expect(pairing?.expectedSelections).toHaveLength(expected)
        expect([...pairing?.expectedSelections ?? []].sort().join('|')).toBe(pairing?.correctAnswer)
        expect(count?.options).toHaveLength(3)
        expect(new Set(count?.options?.map((option) => option.value)).size).toBe(3)
        expect(count?.options?.filter((option) => option.value === String(expected))).toHaveLength(1)
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
