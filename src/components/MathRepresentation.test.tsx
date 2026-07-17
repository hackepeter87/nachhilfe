import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { ExerciseRepresentation } from '../domain'
import { MathRepresentation as RuntimeMathRepresentation } from './MathRepresentation'

type TestRepresentation = Omit<ExerciseRepresentation, 'valueRoles'> & {
  valueRoles?: ExerciseRepresentation['valueRoles']
}

function MathRepresentation({ representation }: { representation: TestRepresentation }) {
  const semanticUnknown = typeof representation.values.unknownQuantity === 'string'
    ? [representation.values.unknownQuantity]
    : []
  const completeRepresentation: ExerciseRepresentation = {
    ...representation,
    valueRoles: representation.valueRoles ?? {
      knownValues: Object.keys(representation.values).filter((key) => !semanticUnknown.includes(key)),
      unknownValues: semanticUnknown,
      revealedValues: []
    }
  }
  return <RuntimeMathRepresentation representation={completeRepresentation} />
}

function groupsRepresentation(groups: number, size: number): ExerciseRepresentation {
  return {
    kind: 'groups',
    visibility: 'always',
    label: 'Geprüftes Gruppenbild',
    values: { groups, size },
    valueRoles: { knownValues: ['groups', 'size'], unknownValues: [], revealedValues: [] }
  }
}

