import { getSkillContent } from '../content/catalog'
import type { Exercise } from './types'

export interface MisconceptionAnalysis {
  id: string
  feedback: string
}

function feedbackFor(exercise: Exercise, id: string): MisconceptionAnalysis | undefined {
  const route = getSkillContent(exercise.skillId).misconceptionFeedback?.find((candidate) => candidate.id === id)
  return route ? { id: route.id, feedback: route.feedback } : undefined
}

export function analyzeWrongAnswer(exercise: Exercise, rawAnswer: string): MisconceptionAnalysis | undefined {
  const answer = Number(rawAnswer)
  const correct = Number(exercise.correctAnswer)
  const values = exercise.variant.values

  if (exercise.skillId === 'addition' && Number.isFinite(answer)) {
    if (answer === Math.abs(Number(values.first) - Number(values.second))) return feedbackFor(exercise, 'addition-operation-reversal')
    if (Math.abs(answer - correct) === 1) return feedbackFor(exercise, 'addition-bridge-step')
  }
  if (exercise.skillId === 'subtraction' && Number.isFinite(answer)) {
    if (answer === Number(values.second) - Number(values.first) || answer === Number(values.first) + Number(values.second)) {
      return feedbackFor(exercise, 'subtraction-number-order')
    }
    if (Math.abs(answer - correct) === 1) return feedbackFor(exercise, 'subtraction-counting-start')
  }
  if (exercise.skillId === 'multiplication' && Number.isFinite(answer)) {
    if (answer === Number(values.first) + Number(values.second)) return feedbackFor(exercise, 'multiplication-add-factors')
    if (Math.abs(answer - correct) === Number(values.second)) return feedbackFor(exercise, 'multiplication-group-count')
    return feedbackFor(exercise, 'multiplication-group-roles')
  }
  if (exercise.skillId === 'division' && Number.isFinite(answer)) {
    if (answer === Number(values.divisor)) return feedbackFor(exercise, 'division-group-roles')
    if (answer * Number(values.divisor) !== Number(values.dividend)) return feedbackFor(exercise, 'division-incomplete-partition')
    return feedbackFor(exercise, 'division-operation-choice')
  }
  if (exercise.skillId === 'addition-1000' && Number.isFinite(answer)) {
    if (answer < Number(values.first)) return feedbackFor(exercise, 'addition-1000-bridge-direction')
    if (answer === Number(values.bridge)) return feedbackFor(exercise, 'addition-1000-bridge-omitted')
    if (Math.abs(answer - correct) <= 10) return feedbackFor(exercise, 'addition-1000-rest-step')
    return feedbackFor(exercise, 'addition-1000-place-confusion')
  }
  if (exercise.skillId === 'subtraction-1000' && Number.isFinite(answer)) {
    if (answer > Number(values.first)) return feedbackFor(exercise, 'subtraction-1000-operation-direction')
    if (answer === Number(values.bridge)) return feedbackFor(exercise, 'subtraction-1000-bridge-omitted')
    if (Math.abs(answer - correct) <= 10) return feedbackFor(exercise, 'subtraction-1000-rest-step')
    return feedbackFor(exercise, 'subtraction-1000-place-confusion')
  }
  if (exercise.skillId === 'complement-1000' && Number.isFinite(answer)) {
    if (answer < 0 || answer >= Number(values.target)) return feedbackFor(exercise, 'complement-1000-target-direction')
    if (Math.abs(answer - correct) <= 10) return feedbackFor(exercise, 'complement-1000-counting-target')
    return feedbackFor(exercise, 'complement-1000-bridge-step')
  }
  if ((exercise.skillId === 'round-tens' || exercise.skillId === 'round-hundreds') && Number.isFinite(answer)) {
    const lower = Number(values.lower)
    const upper = Number(values.upper)
    const midpoint = Number(values.lowerDistance) === Number(values.upperDistance)
    if (midpoint && answer === lower) return feedbackFor(exercise, `${exercise.skillId}-midpoint-down`)
    if (answer === lower && answer !== correct) return feedbackFor(exercise, `${exercise.skillId}-always-down`)
    if (answer === upper && answer !== correct) return feedbackFor(exercise, `${exercise.skillId}-always-up`)
    return feedbackFor(exercise, `${exercise.skillId}-wrong-neighbors`)
  }
  if (exercise.skillId === 'place-value' && Number.isFinite(answer)) {
    if (answer === Number(values.digit) && answer !== correct) return feedbackFor(exercise, 'place-value-digit-as-value')
    return feedbackFor(exercise, 'place-value-column-confusion')
  }
  if (exercise.skillId === 'compose' && Number.isFinite(answer)) {
    const withoutZero = `${values.hundreds}${values.tens}${values.ones}`.replace(/0/g, '')
    if (rawAnswer === withoutZero) return feedbackFor(exercise, 'compose-missing-zero')
    return feedbackFor(exercise, 'compose-place-order')
  }
  return undefined
}
