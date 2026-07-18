import type { CSSProperties } from 'react'
import { areaInUnitSquares, clockHandAngles, isConnectedGridFigure, isValidCubeBuilding, perimeterInUnitEdges, validateGridCells, type CubeBuilding, type ExerciseRepresentation } from '../domain'
import { WORD_MODEL_UNKNOWN_QUANTITY } from '../content/catalog'

const isValidGroupValue = (value: number) => Number.isInteger(value) && value >= 1 && value <= 10
const isNumberLineJump = (value: unknown): value is { from: number; to: number; label: string } =>
  typeof value === 'object' && value !== null && 'from' in value && 'to' in value && 'label' in value

function coinLabel(cents: number): string {
  return cents >= 100 ? `${cents / 100} €` : `${cents} ct`
}

function amountLabel(cents: number): string {
  return cents >= 100
    ? `${Math.floor(cents / 100)},${String(cents % 100).padStart(2, '0')} €`
    : `${cents} ct`
}

function ClockFace({ hour, minute }: { hour: number; minute: number }) {
  const angles = clockHandAngles(hour, minute)
  return (
    <div className="clock-face" aria-hidden="true" data-hour-angle={angles.hour} data-minute-angle={angles.minute}>
      {Array.from({ length: 12 }, (_, index) => {
        const value = index + 1
        const angle = value * 30 * Math.PI / 180
        return <span className="clock-number" key={value} style={{ left: `${50 + Math.sin(angle) * 39}%`, top: `${50 - Math.cos(angle) * 39}%` }}>{value}</span>
      })}
      <i className="clock-hand clock-hand--hour" style={{ transform: `translateX(-50%) rotate(${angles.hour}deg)` }} />
      <i className="clock-hand clock-hand--minute" style={{ transform: `translateX(-50%) rotate(${angles.minute}deg)` }} />
      <b className="clock-center" />
    </div>
  )
}

