import { describe, expect, it } from 'vitest'
import { generateExercise } from './generators'
import { foldingCellsKey, reflectFoldingCell } from './folding'
import { areaInUnitSquares, perimeterInUnitEdges } from './planeGeometry'
import { cubeBuildingKey, rotateCubeBuilding, type CubeBuilding, type CubeTurnDirection } from './cubeViews'
import type { LearningPhase, SkillId } from './types'
import { getTaskCatalog } from '../content/catalog'

const PHASES: LearningPhase[] = ['activate', 'understand', 'guided-practice', 'independent-practice', 'automate', 'transfer']

const EXPECTED_TYPES = {
  symmetry: ['symmetry-identify-side-change', 'symmetry-understand-equal-distance', 'symmetry-mirror-guided', 'symmetry-mirror-independent', 'symmetry-mirror-fluent', 'symmetry-mirror-transfer'],
  'plane-shapes': ['shape-compare-properties', 'shape-connect-features', 'shape-identify-guided', 'shape-decompose-independent', 'shape-identify-fluent', 'shape-compose-transfer'],
  patterns: ['pattern-activate-find-block', 'pattern-understand-restart', 'pattern-guided-continue', 'pattern-independent-continue', 'pattern-automate-next-pair', 'pattern-transfer-identify-error'],
  area: ['area-identify-unit', 'area-understand-covering', 'area-count-guided', 'area-count-independent', 'area-count-fluent', 'area-analyze-boundary-error'],
  perimeter: ['perimeter-identify-unit-edge', 'perimeter-understand-boundary', 'perimeter-trace-guided', 'perimeter-trace-independent', 'perimeter-trace-fluent', 'perimeter-analyze-area-error'],
  'body-views': ['body-view-identify-direction', 'body-view-understand-projection', 'body-view-front-guided', 'body-view-mixed-independent', 'body-view-mixed-fluent', 'body-view-analyze-error'],
  'cube-rotation': ['cube-rotation-identify-direction', 'cube-rotation-understand-inverse', 'cube-rotation-guided-quarter-turn', 'cube-rotation-independent-quarter-turn', 'cube-rotation-fluent-quarter-turn', 'cube-rotation-analyze-opposite'],
  folding: ['folding-identify-moving-side', 'folding-understand-equal-distance', 'folding-point-guided', 'folding-point-independent', 'folding-point-fluent', 'folding-cut-unfold-transfer']
} as const satisfies Partial<Record<SkillId, readonly string[]>>

const geometrySkills = Object.keys(EXPECTED_TYPES) as Array<keyof typeof EXPECTED_TYPES>

describe('Didaktische Geometrie-Migration 0.29', () => {
  it.each(geometrySkills)('hält Curriculum und Runtime für %s phasengenau synchron', (skillId) => {
    const catalogSkill = getTaskCatalog().skills.find((entry) => entry.id === skillId)
    expect(catalogSkill?.learningPhases.map((phase) => phase.exerciseTypes[0])).toEqual(
      EXPECTED_TYPES[skillId].map((typeId) => `${skillId}:${typeId}`)
    )
    expect(catalogSkill?.misconceptionFeedback?.length).toBeGreaterThanOrEqual(2)
  })

  it.each(geometrySkills)('erzeugt für %s sechs unterschiedliche Lernhandlungen über je 1.000 Seeds', (skillId) => {
    const seenTypes = new Set<string>()
    for (const [phaseIndex, phase] of PHASES.entries()) {
      const difficulty = phaseIndex < 3 ? 1 : phaseIndex < 5 ? 2 : 3
      for (let seed = 1; seed <= 1_000; seed += 1) {
        const exercise = generateExercise(skillId, seed, difficulty, undefined, phase)
        expect(exercise.typeId).toBe(EXPECTED_TYPES[skillId][phaseIndex])
        expect(exercise.learningPhase).toBe(phase)
        expect(exercise.options).toHaveLength(3)
        expect(new Set(exercise.options?.map((option) => option.value)).size).toBe(3)
        expect(exercise.options?.filter((option) => option.correct)).toHaveLength(1)
        expect(exercise.representation?.valueRoles.revealedValues ?? []).toEqual([])
        expect(generateExercise(skillId, seed, difficulty, undefined, phase)).toEqual(exercise)
        seenTypes.add(exercise.typeId)
      }
    }
    expect(seenTypes.size).toBe(6)
  })

  it('hält Symmetrie in allen sechs Lernphasen bei geraden Achsendimensionen zwischen Zellen', () => {
    for (const [phaseIndex, phase] of PHASES.entries()) {
      const difficulty = phaseIndex < 3 ? 1 : phaseIndex < 5 ? 2 : 3
      for (let seed = 1; seed <= 1_000; seed += 1) {
        const exercise = generateExercise('symmetry', seed, difficulty, undefined, phase)
        const relevantSize = exercise.symmetry?.axis === 'vertical' ? exercise.sourceGrid?.[0]?.length : exercise.sourceGrid?.length
        expect(relevantSize! % 2).toBe(0)
        expect(exercise.symmetry?.axisPosition).toBe('between-cells')
        expect(exercise.correctAnswer).toBe('mirror')
      }
    }
  })

  it('trennt Fläche und Umfang in Begriffsaufbau, Zählen und Fehleranalyse', () => {
    for (const skillId of ['area', 'perimeter'] as const) {
      const understand = generateExercise(skillId, 31, 1, undefined, 'understand')
      const guided = generateExercise(skillId, 31, 1, undefined, 'guided-practice')
      const transfer = generateExercise(skillId, 31, 3, undefined, 'transfer')
      expect(understand.correctAnswer).toContain(skillId === 'area' ? 'Einheitsquadrate' : 'Außenrand')
      expect(Number(guided.correctAnswer)).toBeGreaterThan(0)
      expect(transfer.correctAnswer).toContain(skillId === 'area' ? 'Einheitsquadrate' : 'Außenrand')
      const values = guided.representation!.values
      const expected = skillId === 'area'
        ? areaInUnitSquares(Number(values.rows), Number(values.columns), values.cells as number[])
        : perimeterInUnitEdges(Number(values.rows), Number(values.columns), values.cells as number[])
      expect(Number(guided.correctAnswer)).toBe(expected)
    }
  })

  it('lässt Rotation und Faltung im Transfer gezielt typische Fehler beziehungsweise Spiegelpaare analysieren', () => {
    for (let seed = 1; seed <= 1_000; seed += 1) {
      const rotation = generateExercise('cube-rotation', seed, 3, undefined, 'transfer')
      const values = rotation.representation!.values
      const building: CubeBuilding = { width: Number(values.width), depth: Number(values.depth), heights: values.heights as number[] }
      const turn = values.turn as CubeTurnDirection
      const opposite = rotateCubeBuilding(building, turn === 'left' ? 'right' : 'left')
      expect(rotation.correctAnswer).toBe(cubeBuildingKey(opposite))

      const folding = generateExercise('folding', seed, 3, undefined, 'transfer')
      const foldValues = folding.representation!.values
      const source = Number((foldValues.marks as number[])[0])
      const reflected = reflectFoldingCell(source, Number(foldValues.rows), Number(foldValues.columns), foldValues.axis as 'vertical' | 'horizontal')
      expect(folding.correctAnswer).toBe(foldingCellsKey([source, reflected]))
    }
  })
})
