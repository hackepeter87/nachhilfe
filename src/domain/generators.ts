import { integer, pick, seededRandom, shuffle } from './random'
import type { AnswerOption, Difficulty, Exercise, ExerciseRepresentation, ExerciseStep, LearningPhase, SkillId } from './types'
import { getLearningPhaseModel, getSkillContent, getTaskCatalog, renderCatalogText, WORD_MODEL_UNKNOWN_QUANTITY } from '../content/catalog'
import type { WordModelType } from '../content/catalog'
import { createShiftDistractor, flipGrid, mirrorGrid, reflectGrid } from './symmetry'
import {
  createCubeRotationDistractors,
  createCubeViewDistractors,
  cubeBuildingKey,
  cubeCount,
  cubeViewKey,
  projectCubeView,
  rotateCubeBuilding,
  type CubeTurnDirection,
  type CubeViewDirection
} from './cubeViews'
import { createFoldingOutcomes, foldingCellsKey, type FoldingTemplate } from './folding'
import { createDataDistractors, sameDataValues, varyDataValues, type DataDisplayType, type DataSetTemplate } from './dataDisplays'
import { classifyEvent, combinationCount, compareEventFrequency, type CombinationTemplate, type ProbabilityTemplate } from './chance'
import { areaInUnitSquares, perimeterInUnitEdges } from './planeGeometry'

export function getSkillLabel(skillId: SkillId): string {
  return getSkillContent(skillId).label
}

const base = (skillId: SkillId, seed: number, difficulty: Difficulty, values: Record<string, number | string>) => ({
  id: `${skillId}-${seed}`,
  skillId,
  difficulty,
  learningPhase: getSkillContent(skillId).difficultyLevels[difficulty - 1].learningPhase,
  learningAction: getLearningPhaseModel(getSkillContent(skillId).difficultyLevels[difficulty - 1].learningPhase).learningAction,
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
  misconceptionId?: string
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
      misconception: candidate.misconception,
      misconceptionId: candidate.misconceptionId
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
    ...distinct.slice(0, 2).map((candidate) => ({ value: candidate.value, label: candidate.value, misconception: candidate.misconception, misconceptionId: candidate.misconceptionId }))
  ])
}

function representation(
  skillId: SkillId,
  difficulty: Difficulty,
  kind: ExerciseRepresentation['kind'],
  label: string,
  values: ExerciseRepresentation['values'],
  unknownValues: string[] = []
): ExerciseRepresentation {
  const visibility = getSkillContent(skillId).difficultyLevels[difficulty - 1].representation
  return {
    kind,
    visibility: visibility === 'none' ? 'scaffold' : visibility,
    label,
    values,
    valueRoles: {
      knownValues: Object.keys(values).filter((key) => !unknownValues.includes(key)),
      unknownValues,
      revealedValues: []
    }
  }
}

function optionId(value: string, index: number): string {
  const normalized = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return normalized ? `${normalized}-${index + 1}` : `option-${index + 1}`
}

function normalizeOptions(exercise: Exercise, options: AnswerOption[] | undefined, correctAnswer: string, scope: string): AnswerOption[] | undefined {
  if (!options) return undefined
  const routes = getSkillContent(exercise.skillId).misconceptionFeedback ?? []
  return options.map((option, index) => {
    const route = routes.find((candidate) => candidate.id === option.misconceptionId || candidate.misconception === option.misconception)
    return {
      ...option,
      id: option.id ?? `${scope}-${optionId(option.value, index)}`,
      correct: option.value === correctAnswer,
      misconceptionId: option.misconceptionId ?? route?.id,
      misconceptionFeedback: option.misconceptionFeedback ?? route?.feedback
    }
  })
}

function withMetadata(exercise: Exercise): Exercise {
  const options = normalizeOptions(exercise, exercise.options, exercise.correctAnswer, exercise.typeId)
  const steps = exercise.steps?.map((step) => ({
    ...step,
    options: normalizeOptions(exercise, step.options, step.correctAnswer, `${exercise.typeId}-${step.id}`)
  }))
  return {
    ...exercise,
    options,
    steps,
    testMetadata: {
      ...exercise.testMetadata,
      representation: exercise.representation?.kind ?? 'none',
      distractorSources: [
        ...(options ?? []),
        ...(steps?.flatMap((step) => step.options ?? []) ?? [])
      ].filter((option) => option.misconception).map((option) => option.misconception!)
    }
  }
}

function addition(seed: number, difficulty: Difficulty, focus?: string, phase?: LearningPhase): Exercise {
  const random = seededRandom(seed)
  const conceptPhase = phase === 'activate' || phase === 'understand'
  const bridge = conceptPhase || (difficulty > 1 && (focus === 'addition-bridge-10' || difficulty > 1))
  const first = bridge ? integer(random, difficulty === 3 ? 7 : 6, 9) : integer(random, 1, 8)
  let second = bridge
    ? integer(random, 11 - first, Math.min(difficulty === 3 ? 20 - first : 18 - first, 9))
    : integer(random, 1, 10 - first)
  if (phase === 'transfer' && second === first) second = second > 2 ? second - 1 : second + 1
  const answer = first + second
  const toTen = Math.min(second, 10 - first)
  const rest = second - toTen
  const values = { first, second, answer, toTen, rest }
  const shared = { ...base('addition', seed, difficulty, values), ...contentFor('addition', values, difficulty) }
  if (phase === 'activate') {
    const missing = 10 - first
    return withMetadata({
      ...shared,
      typeId: 'addition-activate-complement-to-ten', subskillId: 'addition-complement-10',
      prompt: `Welche Zahl ergänzt ${first} bis 10?`, answerMode: 'choice', correctAnswer: String(missing),
      options: numberOptions(random, missing, [
        { value: Math.max(0, missing - 1), misconception: 'Beim Ergänzen wird ein Punkt ausgelassen', misconceptionId: 'addition-bridge-step' },
        { value: missing + 1, misconception: 'Beim Ergänzen wird ein Punkt zu viel gezählt', misconceptionId: 'addition-bridge-step' },
        { value: first, misconception: 'Die bekannte Menge wird als Ergänzung übernommen', misconceptionId: 'addition-operation-reversal' }
      ]),
      representation: representation('addition', difficulty, 'ten-frame', 'Ergänzen zur Zehn', { first, second: missing }, ['second'])
    })
  }
  if (phase === 'understand') {
    const split = `${toTen} und ${rest}`
    return withMetadata({
      ...shared,
      typeId: 'addition-understand-bridge', subskillId: 'addition-bridge-10',
      prompt: `Wie zerlegst du ${second}, damit du von ${first} zuerst bis 10 kommst?`, answerMode: 'choice', correctAnswer: split,
      options: textOptions(random, split, [
        { value: `${Math.max(0, toTen - 1)} und ${rest + 1}`, misconception: 'Der erste Teil ergänzt nicht genau bis 10', misconceptionId: 'addition-bridge-step' },
        { value: `${rest} und ${toTen}`, misconception: 'Die Zerlegung wird in unpassender Reihenfolge genutzt', misconceptionId: 'addition-bridge-step' },
        { value: `${toTen} und ${Math.max(0, rest - 1)}`, misconception: 'Die Teile ergeben nicht den zweiten Summanden', misconceptionId: 'addition-bridge-step' }
      ]),
      representation: representation('addition', difficulty, 'ten-frame', 'Zwei bekannte Mengen in Zehnerfeldern', { first, second })
    })
  }
  if (phase === 'transfer') {
    const correct = `${second} + ${first} = ${answer}`
    return withMetadata({
      ...shared,
      typeId: 'addition-transfer-commutative', subskillId: bridge ? 'addition-bridge-10' : 'addition-within-10',
      prompt: `Welche Tauschaufgabe hat dasselbe Ergebnis wie ${first} + ${second}?`, answerMode: 'choice', correctAnswer: correct,
      options: textOptions(random, correct, [
        { value: `${second} − ${first} = ${Math.abs(second - first)}`, misconception: 'Tauschen mit Wechsel der Rechenart verwechselt', misconceptionId: 'addition-operation-reversal' },
        { value: `${first} + ${first} = ${first * 2}`, misconception: 'Ein Summand wurde doppelt verwendet', misconceptionId: 'addition-bridge-step' }
      ]),
      representation: representation('addition', difficulty, 'ten-frame', 'Dieselben beiden Mengen in getauschter Reihenfolge', { first, second })
    })
  }
  return withMetadata({
    ...shared,
    typeId: 'addition-to-20',
    subskillId: bridge ? 'addition-bridge-10' : 'addition-within-10',
    answerMode: 'number',
    correctAnswer: String(answer),
    representation: representation('addition', difficulty, 'number-line', 'Zerlegt bis 10 rechnen', { start: first, end: answer, marker: first, step: second, jumps: bridge ? [{ from: first, to: 10, label: `+${toTen}` }, { from: 10, to: answer, label: `+${rest}` }] : [{ from: first, to: answer, label: `+${second}` }] }, ['end'])
  })
}

function subtraction(seed: number, difficulty: Difficulty, focus?: string, phase?: LearningPhase): Exercise {
  const random = seededRandom(seed)
  const conceptPhase = phase === 'activate' || phase === 'understand'
  const bridge = conceptPhase || (difficulty > 1 && (focus === 'subtraction-bridge-10' || difficulty > 1))
  const first = integer(random, difficulty === 3 ? 17 : bridge ? 12 : 5, difficulty === 2 ? 16 : bridge ? 20 : 10)
  let second = integer(random, 1, Math.min(first, 9))
  if (bridge && first - second >= 10) second = Math.min(first, first - 9 + integer(random, 0, 2))
  const answer = first - second
  const toTen = bridge ? Math.min(second, first - 10) : 0
  const rest = second - toTen
  const values = { first, second, answer, toTen, rest }
  const shared = { ...base('subtraction', seed, difficulty, values), ...contentFor('subtraction', values, difficulty) }
  if (phase === 'activate') {
    const probe = `${answer} + ${second} = ${first}`
    return withMetadata({
      ...shared,
      typeId: 'subtraction-activate-part-whole', subskillId: 'subtraction-part-whole',
      prompt: `Welche Plusaufgabe zeigt, wie ${first} in ${answer} und ${second} zerlegt ist?`, answerMode: 'choice', correctAnswer: probe,
      options: textOptions(random, probe, [
        { value: `${first} + ${second} = ${first + second}`, misconception: 'Die Gesamtmenge wird noch einmal addiert', misconceptionId: 'subtraction-number-order' },
        { value: `${second} − ${answer} = ${Math.abs(second - answer)}`, misconception: 'Teil und Ganzes werden vertauscht', misconceptionId: 'subtraction-number-order' }
      ]),
      representation: representation('subtraction', difficulty, 'ten-frame', 'Zwei Teile einer bekannten Gesamtmenge', { first: answer, second })
    })
  }
  if (phase === 'understand') {
    const split = `${toTen} und ${rest}`
    return withMetadata({
      ...shared,
      typeId: 'subtraction-understand-bridge', subskillId: 'subtraction-bridge-10',
      prompt: `Wie zerlegst du ${second}, damit du von ${first} zuerst bis 10 zurückgehst?`, answerMode: 'choice', correctAnswer: split,
      options: textOptions(random, split, [
        { value: `${Math.max(0, toTen - 1)} und ${rest + 1}`, misconception: 'Der erste Rücksprung endet nicht bei 10', misconceptionId: 'subtraction-counting-start' },
        { value: `${rest} und ${toTen}`, misconception: 'Die Rücksprünge werden in unpassender Reihenfolge genutzt', misconceptionId: 'subtraction-counting-start' },
        { value: `${toTen} und ${Math.max(0, rest - 1)}`, misconception: 'Die Teile ergeben nicht den Subtrahenden', misconceptionId: 'subtraction-counting-start' }
      ]),
      representation: representation('subtraction', difficulty, 'ten-frame', 'Bekannte Gesamtmenge und weggenommener Teil', { first, second })
    })
  }
  if (phase === 'transfer') {
    const probe = `${answer} + ${second} = ${first}`
    return withMetadata({
      ...shared,
      typeId: 'subtraction-transfer-plus-check', subskillId: bridge ? 'subtraction-bridge-10' : 'subtraction-within-10',
      prompt: `Welche Plusaufgabe prüft ${first} − ${second} = ${answer}?`, answerMode: 'choice', correctAnswer: probe,
      options: textOptions(random, probe, [
        { value: `${first} + ${second} = ${first + second}`, misconception: 'Ausgangszahl statt Unterschied ergänzt', misconceptionId: 'subtraction-number-order' },
        { value: `${second} + ${first} = ${first + second}`, misconception: 'Beide bekannten Zahlen addiert', misconceptionId: 'subtraction-number-order' }
      ])
    })
  }
  return withMetadata({
    ...shared,
    typeId: 'subtraction-to-20',
    subskillId: bridge ? 'subtraction-bridge-10' : 'subtraction-within-10',
    answerMode: 'number',
    correctAnswer: String(answer),
    representation: representation('subtraction', difficulty, 'number-line', 'Zerlegt über 10 zurückrechnen', { start: first, end: answer, marker: first, step: second, jumps: bridge ? [{ from: first, to: 10, label: `−${toTen}` }, { from: 10, to: answer, label: `−${rest}` }] : [{ from: first, to: answer, label: `−${second}` }] }, ['end'])
  })
}

