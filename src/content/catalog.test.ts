import { afterEach, describe, expect, it } from 'vitest'
import {
  createShiftDistractor,
  everyOccupiedCellHasMirrorPartner,
  expectedAxisPosition,
  hasOccupiedAxisCell,
  reflectGrid,
  sourceStaysOnOneAxisSide
} from '../domain/symmetry'
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
    expect((catalog as TaskCatalog).schemaVersion).toBe(19)
    expect((catalog as TaskCatalog).catalogVersion).toBe('0.29.1')
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

  it('lehnt eine fehlende oder unvollständige Darstellungsrichtlinie ab', () => {
    const missing = structuredClone(readPublicCatalog()) as unknown as Record<string, unknown>
    delete missing.representationPolicy
    expect(validateTaskCatalog(missing)).toBe(false)

    const incomplete = structuredClone(readPublicCatalog()) as TaskCatalog
    incomplete.representationPolicy.unknownValues = ''
    expect(validateTaskCatalog(incomplete)).toBe(false)
  })

  it('lehnt unvollständige fachliche Texte für Daten und Diagramme ab', () => {
    const catalog = structuredClone(readPublicCatalog()) as TaskCatalog
    catalog.dataAndCharts.prompts.tableRead = ''
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
      representationPolicy: 'runtime',
      difficultyLevels: 'runtime',
      successFeedback: 'runtime',
      errorFeedback: 'runtime',
      workedExample: 'review',
      processCompetencies: 'review',
      transferPrompt: 'planned'
    })
    expect(catalog.representationPolicy.rule).toMatch(/Gesuchte Größen.*niemals numerisch/i)
  })

  it('behauptet im Erfolgsfeedback keine unbeobachtete Rechenstrategie', () => {
    const catalog = readPublicCatalog() as TaskCatalog
    const forbidden = /passend zerlegt|stellenweise gerechnet|richtige Strategie|über den nächsten|passenden .*weg/i
    catalog.skills.forEach((skill) => expect(skill.successFeedback).not.toMatch(forbidden))
  })

  it('beschreibt die schriftliche Subtraktion als begrenzte Entbündelungsprogression', () => {
    const catalog = readPublicCatalog() as TaskCatalog
    const skill = catalog.skills.find((candidate) => candidate.id === 'written-subtraction')!
    expect(skill.prerequisites.join(' ')).toMatch(/Stellenwerte.*Subtraktion/i)
    expect(skill.difficultyLevels.map((level) => level.description)).toEqual([
      expect.stringMatching(/ohne Entbündelung/i),
      expect.stringMatching(/genau eine.*sichtbar/i),
      expect.stringMatching(/selbstständig.*Additionsprobe/i)
    ])
    expect(skill.misconceptions.join(' ')).toMatch(/kleinere Ziffer.*größeren/i)
    expect(skill.remediation.foundationStrategy).toMatch(/ohne Entbündelung/i)
    expect(catalog.strategySteps.writtenSubtraction.checkPrompt).toMatch(/Additionsprobe/i)
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

  it('trennt sechs Lernhandlungen in drei produktiven Symmetriestufen von späteren Achsensonderfällen', () => {
    const catalog = readPublicCatalog() as TaskCatalog
    const skill = catalog.skills.find((candidate) => candidate.id === 'symmetry')!
    expect(skill.learningPhases.map((phase) => phase.exerciseTypes)).toEqual([
      ['symmetry:symmetry-identify-side-change'],
      ['symmetry:symmetry-understand-equal-distance'],
      ['symmetry:symmetry-mirror-guided'],
      ['symmetry:symmetry-mirror-independent'],
      ['symmetry:symmetry-mirror-fluent'],
      ['symmetry:symmetry-analyze-wrong-axis']
    ])
    expect(catalog.symmetry.progression.map((phase) => phase.phase)).toEqual([1, 2, 3, 4, 5])
    expect(catalog.symmetry.entryRationale).toMatch(/Gerade Raster.*eindeutig.*Sonderfall/i)
    expect(catalog.symmetry.templates.filter((template) => template.progressionPhase <= 3).every((template) =>
      template.axisPosition === 'between-cells' && (template.axis === 'vertical' ? template.grid[0]!.length : template.grid.length) % 2 === 0
    )).toBe(true)
    expect(catalog.symmetry.templates.filter((template) => template.progressionPhase <= 2).every((template) => template.axis === 'vertical')).toBe(true)
    expect(skill.learningPhases.flatMap((phase) => phase.exerciseTypes).some((type) => /through-cells|axis-invariance/.test(type))).toBe(false)
    expect(catalog.symmetry.templates.filter((template) => template.progressionPhase === 4).every((template) =>
      template.axisPosition === 'through-cells' && hasOccupiedAxisCell(template.grid, template.axis)
    )).toBe(true)
    expect(new Set(catalog.symmetry.templates.filter((template) => template.progressionPhase === 5).map((template) => template.axisPosition))).toEqual(new Set(['between-cells', 'through-cells']))
  })

  it('erzeugt je Symmetrievorlage genau eine fachlich gültige Spiegelung', () => {
    const catalog = readPublicCatalog() as TaskCatalog
    catalog.symmetry.templates.forEach((template) => {
      const correct = reflectGrid(template.grid, template.axis)
      const shift = createShiftDistractor(template.grid, template.axis)
      const wrongAxis = reflectGrid(template.grid, template.axis === 'vertical' ? 'horizontal' : 'vertical')
      expect(template.axisPosition).toBe(expectedAxisPosition(template.grid, template.axis))
      expect(sourceStaysOnOneAxisSide(template.grid, template.axis)).toBe(true)
      expect(everyOccupiedCellHasMirrorPartner(template.grid, template.axis)).toBe(true)
      expect(shift).not.toBeNull()
      expect(new Set([correct, shift, wrongAxis].map((grid) => JSON.stringify(grid))).size).toBe(3)
      ;[template.grid, correct, shift, wrongAxis].forEach((grid) => {
        expect(grid).toHaveLength(template.grid.length)
        expect(grid?.every((row) => row.length === template.grid[0]!.length)).toBe(true)
      })
    })
  })

  it('lehnt eine Figur auf beiden Seiten der Achse ab', () => {
    const catalog = structuredClone(readPublicCatalog()) as TaskCatalog
    const template = catalog.symmetry.templates.find((candidate) => candidate.progressionPhase === 1)!
    template.grid[0]![template.grid[0]!.length - 1] = 1
    expect(validateTaskCatalog(catalog)).toBe(false)
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
    expect(catalog.wordProblemSteps.modellingProgression.map((stage) => stage.stage)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    expect(catalog.wordProblemSteps.runtimeSequence.map((step) => step.id)).toEqual([
      'question', 'relevant', 'model', 'equation', 'calculate', 'second-equation', 'final-calculation', 'plausibility', 'check'
    ])
    expect(JSON.stringify(catalog.wordProblemSteps)).not.toMatch(/Mengenbeziehung|Welche Rechenart/i)
  })

  it('verwendet in Remediation konkrete Handlungen statt interner Defizitsprache', () => {
    const catalog = readPublicCatalog() as TaskCatalog
    for (const skill of catalog.skills) {
      expect(skill.remediation.foundationStrategy).not.toMatch(/Grundlage von|neu aufbauen/i)
    }
  })

  it('lehnt eine abweichende Sachaufgaben-Runtime-Sequenz ab', () => {
    const catalog = structuredClone(readPublicCatalog()) as TaskCatalog
    catalog.wordProblemSteps.runtimeSequence = catalog.wordProblemSteps.runtimeSequence.filter((step) => step.id !== 'model')
    expect(validateTaskCatalog(catalog)).toBe(false)
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

  it('lehnt doppelte oder mehrdeutige Größen-Bezugsdaten auch zur Laufzeit ab', () => {
    const duplicateReference = structuredClone(readPublicCatalog()) as TaskCatalog
    duplicateReference.quantityContent.mass.referenceEstimates[1]!.id = duplicateReference.quantityContent.mass.referenceEstimates[0]!.id
    expect(validateTaskCatalog(duplicateReference)).toBe(false)

    const missingCorrectOption = structuredClone(readPublicCatalog()) as TaskCatalog
    missingCorrectOption.quantityContent.capacity.referenceEstimates[0]!.options = ['10 ml', '50 ml', '500 ml']
    expect(validateTaskCatalog(missingCorrectOption)).toBe(false)
  })

  it('validiert die verwendeten Geometriebezeichnungen und eindeutigen Mustersymbole', () => {
    const catalog = structuredClone(readPublicCatalog()) as TaskCatalog
    expect(catalog.planeGeometry.shapeLabels.square).toBe('Quadrat')
    catalog.planeGeometry.patternSymbols[3] = catalog.planeGeometry.patternSymbols[0]
    expect(validateTaskCatalog(catalog)).toBe(false)
  })

  it('validiert Körpervorlagen, Stufen und feste Blickrichtungen', () => {
    const catalog = structuredClone(readPublicCatalog()) as TaskCatalog
    expect(catalog.spatialViews.templates.map((template) => template.difficulty)).toEqual(expect.arrayContaining([1, 2, 3]))
    expect(catalog.spatialViews.directionLabels).toEqual(expect.objectContaining({ front: expect.any(String), right: expect.any(String), top: expect.any(String) }))
    catalog.spatialViews.templates[0]!.heights = [1]
    expect(validateTaskCatalog(catalog)).toBe(false)
  })

  it('validiert Rotationsrichtung, Stufen und drei unterscheidbare Folgezustände', () => {
    const catalog = structuredClone(readPublicCatalog()) as TaskCatalog
    expect(catalog.spatialRotations.templates.filter((template) => template.difficulty === 1).every((template) => template.turn === 'right')).toBe(true)
    expect(new Set(catalog.spatialRotations.templates.filter((template) => template.difficulty === 2).map((template) => template.turn))).toEqual(new Set(['left', 'right']))
    expect(new Set(catalog.spatialRotations.templates.filter((template) => template.difficulty === 3).map((template) => template.turn))).toEqual(new Set(['left', 'right']))

    const symmetric = catalog.spatialRotations.templates.find((template) => template.difficulty === 2)!
    symmetric.heights = [1, 1, 1, 1]
    expect(validateTaskCatalog(catalog)).toBe(false)
  })

  it('lehnt eine Linksdrehung in der geführten Einstiegsstufe ab', () => {
    const catalog = structuredClone(readPublicCatalog()) as TaskCatalog
    catalog.spatialRotations.templates.find((template) => template.difficulty === 1)!.turn = 'left'
    expect(validateTaskCatalog(catalog)).toBe(false)
  })

  it('validiert die Faltprogression von Punktlage zu einfachem Faltschnitt', () => {
    const catalog = structuredClone(readPublicCatalog()) as TaskCatalog
    expect(catalog.spatialFolding.templates.filter((template) => template.difficulty === 1).every((template) =>
      template.mode === 'point-fold' && template.axis === 'vertical' && template.columns % 2 === 0
    )).toBe(true)
    expect(new Set(catalog.spatialFolding.templates.filter((template) => template.difficulty === 2).map((template) => template.axis))).toEqual(new Set(['vertical', 'horizontal']))
    expect(catalog.spatialFolding.templates.filter((template) => template.difficulty === 3).every((template) => template.mode === 'cut-unfold')).toBe(true)
    expect(catalog.spatialFolding.entryRationale).toMatch(/gerichtete Spiegelung.*Achsen zwischen Zellen/i)
  })

  it('lehnt einen Faltschnitt in der Einstiegsstufe und Achsen durch Zellen ab', () => {
    const earlyCut = structuredClone(readPublicCatalog()) as TaskCatalog
    earlyCut.spatialFolding.templates.find((template) => template.difficulty === 1)!.mode = 'cut-unfold'
    expect(validateTaskCatalog(earlyCut)).toBe(false)

    const oddGrid = structuredClone(readPublicCatalog()) as TaskCatalog
    oddGrid.spatialFolding.templates.find((template) => template.axis === 'vertical')!.columns = 5
    expect(validateTaskCatalog(oddGrid)).toBe(false)
  })

  it('verwendet bei ungültigem oder nicht ladbarem Katalog den geprüften Fallback', async () => {
    expect(resolveTaskCatalog({ schemaVersion: 999 })).toBe(FALLBACK_TASK_CATALOG)
    await expect(loadTaskCatalog(async () => ({ ok: true, json: async () => ({ schemaVersion: 999 }) }))).resolves.toBe(FALLBACK_TASK_CATALOG)
    await expect(loadTaskCatalog(async () => { throw new Error('offline') })).resolves.toBe(FALLBACK_TASK_CATALOG)
  })

  it('akzeptiert einen fokussierten Sachaufgabenkatalog für die mobile Abnahme', () => {
    const focused = structuredClone(FALLBACK_TASK_CATALOG)
    focused.skills.forEach((skill) => {
      if (!['addition', 'word-problem'].includes(skill.id)) skill.releaseStatus = 'disabled'
    })
    focused.wordProblems = focused.wordProblems.filter((template) => template.id === 'shells-addition')
    expect(resolveTaskCatalog(focused)).toBe(focused)
  })
})
