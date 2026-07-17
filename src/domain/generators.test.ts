import { describe, expect, it } from 'vitest'
import { createRoundingExercise, formatEuro, formatLength, generateExercise, isAnswerCorrect, roundToUnit } from './generators'
import { getTaskCatalog, renderCatalogText } from '../content/catalog'
import type { SkillId } from './types'
import { everyOccupiedCellHasMirrorPartner, reflectGrid, sourceStaysOnOneAxisSide } from './symmetry'
import { cubeBuildingKey, cubeCount, cubeViewKey, isValidCubeBuilding, projectCubeView, rotateCubeBuilding, type CubeBuilding, type CubeTurnDirection, type CubeViewDirection } from './cubeViews'
import { foldingCellsKey, reflectFoldingCell } from './folding'

const skills: SkillId[] = [
  'addition', 'subtraction', 'multiplication', 'division', 'place-value', 'decompose', 'compose',
  'neighbor-tens', 'neighbor-hundreds', 'round-tens', 'round-hundreds',
  'addition-1000', 'written-addition', 'subtraction-1000', 'written-subtraction', 'complement-1000', 'money', 'lengths', 'word-problem', 'symmetry', 'body-views', 'cube-rotation', 'folding', 'read-tables', 'read-charts', 'probability', 'combinatorics',
  'time', 'mass', 'capacity', 'plane-shapes', 'patterns', 'area', 'perimeter'
]

