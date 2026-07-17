export type FoldAxis = 'vertical' | 'horizontal'
export type FoldSide = 'left' | 'right' | 'top' | 'bottom'
export type FoldingMode = 'point-fold' | 'cut-unfold'

export interface FoldingTemplate {
  id: string
  difficulty: 1 | 2 | 3
  mode: FoldingMode
  rows: number
  columns: number
  axis: FoldAxis
  foldSide: FoldSide
  sourceCell: number
}

export function reflectFoldingCell(
  cell: number,
  rows: number,
  columns: number,
  axis: FoldAxis
): number {
  if (!Number.isInteger(cell) || cell < 0 || cell >= rows * columns) {
    throw new RangeError('Die markierte Zelle liegt außerhalb des Faltpapiers.')
  }
  const row = Math.floor(cell / columns)
  const column = cell % columns
  return axis === 'vertical'
    ? row * columns + (columns - 1 - column)
    : (rows - 1 - row) * columns + column
}

export function isValidFoldingTemplate(template: FoldingTemplate): boolean {
  if (!Number.isInteger(template.rows) || !Number.isInteger(template.columns) ||
    template.rows < 2 || template.rows > 6 || template.columns < 2 || template.columns > 8 ||
    !Number.isInteger(template.sourceCell) || template.sourceCell < 0 || template.sourceCell >= template.rows * template.columns) return false
  if (template.axis === 'vertical' ? template.columns % 2 !== 0 : template.rows % 2 !== 0) return false
  if (template.axis === 'vertical' && !['left', 'right'].includes(template.foldSide)) return false
  if (template.axis === 'horizontal' && !['top', 'bottom'].includes(template.foldSide)) return false
  const row = Math.floor(template.sourceCell / template.columns)
  const column = template.sourceCell % template.columns
  const sourceOnFoldSide = template.foldSide === 'left'
    ? column < template.columns / 2
    : template.foldSide === 'right'
      ? column >= template.columns / 2
      : template.foldSide === 'top'
        ? row < template.rows / 2
        : row >= template.rows / 2
  return sourceOnFoldSide && reflectFoldingCell(template.sourceCell, template.rows, template.columns, template.axis) !== template.sourceCell
}

function shiftedCell(template: FoldingTemplate, reflected: number): number {
  const row = Math.floor(reflected / template.columns)
  const column = reflected % template.columns
  const candidates = [
    row * template.columns + ((column + 1) % template.columns),
    row * template.columns + ((column + template.columns - 1) % template.columns),
    ((row + 1) % template.rows) * template.columns + column
  ]
  return candidates.find((cell) => cell !== reflected && cell !== template.sourceCell)!
}

export function createFoldingOutcomes(template: FoldingTemplate): {
  correct: number[]
  unchanged: number[]
  shifted: number[]
} {
  if (!isValidFoldingTemplate(template)) throw new Error(`Ungültige Faltvorlage: ${template.id}`)
  const reflected = reflectFoldingCell(template.sourceCell, template.rows, template.columns, template.axis)
  const shifted = shiftedCell(template, reflected)
  if (template.mode === 'cut-unfold') {
    return {
      correct: [template.sourceCell, reflected].sort((a, b) => a - b),
      unchanged: [template.sourceCell],
      shifted: [template.sourceCell, shifted].sort((a, b) => a - b)
    }
  }
  return {
    correct: [reflected],
    unchanged: [template.sourceCell],
    shifted: [shifted]
  }
}

export function foldingCellsKey(cells: number[]): string {
  return [...cells].sort((a, b) => a - b).join(',')
}
