import type { ExerciseRepresentation } from '../domain'

export function MathRepresentation({ representation }: { representation: ExerciseRepresentation }) {
  const values = representation.values

  if (representation.kind === 'place-value') {
    return (
      <div className="math-visual place-value-visual" role="img" aria-label={representation.label}>
        {(['hundreds', 'tens', 'ones'] as const).map((key) => (
          <div className={values.highlight === key ? 'place-column place-column--highlight' : 'place-column'} key={key}>
            <span>{key === 'hundreds' ? 'H' : key === 'tens' ? 'Z' : 'E'}</span>
            <strong>{values[key]}</strong>
          </div>
        ))}
      </div>
    )
  }

  if (representation.kind === 'number-line') {
    const start = Number(values.start)
    const end = Number(values.end)
    const marker = Number(values.marker ?? values.target ?? end)
    const position = end === start ? 0 : Math.max(0, Math.min(100, ((marker - start) / (end - start)) * 100))
    return (
      <div className="math-visual number-line-visual" role="img" aria-label={representation.label}>
        <div className="number-line-track"><span className="number-line-marker" style={{ left: `${position}%` }} /></div>
        <div className="number-line-labels">
          <span>{start}</span>
          {marker !== start && marker !== end && <strong>{marker}</strong>}
          <span>{end}</span>
        </div>
        {values.step && <p>Schrittweite: {values.step}</p>}
      </div>
    )
  }

  if (representation.kind === 'groups') {
    const groups = Number(values.groups)
    const size = Number(values.size)
    return (
      <div className="math-visual groups-visual" role="img" aria-label={representation.label}>
        {Array.from({ length: Math.min(groups, 10) }, (_, group) => (
          <span className="visual-group" key={group}>{Array.from({ length: Math.min(size, 10) }, (_, item) => <i key={item} />)}</span>
        ))}
      </div>
    )
  }

  return (
    <div className="math-visual bar-model-visual" role="img" aria-label={representation.label}>
      <div className="bar-segments">
        <span>{values.firstLabel ?? values.first}</span>
        <span>{values.secondLabel ?? values.second}</span>
      </div>
      <strong>{values.question ?? `Gesucht: ${values.total ?? '?'}`}</strong>
    </div>
  )
}
