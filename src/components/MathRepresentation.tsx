import type { CSSProperties } from 'react'
import type { ExerciseRepresentation } from '../domain'

const isValidGroupValue = (value: number) => Number.isInteger(value) && value >= 1 && value <= 10
const isNumberLineJump = (value: unknown): value is { from: number; to: number; label: string } =>
  typeof value === 'object' && value !== null && 'from' in value && 'to' in value && 'label' in value

function coinLabel(cents: number): string {
  return cents >= 100 ? `${cents / 100} €` : `${cents} ct`
}

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
    const jumps = Array.isArray(values.jumps) ? values.jumps.filter(isNumberLineJump) : []
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

  if (representation.kind === 'money') {
    const coins = Array.isArray(values.coins) && values.coins.every((coin) => typeof coin === 'number' && Number.isInteger(coin) && coin > 0)
      ? values.coins as number[]
      : []
    const displayedCents = Number(values.displayedCents)
    if (coins.length === 0 || coins.reduce((sum, coin) => sum + coin, 0) !== displayedCents) {
      return <div className="math-visual math-visual--error" role="alert">Die Gelddarstellung enthält einen ungültigen Betrag.</div>
    }
    return (
      <div className="math-visual money-visual" role="img" aria-label={`${representation.label}: ${displayedCents} Cent`}>
        {Number(values.priceCents) > 0 && (
          <div className="money-context">
            <span>{textValue(values.priceLabel)} <strong>{Math.floor(Number(values.priceCents) / 100)},{String(Number(values.priceCents) % 100).padStart(2, '0')} €</strong></span>
            <span>{textValue(values.paidLabel)} <strong>{Math.floor(Number(values.paidCents) / 100)},{String(Number(values.paidCents) % 100).padStart(2, '0')} €</strong></span>
          </div>
        )}
        <div className="coin-row" aria-hidden="true">
          {coins.map((coin, index) => <span className={`coin coin--${coin}`} key={`${coin}-${index}`}>{coinLabel(coin)}</span>)}
        </div>
      </div>
    )
  }

  if (representation.kind === 'length') {
    const lengthCm = Number(values.lengthCm)
    const maxCm = Number(values.maxCm)
    if (!Number.isInteger(lengthCm) || !Number.isInteger(maxCm) || lengthCm <= 0 || maxCm < lengthCm || maxCm > 1000) {
      return <div className="math-visual math-visual--error" role="alert">Die Messstrecke enthält ungültige Längenangaben.</div>
    }
    const position = (lengthCm / maxCm) * 100
    return (
      <div className="math-visual length-visual" role="img" aria-label={`${representation.label}: ${lengthCm} Zentimeter`}>
        {values.equivalence && <strong className="length-equivalence">{textValue(values.equivalence)}</strong>}
        <div className="ruler-track">
          <span className="measured-length" style={{ width: `${position}%` }} />
          {Array.from({ length: 11 }, (_, index) => <i aria-hidden="true" key={index} style={{ left: `${index * 10}%` }} />)}
        </div>
        <div className="ruler-labels"><span>0</span><strong>{lengthCm} cm</strong><span>{maxCm} cm</span></div>
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
