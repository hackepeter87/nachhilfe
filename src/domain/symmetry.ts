export type SymmetryAxis = 'vertical' | 'horizontal'
export type SymmetryAxisPosition = 'between-cells' | 'through-cells'

export function isRectangularBinaryGrid(value: unknown): value is number[][] {
  if (!Array.isArray(value) || value.length < 2) return false
  const width = Array.isArray(value[0]) ? value[0].length : 0
  return width >= 2 && value.every((row) =>
    Array.isArray(row) && row.length === width && row.every((cell) => cell === 0 || cell === 1)
  )
}

export function reflectGrid(grid: number[][], axis: SymmetryAxis): number[][] {
  return axis === 'vertical'
    ? grid.map((row) => [...row].reverse())
    : [...grid].reverse().map((row) => [...row])
}

export function mirrorGrid(grid: number[][]): number[][] {
  return reflectGrid(grid, 'vertical')
}

export function flipGrid(grid: number[][]): number[][] {
  return reflectGrid(grid, 'horizontal')
}

export function occupiedCellCount(grid: number[][]): number {
  return grid.flat().filter(Boolean).length
}

export function axisDimension(grid: number[][], axis: SymmetryAxis): number {
  return axis === 'vertical' ? (grid[0]?.length ?? 0) : grid.length
}

export function expectedAxisPosition(grid: number[][], axis: SymmetryAxis): SymmetryAxisPosition {
  return axisDimension(grid, axis) % 2 === 0 ? 'between-cells' : 'through-cells'
}

export function sourceStaysOnOneAxisSide(grid: number[][], axis: SymmetryAxis): boolean {
  const height = grid.length
  const width = grid[0]?.length ?? 0
  const middle = axis === 'vertical' ? Math.floor(width / 2) : Math.floor(height / 2)
  const throughCells = axisDimension(grid, axis) % 2 === 1
  return grid.every((row, rowIndex) => row.every((cell, columnIndex) => {
    if (!cell) return true
    const coordinate = axis === 'vertical' ? columnIndex : rowIndex
    return throughCells ? coordinate <= middle : coordinate < middle
  }))
}

export function hasOccupiedAxisCell(grid: number[][], axis: SymmetryAxis): boolean {
  if (expectedAxisPosition(grid, axis) !== 'through-cells') return false
  const middle = Math.floor(axisDimension(grid, axis) / 2)
  return axis === 'vertical'
    ? grid.some((row) => row[middle] === 1)
    : grid[middle]?.some((cell) => cell === 1) === true
}

function translatedGrid(grid: number[][], rowDelta: number, columnDelta: number): number[][] | null {
  const height = grid.length
  const width = grid[0]?.length ?? 0
  const translated = Array.from({ length: height }, () => Array<number>(width).fill(0))
  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
      if (!grid[row]?.[column]) continue
      const nextRow = row + rowDelta
      const nextColumn = column + columnDelta
      if (nextRow < 0 || nextRow >= height || nextColumn < 0 || nextColumn >= width) return null
      translated[nextRow]![nextColumn] = 1
    }
  }
  return translated
}

export function createShiftDistractor(grid: number[][], axis: SymmetryAxis): number[][] | null {
  const candidates: Array<[number, number]> = axis === 'vertical'
    ? [[0, 1], [1, 0], [-1, 0], [0, -1]]
    : [[1, 0], [0, 1], [0, -1], [-1, 0]]
  const correct = reflectGrid(grid, axis)
  const wrongAxis = reflectGrid(grid, axis === 'vertical' ? 'horizontal' : 'vertical')
  for (const [rowDelta, columnDelta] of candidates) {
    const candidate = translatedGrid(grid, rowDelta, columnDelta)
    if (!candidate || !sourceStaysOnOneAxisSide(candidate, axis)) continue
    const variants = [grid, correct, wrongAxis, candidate].map((value) => JSON.stringify(value))
    if (new Set(variants).size === variants.length) return candidate
  }
  return null
}

export function everyOccupiedCellHasMirrorPartner(grid: number[][], axis: SymmetryAxis): boolean {
  const reflected = reflectGrid(grid, axis)
  const height = grid.length
  const width = grid[0]?.length ?? 0
  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
      if (!grid[row]?.[column]) continue
      const mirrorRow = axis === 'horizontal' ? height - 1 - row : row
      const mirrorColumn = axis === 'vertical' ? width - 1 - column : column
      if (reflected[mirrorRow]?.[mirrorColumn] !== 1) return false
    }
  }
  return occupiedCellCount(reflected) === occupiedCellCount(grid)
}
