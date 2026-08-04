import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Check, CircleHelp, Compass, Download, House, Info, Menu, RefreshCw, RotateCcw, ShieldCheck, Sparkles, Trash2, Wifi, WifiOff, X } from 'lucide-react'
import { registerSW } from 'virtual:pwa-register'
import {
  createRemediationExercise,
  createSessionPlan,
  getSkillLabel,
  updateSkillProgress,
  type AppSettings,
  type AttemptResult,
  type CompletedSession,
  type Profile,
  type ProgressMap,
  type SessionPlan
} from './domain'
import { ExerciseCard } from './components/ExerciseCard'
import { clearAppData, loadAppData, saveCompletedSession, saveProfile, saveSettings, saveSkillProgress } from './storage/db'
import { verifyOfflineReadiness } from './pwa/offlineReadiness'
import { getActiveCatalogMetadata, type CatalogMetadata } from './content/catalog'
import { APP_VERSION } from './version'

type Screen = 'loading' | 'onboarding' | 'home' | 'session' | 'summary' | 'error'
type NavigationAction = 'home' | 'new-round' | 'reset'

const DEFAULT_SETTINGS: AppSettings = { key: 'app-settings', installHelpDismissed: false, schemaVersion: 1 }

const ReviewWorkbench = import.meta.env.DEV ? lazy(() => import('./review/ReviewWorkbench')) : null

function isStandalone(): boolean {
  const iosNavigator = navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || iosNavigator.standalone === true
}

function InstallHelp({ onDismiss }: { onDismiss: () => void }) {
  return (
    <main className="page install-page">
      <div className="brand-lockup">
        <img src="/mathe-reise-island.png" alt="Eine grüne Mathe-Insel mit Zahlen und Kompass" />
        <div>
          <span className="eyebrow">Willkommen bei</span>
          <h1>Mathe-Reise</h1>
        </div>
      </div>
      <section className="install-guide" aria-labelledby="install-title">
        <Download aria-hidden="true" />
        <div>
          <h2 id="install-title">Auf dem iPhone installieren</h2>
          <ol>
            <li>Tippe in Safari auf „Teilen“.</li>
            <li>Wähle „Zum Home-Bildschirm“.</li>
            <li>Bestätige mit „Hinzufügen“.</li>
          </ol>
          <p>Danach funktioniert die Mathe-Reise auch ohne Internet.</p>
        </div>
      </section>
      <button className="primary-button primary-button--wide" type="button" onClick={onDismiss}>Weiter zur Mathe-Reise</button>
      <button className="quiet-button" type="button" onClick={onDismiss}>Jetzt überspringen</button>
    </main>
  )
}

function Onboarding({ onComplete }: { onComplete: (nickname: string) => void }) {
  const [nickname, setNickname] = useState('')
  return (
    <main className="page onboarding-page">
      <div className="brand-lockup brand-lockup--stacked">
        <img src="/mathe-reise-island.png" alt="Eine grüne Mathe-Insel mit Zahlen und Kompass" />
        <h1>Wie möchtest du hier heißen?</h1>
        <p>Ein Spitzname reicht. Du kannst das Feld auch leer lassen.</p>
      </div>
      <form onSubmit={(event) => { event.preventDefault(); onComplete(nickname.trim()) }} className="nickname-form">
        <label htmlFor="nickname">Dein Spitzname</label>
        <input
          id="nickname"
          maxLength={20}
          autoComplete="off"
          placeholder="Zum Beispiel: Mathe-Star"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
        />
        <span className="character-count">{nickname.length}/20</span>
        <button className="primary-button primary-button--wide" type="submit">Los geht’s</button>
      </form>
    </main>
  )
}

interface NavigationMenuProps {
  open: boolean
  canGoHome: boolean
  completedRound: boolean
  onClose: () => void
  onGoHome: () => void
  onNewRound: () => void
  onReset: () => void
}

