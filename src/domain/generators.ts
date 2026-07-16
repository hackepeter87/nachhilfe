import { integer, pick, seededRandom, shuffle } from './random'
import type { AnswerOption, Difficulty, Exercise, ExerciseStep, SkillId } from './types'
import { getSkillContent, getTaskCatalog, renderCatalogText } from '../content/catalog'

export function getSkillLabel(skillId: SkillId): string {
  return getSkillContent(skillId).label
}

const base = (skillId: SkillId, seed: number, difficulty: Difficulty, values: Record<string, number | string>) => ({
  id: `${skillId}-${seed}`,
  skillId,
  difficulty,
  title: getSkillLabel(skillId),
  variant: { seed, key: `${skillId}:${JSON.stringify(values)}`, values },
  testMetadata: {
    min: getSkillContent(skillId).difficultyBounds.minValue,
    max: getSkillContent(skillId).difficultyBounds.maxValue,
    uniqueSolution: true as const
  }
})

function contentFor(skillId: SkillId, values: Record<string, number | string>) {
  const content = getSkillContent(skillId)
  return {
    prompt: renderCatalogText(content.prompt, values),
    hints: content.hints.map((text, index) => ({ level: (index + 1) as 1 | 2, text: renderCatalogText(text, values) })) as Exercise['hints'],
    errorFeedback: renderCatalogText(content.errorFeedback, values),
    explanation: renderCatalogText(content.explanation, values)
  }
}

function numberOptions(random: () => number, correct: number, candidates: number[]): AnswerOption[] {
  const { min, max } = getTaskCatalog().numberRange
  if (correct < min || correct > max) throw new RangeError(`Lösung ${correct} liegt außerhalb des Zahlenraums.`)
  const values = [...new Set([correct, ...candidates.filter((value) => value >= min && value <= max)])]
  let offset = 1
  while (values.length < 3) {
    for (const candidate of [correct - offset, correct + offset]) {
      if (candidate >= min && candidate <= max && !values.includes(candidate)) values.push(candidate)
      if (values.length === 3) break
    }
    offset += 1
  }
  return shuffle(random, values.slice(0, 3)).map((value) => ({ value: String(value), label: String(value) }))
}

function textOptions(random: () => number, correct: string, distractors: string[]): AnswerOption[] {
  return shuffle(random, [...new Set([correct, ...distractors])].slice(0, 3)).map((value) => ({ value, label: value }))
}

function addition(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  const first = integer(random, 2, difficulty === 1 ? 9 : 13)
  const second = integer(random, 1, Math.min(20 - first, difficulty === 1 ? 9 : 12))
  const answer = first + second
  const values = { first, second, answer }
  return {
    ...base('addition', seed, difficulty, values),
    ...contentFor('addition', values),
    typeId: 'addition-to-20',
    answerMode: 'number',
    correctAnswer: String(answer)
  }
}

function subtraction(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  const first = integer(random, difficulty === 1 ? 8 : 12, 20)
  const second = integer(random, 1, Math.min(first, difficulty === 1 ? 8 : 12))
  const answer = first - second
  const values = { first, second, answer }
  return {
    ...base('subtraction', seed, difficulty, values),
    ...contentFor('subtraction', values),
    typeId: 'subtraction-to-20',
    answerMode: 'number',
    correctAnswer: String(answer)
  }
}

function multiplication(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  const maxFactor = difficulty === 1 ? 5 : 10
  const first = integer(random, 2, maxFactor)
  const second = integer(random, 2, 10)
  const answer = first * second
  const values = { first, second, answer, sumExpression: Array.from({ length: first }, () => second).join(' + ') }
  return {
    ...base('multiplication', seed, difficulty, values),
    ...contentFor('multiplication', values),
    typeId: 'small-multiplication',
    answerMode: 'number',
    correctAnswer: String(answer)
  }
}

function division(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  const divisor = integer(random, 2, difficulty === 1 ? 5 : 10)
  const quotient = integer(random, 2, 10)
  const dividend = divisor * quotient
  const values = { dividend, divisor, quotient }
  return {
    ...base('division', seed, difficulty, values),
    ...contentFor('division', values),
    typeId: 'inverse-division',
    answerMode: 'number',
    correctAnswer: String(quotient)
  }
}

function placeValue(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  const hundreds = integer(random, 1, 9)
  const tens = integer(random, 0, 9)
  const ones = integer(random, 0, 9)
  const number = hundreds * 100 + tens * 10 + ones
  const position = pick(random, ['Hunderter', 'Zehner', 'Einer'] as const)
  const digit = position === 'Hunderter' ? hundreds : position === 'Zehner' ? tens : ones
  const answer = position === 'Hunderter' ? digit * 100 : position === 'Zehner' ? digit * 10 : digit
  const values = { number, position, digit, answer }
  return {
    ...base('place-value', seed, difficulty, values),
    ...contentFor('place-value', values),
    typeId: 'digit-place-value',
    answerMode: 'choice',
    correctAnswer: String(answer),
    options: numberOptions(random, answer, [digit, digit * 10, digit * 100])
  }
}

