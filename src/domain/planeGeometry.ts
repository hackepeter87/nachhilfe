export type GridCells = number[]

export function validateGridCells(rows: number, columns: number, cells: GridCells): boolean {
  return Number.isInteger(rows) && rows >= 1 && rows <= 6 && Number.isInteger(columns) && columns >= 1 && columns <= 8 &&
    cells.length === rows * columns && cells.every((cell) => cell === 0 || cell === 1) && cells.some(Boolean)
}

export function areaInUnitSquares(rows: number, columns: number, cells: GridCells): number {
  if (!validateGridCells(rows, columns, cells)) throw new RangeError('Die Flächenfigur enthält ungültige Rasterdaten.')
  return cells.reduce((sum, cell) => sum + cell, 0)
}

export function perimeterInUnitEdges(rows: number, columns: number, cells: GridCells): number {
  if (!validateGridCells(rows, columns, cells)) throw new RangeError('Die Umfangsfigur enthält ungültige Rasterdaten.')
  let perimeter = 0
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const index = row * columns + column
      if (!cells[index]) continue
      if (row === 0 || !cells[index - columns]) perimeter += 1
      if (row === rows - 1 || !cells[index + columns]) perimeter += 1
      if (column === 0 || !cells[index - 1]) perimeter += 1
      if (column === columns - 1 || !cells[index + 1]) perimeter += 1
    }
  }
  return perimeter
}

export function isConnectedGridFigure(rows: number, columns: number, cells: GridCells): boolean {
  if (!validateGridCells(rows, columns, cells)) return false
  const start = cells.findIndex(Boolean)
  const visited = new Set([start])
  const pending = [start]
  while (pending.length) {
    const index = pending.pop()!
    const row = Math.floor(index / columns)
    const column = index % columns
    const neighbors = [
      row > 0 ? index - columns : -1,
      row < rows - 1 ? index + columns : -1,
      column > 0 ? index - 1 : -1,
      column < columns - 1 ? index + 1 : -1
    ]
    for (const neighbor of neighbors) {
      if (neighbor >= 0 && cells[neighbor] === 1 && !visited.has(neighbor)) {
        visited.add(neighbor)
        pending.push(neighbor)
      }
    }
  }
  return visited.size === cells.filter(Boolean).length
}
