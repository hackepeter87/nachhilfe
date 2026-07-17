import { afterEach, describe, expect, it } from 'vitest'
import { mirrorGrid } from '../domain/generators'
import { SKILL_IDS } from '../domain/types'
import sourceCatalogJson from '../../content/catalogs/nrw-klasse3-foerderkern/catalog.json?raw'
import publicCatalogJson from '../../public/content/task-catalog.json?raw'
import fallbackCatalogJson from './task-catalog.fallback.json?raw'
import {
  FALLBACK_TASK_CATALOG,
  loadTaskCatalog,
  renderCatalogText,
  resolveTaskCatalog,
  setTaskCatalog,
  validateTaskCatalog,
  type TaskCatalog
} from './catalog'

function readPublicCatalog(): unknown {
  return JSON.parse(publicCatalogJson)
}

afterEach(() => setTaskCatalog(FALLBACK_TASK_CATALOG))

describe('versionierter Aufgabenkatalog', () => {
  it('ist syntaktisch gültig und erfüllt das kleine Laufzeitschema', () => {
    const catalog = readPublicCatalog()
    expect(validateTaskCatalog(catalog)).toBe(true)
    expect((catalog as TaskCatalog).schemaVersion).toBe(6)
    expect((catalog as TaskCatalog).catalogVersion).toBe('0.7.0')
    expect((catalog as TaskCatalog).catalogId).toBe('nrw-klasse3-foerderkern')
    expect((catalog as TaskCatalog).status).toBe('ready-for-review')
    expect((catalog as TaskCatalog).numberRange).toEqual({ min: 0, max: 1000 })
  })

  it('hält öffentlichen Katalog und eingebauten Fallback auf demselben geprüften Stand', () => {
    expect(publicCatalogJson).toBe(sourceCatalogJson)
    expect(fallbackCatalogJson).toBe(sourceCatalogJson)
    expect(JSON.parse(fallbackCatalogJson)).toEqual(readPublicCatalog())
  })

  it.each([
    ['schemaVersion', 5],
    ['catalogVersion', 'keine-version'],
    ['catalogId', ''],
    ['status', 'review'],
    ['status', 'published']
  ])('lehnt ungültige Katalogmetadaten %s ab', (field, value) => {
    const catalog = structuredClone(readPublicCatalog()) as unknown as Record<string, unknown>
    catalog[field] = value
    expect(validateTaskCatalog(catalog)).toBe(false)
  })

  it('kennt ausschließlich alle produktiven Skill-IDs', () => {
    const catalog = readPublicCatalog() as TaskCatalog
    expect(catalog.skills.map((skill) => skill.id).sort()).toEqual([...SKILL_IDS].sort())
  })

  it('liefert für jede Kompetenz Label, Bereich, Förderziel, Fehlvorstellungen und zwei Hilfen', () => {
    const catalog = readPublicCatalog() as TaskCatalog
    catalog.skills.forEach((skill) => {
      expect(skill.label.length).toBeGreaterThan(0)
      expect(skill.curriculumArea.length).toBeGreaterThan(0)
      expect(skill.supportGoal.length).toBeGreaterThan(0)
      expect(skill.misconceptions.length).toBeGreaterThan(0)
      expect(skill.hints).toHaveLength(2)
      expect(skill.difficultyLevels.map((level) => level.level)).toEqual([1, 2, 3])
      expect(skill.representations.length).toBeGreaterThan(0)
      expect(skill.workedExample.length).toBeGreaterThan(0)
      expect(skill.remediation.strategy.length).toBeGreaterThan(0)
      expect(skill.learningPhases).toHaveLength(6)
      expect(skill.successCriteria.length).toBeGreaterThan(0)
      expect(skill.transferPrompt.length).toBeGreaterThan(0)
      expect(skill.releaseStatus).toBe('active')
    })
  })

  it('klassifiziert didaktische Felder nach ihrer tatsächlichen Verwendung', () => {
    const catalog = readPublicCatalog() as TaskCatalog
    expect(catalog.fieldUsage).toMatchObject({
      difficultyLevels: 'runtime',
      successFeedback: 'runtime',
      errorFeedback: 'runtime',
      workedExample: 'review',
      processCompetencies: 'review',
      transferPrompt: 'planned'
    })
  })

  it('behauptet im Erfolgsfeedback keine unbeobachtete Rechenstrategie', () => {
    const catalog = readPublicCatalog() as TaskCatalog
    const forbidden = /passend zerlegt|stellenweise gerechnet|richtige Strategie|über den nächsten|passenden .*weg/i
    catalog.skills.forEach((skill) => expect(skill.successFeedback).not.toMatch(forbidden))
  })

  it('beschreibt eindeutig lösbare Sachaufgaben', () => {
    const catalog = readPublicCatalog() as TaskCatalog
    catalog.wordProblems.forEach((template) => {
      for (let first = template.firstRange.min; first <= template.firstRange.max; first += 1) {
        for (let second = template.secondRange.min; second <= template.secondRange.max; second += 1) {
          const intermediate = template.operation === '+' ? first + second : template.operation === '−' ? first - second : template.operation === ':' ? second : first * second
          const thirds = template.thirdRange ? [template.thirdRange.min, template.thirdRange.max] : [0]
          thirds.forEach((third) => {
            const result = template.secondOperation === '+' ? intermediate + third : template.secondOperation === '−' ? intermediate - third : intermediate
            expect(result).toBeGreaterThanOrEqual(0)
            expect(result).toBeLessThanOrEqual(1000)
            const answer = renderCatalogText(template.answer, { first, second, third, intermediate, result })
            expect(answer).toContain(String(result))
            expect(answer).not.toMatch(/\{\w+\}/)
          })
        }
      }
    })
  })

  it('lehnt unvollständige zweischrittige Sachaufgaben ab', () => {
    const catalog = structuredClone(readPublicCatalog()) as TaskCatalog
    const multiStep = catalog.wordProblems.find((template) => template.secondOperation)
    expect(multiStep).toBeDefined()
    delete multiStep!.thirdRange
    expect(validateTaskCatalog(catalog)).toBe(false)
  })

  it('erzeugt je Symmetrievorlage genau eine unterscheidbare Spiegelung', () => {
    const catalog = readPublicCatalog() as TaskCatalog
    catalog.symmetry.templates.forEach((template) => {
      const mirror = mirrorGrid(template.grid)
      const flip = [...template.grid].reverse().map((row) => [...row])
      const correct = template.axis === 'vertical' ? mirror : flip
      expect(template.grid).toHaveLength(template.difficulty + 2)
      expect(new Set([correct, template.shiftGrid, template.wrongAxisGrid].map((grid) => JSON.stringify(grid))).size).toBe(3)
    })
  })

  it('ordnet Sachaufgaben intern korrekt zu und liefert konkrete Modellierungsoptionen', () => {
    const catalog = readPublicCatalog() as TaskCatalog
    const operationByRelationship = { join: '+', combine: '+', separate: '−', compare: '−', complement: '−', 'equal-groups': '·', sharing: ':' }
    catalog.wordProblems.forEach((template) => {
      expect(template.operation).toBe(operationByRelationship[template.relationship as keyof typeof operationByRelationship])
      expect(new Set([template.question, ...template.questionDistractors]).size).toBe(3)
      expect(new Set([template.situation, ...template.situationDistractors]).size).toBe(3)
      expect(new Set([template.modelType, ...template.modelDistractors]).size).toBe(3)
      expect(new Set([template.equation, ...template.equationDistractors]).size).toBe(3)
      expect(template.plausibility.options.filter((option) => option.correct)).toHaveLength(1)
    })
    expect(catalog.wordProblemSteps.modellingProgression.map((stage) => stage.stage)).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(JSON.stringify(catalog.wordProblemSteps)).not.toMatch(/Mengenbeziehung|Welche Rechenart/i)
  })

  it('fördert keine einfache Schlüsselwortregel', () => {
    const catalog = readPublicCatalog() as TaskCatalog
    const withZusammen = catalog.wordProblems.filter((template) => /zusammen/i.test(template.story))
    expect(new Set(withZusammen.map((template) => template.operation))).toEqual(new Set(['+', '·']))
    const withMehr = catalog.wordProblems.filter((template) => /mehr/i.test(template.story))
    expect(withMehr.some((template) => template.relationship === 'compare' && template.operation === '−')).toBe(true)
  })

  it('hält alle Laufzeitkompetenzen aktiv und vorbereitete Themen unsichtbar', () => {
    const catalog = readPublicCatalog() as TaskCatalog
    expect(catalog.skills.every((skill) => skill.releaseStatus === 'active')).toBe(true)
    expect(catalog.skills.every((skill) => skill.learningPhases.some((phase) => phase.releaseStatus === 'active'))).toBe(true)
    expect(catalog.preparedTopics.map((topic) => topic.id)).toEqual(['spatial-reasoning'])
    expect(catalog.skills.filter((skill) => ['money', 'lengths'].includes(skill.id)).every((skill) => skill.releaseStatus === 'active')).toBe(true)
    expect(catalog.preparedTopics.every((topic) => topic.releaseStatus === 'disabled')).toBe(true)
  })

  it('lehnt einen unbekannten Skill und unvollständige Inhalte ab', () => {
    const catalog = structuredClone(readPublicCatalog()) as TaskCatalog
    catalog.skills[0] = { ...catalog.skills[0]!, id: 'unknown' as TaskCatalog['skills'][number]['id'], hints: ['nur ein Tipp'] as unknown as [string, string] }
    expect(validateTaskCatalog(catalog)).toBe(false)
  })

  it('lehnt unbekannte Platzhalter ab und lädt draft nicht produktiv', () => {
    const placeholderCatalog = structuredClone(readPublicCatalog()) as TaskCatalog
    placeholderCatalog.skills[0]!.prompt = 'Unbekannt {secret}'
    expect(validateTaskCatalog(placeholderCatalog)).toBe(false)

    const draftCatalog = structuredClone(readPublicCatalog()) as TaskCatalog
    draftCatalog.status = 'draft'
    expect(validateTaskCatalog(draftCatalog)).toBe(true)
    expect(resolveTaskCatalog(draftCatalog, false)).toBe(FALLBACK_TASK_CATALOG)
    expect(resolveTaskCatalog(draftCatalog, true)).toBe(draftCatalog)
  })

  it('validiert die verwendeten Größeninhalte und lehnt unvollständige Einheitenangaben ab', () => {
    const catalog = structuredClone(readPublicCatalog()) as TaskCatalog
    expect(catalog.quantityContent.money.coinsLabel).toContain('Münz')
    expect(catalog.quantityContent.lengths.equivalenceLabel).toBe('1 m = 100 cm')
    catalog.quantityContent.lengths.equivalenceLabel = ''
    expect(validateTaskCatalog(catalog)).toBe(false)
  })

  it('verwendet bei ungültigem oder nicht ladbarem Katalog den geprüften Fallback', async () => {
    expect(resolveTaskCatalog({ schemaVersion: 999 })).toBe(FALLBACK_TASK_CATALOG)
    await expect(loadTaskCatalog(async () => ({ ok: true, json: async () => ({ schemaVersion: 999 }) }))).resolves.toBe(FALLBACK_TASK_CATALOG)
    await expect(loadTaskCatalog(async () => { throw new Error('offline') })).resolves.toBe(FALLBACK_TASK_CATALOG)
  })
})
