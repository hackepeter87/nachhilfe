import { describe, expect, it } from 'vitest'
import {
  createCubeRotationDistractors,
  createCubeViewDistractors,
  cubeBuildingKey,
  cubeCount,
  cubeViewKey,
  everyCubeIsVisible,
  isValidCubeBuilding,
  projectCubeView,
  rotateCubeBuilding
} from './cubeViews'

const building = { width: 2, depth: 2, heights: [1, 1, 2, 0] }

describe('Körperansichten', () => {
  it('projiziert dasselbe Gebäude fachlich korrekt in drei feste Richtungen', () => {
    expect(cubeCount(building)).toBe(4)
    expect(projectCubeView(building, 'front')).toEqual([[1, 0], [1, 1]])
    expect(projectCubeView(building, 'right')).toEqual([[0, 1], [1, 1]])
    expect(projectCubeView(building, 'top')).toEqual([[1, 0], [1, 1]])
  })

  it('lehnt getrennte Grundflächen und vollständig verdeckte Würfel ab', () => {
    expect(isValidCubeBuilding({ width: 3, depth: 1, heights: [1, 0, 1] })).toBe(false)
    expect(isValidCubeBuilding({ width: 3, depth: 1, heights: [1, 2, 0] })).toBe(false)
    const hidden = { width: 2, depth: 2, heights: [2, 2, 2, 1] }
    expect(cubeCount(hidden)).toBeGreaterThan(5)
    expect(everyCubeIsVisible(hidden)).toBe(false)
  })

  it.each(['front', 'right', 'top'] as const)('erzeugt für %s zwei unterschiedliche plausible Fehlerbilder', (direction) => {
    const correct = projectCubeView(building, direction)
    const distractors = createCubeViewDistractors(correct, direction)
    expect(distractors).toHaveLength(2)
    expect(new Set([cubeViewKey(correct), ...distractors.map(({ grid }) => cubeViewKey(grid))]).size).toBe(3)
  })
})

describe('Kontrollierte Würfelrotation', () => {
  it('dreht Grundfläche und Stapel exakt um 90 Grad nach rechts oder links', () => {
    expect(rotateCubeBuilding(building, 'right')).toEqual({ width: 2, depth: 2, heights: [2, 1, 0, 1] })
    expect(rotateCubeBuilding(building, 'left')).toEqual({ width: 2, depth: 2, heights: [1, 0, 1, 2] })
  })

  it('erhält Würfelzahl und Nachbarschaft bei Umkehrung und vier Vierteldrehungen', () => {
    const right = rotateCubeBuilding(building, 'right')
    expect(cubeCount(right)).toBe(cubeCount(building))
    expect(rotateCubeBuilding(right, 'left')).toEqual(building)
    const fullTurn = Array.from({ length: 4 }).reduce<typeof building>((current) => rotateCubeBuilding(current, 'right'), building)
    expect(fullTurn).toEqual(building)
  })

  it('liefert unveränderte und entgegengesetzte Lage als zwei eindeutige Fehlerbilder', () => {
    const correct = rotateCubeBuilding(building, 'right')
    const distractors = createCubeRotationDistractors(building, 'right')
    expect(distractors.map((candidate) => candidate.misconception)).toEqual(['not-rotated', 'opposite-direction'])
    expect(new Set([cubeBuildingKey(correct), ...distractors.map(({ building: candidate }) => cubeBuildingKey(candidate))]).size).toBe(3)
  })

  it('lehnt rotationssymmetrische Vorlagen ohne drei unterscheidbare Zustände ab', () => {
    const symmetric = { width: 2, depth: 2, heights: [1, 1, 1, 1] }
    expect(() => createCubeRotationDistractors(symmetric, 'right')).toThrow(/nicht eindeutig/i)
  })
})
