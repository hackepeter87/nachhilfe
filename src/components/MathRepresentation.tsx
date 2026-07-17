import type { CSSProperties } from 'react'
import { isValidCubeBuilding, type CubeBuilding, type ExerciseRepresentation } from '../domain'
import { WORD_MODEL_UNKNOWN_QUANTITY } from '../content/catalog'

const isValidGroupValue = (value: number) => Number.isInteger(value) && value >= 1 && value <= 10
const isNumberLineJump = (value: unknown): value is { from: number; to: number; label: string } =>
  typeof value === 'object' && value !== null && 'from' in value && 'to' in value && 'label' in value

function coinLabel(cents: number): string {
  return cents >= 100 ? `${cents / 100} €` : `${cents} ct`
}

function CubeBuildingDiagram({ building, turn, axisLabel, turnLabel }: {
  building: CubeBuilding
  turn?: 'left' | 'right'
  axisLabel?: string
  turnLabel?: string
}) {
  const cubes = building.heights.flatMap((height, index) => {
    const x = index % building.width
    const y = Math.floor(index / building.width)
    return Array.from({ length: height }, (_, z) => ({ x, y, z }))
  }).sort((first, second) => (first.x + first.y + first.z) - (second.x + second.y + second.z))
  const points = (coordinates: Array<[number, number]>) => coordinates.map(([x, y]) => `${x},${y}`).join(' ')
  return (
    <svg aria-hidden="true" viewBox={turn ? '0 0 280 260' : '0 0 280 205'}>
      {turn && <g className="rotation-axis">
        <path d="M140 28 L140 178" />
        <text x="140" y="18" textAnchor="middle">{axisLabel}</text>
      </g>}
      {cubes.map(({ x, y, z }) => {
        const centerX = 132 + (x - y) * 38
        const topY = 105 + (x + y) * 20 - z * 38
        return (
          <g className="iso-cube" key={`${x}-${y}-${z}`}>
            <polygon className="cube-face cube-face--left" points={points([[centerX - 38, topY], [centerX, topY + 20], [centerX, topY + 58], [centerX - 38, topY + 38]])} />
            <polygon className="cube-face cube-face--right" points={points([[centerX, topY + 20], [centerX + 38, topY], [centerX + 38, topY + 38], [centerX, topY + 58]])} />
            <polygon className="cube-face cube-face--top" points={points([[centerX, topY - 20], [centerX + 38, topY], [centerX, topY + 20], [centerX - 38, topY]])} />
          </g>
        )
      })}
      <g className="view-direction view-direction--front">
        <path d="M118 194 L118 169 M110 177 L118 169 L126 177" />
        <text x="91" y="202">vorne</text>
      </g>
      <g className="view-direction view-direction--right">
        <path d="M264 151 L239 151 M247 143 L239 151 L247 159" />
        <text x="230" y="174">rechts</text>
      </g>
      {turn && <g className={`rotation-turn rotation-turn--${turn}`}>
        <path d={turn === 'right' ? 'M70 218 C100 246 180 246 211 216' : 'M211 218 C180 246 100 246 69 216'} />
        <path d={turn === 'right' ? 'M199 218 L211 216 L208 229' : 'M81 218 L69 216 L72 229'} />
        <text x="140" y="256" textAnchor="middle">{turnLabel}</text>
      </g>}
    </svg>
  )
}

