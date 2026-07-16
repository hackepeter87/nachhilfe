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
