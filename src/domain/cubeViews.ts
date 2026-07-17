export type CubeViewDirection = 'front' | 'right' | 'top'
export type CubeTurnDirection = 'left' | 'right'
export type BinaryGrid = number[][]

export interface CubeBuilding {
  width: number
  depth: number
  heights: number[]
}

export interface CubeViewDistractor {
  grid: BinaryGrid
  misconception: 'mirrored-orientation' | 'overlooked-cube' | 'wrong-stack-height'
}

export interface CubeRotationDistractor {
  building: CubeBuilding
  misconception: 'not-rotated' | 'opposite-direction'
}

export function cubeCount(building: CubeBuilding): number {
  return building.heights.reduce((sum, height) => sum + height, 0)
}

export function cubeBuildingKey(building: CubeBuilding): string {
  return `${building.width}x${building.depth}:${building.heights.join(',')}`
}

function heightAt(building: CubeBuilding, x: number, y: number): number {
  if (x < 0 || x >= building.width || y < 0 || y >= building.depth) return 0
  return building.heights[y * building.width + x] ?? 0
}

function occupiedFootprintIsConnected(building: CubeBuilding): boolean {
  const occupied = building.heights
    .map((height, index) => height > 0 ? index : -1)
    .filter((index) => index >= 0)
  if (occupied.length === 0) return false
  const visited = new Set<number>([occupied[0]!])
  const queue = [occupied[0]!]
  while (queue.length > 0) {
    const index = queue.shift()!
    const x = index % building.width
    const y = Math.floor(index / building.width)
    for (const [nextX, nextY] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
      const nextIndex = nextY * building.width + nextX
      if (nextX >= 0 && nextX < building.width && nextY >= 0 && nextY < building.depth &&
        heightAt(building, nextX, nextY) > 0 && !visited.has(nextIndex)) {
        visited.add(nextIndex)
        queue.push(nextIndex)
      }
    }
  }
  return visited.size === occupied.length
}

export function everyCubeIsVisible(building: CubeBuilding): boolean {
  for (let y = 0; y < building.depth; y += 1) {
    for (let x = 0; x < building.width; x += 1) {
      const height = heightAt(building, x, y)
      for (let z = 0; z < height; z += 1) {
        const topVisible = z === height - 1
        const frontVisible = y === 0 || heightAt(building, x, y - 1) <= z
        const rightVisible = x === building.width - 1 || heightAt(building, x + 1, y) <= z
        if (!topVisible && !frontVisible && !rightVisible) return false
      }
    }
  }
  return true
}

export function isValidCubeBuilding(building: CubeBuilding): boolean {
  const fillsBoundingBox = building.heights.some((height, index) => height > 0 && index % building.width === 0) &&
    building.heights.some((height, index) => height > 0 && index % building.width === building.width - 1) &&
    building.heights.slice(0, building.width).some((height) => height > 0) &&
    building.heights.slice((building.depth - 1) * building.width).some((height) => height > 0)
  return Number.isInteger(building.width) && building.width >= 2 && building.width <= 3 &&
    Number.isInteger(building.depth) && building.depth >= 1 && building.depth <= 3 &&
    building.heights.length === building.width * building.depth &&
    building.heights.every((height) => Number.isInteger(height) && height >= 0 && height <= 2) &&
    cubeCount(building) >= 2 && cubeCount(building) <= 5 && fillsBoundingBox &&
    occupiedFootprintIsConnected(building) && everyCubeIsVisible(building)
}

function elevationGrid(columnHeights: number[]): BinaryGrid {
  const rows = Math.max(...columnHeights)
  return Array.from({ length: rows }, (_, row) =>
    columnHeights.map((height) => height >= rows - row ? 1 : 0)
  )
}

export function projectCubeView(building: CubeBuilding, direction: CubeViewDirection): BinaryGrid {
  if (!isValidCubeBuilding(building)) throw new RangeError('Das Würfelgebäude ist ungültig.')
  if (direction === 'front') {
    return elevationGrid(Array.from({ length: building.width }, (_, x) =>
      Math.max(...Array.from({ length: building.depth }, (_, y) => heightAt(building, x, y)))
    ))
  }
  if (direction === 'right') {
    return elevationGrid(Array.from({ length: building.depth }, (_, y) =>
      Math.max(...Array.from({ length: building.width }, (_, x) => heightAt(building, x, y)))
    ))
  }
  return Array.from({ length: building.depth }, (_, row) => {
    const y = building.depth - 1 - row
    return Array.from({ length: building.width }, (_, x) => heightAt(building, x, y) > 0 ? 1 : 0)
  })
}

