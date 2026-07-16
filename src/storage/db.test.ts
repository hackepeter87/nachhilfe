import { beforeEach, describe, expect, it } from 'vitest'
import { createSkillProgress } from '../domain'
import { databaseMetadata, loadAppData, saveProfile, saveSettings, saveSkillProgress, verifyStorage } from './db'

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
    expect(databaseMetadata.version).toBe(1)
  })

  it('stellt Profil, Einstellungen und Lernstand nach erneutem Öffnen wieder her', async () => {
    await saveProfile({ id: 'local-profile', nickname: 'Lina', createdAt: '2026-07-16T10:00:00.000Z' })
    await saveSettings({ key: 'app-settings', installHelpDismissed: true, schemaVersion: 1 })
    await saveSkillProgress({ ...createSkillProgress('round-tens'), attempts: 2, mastery: 47 })

    const data = await loadAppData()
    expect(data.profile?.nickname).toBe('Lina')
    expect(data.settings.installHelpDismissed).toBe(true)
    expect(data.progress['round-tens']?.mastery).toBe(47)
  })
})
