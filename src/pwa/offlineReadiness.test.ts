import { describe, expect, it, vi } from 'vitest'
import { verifyOfflineReadiness, type OfflineReadinessChecks } from './offlineReadiness'

function successfulChecks(): OfflineReadinessChecks {
  return {
    serviceWorkerActive: vi.fn(async () => true),
    storageWritable: vi.fn(async () => true),
    resourcesCached: vi.fn(async () => true),
    exerciseWorks: vi.fn(async () => true),
    progressWritable: vi.fn(async () => true)
  }
}

describe('Offline-Bereitschaft', () => {
  it('meldet erst bereit, wenn alle fünf Prüfungen erfolgreich sind', async () => {
    const checks = successfulChecks()
    await expect(verifyOfflineReadiness(checks)).resolves.toBe(true)
    Object.values(checks).forEach((check) => expect(check).toHaveBeenCalledOnce())
  })

  it.each([
    'serviceWorkerActive',
    'storageWritable',
    'resourcesCached',
    'exerciseWorks',
    'progressWritable'
  ] as const)('meldet bei fehlgeschlagener Prüfung %s nicht bereit', async (failedCheck) => {
    const checks = successfulChecks()
    checks[failedCheck] = vi.fn(async () => false)
    await expect(verifyOfflineReadiness(checks)).resolves.toBe(false)
  })

  it('fängt technische Fehler ohne falsche Bereitschaft ab', async () => {
    const checks = successfulChecks()
    checks.resourcesCached = vi.fn(async () => { throw new Error('Cache nicht lesbar') })
    await expect(verifyOfflineReadiness(checks)).resolves.toBe(false)
  })
})
