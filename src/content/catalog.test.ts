import { afterEach, describe, expect, it } from 'vitest'
import { mirrorGrid } from '../domain/generators'
import { SKILL_IDS } from '../domain/types'
import publicCatalogJson from '../../public/content/task-catalog.v1.json?raw'
import fallbackCatalogJson from './task-catalog.fallback.v1.json?raw'
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
    expect((catalog as TaskCatalog).version).toBe(1)
    expect((catalog as TaskCatalog).numberRange).toEqual({ min: 0, max: 1000 })
  })

  it('hält öffentlichen Katalog und eingebauten Fallback auf demselben geprüften Stand', () => {
    expect(JSON.parse(fallbackCatalogJson)).toEqual(readPublicCatalog())
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

  it('verwendet bei ungültigem oder nicht ladbarem Katalog den geprüften Fallback', async () => {
    expect(resolveTaskCatalog({ version: 999 })).toBe(FALLBACK_TASK_CATALOG)
    await expect(loadTaskCatalog(async () => ({ ok: true, json: async () => ({ version: 999 }) }))).resolves.toBe(FALLBACK_TASK_CATALOG)
    await expect(loadTaskCatalog(async () => { throw new Error('offline') })).resolves.toBe(FALLBACK_TASK_CATALOG)
  })
})
