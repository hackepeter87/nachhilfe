import { describe, expect, it } from 'vitest'
import { createRemediationExercise, createRepetitionExercise, createSessionPlan, isSkillEligible } from './session'
import { createSkillProgress } from './progress'
import { generateExercise } from './generators'
import { FALLBACK_TASK_CATALOG, getTaskCatalog, setTaskCatalog } from '../content/catalog'

describe('Sitzungsplanung', () => {
  it('erstellt sieben Aufgaben mit Grundlagen, Transfer und Symmetrie', () => {
    const session = createSessionPlan({}, 12_345)
    expect(session.exercises).toHaveLength(7)
    expect(session.exercises.slice(0, 2).every((exercise) => ['addition', 'subtraction', 'multiplication', 'division'].includes(exercise.skillId))).toBe(true)
    expect(session.exercises.at(-2)?.skillId).toBe('word-problem')
    expect(session.exercises.at(-1)?.skillId).toBe('symmetry')
    expect(new Set(session.exercises.map((exercise) => exercise.variant.key)).size).toBe(7)
    expect(session).toMatchObject({
      catalogId: 'nrw-klasse3-foerderkern',
      catalogVersion: '0.13.0',
      schemaVersion: 11,
      appVersion: '0.14.0'
    })
  })

  it('führt Achsenzellen erst im sicheren Symmetrietransfer ein', () => {
    const automated = {
      ...createSkillProgress('symmetry'),
      attempts: 6,
      difficulty: 3 as const,
      learningPhase: 'automate' as const,
      mastery: 86,
      status: 'secure' as const
    }
    const firstTransfer = { ...automated, learningPhase: 'transfer' as const, mastery: 94 }
    const mixedTransfer = {
      ...firstTransfer,
      subskills: {
        'symmetry-phase-4': {
          attempts: 3,
          correctAnswers: 3,
          hintsUsed: 0,
          mastery: 71,
          recentErrors: 0,
          lastPracticedAt: '2026-07-17T08:00:00.000Z'
        }
      }
    }

    expect(createSessionPlan({ symmetry: automated }, 601).exercises.at(-1)?.symmetry?.progressionPhase).toBe(3)
    expect(createSessionPlan({ symmetry: firstTransfer }, 602).exercises.at(-1)?.symmetry).toMatchObject({ progressionPhase: 4, axisPosition: 'through-cells' })
    expect(createSessionPlan({ symmetry: mixedTransfer }, 603).exercises.at(-1)?.symmetry?.progressionPhase).toBe(5)
  })

  it('bindet eine laufende Runde unveränderlich an ihren Releasekontext', () => {
    const originalCatalog = getTaskCatalog()
    try {
      const currentCatalog = structuredClone(FALLBACK_TASK_CATALOG)
      setTaskCatalog(currentCatalog)
      const runningSession = createSessionPlan({}, 321)
      const runningPrompts = runningSession.exercises.map((exercise) => exercise.prompt)

      const nextCatalog = structuredClone(FALLBACK_TASK_CATALOG)
      nextCatalog.catalogVersion = '0.10.1'
      nextCatalog.skills.find((skill) => skill.id === runningSession.exercises[0]?.skillId)!.prompt = 'Neue Fassung: {first}'
      setTaskCatalog(nextCatalog)
      const nextSession = createSessionPlan({}, 322)

      expect(runningSession.catalogVersion).toBe('0.13.0')
      expect(runningSession.exercises.map((exercise) => exercise.prompt)).toEqual(runningPrompts)
      expect(nextSession.catalogVersion).toBe('0.10.1')
    } finally {
      setTaskCatalog(originalCatalog)
    }
  })

  it('plant keine als ready-for-review oder disabled markierte Kompetenz ein', () => {
    const originalCatalog = getTaskCatalog()
    try {
      const catalog = structuredClone(FALLBACK_TASK_CATALOG)
      catalog.skills.find((skill) => skill.id === 'round-tens')!.releaseStatus = 'disabled'
      catalog.skills.find((skill) => skill.id === 'place-value')!.releaseStatus = 'ready-for-review'
      setTaskCatalog(catalog)
      for (let seed = 1; seed <= 100; seed += 1) {
        const skills = createSessionPlan({}, seed).exercises.map((exercise) => exercise.skillId)
        expect(skills).not.toContain('round-tens')
        expect(skills).not.toContain('place-value')
      }
    } finally {
      setTaskCatalog(originalCatalog)
    }
  })

  it('plant Geld und Längen als produktive Fokuskompetenzen ein', () => {
    const originalCatalog = getTaskCatalog()
    try {
      const catalog = structuredClone(FALLBACK_TASK_CATALOG)
      catalog.skills.forEach((skill) => {
        if (!['addition', 'money', 'lengths'].includes(skill.id)) skill.releaseStatus = 'disabled'
      })
      setTaskCatalog(catalog)
      const skills = createSessionPlan({}, 808).exercises.map((exercise) => exercise.skillId)
      expect(skills).toContain('money')
      expect(skills).toContain('lengths')
    } finally {
      setTaskCatalog(originalCatalog)
    }
  })

  it('schaltet schriftliche Addition erst nach beiden fachlichen Voraussetzungen frei', () => {
    const placeValue = { ...createSkillProgress('place-value'), learningPhase: 'independent-practice' as const }
    const addition1000 = { ...createSkillProgress('addition-1000'), learningPhase: 'independent-practice' as const }
    expect(isSkillEligible('written-addition', {})).toBe(false)
    expect(isSkillEligible('written-addition', { 'place-value': placeValue })).toBe(false)
    expect(isSkillEligible('written-addition', { 'addition-1000': addition1000 })).toBe(false)
    expect(isSkillEligible('written-addition', { 'place-value': placeValue, 'addition-1000': addition1000 })).toBe(true)
  })

  it('schaltet schriftliche Subtraktion erst nach beiden fachlichen Voraussetzungen frei', () => {
    const placeValue = { ...createSkillProgress('place-value'), learningPhase: 'independent-practice' as const }
    const subtraction1000 = { ...createSkillProgress('subtraction-1000'), learningPhase: 'independent-practice' as const }
    expect(isSkillEligible('written-subtraction', {})).toBe(false)
    expect(isSkillEligible('written-subtraction', { 'place-value': placeValue })).toBe(false)
    expect(isSkillEligible('written-subtraction', { 'subtraction-1000': subtraction1000 })).toBe(false)
    expect(isSkillEligible('written-subtraction', { 'place-value': placeValue, 'subtraction-1000': subtraction1000 })).toBe(true)
  })

  it('schaltet Würfelrotation erst nach fünf Körperansichten und Lernwert 60 frei', () => {
    const bodyViews = createSkillProgress('body-views')
    expect(isSkillEligible('cube-rotation', {})).toBe(false)
    expect(isSkillEligible('cube-rotation', { 'body-views': { ...bodyViews, attempts: 4, mastery: 80 } })).toBe(false)
    expect(isSkillEligible('cube-rotation', { 'body-views': { ...bodyViews, attempts: 5, mastery: 59 } })).toBe(false)
    expect(isSkillEligible('cube-rotation', { 'body-views': { ...bodyViews, attempts: 5, mastery: 60 } })).toBe(true)
  })

  it('berücksichtigt schwache Grundrechenarten und Unterkompetenzen häufiger', () => {
    const weakMultiplication = {
      ...createSkillProgress('multiplication'),
      mastery: 8,
      recentErrors: 3,
      difficulty: 3 as const,
      learningPhase: 'transfer' as const,
      subskills: {
        'times-7': { attempts: 4, correctAnswers: 1, hintsUsed: 2, mastery: 10, recentErrors: 3, lastPracticedAt: null },
        'times-8': { attempts: 5, correctAnswers: 5, hintsUsed: 0, mastery: 92, recentErrors: 0, lastPracticedAt: new Date().toISOString() }
      }
    }
    const secure = { ...createSkillProgress('addition'), attempts: 8, mastery: 95, status: 'secure' as const, difficulty: 3 as const, learningPhase: 'transfer' as const }
    let multiplicationSelections = 0
    let additionSelections = 0
    let rowSevenSelections = 0
    for (let seed = 1; seed <= 300; seed += 1) {
      const warmups = createSessionPlan({ multiplication: weakMultiplication, addition: secure }, seed).exercises.slice(0, 2)
      multiplicationSelections += warmups.filter((exercise) => exercise.skillId === 'multiplication').length
      additionSelections += warmups.filter((exercise) => exercise.skillId === 'addition').length
      rowSevenSelections += warmups.filter((exercise) => exercise.subskillId === 'times-7').length
    }
    expect(multiplicationSelections).toBeGreaterThan(additionSelections)
    expect(rowSevenSelections).toBeGreaterThan(0)
  })

  it('bevorzugt einen schwachen Fokusbereich über viele Sitzungen', () => {
    const weak = { ...createSkillProgress('round-tens'), mastery: 5, recentErrors: 3 }
    const secure = { ...createSkillProgress('place-value'), attempts: 8, mastery: 95, status: 'secure' as const }
    let weakSelections = 0
    let secureSelections = 0
    for (let seed = 1; seed <= 200; seed += 1) {
      const skills = createSessionPlan({ 'round-tens': weak, 'place-value': secure }, seed).exercises.map((exercise) => exercise.skillId)
      if (skills.includes('round-tens')) weakSelections += 1
      if (skills.includes('place-value')) secureSelections += 1
    }
    expect(weakSelections).toBeGreaterThan(secureSelections)
  })

  it('übersetzt Lernphasen in tatsächliche Schwierigkeit und Darstellung', () => {
    const understanding = { ...createSkillProgress('addition-1000'), attempts: 3, mastery: 30, difficulty: 3 as const, learningPhase: 'understand' as const }
    const transfer = { ...createSkillProgress('subtraction-1000'), attempts: 10, mastery: 95, difficulty: 3 as const, status: 'secure' as const, learningPhase: 'transfer' as const }
    let understandingExercise: ReturnType<typeof generateExercise> | undefined
    let transferExercise: ReturnType<typeof generateExercise> | undefined
    for (let seed = 1; seed <= 200 && (!understandingExercise || !transferExercise); seed += 1) {
      const exercises = createSessionPlan({ 'addition-1000': understanding, 'subtraction-1000': transfer }, seed).exercises
      understandingExercise ??= exercises.find((exercise) => exercise.skillId === 'addition-1000')
      transferExercise ??= exercises.find((exercise) => exercise.skillId === 'subtraction-1000')
    }
    expect(understandingExercise).toMatchObject({ difficulty: 1, learningPhase: 'understand' })
    expect(understandingExercise?.representation?.visibility).toBe('always')
    expect(transferExercise).toMatchObject({ difficulty: 3, learningPhase: 'transfer' })
    expect(transferExercise?.representation).toBeUndefined()
  })

  it('erzeugt nach einem Fehler eine leichtere, andere Wiederholung', () => {
    const session = createSessionPlan({}, 900)
    const original = session.exercises[2]!
    const repetition = createRepetitionExercise(original.skillId, 900, 3, original.variant.key)
    expect(repetition.difficulty).toBe(2)
    expect(repetition.variant.key).not.toBe(original.variant.key)
  })

  it('wendet die kataloggesteuerte Remediation auf dieselbe Unterkompetenz an', () => {
    const original = generateExercise('addition', 901, 3, 'addition-bridge-10')
    const repetition = createRemediationExercise(original, 902)
    expect(repetition.difficulty).toBe(2)
    expect(repetition.subskillId).toBe(original.subskillId)
    expect(repetition.variant.key).not.toBe(original.variant.key)
  })

  it('führt nach einem Fehler bei schriftlicher Subtraktion auf eine sichtbare verwandte Entbündelung zurück', () => {
    const original = generateExercise('written-subtraction', 903, 3)
    const repetition = createRemediationExercise(original, 904)
    expect(repetition).toMatchObject({
      skillId: 'written-subtraction',
      difficulty: 2,
      subskillId: 'written-subtraction-ones-unbundling'
    })
    expect(repetition.representation?.visibility).toBe('always')
    expect(repetition.variant.key).not.toBe(original.variant.key)
  })

  it('führt nach einem Fehler bei Körperansichten auf ein leichteres anderes Gebäude zurück', () => {
    const original = generateExercise('body-views', 905, 3)
    const repetition = createRemediationExercise(original, 906)
    expect(repetition).toMatchObject({ skillId: 'body-views', difficulty: 2 })
    expect(repetition.variant.key).not.toBe(original.variant.key)
    expect(Number(repetition.variant.values.cubes)).toBeLessThanOrEqual(4)
  })

  it('führt nach einem Rotationsfehler auf eine leichtere andere Vierteldrehung zurück', () => {
    const original = generateExercise('cube-rotation', 907, 3)
    const repetition = createRemediationExercise(original, 908)
    expect(repetition).toMatchObject({ skillId: 'cube-rotation', difficulty: 2 })
    expect(repetition.variant.key).not.toBe(original.variant.key)
    expect(Number(repetition.variant.values.cubes)).toBeLessThanOrEqual(4)
    expect(repetition.representation?.kind).toBe('cube-rotation')
  })
})