function NavigationMenu({ open, canGoHome, completedRound, onClose, onGoHome, onNewRound, onReset }: NavigationMenuProps) {
  useEffect(() => {
    if (!open) return undefined
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="dialog-backdrop" onMouseDown={onClose}>
      <section className="navigation-dialog" role="dialog" aria-modal="true" aria-labelledby="navigation-title" onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <div>
            <span className="eyebrow">Navigation</span>
            <h2 id="navigation-title">Wohin möchtest du?</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Navigation schließen" title="Schließen" autoFocus>
            <X aria-hidden="true" />
          </button>
        </header>
        <div className="navigation-actions">
          {canGoHome && (
            <button type="button" onClick={onGoHome}>
              <House aria-hidden="true" />
              <span><strong>Zur Startseite</strong><small>{completedRound ? 'Zur Übersicht deiner Reise' : 'Die aktuelle Runde verlassen'}</small></span>
            </button>
          )}
          <button type="button" onClick={onNewRound}>
            <RotateCcw aria-hidden="true" />
            <span><strong>Neue Runde beginnen</strong><small>Mit neuen Aufgaben bei 1 starten</small></span>
          </button>
          <button className="navigation-action--danger" type="button" onClick={onReset}>
            <Trash2 aria-hidden="true" />
            <span><strong>App zurücksetzen</strong><small>Spitzname und Lernstand auf diesem Gerät löschen</small></span>
          </button>
        </div>
      </section>
    </div>
  )
}

interface ConfirmNavigationProps {
  action: NavigationAction | null
  busy: boolean
  error: string
  onCancel: () => void
  onConfirm: () => void
}

function ConfirmNavigation({ action, busy, error, onCancel, onConfirm }: ConfirmNavigationProps) {
  useEffect(() => {
    if (!action || busy) return undefined
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [action, busy, onCancel])

  if (!action) return null
  const content = {
    home: {
      title: 'Zur Startseite?',
      description: 'Die aktuelle Runde wird beendet. Dein bisheriger Lernstand bleibt gespeichert.',
      confirmLabel: 'Zur Startseite'
    },
    'new-round': {
      title: 'Neue Runde beginnen?',
      description: 'Die aktuelle Runde wird beendet. Die neue Runde startet wieder bei Aufgabe 1.',
      confirmLabel: 'Neue Runde starten'
    },
    reset: {
      title: 'App wirklich zurücksetzen?',
      description: 'Spitzname, Lernstand und abgeschlossene Runden werden auf diesem Gerät gelöscht. Die App bleibt installiert.',
      confirmLabel: 'Alles zurücksetzen'
    }
  }[action]

  return (
    <div className="dialog-backdrop" onMouseDown={busy ? undefined : onCancel}>
      <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-navigation-title" aria-describedby="confirm-navigation-description" onMouseDown={(event) => event.stopPropagation()}>
        <h2 id="confirm-navigation-title">{content.title}</h2>
        <p id="confirm-navigation-description">{content.description}</p>
        {error && <p className="dialog-error" role="alert">{error}</p>}
        <div className="confirm-dialog__actions">
          <button className="quiet-action" type="button" onClick={onCancel} disabled={busy} autoFocus>Abbrechen</button>
          <button className={action === 'reset' ? 'danger-action' : 'primary-button'} type="button" onClick={onConfirm} disabled={busy}>
            {busy ? 'Wird zurückgesetzt …' : content.confirmLabel}
          </button>
        </div>
      </section>
    </div>
  )
}

interface HomeProps {
  profile: Profile
  progress: ProgressMap
  sessions: CompletedSession[]
  offlineReady: boolean
  online: boolean
  catalogMetadata: CatalogMetadata
  updateAvailable: boolean
  onStart: () => void
  onShowInstall: () => void
  onUpdate: () => void
  onOpenMenu: () => void
}

function Home({ profile, progress, sessions, offlineReady, online, catalogMetadata, updateAvailable, onStart, onShowInstall, onUpdate, onOpenMenu }: HomeProps) {
  const practiced = Object.values(progress).filter(Boolean)
  const secure = practiced.filter((entry) => entry?.status === 'secure').length
  const mostImproved = [...practiced].sort((a, b) => (b?.mastery ?? 0) - (a?.mastery ?? 0))[0]
  return (
    <main className="home-page">
      {updateAvailable && (
        <div className="update-banner" role="status">
          <RefreshCw aria-hidden="true" />
          <span>Eine neue Version ist bereit.</span>
          <button type="button" onClick={onUpdate}>Jetzt aktualisieren</button>
        </div>
      )}
      <header className="home-header">
        <div>
          <span className="eyebrow">Mathe-Reise</span>
          <h1>Hallo{profile.nickname ? `, ${profile.nickname}` : ''}!</h1>
          <p>Heute wartet eine neue Etappe auf dich.</p>
        </div>
        <div className="home-header__side">
          <button className="icon-button" type="button" onClick={onOpenMenu} aria-label="Navigation öffnen" title="Navigation">
            <Menu aria-hidden="true" />
          </button>
          <img src="/mathe-reise-island.png" alt="Die Mathe-Insel" />
        </div>
      </header>

      <section className="journey-band" aria-labelledby="journey-title">
        <div className="journey-copy">
          <Compass aria-hidden="true" />
          <div>
            <h2 id="journey-title">Deine nächste Etappe</h2>
            <p>Sieben abwechslungsreiche Aufgaben. Ohne Uhr und ohne Stress.</p>
          </div>
        </div>
        <button className="primary-button primary-button--wide" type="button" onClick={onStart}>
          <Sparkles aria-hidden="true" />
          Mathe-Runde starten
        </button>
      </section>

      <section className="progress-band" aria-labelledby="progress-title">
        <h2 id="progress-title">Dein Weg</h2>
        <div className="progress-stats">
          <div><strong>{sessions.length}</strong><span>Runden geschafft</span></div>
          <div><strong>{practiced.length}</strong><span>Bereiche geübt</span></div>
          <div><strong>{secure}</strong><span>Bereiche sicher</span></div>
        </div>
        <p className="progress-note">
          {mostImproved ? `Am sichersten fühlst du dich gerade bei „${getSkillLabel(mostImproved.skillId)}“.` : 'Nach deiner ersten Runde siehst du hier deinen Fortschritt.'}
        </p>
      </section>

      <footer className="home-footer">
        <div className={offlineReady ? 'status-pill status-pill--ready' : 'status-pill'}>
          {online ? <Wifi aria-hidden="true" /> : <WifiOff aria-hidden="true" />}
          {offlineReady ? 'Offline bereit' : 'Offline wird vorbereitet'}
        </div>
        <button className="icon-button" type="button" onClick={onShowInstall} aria-label="Installationshilfe öffnen" title="Installationshilfe">
          <CircleHelp aria-hidden="true" />
        </button>
        <details className="version-details">
          <summary className="icon-button" aria-label="Versionsinformationen öffnen" title="Versionsinformationen">
            <Info aria-hidden="true" />
          </summary>
          <dl>
            <div><dt>App</dt><dd>{APP_VERSION}</dd></div>
            <div><dt>Katalog</dt><dd>{catalogMetadata.catalogId} {catalogMetadata.catalogVersion}</dd></div>
            <div><dt>Schema</dt><dd>{catalogMetadata.schemaVersion}</dd></div>
            <div><dt>Status</dt><dd>{catalogMetadata.status}</dd></div>
          </dl>
        </details>
      </footer>
    </main>
  )
}

interface SummaryProps {
  results: AttemptResult[]
  onNewRound: () => void
  onGoHome: () => void
  onOpenMenu: () => void
}

function Summary({ results, onNewRound, onGoHome, onOpenMenu }: SummaryProps) {
  const firstTry = results.filter((result) => result.correct).length
  return (
    <main className="page summary-page">
      <header className="summary-navigation">
        <button className="brand-button" type="button" onClick={onGoHome} aria-label="Zur Startseite">
          <ArrowLeft aria-hidden="true" />
          <span>Mathe-Reise</span>
        </button>
        <button className="icon-button" type="button" onClick={onOpenMenu} aria-label="Navigation öffnen" title="Navigation">
          <Menu aria-hidden="true" />
        </button>
      </header>
      <div className="summary-mark"><Check aria-hidden="true" /></div>
      <span className="eyebrow">Etappe geschafft</span>
      <h1>Das war eine gute Runde!</h1>
      <p>Du hast {results.length} Aufgaben bearbeitet. {firstTry} davon klappten direkt beim ersten Versuch.</p>
      <div className="summary-actions">
        <button className="primary-button primary-button--wide" type="button" onClick={onNewRound}>
          <RotateCcw aria-hidden="true" />
          Neue Runde beginnen
        </button>
        <button className="quiet-button" type="button" onClick={onGoHome}>
          <House aria-hidden="true" />
          Zur Startseite
        </button>
      </div>
    </main>
  )
}

function LearningApp() {
  const [screen, setScreen] = useState<Screen>('loading')
  const [profile, setProfileState] = useState<Profile | null>(null)
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [progress, setProgress] = useState<ProgressMap>({})
  const [sessions, setSessions] = useState<CompletedSession[]>([])
  const [session, setSession] = useState<SessionPlan | null>(null)
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [results, setResults] = useState<AttemptResult[]>([])
  const [repeatCount, setRepeatCount] = useState(0)
  const [showInstallHelp, setShowInstallHelp] = useState(false)
  const [offlineReady, setOfflineReady] = useState(false)
  const [online, setOnline] = useState(navigator.onLine)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<NavigationAction | null>(null)
  const [resetting, setResetting] = useState(false)
  const [navigationError, setNavigationError] = useState('')
  const updateServiceWorker = useRef<((reloadPage?: boolean) => Promise<void>) | null>(null)
  const catalogMetadata = useMemo(() => getActiveCatalogMetadata(), [])

  useEffect(() => {
    loadAppData()
      .then((data) => {
        setProfileState(data.profile)
        setSettingsState(data.settings)
        setProgress(data.progress)
        setSessions(data.sessions)
        if (!isStandalone() && !data.settings.installHelpDismissed) setShowInstallHelp(true)
        setScreen(data.profile ? 'home' : 'onboarding')
      })
      .catch(() => setScreen('error'))
  }, [])

  useEffect(() => {
    let readinessRun = 0
    const updateOfflineReadiness = async () => {
      const currentRun = ++readinessRun
      for (const delay of [0, 250, 750, 1500]) {
        if (delay > 0) await new Promise((resolve) => window.setTimeout(resolve, delay))
        if (currentRun !== readinessRun) return
        const ready = await verifyOfflineReadiness()
        if (currentRun !== readinessRun) return
        setOfflineReady(ready)
        if (ready) return
      }
    }
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh: () => setUpdateAvailable(true),
      onOfflineReady: () => { void updateOfflineReadiness() },
      onRegisteredSW: () => { void updateOfflineReadiness() }
    })
    updateServiceWorker.current = updateSW
    navigator.serviceWorker?.ready.then(() => updateOfflineReadiness()).catch(() => setOfflineReady(false))
    return () => { readinessRun += 1 }
  }, [])

  useEffect(() => {
    const updateOnline = () => setOnline(navigator.onLine)
    window.addEventListener('online', updateOnline)
    window.addEventListener('offline', updateOnline)
    return () => {
      window.removeEventListener('online', updateOnline)
      window.removeEventListener('offline', updateOnline)
    }
  }, [])

  const currentExercise = useMemo(() => session?.exercises[exerciseIndex] ?? null, [session, exerciseIndex])

  useEffect(() => {
    if (screen === 'session') window.scrollTo({ top: 0, left: 0 })
  }, [screen, exerciseIndex])

  const dismissInstallHelp = async () => {
    const next = { ...settings, installHelpDismissed: true } as AppSettings
    setSettingsState(next)
    setShowInstallHelp(false)
    await saveSettings(next)
  }

  const completeOnboarding = async (nickname: string) => {
    const nextProfile: Profile = { id: 'local-profile', nickname, createdAt: new Date().toISOString() }
    await saveProfile(nextProfile)
    setProfileState(nextProfile)
    setScreen('home')
  }

  const startRound = () => {
    setSession(createSessionPlan(progress, undefined, { completedSessionCount: sessions.length }))
    setResults([])
    setExerciseIndex(0)
    setRepeatCount(0)
    setScreen('session')
  }

  const requestNavigation = (action: NavigationAction) => {
    setMenuOpen(false)
    setNavigationError('')
    if (action === 'new-round' && (screen === 'home' || screen === 'summary')) {
      startRound()
      return
    }
    if (action === 'home' && screen === 'summary') {
      setScreen('home')
      return
    }
    setPendingNavigation(action)
  }

  const cancelNavigation = () => {
    if (resetting) return
    setPendingNavigation(null)
    setNavigationError('')
  }

  const discardCurrentRound = () => {
    setSession(null)
    setResults([])
    setExerciseIndex(0)
    setRepeatCount(0)
  }

  const confirmNavigation = async () => {
    if (pendingNavigation === 'home') {
      discardCurrentRound()
      setPendingNavigation(null)
      setScreen('home')
      return
    }
    if (pendingNavigation === 'new-round') {
      setPendingNavigation(null)
      startRound()
      return
    }
    if (pendingNavigation !== 'reset') return

    setResetting(true)
    setNavigationError('')
    try {
      await clearAppData()
      setProfileState(null)
      setSettingsState(DEFAULT_SETTINGS)
      setProgress({})
      setSessions([])
      discardCurrentRound()
      setShowInstallHelp(false)
      setPendingNavigation(null)
      setScreen('onboarding')
    } catch {
      setNavigationError('Das Zurücksetzen hat nicht geklappt. Deine gespeicherten Daten wurden nicht absichtlich verändert.')
    } finally {
      setResetting(false)
    }
  }

  const completeExercise = async (result: AttemptResult) => {
    if (!session || !currentExercise) return
    const nextProgress = updateSkillProgress(progress[result.skillId], result)
    const nextProgressMap = { ...progress, [result.skillId]: nextProgress }
    setProgress(nextProgressMap)

    let nextExercises = session.exercises
    if (!result.correct && repeatCount < 3 && session.exercises.length < 10) {
      const repetition = createRemediationExercise(currentExercise, session.seed + session.exercises.length * 211)
      nextExercises = [
        ...session.exercises.slice(0, exerciseIndex + 1),
        repetition,
        ...session.exercises.slice(exerciseIndex + 1)
      ]
      setSession({ ...session, exercises: nextExercises })
      setRepeatCount((current) => current + 1)
    }

    const nextResults = [...results, result]
    setResults(nextResults)
    if (exerciseIndex + 1 >= nextExercises.length) {
      const completed: CompletedSession = {
        id: session.id,
        catalogId: session.catalogId,
        catalogVersion: session.catalogVersion,
        schemaVersion: session.schemaVersion,
        appVersion: session.appVersion,
        startedAt: session.startedAt,
        completedAt: new Date().toISOString(),
        results: nextResults,
        selfAssessment: 'not-asked'
      }
      await Promise.all([
        saveSkillProgress(nextProgress),
        saveCompletedSession(completed)
      ])
      setSessions((current) => [completed, ...current])
      setSession(null)
      setScreen('summary')
    } else {
      setExerciseIndex((current) => current + 1)
      await saveSkillProgress(nextProgress)
    }
  }

  const navigationOverlays = (
    <>
      <NavigationMenu
        open={menuOpen}
        canGoHome={screen !== 'home'}
        completedRound={screen === 'summary'}
        onClose={() => setMenuOpen(false)}
        onGoHome={() => requestNavigation('home')}
        onNewRound={() => requestNavigation('new-round')}
        onReset={() => requestNavigation('reset')}
      />
      <ConfirmNavigation
        action={pendingNavigation}
        busy={resetting}
        error={navigationError}
        onCancel={cancelNavigation}
        onConfirm={() => { void confirmNavigation() }}
      />
    </>
  )

  if (screen === 'loading') return <main className="page loading-page"><Compass className="loading-compass" aria-hidden="true" /><p>Die Mathe-Reise wird vorbereitet …</p></main>
  if (screen === 'error') return <main className="page error-page"><ShieldCheck aria-hidden="true" /><h1>Das hat gerade nicht geklappt.</h1><p>Bitte lade die App neu. Deine bisherigen Aufgaben bleiben gespeichert.</p></main>
  if (showInstallHelp) return <InstallHelp onDismiss={dismissInstallHelp} />
  if (screen === 'onboarding') return <Onboarding onComplete={completeOnboarding} />
  if (screen === 'home' && profile) return (
    <>
      <Home
        profile={profile}
        progress={progress}
        sessions={sessions}
        offlineReady={offlineReady}
        online={online}
        catalogMetadata={catalogMetadata}
        updateAvailable={updateAvailable}
        onStart={startRound}
        onShowInstall={() => setShowInstallHelp(true)}
        onUpdate={() => { void updateServiceWorker.current?.(true) }}
        onOpenMenu={() => setMenuOpen(true)}
      />
      {navigationOverlays}
    </>
  )
  if (screen === 'summary') return (
    <>
      <Summary
        results={results}
        onNewRound={startRound}
        onGoHome={() => setScreen('home')}
        onOpenMenu={() => setMenuOpen(true)}
      />
      {navigationOverlays}
    </>
  )

  return (
    <main className="session-page">
      <header className="session-header">
        <button className="brand-button" type="button" onClick={() => requestNavigation('home')} aria-label="Runde verlassen und zur Startseite">
          <ArrowLeft aria-hidden="true" />
          <span>Mathe-Reise</span>
        </button>
        <div className="session-header__actions">
          <span className="task-count">{exerciseIndex + 1} / {session?.exercises.length ?? 8}</span>
          <button className="icon-button" type="button" onClick={() => setMenuOpen(true)} aria-label="Navigation öffnen" title="Navigation">
            <Menu aria-hidden="true" />
          </button>
        </div>
      </header>
      <div className="session-progress" aria-hidden="true"><span style={{ width: `${((exerciseIndex + 1) / (session?.exercises.length ?? 8)) * 100}%` }} /></div>
      {currentExercise && <ExerciseCard key={currentExercise.id} exercise={currentExercise} onComplete={completeExercise} />}
      {navigationOverlays}
    </main>
  )
}

export default function App() {
  const reviewRequested = import.meta.env.DEV && new URLSearchParams(window.location.search).get('review') === '1'
  if (reviewRequested && ReviewWorkbench) {
    return <Suspense fallback={<main className="page loading-page"><p>Prüfstand wird geladen ...</p></main>}><ReviewWorkbench /></Suspense>
  }
  return <LearningApp />
}
