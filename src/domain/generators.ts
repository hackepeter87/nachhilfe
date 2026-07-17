import { integer, pick, seededRandom, shuffle } from './random'
import type { AnswerOption, Difficulty, Exercise, ExerciseRepresentation, ExerciseStep, SkillId } from './types'
import { getSkillContent, getTaskCatalog, renderCatalogText } from '../content/catalog'
import type { WordModelType } from '../content/catalog'
import { createShiftDistractor, flipGrid, mirrorGrid, reflectGrid } from './symmetry'
import { createCubeViewDistractors, cubeCount, cubeViewKey, projectCubeView, type CubeViewDirection } from './cubeViews'

export function getSkillLabel(skillId: SkillId): string {
  return getSkillContent(skillId).label
}

const base = (skillId: SkillId, seed: number, difficulty: Difficulty, values: Record<string, number | string>) => ({
  id: `${skillId}-${seed}`,
  skillId,
  difficulty,
  learningPhase: getSkillContent(skillId).difficultyLevels[difficulty - 1].learningPhase,
  title: getSkillLabel(skillId),
  variant: { seed, key: `${skillId}:${JSON.stringify(values)}`, values },
  testMetadata: {
    min: getSkillContent(skillId).difficultyBounds.minValue,
    max: getSkillContent(skillId).difficultyBounds.maxValue,
    uniqueSolution: true as const,
    requirements: getSkillContent(skillId).difficultyLevels[difficulty - 1].requirements,
    representation: 'none' as const,
    distractorSources: [] as string[],
    learningPhase: getSkillContent(skillId).difficultyLevels[difficulty - 1].learningPhase
  }
})

function contentFor(skillId: SkillId, values: Record<string, number | string>, difficulty: Difficulty) {
  const content = getSkillContent(skillId)
  const nextDifficulty = Math.max(1, difficulty - 1) as Difficulty
  return {
    prompt: renderCatalogText(content.prompt, values),
    hints: content.hints.map((text, index) => ({ level: (index + 1) as 1 | 2, text: renderCatalogText(text, values) })) as Exercise['hints'],
    successFeedback: renderCatalogText(content.successFeedback, values),
    errorFeedback: renderCatalogText(content.errorFeedback, values),
    explanation: renderCatalogText(content.explanation, values),
    remediation: {
      helpLevel: (nextDifficulty === 1 ? 5 : 4) as 4 | 5,
      nextDifficulty,
      keepSubskill: content.remediation.keepSubskill,
      strategy: renderCatalogText(nextDifficulty === 1 ? content.remediation.foundationStrategy : content.remediation.strategy, values),
      representation: content.remediation.representation
    }
  }
}

interface DistractorCandidate<T> {
  value: T
  misconception: string
}

function numberOptions(random: () => number, correct: number, candidates: Array<DistractorCandidate<number>>): AnswerOption[] {
  const { min, max } = getTaskCatalog().numberRange
  if (correct < min || correct > max) throw new RangeError(`Lösung ${correct} liegt außerhalb des Zahlenraums.`)
  const distinct = candidates.filter((candidate, index) =>
    candidate.value >= min && candidate.value <= max && candidate.value !== correct &&
    candidates.findIndex((other) => other.value === candidate.value) === index
  )
  if (distinct.length < 2) throw new Error(`Zu wenige plausible Distraktoren für ${correct}.`)
  return shuffle(random, [
    { value: String(correct), label: String(correct) },
    ...distinct.slice(0, 2).map((candidate) => ({
      value: String(candidate.value),
      label: String(candidate.value),
      misconception: candidate.misconception
    }))
  ])
}

function textOptions(random: () => number, correct: string, candidates: Array<DistractorCandidate<string>>): AnswerOption[] {
  const distinct = candidates.filter((candidate, index) =>
    candidate.value !== correct && candidates.findIndex((other) => other.value === candidate.value) === index
  )
  if (distinct.length < 2) throw new Error(`Zu wenige plausible Distraktoren für „${correct}“.`)
  return shuffle(random, [
    { value: correct, label: correct },
    ...distinct.slice(0, 2).map((candidate) => ({ value: candidate.value, label: candidate.value, misconception: candidate.misconception }))
  ])
}

function representation(
  skillId: SkillId,
  difficulty: Difficulty,
  kind: ExerciseRepresentation['kind'],
  label: string,
  values: ExerciseRepresentation['values']
): ExerciseRepresentation | undefined {
  const visibility = getSkillContent(skillId).difficultyLevels[difficulty - 1].representation
  return visibility === 'none' ? undefined : { kind, visibility, label, values }
}

function withMetadata(exercise: Exercise): Exercise {
  return {
    ...exercise,
    testMetadata: {
      ...exercise.testMetadata,
      representation: exercise.representation?.kind ?? 'none',
      distractorSources: [
        ...(exercise.options ?? []),
        ...(exercise.steps?.flatMap((step) => step.options ?? []) ?? [])
      ].filter((option) => option.misconception).map((option) => option.misconception!)
    }
  }
}

function addition(seed: number, difficulty: Difficulty, focus?: string): Exercise {
  const random = seededRandom(seed)
  const bridge = difficulty > 1 && (focus === 'addition-bridge-10' || difficulty > 1)
  const first = bridge ? integer(random, difficulty === 3 ? 7 : 4, 9) : integer(random, 1, 8)
  const second = bridge
    ? integer(random, 11 - first, Math.min(difficulty === 3 ? 20 - first : 18 - first, 9))
    : integer(random, 1, 10 - first)
  const answer = first + second
  const toTen = Math.min(second, 10 - first)
  const rest = second - toTen
  const values = { first, second, answer, toTen, rest }
  return withMetadata({
    ...base('addition', seed, difficulty, values),
    ...contentFor('addition', values, difficulty),
    typeId: 'addition-to-20',
    subskillId: bridge ? 'addition-bridge-10' : 'addition-within-10',
    answerMode: 'number',
    correctAnswer: String(answer),
    representation: representation('addition', difficulty, 'number-line', 'Schritte auf dem Rechenstrich', { start: first, end: answer, step: second })
  })
}

function subtraction(seed: number, difficulty: Difficulty, focus?: string): Exercise {
  const random = seededRandom(seed)
  const bridge = difficulty > 1 && (focus === 'subtraction-bridge-10' || difficulty > 1)
  const first = integer(random, difficulty === 3 ? 17 : bridge ? 12 : 5, difficulty === 2 ? 16 : bridge ? 20 : 10)
  let second = integer(random, 1, Math.min(first, 9))
  if (bridge && first - second >= 10) second = Math.min(first, first - 9 + integer(random, 0, 2))
  const answer = first - second
  const toTen = bridge ? Math.min(second, first - 10) : 0
  const rest = second - toTen
  const values = { first, second, answer, toTen, rest }
  return withMetadata({
    ...base('subtraction', seed, difficulty, values),
    ...contentFor('subtraction', values, difficulty),
    typeId: 'subtraction-to-20',
    subskillId: bridge ? 'subtraction-bridge-10' : 'subtraction-within-10',
    answerMode: 'number',
    correctAnswer: String(answer),
    representation: representation('subtraction', difficulty, 'number-line', 'Schritte zurück auf dem Rechenstrich', { start: answer, end: first, step: second })
  })
}

function multiplication(seed: number, difficulty: Difficulty, focus?: string): Exercise {
  const random = seededRandom(seed)
  const rows = difficulty === 1 ? [2, 5, 10] : difficulty === 2 ? [3, 4, 6] : [6, 7, 8, 9]
  const focusedRow = focus?.startsWith('times-') ? Number(focus.slice(6)) : undefined
  const first = focusedRow && rows.includes(focusedRow) ? focusedRow : pick(random, rows)
  const second = integer(random, 2, difficulty === 1 ? Math.min(10, Math.floor(50 / first)) : 10)
  const answer = first * second
  const values = { first, second, answer, sumExpression: Array.from({ length: first }, () => second).join(' + ') }
  return withMetadata({
    ...base('multiplication', seed, difficulty, values),
    ...contentFor('multiplication', values, difficulty),
    typeId: 'small-multiplication',
    subskillId: `times-${first}`,
    answerMode: 'number',
    correctAnswer: String(answer),
    representation: representation('multiplication', difficulty, 'groups', `${first} gleich große Gruppen`, { groups: first, size: second })
  })
}

