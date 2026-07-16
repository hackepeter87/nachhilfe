import { TASK_CATALOG_URL } from '../content/catalog'
import { generateExercise, isAnswerCorrect } from '../domain/generators'
import { verifyProgressStorage, verifyStorage } from '../storage/db'

export const OFFLINE_CORE_RESOURCES = [
  '/index.html',
  '/manifest.webmanifest',
  TASK_CATALOG_URL,
  '/mathe-reise-island.png',
  '/icons/pwa-192.png',
  '/icons/pwa-512.png'
] as const

export interface OfflineReadinessChecks {
  serviceWorkerActive: () => Promise<boolean>
  storageWritable: () => Promise<boolean>
  resourcesCached: () => Promise<boolean>
  exerciseWorks: () => Promise<boolean>
  progressWritable: () => Promise<boolean>
}

async function serviceWorkerActive(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false
  const registration = await navigator.serviceWorker.ready
  return registration.active?.state === 'activated'
}

async function resourcesCached(): Promise<boolean> {
  if (!('caches' in window)) return false
  const resources = await Promise.all(OFFLINE_CORE_RESOURCES.map((resource) => caches.match(resource, { ignoreSearch: true })))
  return resources.every(Boolean)
}

async function exerciseWorks(): Promise<boolean> {
  const exercise = generateExercise('addition', 73_901, 1)
  return isAnswerCorrect(exercise, exercise.correctAnswer)
}

const defaultChecks: OfflineReadinessChecks = {
  serviceWorkerActive,
  storageWritable: verifyStorage,
  resourcesCached,
  exerciseWorks,
  progressWritable: verifyProgressStorage
}

export async function verifyOfflineReadiness(checks: OfflineReadinessChecks = defaultChecks): Promise<boolean> {
  try {
    return await checks.serviceWorkerActive() &&
      await checks.storageWritable() &&
      await checks.resourcesCached() &&
      await checks.exerciseWorks() &&
      await checks.progressWritable()
  } catch {
    return false
  }
}
