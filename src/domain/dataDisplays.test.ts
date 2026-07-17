import { describe, expect, it } from 'vitest'
import { getTaskCatalog } from '../content/catalog'
import { generateExercise } from './generators'
import { createDataDistractors, isValidDataSetTemplate, sameDataValues, varyDataValues } from './dataDisplays'

describe('Daten und Diagramme', () => {
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

  it.each(['read-tables', 'read-charts'] as const)('macht bei %s alle drei Stufen fachlich wirksam', (skillId) => {
    const types = new Set<string>()
    for (const difficulty of [1, 2, 3] as const) {
      for (let seed = 1; seed <= 1_000; seed += 1) {
        const exercise = generateExercise(skillId, seed, difficulty)
        types.add(`${difficulty}:${exercise.typeId}`)
        expect(exercise.options).toHaveLength(3)
        expect(new Set(exercise.options?.map((option) => option.value)).size).toBe(3)
        expect(exercise.options?.filter((option) => option.value === exercise.correctAnswer)).toHaveLength(1)
        expect(generateExercise(skillId, seed, difficulty)).toEqual(exercise)
      }
    }
    expect(types.size).toBe(3)
  })

  it('maskiert fehlende Tabellenwerte und erzeugt genau ein passendes Diagramm', () => {
    for (let seed = 1; seed <= 1_000; seed += 1) {
      const table = generateExercise('read-tables', seed, 3)
      const tableValues = table.representation?.values
      const hiddenIndex = Number(tableValues?.hiddenIndex)
      expect(Array.isArray(tableValues?.dataValues)).toBe(true)
      expect((tableValues?.dataValues as number[])[hiddenIndex]).toBe(-1)
      expect(tableValues?.missingValue).toBe(Number(table.correctAnswer))
      expect(table.representation?.valueRoles.unknownValues).toContain('missingValue')

      const chart = generateExercise('read-charts', seed, 3)
      const expected = chart.representation?.values.dataValues as number[]
      const matching = chart.options?.filter((option) => sameDataValues(option.representation?.values.dataValues as number[], expected)) ?? []
      expect(matching).toHaveLength(1)
      expect(matching[0]?.value).toBe(chart.correctAnswer)
      expect(new Set(chart.options?.map((option) => option.representation?.values.scaleMax)).size).toBe(1)
      expect(chart.prompt).not.toMatch(/\{\w+\}/)
    }
  })
})