function division(seed: number, difficulty: Difficulty, focus?: string): Exercise {
  const random = seededRandom(seed)
  const rows = difficulty === 1 ? [2, 5, 10] : difficulty === 2 ? [3, 4, 6] : [6, 7, 8, 9]
  const focusedDivisor = focus?.startsWith('division-by-') ? Number(focus.slice(12)) : undefined
  const divisor = focusedDivisor && rows.includes(focusedDivisor) ? focusedDivisor : pick(random, rows)
  const quotient = integer(random, 2, difficulty === 1 ? Math.min(10, Math.floor(50 / divisor)) : 10)
  const dividend = divisor * quotient
  const values = { dividend, divisor, quotient }
  return withMetadata({
    ...base('division', seed, difficulty, values),
    ...contentFor('division', values, difficulty),
    typeId: 'inverse-division',
    subskillId: `division-by-${divisor}`,
    answerMode: 'number',
    correctAnswer: String(quotient),
    representation: representation('division', difficulty, 'groups', `${dividend} Dinge in gleich große Gruppen teilen`, { groups: quotient, size: divisor })
  })
}

function placeValue(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  const hundreds = integer(random, 1, 9)
  let tens = integer(random, 1, 9)
  let ones = integer(random, 1, 9)
  if (difficulty === 2) {
    if (random() < 0.5) tens = 0
    else ones = 0
  } else if (difficulty === 3) {
    const zeroPattern = random()
    if (zeroPattern < 0.5) {
      tens = 0
      ones = 0
    } else if (zeroPattern < 0.75) tens = 0
    else ones = 0
  }
  const number = hundreds * 100 + tens * 10 + ones
  const zeroPositions = [
    ...(tens === 0 ? ['Zehner'] : []),
    ...(ones === 0 ? ['Einer'] : [])
  ] as Array<'Zehner' | 'Einer'>
  const position = difficulty >= 2 && zeroPositions.length > 0
    ? pick(random, zeroPositions)
    : pick(random, ['Hunderter', 'Zehner', 'Einer'] as const)
  const digit = position === 'Hunderter' ? hundreds : position === 'Zehner' ? tens : ones
  const answer = position === 'Hunderter' ? digit * 100 : position === 'Zehner' ? digit * 10 : digit
  const values = { number, position, digit, answer }
  const valueOptions = numberOptions(random, answer, answer === 0 ? [
    { value: position === 'Zehner' ? 10 : 1, misconception: 'Leere Stelle als eine Einheit gelesen' },
    { value: hundreds, misconception: 'Ziffer der Hunderterstelle übernommen' },
    { value: hundreds * 100, misconception: 'Wert der Hunderterstelle übernommen' }
  ] : [
    { value: digit, misconception: 'Ziffer statt Stellenwert' },
    { value: digit * 10, misconception: 'Zehnerstelle angenommen' },
    { value: digit * 100, misconception: 'Hunderterstelle angenommen' }
  ])
  const stepText = getTaskCatalog().strategySteps.placeValue
  const steps: ExerciseStep[] | undefined = difficulty === 3 ? [
    {
      id: 'identify-digit',
      prompt: renderCatalogText(stepText.digitPrompt, values),
      options: numberOptions(random, digit, [
        { value: digit === 0 ? 1 : 0, misconception: 'Andere Stelle abgelesen' },
        { value: digit === 0 ? 2 : digit === 9 ? 8 : digit + 1, misconception: 'Nachbarziffer gewählt' }
      ]),
      correctAnswer: String(digit),
      errorFeedback: renderCatalogText(stepText.digitError, values),
      successFeedback: renderCatalogText(stepText.digitSuccess, values)
    },
    {
      id: 'identify-value',
      prompt: renderCatalogText(stepText.valuePrompt, values),
      options: valueOptions,
      correctAnswer: String(answer),
      errorFeedback: renderCatalogText(stepText.valueError, values),
      successFeedback: renderCatalogText(stepText.valueSuccess, values)
    }
  ] : undefined
  return withMetadata({
    ...base('place-value', seed, difficulty, values),
    ...contentFor('place-value', values, difficulty),
    typeId: 'digit-place-value',
    answerMode: difficulty === 3 ? 'guided-choice' : 'choice',
    correctAnswer: String(answer),
    steps,
    representation: representation('place-value', difficulty, 'place-value', 'Stellenwerttafel', {
      hundreds, tens, ones,
      highlight: difficulty === 1 ? (position === 'Hunderter' ? 'hundreds' : position === 'Zehner' ? 'tens' : 'ones') : ''
    }),
    options: difficulty === 3 ? undefined : valueOptions
  })
}

function decompose(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  const hundreds = integer(random, 1, 9)
  let tens = integer(random, 1, 9)
  let ones = integer(random, 1, 9)
  if (difficulty === 2) {
    if (random() < 0.5) tens = 0
    else ones = 0
  } else if (difficulty === 3) {
    tens = 0
    ones = 0
  }
  const number = hundreds * 100 + tens * 10 + ones
  const answer = `${hundreds * 100} + ${tens * 10} + ${ones}`
  const values = { number, answer, hundreds, tens, ones, hundredsValue: hundreds * 100, tensValue: tens * 10 }
  return withMetadata({
    ...base('decompose', seed, difficulty, values),
    ...contentFor('decompose', values, difficulty),
    typeId: 'decompose-number',
    answerMode: 'choice',
    correctAnswer: answer,
    representation: representation('decompose', difficulty, 'place-value', 'Zahl in der Stellenwerttafel', { hundreds, tens, ones }),
    options: textOptions(random, answer, [
      { value: `${hundreds} + ${tens} + ${ones}`, misconception: 'Ziffern ohne Stellenwert' },
      { value: `${tens * 100} + ${hundreds * 10} + ${ones}`, misconception: 'Hunderter und Zehner vertauscht' },
      { value: `${hundreds * 100} + ${ones * 10} + ${tens}`, misconception: 'Zehner und Einer vertauscht' },
      { value: `${hundreds * 100} + ${tens} + ${ones * 10}`, misconception: 'Null als Platzhalter nicht beachtet' }
    ])
  })
}

function compose(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  const hundreds = integer(random, 1, 9)
  let tens = integer(random, 1, 9)
  let ones = integer(random, 1, 9)
  if (difficulty === 2) {
    if (random() < 0.5) tens = 0
    else ones = 0
  } else if (difficulty === 3) {
    tens = 0
    ones = 0
  }
  const answer = hundreds * 100 + tens * 10 + ones
  const values = { hundreds, tens, ones, answer, hundredsValue: hundreds * 100, tensValue: tens * 10 }
  return withMetadata({
    ...base('compose', seed, difficulty, values),
    ...contentFor('compose', values, difficulty),
    typeId: 'compose-number',
    answerMode: 'number',
    correctAnswer: String(answer),
    representation: representation('compose', difficulty, 'place-value', 'Hunderter, Zehner und Einer', { hundreds, tens, ones })
  })
}