describe('deterministische Aufgabengeneratoren', () => {
  it.each(skills)('erzeugt für %s reproduzierbare eindeutige Varianten', (skill) => {
    const first = generateExercise(skill, 4_242, 2)
    const second = generateExercise(skill, 4_242, 2)
    expect(second).toEqual(first)
    expect(first.hints).toHaveLength(2)
    expect(first.explanation.length).toBeGreaterThan(10)
    expect(isAnswerCorrect(first, first.correctAnswer)).toBe(true)
    if (first.options) {
      expect(first.options.filter((option) => option.value === first.correctAnswer)).toHaveLength(1)
    }
    first.steps?.forEach((step) => {
      if (step.options) expect(step.options.filter((option) => option.value === step.correctAnswer)).toHaveLength(1)
      else expect(['number', 'continue']).toContain(step.interaction)
    })
  })

  it('setzt die katalogisierte Sichtbarkeit verpflichtender Darstellungen um', () => {
    for (const skill of getTaskCatalog().skills) {
      for (const difficulty of [1, 2, 3] as const) {
        const exercise = generateExercise(skill.id, difficulty * 1_001, difficulty)
        const expected = skill.difficultyLevels[difficulty - 1].representation
        if (skill.id === 'symmetry') {
          expect(exercise.sourceGrid).toBeDefined()
          expect(exercise.options?.every((option) => option.grid)).toBe(true)
        } else if (skill.id === 'word-problem') {
          const modelStep = exercise.steps?.find((step) => step.id === 'model')
          expect(modelStep).toBeDefined()
          expect(modelStep?.representation || modelStep?.options?.every((option) => option.representation)).toBeTruthy()
        } else if (expected === 'none') {
          expect(exercise.representation).toBeUndefined()
        } else {
          expect(exercise.representation).toBeDefined()
          expect(exercise.representation?.visibility).toBe(expected)
        }
      }
    }
  })

  it('hält Addition und Subtraktion über viele Seeds im Zahlenraum bis 20', () => {
    for (let seed = 1; seed <= 400; seed += 1) {
      const addition = generateExercise('addition', seed, 3)
      const subtraction = generateExercise('subtraction', seed, 3)
      expect(Number(addition.correctAnswer)).toBeGreaterThanOrEqual(0)
      expect(Number(addition.correctAnswer)).toBeLessThanOrEqual(20)
      expect(Number(subtraction.correctAnswer)).toBeGreaterThanOrEqual(0)
      expect(Number(subtraction.correctAnswer)).toBeLessThanOrEqual(20)
    }
  })

  it('erzeugt ausschließlich Divisionen ohne Rest', () => {
    for (let seed = 1; seed <= 400; seed += 1) {
      const exercise = generateExercise('division', seed, 3)
      const dividend = Number(exercise.variant.values.dividend)
      const divisor = Number(exercise.variant.values.divisor)
      expect(dividend % divisor).toBe(0)
      expect(dividend / divisor).toBe(Number(exercise.correctAnswer))
    }
  })

  it('hält die Stufenwerte für Einmaleins und Division ein', () => {
    for (let seed = 1; seed <= 500; seed += 1) {
      expect(Number(generateExercise('multiplication', seed, 1).correctAnswer)).toBeLessThanOrEqual(50)
      expect(Number(generateExercise('division', seed, 1).variant.values.dividend)).toBeLessThanOrEqual(50)
      expect(Number(generateExercise('multiplication', seed, 2).correctAnswer)).toBeLessThanOrEqual(60)
      expect(Number(generateExercise('division', seed, 2).variant.values.dividend)).toBeLessThanOrEqual(60)
      expect(Number(generateExercise('multiplication', seed, 3).correctAnswer)).toBeLessThanOrEqual(90)
      expect(Number(generateExercise('division', seed, 3).variant.values.dividend)).toBeLessThanOrEqual(90)
    }
  })

  it('hält Faktoren, Divisoren und Quotienten im kleinen Einmaleins und bildet Gruppen exakt ab', () => {
    for (const difficulty of [1, 2, 3] as const) {
      for (let seed = 1; seed <= 1_000; seed += 1) {
        const multiplication = generateExercise('multiplication', seed, difficulty)
        const first = Number(multiplication.variant.values.first)
        const second = Number(multiplication.variant.values.second)
        expect(first).toBeGreaterThanOrEqual(2)
        expect(first).toBeLessThanOrEqual(10)
        expect(second).toBeGreaterThanOrEqual(2)
        expect(second).toBeLessThanOrEqual(10)
        expect(first * second).toBe(Number(multiplication.correctAnswer))
        if (difficulty < 3) expect(multiplication.representation?.values).toMatchObject({ groups: first, size: second })
        else expect(multiplication.representation).toBeUndefined()

        const division = generateExercise('division', seed, difficulty)
        const dividend = Number(division.variant.values.dividend)
        const divisor = Number(division.variant.values.divisor)
        const quotient = Number(division.variant.values.quotient)
        expect(divisor).toBeGreaterThanOrEqual(2)
        expect(divisor).toBeLessThanOrEqual(10)
        expect(quotient).toBeGreaterThanOrEqual(2)
        expect(quotient).toBeLessThanOrEqual(10)
        expect(divisor * quotient).toBe(dividend)
        if (difficulty < 3) {
          expect(division.representation?.values).toMatchObject({ modelType: 'division-groups', total: dividend, size: divisor, groups: quotient })
          expect(division.representation?.valueRoles.unknownValues).toContain('groups')
        }
        else expect(division.representation).toBeUndefined()
      }
    }
  })

  it.each([
    ['neighbor-tens', 10],
    ['neighbor-hundreds', 100]
  ] as const)('bestimmt korrekte Nachbarzahlen für %s', (skill, unit) => {
    for (let seed = 1; seed <= 300; seed += 1) {
      const exercise = generateExercise(skill, seed)
      const number = Number(exercise.variant.values.number)
      const lower = Number(exercise.variant.values.lower)
      const upper = Number(exercise.variant.values.upper)
      expect(lower).toBe(Math.floor(number / unit) * unit)
      expect(upper).toBe(lower + unit)
      expect(exercise.correctAnswer).toBe(`${lower} und ${upper}`)
    }
  })

  it('bezieht bei Nachbarhundertern auch Zahlen von 900 bis 999 ein', () => {
    const generated = Array.from({ length: 1_000 }, (_, seed) => generateExercise('neighbor-hundreds', seed + 1, 3))
    expect(generated.some((exercise) => Number(exercise.variant.values.number) >= 900)).toBe(true)
    generated.filter((exercise) => Number(exercise.variant.values.number) >= 900).forEach((exercise) => {
      expect(exercise.variant.values.lower).toBe(900)
      expect(exercise.variant.values.upper).toBe(1000)
    })
  })

  it.each([
    ['round-tens', 10],
    ['round-hundreds', 100]
  ] as const)('rundet für %s einschließlich Grenzfällen korrekt', (skill, unit) => {
    let halfBoundarySeen = false
    for (let seed = 1; seed <= 2_000; seed += 1) {
      const exercise = generateExercise(skill, seed, 2)
      const number = Number(exercise.variant.values.number)
      if (number % unit === unit / 2) halfBoundarySeen = true
      expect(Number(exercise.correctAnswer)).toBe(Math.round(number / unit) * unit)
    }
    expect(halfBoundarySeen).toBe(true)
  })

  it.each([
    [5, 10, 10],
    [14, 10, 10],
    [15, 10, 20],
    [994, 10, 990],
    [995, 10, 1000],
    [949, 100, 900],
    [950, 100, 1000]
  ] as const)('rundet %i auf den nächsten %i korrekt zu %i', (number, unit, expected) => {
    const exercise = createRoundingExercise(number, unit)
    expect(roundToUnit(number, unit)).toBe(expected)
    expect(Number(exercise.correctAnswer)).toBe(expected)
    expect(exercise.options).toHaveLength(3)
    expect(exercise.options?.every((option) => Number(option.value) >= 0 && Number(option.value) <= 1000)).toBe(true)
  })

  it.each([
    [995, 10],
    [950, 100]
  ] as const)('erklärt den Halbpunkt bei %i fachlich korrekt', (number, unit) => {
    const exercise = createRoundingExercise(number, unit)
    expect(exercise.explanation).toContain('beide')
    expect(exercise.explanation).toContain('Halbpunkt')
    expect(exercise.explanation).toContain('aufgerundet')
  })

  it.each(['round-tens', 'round-hundreds'] as const)('erzeugt für %s ausschließlich Antwortoptionen von 0 bis 1000', (skill) => {
    for (let seed = 1; seed <= 5_000; seed += 1) {
      const exercise = generateExercise(skill, seed)
      expect(exercise.options?.every((option) => {
        const value = Number(option.value)
        return Number.isInteger(value) && value >= 0 && value <= 1000
      })).toBe(true)
    }
  })

  it('zerlegt und baut Zahlen stellenwertgerecht', () => {
    for (let seed = 1; seed <= 300; seed += 1) {
      const decomposition = generateExercise('decompose', seed)
      const composition = generateExercise('compose', seed)
      const decomposedValue = decomposition.correctAnswer.split(' + ').reduce((sum, value) => sum + Number(value), 0)
      expect(decomposedValue).toBe(Number(decomposition.variant.values.number))
      expect(Number(composition.correctAnswer)).toBe(
        Number(composition.variant.values.hundreds) * 100 +
        Number(composition.variant.values.tens) * 10 +
        Number(composition.variant.values.ones)
      )
    }
  })

  it('fragt Nullstellen als Ziffer und Stellenwert tatsächlich ab', () => {
    for (const difficulty of [2, 3] as const) {
      for (let seed = 1; seed <= 100; seed += 1) {
        const exercise = generateExercise('place-value', seed, difficulty)
        expect(exercise.variant.values.digit).toBe(0)
        expect(exercise.correctAnswer).toBe('0')
        expect(['Zehner', 'Einer']).toContain(exercise.variant.values.position)
      }
    }
    const hardDecomposition = generateExercise('decompose', 8, 3)
    expect(hardDecomposition.variant.values.tens).toBe(0)
    expect(hardDecomposition.variant.values.ones).toBe(0)
  })

  it('liefert für Symmetrie genau eine echte Spiegelung', () => {
    for (let seed = 1; seed <= 100; seed += 1) {
      const exercise = generateExercise('symmetry', seed)
      const correct = exercise.options?.find((option) => option.value === exercise.correctAnswer)
      expect(correct?.grid).toEqual(reflectGrid(exercise.sourceGrid ?? [], exercise.symmetry!.axis))
      expect(new Set(exercise.options?.map((option) => JSON.stringify(option.grid))).size).toBe(3)
    }
  })

  it('führt Sachaufgaben vom Gesuchten über das Modell zur eigenen Rechnung', () => {
    for (const difficulty of [1, 2, 3] as const) {
      for (let seed = 1; seed <= 200; seed += 1) {
        const exercise = generateExercise('word-problem', seed, difficulty)
        const first = Number(exercise.variant.values.first)
        const second = Number(exercise.variant.values.second)
        const operation = exercise.variant.values.operation
        const intermediate = operation === '+' ? first + second : operation === '−' ? first - second : operation === ':' ? second : first * second
        const third = Number(exercise.variant.values.third)
        const secondOperation = exercise.variant.values.secondOperation
        const expected = secondOperation === '+' ? intermediate + third : secondOperation === '−' ? intermediate - third : intermediate
        expect(Number(exercise.variant.values.intermediate)).toBe(intermediate)
        expect(Number(exercise.variant.values.result)).toBe(expected)
        const runtimeSequence = getTaskCatalog().wordProblemSteps.runtimeSequence
          .filter((step) => step.condition === 'always' || Boolean(secondOperation))
        expect(exercise.steps).toHaveLength(runtimeSequence.length)
        expect(exercise.prompt).not.toMatch(/\{\w+\}/)
        const ids = exercise.steps?.map((step) => step.id) ?? []
        expect(ids).toEqual(runtimeSequence.map((step) => step.id))
        expect(exercise.steps?.map((step) => step.curriculumStage)).toEqual(runtimeSequence.map((step) => step.progressionId))
        expect(ids).not.toContain('relationship')
        expect(ids).not.toContain('operation')
        expect(ids.indexOf('model')).toBeLessThan(ids.indexOf('equation'))
        expect(ids.indexOf('equation')).toBeLessThan(ids.indexOf('calculate'))
        const calculationStep = exercise.steps?.find((step) => step.id === 'calculate')
        expect(calculationStep?.interaction).toBe('number')
        expect(calculationStep?.options).toBeUndefined()
        expect(exercise.steps?.map((step) => step.prompt).join(' ')).not.toMatch(/Mengenbeziehung|Welche Rechenart/i)
        const modelStep = exercise.steps?.find((step) => step.id === 'model')
        expect(modelStep).toBeDefined()
        if (!modelStep) throw new Error('Modellschritt fehlt')
        if (difficulty === 1) {
          expect(modelStep.interaction).toBe('continue')
          expect(modelStep.representation).toBeDefined()
          expect(modelStep.representation?.values.unknownQuantity).toBeTruthy()
          expect(modelStep.representation?.values).not.toHaveProperty('result')
          expect(modelStep.representation?.values).not.toHaveProperty('intermediate')
        } else {
          expect(modelStep.options).toHaveLength(3)
          expect(new Set(modelStep.options?.map((option) => option.value)).size).toBe(3)
          expect(modelStep.options?.filter((option) => option.value === modelStep.correctAnswer)).toHaveLength(1)
          modelStep.options?.forEach((option) => {
            expect(option.representation?.values).not.toHaveProperty('result')
            expect(option.representation?.values).not.toHaveProperty('intermediate')
            expect(option.representation?.values.unknownQuantity).toBeTruthy()
            if (option.value === 'equal-groups-share') expect(option.representation?.values).not.toHaveProperty('size')
          })
        }
        exercise.steps?.forEach((step) => {
          if (!step.options) return
          expect(step.options).toHaveLength(3)
          expect(new Set(step.options.map((option) => option.value)).size).toBe(step.options.length)
          expect(step.options.filter((option) => option.value === step.correctAnswer)).toHaveLength(1)
        })
      }
    }
  })

  it('führt Stellenwert und Runden auf höheren Stufen über überprüfbare Strategischritte', () => {
    const placeValue = generateExercise('place-value', 77, 3)
    expect(placeValue.answerMode).toBe('guided-choice')
    expect(placeValue.steps?.map((step) => step.id)).toEqual(['identify-digit', 'identify-value'])
    expect(placeValue.learningPhase).toBe('transfer')

    const easyRounding = generateExercise('round-tens', 77, 1)
    const mediumRounding = generateExercise('round-tens', 77, 2)
    const hardRounding = generateExercise('round-tens', 77, 3)
    expect(easyRounding.steps).toBeUndefined()
    expect(mediumRounding.steps?.map((step) => step.id)).toEqual(['neighbors', 'round-result'])
    expect(hardRounding.steps?.map((step) => step.id)).toEqual(['neighbors', 'round-result', 'round-reason'])
  })

  it('erzeugt schriftliche Additionen mit genau der vorgesehenen Zahl von Überträgen', () => {
    const carryCount = (first: number, second: number) => {
      const onesCarry = first % 10 + second % 10 >= 10 ? 1 : 0
      const tensCarry = Math.floor(first / 10) % 10 + Math.floor(second / 10) % 10 + onesCarry >= 10 ? 1 : 0
      return onesCarry + tensCarry
    }
    const hardSubskills = new Set<string>()
    for (const difficulty of [1, 2, 3] as const) {
      for (let seed = 1; seed <= 1_000; seed += 1) {
        const exercise = generateExercise('written-addition', seed, difficulty)
        const first = Number(exercise.variant.values.first)
        const second = Number(exercise.variant.values.second)
        const answer = Number(exercise.correctAnswer)
        expect(answer).toBe(first + second)
        expect(answer).toBeLessThanOrEqual(999)
        expect(carryCount(first, second)).toBe(difficulty === 1 ? 0 : 1)
        expect(exercise.answerMode).toBe('guided-number')
        expect(exercise.steps?.filter((step) => step.interaction === 'number')).toHaveLength(difficulty === 2 ? 4 : 3)
        expect(exercise.steps?.find((step) => step.id === 'ones')?.correctAnswer).toBe(String(answer % 10))
        expect(exercise.steps?.find((step) => step.id === 'tens')?.correctAnswer).toBe(String(Math.floor(answer / 10) % 10))
        expect(exercise.steps?.find((step) => step.id === 'hundreds')?.correctAnswer).toBe(String(Math.floor(answer / 100)))
        if (difficulty === 2) {
          expect(exercise.subskillId).toBe('written-addition-ones-carry')
          expect(exercise.steps?.find((step) => step.id === 'carry')?.correctAnswer).toBe('1')
        }
        if (difficulty === 3) hardSubskills.add(exercise.subskillId ?? '')
      }
    }
    expect(hardSubskills).toEqual(new Set(['written-addition-ones-carry', 'written-addition-tens-carry']))
  })

  it('macht die drei Stufen der schriftlichen Addition objektiv verschieden', () => {
    const easy = generateExercise('written-addition', 315, 1)
    const medium = generateExercise('written-addition', 315, 2)
    const hard = generateExercise('written-addition', 315, 3)
    expect(easy.representation?.visibility).toBe('always')
    expect(easy.steps?.map((step) => step.id)).toEqual(['ones', 'tens', 'hundreds'])
    expect(medium.representation?.visibility).toBe('always')
    expect(medium.steps?.map((step) => step.id)).toEqual(['ones', 'carry', 'tens', 'hundreds'])
    expect(hard.representation?.visibility).toBe('hint')
    expect(hard.steps?.map((step) => step.id)).toEqual(['ones', 'tens', 'hundreds'])
  })

  it('erzeugt schriftliche Subtraktionen mit höchstens genau einer vorgesehenen Entbündelung', () => {
    const unbundlings = (first: number, second: number) => {
      const ones = first % 10 < second % 10 ? 1 : 0
      const tens = Math.floor(first / 10) % 10 - ones < Math.floor(second / 10) % 10 ? 1 : 0
      const hundreds = Math.floor(first / 100) - tens < Math.floor(second / 100) ? 1 : 0
      return { ones, tens, hundreds, count: ones + tens + hundreds }
    }
    const hardSubskills = new Set<string>()
    for (const difficulty of [1, 2, 3] as const) {
      for (let seed = 1; seed <= 1_000; seed += 1) {
        const exercise = generateExercise('written-subtraction', seed, difficulty)
        const first = Number(exercise.variant.values.first)
        const second = Number(exercise.variant.values.second)
        const answer = Number(exercise.correctAnswer)
        const exchanges = unbundlings(first, second)
        expect(first).toBeGreaterThan(second)
        expect(answer).toBe(first - second)
        expect(answer).toBeGreaterThanOrEqual(100)
        expect(answer).toBeLessThanOrEqual(999)
        expect(exchanges.count).toBe(difficulty === 1 ? 0 : 1)
        expect(exchanges.hundreds).toBe(0)
        expect(exercise.answerMode).toBe('guided-number')
        expect(exercise.steps?.find((step) => step.id === 'ones')?.correctAnswer).toBe(String(answer % 10))
        expect(exercise.steps?.find((step) => step.id === 'tens')?.correctAnswer).toBe(String(Math.floor(answer / 10) % 10))
        expect(exercise.steps?.find((step) => step.id === 'hundreds')?.correctAnswer).toBe(String(Math.floor(answer / 100)))
        if (difficulty === 2) {
          expect(exchanges.ones).toBe(1)
          expect(exercise.subskillId).toBe('written-subtraction-ones-unbundling')
          expect(exercise.steps?.find((step) => step.id === 'unbundle')?.correctAnswer).toBe('1')
        }
        if (difficulty === 3) {
          hardSubskills.add(exercise.subskillId ?? '')
          expect(exercise.steps?.find((step) => step.id === 'check')?.correctAnswer).toBe(String(first))
        }
      }
    }
    expect(hardSubskills).toEqual(new Set(['written-subtraction-ones-unbundling', 'written-subtraction-tens-unbundling']))
  })

  it('macht die drei Stufen der schriftlichen Subtraktion objektiv verschieden', () => {
    const easy = generateExercise('written-subtraction', 315, 1)
    const medium = generateExercise('written-subtraction', 315, 2)
    const hard = generateExercise('written-subtraction', 315, 3)
    expect(easy.representation?.visibility).toBe('always')
    expect(easy.steps?.map((step) => step.id)).toEqual(['ones', 'tens', 'hundreds'])
    expect(medium.representation?.visibility).toBe('always')
    expect(medium.steps?.map((step) => step.id)).toEqual(['unbundle', 'ones', 'tens', 'hundreds'])
    expect(hard.representation?.visibility).toBe('hint')
    expect(hard.steps?.map((step) => step.id)).toEqual(['ones', 'tens', 'hundreds', 'check'])
  })

  it('liefert eine konkrete Remediation mit leichterer verwandter Aufgabe', () => {
    const exercise = generateExercise('round-hundreds', 412, 3)
    expect(exercise.remediation).toMatchObject({ helpLevel: 4, nextDifficulty: 2, keepSubskill: true })
    expect(exercise.remediation.strategy.length).toBeGreaterThan(0)
    expect(exercise.remediation.representation.length).toBeGreaterThan(0)
  })

  it('verwendet vorlagenspezifische Fragen und wechselnde Plausibilitätsaussagen', () => {
    const templates = new Map(getTaskCatalog().wordProblems.map((template) => [template.id, template]))
    const plausibilityAnswers = new Set<string>()
    for (let seed = 1; seed <= 500; seed += 1) {
      const exercise = generateExercise('word-problem', seed, 3)
      const template = templates.get(String(exercise.variant.values.templateId))!
      const questionStep = exercise.steps?.find((step) => step.id === 'question')
      expect(questionStep).toBeDefined()
      if (!questionStep) throw new Error('Frageschritt fehlt')
      const expectedQuestions = [template.question, ...template.questionDistractors].map((question) => renderCatalogText(question, exercise.variant.values))
      expect(new Set(questionStep.options?.map((option) => option.value))).toEqual(new Set(expectedQuestions))
      const plausibility = exercise.steps?.find((step) => step.id === 'plausibility')
      expect(plausibility).toBeDefined()
      if (!plausibility) throw new Error('Plausibilitätsschritt fehlt')
      expect(plausibility.options?.filter((option) => option.value === plausibility.correctAnswer)).toHaveLength(1)
      plausibilityAnswers.add(plausibility.correctAnswer)
    }
    expect(plausibilityAnswers.size).toBeGreaterThan(2)
  })

  it('liefert für jede produktive Auswahlaufgabe drei eindeutige Optionen', () => {
    for (const skill of skills) {
      for (const difficulty of [1, 2, 3] as const) {
        for (let seed = 1; seed <= 120; seed += 1) {
          const exercise = generateExercise(skill, seed, difficulty)
          if (exercise.options) {
            expect(exercise.options).toHaveLength(3)
            expect(new Set(exercise.options.map((option) => option.value)).size).toBe(3)
          }
        }
      }
    }
  })

  it.each([
    'addition', 'subtraction', 'multiplication', 'division', 'place-value', 'decompose', 'compose',
    'neighbor-tens', 'neighbor-hundreds', 'round-tens', 'round-hundreds',
    'addition-1000', 'subtraction-1000', 'complement-1000'
  ] as SkillId[])('macht die didaktischen Stufen bei %s wirksam', (skill) => {
    const easy = generateExercise(skill, 315, 1)
    const medium = generateExercise(skill, 315, 2)
    const hard = generateExercise(skill, 315, 3)
    expect(new Set([easy.variant.key, medium.variant.key, hard.variant.key]).size).toBeGreaterThan(1)
    expect(easy.representation?.visibility).toBe('always')
    expect(medium.representation?.visibility).toBe('hint')
    expect(hard.representation).toBeUndefined()
  })

  it('steigert bei Sachaufgaben die selbstständige Modellwahl', () => {
    const easy = generateExercise('word-problem', 315, 1)
    const medium = generateExercise('word-problem', 315, 2)
    const hard = generateExercise('word-problem', 315, 3)
    expect(easy.steps?.find((step) => step.id === 'model')).toMatchObject({ interaction: 'continue', representation: expect.any(Object) })
    expect(medium.steps?.find((step) => step.id === 'model')?.options).toHaveLength(3)
    expect(hard.steps?.find((step) => step.id === 'relevant')).toBeDefined()
  })

  it('steuert Symmetrie über didaktische Parameter statt feste Rastergrößen', () => {
    const easy = generateExercise('symmetry', 22, 1)
    const medium = generateExercise('symmetry', 22, 2)
    const hard = generateExercise('symmetry', 22, 3)
    expect(easy.symmetry).toMatchObject({ progressionPhase: 1, axis: 'vertical', axisPosition: 'between-cells' })
    expect(medium.symmetry).toMatchObject({ progressionPhase: 2, axis: 'vertical', axisPosition: 'between-cells' })
    expect(hard.symmetry).toMatchObject({ progressionPhase: 3, axis: 'horizontal', axisPosition: 'between-cells' })
    expect(Math.max(easy.sourceGrid!.length, easy.sourceGrid![0]!.length)).toBeGreaterThanOrEqual(Math.min(medium.sourceGrid!.length, medium.sourceGrid![0]!.length))
  })

  it('spiegelt in allen fünf Phasen passend zur sichtbaren Achse', () => {
    for (const progressionPhase of [1, 2, 3, 4, 5] as const) {
      const difficulty = progressionPhase === 1 ? 1 : progressionPhase === 2 ? 2 : 3
      for (let seed = 1; seed <= 100; seed += 1) {
        const exercise = generateExercise('symmetry', seed, difficulty, `symmetry-phase-${progressionPhase}`)
        const source = exercise.sourceGrid!
        const correct = exercise.options?.find((option) => option.value === 'mirror')?.grid
        expect(exercise.symmetry?.progressionPhase).toBe(progressionPhase)
        expect(correct).toEqual(reflectGrid(source, exercise.symmetry!.axis))
        expect(sourceStaysOnOneAxisSide(source, exercise.symmetry!.axis)).toBe(true)
        expect(everyOccupiedCellHasMirrorPartner(source, exercise.symmetry!.axis)).toBe(true)
        expect(exercise.prompt).toContain(String(exercise.variant.values.axis))
        expect(exercise.options?.every((option) => option.grid?.length === source.length && option.grid.every((row) => row.length === source[0]!.length))).toBe(true)
        expect(new Set(exercise.options?.map((option) => JSON.stringify(option.grid))).size).toBe(3)
      }
    }
  })

  it('führt ungerade Raster ausschließlich in den hohen Progressionsphasen ein', () => {
    for (const progressionPhase of [1, 2, 3, 4, 5] as const) {
      const difficulty = progressionPhase === 1 ? 1 : progressionPhase === 2 ? 2 : 3
      for (let seed = 1; seed <= 50; seed += 1) {
        const exercise = generateExercise('symmetry', seed, difficulty, `symmetry-phase-${progressionPhase}`)
        const relevantSize = exercise.symmetry?.axis === 'vertical' ? exercise.sourceGrid![0]!.length : exercise.sourceGrid!.length
        if (progressionPhase <= 3) expect(relevantSize % 2).toBe(0)
        if (progressionPhase === 4) expect(relevantSize % 2).toBe(1)
      }
    }
  })

  it('erzeugt Körperansichten über 1.000 Seeds je Stufe korrekt und eindeutig', () => {
    const directionsByDifficulty = [new Set<string>(), new Set<string>(), new Set<string>()]
    const variantsByDifficulty = [new Set<string>(), new Set<string>(), new Set<string>()]
    for (const difficulty of [1, 2, 3] as const) {
      for (let seed = 1; seed <= 1_000; seed += 1) {
        const exercise = generateExercise('body-views', seed, difficulty)
        const values = exercise.representation?.values
        const building: CubeBuilding = {
          width: Number(values?.width), depth: Number(values?.depth),
          heights: Array.isArray(values?.heights) ? values.heights as number[] : []
        }
        const direction = exercise.variant.values.direction as CubeViewDirection
        directionsByDifficulty[difficulty - 1].add(direction)
        variantsByDifficulty[difficulty - 1].add(exercise.variant.key)
        expect(isValidCubeBuilding(building)).toBe(true)
        expect(cubeCount(building)).toBeGreaterThanOrEqual(difficulty === 1 ? 2 : difficulty === 2 ? 3 : 4)
        expect(cubeCount(building)).toBeLessThanOrEqual(difficulty === 1 ? 3 : difficulty === 2 ? 4 : 5)
        expect(exercise.correctAnswer).toBe(cubeViewKey(projectCubeView(building, direction)))
        expect(exercise.options).toHaveLength(3)
        expect(new Set(exercise.options?.map((option) => option.value)).size).toBe(3)
        expect(exercise.options?.filter((option) => option.value === exercise.correctAnswer)).toHaveLength(1)
      }
    }
    expect(directionsByDifficulty[0]).toEqual(new Set(['front']))
    expect(directionsByDifficulty[1]).toEqual(new Set(['front', 'right']))
    expect(directionsByDifficulty[2]).toEqual(new Set(['front', 'right', 'top']))
    variantsByDifficulty.forEach((variants) => expect(variants.size).toBeGreaterThan(1))
  })

  it('erzeugt kontrollierte Vierteldrehungen über 1.000 Seeds je Stufe korrekt und eindeutig', () => {
    const turnsByDifficulty = [new Set<string>(), new Set<string>(), new Set<string>()]
    const variantsByDifficulty = [new Set<string>(), new Set<string>(), new Set<string>()]
    for (const difficulty of [1, 2, 3] as const) {
      for (let seed = 1; seed <= 1_000; seed += 1) {
        const exercise = generateExercise('cube-rotation', seed, difficulty)
        const values = exercise.representation?.values
        const building: CubeBuilding = {
          width: Number(values?.width),
          depth: Number(values?.depth),
          heights: Array.isArray(values?.heights) ? values.heights as number[] : []
        }
        const turn = exercise.variant.values.turn as CubeTurnDirection
        turnsByDifficulty[difficulty - 1].add(turn)
        variantsByDifficulty[difficulty - 1].add(exercise.variant.key)
        expect(exercise.representation?.kind).toBe('cube-rotation')
        expect(isValidCubeBuilding(building)).toBe(true)
        expect(cubeCount(building)).toBe(difficulty === 1 ? 3 : difficulty === 2 ? 4 : 5)
        if (difficulty === 1) expect(Math.max(...building.heights)).toBe(1)
        expect(exercise.correctAnswer).toBe(cubeBuildingKey(rotateCubeBuilding(building, turn)))
        expect(exercise.options).toHaveLength(3)
        expect(new Set(exercise.options?.map((option) => option.value)).size).toBe(3)
        expect(exercise.options?.filter((option) => option.value === exercise.correctAnswer)).toHaveLength(1)
        exercise.options?.forEach((option) => {
          expect(option.representation?.kind).toBe('cube-building')
          const optionValues = option.representation?.values
          const optionBuilding: CubeBuilding = {
            width: Number(optionValues?.width),
            depth: Number(optionValues?.depth),
            heights: Array.isArray(optionValues?.heights) ? optionValues.heights as number[] : []
          }
          expect(isValidCubeBuilding(optionBuilding)).toBe(true)
          expect(cubeCount(optionBuilding)).toBe(cubeCount(building))
          expect(option.value).toBe(cubeBuildingKey(optionBuilding))
        })
      }
    }
    expect(turnsByDifficulty[0]).toEqual(new Set(['right']))
    expect(turnsByDifficulty[1]).toEqual(new Set(['left', 'right']))
    expect(turnsByDifficulty[2]).toEqual(new Set(['left', 'right']))
    variantsByDifficulty.forEach((variants) => expect(variants.size).toBeGreaterThan(1))
  })

  it('berücksichtigt unsichere Rotationsrichtungen ohne die Stufenprogression zu verletzen', () => {
    expect(generateExercise('cube-rotation', 91, 1, 'cube-rotation-left').subskillId).toBe('cube-rotation-right')
    expect(generateExercise('cube-rotation', 92, 2, 'cube-rotation-left').subskillId).toBe('cube-rotation-left')
    expect(generateExercise('cube-rotation', 93, 3, 'cube-rotation-right').subskillId).toBe('cube-rotation-right')
  })

  it('hält Rechenstrategien bis 1000 im Zahlenraum und fachlich konsistent', () => {
    for (const skill of ['addition-1000', 'subtraction-1000', 'complement-1000'] as const) {
      for (const difficulty of [1, 2, 3] as const) {
        for (let seed = 1; seed <= 300; seed += 1) {
          const exercise = generateExercise(skill, seed, difficulty)
          const first = Number(exercise.variant.values.first)
          const answer = Number(exercise.correctAnswer)
          expect(answer).toBeGreaterThanOrEqual(0)
          expect(answer).toBeLessThanOrEqual(1000)
          if (skill === 'addition-1000') expect(answer).toBe(first + Number(exercise.variant.values.second))
          if (skill === 'subtraction-1000') expect(answer).toBe(first - Number(exercise.variant.values.second))
          if (skill === 'complement-1000') expect(answer).toBe(Number(exercise.variant.values.target) - first)
          expect(exercise.hints.join(' ')).not.toMatch(/\{\w+\}/)
          expect(exercise.explanation).not.toMatch(/\{\w+\}/)
        }
      }
    }
  })

  it('führt genau einen Stellenübergang über eine geprüfte Zwischenstation', () => {
    for (const skill of ['addition-1000', 'subtraction-1000'] as const) {
      for (let seed = 1; seed <= 300; seed += 1) {
        const difficulties = skill === 'addition-1000' ? [2, 3] as const : [3] as const
        for (const difficulty of difficulties) {
          const exercise = generateExercise(skill, seed, difficulty)
          const first = Number(exercise.variant.values.first)
          const bridge = Number(exercise.variant.values.bridge)
          const answer = Number(exercise.correctAnswer)
          expect(exercise.answerMode).toBe('guided-choice')
          expect(exercise.steps?.map((step) => step.id)).toEqual(['bridge', 'result'])
          expect(exercise.steps?.[0]?.correctAnswer).toBe(String(bridge))
          expect(exercise.steps?.[1]?.correctAnswer).toBe(String(answer))
          expect(bridge).not.toBe(first)
          expect(bridge).not.toBe(answer)
          exercise.steps?.forEach((step) => {
            expect(step.options).toBeDefined()
            expect(new Set(step.options?.map((option) => option.value)).size).toBe(step.options?.length)
            expect(step.options?.filter((option) => option.value === step.correctAnswer)).toHaveLength(1)
          })
        }
      }
    }
  })

  it('liefert beide kontrollierten Entbündelungsarten bei der Subtraktion', () => {
    const subskills = new Set<string>()
    for (let seed = 1; seed <= 300; seed += 1) subskills.add(generateExercise('subtraction-1000', seed, 3).subskillId ?? '')
    expect(subskills).toEqual(new Set(['subtraction-1000-ones-unbundling', 'subtraction-1000-tens-unbundling']))
  })

  it('berechnet Geldbeträge exakt in Cent und stellt jede Münzsumme korrekt dar', () => {
    for (const difficulty of [1, 2, 3] as const) {
      for (let seed = 1; seed <= 500; seed += 1) {
        const exercise = generateExercise('money', seed, difficulty)
        const amountCents = Number(exercise.variant.values.amountCents)
        expect(amountCents).toBeGreaterThanOrEqual(0)
        expect(amountCents).toBeLessThanOrEqual(1000)
        expect(exercise.correctAnswer).toBe(String(amountCents))
        expect(exercise.options?.find((option) => option.value === exercise.correctAnswer)?.label).toBe(formatEuro(amountCents))
        expect(new Set(exercise.options?.map((option) => option.value)).size).toBe(exercise.options?.length)
        if (difficulty < 3) {
          const coins = exercise.representation?.values.coins
          expect(Array.isArray(coins)).toBe(true)
          if (!Array.isArray(coins) || coins.some((coin) => typeof coin !== 'number')) throw new Error('Ungültige Münzwerte')
          expect((coins as number[]).reduce((sum, coin) => sum + coin, 0)).toBe(exercise.representation?.values.displayedCents)
        } else {
          expect(Number(exercise.variant.values.paidCents) - Number(exercise.variant.values.priceCents)).toBe(amountCents)
          expect(exercise.subskillId).toBe('money-change')
        }
      }
    }
  })

  it('verwendet eine eindeutige deutsche Geldschreibweise', () => {
    expect(formatEuro(0)).toBe('0,00 €')
    expect(formatEuro(250)).toBe('2,50 €')
    expect(formatEuro(1000)).toBe('10,00 €')
  })

  it('misst und rechnet Längen konsistent in Zentimetern', () => {
    const subskills = new Set<string>()
    for (const difficulty of [1, 2, 3] as const) {
      for (let seed = 1; seed <= 500; seed += 1) {
        const exercise = generateExercise('lengths', seed, difficulty)
        const answerCm = Number(exercise.variant.values.answerCm)
        subskills.add(exercise.subskillId ?? '')
        expect(answerCm).toBeGreaterThan(0)
        expect(answerCm).toBeLessThanOrEqual(1000)
        expect(new Set(exercise.options?.map((option) => option.value)).size).toBe(exercise.options?.length)
        if (difficulty === 1) {
          expect(exercise.correctAnswer).toBe(`${answerCm} cm`)
          expect(exercise.representation?.values.lengthCm).toBe(answerCm)
        }
        if (difficulty === 2) expect(answerCm % 100).toBe(0)
        if (difficulty === 3) expect(exercise.correctAnswer).toBe(formatLength(answerCm))
      }
    }
    expect(subskills).toEqual(new Set([
      'length-read-centimeters', 'length-m-to-cm', 'length-cm-to-m', 'length-add', 'length-difference'
    ]))
  })

  it('formatiert Zentimeter und Meter ohne Dezimalrundung', () => {
    expect(formatLength(45)).toBe('45 cm')
    expect(formatLength(300)).toBe('3 m')
    expect(formatLength(370)).toBe('3 m 70 cm')
  })

  it('erzeugt zweischrittige Sachaufgaben mit zwei passenden Rechnungen', () => {
    const exercises = Array.from({ length: 400 }, (_, index) => generateExercise('word-problem', index + 1, 3))
    const multiStep = exercises.filter((exercise) => exercise.variant.values.secondOperation)
    expect(multiStep.length).toBeGreaterThan(0)
    multiStep.forEach((exercise) => {
      expect(exercise.steps?.map((step) => step.id)).toContain('second-equation')
      expect(exercise.steps?.map((step) => step.id)).toContain('final-calculation')
      expect(exercise.prompt).not.toMatch(/\{\w+\}/)
      expect(exercise.steps?.every((step) => !step.prompt.match(/\{\w+\}/))).toBe(true)
    })
  })

  it('bildet Zahlenstrahlsprünge lückenlos und mathematisch korrekt ab', () => {
    for (const skill of ['addition-1000', 'subtraction-1000', 'complement-1000'] as const) {
      for (const difficulty of [1, 2] as const) {
        for (let seed = 1; seed <= 200; seed += 1) {
          const exercise = generateExercise(skill, seed, difficulty)
          if (exercise.representation?.kind !== 'number-line') continue
          const jumps = exercise.representation.values.jumps
          expect(Array.isArray(jumps)).toBe(true)
          if (!Array.isArray(jumps)) continue
          jumps.forEach((jump, index) => {
            if (typeof jump === 'number') throw new Error('Ungültiger Zahlenstrahlsprung')
            const previous = jumps[index - 1]
            if (index > 0) {
              if (typeof previous === 'number') throw new Error('Ungültiger Zahlenstrahlsprung')
              expect(jump.from).toBe(previous?.to)
            }
            expect(jump.label).toBe(jump.to - jump.from > 0 ? `+${jump.to - jump.from}` : String(jump.to - jump.from))
          })
          const lastJump = jumps.at(-1)
          if (typeof lastJump === 'number') throw new Error('Ungültiger Zahlenstrahlsprung')
          expect(lastJump?.to).toBe(Number(exercise.correctAnswer) + (skill === 'complement-1000' ? Number(exercise.variant.values.first) : 0))
        }
      }
    }
  })

  it('verwendet ausschließlich explizite Symmetrievorlagen der jeweiligen Progressionsphase', () => {
    const templates = getTaskCatalog().symmetry.templates
    for (const progressionPhase of [1, 2, 3, 4, 5] as const) {
      const difficulty = progressionPhase === 1 ? 1 : progressionPhase === 2 ? 2 : 3
      const allowed = new Set(templates.filter((template) => template.progressionPhase === progressionPhase).map((template) => JSON.stringify(template.grid)))
      for (let seed = 1; seed <= 100; seed += 1) {
        expect(allowed.has(JSON.stringify(generateExercise('symmetry', seed, difficulty, `symmetry-phase-${progressionPhase}`).sourceGrid))).toBe(true)
      }
    }
  })

  it('erzeugt über 1.000 Seeds je Faltstufe nur eindeutige fachlich passende Ergebnisse', () => {
    for (const difficulty of [1, 2, 3] as const) {
      const axes = new Set<string>()
      for (let seed = 1; seed <= 1_000; seed += 1) {
        const exercise = generateExercise('folding', seed, difficulty)
        const values = exercise.representation?.values
        const rows = Number(values?.rows)
        const columns = Number(values?.columns)
        const axis = String(values?.axis) as 'vertical' | 'horizontal'
        const source = Array.isArray(values?.marks) ? Number(values.marks[0]) : -1
        const reflected = reflectFoldingCell(source, rows, columns, axis)
        axes.add(axis)
        expect(exercise.options).toHaveLength(3)
        expect(new Set(exercise.options?.map((option) => option.value)).size).toBe(3)
        expect(exercise.options?.filter((option) => option.value === exercise.correctAnswer)).toHaveLength(1)
        expect(exercise.correctAnswer).toBe(difficulty === 3
          ? foldingCellsKey([source, reflected])
          : foldingCellsKey([reflected]))
        expect(axis === 'vertical' ? columns % 2 : rows % 2).toBe(0)
      }
      expect(axes).toEqual(difficulty === 1 ? new Set(['vertical']) : new Set(['vertical', 'horizontal']))
    }
  })
})