function multiplication(seed: number, difficulty: Difficulty, focus?: string, phase?: LearningPhase): Exercise {
  const random = seededRandom(seed)
  const rows = difficulty === 1 ? [2, 5, 10] : difficulty === 2 ? [3, 4, 6] : [6, 7, 8, 9]
  const focusedRow = focus?.startsWith('times-') ? Number(focus.slice(6)) : undefined
  const first = focusedRow && rows.includes(focusedRow) ? focusedRow : pick(random, rows)
  let second = integer(random, 2, difficulty === 1 ? Math.min(10, Math.floor(50 / first)) : 10)
  if (phase === 'transfer' && second === first) second = second === 10 ? 9 : second + 1
  const answer = first * second
  const values = { first, second, answer, sumExpression: Array.from({ length: first }, () => second).join(' + ') }
  const shared = { ...base('multiplication', seed, difficulty, values), ...contentFor('multiplication', values, difficulty) }
  const groupRepresentation = representation('multiplication', difficulty, 'groups', `${first} gleich große Gruppen`, { groups: first, size: second, total: answer }, ['total'])

  if (phase === 'activate') {
    const correct = `${first} Gruppen mit je ${second} Punkten`
    return withMetadata({
      ...shared,
      typeId: 'multiplication-activate-equal-groups', subskillId: `times-${first}`,
      prompt: 'Welche Aussage beschreibt das Gruppenbild?', answerMode: 'choice', correctAnswer: correct,
      options: textOptions(random, correct, [
        { value: `${second} Gruppen mit je ${first} Punkten`, misconception: 'Anzahl und Größe der Gruppen werden vertauscht.', misconceptionId: 'multiplication-group-roles' },
        { value: `${first} Gruppen mit je ${second === 10 ? 9 : second + 1} Punkten`, misconception: 'In jeder Gruppe wird ein Punkt zu viel oder zu wenig berücksichtigt.', misconceptionId: 'multiplication-group-count' },
        { value: `${first + second} einzelne Punkte`, misconception: 'Die beiden Faktoren werden addiert.', misconceptionId: 'multiplication-add-factors' }
      ]),
      representation: { ...groupRepresentation, visibility: 'always' }
    })
  }

  if (phase === 'understand') {
    const correct = values.sumExpression
    const oneGroupMissing = Array.from({ length: Math.max(1, first - 1) }, () => second).join(' + ')
    const oneGroupExtra = Array.from({ length: first + 1 }, () => second).join(' + ')
    return withMetadata({
      ...shared,
      typeId: 'multiplication-understand-repeated-addition', subskillId: `times-${first}`,
      prompt: `Welche Plusaufgabe beschreibt ${first} gleich große Gruppen mit je ${second} Punkten?`, answerMode: 'choice', correctAnswer: correct,
      options: textOptions(random, correct, [
        { value: `${first} + ${second}`, misconception: 'Die beiden Faktoren werden addiert.', misconceptionId: 'multiplication-add-factors' },
        { value: oneGroupMissing, misconception: 'Eine Gruppe wird ausgelassen.', misconceptionId: 'multiplication-group-count' },
        { value: oneGroupExtra, misconception: 'Eine Gruppe wird zu viel gezählt.', misconceptionId: 'multiplication-group-count' }
      ]),
      representation: { ...groupRepresentation, visibility: 'always' }
    })
  }

  if (phase === 'transfer') {
    const swap = `${second} · ${first} = ${answer}`
    const inverse = `${answer} : ${first} = ${second}`
    return withMetadata({
      ...shared,
      typeId: 'multiplication-transfer-fact-family', subskillId: `times-${first}`,
      prompt: `Nutze die Aufgabenfamilie von ${first} · ${second} = ${answer}.`, answerMode: 'guided-choice', correctAnswer: String(answer),
      steps: [
        {
          id: 'commutative', prompt: 'Welche Tauschaufgabe hat dasselbe Ergebnis?', interaction: 'choose-strategy',
          options: textOptions(random, swap, [
            { value: `${first} + ${second} = ${first + second}`, misconception: 'Die beiden Faktoren werden addiert.', misconceptionId: 'multiplication-add-factors' },
            { value: `${second} · ${second} = ${second * second}`, misconception: 'Eine Gruppengröße wird doppelt verwendet.', misconceptionId: 'multiplication-group-roles' }
          ]), correctAnswer: swap,
          errorFeedback: 'Beim Tauschen wechseln Anzahl und Größe der Gruppen ihre Plätze. Das Ergebnis bleibt gleich.',
          successFeedback: 'Die Tauschaufgabe verwendet dieselben beiden Faktoren.'
        },
        {
          id: 'inverse', prompt: 'Welche Geteiltaufgabe gehört zu derselben Aufgabenfamilie?', interaction: 'choose-strategy',
          options: textOptions(random, inverse, [
            { value: `${answer + first} : ${first} = ${second + 1}`, misconception: 'Eine benachbarte, aber nicht dieselbe Aufgabenfamilie wird verwendet.', misconceptionId: 'multiplication-inverse-direction' },
            { value: `${answer} : ${answer} = 1`, misconception: 'Die Gesamtmenge wird durch sich selbst geteilt.', misconceptionId: 'multiplication-inverse-direction' }
          ]), correctAnswer: inverse,
          errorFeedback: `Nutze ${first} · ${second} = ${answer}: Teile die Gesamtmenge durch die Anzahl der Gruppen.`,
          successFeedback: 'Die Geteiltaufgabe kehrt die Malaufgabe passend um.'
        }
      ],
      representation: { ...groupRepresentation, visibility: 'always' }
    })
  }

  return withMetadata({
    ...shared,
    typeId: 'small-multiplication',
    subskillId: `times-${first}`,
    answerMode: 'number',
    correctAnswer: String(answer),
    representation: groupRepresentation
  })
}

function division(seed: number, difficulty: Difficulty, focus?: string, phase?: LearningPhase): Exercise {
  const random = seededRandom(seed)
  const rows = difficulty === 1 ? [2, 5, 10] : difficulty === 2 ? [3, 4, 6] : [6, 7, 8, 9]
  const focusedSituation = focus?.startsWith('division-grouping-by-')
    ? 'grouping'
    : focus?.startsWith('division-sharing-by-')
      ? 'sharing'
      : undefined
  const focusedDivisor = focus?.startsWith('division-grouping-by-')
    ? Number(focus.slice(21))
    : focus?.startsWith('division-sharing-by-')
      ? Number(focus.slice(20))
      : focus?.startsWith('division-by-')
        ? Number(focus.slice(12))
        : undefined
  const divisor = focusedDivisor && rows.includes(focusedDivisor) ? focusedDivisor : pick(random, rows)
  const quotient = integer(random, 2, difficulty === 1 ? Math.min(10, Math.floor(50 / divisor)) : 10)
  const dividend = divisor * quotient
  const situation = focusedSituation ?? (random() < 0.5 ? 'grouping' : 'sharing')
  const values = { dividend, divisor, quotient, situation }
  const grouping = situation === 'grouping'
  const subskillId = `division-${situation}-by-${divisor}`
  const shared = { ...base('division', seed, difficulty, values), ...contentFor('division', values, difficulty) }
  const divisionRepresentation = representation(
    'division',
    difficulty,
    grouping ? 'grouping-model' : 'sharing-model',
    grouping ? getSkillContent('division').representations[0]! : getSkillContent('division').representations[1]!,
    grouping
      ? { total: dividend, groupSize: divisor, groupCount: quotient }
      : { total: dividend, groupCount: divisor, groupSize: quotient },
    [grouping ? 'groupCount' : 'groupSize']
  )

  if (phase === 'activate') {
    const correct = grouping ? 'die Anzahl der Gruppen' : 'die Punkte in jeder Gruppe'
    return withMetadata({
      ...shared,
      typeId: `division-activate-${situation}`, subskillId,
      prompt: grouping
        ? `${dividend} Punkte werden immer zu ${divisor} Punkten zusammengelegt. Was wird gesucht?`
        : `${dividend} Punkte werden auf ${divisor} Gruppen verteilt. Was wird gesucht?`,
      answerMode: 'choice', correctAnswer: correct,
      options: textOptions(random, correct, [
        { value: grouping ? 'die Punkte in jeder Gruppe' : 'die Anzahl der Gruppen', misconception: 'Gruppenanzahl und Gruppengröße werden verwechselt.', misconceptionId: 'division-group-roles' },
        { value: 'die Gesamtzahl der Punkte', misconception: 'Eine bereits bekannte Größe wird als gesucht behandelt.', misconceptionId: 'division-known-total' }
      ]),
      representation: { ...divisionRepresentation, visibility: 'always' }
    })
  }

  if (phase === 'understand') {
    const correct = grouping
      ? `${dividend} Punkte, immer ${divisor} je Gruppe, gesucht sind die Gruppen`
      : `${dividend} Punkte, ${divisor} Gruppen, gesucht sind die Punkte je Gruppe`
    return withMetadata({
      ...shared,
      typeId: `division-understand-${situation}`, subskillId,
      prompt: 'Welche Beschreibung passt zu den bekannten und unbekannten Größen?', answerMode: 'choice', correctAnswer: correct,
      options: textOptions(random, correct, [
        { value: grouping ? `${dividend} Punkte, ${divisor} Gruppen, gesucht sind die Punkte je Gruppe` : `${dividend} Punkte, immer ${divisor} je Gruppe, gesucht sind die Gruppen`, misconception: 'Gruppenanzahl und Gruppengröße werden verwechselt.', misconceptionId: 'division-group-roles' },
        { value: `${quotient} Punkte sind bekannt, gesucht ist die Gesamtmenge`, misconception: 'Eine unbekannte Größe wird als bekannt behandelt.', misconceptionId: 'division-known-total' }
      ]),
      representation: { ...divisionRepresentation, visibility: 'always' }
    })
  }

  if (phase === 'guided-practice') {
    const relation = grouping
      ? `Immer ${divisor} Punkte bilden eine Gruppe.`
      : `Die Punkte werden auf ${divisor} Gruppen verteilt.`
    return withMetadata({
      ...shared,
      typeId: `division-guided-${situation}`, subskillId,
      prompt: grouping ? 'Gruppiere die Gesamtmenge vollständig.' : 'Verteile die Gesamtmenge vollständig.',
      answerMode: 'guided-number', correctAnswer: String(quotient),
      steps: [
        {
          id: 'relationship', prompt: 'Welcher Arbeitsplan passt?', interaction: 'complete-model',
          options: textOptions(random, relation, [
            { value: grouping ? `Die Punkte werden auf ${divisor} Gruppen verteilt.` : `Immer ${divisor} Punkte bilden eine Gruppe.`, misconception: 'Gruppieren und Verteilen werden verwechselt.', misconceptionId: 'division-group-roles' },
            { value: 'Ein Teil der Punkte darf übrig bleiben.', misconception: 'Die Gesamtmenge wird nicht vollständig aufgeteilt.', misconceptionId: 'division-incomplete-partition' }
          ]), correctAnswer: relation,
          errorFeedback: 'Prüfe, ob die Gruppengröße oder die Gruppenanzahl vorgegeben ist.',
          successFeedback: 'Der Arbeitsplan passt zu den bekannten Größen.'
        },
        {
          id: 'result', prompt: grouping ? 'Wie viele Gruppen entstehen?' : 'Wie viele Punkte liegen in jeder Gruppe?', interaction: 'guided-number',
          correctAnswer: String(quotient), errorFeedback: shared.errorFeedback, successFeedback: shared.successFeedback
        }
      ],
      representation: { ...divisionRepresentation, visibility: 'always' }
    })
  }

  if (phase === 'transfer') {
    const probe = `${divisor} · ${quotient} = ${dividend}`
    const inverse = `${dividend} : ${quotient} = ${divisor}`
    return withMetadata({
      ...shared,
      typeId: `division-transfer-fact-family-${situation}`, subskillId,
      prompt: `Prüfe ${dividend} : ${divisor} = ${quotient} mit der Aufgabenfamilie.`, answerMode: 'guided-choice', correctAnswer: String(quotient),
      steps: [
        {
          id: 'probe', prompt: 'Welche Malaufgabe ist die passende Probe?', interaction: 'choose-strategy',
          options: textOptions(random, probe, [
            { value: `${divisor} + ${quotient} = ${divisor + quotient}`, misconception: 'Divisor und Ergebnis werden addiert.', misconceptionId: 'division-operation-choice' },
            { value: `${quotient} · ${quotient} = ${quotient * quotient}`, misconception: 'Gruppenanzahl und Gruppengröße werden verwechselt.', misconceptionId: 'division-group-roles' },
            { value: `${divisor} · ${quotient === 2 ? 3 : quotient - 1} = ${divisor * (quotient === 2 ? 3 : quotient - 1)}`, misconception: 'Eine Gruppe wird ausgelassen oder zu viel verwendet.', misconceptionId: 'division-incomplete-partition' }
          ]), correctAnswer: probe, errorFeedback: 'Multipliziere Gruppenanzahl und Gruppengröße. So muss wieder die Gesamtmenge entstehen.', successFeedback: 'Die Malprobe ergibt wieder die Gesamtmenge.'
        },
        {
          id: 'inverse', prompt: 'Welche zweite Geteiltaufgabe gehört zu denselben drei Zahlen?', interaction: 'choose-strategy',
          options: textOptions(random, inverse, [
            { value: `${quotient} : ${divisor} = ${Math.floor(quotient / divisor)}`, misconception: 'Die Gesamtmenge steht nicht am Anfang der Geteiltaufgabe.', misconceptionId: 'division-known-total' },
            { value: `${dividend} : ${dividend} = 1`, misconception: 'Die Gesamtmenge wird durch sich selbst geteilt.', misconceptionId: 'division-operation-choice' }
          ]), correctAnswer: inverse, errorFeedback: 'Beginne wieder mit der Gesamtmenge und teile diesmal durch das andere bekannte Ergebnis.', successFeedback: 'Beide Geteiltaufgaben gehören zur selben Aufgabenfamilie.'
        }
      ],
      representation: { ...divisionRepresentation, visibility: 'hint' }
    })
  }

  return withMetadata({
    ...shared,
    typeId: grouping ? 'division-grouping' : 'division-sharing',
    subskillId,
    answerMode: 'number',
    correctAnswer: String(quotient),
    representation: divisionRepresentation
  })
}

