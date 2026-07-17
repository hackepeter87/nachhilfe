export type DataDisplayType = 'table' | 'tally' | 'pictogram' | 'bar'

export interface DataSetTemplate {
  id: string
  title: string
  categories: [string, string, string]
  baseValues: [number, number, number]
  unitLabel: string
  symbolLabel: string
}

export function isValidDataSetTemplate(value: unknown): value is DataSetTemplate {
  if (typeof value !== 'object' || value === null) return false
  const template = value as Partial<DataSetTemplate>
  return typeof template.id === 'string' && template.id.length > 0 &&
    typeof template.title === 'string' && template.title.length > 0 &&
    Array.isArray(template.categories) && template.categories.length === 3 &&
    new Set(template.categories).size === 3 && template.categories.every((category) => typeof category === 'string' && category.length > 0) &&
    Array.isArray(template.baseValues) && template.baseValues.length === 3 &&
    template.baseValues.every((entry) => Number.isInteger(entry) && entry >= 2 && entry <= 10) &&
    typeof template.unitLabel === 'string' && template.unitLabel.length > 0 &&
    typeof template.symbolLabel === 'string' && template.symbolLabel.length > 0
}

export function varyDataValues(template: DataSetTemplate, seed: number): [number, number, number] {
  if (!isValidDataSetTemplate(template)) throw new Error('Die Datenvorlage ist ungültig.')
  const offsets = [seed % 3, Math.floor(seed / 3) % 3, Math.floor(seed / 9) % 3]
  return template.baseValues.map((value, index) => Math.min(12, value + offsets[index]!)) as [number, number, number]
}

export function createDataDistractors(answer: number, usedValues: number[]): number[] {
  const candidates = [answer - 1, answer + 1, ...usedValues, answer - 2, answer + 2]
  return [...new Set(candidates.filter((value) => Number.isInteger(value) && value >= 0 && value !== answer))].slice(0, 3)
}

export function sameDataValues(first: number[], second: number[]): boolean {
  return first.length === second.length && first.every((value, index) => value === second[index])
}
