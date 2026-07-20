import { describe, expect, it } from 'vitest'
import { getTaskCatalog } from '../content/catalog'
import { generateExercise } from './generators'
import { createDataDistractors, isValidDataSetTemplate, sameDataValues, varyDataValues } from './dataDisplays'
import type { LearningPhase } from './types'

const PHASES: LearningPhase[] = ['activate', 'understand', 'guided-practice', 'independent-practice', 'automate', 'transfer']

const DATA_PHASE_TYPES = {
  'read-tables': [
    'table-identify-category', 'table-connect-row', 'table-combine-guided',
    'tally-compare-independent', 'table-find-maximum', 'table-complete-transfer'
  ],
  'read-charts': [
    'pictogram-identify-key', 'bar-connect-height', 'pictogram-read-guided',
    'bar-compare-independent', 'bar-read-scale', 'chart-representation-transfer'
  ]
} as const

describe('Daten und Diagramme', () => {
  it.each(['read-tables', 'read-charts'] as const)('hält Curriculum und Runtime für %s phasengenau synchron', (skillId) => {
    const skill = getTaskCatalog().skills.find((entry) => entry.id === skillId)
    expect(skill?.learningPhases.map((phase) => phase.exerciseTypes[0])).toEqual(
      DATA_PHASE_TYPES[skillId].map((typeId) => `${skillId}:${typeId}`)
    )
    expect(skill?.misconceptionFeedback?.length).toBeGreaterThanOrEqual(4)
  })

  it('validiert alle katalogisierten Datensätze und variiert sie reproduzierbar', () => {
    for (const template of getTaskCatalog().dataAndCharts.templates) {
      expect(isValidDataSetTemplate(template)).toBe(true)
      for (let seed = 1; seed <= 1_000; seed += 1) {
        const first = varyDataValues(template, seed)
        expect(varyDataValues(template, seed)).toEqual(first)
        expect(first).toHaveLength(3)
        expect(first.every((value) => value >= 2 && value <= 12)).toBe(true)
      }
    }
  })

  it('erzeugt nur eindeutige plausible Zahlendistraktoren', () => {
    for (let answer = 0; answer <= 12; answer += 1) {
      const distractors = createDataDistractors(answer, [2, 5, 9])
      expect(new Set(distractors).size).toBe(distractors.length)
      expect(distractors).not.toContain(answer)
      expect(distractors.every((value) => value >= 0)).toBe(true)
    }
  })

  it.each(['read-tables', 'read-charts'] as const)('macht bei %s alle sechs Lernphasen fachlich wirksam', (skillId) => {
    const types = new Set<string>()
    for (const [phaseIndex, phase] of PHASES.entries()) {
      const difficulty = phaseIndex < 2 ? 1 : phaseIndex < 4 ? 2 : 3
      for (let seed = 1; seed <= 1_000; seed += 1) {
        const exercise = generateExercise(skillId, seed, difficulty, undefined, phase)
        types.add(exercise.typeId)
        expect(exercise.typeId).toBe(DATA_PHASE_TYPES[skillId][phaseIndex])
        expect(exercise.learningPhase).toBe(phase)
        expect(exercise.options).toHaveLength(3)
        expect(new Set(exercise.options?.map((option) => option.value)).size).toBe(3)
        expect(exercise.options?.filter((option) => option.value === exercise.correctAnswer)).toHaveLength(1)
        expect(generateExercise(skillId, seed, difficulty, undefined, phase)).toEqual(exercise)
      }
    }
    expect(types.size).toBe(6)
  })

  it('maskiert fehlende Tabellenwerte und erzeugt genau ein passendes Diagramm', () => {
    for (let seed = 1; seed <= 1_000; seed += 1) {
      const table = generateExercise('read-tables', seed, 3, undefined, 'transfer')
      const tableValues = table.representation?.values
      const hiddenIndex = Number(tableValues?.hiddenIndex)
      expect(Array.isArray(tableValues?.dataValues)).toBe(true)
      expect((tableValues?.dataValues as number[])[hiddenIndex]).toBe(-1)
      expect(tableValues?.missingValue).toBe(Number(table.correctAnswer))
      expect(table.representation?.valueRoles.unknownValues).toContain('missingValue')

      const chart = generateExercise('read-charts', seed, 3, undefined, 'transfer')
      const expected = chart.representation?.values.dataValues as number[]
      const matching = chart.options?.filter((option) => sameDataValues(option.representation?.values.dataValues as number[], expected)) ?? []
      expect(matching).toHaveLength(1)
      expect(matching[0]?.value).toBe(chart.correctAnswer)
      expect(new Set(chart.options?.map((option) => option.representation?.values.scaleMax)).size).toBe(1)
      expect(chart.prompt).not.toMatch(/\{\w+\}/)
    }
  })

  it('maskiert Rechenergebnisse in Strichlisten und Säulendiagrammen', () => {
    for (const skillId of ['read-tables', 'read-charts'] as const) {
      const exercise = generateExercise(skillId, 71, 2, undefined, 'independent-practice')
      expect(exercise.representation?.valueRoles.unknownValues).toContain('answerLabel')
      expect(exercise.representation?.valueRoles.knownValues).not.toContain('answerLabel')
      expect(exercise.representation?.values.answerLabel).toBe(exercise.correctAnswer)
    }
  })

  it('verlangt im geführten Tabellenlesen eine Rechenhandlung statt Abschreiben', () => {
    for (let seed = 1; seed <= 1_000; seed += 1) {
      const exercise = generateExercise('read-tables', seed, 2, undefined, 'guided-practice')
      expect(exercise.typeId).toBe('table-combine-guided')
      expect(Number(exercise.correctAnswer)).toBe(Number(exercise.variant.values.firstValue) + Number(exercise.variant.values.secondValue))
      expect(exercise.prompt).toContain(String(exercise.variant.values.category))
      expect(exercise.prompt).toContain(String(exercise.variant.values.secondCategory))
      expect(exercise.successFeedback).not.toMatch(/Strichliste|Fünferblock/)
    }
  })
})
