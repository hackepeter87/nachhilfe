import type { CSSProperties } from 'react'

interface GridPictureProps {
  grid: number[][]
  label: string
  axis?: 'vertical' | 'horizontal'
  axisPosition?: 'between-cells' | 'through-cells'
}

export function GridPicture({ grid, label, axis, axisPosition }: GridPictureProps) {
  const rows = grid.length
  const columns = grid[0]?.length ?? 1
  const axisDescription = axis
    ? `${axis === 'vertical' ? 'Senkrechte' : 'Waagerechte'} Spiegelachse ${axisPosition === 'through-cells' ? 'durch Felder' : 'zwischen Feldern'}.`
    : ''
  return (
    <div
      className={`pixel-grid${axis ? ` pixel-grid--axis-${axis} pixel-grid--axis-${axisPosition}` : ''}`}
      role="img"
      aria-label={`${label}. ${axisDescription}`.trim()}
      style={{
        '--grid-columns': columns,
        '--grid-rows': rows,
        aspectRatio: `${columns} / ${rows}`
      } as CSSProperties}
    >
      {grid.flatMap((row, rowIndex) => row.map((cell, columnIndex) => (
        <span
          className={cell ? 'pixel pixel--filled' : 'pixel'}
          key={`${rowIndex}-${columnIndex}`}
          aria-hidden="true"
        />
      )))}
    </div>
  )
}