function neighbors(seed: number, difficulty: Difficulty, unit: 10 | 100): Exercise {
  const random = seededRandom(seed)
  const intervalStart = integer(random, 1, unit === 10 ? 99 : 9) * unit
  const offset = difficulty === 1
    ? integer(random, Math.ceil(unit * 0.3), Math.floor(unit * 0.7))
    : difficulty === 2
      ? pick(random, [1, 2, unit - 2, unit - 1])
      : integer(random, 1, unit - 1)
  const number = intervalStart + offset
  const lower = Math.floor(number / unit) * unit
  const upper = lower + unit
  const answer = `${lower} und ${upper}`
  const skillId: SkillId = unit === 10 ? 'neighbor-tens' : 'neighbor-hundreds'
  const values = { number, lower, upper }
  return withMetadata({
    ...base(skillId, seed, difficulty, values),
    ...contentFor(skillId, values, difficulty),
    typeId: unit === 10 ? 'neighbor-tens' : 'neighbor-hundreds',
    answerMode: 'choice',
    correctAnswer: answer,
    representation: representation(skillId, difficulty, 'number-line', 'Ausschnitt aus dem Zahlenstrahl', { start: lower, end: upper, marker: number, step: unit }),
    options: textOptions(random, answer, [
      { value: `${Math.max(0, lower - unit)} und ${lower}`, misconception: 'Intervall zu weit links' },
      { value: `${upper} und ${Math.min(1000, upper + unit)}`, misconception: 'Intervall zu weit rechts' },
      { value: `${Math.max(0, lower - unit)} und ${upper}`, misconception: 'Nur eine Nachbarzahl passend' }
    ])
  })
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
  const generatedContent = contentFor(skillId, values, difficulty)
  const explanation = lowerDistance === upperDistance && content.halfExplanation
    ? renderCatalogText(content.halfExplanation, values)
    : generatedContent.explanation
  const resultOptions = numberOptions(random, answer, [
    { value: lower, misconception: 'Immer abgerundet' },
    { value: upper, misconception: 'Immer aufgerundet' },
    { value: lower - unit, misconception: 'Eine Nachbarzahl übersprungen' },
    { value: upper + unit, misconception: 'Eine Nachbarzahl übersprungen' },
    { value: unit === 100 ? roundToUnit(number, 10) : answer + (answer === max ? -unit : unit), misconception: 'Auf die falsche Stelle gerundet' }
  ])
  const stepText = getTaskCatalog().strategySteps.rounding
  const neighborAnswer = `${lower} und ${upper}`
  const steps: ExerciseStep[] | undefined = difficulty >= 2 ? [
    {
      id: 'neighbors',
      prompt: renderCatalogText(stepText.neighborsPrompt, values),
      options: textOptions(random, neighborAnswer, [
        { value: `${Math.max(min, lower - unit)} und ${lower}`, misconception: 'Intervall zu weit links' },
        { value: `${upper} und ${Math.min(max, upper + unit)}`, misconception: 'Intervall zu weit rechts' },
        { value: `${Math.max(min, lower - unit)} und ${upper}`, misconception: 'Nur eine Nachbarzahl passend' }
      ]),
      correctAnswer: neighborAnswer,
      errorFeedback: renderCatalogText(stepText.neighborsError, values),
      successFeedback: renderCatalogText(stepText.neighborsSuccess, values)
    },
    {
      id: 'round-result',
      prompt: renderCatalogText(stepText.resultPrompt, values),
      options: resultOptions,
      correctAnswer: String(answer),
      errorFeedback: renderCatalogText(stepText.resultError, values),
      successFeedback: renderCatalogText(stepText.resultSuccess, values)
    }
  ] : undefined
  if (difficulty === 3 && steps) {
    const correctReason = lowerDistance === upperDistance
      ? renderCatalogText(stepText.halfwayUp, values)
      : lowerDistance < upperDistance
        ? renderCatalogText(stepText.closerLower, values)
        : renderCatalogText(stepText.closerUpper, values)
    steps.push({
      id: 'round-reason',
      prompt: renderCatalogText(stepText.reasonPrompt, values),
      options: textOptions(random, correctReason, [
        { value: renderCatalogText(stepText.wrongLower, values), misconception: 'Ohne Abstand immer nach unten gerundet' },
        { value: renderCatalogText(stepText.wrongUpper, values), misconception: 'Ohne Abstand immer nach oben gerundet' }
      ]),
      correctAnswer: correctReason,
      errorFeedback: renderCatalogText(stepText.reasonError, values),
      successFeedback: renderCatalogText(stepText.reasonSuccess, values)
    })
  }
  return withMetadata({
    ...base(skillId, seed, difficulty, values),
    ...generatedContent,
    explanation,
    typeId: unit === 10 ? 'round-tens' : 'round-hundreds',
    answerMode: difficulty >= 2 ? 'guided-choice' : 'choice',
    correctAnswer: String(answer),
    steps,
    representation: representation(skillId, difficulty, 'number-line', 'Abstände zu den Nachbarzahlen', { start: lower, end: upper, marker: number, step: unit }),
    options: difficulty >= 2 ? undefined : resultOptions
  })
}

function numberLineJumps(points: number[]): Array<{ from: number; to: number; label: string }> {
  return points.slice(1).map((point, index) => {
    const from = points[index] as number
    const delta = point - from
    return { from, to: point, label: delta > 0 ? `+${delta}` : String(delta) }
  })
}

function rounding(seed: number, difficulty: Difficulty, unit: 10 | 100): Exercise {
  const random = seededRandom(seed)
  const maxInterval = difficulty === 3 ? (unit === 10 ? 99 : 9) : (unit === 10 ? 98 : 8)
  const interval = integer(random, 0, maxInterval) * unit
  const offset = difficulty === 1
    ? (unit === 10 ? pick(random, [2, 3, 7, 8]) : pick(random, [20, 30, 70, 80]))
    : difficulty === 2
      ? (unit === 10 ? pick(random, [4, 5, 6]) : pick(random, [40, 50, 60]))
      : integer(random, 1, unit - 1)
  let number = interval + offset
  if (number > 1000 - unit / 2) number = 1000 - unit / 2
  return createRoundingExercise(number, unit, seed, difficulty)
}

function wordModelRepresentation(
  modelType: WordModelType,
  values: Record<string, number | string>,
  label: string
): ExerciseRepresentation {
  const kind = modelType.startsWith('equal-groups') ? 'groups' : 'bar-model'
  const first = Number(values.first)
  const second = Number(values.second)
  const suppliedTotal = Number(values.total)
  return {
    kind,
    visibility: 'always',
    label,
    values: {
      modelType,
      first,
      second,
      third: values.third,
      total: suppliedTotal > 0 ? suppliedTotal : modelType === 'equal-groups-share' ? second : first,
      groups: first,
      ...(modelType === 'equal-groups-share' ? {} : { size: second })
    }
  }
}

function wordModelOptions(
  random: () => number,
  correct: WordModelType,
  distractors: [WordModelType, WordModelType],
  values: Record<string, number | string>
): AnswerOption[] {
  return shuffle(random, [correct, ...distractors].map((modelType) => ({
    value: modelType,
    label: '',
    representation: wordModelRepresentation(modelType, values, 'Darstellung der Geschichte'),
    misconception: modelType === correct ? undefined : 'Mengen im Bild anders als in der Geschichte angeordnet'
  }))).map((option, index) => ({ ...option, label: `Bild ${String.fromCharCode(65 + index)}` }))
}

