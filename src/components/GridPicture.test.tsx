import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GridPicture } from './GridPicture'

describe('GridPicture', () => {
  it('stellt ein rechteckiges gerades Raster mit Achse zwischen Spalten dar', () => {
    const { container } = render(
      <GridPicture
        grid={[
          [1, 0, 0, 0, 0, 0],
          [1, 1, 0, 0, 0, 0],
          [0, 1, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0]
        ]}
        label="Vorlage"
        axis="vertical"
        axisPosition="between-cells"
      />
    )

    const picture = screen.getByRole('img', { name: /Senkrechte Spiegelachse zwischen Feldern/ })
    expect(picture).toHaveClass('pixel-grid--axis-vertical', 'pixel-grid--axis-between-cells')
    expect(picture).toHaveStyle({ aspectRatio: '6 / 4' })
    expect(container.querySelectorAll('.pixel')).toHaveLength(24)
  })

  it('kennzeichnet eine spätere Achse durch Felder gesondert', () => {
    render(
      <GridPicture
        grid={[
          [1, 1, 0, 0, 0],
          [0, 1, 1, 0, 0],
          [0, 0, 1, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0]
        ]}
        label="Vorlage"
        axis="vertical"
        axisPosition="through-cells"
      />
    )

    expect(screen.getByRole('img', { name: /Senkrechte Spiegelachse durch Felder/ })).toHaveClass('pixel-grid--axis-through-cells')
  })
})
