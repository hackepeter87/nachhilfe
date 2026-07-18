import { describe, expect, it } from 'vitest'
import { getLearningPhaseModel, getSkillContent } from '../content/catalog'
import { generateExercise } from './generators'
import type { LearningPhase, SkillId } from './types'

const migratedSkills: SkillId[] = [
  'addition', 'subtraction', 'multiplication', 'division', 'place-value', 'decompose', 'compose',
  'neighbor-tens', 'neighbor-hundreds', 'time', 'combinatorics', 'patterns',
  'addition-1000', 'subtraction-1000', 'complement-1000', 'round-tens', 'round-hundreds'
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

  it('baut Multiplikation über Gruppen, wiederholte Addition und Aufgabenfamilien auf', () => {
    const activate = generateExercise('multiplication', 221, 1, 'times-5', 'activate')
    const understand = generateExercise('multiplication', 221, 1, 'times-5', 'understand')
    const guided = generateExercise('multiplication', 221, 1, 'times-5', 'guided-practice')
    const transfer = generateExercise('multiplication', 221, 3, 'times-7', 'transfer')

    expect(activate.typeId).toBe('recognize-equal-groups')
    expect(activate.representation).toMatchObject({ kind: 'groups', visibility: 'always' })
    expect(understand.typeId).toBe('connect-repeated-addition')
    expect(understand.correctAnswer.split(' + ')).toHaveLength(Number(understand.variant.values.first))
    expect(guided.typeId).toBe('difficulty-1')
    expect(transfer.typeId).toBe('fact-family-transfer')
    expect(transfer.steps?.map((step) => step.id)).toEqual(['commutative', 'inverse'])
    expect(transfer.steps?.every((step) => step.interaction === 'choose-strategy')).toBe(true)
  })

  it('trennt Division produktiv in Gruppieren und Verteilen', () => {
    const grouping = generateExercise('division', 311, 2, 'division-grouping-by-4', 'guided-practice')
    const sharing = generateExercise('division', 311, 2, 'division-sharing-by-4', 'guided-practice')

    expect(grouping.typeId).toBe('complete-partition-with-model')
    expect(grouping.subskillId).toBe('division-grouping-by-4')
    expect(grouping.representation?.kind).toBe('grouping-model')
    expect(grouping.steps?.map((step) => step.id)).toEqual(['relationship', 'result'])
    expect(sharing.typeId).toBe('complete-partition-with-model')
    expect(sharing.subskillId).toBe('division-sharing-by-4')
    expect(sharing.representation?.kind).toBe('sharing-model')
    expect(grouping.prompt).not.toBe(sharing.prompt)
  })

  it('erzeugt über 1.000 Seeds eindeutige multiplikative Lernhandlungen', () => {
    const phases: LearningPhase[] = ['activate', 'understand', 'guided-practice', 'independent-practice', 'automate', 'transfer']
    for (const phase of phases) {
      const difficulty = phase === 'independent-practice' ? 2 : phase === 'automate' || phase === 'transfer' ? 3 : 1
      for (let seed = 1; seed <= 1_000; seed += 1) {
        for (const skillId of ['multiplication', 'division'] as const) {
          const exercise = generateExercise(skillId, seed, difficulty, undefined, phase)
          const optionGroups = [exercise.options ?? [], ...exercise.steps?.map((step) => step.options ?? []) ?? []]
          for (const options of optionGroups) expect(new Set(options.map((option) => option.value)).size, `${skillId}/${phase}/${seed}`).toBe(options.length)
          for (const step of exercise.steps ?? []) {
            if (step.options) expect(step.options.filter((option) => option.value === step.correctAnswer), `${skillId}/${phase}/${seed}/${step.id}`).toHaveLength(1)
          }
          if (skillId === 'multiplication') {
            expect(Number(exercise.variant.values.first)).toBeLessThanOrEqual(10)
            expect(Number(exercise.variant.values.second)).toBeLessThanOrEqual(10)
            expect(Number(exercise.variant.values.first) * Number(exercise.variant.values.second)).toBe(Number(exercise.variant.values.answer))
          } else {
            expect(Number(exercise.variant.values.divisor)).toBeLessThanOrEqual(10)
            expect(Number(exercise.variant.values.quotient)).toBeLessThanOrEqual(10)
            expect(Number(exercise.variant.values.divisor) * Number(exercise.variant.values.quotient)).toBe(Number(exercise.variant.values.dividend))
          }
        }
      }
    }
  })

  it('baut Rechenstrategien bis 1000 über Grundlage, Zwischenziel, Übung und Transfer auf', () => {
    const phases: LearningPhase[] = ['activate', 'understand', 'guided-practice', 'independent-practice', 'automate', 'transfer']
    for (const skillId of ['addition-1000', 'subtraction-1000', 'complement-1000'] as const) {
      const exercises = phases.map((phase) => generateExercise(skillId, 271, phase === 'automate' || phase === 'transfer' ? 3 : phase === 'independent-practice' ? 2 : 1, undefined, phase))
      expect(new Set(exercises.map((exercise) => exercise.typeId)).size, skillId).toBeGreaterThanOrEqual(5)
      expect(exercises.map((exercise) => exercise.learningAction)).toEqual([
        'recall-foundation', 'inspect-relationship', 'solve-with-structure', 'solve-independently', 'retrieve-without-time-pressure', 'apply-in-new-context'
      ])
      expect(exercises[0]?.representation?.visibility).toBe('always')
      if (skillId !== 'complement-1000') {
        expect(exercises[0]?.representation?.values.operation).toBe(skillId === 'addition-1000' ? '+' : '−')
        expect(Number(exercises[0]?.representation?.values.changeHundreds) * 100 + Number(exercises[0]?.representation?.values.changeTens) * 10 + Number(exercises[0]?.representation?.values.changeOnes)).toBe(Number(exercises[0]?.variant.values.second))
      }
      expect(exercises[1]?.representation?.valueRoles.unknownValues).toEqual(expect.arrayContaining(['end', 'marker', 'jumps']))
      expect(exercises[2]?.steps?.length).toBeGreaterThanOrEqual(2)
      expect(exercises[3]?.answerMode).toBe('number')
      expect(exercises[4]?.answerMode).toBe('number')
      expect(exercises[5]?.answerMode).toBe('choice')
    }
  })

  it('hält alle phasenspezifischen Rechenwege über 1.000 Seeds korrekt und eindeutig', () => {
    const phases: LearningPhase[] = ['activate', 'understand', 'guided-practice', 'independent-practice', 'automate', 'transfer']
    for (const phase of phases) {
      const difficulty = phase === 'automate' || phase === 'transfer' ? 3 : phase === 'independent-practice' ? 2 : 1
      for (let seed = 1; seed <= 1_000; seed += 1) {
        for (const skillId of ['addition-1000', 'subtraction-1000', 'complement-1000'] as const) {
          const exercise = generateExercise(skillId, seed, difficulty, undefined, phase)
          const first = Number(exercise.variant.values.first)
          const answer = Number(exercise.variant.values.answer)
          expect(answer, `${skillId}/${phase}/${seed}`).toBeGreaterThanOrEqual(0)
          expect(answer, `${skillId}/${phase}/${seed}`).toBeLessThanOrEqual(1_000)
          if (skillId === 'addition-1000') expect(answer).toBe(first + Number(exercise.variant.values.second))
          if (skillId === 'subtraction-1000') expect(answer).toBe(first - Number(exercise.variant.values.second))
          if (skillId === 'complement-1000') expect(answer).toBe(Number(exercise.variant.values.target) - first)
          const optionGroups = [exercise.options ?? [], ...exercise.steps?.map((step) => step.options ?? []) ?? []]
          optionGroups.forEach((options) => expect(new Set(options.map((option) => option.value)).size, `${skillId}/${phase}/${seed}`).toBe(options.length))
          if (exercise.representation?.kind === 'number-line') {
            expect(exercise.representation.valueRoles.unknownValues).toEqual(expect.arrayContaining(['end', 'marker', 'jumps']))
            expect(exercise.representation.valueRoles.revealedValues).toEqual([])
          }
        }
      }
    }
  })

  it('trennt Runden in Nachbarn, Abstände, geführte Entscheidung, Abruf und Genauigkeitstransfer', () => {
    const phases: LearningPhase[] = ['activate', 'understand', 'guided-practice', 'independent-practice', 'automate', 'transfer']
    for (const skillId of ['round-tens', 'round-hundreds'] as const) {
      const exercises = phases.map((phase) => generateExercise(skillId, 455, phase === 'automate' || phase === 'transfer' ? 3 : phase === 'independent-practice' ? 2 : 1, undefined, phase))
      expect(new Set(exercises.map((exercise) => exercise.typeId)).size).toBe(6)
      expect(exercises[0]?.subskillId).toBe(`${skillId}-neighbors`)
      expect(exercises[0]?.representation?.valueRoles.unknownValues).toEqual(['start', 'end'])
      expect(exercises[1]?.typeId).toBe('understand-distances')
      expect(exercises[2]?.steps?.map((step) => step.id)).toEqual(['neighbors', 'compare-distances', 'round-result'])
      expect(exercises[3]?.answerMode).toBe('number')
      expect(exercises[4]?.answerMode).toBe('number')
      expect(exercises[5]?.typeId).toBe('transfer-accuracy')
      expect(exercises[5]?.correctAnswer).toMatch(/^ungefähr \d+$/)
    }
  })

  it('erzeugt über 1.000 Seeds fachlich korrekte Rundungsphasen und begrenzte Optionen', () => {
    const phases: LearningPhase[] = ['activate', 'understand', 'guided-practice', 'independent-practice', 'automate', 'transfer']
    for (const skillId of ['round-tens', 'round-hundreds'] as const) {
      const unit = skillId === 'round-tens' ? 10 : 100
      for (const phase of phases) {
        const difficulty = phase === 'automate' || phase === 'transfer' ? 3 : phase === 'independent-practice' ? 2 : 1
        for (let seed = 1; seed <= 1_000; seed += 1) {
          const exercise = generateExercise(skillId, seed, difficulty, undefined, phase)
          const number = Number(exercise.variant.values.number)
          const expected = Math.round(number / unit) * unit
          expect(Number(exercise.variant.values.answer), `${skillId}/${phase}/${seed}`).toBe(expected)
          expect(expected).toBeGreaterThanOrEqual(0)
          expect(expected).toBeLessThanOrEqual(1_000)
          const optionGroups = [exercise.options ?? [], ...exercise.steps?.map((step) => step.options ?? []) ?? []]
          optionGroups.forEach((options) => {
            expect(new Set(options.map((option) => option.value)).size, `${skillId}/${phase}/${seed}`).toBe(options.length)
            options.filter((option) => /^\d+$/.test(option.value)).forEach((option) => expect(Number(option.value)).toBeGreaterThanOrEqual(0))
            options.filter((option) => /^\d+$/.test(option.value)).forEach((option) => expect(Number(option.value)).toBeLessThanOrEqual(1_000))
          })
        }
      }
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