function wordProblem(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  const catalog = getTaskCatalog()
  const template = pick(random, catalog.wordProblems.filter((candidate) => candidate.minDifficulty <= difficulty))
  const stepsContent = catalog.wordProblemSteps
  const first = integer(random, template.firstRange.min, template.firstRange.max)
  const secondMax = template.operation === '−' ? Math.min(template.secondRange.max, first - 1) : template.secondRange.max
  const second = integer(random, template.secondRange.min, secondMax)
  const third = template.thirdRange ? integer(random, template.thirdRange.min, template.thirdRange.max) : 0
  const total = template.relationship === 'sharing' ? first * second : 0
  const intermediate = template.operation === '+' ? first + second : template.operation === '−' ? first - second : template.operation === ':' ? second : first * second
  const result = template.secondOperation === '+' ? intermediate + third : template.secondOperation === '−' ? intermediate - third : intermediate
  const irrelevant = difficulty === 3 ? (template.irrelevant ?? '') : ''
  const templateValues = { first, second, third, total, intermediate, result, irrelevant, secondOperation: template.secondOperation ?? '' }
  const story = renderCatalogText(template.story, templateValues)
    .replace(/\s+/g, ' ')
    .replace(/\s+([?.!,])/g, '$1')
    .trim()
  const question = renderCatalogText(template.question, templateValues)
  const relevant = renderCatalogText(template.relevant, templateValues)
  const answerSentence = renderCatalogText(template.answer, templateValues)
  const equation = renderCatalogText(template.equation, templateValues)
  const secondEquation = template.secondEquation ? renderCatalogText(template.secondEquation, templateValues) : ''
  const modelHint = renderCatalogText(template.modelHint, templateValues)
  const values = {
    first, second, third, total, intermediate, result,
    operation: template.operation,
    secondOperation: template.secondOperation ?? '',
    story, answerSentence, question, irrelevant, equation, secondEquation, modelHint,
    templateId: template.id
  }
  const steps: ExerciseStep[] = []
  steps.push({
    id: 'question',
    prompt: renderCatalogText(stepsContent.questionPrompt, values),
    options: textOptions(random, question, template.questionDistractors.map((text) => ({
      value: renderCatalogText(text, values), misconception: 'Bekannte Angabe statt gesuchter Menge gewählt'
    }))),
    correctAnswer: question,
    errorFeedback: stepsContent.questionError,
    successFeedback: stepsContent.questionSuccess
  })
  if (difficulty === 3) {
    steps.push({
      id: 'relevant',
      prompt: renderCatalogText(stepsContent.relevantPrompt, values),
      options: textOptions(random, relevant, template.relevantDistractors.map((text) => ({
        value: renderCatalogText(text, values), misconception: 'Wichtige Handlung oder benötigte Menge ausgelassen'
      }))),
      correctAnswer: relevant,
      errorFeedback: renderCatalogText(stepsContent.relevantError, values),
      successFeedback: renderCatalogText(stepsContent.relevantSuccess, values)
    })
  }
  steps.push({
    id: 'situation',
    prompt: stepsContent.situationPrompt,
    options: textOptions(random, renderCatalogText(template.situation, values), template.situationDistractors.map((text) => ({
      value: renderCatalogText(text, values), misconception: 'Handlung oder gesuchte Menge anders als in der Geschichte gedeutet'
    }))),
    correctAnswer: renderCatalogText(template.situation, values),
    errorFeedback: renderCatalogText(stepsContent.situationError, values),
    successFeedback: stepsContent.situationSuccess
  })
  const model = wordModelRepresentation(template.modelType, values, 'Passendes Mengenbild mit offener gesuchter Größe')
  if (difficulty === 1) {
    steps.push({
      id: 'model',
      interaction: 'continue',
      prompt: stepsContent.modelExplorePrompt,
      representation: model,
      continueLabel: stepsContent.modelContinueLabel,
      correctAnswer: 'continue',
      errorFeedback: stepsContent.modelError,
      successFeedback: stepsContent.modelSuccess
    })
  } else {
    steps.push({
      id: 'model',
      prompt: stepsContent.modelPrompt,
      options: wordModelOptions(random, template.modelType, template.modelDistractors, values),
      correctAnswer: template.modelType,
      errorFeedback: stepsContent.modelError,
      successFeedback: stepsContent.modelSuccess
    })
  }
  steps.push({
    id: 'equation',
    prompt: stepsContent.equationPrompt,
    options: textOptions(random, equation, template.equationDistractors.map((text) => ({
      value: renderCatalogText(text, values), misconception: 'Rechnung beschreibt ein anderes Mengenbild'
    }))),
    correctAnswer: equation,
    errorFeedback: renderCatalogText(template.equationError, values),
    successFeedback: stepsContent.equationSuccess
  }, {
      id: 'calculate',
      interaction: 'number',
      prompt: renderCatalogText(stepsContent.calculatePrompt, values),
      correctAnswer: String(intermediate),
      errorFeedback: stepsContent.calculateError,
      successFeedback: stepsContent.calculateSuccess
    })
  if (template.secondOperation) {
    steps.push({
      id: 'second-equation',
      prompt: renderCatalogText(stepsContent.secondEquationPrompt, values),
      options: textOptions(random, secondEquation, template.secondEquationDistractors!.map((text) => ({
        value: renderCatalogText(text, values), misconception: 'Zweite Veränderung in die falsche Richtung gerechnet'
      }))),
      correctAnswer: secondEquation,
      errorFeedback: renderCatalogText(stepsContent.secondEquationError, values),
      successFeedback: stepsContent.secondEquationSuccess
    }, {
      id: 'final-calculation',
      interaction: 'number',
      prompt: renderCatalogText(stepsContent.finalCalculationPrompt, values),
      correctAnswer: String(result),
      errorFeedback: stepsContent.finalCalculationError,
      successFeedback: stepsContent.finalCalculationSuccess
    })
  }
  if (difficulty === 3) {
    const plausibilityOptions = template.plausibility.options.map((option) => ({
      value: renderCatalogText(option.label, values),
      label: renderCatalogText(option.label, values),
      misconception: option.correct ? undefined : 'Größenbeziehung falsch eingeschätzt'
    }))
    const correctPlausibility = plausibilityOptions[template.plausibility.options.findIndex((option) => option.correct)]!.value
    steps.push({
      id: 'plausibility',
      prompt: renderCatalogText(template.plausibility.prompt, values),
      options: shuffle(random, plausibilityOptions),
      correctAnswer: correctPlausibility,
      errorFeedback: stepsContent.plausibilityError,
      successFeedback: stepsContent.plausibilitySuccess
    })
  }
  steps.push({
    id: 'check',
    prompt: stepsContent.checkPrompt,
    options: textOptions(random, answerSentence, [
      { value: renderCatalogText(template.answer, { ...templateValues, result: Math.max(0, result - 1) }), misconception: 'Antwortsatz mit falschem Ergebnis' },
      { value: renderCatalogText(template.answer, { ...templateValues, result: result + 2 }), misconception: 'Antwortsatz mit falschem Ergebnis' }
    ]),
    correctAnswer: answerSentence,
    errorFeedback: stepsContent.checkError,
    successFeedback: stepsContent.checkSuccess
  })
  return withMetadata({
    ...base('word-problem', seed, difficulty, values),
    ...contentFor('word-problem', values, difficulty),
    typeId: 'guided-word-problem',
    subskillId: `word-${template.relationship}`,
    answerMode: 'guided-word',
    correctAnswer: answerSentence,
    steps,
    representation: model
  })
}

function arithmetic1000Steps(
  random: () => number,
  values: Record<string, number | string>,
  bridge: number,
  answer: number,
  bridgeUnit: 10 | 100
): ExerciseStep[] {
  const content = getTaskCatalog().strategySteps.arithmetic1000
  return [{
    id: 'bridge',
    prompt: renderCatalogText(content.bridgePrompt, values),
    options: numberOptions(random, bridge, [
      { value: bridge - bridgeUnit, misconception: 'Nachbarzahl in der falschen Richtung gewählt' },
      { value: bridge + bridgeUnit, misconception: 'Einen Nachbar zu weit gegangen' },
      { value: Number(values.first), misconception: 'Noch keinen Rechenschritt ausgeführt' }
    ]),
    correctAnswer: String(bridge),
    errorFeedback: renderCatalogText(content.bridgeError, values),
    successFeedback: renderCatalogText(content.bridgeSuccess, values)
  }, {
    id: 'result',
    prompt: renderCatalogText(content.resultPrompt, values),
    options: numberOptions(random, answer, [
      { value: answer - 1, misconception: 'Einerfehler im Restschritt' },
      { value: answer + 1, misconception: 'Einerfehler im Restschritt' },
      { value: bridge, misconception: 'Nach dem Zwischenschritt aufgehört' }
    ]),
    correctAnswer: String(answer),
    errorFeedback: renderCatalogText(content.resultError, values),
    successFeedback: renderCatalogText(content.resultSuccess, values)
  }]
}

