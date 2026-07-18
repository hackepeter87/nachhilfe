import { describe, expect, it } from 'vitest'
import { getTaskCatalog } from '../content/catalog'
import { generateExercise, isAnswerCorrect } from './generators'
import type { Exercise, ExerciseRepresentation } from './types'

function allRepresentations(exercise: Exercise): ExerciseRepresentation[] {
  return [
    exercise.representation,
    ...(exercise.options ?? []).map((option) => option.representation),
    ...(exercise.steps ?? []).flatMap((step) => [
      step.representation,
      ...(step.options ?? []).map((option) => option.representation)
    ])
  ].filter((entry): entry is ExerciseRepresentation => Boolean(entry))
}

function assertInitialRepresentationRoles(representation: ExerciseRepresentation, context: string) {
  const { knownValues, unknownValues, revealedValues } = representation.valueRoles
  const valueKeys = Object.keys(representation.values)
  if (new Set(knownValues).size !== knownValues.length) throw new Error(`${context}: doppelte bekannte Rolle`)
  if (new Set(unknownValues).size !== unknownValues.length) throw new Error(`${context}: doppelte unbekannte Rolle`)
  if (revealedValues.length !== 0) throw new Error(`${context}: Wert bereits vor der Bearbeitung aufgedeckt`)
  if (unknownValues.some((key) => knownValues.includes(key))) throw new Error(`${context}: Rolle zugleich bekannt und unbekannt`)
  if (!valueKeys.every((key) => knownValues.includes(key) || unknownValues.includes(key))) throw new Error(`${context}: Wert ohne mathematische Rolle`)
}

describe('curriculare Gesamtintegration', () => {
  it('prüft jeden aktiven Generator je Stufe über 1.000 Seeds gegen Katalog und Rollenvertrag', () => {
    const activeSkills = getTaskCatalog().skills.filter((skill) => skill.releaseStatus === 'active')
    let generated = 0
    for (const skill of activeSkills) {
      for (const level of skill.difficultyLevels) {
        for (let seed = 1; seed <= 1_000; seed += 1) {
          const exercise = generateExercise(skill.id, seed, level.level)
          const context = `${skill.id}/Stufe ${level.level}/Seed ${seed}`
          if (exercise.skillId !== skill.id || exercise.difficulty !== level.level) throw new Error(`${context}: falsche Kompetenz oder Stufe`)
          if (exercise.testMetadata.learningPhase !== level.learningPhase) throw new Error(`${context}: Lernphase weicht vom Katalog ab`)
          if (JSON.stringify(exercise.testMetadata.requirements) !== JSON.stringify(level.requirements)) throw new Error(`${context}: Anforderungen weichen vom Katalog ab`)
          if (!isAnswerCorrect(exercise, exercise.correctAnswer)) throw new Error(`${context}: eigene Lösung wird abgelehnt`)
          if (exercise.options) {
            if (new Set(exercise.options.map((option) => option.value)).size !== exercise.options.length) throw new Error(`${context}: doppelte Antwortoption`)
            if (exercise.options.filter((option) => option.value === exercise.correctAnswer).length !== 1) throw new Error(`${context}: keine eindeutige Lösung`)
          }
          for (const step of exercise.steps ?? []) {
            if (step.interaction === 'build-pairing') {
              if (!step.expectedSelections || step.expectedSelections.length !== step.options?.length ||
                [...step.expectedSelections].sort().join('|') !== step.correctAnswer) throw new Error(`${context}/${step.id}: Paarungen unvollständig`)
            } else if (step.options && step.options.filter((option) => option.value === step.correctAnswer).length !== 1) {
              throw new Error(`${context}/${step.id}: keine eindeutige Schrittlösung`)
            }
          }
          for (const representation of allRepresentations(exercise)) assertInitialRepresentationRoles(representation, `${context}/${representation.kind}`)
          if (seed === 1_000 && JSON.stringify(generateExercise(skill.id, seed, level.level)) !== JSON.stringify(exercise)) throw new Error(`${context}: nicht deterministisch`)
          generated += 1
        }
      }
    }
    expect(generated).toBe(activeSkills.length * 3 * 1_000)
  }, 60_000)

  it('hält Hilfetexte, Darstellungsverfügbarkeit und katalogisierte Sichtbarkeit synchron', () => {
    const visualReference = /(Balken|Bild|Diagramm|Gefäß|Gruppe|Material|Messstrecke|Münz|Punktefeld|Raster|Rechenstrich|Stellenwerttafel|Tabelle|Waage|Zahlenstrahl)/i
    for (const skill of getTaskCatalog().skills.filter((candidate) => candidate.releaseStatus === 'active')) {
      for (const level of skill.difficultyLevels) {
        const exercise = generateExercise(skill.id, 8_000 + level.level, level.level)
        if (skill.id === 'symmetry') {
          expect(exercise.sourceGrid, `${skill.id}/Stufe ${level.level}`).toBeDefined()
          continue
        }
        if (skill.id === 'word-problem') {
          const modelStep = exercise.steps?.find((step) => step.id === 'model')
          expect(modelStep?.representation || modelStep?.options?.every((option) => option.representation), `${skill.id}/Stufe ${level.level}`).toBeTruthy()
          continue
        }
        if (level.representation === 'none' && !exercise.representation) continue
        expect(exercise.representation, `${skill.id}/Stufe ${level.level}`).toBeDefined()
        const expectedVisibility = level.representation === 'none' ? 'scaffold' : level.representation
        expect(exercise.representation?.visibility, `${skill.id}/Stufe ${level.level}`).toBe(expectedVisibility)
        if (level.representation === 'none') {
          expect(exercise.hints.some((hint) => visualReference.test(hint.text)), `${skill.id}/Stufe ${level.level}: Tipp verweist auf verborgene Darstellung`).toBe(false)
        }
        expect(skill.remediation.representation.trim().length, `${skill.id}: Remediation ohne Darstellungsangabe`).toBeGreaterThan(0)
      }
    }
  })
})