function placeValue(seed: number, difficulty: Difficulty, phase?: LearningPhase): Exercise {
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
  const conceptPhase = phase === 'activate' || phase === 'understand'
  const availablePositions = (['Hunderter', 'Zehner', 'Einer'] as const).filter((candidate) =>
    candidate === 'Hunderter' ? true : candidate === 'Zehner' ? tens !== 0 : ones !== 0
  )
  const position = !conceptPhase && difficulty >= 2 && zeroPositions.length > 0
    ? pick(random, zeroPositions)
    : pick(random, availablePositions)
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
  const shared = { ...base('place-value', seed, difficulty, values), ...contentFor('place-value', values, difficulty) }
  const material = representation('place-value', difficulty, 'place-value-material', 'Stellenwertmaterial', { hundreds, tens, ones })
  if (phase === 'activate') {
    const correct = position === 'Hunderter' ? `${digit} Hunderterflächen` : position === 'Zehner' ? `${digit} Zehnerstangen` : `${digit} Einerpunkte`
    return withMetadata({
      ...shared,
      typeId: 'place-value-activate-material', prompt: `Welche Materialgruppe zeigt die ${position} von ${number}?`,
      answerMode: 'choice', correctAnswer: correct, representation: material,
      options: textOptions(random, correct, [
        { value: `${digit} Einerpunkte`, misconception: 'Einer, Zehner und Hunderter werden verwechselt.', misconceptionId: 'place-value-column-confusion' },
        { value: `${digit} Zehnerstangen`, misconception: 'Einer, Zehner und Hunderter werden verwechselt.', misconceptionId: 'place-value-column-confusion' },
        { value: `${digit} Hunderterflächen`, misconception: 'Einer, Zehner und Hunderter werden verwechselt.', misconceptionId: 'place-value-column-confusion' }
      ])
    })
  }
  if (phase === 'understand') {
    const correct = `${digit} ${position} haben den Wert ${answer}`
    return withMetadata({
      ...shared,
      typeId: 'place-value-understand-digit-value', prompt: 'Welche Aussage verbindet Ziffer, Stelle und Wert richtig?',
      answerMode: 'choice', correctAnswer: correct, representation: material,
      options: textOptions(random, correct, [
        { value: `${digit} ${position} haben den Wert ${digit}`, misconception: 'Ziffer und Stellenwert werden gleichgesetzt.', misconceptionId: 'place-value-digit-as-value' },
        { value: `${digit} ${position} haben den Wert ${digit * (position === 'Hunderter' ? 10 : position === 'Zehner' ? 100 : 10)}`, misconception: 'Einer, Zehner und Hunderter werden verwechselt.', misconceptionId: 'place-value-column-confusion' },
        { value: `${digit} ${position} haben den Wert ${digit * (position === 'Einer' ? 100 : 1)}`, misconception: 'Ziffer und Stellenwert werden gleichgesetzt.', misconceptionId: 'place-value-digit-as-value' }
      ])
    })
  }
  if (phase === 'transfer') {
    const grows = hundreds < 9
    const target = grows ? number + 100 : number - 100
    const correct = String(target)
    return withMetadata({
      ...shared,
      typeId: 'place-value-transfer-hundred-change', prompt: `${grows ? 'Erhöhe' : 'Verringere'} nur die Hunderterstelle von ${number} um 1. Welche Zahl entsteht?`,
      answerMode: 'choice', correctAnswer: correct,
      options: numberOptions(random, target, [
        { value: grows ? number + 10 : number - 10, misconception: 'Einer, Zehner und Hunderter werden verwechselt.', misconceptionId: 'place-value-column-confusion' },
        { value: grows ? number + 1 : number - 1, misconception: 'Ziffer und Stellenwert werden gleichgesetzt.', misconceptionId: 'place-value-digit-as-value' },
        { value: number, misconception: 'Die Stellenwertänderung wurde nicht ausgeführt', misconceptionId: 'place-value-digit-as-value' }
      ]),
      representation: representation('place-value', difficulty, 'place-value', 'Stellenwerttafel', { hundreds, tens, ones, highlight: 'hundreds' })
    })
  }
  return withMetadata({
    ...shared,
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

function decompose(seed: number, difficulty: Difficulty, phase?: LearningPhase): Exercise {
  const random = seededRandom(seed)
  let hundreds = integer(random, 1, 9)
  let tens = integer(random, 1, 9)
  let ones = integer(random, 1, 9)
  if (difficulty === 2) {
    if (random() < 0.5) tens = 0
    else ones = 0
  } else if (difficulty === 3) {
    hundreds = integer(random, 1, 7)
    tens = integer(random, 10, 19)
    ones = integer(random, 0, 9)
  }
  const number = hundreds * 100 + tens * 10 + ones
  const answer = `${hundreds * 100} + ${tens * 10} + ${ones}`
  const values = { number, answer, hundreds, tens, ones, hundredsValue: hundreds * 100, tensValue: tens * 10 }
  const shared = { ...base('decompose', seed, difficulty, values), ...contentFor('decompose', values, difficulty) }
  const material = representation('decompose', difficulty, 'place-value-material', 'Stellenwertmaterial zur Zahl', { hundreds, tens, ones })
  if (phase === 'activate') {
    return withMetadata({
      ...shared,
      typeId: 'decompose-activate-material-count', prompt: 'Wie viele Zehnerstangen siehst du?', answerMode: 'choice', correctAnswer: String(tens),
      options: numberOptions(random, tens, [
        { value: hundreds, misconception: 'Zehner und Hunderter werden vertauscht.', misconceptionId: 'decompose-place-swap' },
        { value: ones, misconception: 'Ziffern werden ohne Stellenwert addiert.', misconceptionId: 'decompose-digits-without-value' },
        { value: Math.max(0, tens - 1), misconception: 'Eine Zehnerstange wurde ausgelassen', misconceptionId: 'decompose-digits-without-value' },
        { value: tens + 1, misconception: 'Eine Zehnerstange wurde zu viel gezählt', misconceptionId: 'decompose-digits-without-value' },
        { value: tens + 2, misconception: 'Zehnerstangen und Einerpunkte wurden vermischt', misconceptionId: 'decompose-place-swap' }
      ]), representation: material
    })
  }
  if (phase === 'understand') {
    return withMetadata({
      ...shared,
      typeId: 'decompose-understand-material-to-sum', prompt: 'Welche Zerlegung beschreibt das Material?', answerMode: 'choice', correctAnswer: answer,
      options: textOptions(random, answer, [
        { value: `${hundreds} + ${tens} + ${ones}`, misconception: 'Ziffern werden ohne Stellenwert addiert.', misconceptionId: 'decompose-digits-without-value' },
        { value: `${tens * 100} + ${hundreds * 10} + ${ones}`, misconception: 'Zehner und Hunderter werden vertauscht.', misconceptionId: 'decompose-place-swap' }
      ]), representation: material
    })
  }
  return withMetadata({
    ...shared,
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

function compose(seed: number, difficulty: Difficulty, phase?: LearningPhase): Exercise {
  const random = seededRandom(seed)
  let hundreds = integer(random, 1, 9)
  let tens = integer(random, 1, 9)
  let ones = integer(random, 1, 9)
  if (difficulty === 2) {
    if (random() < 0.5) tens = 0
    else ones = 0
  } else if (difficulty === 3) {
    hundreds = integer(random, 1, 7)
    tens = integer(random, 10, 19)
    ones = integer(random, 0, 9)
  }
  const answer = hundreds * 100 + tens * 10 + ones
  const values = { hundreds, tens, ones, answer, hundredsValue: hundreds * 100, tensValue: tens * 10 }
  const shared = { ...base('compose', seed, difficulty, values), ...contentFor('compose', values, difficulty) }
  const material = representation('compose', difficulty, 'place-value-material', 'Stellenwertmaterial zum Zusammensetzen', { hundreds, tens, ones })
  if (phase === 'activate') {
    const correct = `${hundreds} H, ${tens} Z und ${ones} E`
    return withMetadata({
      ...shared,
      typeId: 'compose-activate-sort-material', prompt: 'Welche Stellenangaben passen zum Material?', answerMode: 'choice', correctAnswer: correct,
      options: textOptions(random, correct, [
        { value: `${tens} H, ${hundreds} Z und ${ones} E`, misconception: 'Stellen werden in falscher Reihenfolge notiert.', misconceptionId: 'compose-place-order' },
        { value: `${hundreds} H, ${ones} Z und ${tens} E`, misconception: 'Stellen werden in falscher Reihenfolge notiert.', misconceptionId: 'compose-place-order' },
        { value: `${hundreds === 9 ? 8 : hundreds + 1} H, ${tens} Z und ${ones} E`, misconception: 'Stellen werden in falscher Reihenfolge notiert.', misconceptionId: 'compose-place-order' },
        { value: `${hundreds} H, ${tens === 19 ? 18 : tens + 1} Z und ${ones} E`, misconception: 'Nullen als Platzhalter fehlen.', misconceptionId: 'compose-missing-zero' }
      ]), representation: material
    })
  }
  if (phase === 'understand') {
    return withMetadata({
      ...shared,
      typeId: 'compose-understand-material-to-number', prompt: 'Welche Zahl entsteht aus dem Material?', answerMode: 'choice', correctAnswer: String(answer),
      options: numberOptions(random, answer, [
        { value: hundreds * 100 + ones * 10 + tens, misconception: 'Stellen werden in falscher Reihenfolge notiert.', misconceptionId: 'compose-place-order' },
        { value: tens * 100 + hundreds * 10 + ones, misconception: 'Stellen werden in falscher Reihenfolge notiert.', misconceptionId: 'compose-place-order' },
        { value: Number(`${hundreds}${tens}${ones}`.replace(/0/g, '')), misconception: 'Nullen als Platzhalter fehlen.', misconceptionId: 'compose-missing-zero' }
      ]), representation: material
    })
  }
  return withMetadata({
    ...shared,
    typeId: 'compose-number',
    answerMode: 'number',
    correctAnswer: String(answer),
    representation: representation('compose', difficulty, 'place-value', 'Hunderter, Zehner und Einer', { hundreds, tens, ones })
  })
}

function neighbors(seed: number, difficulty: Difficulty, unit: 10 | 100, phase?: LearningPhase): Exercise {
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
  const shared = { ...base(skillId, seed, difficulty, values), ...contentFor(skillId, values, difficulty) }
  const referenceStart = unit === 10 ? Math.floor(number / 100) * 100 : 0
  const referenceEnd = unit === 10 ? Math.min(1000, referenceStart + 100) : 1000
  const numberLine = representation(skillId, difficulty, 'number-line', 'Zahlenstrahl mit bekannten Referenzmarken', {
    start: referenceStart, end: referenceEnd, marker: number, step: unit, tickStep: unit, lower, upper
  }, ['lower', 'upper'])
  if (phase === 'activate') {
    const full = random() < 0.5 ? lower : upper
    return withMetadata({
      ...shared,
      typeId: `${skillId}-activate-full-number`, prompt: `Welche Zahl ist ein voller ${unit === 10 ? 'Zehner' : 'Hunderter'}?`,
      answerMode: 'choice', correctAnswer: String(full),
      options: numberOptions(random, full, [
        { value: number, misconception: unit === 10 ? 'Nicht direkt benachbarte Zehner werden gewählt.' : 'Zehner statt Hunderter werden betrachtet.', misconceptionId: unit === 10 ? 'neighbor-tens-wrong-interval' : 'neighbor-hundreds-used-tens' },
        { value: Math.max(0, full - 1), misconception: unit === 10 ? 'Nicht direkt benachbarte Zehner werden gewählt.' : 'Nicht direkt benachbarte Hunderter werden gewählt.', misconceptionId: unit === 10 ? 'neighbor-tens-wrong-interval' : 'neighbor-hundreds-wrong-interval' },
        { value: Math.min(1000, full + unit / 10), misconception: unit === 10 ? 'Nicht direkt benachbarte Zehner werden gewählt.' : 'Zehner statt Hunderter werden betrachtet.', misconceptionId: unit === 10 ? 'neighbor-tens-wrong-interval' : 'neighbor-hundreds-used-tens' }
      ]), representation: numberLine
    })
  }
  if (phase === 'understand') {
    const lowerOptions = numberOptions(random, lower, [
      { value: Math.max(0, lower - unit), misconception: unit === 10 ? 'Nicht direkt benachbarte Zehner werden gewählt.' : 'Nicht direkt benachbarte Hunderter werden gewählt.', misconceptionId: unit === 10 ? 'neighbor-tens-wrong-interval' : 'neighbor-hundreds-wrong-interval' },
      { value: upper, misconception: unit === 10 ? 'Nur der kleinere Zehner wird betrachtet.' : 'Nicht direkt benachbarte Hunderter werden gewählt.', misconceptionId: unit === 10 ? 'neighbor-tens-one-sided' : 'neighbor-hundreds-wrong-interval' },
      { value: Math.floor(number / (unit / 10)) * (unit / 10), misconception: unit === 10 ? 'Nicht direkt benachbarte Zehner werden gewählt.' : 'Zehner statt Hunderter werden betrachtet.', misconceptionId: unit === 10 ? 'neighbor-tens-wrong-interval' : 'neighbor-hundreds-used-tens' }
    ])
    const upperOptions = numberOptions(random, upper, [
      { value: lower, misconception: unit === 10 ? 'Nur der kleinere Zehner wird betrachtet.' : 'Nicht direkt benachbarte Hunderter werden gewählt.', misconceptionId: unit === 10 ? 'neighbor-tens-one-sided' : 'neighbor-hundreds-wrong-interval' },
      { value: Math.min(1000, upper + unit), misconception: unit === 10 ? 'Nicht direkt benachbarte Zehner werden gewählt.' : 'Nicht direkt benachbarte Hunderter werden gewählt.', misconceptionId: unit === 10 ? 'neighbor-tens-wrong-interval' : 'neighbor-hundreds-wrong-interval' },
      { value: Math.ceil(number / (unit / 10)) * (unit / 10), misconception: unit === 10 ? 'Nicht direkt benachbarte Zehner werden gewählt.' : 'Zehner statt Hunderter werden betrachtet.', misconceptionId: unit === 10 ? 'neighbor-tens-wrong-interval' : 'neighbor-hundreds-used-tens' }
    ])
    const steps: ExerciseStep[] = [
      { id: 'lower', prompt: `Welcher ${unit === 10 ? 'Zehner' : 'Hunderter'} liegt direkt unter ${number}?`, interaction: 'mark', options: lowerOptions, correctAnswer: String(lower), errorFeedback: shared.errorFeedback, successFeedback: `Der untere Nachbar ist ${lower}.` },
      { id: 'upper', prompt: `Welcher ${unit === 10 ? 'Zehner' : 'Hunderter'} folgt direkt danach?`, interaction: 'mark', options: upperOptions, correctAnswer: String(upper), errorFeedback: shared.errorFeedback, successFeedback: `Der obere Nachbar ist ${upper}.` }
    ]
    return withMetadata({ ...shared, typeId: `${skillId}-guided-boundaries`, answerMode: 'guided-choice', correctAnswer: answer, steps, representation: numberLine })
  }
  if (phase === 'transfer') {
    const lowerDistance = number - lower
    const upperDistance = upper - number
    const nearer = lowerDistance === upperDistance ? 'gleich weit' : lowerDistance < upperDistance ? String(lower) : String(upper)
    return withMetadata({
      ...shared,
      typeId: `${skillId}-transfer-nearer`, prompt: `Zu welchem Nachbarn liegt ${number} näher?`, answerMode: 'choice', correctAnswer: nearer,
      options: textOptions(random, nearer, [
        { value: String(lower), misconception: unit === 10 ? 'Nur der kleinere Zehner wird betrachtet.' : 'Nicht direkt benachbarte Hunderter werden gewählt.', misconceptionId: unit === 10 ? 'neighbor-tens-one-sided' : 'neighbor-hundreds-wrong-interval' },
        { value: String(upper), misconception: unit === 10 ? 'Nicht direkt benachbarte Zehner werden gewählt.' : 'Nicht direkt benachbarte Hunderter werden gewählt.', misconceptionId: unit === 10 ? 'neighbor-tens-wrong-interval' : 'neighbor-hundreds-wrong-interval' },
        { value: 'gleich weit', misconception: unit === 10 ? 'Nicht direkt benachbarte Zehner werden gewählt.' : 'Zehner statt Hunderter werden betrachtet.', misconceptionId: unit === 10 ? 'neighbor-tens-wrong-interval' : 'neighbor-hundreds-used-tens' }
      ]), representation: numberLine
    })
  }
  return withMetadata({
    ...shared,
    typeId: unit === 10 ? 'neighbor-tens' : 'neighbor-hundreds',
    answerMode: 'choice',
    correctAnswer: answer,
    representation: numberLine,
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

export function createRoundingExercise(number: number, unit: 10 | 100, seed = number * 17 + unit, difficulty: Difficulty = 1, phase?: LearningPhase): Exercise {
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
  const shared = { ...base(skillId, seed, difficulty, values), ...generatedContent, explanation }
  const numberLine = representation(skillId, difficulty, 'number-line', 'Abstände zu den Nachbarzahlen', { start: lower, end: upper, marker: number, step: unit })
  const neighborOptions = textOptions(random, neighborAnswer, [
    { value: `${Math.max(min, lower - unit)} und ${lower}`, misconception: 'Intervall zu weit links', misconceptionId: `${skillId}-wrong-neighbors` },
    { value: `${upper} und ${Math.min(max, upper + unit)}`, misconception: 'Intervall zu weit rechts', misconceptionId: `${skillId}-wrong-neighbors` },
    { value: `${Math.max(min, lower - unit)} und ${upper}`, misconception: 'Nur eine Nachbarzahl passend', misconceptionId: `${skillId}-wrong-neighbors` }
  ])
  const correctReason = lowerDistance === upperDistance
    ? renderCatalogText(stepText.halfwayUp, values)
    : lowerDistance < upperDistance
      ? renderCatalogText(stepText.closerLower, values)
      : renderCatalogText(stepText.closerUpper, values)
  const reasonOptions = textOptions(random, correctReason, [
    { value: renderCatalogText(stepText.wrongLower, values), misconception: 'Ohne Abstand immer nach unten gerundet', misconceptionId: lowerDistance === upperDistance ? `${skillId}-midpoint-down` : `${skillId}-always-down` },
    { value: renderCatalogText(stepText.wrongUpper, values), misconception: 'Ohne Abstand immer nach oben gerundet', misconceptionId: `${skillId}-always-up` }
  ])
  if (phase === 'activate') {
    return withMetadata({
      ...shared, typeId: `${skillId}-activate-neighbors`, subskillId: `${skillId}-neighbors`,
      prompt: `Zwischen welchen beiden vollen ${unit === 10 ? 'Zehnern' : 'Hundertern'} liegt ${number}?`, answerMode: 'choice', correctAnswer: neighborAnswer,
      options: neighborOptions,
      representation: { ...numberLine, valueRoles: { knownValues: ['marker', 'step'], unknownValues: ['start', 'end'], revealedValues: [] } }
    })
  }
  if (phase === 'understand') {
    return withMetadata({
      ...shared, typeId: `${skillId}-understand-distances`, subskillId: lowerDistance === upperDistance ? `${skillId}-midpoint` : `${skillId}-distance`,
      prompt: 'Welche Aussage beschreibt die beiden Abstände richtig?', answerMode: 'choice', correctAnswer: correctReason,
      options: reasonOptions, representation: numberLine
    })
  }
  if (phase === 'guided-practice') {
    const guidedSteps: ExerciseStep[] = [
      { id: 'neighbors', prompt: renderCatalogText(stepText.neighborsPrompt, values), interaction: 'mark', options: neighborOptions, correctAnswer: neighborAnswer, errorFeedback: renderCatalogText(stepText.neighborsError, values), successFeedback: renderCatalogText(stepText.neighborsSuccess, values) },
      { id: 'compare-distances', prompt: renderCatalogText(stepText.reasonPrompt, values), interaction: 'choose-strategy', options: reasonOptions, correctAnswer: correctReason, errorFeedback: renderCatalogText(stepText.reasonError, values), successFeedback: renderCatalogText(stepText.reasonSuccess, values) },
      { id: 'round-result', prompt: renderCatalogText(stepText.resultPrompt, values), interaction: 'guided-number', correctAnswer: String(answer), errorFeedback: renderCatalogText(stepText.resultError, values), successFeedback: renderCatalogText(stepText.resultSuccess, values) }
    ]
    return withMetadata({ ...shared, typeId: `${skillId}-guided-distance`, subskillId: lowerDistance === upperDistance ? `${skillId}-midpoint` : `${skillId}-distance`, answerMode: 'guided-number', correctAnswer: String(answer), steps: guidedSteps, representation: numberLine })
  }
  if (phase === 'independent-practice' || phase === 'automate') {
    return withMetadata({
      ...shared, typeId: `${skillId}-${phase === 'automate' ? 'automate' : 'independent'}`, subskillId: lowerDistance === upperDistance ? `${skillId}-midpoint` : `${skillId}-distance`,
      answerMode: 'number', correctAnswer: String(answer), representation: numberLine
    })
  }
  if (phase === 'transfer') {
    const correct = `ungefähr ${answer}`
    const otherNeighbor = answer === lower ? upper : lower
    return withMetadata({
      ...shared, typeId: `${skillId}-transfer-accuracy`, subskillId: `${skillId}-accuracy`,
      prompt: renderCatalogText(content.transferPrompt, values), answerMode: 'choice', correctAnswer: correct,
      options: textOptions(random, correct, [
        { value: `genau ${number}`, misconception: 'Für einen Überblick wird die exakte Zahl statt einer Näherung verwendet.', misconceptionId: `${skillId}-accuracy-choice` },
        { value: `ungefähr ${otherNeighbor}`, misconception: 'Die Näherung verwendet den weiter entfernten Nachbarn.', misconceptionId: `${skillId}-wrong-neighbors` }
      ])
    })
  }
  const steps: ExerciseStep[] | undefined = difficulty >= 2 ? [
    {
      id: 'neighbors',
      prompt: renderCatalogText(stepText.neighborsPrompt, values),
      options: neighborOptions,
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
    steps.push({
      id: 'round-reason',
      prompt: renderCatalogText(stepText.reasonPrompt, values),
      options: reasonOptions,
      correctAnswer: correctReason,
      errorFeedback: renderCatalogText(stepText.reasonError, values),
      successFeedback: renderCatalogText(stepText.reasonSuccess, values)
    })
  }
  return withMetadata({
    ...shared,
    typeId: unit === 10 ? 'round-tens' : 'round-hundreds',
    answerMode: difficulty >= 2 ? 'guided-choice' : 'choice',
    correctAnswer: String(answer),
    steps,
    representation: numberLine,
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

function rounding(seed: number, difficulty: Difficulty, unit: 10 | 100, phase?: LearningPhase): Exercise {
  const random = seededRandom(seed)
  const calculationLevel: Difficulty = phase === 'activate' ? 1
    : phase === 'understand' || phase === 'guided-practice' || phase === 'independent-practice' ? 2
      : phase === 'automate' || phase === 'transfer' ? 3
        : difficulty
  const maxInterval = calculationLevel === 3 ? (unit === 10 ? 99 : 9) : (unit === 10 ? 98 : 8)
  const interval = integer(random, 0, maxInterval) * unit
  const offset = calculationLevel === 1
    ? (unit === 10 ? pick(random, [2, 3, 7, 8]) : pick(random, [20, 30, 70, 80]))
    : calculationLevel === 2
      ? (unit === 10 ? pick(random, [4, 5, 6]) : pick(random, [40, 50, 60]))
      : integer(random, 1, unit - 1)
  let number = interval + offset
  if (number > 1000 - unit / 2) number = 1000 - unit / 2
  return createRoundingExercise(number, unit, seed, difficulty, phase)
}

function wordModelRepresentation(
  modelType: WordModelType,
  values: Record<string, number | string>,
  label: string,
  sourceModelType: WordModelType
): ExerciseRepresentation {
  const kind = modelType === 'equal-groups-total'
    ? 'groups'
    : modelType === 'equal-groups-share'
      ? 'sharing-model'
      : 'bar-model'
  const sourceFirst = Number(values.first)
  const sourceSecond = Number(values.second)
  const sourceTotal = Number(values.total)
  const isSharingStory = sourceModelType === 'equal-groups-share'
  const first = isSharingStory ? sourceTotal : sourceFirst
  const second = isSharingStory ? sourceFirst : sourceSecond
  const unknownQuantity = WORD_MODEL_UNKNOWN_QUANTITY[modelType]
  const representationValues: ExerciseRepresentation['values'] = modelType === 'equal-groups-share'
    ? {
        modelType,
        unknownQuantity,
        total: sourceTotal,
        groupCount: sourceFirst,
        groupSize: sourceSecond
      }
    : {
    modelType,
    unknownQuantity,
    first,
    second,
    third: values.third,
    total: isSharingStory ? sourceTotal : first,
    groups: sourceFirst,
    ...(modelType === 'equal-groups-total' && !isSharingStory ? { size: sourceSecond } : {})
  }
  const representationUnknownValues = modelType === 'equal-groups-share' ? ['groupSize'] : [unknownQuantity]
  return {
    kind,
    visibility: 'always',
    label,
    values: representationValues,
    valueRoles: {
      knownValues: Object.keys(representationValues).filter((key) => !representationUnknownValues.includes(key)),
      unknownValues: representationUnknownValues,
      revealedValues: []
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
    representation: wordModelRepresentation(modelType, values, 'Darstellung der Geschichte', correct),
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
  const questionStep: ExerciseStep = {
    id: 'question',
    interaction: 'select',
    prompt: renderCatalogText(stepsContent.questionPrompt, values),
    options: textOptions(random, question, template.questionDistractors.map((text) => ({
      value: renderCatalogText(text, values), misconception: 'Bekannte Angabe statt gesuchter Menge gewählt'
    }))),
    correctAnswer: question,
    errorFeedback: stepsContent.questionError,
    successFeedback: stepsContent.questionSuccess
  }
  const relevantStep: ExerciseStep = {
    id: 'relevant',
    interaction: 'select',
    prompt: renderCatalogText(stepsContent.relevantPrompt, values),
    options: textOptions(random, relevant, template.relevantDistractors.map((text) => ({
      value: renderCatalogText(text, values), misconception: 'Wichtige Handlung oder benötigte Menge ausgelassen'
    }))),
    correctAnswer: relevant,
    errorFeedback: renderCatalogText(stepsContent.relevantError, values),
    successFeedback: renderCatalogText(stepsContent.relevantSuccess, values)
  }
  const model = wordModelRepresentation(template.modelType, values, 'Passendes Mengenbild mit offener gesuchter Größe', template.modelType)
  const modelInteraction = stepsContent.modelInteractionByDifficulty[String(difficulty) as '1' | '2' | '3']
  const modelStep: ExerciseStep = modelInteraction === 'continue'
    ? {
      id: 'model',
      interaction: 'continue',
      prompt: stepsContent.modelExplorePrompt,
      representation: model,
      continueLabel: stepsContent.modelContinueLabel,
      correctAnswer: 'continue',
      errorFeedback: stepsContent.modelError,
      successFeedback: stepsContent.modelSuccess
    }
    : {
      id: 'model',
      interaction: 'select',
      prompt: stepsContent.modelPrompt,
      options: wordModelOptions(random, template.modelType, template.modelDistractors, values),
      correctAnswer: template.modelType,
      errorFeedback: stepsContent.modelError,
      successFeedback: stepsContent.modelSuccess
    }
  const equationStep: ExerciseStep = {
    id: 'equation',
    interaction: 'select',
    prompt: stepsContent.equationPrompt,
    options: textOptions(random, equation, template.equationDistractors.map((text) => ({
      value: renderCatalogText(text, values), misconception: 'Rechnung beschreibt ein anderes Mengenbild'
    }))),
    correctAnswer: equation,
    errorFeedback: renderCatalogText(template.equationError, values),
    successFeedback: stepsContent.equationSuccess
  }
  const calculateStep: ExerciseStep = {
    id: 'calculate',
    interaction: 'guided-number',
    prompt: renderCatalogText(stepsContent.calculatePrompt, values),
    correctAnswer: String(intermediate),
    errorFeedback: stepsContent.calculateError,
    successFeedback: stepsContent.calculateSuccess
  }
  const secondEquationStep: ExerciseStep | undefined = template.secondOperation ? {
    id: 'second-equation',
    interaction: 'select',
    prompt: renderCatalogText(stepsContent.secondEquationPrompt, values),
    options: textOptions(random, secondEquation, template.secondEquationDistractors!.map((text) => ({
      value: renderCatalogText(text, values), misconception: 'Zweite Veränderung in die falsche Richtung gerechnet'
    }))),
    correctAnswer: secondEquation,
    errorFeedback: renderCatalogText(stepsContent.secondEquationError, values),
    successFeedback: stepsContent.secondEquationSuccess
  } : undefined
  const finalCalculationStep: ExerciseStep | undefined = template.secondOperation ? {
    id: 'final-calculation',
    interaction: 'guided-number',
    prompt: renderCatalogText(stepsContent.finalCalculationPrompt, values),
    correctAnswer: String(result),
    errorFeedback: stepsContent.finalCalculationError,
    successFeedback: stepsContent.finalCalculationSuccess
  } : undefined
  const plausibilityOptions = template.plausibility.options.map((option) => ({
    value: renderCatalogText(option.label, values),
    label: renderCatalogText(option.label, values),
    misconception: option.correct ? undefined : 'Größenbeziehung falsch eingeschätzt'
  }))
  const correctPlausibility = plausibilityOptions[template.plausibility.options.findIndex((option) => option.correct)]!.value
  const plausibilityStep: ExerciseStep = {
    id: 'plausibility',
    interaction: 'select',
    prompt: renderCatalogText(template.plausibility.prompt, values),
    options: shuffle(random, plausibilityOptions),
    correctAnswer: correctPlausibility,
    errorFeedback: stepsContent.plausibilityError,
    successFeedback: stepsContent.plausibilitySuccess
  }
  const checkStep: ExerciseStep = {
    id: 'check',
    interaction: 'select',
    prompt: stepsContent.checkPrompt,
    options: textOptions(random, answerSentence, [
      { value: renderCatalogText(template.answer, { ...templateValues, result: Math.max(0, result - 1) }), misconception: 'Antwortsatz mit falschem Ergebnis' },
      { value: renderCatalogText(template.answer, { ...templateValues, result: result + 2 }), misconception: 'Antwortsatz mit falschem Ergebnis' }
    ]),
    correctAnswer: answerSentence,
    errorFeedback: stepsContent.checkError,
    successFeedback: stepsContent.checkSuccess
  }
  const stepById: Record<string, ExerciseStep | undefined> = {
    question: questionStep,
    relevant: relevantStep,
    model: modelStep,
    equation: equationStep,
    calculate: calculateStep,
    'second-equation': secondEquationStep,
    'final-calculation': finalCalculationStep,
    plausibility: plausibilityStep,
    check: checkStep
  }
  const steps = stepsContent.runtimeSequence
    .filter((definition) => definition.condition === 'always' || Boolean(template.secondOperation))
    .map((definition) => {
      const step = stepById[definition.id]
      if (!step) throw new Error(`Katalogschritt ${definition.id} kann für ${template.id} nicht erzeugt werden.`)
      const catalogInteraction = definition.interaction === 'model-by-difficulty' ? modelInteraction : definition.interaction
      const expectedInteraction = catalogInteraction === 'choice' ? 'select' : catalogInteraction === 'number' ? 'guided-number' : catalogInteraction
      const actualInteraction = step.interaction ?? 'select'
      if (actualInteraction !== expectedInteraction) throw new Error(`Interaktion für ${definition.id} weicht vom Katalog ab.`)
      const hasRepresentation = Boolean(step.representation || step.options?.every((option) => option.representation))
      if ((definition.representation === 'word-model') !== hasRepresentation) {
        throw new Error(`Pflichtdarstellung für ${definition.id} weicht vom Katalog ab.`)
      }
      return { ...step, curriculumStage: definition.progressionId }
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
  bridgeUnit: 10 | 100,
  skill: 'addition' | 'subtraction'
): ExerciseStep[] {
  const content = getTaskCatalog().strategySteps.arithmetic1000
  return [{
    id: 'bridge',
    prompt: renderCatalogText(content.bridgePrompt, values),
    options: numberOptions(random, bridge, [
      { value: bridge - bridgeUnit, misconception: 'Nachbarzahl in der falschen Richtung gewählt', misconceptionId: `${skill}-1000-bridge-direction` },
      { value: bridge + bridgeUnit, misconception: 'Einen Nachbar zu weit gegangen', misconceptionId: `${skill}-1000-bridge-direction` },
      { value: Number(values.first), misconception: 'Noch keinen Rechenschritt ausgeführt', misconceptionId: `${skill}-1000-bridge-omitted` }
    ]),
    correctAnswer: String(bridge),
    errorFeedback: renderCatalogText(content.bridgeError, values),
    successFeedback: renderCatalogText(content.bridgeSuccess, values)
  }, {
    id: 'result',
    prompt: renderCatalogText(content.resultPrompt, values),
    options: numberOptions(random, answer, [
      { value: answer - 1, misconception: 'Einerfehler im Restschritt', misconceptionId: `${skill}-1000-rest-step` },
      { value: answer + 1, misconception: 'Einerfehler im Restschritt', misconceptionId: `${skill}-1000-rest-step` },
      { value: bridge, misconception: 'Nach dem Zwischenschritt aufgehört', misconceptionId: `${skill}-1000-bridge-omitted` }
    ]),
    correctAnswer: String(answer),
    errorFeedback: renderCatalogText(content.resultError, values),
    successFeedback: renderCatalogText(content.resultSuccess, values)
  }]
}

function symmetryProgressionPhase(difficulty: Difficulty, focus?: string): 1 | 2 | 3 {
  const match = focus?.match(/^symmetry-phase-([1-3])$/)
  const requested = match ? Number(match[1]) as 1 | 2 | 3 : undefined
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

function addition1000(seed: number, difficulty: Difficulty, phase?: LearningPhase): Exercise {
  const random = seededRandom(seed)
  const calculationLevel: Difficulty = phase === 'activate' ? 1
    : phase === 'understand' || phase === 'guided-practice' ? 2
      : phase === 'automate' || phase === 'transfer' ? 3
        : difficulty
  let first: number
  let second: number
  let strategy: string
  if (calculationLevel === 1) {
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
  } else if (calculationLevel === 2) {
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
  const bridge = calculationLevel === 2 ? Math.ceil(first / 10) * 10 : calculationLevel === 3 ? Math.ceil(first / 100) * 100 : answer
  const firstStep = bridge - first
  const rest = second - firstStep
  const jumps = calculationLevel === 1 ? numberLineJumps([first, answer]) : numberLineJumps([first, bridge, answer])
  const bridgeUnit = calculationLevel === 3 ? 100 : 10
  const values = { first, second, answer, bridge, firstStep, rest, strategy }
  const shared = { ...base('addition-1000', seed, difficulty, values), ...contentFor('addition-1000', values, difficulty) }
  const line = representation('addition-1000', difficulty, 'number-line', 'Rechenstrich mit Zwischenziel', { start: first, end: answer, marker: bridge, jumps }, ['end', 'marker', 'jumps'])
  if (phase === 'activate') {
    const changedPlace = second % 100 === 0 ? 'Hunderter' : 'Zehner'
    return withMetadata({
      ...shared, typeId: 'addition-1000-activate-place', subskillId: 'addition-1000-no-bridge',
      prompt: `Welche Stelle verändert sich zuerst bei ${first} + ${second}?`, answerMode: 'choice', correctAnswer: changedPlace,
      options: textOptions(random, changedPlace, [
        { value: changedPlace === 'Hunderter' ? 'Zehner' : 'Hunderter', misconception: 'Die Stellen der beiden Summanden werden vermischt.', misconceptionId: 'addition-1000-place-confusion' },
        { value: 'Einer', misconception: 'Die Einer werden verändert, obwohl ein voller Zehner oder Hunderter addiert wird.', misconceptionId: 'addition-1000-place-confusion' }
      ]),
      representation: representation('addition-1000', difficulty, 'place-value-material', 'Ausgangszahl als Stellenwertmaterial', {
        hundreds: Math.floor(first / 100), tens: Math.floor(first / 10) % 10, ones: first % 10,
        changeHundreds: Math.floor(second / 100), changeTens: Math.floor(second / 10) % 10, changeOnes: second % 10, operation: '+'
      })
    })
  }
  if (phase === 'understand') {
    const split = `${firstStep} und ${rest}`
    return withMetadata({
      ...shared, typeId: 'addition-1000-understand-bridge', subskillId: 'addition-1000-ones-bridge',
      prompt: `Wie zerlegst du ${second}, damit du von ${first} zuerst die nächste volle Zahl erreichst?`, answerMode: 'choice', correctAnswer: split,
      options: textOptions(random, split, [
        { value: `${Math.max(1, firstStep - 1)} und ${rest + 1}`, misconception: 'Der erste Schritt erreicht die volle Zahl nicht genau.', misconceptionId: 'addition-1000-bridge-direction' },
        { value: `${rest} und ${firstStep}`, misconception: 'Die Teilstücke stimmen, aber das hilfreiche Zwischenziel wird nicht zuerst erreicht.', misconceptionId: 'addition-1000-bridge-direction' },
        { value: `${firstStep} und ${Math.max(0, rest - 1)}`, misconception: 'Beim Zerlegen geht ein Teil des zweiten Summanden verloren.', misconceptionId: 'addition-1000-rest-step' }
      ]), representation: line
    })
  }
  if (phase === 'transfer') {
    const correct = `${first} + ${firstStep} + ${rest}`
    return withMetadata({
      ...shared, typeId: 'addition-1000-transfer-strategy', subskillId: calculationLevel === 3 ? 'addition-1000-tens-bridge' : 'addition-1000-ones-bridge',
      prompt: `Welcher Rechenweg nutzt für ${first} + ${second} ein hilfreiches Zwischenziel?`, answerMode: 'choice', correctAnswer: correct,
      options: textOptions(random, correct, [
        { value: `${first} + ${second} + ${rest}`, misconception: 'Der Rest wird doppelt addiert.', misconceptionId: 'addition-1000-rest-step' },
        { value: `${first} − ${firstStep} + ${rest}`, misconception: 'Der erste Schritt geht in die falsche Richtung.', misconceptionId: 'addition-1000-bridge-direction' }
      ]), representation: line
    })
  }
  return withMetadata({
    ...shared,
    typeId: phase === 'guided-practice' ? 'addition-1000-guided-bridge' : 'addition-to-1000',
    subskillId: calculationLevel === 1 ? 'addition-1000-no-bridge' : calculationLevel === 2 ? 'addition-1000-ones-bridge' : 'addition-1000-tens-bridge',
    answerMode: phase === 'guided-practice' || (!phase && calculationLevel > 1) ? 'guided-choice' : 'number',
    correctAnswer: String(answer),
    steps: phase === 'guided-practice' || (!phase && calculationLevel > 1) ? arithmetic1000Steps(random, values, bridge, answer, bridgeUnit, 'addition') : undefined,
    representation: calculationLevel === 1
      ? representation('addition-1000', difficulty, 'place-value-material', 'Ausgangszahl und Veränderungsmenge als Stellenwertmaterial', {
          hundreds: Math.floor(first / 100), tens: Math.floor(first / 10) % 10, ones: first % 10,
          changeHundreds: Math.floor(second / 100), changeTens: Math.floor(second / 10) % 10, changeOnes: second % 10, operation: '+'
        })
      : line
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
    interaction: 'guided-number',
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
    }, ['result'])
  })
}

function subtraction1000(seed: number, difficulty: Difficulty, phase?: LearningPhase): Exercise {
  const random = seededRandom(seed)
  const calculationLevel: Difficulty = phase === 'activate' ? 1
    : phase === 'understand' || phase === 'guided-practice' ? 3
      : phase === 'automate' || phase === 'transfer' ? 3
        : difficulty
  let first: number
  let second: number
  let strategy: string
  let bridge: number
  let bridgeUnit: 10 | 100 = 10
  if (calculationLevel === 1) {
    first = integer(random, 4, 9) * 100
    second = integer(random, 1, Math.floor(first / 100) - 1) * 100
    bridge = first - second
    strategy = `Ziehe ${second / 100} Hunderter von ${first / 100} Hundertern ab.`
  } else if (calculationLevel === 2) {
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
  const firstStep = first - bridge
  const rest = second - firstStep
  const jumps = calculationLevel === 1 ? numberLineJumps([first, answer]) : numberLineJumps(bridge === answer ? [first, answer] : [first, bridge, answer])
  const values = { first, second, answer, bridge, firstStep, rest, strategy }
  const shared = { ...base('subtraction-1000', seed, difficulty, values), ...contentFor('subtraction-1000', values, difficulty) }
  const line = representation('subtraction-1000', difficulty, 'number-line', 'Rechenstrich mit Zwischenziel', { start: first, end: answer, marker: bridge, jumps }, ['end', 'marker', 'jumps'])
  if (phase === 'activate') {
    return withMetadata({
      ...shared, typeId: 'subtraction-1000-activate-direction', subskillId: 'subtraction-1000-hundreds',
      prompt: `In welche Richtung verändert sich ${first}, wenn du ${second} abziehst?`, answerMode: 'choice', correctAnswer: 'Die Zahl wird kleiner.',
      options: textOptions(random, 'Die Zahl wird kleiner.', [
        { value: 'Die Zahl wird größer.', misconception: 'Minus wird als Vergrößern verstanden.', misconceptionId: 'subtraction-1000-operation-direction' },
        { value: 'Die Zahl bleibt gleich.', misconception: 'Der Subtrahend wird nicht als Veränderung genutzt.', misconceptionId: 'subtraction-1000-bridge-omitted' }
      ]),
      representation: representation('subtraction-1000', difficulty, 'place-value-material', 'Ausgangszahl und Veränderungsmenge als Stellenwertmaterial', {
        hundreds: Math.floor(first / 100), tens: Math.floor(first / 10) % 10, ones: first % 10,
        changeHundreds: Math.floor(second / 100), changeTens: Math.floor(second / 10) % 10, changeOnes: second % 10, operation: '−'
      })
    })
  }
  if (phase === 'understand') {
    const split = `${firstStep} und ${rest}`
    return withMetadata({
      ...shared, typeId: 'subtraction-1000-understand-bridge', subskillId: bridgeUnit === 10 ? 'subtraction-1000-ones-unbundling' : 'subtraction-1000-tens-unbundling',
      prompt: `Wie zerlegst du ${second}, damit du von ${first} zuerst zur vollen Zahl zurückgehst?`, answerMode: 'choice', correctAnswer: split,
      options: textOptions(random, split, [
        { value: `${firstStep + 1} und ${Math.max(0, rest - 1)}`, misconception: 'Der erste Rücksprung geht an der vollen Zahl vorbei.', misconceptionId: 'subtraction-1000-bridge-direction' },
        { value: `${rest} und ${firstStep}`, misconception: 'Die Teilstücke stimmen, aber das Zwischenziel wird nicht zuerst erreicht.', misconceptionId: 'subtraction-1000-bridge-direction' },
        { value: `${firstStep} und ${rest + 1}`, misconception: 'Beim Zerlegen wird zu viel abgezogen.', misconceptionId: 'subtraction-1000-rest-step' }
      ]), representation: line
    })
  }
  if (phase === 'transfer') {
    const probe = `${answer} + ${second} = ${first}`
    return withMetadata({
      ...shared, typeId: 'subtraction-1000-transfer-plus-check', subskillId: bridgeUnit === 10 ? 'subtraction-1000-ones-unbundling' : 'subtraction-1000-tens-unbundling',
      prompt: `Welche Plusaufgabe prüft ${first} − ${second} = ${answer}?`, answerMode: 'choice', correctAnswer: probe,
      options: textOptions(random, probe, [
        { value: `${first} + ${second} = ${first + second}`, misconception: 'Die Ausgangszahl wird statt des Unterschieds ergänzt.', misconceptionId: 'subtraction-1000-operation-direction' },
        { value: `${answer} + ${firstStep} = ${answer + firstStep}`, misconception: 'Nur der erste Teilschritt wird für die Probe genutzt.', misconceptionId: 'subtraction-1000-bridge-omitted' }
      ]), representation: line
    })
  }
  return withMetadata({
    ...shared,
    typeId: phase === 'guided-practice' ? 'subtraction-1000-guided-bridge' : 'subtraction-to-1000',
    subskillId: calculationLevel === 1 ? 'subtraction-1000-hundreds' : calculationLevel === 2 ? 'subtraction-1000-no-unbundling' : bridgeUnit === 10 ? 'subtraction-1000-ones-unbundling' : 'subtraction-1000-tens-unbundling',
    answerMode: phase === 'guided-practice' || (!phase && calculationLevel === 3) ? 'guided-choice' : 'number',
    correctAnswer: String(answer),
    steps: phase === 'guided-practice' || (!phase && calculationLevel === 3) ? arithmetic1000Steps(random, values, bridge, answer, bridgeUnit, 'subtraction') : undefined,
    representation: calculationLevel === 1
      ? representation('subtraction-1000', difficulty, 'place-value-material', 'Ausgangszahl und Veränderungsmenge als Stellenwertmaterial', {
          hundreds: Math.floor(first / 100), tens: Math.floor(first / 10) % 10, ones: first % 10,
          changeHundreds: Math.floor(second / 100), changeTens: Math.floor(second / 10) % 10, changeOnes: second % 10, operation: '−'
        })
      : line
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
    interaction: 'guided-number',
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
    }, ['result'])
  })
}

function complement1000(seed: number, difficulty: Difficulty, phase?: LearningPhase): Exercise {
  const random = seededRandom(seed)
  const calculationLevel: Difficulty = phase === 'activate' ? 1
    : phase === 'understand' || phase === 'guided-practice' ? 2
      : phase === 'automate' || phase === 'transfer' ? 3
        : difficulty
  const targetUnit = calculationLevel === 1 ? 10 : 100
  const target = calculationLevel === 1 ? integer(random, 12, 90) * 10 : integer(random, 2, 10) * 100
  const gap = calculationLevel === 1 ? integer(random, 1, 9) : calculationLevel === 2 ? integer(random, 11, 59) : integer(random, 11, 79)
  const first = target - gap
  const answer = target - first
  const nextTen = Math.ceil(first / 10) * 10
  const jumps = nextTen > first && nextTen < target ? numberLineJumps([first, nextTen, target]) : numberLineJumps([first, target])
  const strategy = calculationLevel === 3
    ? `Ergänze erst ${nextTen - first} bis ${nextTen} und dann ${target - nextTen} bis ${target}.`
    : `Der Abstand von ${first} bis ${target} ist ${answer}.`
  const firstStep = nextTen - first
  const rest = target - nextTen
  const values = { first, target, answer, nextTen, firstStep, rest, strategy }
  const shared = { ...base('complement-1000', seed, difficulty, values), ...contentFor('complement-1000', values, difficulty) }
  const line = representation('complement-1000', difficulty, 'number-line', 'Ergänzen auf dem Rechenstrich', { start: first, end: target, marker: nextTen, jumps }, ['end', 'marker', 'jumps'])
  if (phase === 'activate') {
    return withMetadata({
      ...shared, typeId: 'complement-1000-activate-target', subskillId: 'complement-next-ten',
      prompt: `Welche volle Zahl kommt nach ${first}?`, answerMode: 'choice', correctAnswer: String(target),
      options: numberOptions(random, target, [
        { value: target - 10, misconception: 'Die volle Zahl vor der Startzahl wurde gewählt.', misconceptionId: 'complement-1000-target-direction' },
        { value: target + 10, misconception: 'Eine volle Zahl wurde übersprungen.', misconceptionId: 'complement-1000-target-direction' }
      ]), representation: line
    })
  }
  if (phase === 'understand') {
    const split = `${firstStep} und ${rest}`
    return withMetadata({
      ...shared, typeId: 'complement-1000-understand-split', subskillId: 'complement-next-hundred',
      prompt: `Wie kannst du den Weg von ${first} bis ${target} in zwei hilfreiche Schritte zerlegen?`, answerMode: 'choice', correctAnswer: split,
      options: textOptions(random, split, [
        { value: `${firstStep + 1} und ${Math.max(0, rest - 1)}`, misconception: 'Der erste Schritt endet nicht am nächsten Zehner.', misconceptionId: 'complement-1000-bridge-step' },
        { value: `${rest} und ${firstStep}`, misconception: 'Die Teilstücke stimmen, aber der nächste Zehner wird nicht zuerst erreicht.', misconceptionId: 'complement-1000-bridge-step' },
        { value: `${firstStep} und ${rest + 10}`, misconception: 'Der Abstand bis zur Zielzahl wird zu groß gezählt.', misconceptionId: 'complement-1000-counting-target' }
      ]), representation: line
    })
  }
  if (phase === 'guided-practice') {
    const steps: ExerciseStep[] = [{
      id: 'next-ten', prompt: 'Welche Zahl erreichst du mit dem ersten kleinen Sprung?', interaction: 'guided-number', correctAnswer: String(nextTen),
      errorFeedback: 'Ergänze nur die Einer bis zum nächsten vollen Zehner.', successFeedback: 'Der erste Sprung endet am nächsten Zehner.'
    }, {
      id: 'distance', prompt: `Wie viel fehlt insgesamt von ${first} bis ${target}?`, interaction: 'guided-number', correctAnswer: String(answer),
      errorFeedback: 'Addiere die Länge beider Sprünge, nicht ihre Zielzahlen.', successFeedback: 'Beide Sprünge ergeben zusammen den gesuchten Abstand.'
    }]
    return withMetadata({ ...shared, typeId: 'complement-1000-guided-steps', subskillId: 'complement-next-hundred', answerMode: 'guided-number', correctAnswer: String(answer), steps, representation: line })
  }
  if (phase === 'transfer') {
    const equation = `${first} + ${answer} = ${target}`
    return withMetadata({
      ...shared, typeId: 'complement-1000-transfer-equation', subskillId: 'complement-next-hundred',
      prompt: `Welche Plusaufgabe prüft den Abstand von ${first} bis ${target}?`, answerMode: 'choice', correctAnswer: equation,
      options: textOptions(random, equation, [
        { value: `${target} + ${answer} = ${target + answer}`, misconception: 'Die Zielzahl wird statt der Startzahl ergänzt.', misconceptionId: 'complement-1000-target-direction' },
        { value: `${first} + ${target} = ${first + target}`, misconception: 'Start und Ziel werden addiert statt der Abstand ergänzt.', misconceptionId: 'complement-1000-counting-target' }
      ]), representation: line
    })
  }
  return withMetadata({
    ...shared,
    typeId: 'complement-to-full-number',
    subskillId: targetUnit === 10 ? 'complement-next-ten' : 'complement-next-hundred',
    answerMode: 'number',
    correctAnswer: String(answer),
    representation: line
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
    }, difficulty < 3 ? ['displayedCents'] : [])
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
    representation: representation('lengths', difficulty, 'length', content.rulerLabel, representationValues, difficulty === 1 ? ['lengthCm'] : [])
  })
}

export function formatClockTime(hour: number, minute: number): string {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23 || !Number.isInteger(minute) || minute < 0 || minute > 59) {
    throw new RangeError('Uhrzeiten brauchen gültige Stunden und Minuten.')
  }
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} Uhr`
}

function time(seed: number, difficulty: Difficulty, phase?: LearningPhase): Exercise {
  const random = seededRandom(seed)
  const content = getTaskCatalog().quantityContent.time
  let correctAnswer: string
  let options: AnswerOption[]
  let taskPrompt: string
  let quantityExplanation: string
  let strategy: string
  let subskillId: string
  let representationValues: ExerciseRepresentation['values']
  const timePhase = phase ?? (difficulty === 1 ? 'guided-practice' : difficulty === 2 ? 'independent-practice' : 'transfer')
  if (timePhase === 'activate') {
    const hour = integer(random, 1, 12)
    const minute = pick(random, [0, 30])
    correctAnswer = 'Der lange Zeiger zeigt die Minuten.'
    taskPrompt = 'Welcher Zeiger zeigt die Minuten?'
    quantityExplanation = 'Der lange Zeiger erreicht die Minutenmarken am Rand. Der kürzere Zeiger zeigt die Stunde und wandert dabei weiter.'
    strategy = 'Vergleiche Form und Länge der beiden Zeiger.'
    subskillId = 'time-hand-roles'
    representationValues = { mode: 'read', hour, minute, answerLabel: correctAnswer }
    options = textOptions(random, correctAnswer, [
      { value: 'Der kurze Zeiger zeigt die Minuten.', misconception: 'Stunden- und Minutenzeiger werden vertauscht.', misconceptionId: 'time-hands-swapped' },
      { value: 'Beide Zeiger zeigen immer dasselbe.', misconception: 'Stunden- und Minutenzeiger werden vertauscht.', misconceptionId: 'time-hands-swapped' }
    ])
  } else if (timePhase !== 'transfer') {
    const hour = integer(random, 1, 12)
    const minute = timePhase === 'understand'
      ? 0
      : timePhase === 'guided-practice'
        ? 30
        : timePhase === 'independent-practice'
          ? pick(random, [15, 45])
          : pick(random, [5, 10, 20, 25, 35, 40, 50, 55])
    correctAnswer = formatClockTime(hour, minute)
    taskPrompt = minute === 30
      ? 'Welche digitale Uhrzeit zeigt die Uhr? Der kurze Zeiger steht zwischen zwei Stunden.'
      : content.readPrompt
    quantityExplanation = renderCatalogText(content.readExplanation, { time: correctAnswer })
    strategy = timePhase === 'understand'
      ? 'Der lange Zeiger steht für 00 Minuten auf der 12. Der kurze Zeiger zeigt genau auf die volle Stunde.'
      : timePhase === 'guided-practice'
        ? 'Bei einer halben Stunde steht der lange Zeiger auf 6 und der kurze genau zwischen zwei Stundenzahlen. „Halb zwei“ ist 01:30 Uhr.'
        : timePhase === 'independent-practice'
          ? 'Die 3 bedeutet 15 Minuten, die 6 bedeutet 30 Minuten und die 9 bedeutet 45 Minuten.'
          : 'Lies den langen Zeiger in Fünferschritten und prüfe danach, wie weit der kurze Zeiger schon gewandert ist.'
    subskillId = timePhase === 'understand' ? 'time-full-hours' : timePhase === 'guided-practice' ? 'time-full-half-hours' : timePhase === 'independent-practice' ? 'time-quarter-hours' : 'time-five-minute-reading'
    representationValues = { mode: 'read', hour, minute, answerLabel: correctAnswer }
    options = textOptions(random, correctAnswer, [
      { value: formatClockTime(hour === 12 ? 1 : hour + 1, minute), misconception: 'Stunden- und Minutenzeiger werden vertauscht.', misconceptionId: 'time-hands-swapped' },
      { value: formatClockTime(hour, (minute + 15) % 60), misconception: 'Stunden- und Minutenzeiger werden vertauscht.', misconceptionId: 'time-hands-swapped' },
      { value: formatClockTime(hour === 1 ? 12 : hour - 1, minute), misconception: 'Stunden- und Minutenzeiger werden vertauscht.', misconceptionId: 'time-hands-swapped' }
    ])
  } else {
    const startMinutes = integer(random, 32, 62) * 15
    const durationMinutes = pick(random, [15, 30, 45, 60, 75, 90])
    const endMinutes = startMinutes + durationMinutes
    const startHour = Math.floor(startMinutes / 60)
    const startMinute = startMinutes % 60
    const endHour = Math.floor(endMinutes / 60)
    const endMinute = endMinutes % 60
    const startTime = formatClockTime(startHour, startMinute)
    const endTime = formatClockTime(endHour, endMinute)
    correctAnswer = String(durationMinutes)
    taskPrompt = renderCatalogText(content.durationPrompt, { startTime, endTime })
    quantityExplanation = renderCatalogText(content.durationExplanation, { startTime, endTime, duration: `${durationMinutes} Minuten` })
    strategy = 'Gehe von der Startzeit zuerst zur nächsten Viertel- oder vollen Stunde und dann bis zur Endzeit weiter.'
    subskillId = 'time-forward-duration'
    representationValues = { mode: 'duration', startHour, startMinute, endHour, endMinute, answerLabel: `${durationMinutes} Minuten` }
    options = numberOptions(random, durationMinutes, [
      { value: durationMinutes - 15, misconception: 'Eine Viertelstunde ausgelassen' },
      { value: durationMinutes + 15, misconception: 'Eine Viertelstunde zu viel gezählt' },
      { value: Math.abs(endMinute - startMinute), misconception: 'Bei einer Zeitspanne werden nur die Minutenzahlen voneinander abgezogen.', misconceptionId: 'time-duration-minute-difference' }
    ]).map((option) => ({ ...option, label: `${option.value} Minuten` }))
  }
  const values = { taskPrompt, quantityExplanation, strategy, answer: correctAnswer }
  return withMetadata({
    ...base('time', seed, difficulty, values),
    ...contentFor('time', values, difficulty),
    typeId: timePhase === 'activate' ? 'time-identify-hand' : timePhase === 'understand' ? 'time-full-hour' : timePhase === 'guided-practice' ? 'time-half-hour' : timePhase === 'independent-practice' ? 'time-quarter-hour' : timePhase === 'automate' ? 'time-five-minute' : 'time-duration',
    subskillId,
    answerMode: 'choice',
    correctAnswer,
    options,
    representation: representation('time', difficulty, 'clock', difficulty === 3 ? content.durationLabel : content.clockLabel, representationValues, ['answerLabel'])
  })
}

export function formatBaseQuantity(value: number, quantity: 'mass' | 'capacity'): string {
  if (!Number.isInteger(value) || value < 0 || value > 1000) throw new RangeError('Die Grundmenge muss zwischen 0 und 1000 liegen.')
  if (value === 1000) return quantity === 'mass' ? '1 kg' : '1 l'
  return `${value} ${quantity === 'mass' ? 'g' : 'ml'}`
}

function measurementQuantity(skillId: 'mass' | 'capacity', seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  const content = getTaskCatalog().quantityContent[skillId]
  let correctAnswer: string
  let options: AnswerOption[]
  let taskPrompt: string
  let quantityExplanation: string
  let strategy: string
  let subskillId: string
  let representationValues: ExerciseRepresentation['values']
  if (difficulty === 1) {
    const estimate = pick(random, content.referenceEstimates)
    correctAnswer = estimate.correct
    taskPrompt = renderCatalogText(content.referencePrompt, { item: estimate.label })
    quantityExplanation = renderCatalogText(content.referenceExplanation, { item: estimate.label, quantityAnswer: correctAnswer })
    strategy = `Vergleiche ${estimate.label} mit einer bekannten Bezugsgröße. ${content.equivalenceLabel}.`
    subskillId = `${skillId}-reference-estimate`
    representationValues = { mode: 'reference', quantityType: skillId, itemLabel: estimate.label, equivalenceLabel: content.equivalenceLabel, answerLabel: correctAnswer }
    options = shuffle(random, estimate.options.map((value) => ({
      value,
      label: value,
      misconception: value === correctAnswer ? undefined : 'Unpassende Größenordnung oder Einheit gewählt'
    })))
  } else {
    const operation = difficulty === 2 ? 'complement' : random() < 0.5 ? '+' : '−'
    let firstBase: number
    let secondBase: number
    let answerBase: number
    if (operation === 'complement') {
      firstBase = integer(random, 2, 18) * 50
      secondBase = 1000
      answerBase = secondBase - firstBase
    } else if (operation === '+') {
      firstBase = integer(random, 2, 14) * 50
      secondBase = integer(random, 1, Math.max(1, 20 - firstBase / 50)) * 50
      answerBase = firstBase + secondBase
    } else {
      firstBase = integer(random, 6, 20) * 50
      secondBase = integer(random, 1, firstBase / 50 - 1) * 50
      answerBase = firstBase - secondBase
    }
    correctAnswer = formatBaseQuantity(answerBase, skillId)
    const firstAmount = formatBaseQuantity(firstBase, skillId)
    const secondAmount = formatBaseQuantity(secondBase, skillId)
    if (operation === 'complement') {
      taskPrompt = renderCatalogText(content.complementPrompt, { knownAmount: firstAmount, targetAmount: secondAmount })
      quantityExplanation = renderCatalogText(content.complementExplanation, { knownAmount: firstAmount, targetAmount: secondAmount, quantityAnswer: correctAnswer })
      strategy = `Ergänze in passenden Schritten bis 1000. ${content.equivalenceLabel}.`
      subskillId = `${skillId}-complement-to-1000`
      representationValues = { mode: 'complement', quantityType: skillId, knownAmountBase: firstBase, targetAmountBase: secondBase, unitLabel: skillId === 'mass' ? 'g' : 'ml', equivalenceLabel: content.equivalenceLabel, answerLabel: correctAnswer }
    } else {
      taskPrompt = renderCatalogText(content.calculationPrompt, { firstAmount, secondAmount, operation })
      quantityExplanation = renderCatalogText(content.calculationExplanation, { firstAmount, secondAmount, operation, quantityAnswer: correctAnswer })
      strategy = `Rechne beide bekannten Mengen in ${skillId === 'mass' ? 'Gramm' : 'Millilitern'} ${operation === '+' ? 'zusammen' : 'voneinander ab'}.`
      subskillId = operation === '+' ? `${skillId}-addition` : `${skillId}-difference`
      representationValues = { mode: 'calculation', quantityType: skillId, firstAmountBase: firstBase, secondAmountBase: secondBase, operation, unitLabel: skillId === 'mass' ? 'g' : 'ml', equivalenceLabel: content.equivalenceLabel, answerLabel: correctAnswer }
    }
    const wrongOperation = operation === '+' ? Math.abs(firstBase - secondBase) : operation === '−' ? firstBase + secondBase : firstBase
    options = textOptions(random, correctAnswer, [
      { value: formatBaseQuantity(Math.max(0, answerBase - 50), skillId), misconception: 'Einen 50er-Schritt ausgelassen' },
      { value: formatBaseQuantity(Math.min(1000, answerBase + 50), skillId), misconception: 'Einen 50er-Schritt zu viel gezählt' },
      { value: formatBaseQuantity(Math.min(1000, wrongOperation), skillId), misconception: 'Rechenbeziehung verwechselt' }
    ])
  }
  const values = { taskPrompt, quantityExplanation, strategy, quantityAnswer: correctAnswer }
  return withMetadata({
    ...base(skillId, seed, difficulty, values),
    ...contentFor(skillId, values, difficulty),
    typeId: difficulty === 1 ? `${skillId}-reference` : difficulty === 2 ? `${skillId}-complement` : `${skillId}-calculate`,
    subskillId,
    answerMode: 'choice',
    correctAnswer,
    options,
    representation: representation(skillId, difficulty, skillId === 'mass' ? 'mass-scale' : 'capacity-vessel', content.displayLabel, representationValues, ['answerLabel'])
  })
}

function planeShapes(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  const content = getTaskCatalog().planeGeometry
  const shapeTypes = ['square', 'rectangle', 'triangle'] as const
  let correctAnswer: string
  let taskPrompt: string
  let typeId: string
  let subskillId: string
  let representationValues: ExerciseRepresentation['values']
  let options: AnswerOption[]
  if (difficulty === 1) {
    const shapeType = pick(random, shapeTypes)
    correctAnswer = content.shapeLabels[shapeType]
    taskPrompt = 'Welche ebene Figur siehst du?'
    typeId = 'shape-identify'
    subskillId = 'shape-recognition'
    representationValues = { mode: 'identify', shapeType, answerLabel: correctAnswer }
    options = textOptions(random, correctAnswer, shapeTypes.filter((candidate) => candidate !== shapeType).map((candidate) => ({ value: content.shapeLabels[candidate], misconception: 'Außenform anhand eines falschen Merkmals bestimmt' })))
  } else if (difficulty === 2) {
    const shapeType = pick(random, ['square', 'rectangle'] as const)
    const partCount = random() < 0.55 ? 2 : 4
    correctAnswer = String(partCount)
    taskPrompt = 'In wie viele Teile ist die ganze Figur sichtbar zerlegt?'
    typeId = 'shape-decompose'
    subskillId = 'shape-decomposition'
    representationValues = { mode: 'decompose', shapeType, partCount, answerLabel: correctAnswer }
    options = numberOptions(random, partCount, [
      { value: partCount === 2 ? 3 : 2, misconception: 'Außenbereiche statt Teilflächen gezählt' },
      { value: partCount + 1, misconception: 'Außenrand als zusätzliche Teilung gezählt' },
      { value: partCount * 2, misconception: 'Jede sichtbare Linie doppelt gezählt' }
    ])
  } else {
    const shapeType = pick(random, ['square', 'rectangle'] as const)
    correctAnswer = content.shapeLabels[shapeType]
    taskPrompt = 'Welche ganze Außenform entsteht aus den beiden sichtbaren Teilen?'
    typeId = 'shape-compose'
    subskillId = 'shape-composition'
    representationValues = { mode: 'compose', shapeType, partCount: 2, answerLabel: correctAnswer }
    options = textOptions(random, correctAnswer, shapeTypes.filter((candidate) => candidate !== shapeType).map((candidate) => ({ value: content.shapeLabels[candidate], misconception: 'Teilform statt äußerer Gesamtform gewählt' })))
  }
  const values = {
    taskPrompt,
    answer: correctAnswer,
    shapeModel: String(representationValues.shapeType),
    partCount: Number(representationValues.partCount ?? 0)
  }
  return withMetadata({
    ...base('plane-shapes', seed, difficulty, values),
    ...contentFor('plane-shapes', values, difficulty),
    typeId,
    subskillId,
    answerMode: 'choice',
    correctAnswer,
    options,
    representation: representation('plane-shapes', difficulty, 'shape-grid', content.displayLabels.shape, representationValues, ['answerLabel'])
  })
}

function patterns(seed: number, difficulty: Difficulty, phase?: LearningPhase): Exercise {
  const random = seededRandom(seed)
  const content = getTaskCatalog().planeGeometry
  const symbols = shuffle(random, [...content.patternSymbols])
  const block = difficulty === 1 ? symbols.slice(0, 2) : difficulty === 2 ? symbols.slice(0, 3) : [symbols[0]!, symbols[0]!, symbols[1]!]
  const visibleLength = difficulty === 1 ? 5 : 7
  const sequence = Array.from({ length: visibleLength }, (_, index) => block[index % block.length]!)
  const correctAnswer = block[visibleLength % block.length]!
  const taskPrompt = 'Welches Zeichen setzt das Muster richtig fort?'
  const values = {
    taskPrompt,
    answer: correctAnswer,
    blockLength: block.length,
    patternKey: sequence.join('|')
  }
  const options = textOptions(random, correctAnswer, symbols.filter((symbol) => symbol !== correctAnswer).map((symbol) => ({ value: symbol, misconception: 'Musterblock an der falschen Stelle fortgesetzt' })))
  const shared = { ...base('patterns', seed, difficulty, values), ...contentFor('patterns', values, difficulty) }
  const strip = (shown: string[], answerLabel = correctAnswer) => representation('patterns', difficulty, 'pattern-strip', content.displayLabels.pattern, {
    sequenceCount: shown.length,
    blockLength: block.length,
    answerLabel,
    highlightBlocks: phase === 'activate' || phase === 'understand' ? 1 : 0,
    taskMode: phase === 'transfer' ? 'identify-error' : 'continue',
    ...Object.fromEntries(shown.map((symbol, index) => [`symbol${index}`, symbol]))
  }, ['answerLabel'])
  if (phase === 'activate') {
    const correctBlock = block.join(' – ')
    return withMetadata({
      ...shared,
      typeId: 'pattern-activate-find-block', subskillId: difficulty === 1 ? 'pattern-ab' : 'pattern-abc',
      prompt: 'Welcher kleinste Block wiederholt sich?', answerMode: 'choice', correctAnswer: correctBlock,
      options: textOptions(random, correctBlock, [
        { value: block[block.length - 1]!, misconception: 'Nur das letzte Zeichen wird wiederholt.', misconceptionId: 'patterns-repeat-last' },
        { value: [...block].reverse().join(' – '), misconception: 'Die Reihenfolge innerhalb des Musterblocks wird vertauscht.', misconceptionId: 'patterns-block-order' },
        { value: sequence.slice(0, block.length + 1).join(' – '), misconception: 'Nur das letzte Zeichen wird wiederholt.', misconceptionId: 'patterns-repeat-last' }
      ]), representation: strip(sequence)
    })
  }
  if (phase === 'understand') {
    const restart = block.length + 1
    return withMetadata({
      ...shared,
      typeId: 'pattern-understand-restart', subskillId: difficulty === 1 ? 'pattern-ab' : 'pattern-abc',
      prompt: 'An welcher Stelle beginnt der Musterblock zum ersten Mal wieder von vorn?', answerMode: 'choice', correctAnswer: String(restart),
      options: numberOptions(random, restart, [
        { value: block.length, misconception: 'Nur das letzte Zeichen wird wiederholt.', misconceptionId: 'patterns-repeat-last' },
        { value: block.length + 2, misconception: 'Die Reihenfolge innerhalb des Musterblocks wird vertauscht.', misconceptionId: 'patterns-block-order' },
        { value: 1, misconception: 'Nur das letzte Zeichen wird wiederholt.', misconceptionId: 'patterns-repeat-last' }
      ]), representation: strip(sequence)
    })
  }
  if (phase === 'transfer') {
    const errorIndex = Math.min(sequence.length - 2, block.length + 1)
    const corrupted = [...sequence]
    corrupted[errorIndex] = symbols.find((symbol) => symbol !== sequence[errorIndex])!
    const correctPosition = String(errorIndex + 1)
    return withMetadata({
      ...shared,
      typeId: 'pattern-transfer-identify-error', subskillId: 'pattern-complex-block',
      prompt: 'An welcher Stelle ist der Musterfehler?', answerMode: 'choice', correctAnswer: correctPosition,
      options: numberOptions(random, errorIndex + 1, [
        { value: Math.max(1, errorIndex), misconception: 'Die Reihenfolge innerhalb des Musterblocks wird vertauscht.', misconceptionId: 'patterns-block-order' },
        { value: errorIndex + 2, misconception: 'Nur das letzte Zeichen wird wiederholt.', misconceptionId: 'patterns-repeat-last' },
        { value: block.length, misconception: 'Die Reihenfolge innerhalb des Musterblocks wird vertauscht.', misconceptionId: 'patterns-block-order' }
      ]), representation: strip(corrupted, correctPosition)
    })
  }
  return withMetadata({
    ...shared,
    typeId: difficulty === 1 ? 'pattern-ab' : difficulty === 2 ? 'pattern-abc' : 'pattern-repeated-element',
    subskillId: difficulty === 1 ? 'pattern-ab' : difficulty === 2 ? 'pattern-abc' : 'pattern-complex-block',
    answerMode: 'choice',
    correctAnswer,
    options,
    representation: strip(sequence)
  })
}

const IRREGULAR_UNIT_FIGURES = [
  { rows: 3, columns: 4, cells: [1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1] },
  { rows: 4, columns: 4, cells: [1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1] },
  { rows: 3, columns: 5, cells: [0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1] }
] as const

function unitFigure(random: () => number, difficulty: Difficulty) {
  if (difficulty === 3) return pick(random, IRREGULAR_UNIT_FIGURES)
  const rows = difficulty === 1 ? 2 : 3
  const columns = difficulty === 1 ? integer(random, 2, 4) : integer(random, 3, 5)
  return { rows, columns, cells: Array.from({ length: rows * columns }, () => 1) }
}

function area(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  const content = getTaskCatalog().planeGeometry
  const figure = unitFigure(random, difficulty)
  const answer = areaInUnitSquares(figure.rows, figure.columns, [...figure.cells])
  const taskPrompt = 'Wie viele Einheitsquadrate bedecken die grüne Fläche?'
  const values = {
    taskPrompt,
    answer,
    rows: figure.rows,
    columns: figure.columns,
    figureKey: figure.cells.join('')
  }
  return withMetadata({
    ...base('area', seed, difficulty, values),
    ...contentFor('area', values, difficulty),
    typeId: difficulty === 3 ? 'area-irregular-unit-squares' : 'area-rectangle-unit-squares',
    subskillId: difficulty === 3 ? 'area-irregular' : 'area-structured-count',
    answerMode: 'choice',
    correctAnswer: String(answer),
    options: numberOptions(random, answer, [
      { value: answer - 1, misconception: 'Ein gefülltes Feld ausgelassen' },
      { value: answer + 1, misconception: 'Ein leeres Feld mitgezählt' },
      { value: figure.rows + figure.columns, misconception: 'Reihen und Spalten addiert' }
    ]),
    representation: representation('area', difficulty, 'unit-squares', content.displayLabels.area, { rows: figure.rows, columns: figure.columns, cells: [...figure.cells], answerLabel: String(answer) }, ['answerLabel'])
  })
}

function perimeter(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  const content = getTaskCatalog().planeGeometry
  const figure = unitFigure(random, difficulty)
  const cells = [...figure.cells]
  const answer = perimeterInUnitEdges(figure.rows, figure.columns, cells)
  const areaValue = areaInUnitSquares(figure.rows, figure.columns, cells)
  const taskPrompt = 'Wie viele Längeneinheiten ist der vollständig markierte Außenrand lang?'
  const values = {
    taskPrompt,
    answer,
    rows: figure.rows,
    columns: figure.columns,
    figureKey: figure.cells.join('')
  }
  return withMetadata({
    ...base('perimeter', seed, difficulty, values),
    ...contentFor('perimeter', values, difficulty),
    typeId: difficulty === 3 ? 'perimeter-irregular-path' : 'perimeter-rectangle-path',
    subskillId: difficulty === 3 ? 'perimeter-irregular' : 'perimeter-trace-border',
    answerMode: 'choice',
    correctAnswer: String(answer),
    options: numberOptions(random, answer, [
      { value: answer - 2, misconception: 'Eine Randseite ausgelassen' },
      { value: answer + 2, misconception: 'Eine Innenkante mitgezählt' },
      { value: areaValue, misconception: 'Einheitsquadrate statt Randkanten gezählt' }
    ]),
    representation: representation('perimeter', difficulty, 'perimeter-path', content.displayLabels.perimeter, { rows: figure.rows, columns: figure.columns, cells, answerLabel: String(answer) }, ['answerLabel'])
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
      values: { rows: candidate.grid.length, columns: candidate.grid[0]!.length, cells: candidate.grid.flat() },
      valueRoles: { knownValues: ['rows', 'columns', 'cells'], unknownValues: [], revealedValues: [] }
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
      values: { width: template.width, depth: template.depth, heights: template.heights },
      valueRoles: { knownValues: ['width', 'depth', 'heights'], unknownValues: ['view'], revealedValues: [] }
    },
    explanation: `${content.directionGuidance[direction]} ${skillContent.explanation}`
  })
}

function cubeRotation(seed: number, difficulty: Difficulty, focus?: string): Exercise {
  const random = seededRandom(seed)
  const content = getTaskCatalog().spatialRotations
  const requestedTurn = focus === 'cube-rotation-left' ? 'left' : focus === 'cube-rotation-right' ? 'right' : undefined
  const levelCandidates = content.templates.filter((template) => template.difficulty === difficulty)
  const focusedCandidates = requestedTurn ? levelCandidates.filter((template) => template.turn === requestedTurn) : levelCandidates
  const candidates = focusedCandidates.length > 0 ? focusedCandidates : levelCandidates
  if (candidates.length === 0) throw new Error(`Keine Würfelrotation-Vorlage für Stufe ${difficulty}.`)
  const template = pick(random, candidates)
  const turn = template.turn as CubeTurnDirection
  const correct = rotateCubeBuilding(template, turn)
  const distractors = createCubeRotationDistractors(template, turn)
  const turnLabel = content.turnLabels[turn]
  const values = { turnLabel, turn, cubes: cubeCount(template), templateId: template.id }
  const shuffled = shuffle<{ building: typeof correct; misconception?: string }>(random, [
    { building: correct },
    ...distractors
  ])
  const options = shuffled.map((candidate, index): AnswerOption => ({
    value: cubeBuildingKey(candidate.building),
    label: content.optionLabels[index]!,
    misconception: candidate.misconception,
    representation: {
      kind: 'cube-building',
      visibility: 'always',
      label: `${content.optionLabels[index]}: Würfelgebäude nach der Drehung`,
      values: {
        width: candidate.building.width,
        depth: candidate.building.depth,
        heights: candidate.building.heights
      },
      valueRoles: { knownValues: ['width', 'depth', 'heights'], unknownValues: [], revealedValues: [] }
    }
  }))
  const skillContent = contentFor('cube-rotation', values, difficulty)
  return withMetadata({
    ...base('cube-rotation', seed, difficulty, values),
    ...skillContent,
    prompt: renderCatalogText(content.prompt, values),
    typeId: 'cube-building-quarter-turn',
    subskillId: `cube-rotation-${turn}`,
    answerMode: 'choice',
    correctAnswer: cubeBuildingKey(correct),
    options,
    representation: {
      kind: 'cube-rotation',
      visibility: 'always',
      label: `${cubeCount(template)} Würfel. ${turnLabel} um die senkrechte Achse.`,
      values: {
        width: template.width,
        depth: template.depth,
        heights: template.heights,
        turn,
        turnLabel,
        axisLabel: content.axisLabel
      },
      valueRoles: { knownValues: ['width', 'depth', 'heights', 'turn', 'turnLabel', 'axisLabel'], unknownValues: ['rotated-building'], revealedValues: [] }
    },
    explanation: `${content.turnGuidance[turn]} ${skillContent.explanation}`
  })
}

function folding(seed: number, difficulty: Difficulty, focus?: string): Exercise {
  const random = seededRandom(seed)
  const content = getTaskCatalog().spatialFolding
  const requestedMode = focus === 'fold-cut-unfold' ? 'cut-unfold' : focus === 'fold-point' ? 'point-fold' : undefined
  const levelCandidates = content.templates.filter((template) => template.difficulty === difficulty)
  const focusedCandidates = requestedMode ? levelCandidates.filter((template) => template.mode === requestedMode) : levelCandidates
  const candidates = focusedCandidates.length > 0 ? focusedCandidates : levelCandidates
  if (candidates.length === 0) throw new Error(`Keine Faltvorlage für Stufe ${difficulty}.`)
  const template = pick(random, candidates)
  const outcomes = createFoldingOutcomes(template as FoldingTemplate)
  const values = {
    templateId: template.id,
    foldLabel: content.foldLabels[template.foldSide],
    axis: template.axis,
    mode: template.mode
  }
  const resultCandidates = shuffle<{ cells: number[]; misconception?: string }>(random, [
    { cells: outcomes.correct },
    {
      cells: outcomes.unchanged,
      misconception: template.mode === 'point-fold' ? 'Punkt bleibt trotz Faltung am Ausgangsort' : 'Beim Aufklappen entsteht kein Spiegelpunkt'
    },
    {
      cells: outcomes.shifted,
      misconception: template.mode === 'point-fold' ? 'Punkt wird verschoben statt gespiegelt' : 'Zweiter Schnitt wird verschoben statt gespiegelt'
    }
  ])
  const options = resultCandidates.map((candidate, index): AnswerOption => ({
    value: foldingCellsKey(candidate.cells),
    label: content.optionLabels[index]!,
    misconception: candidate.misconception,
    representation: {
      kind: 'folding-paper',
      visibility: 'always',
      label: `${content.optionLabels[index]}: ${template.mode === 'point-fold' ? 'Lage des Punktes nach dem Falten' : 'Lage der Schnitte nach dem Aufklappen'}`,
      values: {
        rows: template.rows,
        columns: template.columns,
        axis: template.axis,
        foldSide: template.foldSide,
        mode: template.mode,
        marks: candidate.cells,
        showInstruction: 0,
        axisLabel: content.axisLabel,
        foldLabel: content.foldLabels[template.foldSide]
      },
      valueRoles: { knownValues: ['rows', 'columns', 'axis', 'foldSide', 'mode', 'marks', 'showInstruction', 'axisLabel', 'foldLabel'], unknownValues: [], revealedValues: [] }
    }
  }))
  const skillContent = contentFor('folding', values, difficulty)
  return withMetadata({
    ...base('folding', seed, difficulty, values),
    ...skillContent,
    prompt: renderCatalogText(template.mode === 'point-fold' ? content.pointPrompt : content.cutPrompt, values),
    typeId: template.mode,
    subskillId: template.mode === 'point-fold' ? 'fold-point' : 'fold-cut-unfold',
    answerMode: 'choice',
    correctAnswer: foldingCellsKey(outcomes.correct),
    options,
    representation: {
      kind: 'folding-paper',
      visibility: 'always',
      label: `${template.instruction} ${content.axisLabel}.`,
      values: {
        rows: template.rows,
        columns: template.columns,
        axis: template.axis,
        foldSide: template.foldSide,
        mode: template.mode,
        marks: [template.sourceCell],
        showInstruction: 1,
        axisLabel: content.axisLabel,
        foldLabel: content.foldLabels[template.foldSide]
      },
      valueRoles: { knownValues: ['rows', 'columns', 'axis', 'foldSide', 'mode', 'marks', 'showInstruction', 'axisLabel', 'foldLabel'], unknownValues: ['targetCells'], revealedValues: [] }
    },
    explanation: `${content.modeGuidance[template.mode]} ${skillContent.explanation}`
  })
}

function dataDisplayRepresentation(
  displayType: DataDisplayType,
  template: DataSetTemplate,
  dataValues: number[],
  label: string,
  hiddenIndex = -1,
  total = dataValues.reduce((sum, value) => sum + value, 0),
  unknownValues: string[] = [],
  scaleMax = Math.max(...dataValues)
): ExerciseRepresentation {
  const displayedValues = hiddenIndex >= 0
    ? dataValues.map((value, index) => index === hiddenIndex ? -1 : value)
    : dataValues
  const values: ExerciseRepresentation['values'] = {
    displayType,
    title: template.title,
    category0: template.categories[0],
    category1: template.categories[1],
    category2: template.categories[2],
    dataValues: displayedValues,
    unitLabel: template.unitLabel,
    symbolLabel: template.symbolLabel,
    totalLabel: getTaskCatalog().dataAndCharts.totalLabel,
    hiddenIndex,
    total,
    scaleMax
  }
  if (hiddenIndex >= 0) values.missingValue = dataValues[hiddenIndex]!
  const hiddenRoles = hiddenIndex >= 0 ? [...unknownValues, 'missingValue'] : unknownValues
  return {
    kind: 'data-display',
    visibility: 'always',
    label,
    values,
    valueRoles: {
      knownValues: Object.keys(values).filter((key) => key !== 'missingValue'),
      unknownValues: hiddenRoles,
      revealedValues: []
    }
  }
}

function dataExerciseValues(template: DataSetTemplate, values: number[], targetIndex: number): Record<string, number | string> {
  return {
    templateId: template.id,
    title: template.title,
    first: values[0]!,
    second: values[1]!,
    third: values[2]!,
    category: template.categories[targetIndex]!,
    answer: values[targetIndex]!,
    unitLabel: template.unitLabel
  }
}

function readTables(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  const content = getTaskCatalog().dataAndCharts
  const template = pick(random, content.templates)
  const dataValues = varyDataValues(template, seed)
  const targetIndex = integer(random, 0, 2)
  const generatedValues = dataExerciseValues(template, dataValues, targetIndex)
  const generatedContent = contentFor('read-tables', generatedValues, difficulty)

  if (difficulty === 1) {
    const answer = dataValues[targetIndex]!
    return withMetadata({
      ...base('read-tables', seed, difficulty, generatedValues),
      ...generatedContent,
      prompt: renderCatalogText(content.prompts.tableRead, generatedValues),
      typeId: 'table-read',
      subskillId: 'table-read-value',
      answerMode: 'choice',
      correctAnswer: String(answer),
      options: numberOptions(random, answer, createDataDistractors(answer, dataValues).map((value) => ({ value, misconception: content.distractorFeedback.wrongRow }))),
      representation: dataDisplayRepresentation('table', template, dataValues, `${content.displayLabels.table}: ${template.title}`)
    })
  }

  const largest = Math.max(...dataValues)
  const smallest = Math.min(...dataValues)
  const largestIndex = dataValues.indexOf(largest)
  const smallestIndex = dataValues.indexOf(smallest)
  if (difficulty === 2) {
    const answer = largest - smallest
    return withMetadata({
      ...base('read-tables', seed, difficulty, { ...generatedValues, answer, larger: template.categories[largestIndex]!, smaller: template.categories[smallestIndex]! }),
      ...generatedContent,
      prompt: renderCatalogText(content.prompts.tallyCompare, { ...generatedValues, larger: template.categories[largestIndex]!, smaller: template.categories[smallestIndex]! }),
      typeId: 'tally-compare',
      subskillId: 'tally-compare-values',
      answerMode: 'choice',
      correctAnswer: String(answer),
      options: numberOptions(random, answer, createDataDistractors(answer, [largest, smallest]).map((value) => ({ value, misconception: content.distractorFeedback.wrongDifference }))),
      representation: dataDisplayRepresentation('tally', template, dataValues, `${content.displayLabels.tally}: ${template.title}`, -1, largest + smallest, ['difference'])
    })
  }

  const total = dataValues.reduce((sum, value) => sum + value, 0)
  const answer = dataValues[targetIndex]!
  return withMetadata({
    ...base('read-tables', seed, difficulty, { ...generatedValues, total }),
    ...generatedContent,
    prompt: renderCatalogText(content.prompts.tableMissing, { ...generatedValues, total }),
    typeId: 'table-missing',
    subskillId: 'table-complete-total',
    answerMode: 'choice',
    correctAnswer: String(answer),
    options: numberOptions(random, answer, createDataDistractors(answer, dataValues).map((value) => ({ value, misconception: content.distractorFeedback.wrongCompletion }))),
    representation: dataDisplayRepresentation('table', template, dataValues, `${content.displayLabels.table}: ${template.title}`, targetIndex, total, ['missing-value'])
  })
}

function readCharts(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  const content = getTaskCatalog().dataAndCharts
  const template = pick(random, content.templates)
  const dataValues = varyDataValues(template, seed)
  const targetIndex = integer(random, 0, 2)
  const generatedValues = dataExerciseValues(template, dataValues, targetIndex)
  const generatedContent = contentFor('read-charts', generatedValues, difficulty)

  if (difficulty === 1) {
    const answer = dataValues[targetIndex]!
    return withMetadata({
      ...base('read-charts', seed, difficulty, generatedValues),
      ...generatedContent,
      prompt: renderCatalogText(content.prompts.pictogramRead, generatedValues),
      typeId: 'pictogram-read',
      subskillId: 'pictogram-read-one-to-one',
      answerMode: 'choice',
      correctAnswer: String(answer),
      options: numberOptions(random, answer, createDataDistractors(answer, dataValues).map((value) => ({ value, misconception: content.distractorFeedback.wrongPictogram }))),
      representation: dataDisplayRepresentation('pictogram', template, dataValues, `${content.displayLabels.pictogram}: ${template.title}`)
    })
  }

  const largest = Math.max(...dataValues)
  const smallest = Math.min(...dataValues)
  const largestIndex = dataValues.indexOf(largest)
  const smallestIndex = dataValues.indexOf(smallest)
  if (difficulty === 2) {
    const answer = largest - smallest
    return withMetadata({
      ...base('read-charts', seed, difficulty, { ...generatedValues, answer, larger: template.categories[largestIndex]!, smaller: template.categories[smallestIndex]! }),
      ...generatedContent,
      prompt: renderCatalogText(content.prompts.barCompare, { ...generatedValues, larger: template.categories[largestIndex]!, smaller: template.categories[smallestIndex]! }),
      typeId: 'bar-compare',
      subskillId: 'bar-compare-values',
      answerMode: 'choice',
      correctAnswer: String(answer),
      options: numberOptions(random, answer, createDataDistractors(answer, [largest, smallest]).map((value) => ({ value, misconception: content.distractorFeedback.wrongBarDifference }))),
      representation: dataDisplayRepresentation('bar', template, dataValues, `${content.displayLabels.bar}: ${template.title}`, -1, largest + smallest, ['difference'])
    })
  }

  const swapped = [...dataValues] as [number, number, number]
  const swappablePair = ([[0, 1], [0, 2], [1, 2]] as const).find(([first, second]) => dataValues[first] !== dataValues[second])
  if (swappablePair) {
    const [first, second] = swappablePair
    ;[swapped[first], swapped[second]] = [swapped[second], swapped[first]]
  } else {
    swapped[0] = swapped[0] === 12 ? 11 : swapped[0] + 1
  }
  const changed: [number, number, number] = [...dataValues] as [number, number, number]
  changed[2] = changed[2] === 12 ? 11 : changed[2] + 1
  if (sameDataValues(swapped, dataValues) || sameDataValues(changed, dataValues)) throw new Error('Diagramm-Distraktoren sind nicht unterscheidbar.')
  const candidates = shuffle(random, [
    { value: 'same', values: dataValues, misconception: undefined },
    { value: 'swapped', values: swapped, misconception: content.distractorFeedback.swappedCategories },
    { value: 'changed', values: changed, misconception: content.distractorFeedback.changedValue }
  ])
  const sharedScaleMaximum = Math.max(...candidates.flatMap((candidate) => candidate.values))
  const options = candidates.map((candidate, index) => ({
    value: candidate.value,
    label: `Diagramm ${String.fromCharCode(65 + index)}`,
    misconception: candidate.misconception,
    representation: dataDisplayRepresentation('bar', template, candidate.values, `Diagramm ${String.fromCharCode(65 + index)} zu ${template.title}`, -1, candidate.values.reduce((sum, value) => sum + value, 0), [], sharedScaleMaximum)
  }))
  return withMetadata({
    ...base('read-charts', seed, difficulty, generatedValues),
    ...generatedContent,
    prompt: content.prompts.representationMatch,
    typeId: 'representation-match',
    subskillId: 'table-to-bar-match',
    answerMode: 'choice',
    correctAnswer: 'same',
    options,
    representation: dataDisplayRepresentation('table', template, dataValues, `${content.displayLabels.table}: ${template.title}`, -1, dataValues.reduce((sum, value) => sum + value, 0), ['matching-display'])
  })
}

function chanceRepresentation(template: ProbabilityTemplate): ExerciseRepresentation {
  const values: ExerciseRepresentation['values'] = {
    experimentType: template.experimentType,
    title: template.title,
    outcomeCount: template.outcomes.length
  }
  template.outcomes.forEach((outcome, index) => { values[`outcome${index}`] = outcome })
  if (template.eventALabel) values.eventALabel = template.eventALabel
  if (template.eventBLabel) values.eventBLabel = template.eventBLabel
  return {
    kind: 'chance-display', visibility: 'always', label: `${getTaskCatalog().chanceContent.experimentLabels[template.experimentType]}: ${template.title}`,
    values, valueRoles: { knownValues: Object.keys(values), unknownValues: ['classification'], revealedValues: [] }
  }
}

function probability(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  const content = getTaskCatalog().chanceContent
  const templates = content.probabilityTemplates.filter((template) => template.difficulty === difficulty)
  const template = pick(random, templates)
  const generatedValues = { templateId: template.id, experimentType: template.experimentType, outcomeCount: template.outcomes.length }
  const generatedContent = contentFor('probability', generatedValues, difficulty)
  const correctAnswer = difficulty === 3
    ? compareEventFrequency(template.outcomes, template.eventA, template.eventB ?? [])
    : classifyEvent(template.outcomes, template.eventA)
  const labels = difficulty === 3 ? content.comparisonLabels : content.classificationLabels
  return withMetadata({
    ...base('probability', seed, difficulty, generatedValues), ...generatedContent,
    prompt: template.question,
    typeId: difficulty === 3 ? 'compare-events' : `classify-${template.experimentType}`,
    subskillId: difficulty === 1 ? 'chance-classify-visible' : difficulty === 2 ? 'chance-classify-experiment' : 'chance-compare-frequency',
    answerMode: 'choice', correctAnswer,
    options: shuffle(random, Object.entries(labels).map(([value, label]) => ({ value, label }))),
    representation: chanceRepresentation(template)
  })
}

function combinationRepresentation(template: CombinationTemplate): ExerciseRepresentation {
  const values: ExerciseRepresentation['values'] = {
    title: template.title,
    firstLabel: template.firstLabel,
    firstCount: template.firstOptions.length,
    secondLabel: template.secondLabel,
    secondCount: template.secondOptions.length,
    excludedLabel: getTaskCatalog().chanceContent.excludedLabel
  }
  template.firstOptions.forEach((option, index) => { values[`first${index}`] = option })
  template.secondOptions.forEach((option, index) => { values[`second${index}`] = option })
  if (template.excludedPair) {
    values.excludedFirst = template.excludedPair[0]
    values.excludedSecond = template.excludedPair[1]
  }
  return {
    kind: 'combination-display', visibility: 'always', label: template.title, values,
    valueRoles: { knownValues: Object.keys(values), unknownValues: ['combinationCount'], revealedValues: [] }
  }
}

function combinatorics(seed: number, difficulty: Difficulty, phase?: LearningPhase): Exercise {
  const random = seededRandom(seed)
  const templates = getTaskCatalog().chanceContent.combinationTemplates.filter((template) => template.difficulty === difficulty)
  const template = pick(random, templates)
  const answer = combinationCount(template)
  const generatedValues = { templateId: template.id, firstCount: template.firstOptions.length, secondCount: template.secondOptions.length, answer }
  const generatedContent = contentFor('combinatorics', generatedValues, difficulty)
  const allowedPairs = template.firstOptions.flatMap((first) => template.secondOptions
    .filter((second) => !template.excludedPair || template.excludedPair[0] !== first || template.excludedPair[1] !== second)
    .map((second) => ({ value: `${first} + ${second}`, label: `${first} mit ${second}` })))
  const pairingAnswer = allowedPairs.map((option) => option.value).sort().join('|')
  if (phase === 'activate') {
    const correct = allowedPairs[0]!
    return withMetadata({
      ...base('combinatorics', seed, difficulty, generatedValues), ...generatedContent,
      prompt: `Welche Auswahl nimmt genau eine Möglichkeit aus „${template.firstLabel}“ und eine aus „${template.secondLabel}“?`,
      typeId: 'combinations-identify-pair', subskillId: 'combinations-systematic', answerMode: 'choice', correctAnswer: correct.value,
      options: textOptions(random, correct.value, [
        { value: `${template.firstOptions[0]} + ${template.firstOptions[1] ?? template.firstOptions[0]}`, misconception: 'Optionen derselben Gruppe werden miteinander kombiniert.', misconceptionId: 'combinations-same-group' },
        { value: `${template.secondOptions[0]} + ${template.secondOptions[1] ?? template.secondOptions[0]}`, misconception: 'Optionen derselben Gruppe werden miteinander kombiniert.', misconceptionId: 'combinations-same-group' }
      ]).map((option) => ({ ...option, label: option.value.replace(' + ', ' mit ') })),
      representation: combinationRepresentation(template)
    })
  }
  const buildStep: ExerciseStep = {
    id: 'pairings', prompt: 'Baue alle erlaubten Paarungen. Halte eine Wahl links fest und gehe rechts der Reihe nach durch.',
    interaction: 'build-pairing', options: allowedPairs, expectedSelections: allowedPairs.map((option) => option.value), correctAnswer: pairingAnswer,
    errorFeedback: 'Es fehlt noch eine erlaubte Paarung. Gehe links und rechts der Reihe nach durch.',
    successFeedback: 'Alle erlaubten Paarungen sind vollständig und ohne Doppelung erfasst.'
  }
  const countStep: ExerciseStep = {
    id: 'count', prompt: 'Wie viele verschiedene Paarungen hast du gebaut?', interaction: 'select',
    options: numberOptions(random, answer, [
      { value: answer - 1, misconception: 'Eine Auswahl wird ausgelassen.', misconceptionId: 'combinations-missing' },
      { value: answer + 1, misconception: template.excludedPair ? 'Eine ausgeschlossene Kombination wird trotzdem mitgezählt.' : 'Möglichkeiten werden doppelt gezählt.', misconceptionId: template.excludedPair ? 'combinations-excluded' : 'combinations-duplicate' },
      { value: template.firstOptions.length + template.secondOptions.length, misconception: 'Optionen derselben Gruppe werden miteinander kombiniert.', misconceptionId: 'combinations-same-group' }
    ]), correctAnswer: String(answer), errorFeedback: generatedContent.errorFeedback, successFeedback: generatedContent.successFeedback
  }
  return withMetadata({
    ...base('combinatorics', seed, difficulty, generatedValues), ...generatedContent,
    prompt: template.question || getTaskCatalog().chanceContent.combinationCountPrompt,
    typeId: phase === 'understand' ? 'combinations-understand-build' : difficulty === 1 ? 'combinations-2x2' : difficulty === 2 ? 'combinations-3x2' : 'combinations-with-exclusion',
    subskillId: difficulty === 3 ? 'combinations-one-exclusion' : 'combinations-systematic',
    answerMode: 'guided-choice', correctAnswer: String(answer),
    steps: phase === 'understand' ? [buildStep] : [buildStep, countStep],
    representation: combinationRepresentation(template)
  })
}

export function generateExercise(skillId: SkillId, seed: number, difficulty: Difficulty = 1, focus?: string, phase?: LearningPhase): Exercise {
  const generated: Exercise = (() => {
    switch (skillId) {
    case 'addition': return addition(seed, difficulty, focus, phase)
    case 'subtraction': return subtraction(seed, difficulty, focus, phase)
    case 'multiplication': return multiplication(seed, difficulty, focus, phase)
    case 'division': return division(seed, difficulty, focus, phase)
    case 'place-value': return placeValue(seed, difficulty, phase)
    case 'decompose': return decompose(seed, difficulty, phase)
    case 'compose': return compose(seed, difficulty, phase)
    case 'neighbor-tens': return neighbors(seed, difficulty, 10, phase)
    case 'neighbor-hundreds': return neighbors(seed, difficulty, 100, phase)
    case 'round-tens': return rounding(seed, difficulty, 10, phase)
    case 'round-hundreds': return rounding(seed, difficulty, 100, phase)
    case 'addition-1000': return addition1000(seed, difficulty, phase)
    case 'written-addition': return writtenAddition(seed, difficulty)
    case 'subtraction-1000': return subtraction1000(seed, difficulty, phase)
    case 'written-subtraction': return writtenSubtraction(seed, difficulty)
    case 'complement-1000': return complement1000(seed, difficulty, phase)
    case 'money': return money(seed, difficulty)
    case 'lengths': return lengths(seed, difficulty)
    case 'word-problem': return wordProblem(seed, difficulty)
    case 'symmetry': return symmetry(seed, difficulty, focus)
    case 'body-views': return bodyViews(seed, difficulty)
    case 'cube-rotation': return cubeRotation(seed, difficulty, focus)
    case 'folding': return folding(seed, difficulty, focus)
    case 'read-tables': return readTables(seed, difficulty)
    case 'read-charts': return readCharts(seed, difficulty)
    case 'probability': return probability(seed, difficulty)
    case 'combinatorics': return combinatorics(seed, difficulty, phase)
    case 'time': return time(seed, difficulty, phase)
    case 'mass': return measurementQuantity('mass', seed, difficulty)
    case 'capacity': return measurementQuantity('capacity', seed, difficulty)
    case 'plane-shapes': return planeShapes(seed, difficulty)
    case 'patterns': return patterns(seed, difficulty, phase)
    case 'area': return area(seed, difficulty)
      case 'perimeter': return perimeter(seed, difficulty)
    }
  })()
  if (!phase) return generated
  return {
    ...generated,
    learningPhase: phase,
    learningAction: getLearningPhaseModel(phase).learningAction,
    testMetadata: { ...generated.testMetadata, learningPhase: phase }
  }
}

export function isAnswerCorrect(exercise: Exercise, answer: string): boolean {
  return answer.trim() === exercise.correctAnswer
}

export function isStepAnswerCorrect(step: ExerciseStep, answer: string): boolean {
  return answer === step.correctAnswer
}

export { flipGrid, mirrorGrid, reflectGrid }