function symmetryProgressionPhase(difficulty: Difficulty, focus?: string): 1 | 2 | 3 | 4 | 5 {
  const match = focus?.match(/^symmetry-phase-([1-5])$/)
  const requested = match ? Number(match[1]) as 1 | 2 | 3 | 4 | 5 : undefined
  if (requested) {
    const expectedDifficulty = requested === 1 ? 1 : requested === 2 ? 2 : 3
    if (expectedDifficulty === difficulty) return requested
  }
  return difficulty === 1 ? 1 : difficulty === 2 ? 2 : 3
}

function symmetry(seed: number, difficulty: Difficulty, focus?: string): Exercise {
  const random = seededRandom(seed)
  const symmetryContent = getTaskCatalog().symmetry
  const progressionPhase = symmetryProgressionPhase(difficulty, focus)
  const template = pick(random, symmetryContent.templates.filter((candidate) => candidate.progressionPhase === progressionPhase))
  const sourceGrid = template.grid.map((row) => [...row])
  const horizontal = template.axis === 'horizontal'
  const correct = reflectGrid(sourceGrid, template.axis)
  const shift = createShiftDistractor(sourceGrid, template.axis)
  if (!shift) throw new Error(`Symmetrievorlage ${template.id} besitzt keinen gültigen Verschiebungsdistraktor.`)
  const wrongAxis = reflectGrid(sourceGrid, horizontal ? 'vertical' : 'horizontal')
  const values = {
    shape: template.id,
    answer: 'mirror',
    axis: horizontal ? 'waagerechten' : 'senkrechten',
    axisDirection: template.axis,
    axisPosition: template.axisPosition,
    progressionPhase,
    rows: sourceGrid.length,
    columns: sourceGrid[0]?.length ?? 0,
    figureComplexity: template.figureComplexity,
    distractorSimilarity: template.distractorSimilarity
  }
  const options = shuffle(random, [
    { value: 'mirror', label: symmetryContent.optionLabels[0], grid: correct },
    { value: 'shift', label: symmetryContent.optionLabels[1], grid: shift, misconception: 'Spiegelung mit Verschiebung verwechselt' },
    { value: 'wrong-axis', label: symmetryContent.optionLabels[2], grid: wrongAxis, misconception: 'An der falschen Achse gespiegelt' }
  ])
  const guidance = symmetryContent.guidance[template.axisPosition]
  return withMetadata({
    ...base('symmetry', seed, difficulty, values),
    ...contentFor('symmetry', values, difficulty),
    typeId: 'grid-symmetry',
    answerMode: 'symmetry',
    correctAnswer: 'mirror',
    sourceGrid,
    subskillId: `symmetry-phase-${progressionPhase}`,
    symmetry: {
      axis: template.axis,
      axisPosition: template.axisPosition,
      progressionPhase,
      axisLegend: symmetryContent.axisLegend
    },
    hints: [
      { level: 1, text: guidance.hint1 },
      { level: 2, text: guidance.hint2 }
    ],
    successFeedback: guidance.successFeedback,
    errorFeedback: guidance.errorFeedback,
    explanation: guidance.explanation,
    options
  })
}

function addition1000(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  let first: number
  let second: number
  let strategy: string
  if (difficulty === 1) {
    if (random() < 0.5) {
      const hundreds = integer(random, 2, 7)
      second = integer(random, 1, 9 - hundreds) * 100
      first = hundreds * 100
      strategy = `Rechne die Hunderter: ${hundreds} Hunderter plus ${second / 100} Hunderter.`
    } else {
      const hundreds = integer(random, 2, 8)
      const tens = integer(random, 1, 6)
      second = integer(random, 1, 9 - tens) * 10
      first = hundreds * 100 + tens * 10
      strategy = `Rechne die Zehner: ${tens} Zehner plus ${second / 10} Zehner.`
    }
  } else if (difficulty === 2) {
    const ones = integer(random, 6, 9)
    second = integer(random, 11 - ones, 9)
    first = integer(random, 2, 8) * 100 + integer(random, 1, 8) * 10 + ones
    strategy = `Ergänze zuerst ${10 - ones} bis zum nächsten Zehner und addiere dann den Rest.`
  } else {
    const tens = integer(random, 6, 9)
    second = integer(random, 11 - tens, Math.min(9, 15 - tens)) * 10
    first = integer(random, 2, 8) * 100 + tens * 10 + integer(random, 1, 9)
    strategy = `Zerlege ${second} so, dass du zuerst den nächsten Hunderter erreichst.`
  }
  const answer = first + second
  const bridge = difficulty === 2 ? Math.ceil(first / 10) * 10 : difficulty === 3 ? Math.ceil(first / 100) * 100 : answer
  const jumps = difficulty === 1 ? [] : numberLineJumps(bridge === answer ? [first, answer] : [first, bridge, answer])
  const bridgeUnit = difficulty === 3 ? 100 : 10
  const values = { first, second, answer, bridge, strategy }
  return withMetadata({
    ...base('addition-1000', seed, difficulty, values),
    ...contentFor('addition-1000', values, difficulty),
    typeId: 'addition-to-1000',
    subskillId: difficulty === 1 ? 'addition-1000-no-bridge' : difficulty === 2 ? 'addition-1000-ones-bridge' : 'addition-1000-tens-bridge',
    answerMode: difficulty === 1 ? 'number' : 'guided-choice',
    correctAnswer: String(answer),
    steps: difficulty === 1 ? undefined : arithmetic1000Steps(random, values, bridge, answer, bridgeUnit),
    representation: representation('addition-1000', difficulty, difficulty === 1 ? 'place-value' : 'number-line', 'Rechenweg in Teilschritten', {
      start: first, end: answer, jumps,
      hundreds: Math.floor(first / 100), tens: Math.floor(first / 10) % 10, ones: first % 10
    })
  })
}

function writtenAdditionSteps(values: Record<string, number | string>, difficulty: Difficulty): ExerciseStep[] {
  const content = getTaskCatalog().strategySteps.writtenAddition
  const step = (
    id: string,
    prompt: string,
    correctAnswer: number,
    errorFeedback: string,
    successFeedback: string
  ): ExerciseStep => ({
    id,
    interaction: 'number',
    prompt: renderCatalogText(prompt, values),
    correctAnswer: String(correctAnswer),
    errorFeedback: renderCatalogText(errorFeedback, values),
    successFeedback: renderCatalogText(successFeedback, values)
  })
  const steps = [
    step('ones', content.onesPrompt, Number(values.onesResult), content.onesError, content.onesSuccess)
  ]
  if (difficulty === 2) {
    steps.push(step('carry', content.carryPrompt, Number(values.carry), content.carryError, content.carrySuccess))
  }
  steps.push(
    step('tens', content.tensPrompt, Number(values.tensResult), content.tensError, content.tensSuccess),
    step('hundreds', content.hundredsPrompt, Number(values.hundredsResult), content.hundredsError, content.hundredsSuccess)
  )
  return steps
}

