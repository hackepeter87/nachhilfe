import { describe, expect, it } from 'vitest'
import { createFoldingOutcomes, foldingCellsKey, isValidFoldingTemplate, reflectFoldingCell, type FoldingTemplate } from './folding'

const pointTemplate: FoldingTemplate = {
  id: 'point', difficulty: 1, mode: 'point-fold', rows: 4, columns: 4,
  axis: 'vertical', foldSide: 'left', sourceCell: 5
}

describe('Einfaches Falten', () => {
  it('spiegelt eine Zelle mit gleichem Abstand an senkrechter und waagerechter Achse', () => {
    expect(reflectFoldingCell(5, 4, 4, 'vertical')).toBe(6)
    expect(reflectFoldingCell(2, 4, 6, 'horizontal')).toBe(20)
  })

  it('erzeugt für eine Punktfaltung genau drei unterschiedliche Ergebnisse', () => {
    const outcomes = createFoldingOutcomes(pointTemplate)
    expect(outcomes.correct).toEqual([6])
    expect(outcomes.unchanged).toEqual([5])
    expect(new Set(Object.values(outcomes).map(foldingCellsKey)).size).toBe(3)
  })

  it('erzeugt nach einem Faltschnitt genau das symmetrische Markierungspaar', () => {
    const template: FoldingTemplate = {
      ...pointTemplate, id: 'cut', difficulty: 3, mode: 'cut-unfold', rows: 4, columns: 6, sourceCell: 7
    }
    const outcomes = createFoldingOutcomes(template)
    expect(outcomes.correct).toEqual([7, 10])
    expect(outcomes.unchanged).toEqual([7])
    expect(new Set(Object.values(outcomes).map(foldingCellsKey)).size).toBe(3)
  })

  it('lehnt Achsen durch Zellen, falsche Faltseiten und Zellen außerhalb des Papiers ab', () => {
    expect(isValidFoldingTemplate({ ...pointTemplate, columns: 5 })).toBe(false)
    expect(isValidFoldingTemplate({ ...pointTemplate, foldSide: 'right' })).toBe(false)
    expect(() => reflectFoldingCell(16, 4, 4, 'vertical')).toThrow(/außerhalb/i)
  })
})
