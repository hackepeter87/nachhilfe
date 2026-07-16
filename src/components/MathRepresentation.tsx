import type { CSSProperties } from 'react'
import type { ExerciseRepresentation } from '../domain'

const isValidGroupValue = (value: number) => Number.isInteger(value) && value >= 1 && value <= 10

export function MathRepresentation({ representation }: { representation: ExerciseRepresentation }) {
  const values = representation.values
  const textValue = (value: typeof values[string]) => Array.isArray(value) ? '' : value

  if (representation.kind === 'place-value') {
    return (
      <div className="math-visual place-value-visual" role="img" aria-label={representation.label}>
        {(['hundreds', 'tens', 'ones'] as const).map((key) => (
          <div className={values.highlight === key ? 'place-column place-column--highlight' : 'place-column'} key={key}>
            <span>{key === 'hundreds' ? 'H' : key === 'tens' ? 'Z' : 'E'}</span>
            <strong>{textValue(values[key])}</strong>
          </div>
        ))}
      </div>
    )
  }

  if (representation.kind === 'number-line') {
    const start = Number(values.start)
    const end = Number(values.end)
    const jumps = Array.isArray(values.jumps) ? values.jumps : []
    const scaleStart = Math.min(start, end, ...jumps.flatMap((jump) => [jump.from, jump.to]))
    const scaleEnd = Math.max(start, end, ...jumps.flatMap((jump) => [jump.from, jump.to]))
    const marker = Number(values.marker ?? values.target ?? end)
    const positionFor = (value: number) => scaleEnd === scaleStart ? 0 : ((value - scaleStart) / (scaleEnd - scaleStart)) * 100
    const position = Math.max(0, Math.min(100, positionFor(marker)))
    return (
      <div className="math-visual number-line-visual" role="img" aria-label={representation.label}>
        <div className="number-line-track">
          <span className="number-line-marker" style={{ left: `${position}%` }} />
          {jumps.map((jump, index) => {
            const from = positionFor(jump.from)
            const to = positionFor(jump.to)
            return (
              <span
                aria-label={`Sprung von ${jump.from} bis ${jump.to}: ${jump.label}`}
                className={jump.to < jump.from ? 'number-line-jump number-line-jump--backward' : 'number-line-jump'}
                key={`${jump.from}-${jump.to}-${index}`}
                style={{ left: `${Math.min(from, to)}%`, width: `${Math.abs(to - from)}%` }}
              >
                {jump.label}
              </span>
            )
          })}
        </div>
        <div className="number-line-labels">
          <span>{scaleStart}</span>
          {marker !== scaleStart && marker !== scaleEnd && <strong>{marker}</strong>}
          <span>{scaleEnd}</span>
        </div>
      </div>
    )
  }

  if (representation.kind === 'groups') {
    const groups = Number(values.groups)
    const size = Number(values.size)
    if (!isValidGroupValue(groups) || !isValidGroupValue(size)) {
      return (
        <div className="math-visual math-visual--error" role="alert">
          Das Gruppenbild enthält ungültige Mengenangaben.
        </div>
      )
    }
    const pointColumns = size <= 5 ? size : 5
    return (
      <div className="math-visual groups-visual" role="img" aria-label={`${groups} Gruppen mit je ${size} Punkten. ${representation.label}`}>
        {Array.from({ length: groups }, (_, group) => (
          <span
            aria-hidden="true"
            className="visual-group"
            key={group}
            style={{ '--point-columns': pointColumns } as CSSProperties}
          >
            {Array.from({ length: size }, (_, item) => <i key={item} />)}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="math-visual bar-model-visual" role="img" aria-label={representation.label}>
      <div className="bar-segments">
        <span>{textValue(values.firstLabel ?? values.first)}</span>
        <span>{textValue(values.secondLabel ?? values.second)}</span>
      </div>
      <strong>{textValue(values.question) || `Gesucht: ${textValue(values.total) || '?'}`}</strong>
    </div>
  )
}