function writtenAddition(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  let firstHundreds: number
  let firstTens: number
  let firstOnes: number
  let secondHundreds: number
  let secondTens: number
  let secondOnes: number
  let carryColumn = 'none'

  if (difficulty === 1) {
    firstHundreds = integer(random, 2, 6)
    secondHundreds = integer(random, 1, 9 - firstHundreds)
    firstTens = integer(random, 1, 8)
    secondTens = integer(random, 1, 9 - firstTens)
    firstOnes = integer(random, 1, 8)
    secondOnes = integer(random, 1, 9 - firstOnes)
  } else if (difficulty === 2 || random() < 0.5) {
    carryColumn = 'tens'
    firstHundreds = integer(random, 2, 6)
    secondHundreds = integer(random, 1, 8 - firstHundreds)
    firstTens = integer(random, 0, 7)
    secondTens = integer(random, 0, 8 - firstTens)
    firstOnes = integer(random, 5, 9)
    secondOnes = integer(random, 10 - firstOnes, 9)
  } else {
    carryColumn = 'hundreds'
    firstHundreds = integer(random, 2, 6)
    secondHundreds = integer(random, 1, 8 - firstHundreds)
    firstTens = integer(random, 5, 9)
    secondTens = integer(random, 10 - firstTens, 9)
    firstOnes = integer(random, 0, 8)
    secondOnes = integer(random, 0, 9 - firstOnes)
  }

  const first = firstHundreds * 100 + firstTens * 10 + firstOnes
  const second = secondHundreds * 100 + secondTens * 10 + secondOnes
  const answer = first + second
  const values = {
    first,
    second,
    answer,
    onesResult: answer % 10,
    tensResult: Math.floor(answer / 10) % 10,
    hundredsResult: Math.floor(answer / 100),
    carry: difficulty === 1 ? 0 : 1,
    carryColumn
  }
  return withMetadata({
    ...base('written-addition', seed, difficulty, values),
    ...contentFor('written-addition', values, difficulty),
    typeId: 'written-addition-to-1000',
    subskillId: difficulty === 1
      ? 'written-addition-no-carry'
      : carryColumn === 'tens'
        ? 'written-addition-ones-carry'
        : 'written-addition-tens-carry',
    answerMode: 'guided-number',
    correctAnswer: String(answer),
    steps: writtenAdditionSteps(values, difficulty),
    representation: representation('written-addition', difficulty, 'column-calculation', 'Schriftliche Addition in der Stellenwerttafel', {
      first,
      second,
      operation: '+',
      carry: difficulty === 2 ? 1 : 0,
      carryColumn
    })
  })
}

function subtraction1000(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  let first: number
  let second: number
  let strategy: string
  let bridge: number
  let bridgeUnit: 10 | 100 = 10
  if (difficulty === 1) {
    first = integer(random, 4, 9) * 100
    second = integer(random, 1, Math.floor(first / 100) - 1) * 100
    bridge = first - second
    strategy = `Ziehe ${second / 100} Hunderter von ${first / 100} Hundertern ab.`
  } else if (difficulty === 2) {
    const tens = integer(random, 4, 9)
    second = integer(random, 1, tens) * 10
    first = integer(random, 3, 9) * 100 + tens * 10 + integer(random, 0, 9)
    bridge = first - second
    strategy = `Verändere nur die Zehner: ${tens} Zehner minus ${second / 10} Zehner.`
  } else {
    if (random() < 0.5) {
      const ones = integer(random, 1, 8)
      first = integer(random, 3, 9) * 100 + integer(random, 1, 8) * 10 + ones
      second = integer(random, ones + 1, Math.min(9, ones + 5))
      bridge = Math.floor(first / 10) * 10
      strategy = `Gehe zuerst ${first - bridge} bis ${bridge} zurück und ziehe dann den Rest ab.`
    } else {
      const tens = integer(random, 1, 5)
      first = integer(random, 3, 9) * 100 + tens * 10
      second = integer(random, tens + 1, Math.min(9, tens + 4)) * 10
      bridge = Math.floor(first / 100) * 100
      bridgeUnit = 100
      strategy = `Gehe zuerst ${first - bridge} bis ${bridge} zurück und ziehe dann den Rest ab.`
    }
  }
  const answer = first - second
  const jumps = difficulty === 1 ? [] : numberLineJumps(bridge === answer ? [first, answer] : [first, bridge, answer])
  const values = { first, second, answer, bridge, strategy }
  return withMetadata({
    ...base('subtraction-1000', seed, difficulty, values),
    ...contentFor('subtraction-1000', values, difficulty),
    typeId: 'subtraction-to-1000',
    subskillId: difficulty === 1 ? 'subtraction-1000-hundreds' : difficulty === 2 ? 'subtraction-1000-no-unbundling' : bridgeUnit === 10 ? 'subtraction-1000-ones-unbundling' : 'subtraction-1000-tens-unbundling',
    answerMode: difficulty === 3 ? 'guided-choice' : 'number',
    correctAnswer: String(answer),
    steps: difficulty === 3 ? arithmetic1000Steps(random, values, bridge, answer, bridgeUnit) : undefined,
    representation: representation('subtraction-1000', difficulty, difficulty === 1 ? 'place-value' : 'number-line', 'Rechenweg in Teilschritten', {
      start: first, end: answer, jumps,
      hundreds: Math.floor(first / 100), tens: Math.floor(first / 10) % 10, ones: first % 10
    })
  })
}

function writtenSubtractionSteps(values: Record<string, number | string>, difficulty: Difficulty): ExerciseStep[] {
  const content = getTaskCatalog().strategySteps.writtenSubtraction
  const step = (
    id: string,
    prompt: string,
    correctAnswer: number,
    errorFeedback: string,
    successFeedback: string
  ): ExerciseStep => ({
    id,
    interaction: 'number',
    prompt: renderCatalogText(prompt, values),
    correctAnswer: String(correctAnswer),
    errorFeedback: renderCatalogText(errorFeedback, values),
    successFeedback: renderCatalogText(successFeedback, values)
  })
  const steps: ExerciseStep[] = []
  if (difficulty === 2) {
    steps.push(step('unbundle', content.unbundlePrompt, 1, content.unbundleError, content.unbundleSuccess))
  }
  steps.push(
    step('ones', content.onesPrompt, Number(values.onesResult), content.onesError, content.onesSuccess),
    step('tens', content.tensPrompt, Number(values.tensResult), content.tensError, content.tensSuccess),
    step('hundreds', content.hundredsPrompt, Number(values.hundredsResult), content.hundredsError, content.hundredsSuccess)
  )
  if (difficulty === 3) {
    steps.push(step('check', content.checkPrompt, Number(values.first), content.checkError, content.checkSuccess))
  }
  return steps
}

function writtenSubtraction(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  let firstHundreds: number
  let firstTens: number
  let firstOnes: number
  let secondHundreds: number
  let secondTens: number
  let secondOnes: number
  let unbundleFrom: 'none' | 'tens' | 'hundreds' = 'none'

  if (difficulty === 1) {
    firstHundreds = integer(random, 4, 9)
    secondHundreds = integer(random, 1, firstHundreds - 1)
    firstTens = integer(random, 1, 9)
    secondTens = integer(random, 0, firstTens)
    firstOnes = integer(random, 1, 9)
    secondOnes = integer(random, 0, firstOnes)
  } else if (difficulty === 2 || random() < 0.5) {
    unbundleFrom = 'tens'
    firstHundreds = integer(random, 4, 9)
    secondHundreds = integer(random, 1, firstHundreds - 1)
    firstTens = integer(random, 2, 9)
    secondTens = integer(random, 0, firstTens - 1)
    firstOnes = integer(random, 0, 7)
    secondOnes = integer(random, firstOnes + 1, 9)
  } else {
    unbundleFrom = 'hundreds'
    firstHundreds = integer(random, 3, 9)
    secondHundreds = integer(random, 1, firstHundreds - 2)
    firstTens = integer(random, 0, 7)
    secondTens = integer(random, firstTens + 1, 9)
    firstOnes = integer(random, 1, 9)
    secondOnes = integer(random, 0, firstOnes)
  }

  const first = firstHundreds * 100 + firstTens * 10 + firstOnes
  const second = secondHundreds * 100 + secondTens * 10 + secondOnes
  const answer = first - second
  const values = {
    first,
    second,
    answer,
    onesResult: answer % 10,
    tensResult: Math.floor(answer / 10) % 10,
    hundredsResult: Math.floor(answer / 100),
    unbundle: difficulty === 1 ? 0 : 1,
    unbundleFrom
  }
  return withMetadata({
    ...base('written-subtraction', seed, difficulty, values),
    ...contentFor('written-subtraction', values, difficulty),
    typeId: 'written-subtraction-to-1000',
    subskillId: difficulty === 1
      ? 'written-subtraction-no-unbundling'
      : unbundleFrom === 'tens'
        ? 'written-subtraction-ones-unbundling'
        : 'written-subtraction-tens-unbundling',
    answerMode: 'guided-number',
    correctAnswer: String(answer),
    steps: writtenSubtractionSteps(values, difficulty),
    representation: representation('written-subtraction', difficulty, 'column-calculation', 'Schriftliche Subtraktion in der Stellenwerttafel', {
      first,
      second,
      operation: '−',
      unbundle: difficulty === 1 ? 0 : 1,
      unbundleFrom
    })
  })
}