export function rotateCubeBuilding(building: CubeBuilding, direction: CubeTurnDirection): CubeBuilding {
  if (!isValidCubeBuilding(building)) throw new RangeError('Das Würfelgebäude ist ungültig.')
  const width = building.depth
  const depth = building.width
  const heights = Array.from({ length: width * depth }, () => 0)
  for (let y = 0; y < building.depth; y += 1) {
    for (let x = 0; x < building.width; x += 1) {
      const nextX = direction === 'right' ? building.depth - 1 - y : y
      const nextY = direction === 'right' ? x : building.width - 1 - x
      heights[nextY * width + nextX] = heightAt(building, x, y)
    }
  }
  const rotated = { width, depth, heights }
  if (!isValidCubeBuilding(rotated)) throw new Error('Die Drehung erzeugt ein ungültiges Würfelgebäude.')
  return rotated
}

export function createCubeRotationDistractors(building: CubeBuilding, direction: CubeTurnDirection): [CubeRotationDistractor, CubeRotationDistractor] {
  const correct = rotateCubeBuilding(building, direction)
  const opposite = rotateCubeBuilding(building, direction === 'right' ? 'left' : 'right')
  const keys = [cubeBuildingKey(correct), cubeBuildingKey(building), cubeBuildingKey(opposite)]
  if (new Set(keys).size !== keys.length) {
    throw new Error('Das Würfelgebäude unterscheidet Ausgangslage und beide Drehrichtungen nicht eindeutig.')
  }
  return [
    { building, misconception: 'not-rotated' },
    { building: opposite, misconception: 'opposite-direction' }
  ]
}

export function cubeViewKey(grid: BinaryGrid): string {
  return grid.map((row) => row.join('')).join('/')
}

function horizontalMirror(grid: BinaryGrid): BinaryGrid {
  return grid.map((row) => [...row].reverse())
}

function verticalMirror(grid: BinaryGrid): BinaryGrid {
  return [...grid].reverse().map((row) => [...row])
}

function columnHeights(grid: BinaryGrid): number[] {
  return Array.from({ length: grid[0]?.length ?? 0 }, (_, column) =>
    grid.reduce((sum, row) => sum + (row[column] ?? 0), 0)
  )
}

function toggleCell(grid: BinaryGrid, row: number, column: number): BinaryGrid {
  return grid.map((currentRow, rowIndex) =>
    currentRow.map((cell, columnIndex) => rowIndex === row && columnIndex === column ? 1 - cell : cell)
  )
}

export function createCubeViewDistractors(correct: BinaryGrid, direction: CubeViewDirection): [CubeViewDistractor, CubeViewDistractor] {
  const candidates: CubeViewDistractor[] = []
  const correctKey = cubeViewKey(correct)
  const add = (grid: BinaryGrid, misconception: CubeViewDistractor['misconception']) => {
    const key = cubeViewKey(grid)
    if (grid.flat().some(Boolean) && key !== correctKey && !candidates.some((candidate) => cubeViewKey(candidate.grid) === key)) {
      candidates.push({ grid, misconception })
    }
  }

  add(horizontalMirror(correct), 'mirrored-orientation')
  if (direction === 'top') add(verticalMirror(correct), 'mirrored-orientation')

  if (direction !== 'top') {
    const heights = columnHeights(correct)
    const tallest = heights.indexOf(Math.max(...heights))
    if (heights[tallest]! > 1) {
      const lower = [...heights]
      lower[tallest] -= 1
      add(elevationGrid(lower), 'wrong-stack-height')
    }
    const shorter = heights.findIndex((height) => height < correct.length)
    if (shorter >= 0) {
      const higher = [...heights]
      higher[shorter] += 1
      add(elevationGrid(higher), 'wrong-stack-height')
    }
  }

  for (let row = correct.length - 1; row >= 0 && candidates.length < 2; row -= 1) {
    for (let column = 0; column < (correct[0]?.length ?? 0) && candidates.length < 2; column += 1) {
      add(toggleCell(correct, row, column), 'overlooked-cube')
    }
  }
  if (candidates.length < 2) throw new Error('Für diese Körperansicht fehlen zwei plausible Distraktoren.')
  return [candidates[0]!, candidates[1]!]
}
