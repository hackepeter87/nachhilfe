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
  const modelType = typeof values.modelType === 'string' ? values.modelType : undefined

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

  if (representation.kind === 'column-calculation') {
    const first = Number(values.first)
    const second = Number(values.second)
    const carry = Number(values.carry)
    const carryColumn = values.carryColumn
    const onesCarry = first % 10 + second % 10 >= 10 ? 1 : 0
    const tensCarry = Math.floor(first / 10) % 10 + Math.floor(second / 10) % 10 + onesCarry >= 10 ? 1 : 0
    const visibleCarryMatches = carry === 0 ||
      (onesCarry + tensCarry === 1 && (onesCarry === 1 ? carryColumn === 'tens' : carryColumn === 'hundreds'))
    const valid = Number.isInteger(first) && first >= 100 && first <= 999 &&
      Number.isInteger(second) && second >= 100 && second <= 999 && first + second <= 999 &&
      values.operation === '+' && (carry === 0 || carry === 1) &&
      ['none', 'tens', 'hundreds'].includes(String(carryColumn)) && visibleCarryMatches
    if (!valid) {
      return <div className="math-visual math-visual--error" role="alert">Die Spaltendarstellung enthält ungültige Rechendaten.</div>
    }
    const digits = (value: number) => [Math.floor(value / 100), Math.floor(value / 10) % 10, value % 10]
    const firstDigits = digits(first)
    const secondDigits = digits(second)
    const carryIndex = carryColumn === 'hundreds' ? 0 : carryColumn === 'tens' ? 1 : -1
    const description = carry === 1
      ? `Schriftliche Addition ${first} plus ${second}. Ein Übertrag zur ${carryColumn === 'hundreds' ? 'Hunderter' : 'Zehner'}spalte ist sichtbar. Das Ergebnis ist noch offen.`
      : `Schriftliche Addition ${first} plus ${second}. Das Ergebnis ist noch offen.`
    return (
      <div className="math-visual column-calculation" role="img" aria-label={description}>
        <div className="column-row column-row--headers" aria-hidden="true"><span>H</span><span>Z</span><span>E</span></div>
        <div className="column-row column-row--carry" aria-hidden="true">
          {firstDigits.map((_, index) => <span key={index}>{carry === 1 && carryIndex === index ? '1' : ''}</span>)}
        </div>
        <div className="column-equation" aria-hidden="true">
          <span className="column-operation" />
          <div className="column-row">{firstDigits.map((digit, index) => <strong key={index}>{digit}</strong>)}</div>
          <span className="column-operation">+</span>
          <div className="column-row">{secondDigits.map((digit, index) => <strong key={index}>{digit}</strong>)}</div>
          <span className="column-operation" />
          <div className="column-row column-row--result">{firstDigits.map((_, index) => <strong key={index}>?</strong>)}</div>
        </div>
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
    if (modelType === 'equal-groups-share') {
      const total = Number(values.total)
      if (!isValidGroupValue(groups) || !Number.isInteger(total) || total < 2 || total > 100) {
        return <div className="math-visual math-visual--error" role="alert">Das Verteilbild enthält ungültige Mengenangaben.</div>
      }
      return (
        <div className="math-visual word-model word-groups-model" role="img" aria-label={`${total} Punkte werden auf ${groups} gleich große Gruppen verteilt. Punkte je Gruppe: unbekannt.`}>
          <div className="known-pool" aria-hidden="true">
            <strong>{total} insgesamt</strong>
            <span>{Array.from({ length: total }, (_, item) => <i key={item} />)}</span>
          </div>
          <span className="model-arrow" aria-hidden="true">↓</span>
          <div className="unknown-groups" aria-hidden="true">
            {Array.from({ length: groups }, (_, group) => <span className="visual-group visual-group--unknown" key={group}>?</span>)}
          </div>
          <strong>Wie viele kommen in jede Gruppe?</strong>
        </div>
      )
    }
    if (!isValidGroupValue(groups) || !isValidGroupValue(size)) {
      return (
        <div className="math-visual math-visual--error" role="alert">
          Das Gruppenbild enthält ungültige Mengenangaben.
        </div>
      )
    }
    const pointColumns = size <= 5 ? size : 5
    return (
      <div className={modelType === 'equal-groups-total' ? 'math-visual groups-visual word-model' : 'math-visual groups-visual'} role="img" aria-label={`${groups} Gruppen mit je ${size} Punkten. ${modelType === 'equal-groups-total' ? 'Gesamtzahl unbekannt.' : representation.label}`}>
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
        {modelType === 'equal-groups-total' && <strong className="groups-question">Insgesamt: ?</strong>}
      </div>
    )
  }

  if (representation.kind === 'bar-model' && modelType) {
    const first = Number(values.first)
    const second = Number(values.second)
    const third = Number(values.third)
    const total = Number(values.total)
    if (!Number.isFinite(first) || !Number.isFinite(second) || first < 0 || second < 0) {
      return <div className="math-visual math-visual--error" role="alert">Das Balkenmodell enthält ungültige Mengenangaben.</div>
    }
    if (modelType === 'change-increase') return (
      <div className="math-visual word-model change-increase-model" role="img" aria-label={`Anfang ${first}, dazu ${second}, neue Gesamtmenge unbekannt.`}>
        <span className="model-caption">zuerst</span>
        <div className="model-bar model-bar--known-part" style={{ width: `${(first / (first + second)) * 100}%` }}><span>{first}</span></div>
        <span className="model-caption">danach kommt etwas dazu</span>
        <div className="model-bar model-bar--parts" style={{ gridTemplateColumns: `${first}fr ${second}fr` }}><span>{first}</span><span>+ {second}</span></div>
        <strong>neue Gesamtmenge: ?</strong>
      </div>
    )
    if (modelType === 'change-decrease') return (
      <div className="math-visual word-model" role="img" aria-label={`Anfang ${first}, weg ${second}, verbleibende Menge unbekannt.`}>
        <span className="model-caption">am Anfang</span><div className="model-bar"><span>{first}</span></div>
        <span className="model-caption">danach</span><div className="model-bar model-bar--parts"><span className="model-unknown">?</span><span className="model-removed">weg: {second}</span></div>
        <strong>übrig: ?</strong>
      </div>
    )
    if (modelType === 'part-whole') return (
      <div className="math-visual word-model" role="img" aria-label={`Teile ${first} und ${second}, Ganzes unbekannt.`}>
        <span className="model-caption">zwei bekannte Teile</span><div className="model-bar model-bar--parts"><span>{first}</span><span>{second}</span></div>
        <strong>Ganzes: ?</strong>
      </div>
    )
    if (modelType === 'comparison') return (
      <div className="math-visual word-model comparison-model" role="img" aria-label={`Mengen ${first} und ${second}, Unterschied unbekannt.`}>
        <div><span>Menge A</span><div className="model-bar"><span>{first}</span></div></div>
        <div><span>Menge B</span><div className="model-bar model-bar--short"><span>{second}</span><span className="model-unknown">?</span></div></div>
        <strong>Unterschied: ?</strong>
      </div>
    )
    if (modelType === 'missing-part') {
      if (!Number.isFinite(total) || total < second) return <div className="math-visual math-visual--error" role="alert">Das Teil-Ganzes-Modell ist ungültig.</div>
      return (
        <div className="math-visual word-model" role="img" aria-label={`Ganzes ${total}, bekannter Teil ${second}, fehlender Teil unbekannt.`}>
          <span className="model-caption">Ganzes: {total}</span><div className="model-bar"><span>{total}</span></div>
          <span className="model-caption">bekannter und fehlender Teil</span><div className="model-bar model-bar--parts"><span>{second}</span><span className="model-unknown">?</span></div>
        </div>
      )
    }
    if (modelType === 'increase-then-decrease' || modelType === 'decrease-then-increase') {
      if (!Number.isFinite(third) || third < 0) return <div className="math-visual math-visual--error" role="alert">Das Veränderungsmodell ist ungültig.</div>
      const firstChange = modelType === 'increase-then-decrease' ? `+ ${second}` : `− ${second}`
      const secondChange = modelType === 'increase-then-decrease' ? `− ${third}` : `+ ${third}`
      return (
        <div className="math-visual word-model sequence-model" role="img" aria-label={`Start ${first}, dann ${firstChange}, danach ${secondChange}, Endmenge unbekannt.`}>
          <span><small>Start</small><strong>{first}</strong></span><b aria-hidden="true">→</b>
          <span><small>1. Veränderung</small><strong>{firstChange}</strong></span><b aria-hidden="true">→</b>
          <span><small>2. Veränderung</small><strong>{secondChange}</strong></span><b aria-hidden="true">→</b>
          <span><small>Ende</small><strong>?</strong></span>
        </div>
      )
    }
    return <div className="math-visual math-visual--error" role="alert">Diese Darstellung ist nicht verfügbar.</div>
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
