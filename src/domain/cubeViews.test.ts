import { describe, expect, it } from 'vitest'
import { createCubeViewDistractors, cubeCount, cubeViewKey, everyCubeIsVisible, isValidCubeBuilding, projectCubeView } from './cubeViews'

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