function measureLabel(value: number, quantityType: 'mass' | 'capacity'): string {
  if (value === 1000) return quantityType === 'mass' ? '1 kg' : '1 l'
  return `${value} ${quantityType === 'mass' ? 'g' : 'ml'}`
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
  const { knownValues, unknownValues, revealedValues } = representation.valueRoles
  const known = new Set(knownValues)
  const unknown = new Set(unknownValues)
  const revealed = new Set(revealedValues)
  const hasValidValueRoles = knownValues.length === known.size && unknownValues.length === unknown.size &&
    revealedValues.length === revealed.size &&
    knownValues.every((key) => key in values) &&
    Object.keys(values).every((key) => known.has(key) || unknown.has(key)) &&
    unknownValues.every((key) => !known.has(key)) &&
    revealedValues.every((key) => unknown.has(key))
  if (!hasValidValueRoles) {
    return <div className="math-visual math-visual--error" role="alert">Die Darstellung enthält widersprüchliche mathematische Rollen.</div>
  }
  const isValueVisible = (key: string) => known.has(key) || revealed.has(key)
  const textValue = (value: typeof values[string]) => Array.isArray(value) ? '' : value

  if (representation.kind === 'ten-frame') {
    const first = Number(values.first)
    const second = Number(values.second)
    const valid = Number.isInteger(first) && Number.isInteger(second) && first >= 0 && second >= 0 && first <= 10 && second <= 10
    if (!valid) return <div className="math-visual math-visual--error" role="alert">Das Punktefeld enthält ungültige Mengen.</div>
    const secondVisible = isValueVisible('second')
    return (
      <div className="math-visual ten-frame-visual" role="img" aria-label={`${representation.label}. Erste Menge ${first}, zweite Menge ${secondVisible ? second : 'unbekannt'}.`}>
        {[{ label: 'erste Menge', count: first }, { label: 'zweite Menge', count: second }].map((frame) => (
          <section key={frame.label}>
            <span>{frame.label}</span>
            <div className="ten-frame" aria-hidden="true">
              {Array.from({ length: 10 }, (_, index) => <i className={frame.label === 'zweite Menge' && !secondVisible ? 'ten-frame-dot ten-frame-dot--unknown' : index < frame.count ? 'ten-frame-dot ten-frame-dot--filled' : 'ten-frame-dot'} key={index} />)}
            </div>
          </section>
        ))}
      </div>
    )
  }
  const modelType = typeof values.modelType === 'string' ? values.modelType : undefined
  const isCatalogWordModel = Boolean(modelType && modelType in WORD_MODEL_UNKNOWN_QUANTITY)
  const expectedUnknownQuantity = isCatalogWordModel ? WORD_MODEL_UNKNOWN_QUANTITY[modelType as keyof typeof WORD_MODEL_UNKNOWN_QUANTITY] : undefined
  const hasValidUnknownQuantity = !isCatalogWordModel || Boolean(expectedUnknownQuantity) && expectedUnknownQuantity === values.unknownQuantity

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

  if (representation.kind === 'folding-paper') {
    const rows = Number(values.rows)
    const columns = Number(values.columns)
    const marks = Array.isArray(values.marks) ? values.marks.map(Number) : []
    const axis = values.axis === 'vertical' || values.axis === 'horizontal' ? values.axis : undefined
    const foldSide = ['left', 'right', 'top', 'bottom'].includes(String(values.foldSide)) ? String(values.foldSide) : undefined
    const mode = values.mode === 'point-fold' || values.mode === 'cut-unfold' ? values.mode : undefined
    const showInstruction = Number(values.showInstruction) === 1
    const valid = Number.isInteger(rows) && rows >= 2 && rows <= 6 && Number.isInteger(columns) && columns >= 2 && columns <= 8 &&
      Boolean(axis) && Boolean(foldSide) && Boolean(mode) && marks.length > 0 && new Set(marks).size === marks.length &&
      marks.every((cell) => Number.isInteger(cell) && cell >= 0 && cell < rows * columns) &&
      (axis === 'vertical' ? columns % 2 === 0 && ['left', 'right'].includes(foldSide!) : rows % 2 === 0 && ['top', 'bottom'].includes(foldSide!))
    if (!valid) return <div className="math-visual math-visual--error" role="alert">Die Faltvorlage enthält ungültige Daten.</div>
    return (
      <div className="math-visual folding-paper-visual" role="img" aria-label={representation.label}>
        <div
          aria-hidden="true"
          className={`folding-grid folding-grid--axis-${axis}`}
          style={{ '--fold-rows': rows, '--fold-columns': columns } as CSSProperties}
        >
          {Array.from({ length: rows * columns }, (_, cell) => (
            <i className={marks.includes(cell) ? `folding-cell folding-cell--marked folding-cell--${mode}` : 'folding-cell'} key={cell} />
          ))}
        </div>
        {showInstruction && <div className={`folding-instruction folding-instruction--${foldSide}`}>
          <strong>{textValue(values.axisLabel)}</strong>
          <span>{textValue(values.foldLabel)}</span>
        </div>}
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
            <strong>{isValueVisible(key) ? textValue(values[key]) : '?'}</strong>
          </div>
        ))}
      </div>
    )
  }

  if (representation.kind === 'place-value-material') {
    const hundreds = Number(values.hundreds)
    const tens = Number(values.tens)
    const ones = Number(values.ones)
    const hasChange = values.changeHundreds !== undefined || values.changeTens !== undefined || values.changeOnes !== undefined
    const changeHundreds = Number(values.changeHundreds ?? 0)
    const changeTens = Number(values.changeTens ?? 0)
    const changeOnes = Number(values.changeOnes ?? 0)
    const operation = String(values.operation ?? '')
    const validAmounts = (amounts: number[]) => amounts.every((value) => Number.isInteger(value) && value >= 0) && amounts[0]! <= 9 && amounts[1]! <= 19 && amounts[2]! <= 19
    const valid = validAmounts([hundreds, tens, ones]) && (!hasChange || (validAmounts([changeHundreds, changeTens, changeOnes]) && ['+', '−'].includes(operation)))
    if (!valid) return <div className="math-visual math-visual--error" role="alert">Das Stellenwertmaterial enthält ungültige Mengen.</div>
    const material = (amounts: [number, number, number], keyPrefix: string) => (
      <div className="place-material">
        {amounts.map((amount, placeIndex) => (
          <section key={`${keyPrefix}-${placeIndex}`}>
            <b>{['H', 'Z', 'E'][placeIndex]}</b>
            <div>{Array.from({ length: amount }, (_, index) => (
              <i className={placeIndex === 0 ? 'hundred-flat' : placeIndex === 1 ? 'ten-rod' : 'one-dot'} key={index} />
            ))}</div>
          </section>
        ))}
      </div>
    )
    return (
      <div className="math-visual place-material-stack" role="img" aria-label={`${representation.label}. Ausgangszahl: ${hundreds} Hunderterflächen, ${tens} Zehnerstangen und ${ones} Einerpunkte.${hasChange ? ` Veränderung ${operation}: ${changeHundreds} Hunderterflächen, ${changeTens} Zehnerstangen und ${changeOnes} Einerpunkte.` : ''}`}>
        {hasChange && <strong>Ausgangszahl</strong>}
        {material([hundreds, tens, ones], 'start')}
        {hasChange && <><strong>{operation} Veränderungsmenge</strong>{material([changeHundreds, changeTens, changeOnes], 'change')}</>}
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
    const secondVisible = isValueVisible('second')
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
    const resultVisible = isValueVisible('result')
    const resultDescription = resultVisible ? `Das Ergebnis ist ${answerDigits.join('')}.` : 'Das Ergebnis ist noch offen.'
    const description = operation === '+'
      ? carry === 1
        ? `Schriftliche Addition ${first} plus ${second}. Ein Übertrag zur ${carryColumn === 'hundreds' ? 'Hunderter' : 'Zehner'}spalte ist sichtbar. ${resultDescription}`
        : `Schriftliche Addition ${first} plus ${second}. ${resultDescription}`
      : unbundle === 1
        ? `Schriftliche Subtraktion ${first} minus ${second}. Eine ${unbundleFrom === 'tens' ? 'Zehnerstelle wird in zehn Einer' : 'Hunderterstelle wird in zehn Zehner'} entbündelt. ${resultDescription}`
        : `Schriftliche Subtraktion ${first} minus ${second}. ${resultDescription}`
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
          <div className="column-row">{secondDigits.map((digit, index) => <strong key={index}>{secondVisible ? digit : '?'}</strong>)}</div>
          <span className="column-operation" />
          <div className="column-row column-row--result">
            {revealedDigits.map((digit, index) => <strong className={activeColumn === ['hundreds', 'tens', 'ones'][index] ? 'column-cell--active' : ''} key={index}>{digit < 0 ? '?' : digit}</strong>)}
          </div>
        </div>
      </div>
    )
  }

  if (representation.kind === 'chance-display') {
    const experimentType = String(values.experimentType)
    const outcomeCount = Number(values.outcomeCount)
    const outcomes = Array.from({ length: outcomeCount }, (_, index) => values[`outcome${index}`])
    const valid = ['bag', 'coin', 'die', 'spinner'].includes(experimentType) && Number.isInteger(outcomeCount) && outcomeCount >= 2 && outcomeCount <= 8 && outcomes.every((outcome) => typeof outcome === 'string' && outcome.length > 0)
    if (!valid) return <div className="math-visual math-visual--error" role="alert">Der Zufallsversuch enthält ungültige Ergebnisse.</div>
    const description = `${representation.label}. Mögliche gleich große Felder oder Ergebnisse: ${outcomes.join(', ')}.`
    return (
      <div className={`math-visual chance-display chance-display--${experimentType}`} role="img" aria-label={description}>
        <strong>{textValue(values.title)}</strong>
        <div className="chance-outcomes" aria-hidden="true">
          {outcomes.map((outcome, index) => <span key={`${outcome}-${index}`}><i>{experimentType === 'die' ? '□' : experimentType === 'coin' ? '○' : '●'}</i>{String(outcome)}</span>)}
        </div>
        {values.eventALabel && values.eventBLabel && <p><b>{textValue(values.eventALabel)}</b><span>vergleichen mit</span><b>{textValue(values.eventBLabel)}</b></p>}
      </div>
    )
  }

  if (representation.kind === 'combination-display') {
    const firstCount = Number(values.firstCount)
    const secondCount = Number(values.secondCount)
    const firstOptions = Array.from({ length: firstCount }, (_, index) => values[`first${index}`])
    const secondOptions = Array.from({ length: secondCount }, (_, index) => values[`second${index}`])
    const valid = Number.isInteger(firstCount) && firstCount >= 2 && firstCount <= 3 && Number.isInteger(secondCount) && secondCount >= 2 && secondCount <= 3 &&
      [...firstOptions, ...secondOptions].every((option) => typeof option === 'string' && option.length > 0)
    if (!valid) return <div className="math-visual math-visual--error" role="alert">Die Kombinationsdarstellung ist unvollständig.</div>
    const excluded = values.excludedFirst && values.excludedSecond ? `${values.excludedFirst} mit ${values.excludedSecond}` : ''
    const description = `${representation.label}. ${values.firstLabel}: ${firstOptions.join(', ')}. ${values.secondLabel}: ${secondOptions.join(', ')}.${excluded ? ` Nicht erlaubt: ${excluded}.` : ''} Die Anzahl bleibt unbekannt.`
    return (
      <div className="math-visual combination-display" role="img" aria-label={description}>
        <strong>{textValue(values.title)}</strong>
        <div className="combination-groups" aria-hidden="true">
          <section><b>{textValue(values.firstLabel)}</b>{firstOptions.map((option) => <span key={String(option)}>{String(option)}</span>)}</section>
          <span className="combination-sign">mit</span>
          <section><b>{textValue(values.secondLabel)}</b>{secondOptions.map((option) => <span key={String(option)}>{String(option)}</span>)}</section>
        </div>
        <div className="combination-grid" aria-hidden="true" style={{ '--combination-columns': secondCount } as CSSProperties}>
          {firstOptions.flatMap((first) => secondOptions.map((second) => {
            const blocked = first === values.excludedFirst && second === values.excludedSecond
            return <span className={blocked ? 'combination-cell combination-cell--blocked' : 'combination-cell'} key={`${first}-${second}`}>{blocked ? '×' : ''}</span>
          }))}
        </div>
        {excluded && <small>{textValue(values.excludedLabel)}: {excluded}</small>}
      </div>
    )
  }

  if (representation.kind === 'clock') {
    const mode = String(values.mode)
    const startHour = Number(mode === 'read' ? values.hour : values.startHour)
    const startMinute = Number(mode === 'read' ? values.minute : values.startMinute)
    const endHour = Number(values.endHour)
    const endMinute = Number(values.endMinute)
    const validTime = (hour: number, minute: number) => Number.isInteger(hour) && hour >= 0 && hour <= 23 && Number.isInteger(minute) && minute >= 0 && minute < 60
    const valid = ['read', 'duration'].includes(mode) && validTime(startHour, startMinute) && (mode === 'read' || validTime(endHour, endMinute)) && typeof values.answerLabel === 'string'
    if (!valid) return <div className="math-visual math-visual--error" role="alert">Die Uhrendarstellung enthält ungültige Zeiten.</div>
    const answerVisible = isValueVisible('answerLabel')
    const startLabel = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')} Uhr`
    const endLabel = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')} Uhr`
    const description = mode === 'read'
      ? `${representation.label}. Der kurze Zeiger gehört zur Stunde ${startHour}, der lange Zeiger zu ${startMinute} Minuten. ${answerVisible ? `Ergebnis ${values.answerLabel}.` : 'Die digitale Uhrzeit bleibt unbekannt.'}`
      : `${representation.label}. Start ${startLabel}, Ende ${endLabel}. ${answerVisible ? `Ergebnis ${values.answerLabel}.` : 'Die Zeitspanne bleibt unbekannt.'}`
    return (
      <div className="math-visual clock-visual" role="img" aria-label={description}>
        <div className={mode === 'duration' ? 'clock-pair' : 'clock-single'}>
          <section><ClockFace hour={startHour} minute={startMinute} />{mode === 'duration' && <b>Start: {startLabel}</b>}</section>
          {mode === 'duration' && <span className="clock-arrow">→</span>}
          {mode === 'duration' && <section><ClockFace hour={endHour} minute={endMinute} /><b>Ende: {endLabel}</b></section>}
        </div>
        <strong className="quantity-result">{answerVisible ? `Ergebnis: ${textValue(values.answerLabel)}` : 'Ergebnis: ?'}</strong>
      </div>
    )
  }

  if (representation.kind === 'mass-scale' || representation.kind === 'capacity-vessel') {
    const quantityType = representation.kind === 'mass-scale' ? 'mass' : 'capacity'
    const mode = String(values.mode)
    const knownAmount = Number(values.knownAmountBase)
    const targetAmount = Number(values.targetAmountBase)
    const firstAmount = Number(values.firstAmountBase)
    const secondAmount = Number(values.secondAmountBase)
    const operation = String(values.operation)
    const validBase = (value: number) => Number.isInteger(value) && value >= 0 && value <= 1000
    const valid = typeof values.answerLabel === 'string' && typeof values.equivalenceLabel === 'string' && (
      (mode === 'reference' && typeof values.itemLabel === 'string') ||
      (mode === 'complement' && validBase(knownAmount) && targetAmount === 1000 && knownAmount < targetAmount) ||
      (mode === 'calculation' && validBase(firstAmount) && validBase(secondAmount) && ['+', '−'].includes(operation))
    )
    if (!valid) return <div className="math-visual math-visual--error" role="alert">Die Größendarstellung enthält ungültige Messwerte.</div>
    const answerVisible = isValueVisible('answerLabel')
    const knownDescription = mode === 'reference' ? String(values.itemLabel)
      : mode === 'complement' ? `${measureLabel(knownAmount, quantityType)} bis ${measureLabel(targetAmount, quantityType)}`
        : `${measureLabel(firstAmount, quantityType)} ${operation} ${measureLabel(secondAmount, quantityType)}`
    const description = `${representation.label}. Bekannt: ${knownDescription}. ${answerVisible ? `Ergebnis ${values.answerLabel}.` : 'Das Ergebnis bleibt unbekannt.'}`
    const content = mode === 'reference' ? (
      <div className="reference-measure" aria-hidden="true"><span>{textValue(values.itemLabel)}</span><i /><strong>?</strong></div>
    ) : mode === 'complement' ? (
      <div className="measure-complement" aria-hidden="true">
        <div className="measure-track"><i style={{ '--measure-fill': `${knownAmount / targetAmount * 100}%` } as CSSProperties} /></div>
        <div><span>{measureLabel(knownAmount, quantityType)}</span><span>?</span><span>{measureLabel(targetAmount, quantityType)}</span></div>
      </div>
    ) : (
      <div className="measure-calculation" aria-hidden="true"><span>{measureLabel(firstAmount, quantityType)}</span><b>{operation}</b><span>{measureLabel(secondAmount, quantityType)}</span><b>=</b><span>?</span></div>
    )
    return (
      <div className={`math-visual quantity-measure quantity-measure--${quantityType}`} role="img" aria-label={description}>
        {content}
        <small>{textValue(values.equivalenceLabel)}</small>
        <strong className="quantity-result">{answerVisible ? `Ergebnis: ${textValue(values.answerLabel)}` : 'Ergebnis: ?'}</strong>
      </div>
    )
  }

  if (representation.kind === 'shape-grid') {
    const mode = String(values.mode)
    const shapeType = String(values.shapeType)
    const partCount = Number(values.partCount ?? 1)
    const valid = ['identify', 'decompose', 'compose'].includes(mode) && ['square', 'rectangle', 'triangle'].includes(shapeType) &&
      typeof values.answerLabel === 'string' && (mode === 'identify' || [2, 4].includes(partCount))
    if (!valid) return <div className="math-visual math-visual--error" role="alert">Die Figurendarstellung enthält ungültige Formdaten.</div>
    const answerVisible = isValueVisible('answerLabel')
    const action = mode === 'identify' ? 'eine einzelne Außenform' : mode === 'decompose' ? `eine Außenform mit ${partCount} sichtbaren Teilen` : 'zwei Teile mit einer gemeinsamen Außenform'
    return (
      <div className="math-visual shape-visual" role="img" aria-label={`${representation.label}. Gezeigt wird ${action}. ${answerVisible ? `Ergebnis ${values.answerLabel}.` : 'Die gesuchte Antwort bleibt unbekannt.'}`}>
        <span className={`shape-outline shape-outline--${shapeType} shape-outline--${mode} shape-outline--parts-${partCount}`} aria-hidden="true" />
        <strong className="quantity-result">{answerVisible ? `Ergebnis: ${textValue(values.answerLabel)}` : 'Ergebnis: ?'}</strong>
      </div>
    )
  }

  if (representation.kind === 'pattern-strip') {
    const sequenceCount = Number(values.sequenceCount)
    const sequence = Number.isInteger(sequenceCount) && sequenceCount >= 5 && sequenceCount <= 8
      ? Array.from({ length: sequenceCount }, (_, index) => String(values[`symbol${index}`]))
      : []
    const blockLength = Number(values.blockLength)
    const allowed = ['Kreis', 'Quadrat', 'Dreieck', 'Stern']
    const valid = sequence.length === sequenceCount && sequence.every((symbol) => allowed.includes(symbol)) &&
      Number.isInteger(blockLength) && blockLength >= 2 && blockLength <= 3 && typeof values.answerLabel === 'string'
    if (!valid) return <div className="math-visual math-visual--error" role="alert">Der Musterstreifen enthält ungültige Symbole.</div>
    const answerVisible = isValueVisible('answerLabel')
    const highlightBlocks = Number(values.highlightBlocks) === 1
    const taskMode = values.taskMode === 'identify-error' ? 'identify-error' : 'continue'
    const symbolClass = (symbol: string, index: number) => `pattern-symbol pattern-symbol--${symbol.toLowerCase()}${highlightBlocks && index % blockLength === 0 ? ' pattern-symbol--block-start' : ''}${highlightBlocks && index % blockLength === blockLength - 1 ? ' pattern-symbol--block-end' : ''}`
    const answerDescription = taskMode === 'identify-error'
      ? answerVisible ? `Fehlerstelle ${values.answerLabel}.` : 'Die Fehlerstelle bleibt unbekannt.'
      : answerVisible ? `Fortsetzung ${values.answerLabel}.` : 'Die Fortsetzung bleibt unbekannt.'
    return (
      <div className="math-visual pattern-visual" role="img" aria-label={`${representation.label}. Sichtbare Folge: ${sequence.join(', ')}. ${answerDescription}`}>
        <div className="pattern-sequence" aria-hidden="true">{sequence.map((symbol, index) => <i className={symbolClass(symbol, index)} key={`${symbol}-${index}`} />)}{taskMode === 'continue' && <i className="pattern-symbol pattern-symbol--unknown">?</i>}</div>
        <strong className="quantity-result">{taskMode === 'identify-error' ? answerVisible ? `Fehlerstelle: ${textValue(values.answerLabel)}` : 'Fehlerstelle: ?' : answerVisible ? `Fortsetzung: ${textValue(values.answerLabel)}` : 'Fortsetzung: ?'}</strong>
      </div>
    )
  }

  if (representation.kind === 'unit-squares' || representation.kind === 'perimeter-path') {
    const rows = Number(values.rows)
    const columns = Number(values.columns)
    const cells = Array.isArray(values.cells) ? values.cells.map(Number) : []
    const valid = validateGridCells(rows, columns, cells) && isConnectedGridFigure(rows, columns, cells) && typeof values.answerLabel === 'string'
    if (!valid) return <div className="math-visual math-visual--error" role="alert">Die Rasterfigur enthält ungültige oder getrennte Felder.</div>
    const answerVisible = isValueVisible('answerLabel')
    const isPerimeter = representation.kind === 'perimeter-path'
    const knownCount = isPerimeter ? perimeterInUnitEdges(rows, columns, cells) : areaInUnitSquares(rows, columns, cells)
    const description = isPerimeter
      ? `${representation.label}. Eine zusammenhängende Figur mit vollständig markiertem Außenrand. ${answerVisible ? `Randlänge ${values.answerLabel}.` : 'Die Randlänge bleibt unbekannt.'}`
      : `${representation.label}. Eine zusammenhängende Figur aus sichtbaren Einheitsquadraten. ${answerVisible ? `Fläche ${values.answerLabel}.` : 'Die Anzahl der Einheitsquadrate bleibt unbekannt.'}`
    const edgeClasses = (index: number) => {
      if (!isPerimeter || !cells[index]) return ''
      const row = Math.floor(index / columns)
      const column = index % columns
      return [
        row === 0 || !cells[index - columns] ? 'unit-cell--edge-top' : '',
        row === rows - 1 || !cells[index + columns] ? 'unit-cell--edge-bottom' : '',
        column === 0 || !cells[index - 1] ? 'unit-cell--edge-left' : '',
        column === columns - 1 || !cells[index + 1] ? 'unit-cell--edge-right' : ''
      ].filter(Boolean).join(' ')
    }
    if (answerVisible && Number(values.answerLabel) !== knownCount) return <div className="math-visual math-visual--error" role="alert">Die Rasterfigur und das aufgedeckte Ergebnis widersprechen sich.</div>
    return (
      <div className={`math-visual unit-grid-visual ${isPerimeter ? 'unit-grid-visual--perimeter' : 'unit-grid-visual--area'}`} role="img" aria-label={description}>
        <div className="unit-grid" aria-hidden="true" style={{ '--unit-columns': columns, '--unit-rows': rows } as CSSProperties}>
          {cells.map((cell, index) => <i className={`${cell ? 'unit-cell unit-cell--filled' : 'unit-cell'} ${edgeClasses(index)}`} key={index} />)}
        </div>
        <strong className="quantity-result">{answerVisible ? `Ergebnis: ${textValue(values.answerLabel)}` : 'Ergebnis: ?'}</strong>
      </div>
    )
  }

  if (representation.kind === 'data-display') {
    const displayType = String(values.displayType)
    const categories = [values.category0, values.category1, values.category2]
    const storedValues = Array.isArray(values.dataValues) ? values.dataValues : []
    const hiddenIndex = Number(values.hiddenIndex)
    const missingVisible = hiddenIndex >= 0 && isValueVisible('missingValue')
    const dataValues = storedValues.map((value, index) => index === hiddenIndex && missingVisible ? Number(values.missingValue) : Number(value))
    const valid = ['table', 'tally', 'pictogram', 'bar'].includes(displayType) &&
      categories.every((category) => typeof category === 'string' && category.length > 0) &&
      new Set(categories).size === 3 && storedValues.length === 3 &&
      dataValues.every((value, index) => Number.isInteger(value) && value >= (index === hiddenIndex && !missingVisible ? -1 : 0) && value <= 12) &&
      Number.isInteger(hiddenIndex) && hiddenIndex >= -1 && hiddenIndex <= 2
    if (!valid) return <div className="math-visual math-visual--error" role="alert">Die Datendarstellung ist unvollständig.</div>

    const visibleLabel = (index: number) => index === hiddenIndex && !missingVisible ? 'unbekannt' : String(dataValues[index])
    const description = `${representation.label}. ${categories.map((category, index) => `${category}: ${visibleLabel(index)}`).join(', ')}.`
    const rows = categories.map((category, index) => ({ category: String(category), value: dataValues[index]!, hidden: index === hiddenIndex && !missingVisible }))
    const hasAnswer = values.answerLabel !== undefined
    const answerVisible = hasAnswer && isValueVisible('answerLabel')
    const result = hasAnswer ? <strong className="quantity-result">Ergebnis: {answerVisible ? textValue(values.answerLabel) : '?'}</strong> : null

    if (displayType === 'table') {
      return (
        <div className="math-visual data-display" role="img" aria-label={description}>
          <strong className="data-display-title">{textValue(values.title)}</strong>
          <table className="data-table" aria-hidden="true">
            <thead><tr><th>Kategorie</th><th>{textValue(values.unitLabel)}</th></tr></thead>
            <tbody>{rows.map((row) => <tr key={row.category}><th>{row.category}</th><td className={row.hidden ? 'data-value--unknown' : ''}>{row.hidden ? '?' : row.value}</td></tr>)}</tbody>
            {hiddenIndex >= 0 && <tfoot><tr><th>{textValue(values.totalLabel) || 'Insgesamt'}</th><td>{Number(values.total)}</td></tr></tfoot>}
          </table>
          {result}
        </div>
      )
    }

    if (displayType === 'tally') {
      return (
        <div className="math-visual data-display" role="img" aria-label={description}>
          <strong className="data-display-title">{textValue(values.title)}</strong>
          <div className="tally-list" aria-hidden="true">{rows.map((row) => (
            <div className="tally-row" key={row.category}><span>{row.category}</span><span className="tally-marks">{Array.from({ length: row.value }, (_, index) => <i className={(index + 1) % 5 === 0 ? 'tally-mark tally-mark--fifth' : 'tally-mark'} key={index} />)}</span></div>
          ))}</div>
          {result}
        </div>
      )
    }

    if (displayType === 'pictogram') {
      return (
        <div className="math-visual data-display" role="img" aria-label={description}>
          <strong className="data-display-title">{textValue(values.title)}</strong>
          <div className="pictogram" aria-hidden="true">{rows.map((row) => (
            <div className="pictogram-row" key={row.category}><span>{row.category}</span><span>{Array.from({ length: row.value }, (_, index) => <i key={index} />)}</span></div>
          ))}</div>
          <small>1 Punkt = 1 {textValue(values.symbolLabel)}</small>
          {result}
        </div>
      )
    }

    const configuredMaximum = Number(values.scaleMax)
    const maximum = Number.isInteger(configuredMaximum) && configuredMaximum > 0
      ? configuredMaximum
      : Math.max(1, ...rows.map((row) => row.value))
    return (
      <div className="math-visual data-display" role="img" aria-label={description}>
        <strong className="data-display-title">{textValue(values.title)}</strong>
        <div className="bar-chart-frame" aria-hidden="true">
          <div className="bar-chart-scale">{Array.from({ length: maximum + 1 }, (_, index) => maximum - index).map((tick) => <i key={tick}><span>{tick}</span></i>)}</div>
          <div className="bar-chart" style={{ '--bar-steps': maximum } as CSSProperties}>{rows.map((row) => (
          <div className="bar-chart-column" key={row.category}>
            <i style={{ height: `${Math.max(12, row.value / maximum * 100)}%` }} />
            <b>{row.category}</b>
          </div>
          ))}</div>
        </div>
        {result}
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
    const startVisible = isValueVisible('start')
    const endVisible = isValueVisible('end')
    const markerKey = values.marker !== undefined ? 'marker' : values.target !== undefined ? 'target' : 'end'
    const markerVisible = isValueVisible(markerKey)
    const jumpsVisible = isValueVisible('jumps')
    const tickStep = Number(values.tickStep ?? 0)
    const ticks = Number.isInteger(tickStep) && tickStep > 0 && (scaleEnd - scaleStart) / tickStep <= 20
      ? Array.from({ length: Math.floor((scaleEnd - scaleStart) / tickStep) + 1 }, (_, index) => scaleStart + index * tickStep)
      : []
    const lower = Number(values.lower)
    const upper = Number(values.upper)
    const scaleStartVisible = scaleStart === start ? startVisible : scaleStart === end ? endVisible : jumpsVisible
    const scaleEndVisible = scaleEnd === start ? startVisible : scaleEnd === end ? endVisible : jumpsVisible
    const description = `${representation.label}. Anfang ${startVisible ? start : 'unbekannt'}, Ende ${endVisible ? end : 'unbekannt'}, Markierung ${markerVisible ? marker : 'unbekannt'}.`
    return (
      <div className="math-visual number-line-visual" role="img" aria-label={description}>
        <div className="number-line-track">
          {ticks.map((tick) => (
            <span className="number-line-tick" key={tick} style={{ left: `${positionFor(tick)}%` }}>
              {((tick === lower && isValueVisible('lower')) || (tick === upper && isValueVisible('upper'))) && <small>{tick}</small>}
            </span>
          ))}
          <span className="number-line-marker" style={{ left: `${position}%` }} />
          {jumps.map((jump, index) => {
            const from = positionFor(jump.from)
            const to = positionFor(jump.to)
            return (
              <span
                aria-label={jumpsVisible && endVisible
                  ? `Sprung von ${jump.from} bis ${jump.to}: ${jump.label}`
                  : `Rechenschritt ${jumpsVisible ? jump.label : 'unbekannt'} zu einem unbekannten Wert`}
                className={jump.to < jump.from ? 'number-line-jump number-line-jump--backward' : 'number-line-jump'}
                key={`${jump.from}-${jump.to}-${index}`}
                style={{ left: `${Math.min(from, to)}%`, width: `${Math.abs(to - from)}%` }}
              >
                {jumpsVisible ? jump.label : '?'}
              </span>
            )
          })}
        </div>
        <div className="number-line-labels">
          <span>{scaleStartVisible ? scaleStart : '?'}</span>
          {marker !== scaleStart && marker !== scaleEnd && <strong>{markerVisible ? marker : '?'}</strong>}
          <span>{scaleEndVisible ? scaleEnd : '?'}</span>
        </div>
      </div>
    )
  }

  if (representation.kind === 'money') {
    const coins = Array.isArray(values.coins) && values.coins.every((coin) => typeof coin === 'number' && Number.isInteger(coin) && coin > 0)
      ? values.coins as number[]
      : []
    const displayedCents = Number(values.displayedCents)
    const hasChange = Number(values.priceCents) > 0 && values.changeCents !== undefined
    const changeVisible = !hasChange || isValueVisible('changeCents')
    if (coins.length === 0 || coins.reduce((sum, coin) => sum + coin, 0) !== displayedCents) {
      return <div className="math-visual math-visual--error" role="alert">Die Gelddarstellung enthält einen ungültigen Betrag.</div>
    }
    const totalVisible = isValueVisible('displayedCents')
    return (
      <div className="math-visual money-visual" role="img" aria-label={`${representation.label}: Gesamtbetrag ${totalVisible ? `${displayedCents} Cent` : 'unbekannt'}`}>
        {Number(values.priceCents) > 0 && (
          <div className="money-context">
            <span>{textValue(values.priceLabel)} <strong>{Math.floor(Number(values.priceCents) / 100)},{String(Number(values.priceCents) % 100).padStart(2, '0')} €</strong></span>
            <span>{textValue(values.paidLabel)} <strong>{Math.floor(Number(values.paidCents) / 100)},{String(Number(values.paidCents) % 100).padStart(2, '0')} €</strong></span>
          </div>
        )}
        <div className="coin-row" aria-hidden="true">
          {coins.map((coin, index) => <span className={`coin coin--${coin}`} key={`${coin}-${index}`}>{coinLabel(coin)}</span>)}
        </div>
        <strong className="money-total">Gesamt: {totalVisible ? amountLabel(displayedCents) : '?'}</strong>
        {hasChange && <strong className="money-total">Rückgeld: {changeVisible ? amountLabel(Number(values.changeCents)) : '?'}</strong>}
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
    const lengthVisible = isValueVisible('lengthCm')
    return (
      <div className="math-visual length-visual" role="img" aria-label={`${representation.label}: Länge ${lengthVisible ? `${lengthCm} Zentimeter` : 'unbekannt'}`}>
        {values.equivalence && <strong className="length-equivalence">{textValue(values.equivalence)}</strong>}
        <div className="ruler-track">
          <span className="measured-length" style={{ width: `${position}%` }} />
          {Array.from({ length: 11 }, (_, index) => <i aria-hidden="true" key={index} style={{ left: `${index * 10}%` }} />)}
        </div>
        <div className="ruler-labels"><span>0</span><strong>{lengthVisible ? `${lengthCm} cm` : '?'}</strong><span>{maxCm} cm</span></div>
      </div>
    )
  }

  if (representation.kind === 'grouping-model' || representation.kind === 'sharing-model') {
    const total = Number(values.total)
    const groupCount = Number(values.groupCount)
    const groupSize = Number(values.groupSize)
    const expectedUnknown = representation.kind === 'grouping-model' ? 'groupCount' : 'groupSize'
    const catalogModelIsConsistent = modelType === undefined ||
      (representation.kind === 'sharing-model' && modelType === 'equal-groups-share' && values.unknownQuantity === 'group-size')
    const isValid = Number.isInteger(total) && total >= 4 && total <= 100 &&
      isValidGroupValue(groupCount) && isValidGroupValue(groupSize) && groupCount * groupSize === total &&
      unknown.has(expectedUnknown) && catalogModelIsConsistent
    if (!isValid) {
      return <div className="math-visual math-visual--error" role="alert">Das Divisionsmodell enthält unvollständige oder widersprüchliche Mengenangaben.</div>
    }
    const answerVisible = isValueVisible(expectedUnknown)
    const grouping = representation.kind === 'grouping-model'
    const accessibleAnswer = answerVisible ? (grouping ? groupCount : groupSize) : 'unbekannt'
    return (
      <div
        className={`math-visual division-model division-model--${grouping ? 'grouping' : 'sharing'}`}
        role="img"
        aria-label={grouping
          ? `${total} Punkte werden vollständig in gleich große Gruppen mit je ${groupSize} Punkten gruppiert. Anzahl der Gruppen: ${accessibleAnswer}.`
          : `${total} Punkte werden vollständig auf ${groupCount} gleich große Gruppen verteilt. Punkte je Gruppe: ${accessibleAnswer}.`}
      >
        <div className="known-pool" aria-hidden="true">
          <strong>{total} Punkte insgesamt</strong>
          <span>{Array.from({ length: total }, (_, item) => <i key={item} />)}</span>
        </div>
        <span className="model-arrow" aria-hidden="true">↓</span>
        <span className="model-caption">{grouping ? `Immer ${groupSize} Punkte zusammen` : `Auf ${groupCount} Gruppen verteilen`}</span>
        <div className="division-partition" aria-hidden="true">
          {Array.from({ length: groupCount }, (_, group) => (
            <span
              className="visual-group division-group"
              key={group}
              style={{ '--point-columns': Math.min(groupSize, 5) } as CSSProperties}
            >
              {Array.from({ length: groupSize }, (_, item) => <i key={item} />)}
            </span>
          ))}
        </div>
        <strong>{grouping
          ? <>Zähle die Gruppen: {answerVisible ? groupCount : '?'}</>
          : <>Punkte in jeder Gruppe: {answerVisible ? groupSize : '?'}</>}
        </strong>
      </div>
    )
  }

  if (representation.kind === 'groups') {
    if (isCatalogWordModel && (!hasValidUnknownQuantity || !unknown.has(expectedUnknownQuantity!))) {
      return <div className="math-visual math-visual--error" role="alert">Das Gruppenbild benennt die unbekannte Größe nicht eindeutig.</div>
    }
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
    const totalVisible = isValueVisible('total')
    const hasUnknownTotal = modelType === 'equal-groups-total' || values.total !== undefined
    return (
      <div className={modelType === 'equal-groups-total' ? 'math-visual groups-visual word-model' : 'math-visual groups-visual'} role="img" aria-label={`${groups} Gruppen mit je ${size} Punkten. ${hasUnknownTotal ? `Gesamtzahl ${totalVisible ? groups * size : 'unbekannt'}.` : representation.label}`}>
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
        {hasUnknownTotal && <strong className="groups-question">Insgesamt: {totalVisible ? groups * size : '?'}</strong>}
      </div>
    )
  }

  if (representation.kind === 'bar-model' && modelType) {
    if (!hasValidUnknownQuantity || !unknown.has(expectedUnknownQuantity!)) {
      return <div className="math-visual math-visual--error" role="alert">Das Balkenmodell benennt die unbekannte Größe nicht eindeutig.</div>
    }
    const first = Number(values.first)
    const second = Number(values.second)
    const third = Number(values.third)
    const total = Number(values.total)
    if (!Number.isFinite(first) || !Number.isFinite(second) || first < 0 || second < 0) {
      return <div className="math-visual math-visual--error" role="alert">Das Balkenmodell enthält ungültige Mengenangaben.</div>
    }
    const unknownVisible = isValueVisible(expectedUnknownQuantity!)
    const unknownResult = modelType === 'change-increase' || modelType === 'part-whole'
      ? first + second
      : modelType === 'change-decrease'
        ? first - second
        : modelType === 'comparison'
          ? Math.abs(first - second)
          : modelType === 'missing-part'
            ? total - second
            : modelType === 'increase-then-decrease'
              ? first + second - third
              : modelType === 'decrease-then-increase'
                ? first - second + third
                : Number.NaN
    const unknownLabel = unknownVisible && Number.isFinite(unknownResult) ? String(unknownResult) : '?'
    if (modelType === 'change-increase') return (
      <div className="math-visual word-model change-increase-model" role="img" aria-label={`Anfang ${first}, dazu ${second}, neue Gesamtmenge ${unknownVisible ? unknownResult : 'unbekannt'}.`}>
        <span className="model-caption">zuerst</span>
        <div className="model-bar model-bar--known-part" style={{ width: `${(first / (first + second)) * 100}%` }}><span>{first}</span></div>
        <span className="model-caption">danach kommt etwas dazu</span>
        <div className="model-bar model-bar--parts" style={{ gridTemplateColumns: `${first}fr ${second}fr` }}><span>{first}</span><span>+ {second}</span></div>
        <strong>neue Gesamtmenge: {unknownLabel}</strong>
      </div>
    )
    if (modelType === 'change-decrease') return (
      <div className="math-visual word-model" role="img" aria-label={`Anfang ${first}, weg ${second}, verbleibende Menge ${unknownVisible ? unknownResult : 'unbekannt'}.`}>
        <span className="model-caption">am Anfang</span><div className="model-bar"><span>{first}</span></div>
        <span className="model-caption">danach</span><div className="model-bar model-bar--parts"><span className="model-unknown">{unknownLabel}</span><span className="model-removed">weg: {second}</span></div>
        <strong>übrig: {unknownLabel}</strong>
      </div>
    )
    if (modelType === 'part-whole') return (
      <div className="math-visual word-model" role="img" aria-label={`Teile ${first} und ${second}, Ganzes ${unknownVisible ? unknownResult : 'unbekannt'}.`}>
        <span className="model-caption">zwei bekannte Teile</span><div className="model-bar model-bar--parts"><span>{first}</span><span>{second}</span></div>
        <strong>Ganzes: {unknownLabel}</strong>
      </div>
    )
    if (modelType === 'comparison') return (
      <div className="math-visual word-model comparison-model" role="img" aria-label={`Mengen ${first} und ${second}, Unterschied ${unknownVisible ? unknownResult : 'unbekannt'}.`}>
        <div><span>Menge A</span><div className="model-bar"><span>{first}</span></div></div>
        <div><span>Menge B</span><div className="model-bar model-bar--short"><span>{second}</span><span className="model-unknown">{unknownLabel}</span></div></div>
        <strong>Unterschied: {unknownLabel}</strong>
      </div>
    )
    if (modelType === 'missing-part') {
      if (!Number.isFinite(total) || total < second) return <div className="math-visual math-visual--error" role="alert">Das Teil-Ganzes-Modell ist ungültig.</div>
      return (
        <div className="math-visual word-model" role="img" aria-label={`Ganzes ${total}, bekannter Teil ${second}, fehlender Teil ${unknownVisible ? unknownResult : 'unbekannt'}.`}>
          <span className="model-caption">Ganzes: {total}</span><div className="model-bar"><span>{total}</span></div>
          <span className="model-caption">bekannter und fehlender Teil</span><div className="model-bar model-bar--parts"><span>{second}</span><span className="model-unknown">{unknownLabel}</span></div>
        </div>
      )
    }
    if (modelType === 'increase-then-decrease' || modelType === 'decrease-then-increase') {
      if (!Number.isFinite(third) || third < 0) return <div className="math-visual math-visual--error" role="alert">Das Veränderungsmodell ist ungültig.</div>
      const firstChange = modelType === 'increase-then-decrease' ? `+ ${second}` : `− ${second}`
      const secondChange = modelType === 'increase-then-decrease' ? `− ${third}` : `+ ${third}`
      return (
        <div className="math-visual word-model sequence-model" role="img" aria-label={`Start ${first}, dann ${firstChange}, danach ${secondChange}, Endmenge ${unknownVisible ? unknownResult : 'unbekannt'}.`}>
          <span><small>Start</small><strong>{first}</strong></span><b aria-hidden="true">→</b>
          <span><small>1. Veränderung</small><strong>{firstChange}</strong></span><b aria-hidden="true">→</b>
          <span><small>2. Veränderung</small><strong>{secondChange}</strong></span><b aria-hidden="true">→</b>
          <span><small>Ende</small><strong>{unknownLabel}</strong></span>
        </div>
      )
    }
    return <div className="math-visual math-visual--error" role="alert">Diese Darstellung ist nicht verfügbar.</div>
  }

  return (
    <div className="math-visual bar-model-visual" role="img" aria-label={representation.label}>
      <div className="bar-segments">
        <span>{isValueVisible(values.firstLabel !== undefined ? 'firstLabel' : 'first') ? textValue(values.firstLabel ?? values.first) : '?'}</span>
        <span>{isValueVisible(values.secondLabel !== undefined ? 'secondLabel' : 'second') ? textValue(values.secondLabel ?? values.second) : '?'}</span>
      </div>
      <strong>{isValueVisible('question') && textValue(values.question) || `Gesucht: ${isValueVisible('total') ? textValue(values.total) : '?'}`}</strong>
    </div>
  )
}