describe('MathRepresentation Gruppenbild', () => {
  it.each([
    ['2 · 10', 2, 10],
    ['5 · 8', 5, 8],
    ['9 · 7', 9, 7],
    ['20 : 2', 10, 2],
    ['56 : 7', 8, 7]
  ])('stellt %s mit exakten Gruppen und Punkten dar', (_label, groups, size) => {
    const { container } = render(<MathRepresentation representation={groupsRepresentation(groups, size)} />)
    expect(screen.getByRole('img', { name: `${groups} Gruppen mit je ${size} Punkten. Geprüftes Gruppenbild` })).toBeVisible()
    const renderedGroups = container.querySelectorAll('.visual-group')
    expect(renderedGroups).toHaveLength(groups)
    renderedGroups.forEach((group) => expect(group.querySelectorAll('i')).toHaveLength(size))
    expect(container.querySelectorAll('.visual-group i')).toHaveLength(groups * size)
  })

  it.each([
    [0, 4],
    [4, 0],
    [11, 2],
    [2, 11],
    [2.5, 4]
  ])('lehnt ungültige Mengenangaben %s Gruppen mit je %s Punkten sichtbar ab', (groups, size) => {
    const { container } = render(<MathRepresentation representation={groupsRepresentation(groups, size)} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Das Gruppenbild enthält ungültige Mengenangaben.')
    expect(container.querySelector('.visual-group')).not.toBeInTheDocument()
  })
})

describe('MathRepresentation Zufall und Kombinationen', () => {
  it('zeigt nur bekannte Versuchsergebnisse und keine vorweggenommene Klassifikation', () => {
    const { container } = render(<RuntimeMathRepresentation representation={{
      kind: 'chance-display', visibility: 'always', label: 'Beutel: Farbsteine',
      values: { experimentType: 'bag', title: 'Farbsteine', outcomeCount: 3, outcome0: 'rot', outcome1: 'rot', outcome2: 'blau' },
      valueRoles: { knownValues: ['experimentType', 'title', 'outcomeCount', 'outcome0', 'outcome1', 'outcome2'], unknownValues: ['classification'], revealedValues: [] }
    }} />)
    expect(screen.getByRole('img', { name: /rot, rot, blau/ })).toBeVisible()
    expect(container.querySelectorAll('.chance-outcomes span')).toHaveLength(3)
    expect(container).not.toHaveTextContent(/sicher|möglich|unmöglich/i)
  })

  it.each([
    [2, 2, 0, 4],
    [3, 2, 0, 6],
    [3, 3, 1, 9]
  ])('stellt %i mal %i Kombinationen mit %i sichtbarer Ausnahme vollständig dar', (firstCount, secondCount, blockedCount, cells) => {
    const first = ['rot', 'blau', 'grün'].slice(0, firstCount)
    const second = ['Kreis', 'Stern', 'Herz'].slice(0, secondCount)
    const values: ExerciseRepresentation['values'] = {
      title: 'Auswahl', firstLabel: 'Farbe', firstCount, secondLabel: 'Form', secondCount, excludedLabel: 'Nicht erlaubt'
    }
    first.forEach((entry, index) => { values[`first${index}`] = entry })
    second.forEach((entry, index) => { values[`second${index}`] = entry })
    if (blockedCount) {
      values.excludedFirst = first[2]!
      values.excludedSecond = second[2]!
    }
    const { container } = render(<RuntimeMathRepresentation representation={{
      kind: 'combination-display', visibility: 'always', label: 'Auswahl', values,
      valueRoles: { knownValues: Object.keys(values), unknownValues: ['combinationCount'], revealedValues: [] }
    }} />)
    expect(screen.getByRole('img', { name: /Die Anzahl bleibt unbekannt/ })).toBeVisible()
    expect(container.querySelectorAll('.combination-cell')).toHaveLength(cells)
    expect(container.querySelectorAll('.combination-cell--blocked')).toHaveLength(blockedCount)
    expect(container).not.toHaveTextContent(new RegExp(`\\b${cells - blockedCount}\\b`))
  })

  it('weist unvollständige Zufalls- und Kombinationsdaten sichtbar zurück', () => {
    const { rerender } = render(<RuntimeMathRepresentation representation={{
      kind: 'chance-display', visibility: 'always', label: 'Ungültig', values: { experimentType: 'bag', outcomeCount: 1, outcome0: 'rot' },
      valueRoles: { knownValues: ['experimentType', 'outcomeCount', 'outcome0'], unknownValues: ['classification'], revealedValues: [] }
    }} />)
    expect(screen.getByRole('alert')).toHaveTextContent('ungültige Ergebnisse')
    rerender(<RuntimeMathRepresentation representation={{
      kind: 'combination-display', visibility: 'always', label: 'Ungültig', values: { firstCount: 1, secondCount: 2 },
      valueRoles: { knownValues: ['firstCount', 'secondCount'], unknownValues: ['combinationCount'], revealedValues: [] }
    }} />)
    expect(screen.getByRole('alert')).toHaveTextContent('unvollständig')
  })
})

describe('MathRepresentation schriftliche Addition', () => {
  it('ordnet die Summanden stellengerecht an und verrät das Ergebnis nicht', () => {
    const { container } = render(<MathRepresentation representation={{
      kind: 'column-calculation',
      visibility: 'always',
      label: 'Spaltendarstellung',
      values: { first: 265, second: 318, operation: '+', carry: 1, carryColumn: 'tens' }
    }} />)
    expect(screen.getByRole('img', { name: /265 plus 318.*Übertrag zur Zehnerspalte.*Ergebnis ist noch offen/i })).toBeInTheDocument()
    expect(container.querySelector('.column-row--result')).toHaveTextContent('???')
    expect(container.querySelector('.column-row--result')).not.toHaveTextContent('583')
    expect(container.querySelector('.column-row--carry')).toHaveTextContent('1')
  })

  it('zeigt ungültige Spaltendaten sichtbar als Fehler', () => {
    render(<MathRepresentation representation={{
      kind: 'column-calculation',
      visibility: 'always',
      label: 'Spaltendarstellung',
      values: { first: 900, second: 200, operation: '+', carry: 0, carryColumn: 'none' }
    }} />)
    expect(screen.getByRole('alert')).toHaveTextContent('ungültige Rechendaten')
  })
})

describe('MathRepresentation schriftliche Subtraktion', () => {
  it('zeigt eine Entbündelung als veränderte Stellen und hält das Ergebnis offen', () => {
    const { container } = render(<MathRepresentation representation={{
      kind: 'column-calculation',
      visibility: 'always',
      label: 'Spaltendarstellung',
      values: { first: 532, second: 218, operation: '−', unbundle: 1, unbundleFrom: 'tens' }
    }} />)
    expect(screen.getByRole('img', { name: /532 minus 218.*Zehnerstelle wird in zehn Einer entbündelt.*Ergebnis ist noch offen/i })).toBeVisible()
    expect(container.querySelector('.column-row--carry')).toHaveTextContent('212')
    expect(container.querySelectorAll('.column-cell--source-adjusted')).toHaveLength(2)
    expect(container.querySelector('.column-row--result')).toHaveTextContent('???')
    expect(container.querySelector('.column-row--result')).not.toHaveTextContent('314')
  })

  it('stellt eine Aufgabe ohne Entbündelung unverändert dar', () => {
    const { container } = render(<MathRepresentation representation={{
      kind: 'column-calculation',
      visibility: 'always',
      label: 'Spaltendarstellung',
      values: { first: 764, second: 321, operation: '−', unbundle: 0, unbundleFrom: 'none' }
    }} />)
    expect(screen.getByRole('img', { name: /764 minus 321.*Ergebnis ist noch offen/i })).toBeVisible()
    expect(container.querySelector('.column-row--carry')).toHaveTextContent('')
    expect(container.querySelector('.column-cell--source-adjusted')).not.toBeInTheDocument()
  })

  it('lehnt eine Kettenentbündelung sichtbar ab', () => {
    render(<MathRepresentation representation={{
      kind: 'column-calculation',
      visibility: 'always',
      label: 'Spaltendarstellung',
      values: { first: 500, second: 237, operation: '−', unbundle: 1, unbundleFrom: 'tens' }
    }} />)
    expect(screen.getByRole('alert')).toHaveTextContent('ungültige Rechendaten')
  })

  it('lehnt auch bei verborgener Entbündelung eine falsche Quellstelle ab', () => {
    render(<MathRepresentation representation={{
      kind: 'column-calculation',
      visibility: 'always',
      label: 'Spaltendarstellung',
      values: { first: 532, second: 218, operation: '−', unbundle: 0, unbundleFrom: 'hundreds' }
    }} />)
    expect(screen.getByRole('alert')).toHaveTextContent('ungültige Rechendaten')
  })
})

describe('MathRepresentation Sachaufgabenmodelle', () => {
  it('stellt Anfangsmenge und Zuwachs proportional dar', () => {
    const { container } = render(<MathRepresentation representation={{
      kind: 'bar-model', visibility: 'always', label: 'Hinzufügen',
      values: { modelType: 'change-increase', unknownQuantity: 'new-total', first: 13, second: 3, third: 0, total: 13 }
    }} />)
    const bars = container.querySelectorAll<HTMLElement>('.change-increase-model .model-bar')
    expect(bars).toHaveLength(2)
    expect(bars[0]).toHaveStyle({ width: '81.25%' })
    expect(bars[1]).toHaveStyle({ gridTemplateColumns: '13fr 3fr' })
  })

  it('lässt den gesuchten Rest im Balkenmodell offen', () => {
    const { container } = render(<MathRepresentation representation={{
      kind: 'bar-model', visibility: 'always', label: 'Wegnehmen',
      values: { modelType: 'change-decrease', unknownQuantity: 'remaining', first: 15, second: 6, third: 0, total: 15 }
    }} />)
    expect(screen.getByRole('img', { name: 'Anfang 15, weg 6, verbleibende Menge unbekannt.' })).toBeVisible()
    expect(container).toHaveTextContent('?')
    expect(container).not.toHaveTextContent('9')
  })

  it.each([
    ['change-increase', 'new-total', { first: 13, second: 3, third: 0, total: 13 }, 16],
    ['change-decrease', 'remaining', { first: 15, second: 6, third: 0, total: 15 }, 9],
    ['part-whole', 'whole', { first: 20, second: 10, third: 0, total: 20 }, 30],
    ['comparison', 'difference', { first: 50, second: 20, third: 0, total: 50 }, 30],
    ['missing-part', 'missing-part', { first: 60, second: 25, third: 0, total: 60 }, 35],
    ['increase-then-decrease', 'final-total', { first: 40, second: 10, third: 5, total: 40 }, 45],
    ['decrease-then-increase', 'final-total', { first: 40, second: 10, third: 5, total: 40 }, 35]
  ])('verrät im Modell %s den Ergebniswert nicht', (modelType, unknownQuantity, values, result) => {
    const { container } = render(<MathRepresentation representation={{
      kind: 'bar-model', visibility: 'always', label: 'Sachmodell', values: { modelType, unknownQuantity, ...values }
    }} />)
    expect(screen.getByRole('img')).toBeVisible()
    expect(container).toHaveTextContent('?')
    expect(container.textContent?.split(/\s+/)).not.toContain(String(result))
  })

  it('zeigt beim Verteilen die Gesamtmenge und unbekannte Gruppengrößen', () => {
    const { container } = render(<MathRepresentation representation={{
      kind: 'groups', visibility: 'always', label: 'Verteilen',
      values: { modelType: 'equal-groups-share', unknownQuantity: 'group-size', groups: 4, total: 24 }
    }} />)
    expect(screen.getByRole('img', { name: '24 Punkte werden auf 4 gleich große Gruppen verteilt. Punkte je Gruppe: unbekannt.' })).toBeVisible()
    expect(container.querySelectorAll('.visual-group--unknown')).toHaveLength(4)
    expect(container).not.toHaveTextContent('6')
  })

  it('lehnt ein Modell mit widersprüchlicher unbekannter Größe sichtbar ab', () => {
    render(<MathRepresentation representation={{
      kind: 'bar-model', visibility: 'always', label: 'Sachmodell',
      values: { modelType: 'change-decrease', unknownQuantity: 'new-total', first: 15, second: 6, total: 15 }
    }} />)
    expect(screen.getByRole('alert')).toHaveTextContent('unbekannte Größe nicht eindeutig')
  })
})

describe('MathRepresentation Größen', () => {
  it('stellt eine geprüfte Münzsumme vollständig dar', () => {
    const { container } = render(<MathRepresentation representation={{
      kind: 'money', visibility: 'always', label: 'Münzen', values: { coins: [200, 100, 50, 20], displayedCents: 370 }
    }} />)
    expect(screen.getByRole('img', { name: 'Münzen: Gesamtbetrag 370 Cent' })).toBeVisible()
    expect(container.querySelectorAll('.coin')).toHaveLength(4)
    expect(container).toHaveTextContent('2 €')
    expect(container).toHaveTextContent('50 ct')
  })

  it('lehnt eine widersprüchliche Münzsumme sichtbar ab', () => {
    render(<MathRepresentation representation={{
      kind: 'money', visibility: 'always', label: 'Münzen', values: { coins: [200, 100], displayedCents: 250 }
    }} />)
    expect(screen.getByRole('alert')).toHaveTextContent('ungültigen Betrag')
  })

  it('stellt eine Messstrecke mit Nullpunkt und Endwert dar', () => {
    render(<MathRepresentation representation={{
      kind: 'length', visibility: 'always', label: 'Messstrecke', values: { lengthCm: 14, maxCm: 20 }
    }} />)
    expect(screen.getByRole('img', { name: 'Messstrecke: Länge 14 Zentimeter' })).toBeVisible()
    expect(screen.getByText('14 cm')).toBeVisible()
    expect(screen.getByText('20 cm')).toBeVisible()
  })

  it('lehnt Messstrecken außerhalb ihrer Skala sichtbar ab', () => {
    render(<MathRepresentation representation={{
      kind: 'length', visibility: 'always', label: 'Messstrecke', values: { lengthCm: 21, maxCm: 20 }
    }} />)
    expect(screen.getByRole('alert')).toHaveTextContent('ungültige Längenangaben')
  })
})

describe('MathRepresentation mathematische Rollen', () => {
  it('maskiert das Ziel eines Rechenstrichs und deckt es kontrolliert auf', () => {
    const representation: ExerciseRepresentation = {
      kind: 'number-line', visibility: 'always', label: 'Addition auf dem Rechenstrich',
      values: { start: 2, end: 6, marker: 2, jumps: [{ from: 2, to: 6, label: '+4' }] },
      valueRoles: { knownValues: ['start', 'marker', 'jumps'], unknownValues: ['end'], revealedValues: [] }
    }
    const { container, rerender } = render(<RuntimeMathRepresentation representation={representation} />)
    expect(screen.getByRole('img', { name: /Ende unbekannt/ })).toBeVisible()
    expect(container.querySelector('.number-line-labels')).toHaveTextContent('2?')
    expect(container.querySelector('.number-line-labels')).not.toHaveTextContent('6')
    expect(screen.getByLabelText('Rechenschritt +4 zu einem unbekannten Wert')).toBeVisible()

    rerender(<RuntimeMathRepresentation representation={{
      ...representation,
      valueRoles: { ...representation.valueRoles, revealedValues: ['end'] }
    }} />)
    expect(screen.getByRole('img', { name: /Ende 6/ })).toBeVisible()
    expect(container.querySelector('.number-line-labels')).toHaveTextContent('26')
  })

  it('zeigt bei Nachbarzahlen nur die gegebene Zahl, nicht die gesuchten Nachbarn', () => {
    const { container } = render(<RuntimeMathRepresentation representation={{
      kind: 'number-line', visibility: 'always', label: 'Nachbarzehner',
      values: { start: 560, end: 570, marker: 565, step: 10 },
      valueRoles: { knownValues: ['marker', 'step'], unknownValues: ['start', 'end'], revealedValues: [] }
    }} />)
    expect(container.querySelector('.number-line-labels')).toHaveTextContent('?565?')
    expect(container.querySelector('.number-line-labels')).not.toHaveTextContent('560')
    expect(container.querySelector('.number-line-labels')).not.toHaveTextContent('570')
  })

  it('maskiert gesuchte Geld- und Längenwerte auch für Screenreader', () => {
    const { container, rerender } = render(<RuntimeMathRepresentation representation={{
      kind: 'money', visibility: 'always', label: 'Münzen zählen',
      values: { coins: [200, 100, 50, 20], displayedCents: 370 },
      valueRoles: { knownValues: ['coins'], unknownValues: ['displayedCents'], revealedValues: [] }
    }} />)
    expect(screen.getByRole('img', { name: /Gesamtbetrag unbekannt/ })).toBeVisible()
    expect(container.querySelector('.money-total')).toHaveTextContent('Gesamt: ?')
    expect(container).not.toHaveTextContent('370')

    rerender(<RuntimeMathRepresentation representation={{
      kind: 'money', visibility: 'always', label: 'Münzen zählen',
      values: { coins: [200, 100, 50, 20], displayedCents: 370 },
      valueRoles: { knownValues: ['coins'], unknownValues: ['displayedCents'], revealedValues: ['displayedCents'] }
    }} />)
    expect(screen.getByRole('img', { name: /Gesamtbetrag 370 Cent/ })).toBeVisible()
    expect(container.querySelector('.money-total')).toHaveTextContent('Gesamt: 3,70 €')

    rerender(<RuntimeMathRepresentation representation={{
      kind: 'length', visibility: 'always', label: 'Messstrecke',
      values: { lengthCm: 14, maxCm: 20 },
      valueRoles: { knownValues: ['maxCm'], unknownValues: ['lengthCm'], revealedValues: [] }
    }} />)
    expect(screen.getByRole('img', { name: /Länge unbekannt/ })).toBeVisible()
    expect(container.querySelector('.ruler-labels')).toHaveTextContent('0?20 cm')
    expect(container).not.toHaveTextContent('14 cm')

    rerender(<RuntimeMathRepresentation representation={{
      kind: 'length', visibility: 'always', label: 'Messstrecke',
      values: { lengthCm: 14, maxCm: 20 },
      valueRoles: { knownValues: ['maxCm'], unknownValues: ['lengthCm'], revealedValues: ['lengthCm'] }
    }} />)
    expect(screen.getByRole('img', { name: /Länge 14 Zentimeter/ })).toBeVisible()
    expect(container.querySelector('.ruler-labels')).toHaveTextContent('014 cm20 cm')
  })

  it('stellt Division als bekannte Gesamtmenge und Gruppengröße ohne Quotient dar', () => {
    const { container } = render(<RuntimeMathRepresentation representation={{
      kind: 'groups', visibility: 'always', label: '24 durch 6',
      values: { modelType: 'division-groups', total: 24, size: 6, groups: 4 },
      valueRoles: { knownValues: ['modelType', 'total', 'size'], unknownValues: ['groups'], revealedValues: [] }
    }} />)
    expect(screen.getByRole('img', { name: /Anzahl der Gruppen unbekannt/ })).toBeVisible()
    expect(container.querySelectorAll('.sample-group i')).toHaveLength(6)
    expect(container).toHaveTextContent('Wie viele Gruppen? ?')
  })

  it('ergänzt eine erfolgreich bearbeitete unbekannte Menge im Balkenmodell', () => {
    const { container } = render(<RuntimeMathRepresentation representation={{
      kind: 'bar-model', visibility: 'always', label: 'Wegnehmen',
      values: { modelType: 'change-decrease', unknownQuantity: 'remaining', first: 15, second: 6, third: 0, total: 15 },
      valueRoles: {
        knownValues: ['modelType', 'unknownQuantity', 'first', 'second', 'third', 'total'],
        unknownValues: ['remaining'],
        revealedValues: ['remaining']
      }
    }} />)
    expect(screen.getByRole('img', { name: /verbleibende Menge 9/ })).toBeVisible()
    expect(container.querySelector('.model-unknown')).toHaveTextContent('9')
    expect(container).toHaveTextContent('übrig: 9')
  })

  it('weist widersprüchliche Rollen sichtbar zurück', () => {
    render(<RuntimeMathRepresentation representation={{
      kind: 'number-line', visibility: 'always', label: 'Ungültig', values: { start: 2, end: 6 },
      valueRoles: { knownValues: ['start', 'end'], unknownValues: ['end'], revealedValues: [] }
    }} />)
    expect(screen.getByRole('alert')).toHaveTextContent('widersprüchliche mathematische Rollen')
  })
})

describe('MathRepresentation Körperansichten', () => {
  it('zeichnet jeden Würfel exakt einmal und markiert die feste Orientierung', () => {
    const { container } = render(<MathRepresentation representation={{
      kind: 'cube-building', visibility: 'always', label: 'Vier Würfel. Vorne und rechts sind markiert.',
      values: { width: 2, depth: 2, heights: [1, 1, 2, 0] }
    }} />)
    expect(screen.getByRole('img', { name: 'Vier Würfel. Vorne und rechts sind markiert.' })).toBeVisible()
    expect(container.querySelectorAll('.iso-cube')).toHaveLength(4)
    expect(container).toHaveTextContent('vornerechts')
  })

  it('stellt eine ebene Ansicht als vollständiges Raster dar', () => {
    const { container } = render(<MathRepresentation representation={{
      kind: 'cube-view', visibility: 'always', label: 'Ansicht A: Vorderansicht',
      values: { rows: 2, columns: 2, cells: [1, 0, 1, 1] }
    }} />)
    expect(screen.getByRole('img', { name: 'Ansicht A: Vorderansicht' })).toBeVisible()
    expect(container.querySelectorAll('.cube-view-cell')).toHaveLength(4)
    expect(container.querySelectorAll('.cube-view-cell--filled')).toHaveLength(3)
  })

  it('zeigt bei einer Vierteldrehung Achse, Richtung und jeden Würfel genau einmal', () => {
    const { container } = render(<MathRepresentation representation={{
      kind: 'cube-rotation', visibility: 'always', label: 'Drei Würfel. 90 Grad nach rechts um die senkrechte Achse.',
      values: { width: 2, depth: 2, heights: [1, 1, 1, 0], turn: 'right', axisLabel: 'senkrechte Drehachse', turnLabel: '90 Grad nach rechts' }
    }} />)
    expect(screen.getByRole('img', { name: /90 Grad nach rechts.*senkrechte Achse/i })).toBeVisible()
    expect(container.querySelectorAll('.iso-cube')).toHaveLength(3)
    expect(container.querySelector('.rotation-axis')).toBeInTheDocument()
    expect(container.querySelector('.rotation-turn--right')).toHaveTextContent('90 Grad nach rechts')
    expect(container).toHaveTextContent('vornerechts')
  })

  it('lehnt ungültige Gebäude und Ansichten sichtbar ab', () => {
    const { rerender } = render(<MathRepresentation representation={{
      kind: 'cube-building', visibility: 'always', label: 'Ungültig', values: { width: 2, depth: 1, heights: [1] }
    }} />)
    expect(screen.getByRole('alert')).toHaveTextContent('ungültige Daten')
    rerender(<MathRepresentation representation={{
      kind: 'cube-view', visibility: 'always', label: 'Ungültig', values: { rows: 2, columns: 2, cells: [1, 0] }
    }} />)
    expect(screen.getByRole('alert')).toHaveTextContent('ungültige Daten')
    rerender(<MathRepresentation representation={{
      kind: 'cube-rotation', visibility: 'always', label: 'Ungültig', values: { width: 2, depth: 2, heights: [1, 1, 1, 0], turn: 'oben' }
    }} />)
    expect(screen.getByRole('alert')).toHaveTextContent('ungültige Daten')
  })
})

describe('MathRepresentation Falten', () => {
  it('zeigt eine einzelne Faltachse zwischen Zellen und genau den markierten Ausgangspunkt', () => {
    const { container } = render(<MathRepresentation representation={{
      kind: 'folding-paper', visibility: 'always', label: 'Linke Hälfte nach rechts falten.',
      values: { rows: 4, columns: 4, axis: 'vertical', foldSide: 'left', mode: 'point-fold', marks: [5], showInstruction: 1, axisLabel: 'Faltachse', foldLabel: 'Falte links nach rechts' }
    }} />)
    expect(screen.getByRole('img', { name: 'Linke Hälfte nach rechts falten.' })).toBeVisible()
    expect(container.querySelectorAll('.folding-cell')).toHaveLength(16)
    expect(container.querySelectorAll('.folding-cell--marked')).toHaveLength(1)
    expect(container.querySelector('.folding-grid--axis-vertical')).toBeInTheDocument()
    expect(container).toHaveTextContent('Falte links nach rechts')
  })

  it('zeigt nach dem Aufklappen genau zwei symmetrische Schnittmarken', () => {
    const { container } = render(<MathRepresentation representation={{
      kind: 'folding-paper', visibility: 'always', label: 'Aufgeklapptes Papier mit zwei Schnitten.',
      values: { rows: 4, columns: 6, axis: 'vertical', foldSide: 'left', mode: 'cut-unfold', marks: [7, 10], showInstruction: 0, axisLabel: 'Faltachse', foldLabel: 'Falte links nach rechts' }
    }} />)
    expect(container.querySelectorAll('.folding-cell--cut-unfold')).toHaveLength(2)
  })

  it('lehnt ungerade Achsenmaße und doppelte Markierungen sichtbar ab', () => {
    const { rerender } = render(<MathRepresentation representation={{
      kind: 'folding-paper', visibility: 'always', label: 'Ungültig',
      values: { rows: 4, columns: 5, axis: 'vertical', foldSide: 'left', mode: 'point-fold', marks: [1], showInstruction: 1 }
    }} />)
    expect(screen.getByRole('alert')).toHaveTextContent('ungültige Daten')
    rerender(<MathRepresentation representation={{
      kind: 'folding-paper', visibility: 'always', label: 'Ungültig',
      values: { rows: 4, columns: 4, axis: 'vertical', foldSide: 'left', mode: 'cut-unfold', marks: [1, 1], showInstruction: 0 }
    }} />)
    expect(screen.getByRole('alert')).toHaveTextContent('ungültige Daten')
  })
})

describe('MathRepresentation Daten und Diagramme', () => {
  const base = {
    displayType: 'table', title: 'Obstwahl', category0: 'Apfel', category1: 'Birne', category2: 'Pflaume',
    dataValues: [4, -1, 7], unitLabel: 'Stimmen', symbolLabel: 'Stimme', hiddenIndex: 1, total: 17, totalLabel: 'Insgesamt', missingValue: 6
  }

  it('maskiert einen fehlenden Tabellenwert auch in der zugänglichen Beschreibung', () => {
    render(<MathRepresentation representation={{
      kind: 'data-display', visibility: 'always', label: 'Tabelle Obstwahl', values: base,
      valueRoles: { knownValues: Object.keys(base).filter((key) => key !== 'missingValue'), unknownValues: ['missingValue'], revealedValues: [] }
    }} />)
    const visual = screen.getByRole('img', { name: /Birne: unbekannt/i })
    expect(visual).toHaveTextContent('?')
    expect(visual).not.toHaveAccessibleName(/Birne: 6/i)
  })

  it('deckt den fehlenden Wert erst nach erfolgreicher Bearbeitung auf', () => {
    render(<MathRepresentation representation={{
      kind: 'data-display', visibility: 'always', label: 'Tabelle Obstwahl', values: base,
      valueRoles: { knownValues: Object.keys(base).filter((key) => key !== 'missingValue'), unknownValues: ['missingValue'], revealedValues: ['missingValue'] }
    }} />)
    expect(screen.getByRole('img', { name: /Birne: 6/i })).toHaveTextContent('6')
  })

  it.each(['tally', 'pictogram', 'bar'] as const)('rendert %s vollständig', (displayType) => {
    const values = { ...base, displayType, dataValues: [4, 6, 7], hiddenIndex: -1 }
    const { container } = render(<MathRepresentation representation={{
      kind: 'data-display', visibility: 'always', label: `Darstellung ${displayType}`, values,
      valueRoles: { knownValues: Object.keys(values), unknownValues: [], revealedValues: [] }
    }} />)
    expect(screen.getByRole('img', { name: /Apfel: 4, Birne: 6, Pflaume: 7/i })).toBeVisible()
    expect(container.querySelector(displayType === 'tally' ? '.tally-list' : displayType === 'pictogram' ? '.pictogram' : '.bar-chart')).toBeInTheDocument()
  })
})
