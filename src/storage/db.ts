import type { AppSettings, CompletedSession, Profile, ProgressMap, SkillProgress } from '../domain'

const DB_NAME = 'mathe-reise'
const DB_VERSION = 1

export const LEGACY_SESSION_METADATA = {
  catalogId: 'unknown',
  catalogVersion: 'unknown',
  schemaVersion: 0,
  appVersion: 'unknown'
} as const

const stores = {
  profile: 'profile',
  settings: 'settings',
  progress: 'progress',
  sessions: 'sessions'
} as const

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB-Anfrage fehlgeschlagen.'))
  })
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB-Transaktion fehlgeschlagen.'))
    transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB-Transaktion wurde abgebrochen.'))
  })
}

export function migrateCompletedSession(session: CompletedSession | Record<string, unknown>): CompletedSession {
  return {
    ...(session as unknown as CompletedSession),
    catalogId: typeof session.catalogId === 'string' ? session.catalogId : LEGACY_SESSION_METADATA.catalogId,
    catalogVersion: typeof session.catalogVersion === 'string' ? session.catalogVersion : LEGACY_SESSION_METADATA.catalogVersion,
    schemaVersion: typeof session.schemaVersion === 'number' ? session.schemaVersion : LEGACY_SESSION_METADATA.schemaVersion,
    appVersion: typeof session.appVersion === 'string' ? session.appVersion : LEGACY_SESSION_METADATA.appVersion
  }
}

export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(stores.profile)) database.createObjectStore(stores.profile, { keyPath: 'id' })
      if (!database.objectStoreNames.contains(stores.settings)) database.createObjectStore(stores.settings, { keyPath: 'key' })
      if (!database.objectStoreNames.contains(stores.progress)) database.createObjectStore(stores.progress, { keyPath: 'skillId' })
      if (!database.objectStoreNames.contains(stores.sessions)) database.createObjectStore(stores.sessions, { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Lokaler Speicher ist nicht verfügbar.'))
  })
}

async function put<T>(storeName: string, value: T): Promise<void> {
  const database = await openDatabase()
  const transaction = database.transaction(storeName, 'readwrite')
  transaction.objectStore(storeName).put(value)
  await transactionDone(transaction)
  database.close()
}

export async function saveProfile(profile: Profile): Promise<void> {
  await put(stores.profile, profile)
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await put(stores.settings, settings)
}

export async function saveSkillProgress(progress: SkillProgress): Promise<void> {
  await put(stores.progress, progress)
}

export async function saveCompletedSession(session: CompletedSession): Promise<void> {
  await put(stores.sessions, session)
}

export interface AppData {
  profile: Profile | null
  settings: AppSettings
  progress: ProgressMap
  sessions: CompletedSession[]
}

export async function loadAppData(): Promise<AppData> {
  const database = await openDatabase()
  const transaction = database.transaction(Object.values(stores), 'readonly')
  const profileRequest = transaction.objectStore(stores.profile).get('local-profile') as IDBRequest<Profile | undefined>
  const settingsRequest = transaction.objectStore(stores.settings).get('app-settings') as IDBRequest<AppSettings | undefined>
  const progressRequest = transaction.objectStore(stores.progress).getAll() as IDBRequest<SkillProgress[]>
  const sessionsRequest = transaction.objectStore(stores.sessions).getAll() as IDBRequest<Array<CompletedSession | Record<string, unknown>>>
  const [profile, settings, progressRows, sessions] = await Promise.all([
    requestResult(profileRequest),
    requestResult(settingsRequest),
    requestResult(progressRequest),
    requestResult(sessionsRequest),
    transactionDone(transaction)
  ])
  database.close()
  return {
    profile: profile ?? null,
    settings: settings ?? { key: 'app-settings', installHelpDismissed: false, schemaVersion: 1 },
    progress: Object.fromEntries(progressRows.map((entry) => [entry.skillId, entry])) as ProgressMap,
    sessions: sessions.map(migrateCompletedSession).sort((first, second) => second.completedAt.localeCompare(first.completedAt))
  }
}

export async function verifyStorage(): Promise<boolean> {
  const database = await openDatabase()
  const available = Object.values(stores).every((store) => database.objectStoreNames.contains(store))
  if (!available) {
    database.close()
    return false
  }
  const transaction = database.transaction(stores.settings, 'readwrite')
  const store = transaction.objectStore(stores.settings)
  const probe = { key: '__storage-readiness__', checkedAt: new Date().toISOString() }
  store.put(probe)
  const readRequest = store.get(probe.key) as IDBRequest<typeof probe | undefined>
  store.delete(probe.key)
  const readBack = await requestResult(readRequest)
  await transactionDone(transaction)
  database.close()
  return readBack?.checkedAt === probe.checkedAt
}

export async function verifyProgressStorage(): Promise<boolean> {
  const database = await openDatabase()
  const transaction = database.transaction(stores.progress, 'readwrite')
  const store = transaction.objectStore(stores.progress)
  const probe = { skillId: '__progress-readiness__', mastery: 37, checkedAt: new Date().toISOString() }
  store.put(probe)
  const readRequest = store.get(probe.skillId) as IDBRequest<typeof probe | undefined>
  store.delete(probe.skillId)
  const readBack = await requestResult(readRequest)
  await transactionDone(transaction)
  database.close()
  return readBack?.mastery === probe.mastery && readBack.checkedAt === probe.checkedAt
}

export const databaseMetadata = { name: DB_NAME, version: DB_VERSION, stores }
