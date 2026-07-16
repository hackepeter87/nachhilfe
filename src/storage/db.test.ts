import { beforeEach, describe, expect, it } from 'vitest'
import { createSkillProgress } from '../domain'
import {
  databaseMetadata,
  LEGACY_SESSION_METADATA,
  loadAppData,
  migrateSkillProgress,
  saveCompletedSession,
  saveProfile,
  saveSettings,
  saveSkillProgress,
  verifyProgressStorage,
  verifyStorage
} from './db'

function deleteDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(databaseMetadata.name)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

describe('IndexedDB-Speicherung', () => {
  beforeEach(async () => {
    await deleteDatabase()
  })

  it('legt die versionierte Datenstruktur an', async () => {
    expect(await verifyStorage()).toBe(true)
    expect(await verifyProgressStorage()).toBe(true)
    expect(databaseMetadata.version).toBe(1)
  })

  it('stellt Profil, Einstellungen und Lernstand nach erneutem Öffnen wieder her', async () => {
    await saveProfile({ id: 'local-profile', nickname: 'Lina', createdAt: '2026-07-16T10:00:00.000Z' })
    await saveSettings({ key: 'app-settings', installHelpDismissed: true, schemaVersion: 1 })
    await saveSkillProgress({
      ...createSkillProgress('round-tens'),
      attempts: 2,
      mastery: 47,
      subskills: {
        'round-tens-midpoint': {
          attempts: 2,
          correctAnswers: 1,
          hintsUsed: 1,
          mastery: 47,
          recentErrors: 1,
          lastPracticedAt: '2026-07-16T10:00:00.000Z'
        }
      }
    })

    const data = await loadAppData()
    expect(data.profile?.nickname).toBe('Lina')
    expect(data.settings.installHelpDismissed).toBe(true)
    expect(data.progress['round-tens']?.mastery).toBe(47)
    expect(data.progress['round-tens']?.subskills['round-tens-midpoint']?.recentErrors).toBe(1)
  })

  it('ergänzt bei alten Lernständen eine ableitbare Lernphase', () => {
    const legacy = createSkillProgress('place-value')
    delete (legacy as Partial<typeof legacy>).learningPhase
    expect(migrateSkillProgress(legacy).learningPhase).toBe('activate')
  })

  it('speichert den fachlichen Releasekontext einer abgeschlossenen Sitzung', async () => {
    await saveCompletedSession({
      id: 'session-current',
      catalogId: 'nrw-klasse3-foerderkern',
      catalogVersion: '0.2.0',
      schemaVersion: 2,
      appVersion: '0.3.0',
      startedAt: '2026-07-16T09:00:00.000Z',
      completedAt: '2026-07-16T09:10:00.000Z',
      results: [],
      selfAssessment: 'thinking'
    })

    const data = await loadAppData()
    expect(data.sessions[0]).toMatchObject({
      catalogId: 'nrw-klasse3-foerderkern',
      catalogVersion: '0.2.0',
      schemaVersion: 2,
      appVersion: '0.3.0'
    })
  })

  it('migriert eine alte Sitzung verlustfrei mit unbekanntem Releasekontext', async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(databaseMetadata.name, 1)
      request.onupgradeneeded = () => {
        const database = request.result
        database.createObjectStore(databaseMetadata.stores.profile, { keyPath: 'id' })
        database.createObjectStore(databaseMetadata.stores.settings, { keyPath: 'key' })
        database.createObjectStore(databaseMetadata.stores.progress, { keyPath: 'skillId' })
        const sessions = database.createObjectStore(databaseMetadata.stores.sessions, { keyPath: 'id' })
        sessions.put({
          id: 'session-legacy',
          startedAt: '2026-07-01T09:00:00.000Z',
          completedAt: '2026-07-01T09:10:00.000Z',
          results: [{ exerciseId: 'old-1', skillId: 'addition' }],
          selfAssessment: 'hint'
        })
      }
      request.onsuccess = () => {
        request.result.close()
        resolve()
      }
      request.onerror = () => reject(request.error)
    })

    const data = await loadAppData()
    expect(data.sessions).toHaveLength(1)
    expect(data.sessions[0]).toMatchObject({
      id: 'session-legacy',
      ...LEGACY_SESSION_METADATA,
      selfAssessment: 'hint'
    })
    expect(data.sessions[0]?.results).toHaveLength(1)

    const reopened = await loadAppData()
    expect(reopened.sessions[0]).toMatchObject({ id: 'session-legacy', ...LEGACY_SESSION_METADATA })
  })
})
