import { useEffect, useMemo, useRef, useState } from 'react'
import { BookOpen, Check, CircleHelp, Compass, Download, RefreshCw, ShieldCheck, Sparkles, Wifi, WifiOff } from 'lucide-react'
import { registerSW } from 'virtual:pwa-register'
import {
  createRepetitionExercise,
  createSessionPlan,
  SKILL_LABELS,
  updateSkillProgress,
  type AppSettings,
  type AttemptResult,
  type CompletedSession,
  type Profile,
  type ProgressMap,
  type SelfAssessment,
  type SessionPlan
} from './domain'
import { ExerciseCard } from './components/ExerciseCard'
import { loadAppData, saveCompletedSession, saveProfile, saveSettings, saveSkillProgress, verifyStorage } from './storage/db'

type Screen = 'loading' | 'onboarding' | 'home' | 'session' | 'summary' | 'error'

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

interface HomeProps {
  profile: Profile
  progress: ProgressMap
  sessions: CompletedSession[]
  offlineReady: boolean
  online: boolean
  onStart: () => void
  onShowInstall: () => void
}

function Home({ profile, progress, sessions, offlineReady, online, onStart, onShowInstall }: HomeProps) {
  const practiced = Object.values(progress).filter(Boolean)
  const secure = practiced.filter((entry) => entry?.status === 'secure').length
  const mostImproved = [...practiced].sort((a, b) => (b?.mastery ?? 0) - (a?.mastery ?? 0))[0]
  return (
    <main className="home-page">
      <header className="home-header">
        <div>
          <span className="eyebrow">Mathe-Reise</span>
          <h1>Hallo{profile.nickname ? `, ${profile.nickname}` : ''}!</h1>
          <p>Heute wartet eine neue Etappe auf dich.</p>
        </div>
        <img src="/mathe-reise-island.png" alt="Die Mathe-Insel" />
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
          {mostImproved ? `Am sichersten fühlst du dich gerade bei „${SKILL_LABELS[mostImproved.skillId]}“.` : 'Nach deiner ersten Runde siehst du hier deinen Fortschritt.'}
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
      </footer>
    </main>
  )
}

function Summary({ results, onFinish }: { results: AttemptResult[]; onFinish: (assessment: SelfAssessment) => void }) {
  const firstTry = results.filter((result) => result.correct).length
  return (
    <main className="page summary-page">
      <div className="summary-mark"><Check aria-hidden="true" /></div>
      <span className="eyebrow">Etappe geschafft</span>
      <h1>Das war eine gute Runde!</h1>
      <p>Du hast {results.length} Aufgaben bearbeitet. {firstTry} davon klappten direkt beim ersten Versuch.</p>
      <section className="self-check" aria-labelledby="self-check-title">
        <h2 id="self-check-title">Was hat dir heute geholfen?</h2>
        <div className="assessment-options">
          <button type="button" onClick={() => onFinish('material')}><BookOpen aria-hidden="true" />Die Bilder</button>
          <button type="button" onClick={() => onFinish('hint')}><CircleHelp aria-hidden="true" />Ein Tipp</button>
          <button type="button" onClick={() => onFinish('thinking')}><Sparkles aria-hidden="true" />Mein Denken</button>
        </div>
      </section>
    </main>
  )
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('loading')
  const [profile, setProfileState] = useState<Profile | null>(null)
  const [settings, setSettingsState] = useState<AppSettings>({ key: 'app-settings', installHelpDismissed: false, schemaVersion: 1 })
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
  const updateServiceWorker = useRef<((reloadPage?: boolean) => Promise<void>) | null>(null)

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
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh: () => setUpdateAvailable(true),
      onOfflineReady: () => setOfflineReady(true),
      onRegisteredSW: () => {
        verifyStorage().then((ready) => setOfflineReady(ready)).catch(() => setOfflineReady(false))
      }
    })
    updateServiceWorker.current = updateSW
    navigator.serviceWorker?.ready.then(() => verifyStorage()).then((ready) => setOfflineReady(ready)).catch(() => undefined)
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
    setSession(createSessionPlan(progress))
    setResults([])
    setExerciseIndex(0)
    setRepeatCount(0)
    setScreen('session')
  }

  const completeExercise = async (result: AttemptResult) => {
    if (!session || !currentExercise) return
    const nextProgress = updateSkillProgress(progress[result.skillId], result)
    const nextProgressMap = { ...progress, [result.skillId]: nextProgress }
    setProgress(nextProgressMap)

    let nextExercises = session.exercises
    if (!result.correct && repeatCount < 3 && session.exercises.length < 10) {
      const repetition = createRepetitionExercise(result.skillId, session.seed + session.exercises.length * 211, currentExercise.difficulty, result.variantKey)
      nextExercises = [...session.exercises, repetition]
      setSession({ ...session, exercises: nextExercises })
      setRepeatCount((current) => current + 1)
    }

    setResults((current) => [...current, result])
    if (exerciseIndex + 1 >= nextExercises.length) {
      setScreen('summary')
    } else {
      setExerciseIndex((current) => current + 1)
    }
    await saveSkillProgress(nextProgress)
  }

  const finishRound = async (selfAssessment: SelfAssessment) => {
    if (!session) return
    const completed: CompletedSession = {
      id: session.id,
      startedAt: session.startedAt,
      completedAt: new Date().toISOString(),
      results,
      selfAssessment
    }
    await saveCompletedSession(completed)
    setSessions((current) => [completed, ...current])
    setSession(null)
    setScreen('home')
  }

  if (screen === 'loading') return <main className="page loading-page"><Compass className="loading-compass" aria-hidden="true" /><p>Die Mathe-Reise wird vorbereitet …</p></main>
  if (screen === 'error') return <main className="page error-page"><ShieldCheck aria-hidden="true" /><h1>Das hat gerade nicht geklappt.</h1><p>Bitte lade die App neu. Deine bisherigen Aufgaben bleiben gespeichert.</p></main>
  if (showInstallHelp) return <InstallHelp onDismiss={dismissInstallHelp} />
  if (screen === 'onboarding') return <Onboarding onComplete={completeOnboarding} />
  if (screen === 'home' && profile) return <Home profile={profile} progress={progress} sessions={sessions} offlineReady={offlineReady} online={online} onStart={startRound} onShowInstall={() => setShowInstallHelp(true)} />
  if (screen === 'summary') return <Summary results={results} onFinish={finishRound} />

  return (
    <main className="session-page">
      {updateAvailable && (
        <div className="update-banner" role="status">
          <RefreshCw aria-hidden="true" />
          <span>Eine neue Version ist bereit.</span>
          <button type="button" onClick={() => updateServiceWorker.current?.(true)}>Jetzt aktualisieren</button>
        </div>
      )}
      <header className="session-header">
        <button className="brand-button" type="button" onClick={() => setScreen('home')} aria-label="Runde verlassen und zur Startseite">
          <Compass aria-hidden="true" />
          <span>Mathe-Reise</span>
        </button>
        <span className="task-count">{exerciseIndex + 1} / {session?.exercises.length ?? 7}</span>
      </header>
      <div className="session-progress" aria-hidden="true"><span style={{ width: `${((exerciseIndex + 1) / (session?.exercises.length ?? 7)) * 100}%` }} /></div>
      {currentExercise && <ExerciseCard key={currentExercise.id} exercise={currentExercise} onComplete={completeExercise} />}
    </main>
  )
}
