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
    expect((catalog as TaskCatalog).schemaVersion).toBe(2)
    expect((catalog as TaskCatalog).catalogVersion).toBe('0.2.0')
    expect((catalog as TaskCatalog).catalogId).toBe('nrw-klasse3-foerderkern')
    expect((catalog as TaskCatalog).status).toBe('review')
    expect((catalog as TaskCatalog).numberRange).toEqual({ min: 0, max: 1000 })
  })

  it('hält öffentlichen Katalog und eingebauten Fallback auf demselben geprüften Stand', () => {
    expect(publicCatalogJson).toBe(sourceCatalogJson)
    expect(fallbackCatalogJson).toBe(sourceCatalogJson)
    expect(JSON.parse(fallbackCatalogJson)).toEqual(readPublicCatalog())
  })

  it.each([
    ['schemaVersion', 3],
    ['catalogVersion', 'keine-version'],
    ['catalogId', ''],
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
      expect(skill.processCompetencies.length).toBeGreaterThan(0)
      expect(skill.difficultyLevels.map((level) => level.level)).toEqual([1, 2, 3])
      expect(skill.representations.length).toBeGreaterThan(0)
      expect(skill.workedExample.length).toBeGreaterThan(0)
      expect(skill.remediation.length).toBeGreaterThan(0)
      expect(skill.transferPrompt.length).toBeGreaterThan(0)
      expect(skill.releaseStatus).toBe('active')
    })
  })

  it('beschreibt eindeutig lösbare Sachaufgaben', () => {
    const catalog = readPublicCatalog() as TaskCatalog
    catalog.wordProblems.forEach((template) => {
      for (let first = template.firstRange.min; first <= template.firstRange.max; first += 1) {
        for (let second = template.secondRange.min; second <= template.secondRange.max; second += 1) {
          const result = template.operation === '+' ? first + second : template.operation === '−' ? first - second : first * second
          expect(result).toBeGreaterThanOrEqual(0)
          const answer = renderCatalogText(template.answer, { first, second, result })
          expect(answer).toContain(String(result))
          expect(answer).not.toMatch(/\{\w+\}/)
        }
      }
    })
  })

  it('erzeugt je Symmetrievorlage genau eine unterscheidbare Spiegelung', () => {
    const catalog = readPublicCatalog() as TaskCatalog
    catalog.symmetry.templates.forEach((template) => {
      const mirror = mirrorGrid(template.grid)
      const flip = [...template.grid].reverse().map((row) => [...row])
      expect(new Set([template.grid, mirror, flip].map((grid) => JSON.stringify(grid))).size).toBe(3)
    })
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

  it('verwendet bei ungültigem oder nicht ladbarem Katalog den geprüften Fallback', async () => {
    expect(resolveTaskCatalog({ schemaVersion: 999 })).toBe(FALLBACK_TASK_CATALOG)
    await expect(loadTaskCatalog(async () => ({ ok: true, json: async () => ({ schemaVersion: 999 }) }))).resolves.toBe(FALLBACK_TASK_CATALOG)
    await expect(loadTaskCatalog(async () => { throw new Error('offline') })).resolves.toBe(FALLBACK_TASK_CATALOG)
  })
})
