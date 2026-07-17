export type ChanceExperimentType = 'bag' | 'coin' | 'die' | 'spinner'
export type ChanceClassification = 'sure' | 'possible' | 'impossible'

export interface ProbabilityTemplate {
  id: string
  difficulty: 1 | 2 | 3
  experimentType: ChanceExperimentType
  title: string
  outcomes: string[]
  question: string
  eventA: string[]
  eventB?: string[]
  eventALabel?: string
  eventBLabel?: string
}

export interface CombinationTemplate {
  id: string
  difficulty: 1 | 2 | 3
  title: string
  firstLabel: string
  firstOptions: string[]
  secondLabel: string
  secondOptions: string[]
  question: string
  excludedPair?: [string, string]
}

const isTextArray = (value: unknown, minimum: number, maximum: number): value is string[] =>
  Array.isArray(value) && value.length >= minimum && value.length <= maximum && value.every((entry) => typeof entry === 'string' && entry.trim().length > 0)

export function isValidProbabilityTemplate(value: unknown): value is ProbabilityTemplate {
  if (typeof value !== 'object' || value === null) return false
  const template = value as Partial<ProbabilityTemplate>
  if (typeof template.id !== 'string' || !template.id || ![1, 2, 3].includes(template.difficulty as number) ||
    !['bag', 'coin', 'die', 'spinner'].includes(template.experimentType as string) || typeof template.title !== 'string' || !template.title ||
    typeof template.question !== 'string' || !template.question || !isTextArray(template.outcomes, 2, 8) || !isTextArray(template.eventA, 1, 8)) return false
  if (template.difficulty === 3) {
    return template.eventA.every((outcome) => template.outcomes?.includes(outcome)) && isTextArray(template.eventB, 1, 8) && template.eventB.every((outcome) => template.outcomes?.includes(outcome)) &&
      typeof template.eventALabel === 'string' && Boolean(template.eventALabel) && typeof template.eventBLabel === 'string' && Boolean(template.eventBLabel)
  }
  return template.eventB === undefined
}

export function classifyEvent(outcomes: string[], event: string[]): ChanceClassification {
  const matches = outcomes.filter((outcome) => event.includes(outcome)).length
  return matches === 0 ? 'impossible' : matches === outcomes.length ? 'sure' : 'possible'
}

export function compareEventFrequency(outcomes: string[], first: string[], second: string[]): 'first' | 'equal' | 'second' {
  const firstCount = outcomes.filter((outcome) => first.includes(outcome)).length
  const secondCount = outcomes.filter((outcome) => second.includes(outcome)).length
  return firstCount === secondCount ? 'equal' : firstCount > secondCount ? 'first' : 'second'
}

export function isValidCombinationTemplate(value: unknown): value is CombinationTemplate {
  if (typeof value !== 'object' || value === null) return false
  const template = value as Partial<CombinationTemplate>
  if (typeof template.id !== 'string' || !template.id || ![1, 2, 3].includes(template.difficulty as number) ||
    typeof template.title !== 'string' || !template.title || typeof template.question !== 'string' || !template.question ||
    typeof template.firstLabel !== 'string' || !template.firstLabel || typeof template.secondLabel !== 'string' || !template.secondLabel ||
    !isTextArray(template.firstOptions, 2, 3) || !isTextArray(template.secondOptions, 2, 3) ||
    new Set(template.firstOptions).size !== template.firstOptions.length || new Set(template.secondOptions).size !== template.secondOptions.length) return false
  if (template.difficulty === 1 && (template.firstOptions.length !== 2 || template.secondOptions.length !== 2 || template.excludedPair)) return false
  if (template.difficulty === 2 && (template.firstOptions.length * template.secondOptions.length !== 6 || template.excludedPair)) return false
  if (template.difficulty === 3) {
    return template.firstOptions.length === 3 && template.secondOptions.length === 3 && Array.isArray(template.excludedPair) && template.excludedPair.length === 2 &&
      template.firstOptions.includes(template.excludedPair[0]) && template.secondOptions.includes(template.excludedPair[1])
  }
  return true
}

export function combinationCount(template: CombinationTemplate): number {
  if (!isValidCombinationTemplate(template)) throw new Error('Die Kombinationsvorlage ist ungültig.')
  return template.firstOptions.length * template.secondOptions.length - (template.excludedPair ? 1 : 0)
}
