import type { AppSettings, CompletedSession, Profile, ProgressMap, SkillProgress } from '../domain'

const DB_NAME = 'mathe-reise'
const DB_VERSION = 1

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
  const sessionsRequest = transaction.objectStore(stores.sessions).getAll() as IDBRequest<CompletedSession[]>
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
    sessions: sessions.sort((first, second) => second.completedAt.localeCompare(first.completedAt))
  }
}

export async function verifyStorage(): Promise<boolean> {
  const database = await openDatabase()
  const available = Object.values(stores).every((store) => database.objectStoreNames.contains(store))
  database.close()
  return available
}

export const databaseMetadata = { name: DB_NAME, version: DB_VERSION, stores }