function decompose(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  const hundreds = integer(random, 1, 9)
  const tens = integer(random, 0, 9)
  const ones = integer(random, 0, 9)
  const number = hundreds * 100 + tens * 10 + ones
  const answer = `${hundreds * 100} + ${tens * 10} + ${ones}`
  const values = { number, answer, hundreds, tens, ones, hundredsValue: hundreds * 100, tensValue: tens * 10 }
  return {
    ...base('decompose', seed, difficulty, values),
    ...contentFor('decompose', values),
    typeId: 'decompose-number',
    answerMode: 'choice',
    correctAnswer: answer,
    options: textOptions(random, answer, [
      `${hundreds} + ${tens} + ${ones}`,
      `${tens * 100} + ${hundreds * 10} + ${ones}`,
      `${hundreds * 100} + ${ones * 10} + ${tens}`
    ])
  }
}

function compose(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  const hundreds = integer(random, 1, 9)
  const tens = integer(random, 0, 9)
  const ones = integer(random, 0, 9)
  const answer = hundreds * 100 + tens * 10 + ones
  const values = { hundreds, tens, ones, answer, hundredsValue: hundreds * 100, tensValue: tens * 10 }
  return {
    ...base('compose', seed, difficulty, values),
    ...contentFor('compose', values),
    typeId: 'compose-number',
    answerMode: 'number',
    correctAnswer: String(answer)
  }
}

function neighbors(seed: number, difficulty: Difficulty, unit: 10 | 100): Exercise {
  const random = seededRandom(seed)
  let number = integer(random, unit + 1, unit === 10 ? 989 : 899)
  while (number % unit === 0) number += 1
  const lower = Math.floor(number / unit) * unit
  const upper = lower + unit
  const answer = `${lower} und ${upper}`
  const skillId: SkillId = unit === 10 ? 'neighbor-tens' : 'neighbor-hundreds'
  const values = { number, lower, upper }
  return {
    ...base(skillId, seed, difficulty, values),
    ...contentFor(skillId, values),
    typeId: unit === 10 ? 'neighbor-tens' : 'neighbor-hundreds',
    answerMode: 'choice',
    correctAnswer: answer,
    options: textOptions(random, answer, [
      `${lower - unit} und ${lower}`,
      `${upper} und ${upper + unit}`,
      `${lower - unit} und ${upper}`
    ])
  }
}

export function roundToUnit(number: number, unit: 10 | 100): number {
  return Math.round(number / unit) * unit
}

export function createRoundingExercise(number: number, unit: 10 | 100, seed = number * 17 + unit, difficulty: Difficulty = 1): Exercise {
  const { min, max } = getTaskCatalog().numberRange
  if (!Number.isInteger(number) || number < min || number > max) throw new RangeError(`Zahl ${number} liegt außerhalb des Zahlenraums.`)
  const random = seededRandom(seed)
  const lower = Math.floor(number / unit) * unit
  const upper = Math.min(max, lower + unit)
  const answer = roundToUnit(number, unit)
  const skillId: SkillId = unit === 10 ? 'round-tens' : 'round-hundreds'
  const lowerDistance = number - lower
  const upperDistance = upper - number
  const values = { number, lower, upper, answer, lowerDistance, upperDistance }
  const content = getSkillContent(skillId)
  const generatedContent = contentFor(skillId, values)
  const explanation = lowerDistance === upperDistance && content.halfExplanation
    ? renderCatalogText(content.halfExplanation, values)
    : generatedContent.explanation
  return {
    ...base(skillId, seed, difficulty, values),
    ...generatedContent,
    explanation,
    typeId: unit === 10 ? 'round-tens' : 'round-hundreds',
    answerMode: 'choice',
    correctAnswer: String(answer),
    options: numberOptions(random, answer, [lower, upper, answer === lower ? lower - unit : upper + unit])
  }
}

function rounding(seed: number, difficulty: Difficulty, unit: 10 | 100): Exercise {
  const random = seededRandom(seed)
  let number = integer(random, unit === 10 ? 5 : 50, unit === 10 ? 995 : 950)
  while (number % unit === 0) number += 1
  return createRoundingExercise(number, unit, seed, difficulty)
}

