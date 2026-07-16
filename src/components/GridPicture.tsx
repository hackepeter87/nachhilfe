interface GridPictureProps {
  grid: number[][]
  label: string
}

export function GridPicture({ grid, label }: GridPictureProps) {
  return (
    <div className="pixel-grid" role="img" aria-label={label} style={{ '--grid-size': grid.length } as CSSProperties}>
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
import type { CSSProperties } from 'react'
