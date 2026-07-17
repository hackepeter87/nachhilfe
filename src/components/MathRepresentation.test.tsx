import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { ExerciseRepresentation } from '../domain'
import { MathRepresentation } from './MathRepresentation'

function groupsRepresentation(groups: number, size: number): ExerciseRepresentation {
  return {
    kind: 'groups',
    visibility: 'always',
    label: 'Geprüftes Gruppenbild',
    values: { groups, size }
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
      values: { modelType: 'change-increase', first: 13, second: 3, third: 0, total: 13 }
    }} />)
    const bars = container.querySelectorAll<HTMLElement>('.change-increase-model .model-bar')
    expect(bars).toHaveLength(2)
    expect(bars[0]).toHaveStyle({ width: '81.25%' })
    expect(bars[1]).toHaveStyle({ gridTemplateColumns: '13fr 3fr' })
  })

  it('lässt den gesuchten Rest im Balkenmodell offen', () => {
    const { container } = render(<MathRepresentation representation={{
      kind: 'bar-model', visibility: 'always', label: 'Wegnehmen',
      values: { modelType: 'change-decrease', first: 15, second: 6, third: 0, total: 15 }
    }} />)
    expect(screen.getByRole('img', { name: 'Anfang 15, weg 6, verbleibende Menge unbekannt.' })).toBeVisible()
    expect(container).toHaveTextContent('?')
    expect(container).not.toHaveTextContent('9')
  })

  it.each([
    ['change-increase', { first: 13, second: 3, third: 0, total: 13 }, 16],
    ['change-decrease', { first: 15, second: 6, third: 0, total: 15 }, 9],
    ['part-whole', { first: 20, second: 10, third: 0, total: 20 }, 30],
    ['comparison', { first: 50, second: 20, third: 0, total: 50 }, 30],
    ['missing-part', { first: 60, second: 25, third: 0, total: 60 }, 35],
    ['increase-then-decrease', { first: 40, second: 10, third: 5, total: 40 }, 45],
    ['decrease-then-increase', { first: 40, second: 10, third: 5, total: 40 }, 35]
  ])('verrät im Modell %s den Ergebniswert nicht', (modelType, values, result) => {
    const { container } = render(<MathRepresentation representation={{
      kind: 'bar-model', visibility: 'always', label: 'Sachmodell', values: { modelType, ...values }
    }} />)
    expect(screen.getByRole('img')).toBeVisible()
    expect(container).toHaveTextContent('?')
    expect(container.textContent?.split(/\s+/)).not.toContain(String(result))
  })

  it('zeigt beim Verteilen die Gesamtmenge und unbekannte Gruppengrößen', () => {
    const { container } = render(<MathRepresentation representation={{
      kind: 'groups', visibility: 'always', label: 'Verteilen',
      values: { modelType: 'equal-groups-share', groups: 4, total: 24 }
    }} />)
    expect(screen.getByRole('img', { name: '24 Punkte werden auf 4 gleich große Gruppen verteilt. Punkte je Gruppe: unbekannt.' })).toBeVisible()
    expect(container.querySelectorAll('.visual-group--unknown')).toHaveLength(4)
    expect(container).not.toHaveTextContent('6')
  })
})

describe('MathRepresentation Größen', () => {
  it('stellt eine geprüfte Münzsumme vollständig dar', () => {
    const { container } = render(<MathRepresentation representation={{
      kind: 'money', visibility: 'always', label: 'Münzen', values: { coins: [200, 100, 50, 20], displayedCents: 370 }
    }} />)
    expect(screen.getByRole('img', { name: 'Münzen: 370 Cent' })).toBeVisible()
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
    expect(screen.getByRole('img', { name: 'Messstrecke: 14 Zentimeter' })).toBeVisible()
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
