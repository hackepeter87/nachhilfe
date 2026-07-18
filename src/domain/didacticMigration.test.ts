import { describe, expect, it } from 'vitest'
import { getLearningPhaseModel, getSkillContent } from '../content/catalog'
import { generateExercise } from './generators'
import type { LearningPhase, SkillId } from './types'

const migratedSkills: SkillId[] = [
  'addition', 'subtraction', 'place-value', 'decompose', 'compose',
  'neighbor-tens', 'neighbor-hundreds', 'time', 'combinatorics', 'patterns'
]

describe('didaktisch migrierte Lernhandlungen', () => {
  it.each(migratedSkills)('%s erzeugt für Aktivierung und Verstehen andere Tätigkeiten als die Ergebnisübung', (skillId) => {
    const activate = generateExercise(skillId, 171, 1, undefined, 'activate')
    const understand = generateExercise(skillId, 171, 1, undefined, 'understand')
    const guided = generateExercise(skillId, 171, 1, undefined, 'guided-practice')

    expect(activate.learningAction).toBe('recall-foundation')
    expect(understand.learningAction).toBe('inspect-relationship')
    expect(guided.learningAction).toBe('solve-with-structure')
    expect(activate.typeId).not.toBe(guided.typeId)
    expect(understand.typeId).not.toBe(guided.typeId)
    expect(activate.prompt).not.toBe(guided.prompt)
  })

  it('bindet jede Phase an das katalogisierte Lernhandlungsmodell', () => {
    const phases: LearningPhase[] = ['activate', 'understand', 'guided-practice', 'independent-practice', 'automate', 'transfer']
    phases.forEach((phase) => {
      const exercise = generateExercise('addition', 711, phase === 'independent-practice' ? 2 : phase === 'automate' || phase === 'transfer' ? 3 : 1, undefined, phase)
      expect(exercise.learningAction).toBe(getLearningPhaseModel(phase).learningAction)
    })
  })

  it('verwendet in der höchsten Stellenwertstufe nichtkanonische, aber wertgleiche Zerlegungen', () => {
    for (let seed = 1; seed <= 1_000; seed += 1) {
      const decomposition = generateExercise('decompose', seed, 3)
      const composition = generateExercise('compose', seed, 3)
      expect(Number(decomposition.variant.values.tens)).toBeGreaterThanOrEqual(10)
      expect(decomposition.correctAnswer.split(' + ').reduce((sum, part) => sum + Number(part), 0)).toBe(Number(decomposition.variant.values.number))
      expect(Number(composition.variant.values.tens)).toBeGreaterThanOrEqual(10)
      expect(Number(composition.correctAnswer)).toBe(
        Number(composition.variant.values.hundreds) * 100 + Number(composition.variant.values.tens) * 10 + Number(composition.variant.values.ones)
      )
    }
  })

  it('erzeugt in der Stellenwertaktivierung vollständige und eindeutige Materialoptionen', () => {
    for (let seed = 1; seed <= 1_000; seed += 1) {
      const exercise = generateExercise('place-value', seed, 3, undefined, 'activate')
      expect(exercise.correctAnswer).not.toBe('')
      expect(exercise.representation?.kind).toBe('place-value-material')
      expect(new Set(exercise.options?.map((option) => option.value)).size).toBe(exercise.options?.length)
      expect(exercise.options?.filter((option) => option.value === exercise.correctAnswer)).toHaveLength(1)
    }
  })

  it.each(['neighbor-tens', 'neighbor-hundreds'] as const)('%s bestimmt zuerst die untere und danach die obere Grenze', (skillId) => {
    const exercise = generateExercise(skillId, 422, 1, undefined, 'understand')
    expect(exercise.steps?.map((step) => step.id)).toEqual(['lower', 'upper'])
    expect(exercise.representation?.valueRoles.unknownValues).toEqual(['lower', 'upper'])
    expect(exercise.representation?.values.tickStep).toBe(skillId === 'neighbor-tens' ? 10 : 100)
  })

  it('trennt die Zeitprogression in Zeiger, volle, halbe, Viertel- und Fünfminutenschritte', () => {
    const phases: LearningPhase[] = ['activate', 'understand', 'guided-practice', 'independent-practice', 'automate', 'transfer']
    const generated = phases.map((phase) => generateExercise('time', 212, phase === 'transfer' ? 3 : phase === 'independent-practice' ? 2 : 1, undefined, phase))
    expect(generated.map((exercise) => exercise.subskillId)).toEqual([
      'time-hand-roles', 'time-full-hours', 'time-full-half-hours', 'time-quarter-hours', 'time-five-minute-reading', 'time-forward-duration'
    ])
    expect(generated[1]?.representation?.values.minute).toBe(0)
    expect(generated[2]?.representation?.values.minute).toBe(30)
    expect([15, 45]).toContain(generated[3]?.representation?.values.minute)
  })

  it('lässt Kombinationsmöglichkeiten zuerst vollständig bauen und erst danach zählen', () => {
    for (const difficulty of [1, 2, 3] as const) {
      const exercise = generateExercise('combinatorics', 92, difficulty, undefined, 'guided-practice')
      const pairing = exercise.steps?.[0]
      expect(pairing?.interaction).toBe('build-pairing')
      expect(pairing?.options).toHaveLength(Number(exercise.correctAnswer))
      expect([...pairing?.expectedSelections ?? []].sort().join('|')).toBe(pairing?.correctAnswer)
      expect(exercise.steps?.[1]?.id).toBe('count')
    }
  })

  it('nutzt Mustertransfer als Fehlersuche und verrät die Fehlerstelle nicht', () => {
    const transfer = generateExercise('patterns', 83, 3, undefined, 'transfer')
    expect(transfer.typeId).toBe('pattern-transfer-identify-error')
    expect(transfer.prompt).toContain('Musterfehler')
    expect(transfer.representation?.valueRoles.unknownValues).toContain('answerLabel')
    expect(transfer.representation?.valueRoles.revealedValues).toEqual([])
  })

  it('katalogisiert produktive Fehlvorstellungsrouten für alle migrierten Familien', () => {
    migratedSkills.forEach((skillId) => {
      expect(getSkillContent(skillId).misconceptionFeedback?.length, skillId).toBeGreaterThanOrEqual(2)
    })
  })
})