export function MathRepresentation({ representation }: { representation: ExerciseRepresentation }) {
  const values = representation.values
  const textValue = (value: typeof values[string]) => Array.isArray(value) ? '' : value
  const modelType = typeof values.modelType === 'string' ? values.modelType : undefined
  const expectedUnknownQuantity = modelType ? WORD_MODEL_UNKNOWN_QUANTITY[modelType as keyof typeof WORD_MODEL_UNKNOWN_QUANTITY] : undefined
  const hasValidUnknownQuantity = !modelType || Boolean(expectedUnknownQuantity) && expectedUnknownQuantity === values.unknownQuantity

  if (representation.kind === 'cube-building') {
    const building: CubeBuilding = {
      width: Number(values.width),
      depth: Number(values.depth),
      heights: Array.isArray(values.heights) ? values.heights.map(Number) : []
    }
    if (!isValidCubeBuilding(building)) {
      return <div className="math-visual math-visual--error" role="alert">Das Würfelgebäude enthält ungültige Daten.</div>
    }
    return (
      <div className="math-visual cube-building-visual" role="img" aria-label={representation.label}>
        <CubeBuildingDiagram building={building} />
      </div>
    )
  }

  if (representation.kind === 'cube-rotation') {
    const building: CubeBuilding = {
      width: Number(values.width),
      depth: Number(values.depth),
      heights: Array.isArray(values.heights) ? values.heights.map(Number) : []
    }
    const turn = values.turn === 'left' || values.turn === 'right' ? values.turn : undefined
    const axisLabel = typeof values.axisLabel === 'string' && values.axisLabel.trim() ? values.axisLabel : undefined
    const turnLabel = typeof values.turnLabel === 'string' && values.turnLabel.trim() ? values.turnLabel : undefined
    if (!isValidCubeBuilding(building) || !turn || !axisLabel || !turnLabel) {
      return <div className="math-visual math-visual--error" role="alert">Die Würfeldrehung enthält ungültige Daten.</div>
    }
    return (
      <div className="math-visual cube-building-visual cube-rotation-visual" role="img" aria-label={representation.label}>
        <CubeBuildingDiagram building={building} turn={turn} axisLabel={axisLabel} turnLabel={turnLabel} />
      </div>
    )
  }

  if (representation.kind === 'cube-view') {
    const rows = Number(values.rows)
    const columns = Number(values.columns)
    const cells = Array.isArray(values.cells) ? values.cells.map(Number) : []
    const valid = Number.isInteger(rows) && rows >= 1 && rows <= 3 && Number.isInteger(columns) && columns >= 1 && columns <= 3 &&
      cells.length === rows * columns && cells.every((cell) => cell === 0 || cell === 1) && cells.some(Boolean)
    if (!valid) return <div className="math-visual math-visual--error" role="alert">Die Körperansicht enthält ungültige Daten.</div>
    return (
      <div className="math-visual cube-view-visual" role="img" aria-label={representation.label}>
        <span className="cube-view-grid" aria-hidden="true" style={{ '--view-columns': columns } as CSSProperties}>
          {cells.map((cell, index) => <i className={cell ? 'cube-view-cell cube-view-cell--filled' : 'cube-view-cell'} key={index} />)}
        </span>
      </div>
    )
  }

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
    const operation = values.operation
    const carry = Number(values.carry)
    const carryColumn = values.carryColumn
    const unbundle = Number(values.unbundle)
    const unbundleFrom = values.unbundleFrom
    const onesCarry = first % 10 + second % 10 >= 10 ? 1 : 0
    const tensCarry = Math.floor(first / 10) % 10 + Math.floor(second / 10) % 10 + onesCarry >= 10 ? 1 : 0
    const onesUnbundle = first % 10 < second % 10 ? 1 : 0
    const tensUnbundle = Math.floor(first / 10) % 10 - onesUnbundle < Math.floor(second / 10) % 10 ? 1 : 0
    const visibleCarryMatches = carry === 0 ||
      (onesCarry + tensCarry === 1 && (onesCarry === 1 ? carryColumn === 'tens' : carryColumn === 'hundreds'))
    const visibleUnbundleMatches = unbundle === 0 ||
      (onesUnbundle + tensUnbundle === 1 && (onesUnbundle === 1 ? unbundleFrom === 'tens' : unbundleFrom === 'hundreds'))
    const declaredUnbundleMatches = onesUnbundle + tensUnbundle === 0
      ? unbundleFrom === 'none'
      : onesUnbundle === 1
        ? unbundleFrom === 'tens'
        : unbundleFrom === 'hundreds'
    const validBase = Number.isInteger(first) && first >= 100 && first <= 999 &&
      Number.isInteger(second) && second >= 100 && second <= 999
    const validAddition = operation === '+' && first + second <= 999 && (carry === 0 || carry === 1) &&
      ['none', 'tens', 'hundreds'].includes(String(carryColumn)) && visibleCarryMatches
    const validSubtraction = operation === '−' && first > second && (unbundle === 0 || unbundle === 1) &&
      ['none', 'tens', 'hundreds'].includes(String(unbundleFrom)) && onesUnbundle + tensUnbundle <= 1 &&
      declaredUnbundleMatches && visibleUnbundleMatches
    const valid = validBase && (validAddition || validSubtraction)
    if (!valid) {
      return <div className="math-visual math-visual--error" role="alert">Die Spaltendarstellung enthält ungültige Rechendaten.</div>
    }
    const digits = (value: number) => [Math.floor(value / 100), Math.floor(value / 10) % 10, value % 10]
    const firstDigits = digits(first)
    const secondDigits = digits(second)
    const answerDigits = digits(operation === '+' ? first + second : first - second)
    const revealedDigits = Array.isArray(values.revealedDigits) && values.revealedDigits.length === 3 &&
      values.revealedDigits.every((digit, index) => typeof digit === 'number' && Number.isInteger(digit) &&
        (digit === -1 || digit === answerDigits[index]))
      ? values.revealedDigits as number[]
      : [-1, -1, -1]
    const activeColumn = typeof values.activeColumn === 'string' ? values.activeColumn : 'none'
    const carryIndex = carryColumn === 'hundreds' ? 0 : carryColumn === 'tens' ? 1 : -1
    const adjustedDigits: Array<number | null> = unbundle === 1
      ? unbundleFrom === 'tens'
        ? [null, firstDigits[1]! - 1, firstDigits[2]! + 10]
        : [firstDigits[0]! - 1, firstDigits[1]! + 10, null]
      : [null, null, null]
    const description = operation === '+'
      ? carry === 1
        ? `Schriftliche Addition ${first} plus ${second}. Ein Übertrag zur ${carryColumn === 'hundreds' ? 'Hunderter' : 'Zehner'}spalte ist sichtbar. Das Ergebnis ist noch offen.`
        : `Schriftliche Addition ${first} plus ${second}. Das Ergebnis ist noch offen.`
      : unbundle === 1
        ? `Schriftliche Subtraktion ${first} minus ${second}. Eine ${unbundleFrom === 'tens' ? 'Zehnerstelle wird in zehn Einer' : 'Hunderterstelle wird in zehn Zehner'} entbündelt. Das Ergebnis ist noch offen.`
        : `Schriftliche Subtraktion ${first} minus ${second}. Das Ergebnis ist noch offen.`
    return (
      <div className="math-visual column-calculation" role="img" aria-label={description}>
        <div className="column-row column-row--headers" aria-hidden="true">
          {['hundreds', 'tens', 'ones'].map((column, index) => <span className={activeColumn === column ? 'column-cell--active' : ''} key={column}>{['H', 'Z', 'E'][index]}</span>)}
        </div>
        <div className="column-row column-row--carry" aria-hidden="true">
          {operation === '+'
            ? firstDigits.map((_, index) => <span className={activeColumn === 'carry' && carryIndex === index ? 'column-cell--active' : ''} key={index}>{carry === 1 && carryIndex === index ? '1' : ''}</span>)
            : adjustedDigits.map((digit, index) => <span className={`${activeColumn === 'unbundle' && digit !== null ? 'column-cell--active ' : ''}${digit !== null ? 'column-cell--adjusted' : ''}`} key={index}>{digit}</span>)}
        </div>
        <div className="column-equation" aria-hidden="true">
          <span className="column-operation" />
          <div className="column-row">{firstDigits.map((digit, index) => <strong className={adjustedDigits[index] !== null ? 'column-cell--source-adjusted' : ''} key={index}>{digit}</strong>)}</div>
          <span className="column-operation">{operation}</span>
          <div className="column-row">{secondDigits.map((digit, index) => <strong key={index}>{digit}</strong>)}</div>
          <span className="column-operation" />
          <div className="column-row column-row--result">
            {revealedDigits.map((digit, index) => <strong className={activeColumn === ['hundreds', 'tens', 'ones'][index] ? 'column-cell--active' : ''} key={index}>{digit < 0 ? '?' : digit}</strong>)}
          </div>
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
    if (modelType && !hasValidUnknownQuantity) {
      return <div className="math-visual math-visual--error" role="alert">Das Gruppenbild benennt die unbekannte Größe nicht eindeutig.</div>
    }
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
    if (!hasValidUnknownQuantity) {
      return <div className="math-visual math-visual--error" role="alert">Das Balkenmodell benennt die unbekannte Größe nicht eindeutig.</div>
    }
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