function complement1000(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  const targetUnit = difficulty === 1 ? 10 : 100
  const target = difficulty === 1 ? integer(random, 12, 90) * 10 : integer(random, 2, 10) * 100
  const gap = difficulty === 1 ? integer(random, 1, 9) : difficulty === 2 ? integer(random, 11, 59) : integer(random, 11, 79)
  const first = target - gap
  const answer = target - first
  const nextTen = Math.ceil(first / 10) * 10
  const jumps = nextTen > first && nextTen < target ? numberLineJumps([first, nextTen, target]) : numberLineJumps([first, target])
  const strategy = difficulty === 3
    ? `Ergänze erst ${nextTen - first} bis ${nextTen} und dann ${target - nextTen} bis ${target}.`
    : `Der Abstand von ${first} bis ${target} ist ${answer}.`
  const values = { first, target, answer, strategy }
  return withMetadata({
    ...base('complement-1000', seed, difficulty, values),
    ...contentFor('complement-1000', values, difficulty),
    typeId: 'complement-to-full-number',
    subskillId: targetUnit === 10 ? 'complement-next-ten' : 'complement-next-hundred',
    answerMode: 'number',
    correctAnswer: String(answer),
    representation: representation('complement-1000', difficulty, 'number-line', 'Ergänzen auf dem Rechenstrich', { start: first, end: target, jumps })
  })
}

export function formatEuro(cents: number): string {
  if (!Number.isInteger(cents) || cents < 0) throw new RangeError('Geldbeträge müssen nichtnegative ganze Centbeträge sein.')
  return `${Math.floor(cents / 100)},${String(cents % 100).padStart(2, '0')} €`
}

function moneyDenominations(cents: number): number[] {
  const denominations = [200, 100, 50, 20, 10]
  const result: number[] = []
  let remaining = cents
  for (const denomination of denominations) {
    while (remaining >= denomination) {
      result.push(denomination)
      remaining -= denomination
    }
  }
  if (remaining !== 0) throw new Error(`Betrag ${cents} kann mit den freigegebenen Münzen nicht dargestellt werden.`)
  return result
}

function money(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  const content = getTaskCatalog().quantityContent.money
  let amountCents: number
  let paidCents = 0
  let priceCents = 0
  let taskPrompt: string
  let quantityExplanation: string
  let strategy: string
  let coins: number[]
  let subskillId: string
  if (difficulty === 1) {
    amountCents = integer(random, 2, 10) * 100
    coins = moneyDenominations(amountCents)
    taskPrompt = content.countPrompt
    quantityExplanation = renderCatalogText(content.countExplanation, { amount: formatEuro(amountCents) })
    strategy = 'Zähle zuerst die 2-Euro-Münzen und danach die 1-Euro-Münzen.'
    subskillId = 'money-whole-euros'
  } else if (difficulty === 2) {
    amountCents = integer(random, 12, 98) * 10
    coins = moneyDenominations(amountCents)
    taskPrompt = content.countPrompt
    quantityExplanation = renderCatalogText(content.countExplanation, { amount: formatEuro(amountCents) })
    strategy = 'Zähle Euro und Cent getrennt. 100 Cent ergeben 1 Euro.'
    subskillId = 'money-euro-cent'
  } else {
    paidCents = 1000
    priceCents = integer(random, 25, 90) * 10
    amountCents = paidCents - priceCents
    coins = moneyDenominations(paidCents)
    taskPrompt = renderCatalogText(content.changePrompt, { price: formatEuro(priceCents), paid: formatEuro(paidCents) })
    quantityExplanation = renderCatalogText(content.changeExplanation, { price: formatEuro(priceCents), paid: formatEuro(paidCents), change: formatEuro(amountCents) })
    strategy = 'Ergänze den Preis zuerst bis zum nächsten vollen Euro und dann bis 10 Euro.'
    subskillId = 'money-change'
  }
  const values = {
    amountCents,
    priceCents,
    paidCents,
    taskPrompt,
    quantityExplanation,
    strategy,
    amount: formatEuro(amountCents),
    price: formatEuro(priceCents),
    paid: formatEuro(paidCents),
    change: formatEuro(amountCents)
  }
  const options = numberOptions(random, amountCents, [
    { value: amountCents - 10, misconception: 'Centbetrag um 10 zu klein gelesen' },
    { value: amountCents + 10, misconception: 'Centbetrag um 10 zu groß gelesen' },
    { value: amountCents - 100, misconception: 'Einen Euro zu wenig berücksichtigt' },
    { value: amountCents + 100, misconception: 'Einen Euro zu viel berücksichtigt' },
    { value: priceCents, misconception: 'Preis und Rückgeld verwechselt' }
  ]).map((option) => ({ ...option, label: formatEuro(Number(option.value)) }))
  return withMetadata({
    ...base('money', seed, difficulty, values),
    ...contentFor('money', values, difficulty),
    typeId: difficulty === 3 ? 'money-change' : 'money-count',
    subskillId,
    answerMode: 'choice',
    correctAnswer: String(amountCents),
    options,
    representation: representation('money', difficulty, 'money', content.coinsLabel, {
      coins,
      displayedCents: paidCents || amountCents,
      priceCents,
      paidCents,
      priceLabel: content.priceLabel,
      paidLabel: content.paidLabel
    })
  })
}

export function formatLength(centimeters: number): string {
  if (!Number.isInteger(centimeters) || centimeters < 0) throw new RangeError('Längen müssen nichtnegative ganze Zentimeterwerte sein.')
  if (centimeters >= 100 && centimeters % 100 === 0) return `${centimeters / 100} m`
  if (centimeters >= 100) return `${Math.floor(centimeters / 100)} m ${centimeters % 100} cm`
  return `${centimeters} cm`
}