function wordProblem(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  const catalog = getTaskCatalog()
  const template = pick(random, catalog.wordProblems)
  const stepsContent = catalog.wordProblemSteps
  const first = integer(random, template.firstRange.min, template.firstRange.max)
  const second = integer(random, template.secondRange.min, Math.min(template.secondRange.max, first - 1))
  const result = template.operation === '+' ? first + second : first - second
  const templateValues = { first, second, result }
  const story = renderCatalogText(template.story, templateValues)
  const relevant = renderCatalogText(template.relevant, templateValues)
  const answerSentence = renderCatalogText(template.answer, templateValues)
  const operationHint = template.operation === '+' ? stepsContent.additionHint : stepsContent.subtractionHint
  const values = { first, second, result, operation: template.operation, story, answerSentence, operationHint }
  const steps: ExerciseStep[] = [
    {
      id: 'relevant',
      prompt: renderCatalogText(stepsContent.relevantPrompt, values),
      options: textOptions(random, relevant, stepsContent.relevantDistractors.map((text) => renderCatalogText(text, values))),
      correctAnswer: relevant,
      errorFeedback: renderCatalogText(stepsContent.relevantError, values),
      successFeedback: renderCatalogText(stepsContent.relevantSuccess, values)
    },
    {
      id: 'operation',
      prompt: renderCatalogText(stepsContent.operationPrompt, values),
      options: stepsContent.operationOptions,
      correctAnswer: template.operation,
      errorFeedback: template.operation === '+' ? stepsContent.additionError : stepsContent.subtractionError,
      successFeedback: stepsContent.operationSuccess
    },
    {
      id: 'calculate',
      prompt: renderCatalogText(stepsContent.calculatePrompt, values),
      options: numberOptions(random, result, [result - 1, result + 1]),
      correctAnswer: String(result),
      errorFeedback: stepsContent.calculateError,
      successFeedback: stepsContent.calculateSuccess
    },
    {
      id: 'check',
      prompt: stepsContent.checkPrompt,
      options: textOptions(random, answerSentence, [
        renderCatalogText(template.answer, { ...templateValues, result: Math.max(0, result - 1) }),
        renderCatalogText(template.answer, { ...templateValues, result: result + 2 })
      ]),
      correctAnswer: answerSentence,
      errorFeedback: stepsContent.checkError,
      successFeedback: stepsContent.checkSuccess
    }
  ]
  return {
    ...base('word-problem', seed, difficulty, values),
    ...contentFor('word-problem', values),
    typeId: 'guided-word-problem',
    answerMode: 'guided-word',
    correctAnswer: answerSentence,
    steps
  }
}

function mirrorGrid(grid: number[][]): number[][] {
  return grid.map((row) => [...row].reverse())
}

function flipGrid(grid: number[][]): number[][] {
  return [...grid].reverse().map((row) => [...row])
}

function symmetry(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  const symmetryContent = getTaskCatalog().symmetry
  const template = pick(random, symmetryContent.templates)
  const sourceGrid = template.grid
  const correct = mirrorGrid(sourceGrid)
  const values = { shape: template.id, answer: 'mirror' }
  const options = shuffle(random, [
    { value: 'mirror', label: symmetryContent.optionLabels[0], grid: correct },
    { value: 'shift', label: symmetryContent.optionLabels[1], grid: sourceGrid },
    { value: 'flip', label: symmetryContent.optionLabels[2], grid: flipGrid(sourceGrid) }
  ])
  return {
    ...base('symmetry', seed, difficulty, values),
    ...contentFor('symmetry', values),
    typeId: 'grid-symmetry',
    answerMode: 'symmetry',
    correctAnswer: 'mirror',
    sourceGrid,
    options
  }
}

export function generateExercise(skillId: SkillId, seed: number, difficulty: Difficulty = 1): Exercise {
  switch (skillId) {
    case 'addition': return addition(seed, difficulty)
    case 'subtraction': return subtraction(seed, difficulty)
    case 'multiplication': return multiplication(seed, difficulty)
    case 'division': return division(seed, difficulty)
    case 'place-value': return placeValue(seed, difficulty)
    case 'decompose': return decompose(seed, difficulty)
    case 'compose': return compose(seed, difficulty)
    case 'neighbor-tens': return neighbors(seed, difficulty, 10)
    case 'neighbor-hundreds': return neighbors(seed, difficulty, 100)
    case 'round-tens': return rounding(seed, difficulty, 10)
    case 'round-hundreds': return rounding(seed, difficulty, 100)
    case 'word-problem': return wordProblem(seed, difficulty)
    case 'symmetry': return symmetry(seed, difficulty)
  }
}

export function isAnswerCorrect(exercise: Exercise, answer: string): boolean {
  return answer.trim() === exercise.correctAnswer
}

export function isStepAnswerCorrect(step: ExerciseStep, answer: string): boolean {
  return answer === step.correctAnswer
}

export { mirrorGrid }
