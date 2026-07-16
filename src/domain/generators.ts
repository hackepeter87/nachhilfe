import { integer, pick, seededRandom, shuffle } from './random'
import type { AnswerOption, Difficulty, Exercise, ExerciseRepresentation, ExerciseStep, SkillId } from './types'
import { getSkillContent, getTaskCatalog, renderCatalogText } from '../content/catalog'

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
        ...(exercise.steps?.flatMap((step) => step.options) ?? [])
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

function wordProblem(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  const catalog = getTaskCatalog()
  const template = pick(random, catalog.wordProblems.filter((candidate) => candidate.minDifficulty <= difficulty))
  const stepsContent = catalog.wordProblemSteps
  const first = integer(random, template.firstRange.min, template.firstRange.max)
  const secondMax = template.operation === '−' ? Math.min(template.secondRange.max, first - 1) : template.secondRange.max
  const second = integer(random, template.secondRange.min, secondMax)
  const total = template.relationship === 'sharing' ? first * second : 0
  const result = template.operation === '+' ? first + second : template.operation === '−' ? first - second : template.operation === ':' ? second : first * second
  const irrelevant = difficulty === 3 ? (template.irrelevant ?? '') : ''
  const templateValues = { first, second, total, result, irrelevant }
  const story = renderCatalogText(template.story, templateValues)
    .replace(/\s+/g, ' ')
    .replace(/\s+([?.!,])/g, '$1')
    .trim()
  const question = renderCatalogText(template.question, templateValues)
  const relevant = renderCatalogText(template.relevant, templateValues)
  const answerSentence = renderCatalogText(template.answer, templateValues)
  const operationHint = template.operationHint
  const values = { first, second, total, result, operation: template.operation, story, answerSentence, operationHint, question, irrelevant, relationship: template.relationshipLabel, templateId: template.id }
  const steps: ExerciseStep[] = []
  if (difficulty >= 2) {
    steps.push({
      id: 'question',
      prompt: renderCatalogText(stepsContent.questionPrompt, values),
      options: textOptions(random, question, template.questionDistractors.map((text) => ({
        value: renderCatalogText(text, values), misconception: 'Nebendetail statt gesuchter Menge'
      }))),
      correctAnswer: question,
      errorFeedback: stepsContent.questionError,
      successFeedback: stepsContent.questionSuccess
    })
  }
  steps.push({
      id: 'relevant',
      prompt: renderCatalogText(stepsContent.relevantPrompt, values),
      options: textOptions(random, relevant, stepsContent.relevantDistractors.map((text) => ({
        value: renderCatalogText(text, values), misconception: 'Nur eine Zahl oder keine Beziehung beachtet'
      }))),
      correctAnswer: relevant,
      errorFeedback: renderCatalogText(stepsContent.relevantError, values),
      successFeedback: renderCatalogText(stepsContent.relevantSuccess, values)
    },
    {
      id: 'relationship',
      prompt: stepsContent.relationshipPrompt,
      options: textOptions(random, template.relationshipLabel, template.relationshipDistractors.map((label) => ({
        value: label, misconception: 'Andere Mengenbeziehung gewählt'
      }))),
      correctAnswer: template.relationshipLabel,
      errorFeedback: stepsContent.relationshipError,
      successFeedback: stepsContent.relationshipSuccess
    },
    {
      id: 'operation',
      prompt: renderCatalogText(stepsContent.operationPrompt, values),
      options: stepsContent.operationOptions,
      correctAnswer: template.operation,
      errorFeedback: template.operationError,
      successFeedback: stepsContent.operationSuccess
    })
  if (difficulty >= 2) {
    const correctModel = template.representation === 'bar-model' ? stepsContent.barModelLabel : stepsContent.groupsLabel
    const otherModel = template.representation === 'bar-model' ? stepsContent.groupsLabel : stepsContent.barModelLabel
    steps.push({
      id: 'representation',
      prompt: stepsContent.representationPrompt,
      options: textOptions(random, correctModel, [
        { value: otherModel, misconception: 'Darstellung passt nicht zur Mengenbeziehung' },
        { value: stepsContent.noModelLabel, misconception: 'Zahlen ohne sichtbare Beziehung' }
      ]),
      correctAnswer: correctModel,
      errorFeedback: stepsContent.representationError,
      successFeedback: stepsContent.representationSuccess
    })
  }
  steps.push({
      id: 'calculate',
      prompt: renderCatalogText(stepsContent.calculatePrompt, values),
      options: numberOptions(random, result, [
        { value: Math.max(0, result - 1), misconception: 'Rechenfehler um eins' },
        { value: result + 1, misconception: 'Rechenfehler um eins' },
        { value: template.operation === '−' ? first + second : Math.abs(first - second), misconception: 'Unpassende Rechenart verwendet' }
      ]),
      correctAnswer: String(result),
      errorFeedback: stepsContent.calculateError,
      successFeedback: stepsContent.calculateSuccess
    },
    {
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
  const barValues = template.operation === '−'
    ? { first: result, second, total: first }
    : template.operation === ':'
      ? { first: result, second: first, total }
      : { first, second, total: result }
  return withMetadata({
    ...base('word-problem', seed, difficulty, values),
    ...contentFor('word-problem', values, difficulty),
    typeId: 'guided-word-problem',
    subskillId: `word-${template.relationship}`,
    answerMode: 'guided-word',
    correctAnswer: answerSentence,
    steps,
    representation: representation('word-problem', difficulty, template.representation, template.representation === 'bar-model' ? 'Balkenmodell' : 'Gleich große Gruppen', {
      ...barValues, question: 'Welche Menge wird gesucht?', groups: first, size: second, relation: template.relationship
    })
  })
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
  const template = pick(random, symmetryContent.templates.filter((candidate) => candidate.difficulty === difficulty))
  const sourceGrid = template.grid.map((row) => [...row])
  const horizontal = template.axis === 'horizontal'
  const correct = horizontal ? flipGrid(sourceGrid) : mirrorGrid(sourceGrid)
  const values = { shape: template.id, answer: 'mirror', axis: horizontal ? 'waagerechten' : 'senkrechten' }
  const options = shuffle(random, [
    { value: 'mirror', label: symmetryContent.optionLabels[0], grid: correct },
    { value: 'shift', label: symmetryContent.optionLabels[1], grid: template.shiftGrid, misconception: 'Spiegelung mit Verschiebung verwechselt' },
    { value: 'wrong-axis', label: symmetryContent.optionLabels[2], grid: template.wrongAxisGrid, misconception: 'An der falschen Achse gespiegelt' }
  ])
  return withMetadata({
    ...base('symmetry', seed, difficulty, values),
    ...contentFor('symmetry', values, difficulty),
    typeId: 'grid-symmetry',
    answerMode: 'symmetry',
    correctAnswer: 'mirror',
    sourceGrid,
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
    second = integer(random, 10 - ones, 9)
    first = integer(random, 2, 8) * 100 + integer(random, 1, 8) * 10 + ones
    strategy = `Ergänze zuerst ${10 - ones} bis zum nächsten Zehner und addiere dann den Rest.`
  } else {
    const tens = integer(random, 6, 9)
    second = integer(random, 10 - tens, Math.min(9, 15 - tens)) * 10
    first = integer(random, 2, 8) * 100 + tens * 10 + integer(random, 1, 9)
    strategy = `Zerlege ${second} so, dass du zuerst den nächsten Hunderter erreichst.`
  }
  const answer = first + second
  const bridge = difficulty === 2 ? Math.ceil(first / 10) * 10 : difficulty === 3 ? Math.ceil(first / 100) * 100 : answer
  const jumps = difficulty === 1 ? [] : numberLineJumps(bridge === answer ? [first, answer] : [first, bridge, answer])
  const values = { first, second, answer, strategy }
  return withMetadata({
    ...base('addition-1000', seed, difficulty, values),
    ...contentFor('addition-1000', values, difficulty),
    typeId: 'addition-to-1000',
    subskillId: difficulty === 1 ? 'addition-1000-no-bridge' : difficulty === 2 ? 'addition-1000-ones-bridge' : 'addition-1000-tens-bridge',
    answerMode: 'number',
    correctAnswer: String(answer),
    representation: representation('addition-1000', difficulty, difficulty === 1 ? 'place-value' : 'number-line', 'Rechenweg in Teilschritten', {
      start: first, end: answer, jumps,
      hundreds: Math.floor(first / 100), tens: Math.floor(first / 10) % 10, ones: first % 10
    })
  })
}

function subtraction1000(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  let first: number
  let second: number
  let strategy: string
  if (difficulty === 1) {
    first = integer(random, 4, 9) * 100
    second = integer(random, 1, Math.floor(first / 100) - 1) * 100
    strategy = `Ziehe ${second / 100} Hunderter von ${first / 100} Hundertern ab.`
  } else if (difficulty === 2) {
    const tens = integer(random, 4, 9)
    second = integer(random, 1, tens) * 10
    first = integer(random, 3, 9) * 100 + tens * 10 + integer(random, 0, 9)
    strategy = `Verändere nur die Zehner: ${tens} Zehner minus ${second / 10} Zehner.`
  } else {
    first = integer(random, 4, 9) * 100
    second = integer(random, 2, 9) * 10
    strategy = `Gehe von ${first} zuerst ${second} Schritte auf dem Rechenstrich zurück.`
  }
  const answer = first - second
  const firstJump = difficulty === 3 && second > 50 ? first - 50 : answer
  const jumps = difficulty === 1 ? [] : numberLineJumps(firstJump === answer ? [first, answer] : [first, firstJump, answer])
  const values = { first, second, answer, strategy }
  return withMetadata({
    ...base('subtraction-1000', seed, difficulty, values),
    ...contentFor('subtraction-1000', values, difficulty),
    typeId: 'subtraction-to-1000',
    subskillId: difficulty === 1 ? 'subtraction-1000-hundreds' : difficulty === 2 ? 'subtraction-1000-no-unbundling' : 'subtraction-1000-from-hundred',
    answerMode: 'number',
    correctAnswer: String(answer),
    representation: representation('subtraction-1000', difficulty, difficulty === 1 ? 'place-value' : 'number-line', 'Rechenweg in Teilschritten', {
      start: first, end: answer, jumps,
      hundreds: Math.floor(first / 100), tens: Math.floor(first / 10) % 10, ones: first % 10
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
    case 'subtraction-1000': return subtraction1000(seed, difficulty)
    case 'complement-1000': return complement1000(seed, difficulty)
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