function lengths(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  const content = getTaskCatalog().quantityContent.lengths
  let answerCm: number
  let correctAnswer: string
  let options: AnswerOption[]
  let taskPrompt: string
  let quantityExplanation: string
  let strategy: string
  let subskillId: string
  let representationValues: ExerciseRepresentation['values']
  if (difficulty === 1) {
    answerCm = integer(random, 2, 20)
    correctAnswer = `${answerCm} cm`
    taskPrompt = content.readPrompt
    quantityExplanation = renderCatalogText(content.readExplanation, { length: correctAnswer })
    strategy = 'Beginne am Nullpunkt und zähle die gleich großen Zentimeterabschnitte.'
    subskillId = 'length-read-centimeters'
    representationValues = { lengthCm: answerCm, maxCm: 20 }
    options = textOptions(random, correctAnswer, [
      { value: `${answerCm - 1} cm`, misconception: 'Nullpunkt als ersten Zentimeter mitgezählt' },
      { value: `${answerCm + 1} cm`, misconception: 'Einen Skalenabschnitt zu weit gezählt' },
      { value: `${answerCm * 10} cm`, misconception: 'Skalenteilung mit Zehnerschritten verwechselt' }
    ])
  } else if (difficulty === 2) {
    const meters = integer(random, 1, 9)
    answerCm = meters * 100
    const toCentimeters = random() < 0.5
    correctAnswer = toCentimeters ? `${answerCm} cm` : `${meters} m`
    taskPrompt = renderCatalogText(toCentimeters ? content.toCentimetersPrompt : content.toMetersPrompt, {
      length: toCentimeters ? `${meters} m` : `${answerCm} cm`
    })
    quantityExplanation = renderCatalogText(content.conversionExplanation, { length: correctAnswer })
    strategy = 'Nutze die Beziehung 1 m = 100 cm.'
    subskillId = toCentimeters ? 'length-m-to-cm' : 'length-cm-to-m'
    representationValues = { lengthCm: 100, maxCm: 100, equivalence: content.equivalenceLabel }
    options = textOptions(random, correctAnswer, toCentimeters ? [
      { value: `${meters * 10} cm`, misconception: 'Mit 10 statt mit 100 umgerechnet' },
      { value: `${meters} cm`, misconception: 'Maßzahl ohne Einheitenumrechnung übernommen' }
    ] : [
      { value: `${answerCm / 10} m`, misconception: 'Durch 10 statt durch 100 geteilt' },
      { value: `${answerCm} m`, misconception: 'Maßzahl ohne Einheitenumrechnung übernommen' }
    ])
  } else {
    const additionTask = random() < 0.5
    const firstCm = additionTask ? integer(random, 12, 65) * 10 : integer(random, 25, 90) * 10
    const secondCm = additionTask ? integer(random, 2, Math.min(25, 90 - firstCm / 10)) * 10 : integer(random, 2, firstCm / 10 - 5) * 10
    answerCm = additionTask ? firstCm + secondCm : firstCm - secondCm
    correctAnswer = formatLength(answerCm)
    const operation = additionTask ? '+' : '−'
    taskPrompt = renderCatalogText(content.calculationPrompt, { firstLength: formatLength(firstCm), secondLength: formatLength(secondCm), operation })
    quantityExplanation = renderCatalogText(content.calculationExplanation, { firstLength: formatLength(firstCm), secondLength: formatLength(secondCm), answerLength: correctAnswer, operation })
    strategy = additionTask ? 'Rechne beide Längen in Zentimetern zusammen.' : 'Ziehe die kleinere Zentimeterlänge von der größeren ab.'
    subskillId = additionTask ? 'length-add' : 'length-difference'
    representationValues = { lengthCm: firstCm, secondLengthCm: secondCm, maxCm: 1000, operation }
    options = textOptions(random, correctAnswer, [
      { value: formatLength(Math.max(0, answerCm - 10)), misconception: 'Zehn Zentimeter zu wenig gerechnet' },
      { value: formatLength(answerCm + 10), misconception: 'Zehn Zentimeter zu viel gerechnet' },
      { value: formatLength(additionTask ? Math.abs(firstCm - secondCm) : firstCm + secondCm), misconception: 'Rechenart vertauscht' }
    ])
  }
  const values = { answerCm, taskPrompt, quantityExplanation, strategy, answerLength: correctAnswer }
  return withMetadata({
    ...base('lengths', seed, difficulty, values),
    ...contentFor('lengths', values, difficulty),
    typeId: difficulty === 1 ? 'length-read' : difficulty === 2 ? 'length-convert' : 'length-calculate',
    subskillId,
    answerMode: 'choice',
    correctAnswer,
    options,
    representation: representation('lengths', difficulty, 'length', content.rulerLabel, representationValues)
  })
}

function bodyViews(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  const content = getTaskCatalog().spatialViews
  const candidates = content.templates.filter((template) => template.difficulty === difficulty)
  if (candidates.length === 0) throw new Error(`Keine Körperansicht-Vorlage für Stufe ${difficulty}.`)
  const template = pick(random, candidates)
  const directions: CubeViewDirection[] = difficulty === 1 ? ['front'] : difficulty === 2 ? ['front', 'right'] : ['front', 'right', 'top']
  const direction = pick(random, directions)
  const correct = projectCubeView(template, direction)
  const distractors = createCubeViewDistractors(correct, direction)
  const viewLabel = content.directionLabels[direction]
  const values = { viewLabel, direction, cubes: cubeCount(template), templateId: template.id }
  const shuffled = shuffle<{ grid: number[][]; misconception?: string }>(random, [
    { grid: correct, misconception: undefined },
    ...distractors.map((candidate) => ({ grid: candidate.grid, misconception: candidate.misconception }))
  ])
  const options = shuffled.map((candidate, index): AnswerOption => ({
    value: cubeViewKey(candidate.grid),
    label: content.optionLabels[index]!,
    misconception: candidate.misconception,
    representation: {
      kind: 'cube-view',
      visibility: 'always',
      label: `${content.optionLabels[index]}: ${viewLabel}`,
      values: { rows: candidate.grid.length, columns: candidate.grid[0]!.length, cells: candidate.grid.flat() }
    }
  }))
  const skillContent = contentFor('body-views', values, difficulty)
  return withMetadata({
    ...base('body-views', seed, difficulty, values),
    ...skillContent,
    prompt: renderCatalogText(content.prompt, values),
    typeId: 'cube-building-view',
    subskillId: `body-view-${direction}`,
    answerMode: 'choice',
    correctAnswer: cubeViewKey(correct),
    options,
    representation: {
      kind: 'cube-building',
      visibility: 'always',
      label: `${cubeCount(template)} Würfel. Vorne und rechts sind markiert.`,
      values: { width: template.width, depth: template.depth, heights: template.heights }
    },
    explanation: `${content.directionGuidance[direction]} ${skillContent.explanation}`
  })
}

export function generateExercise(skillId: SkillId, seed: number, difficulty: Difficulty = 1, focus?: string): Exercise {
  switch (skillId) {
    case 'addition': return addition(seed, difficulty, focus)
    case 'subtraction': return subtraction(seed, difficulty, focus)
    case 'multiplication': return multiplication(seed, difficulty, focus)
    case 'division': return division(seed, difficulty, focus)
    case 'place-value': return placeValue(seed, difficulty)
    case 'decompose': return decompose(seed, difficulty)
    case 'compose': return compose(seed, difficulty)
    case 'neighbor-tens': return neighbors(seed, difficulty, 10)
    case 'neighbor-hundreds': return neighbors(seed, difficulty, 100)
    case 'round-tens': return rounding(seed, difficulty, 10)
    case 'round-hundreds': return rounding(seed, difficulty, 100)
    case 'addition-1000': return addition1000(seed, difficulty)
    case 'written-addition': return writtenAddition(seed, difficulty)
    case 'subtraction-1000': return subtraction1000(seed, difficulty)
    case 'written-subtraction': return writtenSubtraction(seed, difficulty)
    case 'complement-1000': return complement1000(seed, difficulty)
    case 'money': return money(seed, difficulty)
    case 'lengths': return lengths(seed, difficulty)
    case 'word-problem': return wordProblem(seed, difficulty)
    case 'symmetry': return symmetry(seed, difficulty, focus)
    case 'body-views': return bodyViews(seed, difficulty)
  }
}

export function isAnswerCorrect(exercise: Exercise, answer: string): boolean {
  return answer.trim() === exercise.correctAnswer
}

export function isStepAnswerCorrect(step: ExerciseStep, answer: string): boolean {
  return answer === step.correctAnswer
}

export { flipGrid, mirrorGrid, reflectGrid }
