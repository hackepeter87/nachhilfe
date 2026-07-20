import { useMemo, useState } from 'react'
import { ClipboardList, RefreshCw } from 'lucide-react'
import { ExerciseCard } from '../components/ExerciseCard'
import {
  SKILL_IDS,
  createReviewExercise,
  getSkillLabel,
  reviewScenarioKey,
  type AttemptResult,
  type Difficulty,
  type LearningPhase,
  type ReviewScenario,
  type SkillId
} from '../domain'
import { isSkillEnabled } from '../content/catalog'

const PHASES: Array<{ value: LearningPhase; label: string }> = [
  { value: 'activate', label: 'Aktivieren' },
  { value: 'understand', label: 'Verstehen' },
  { value: 'guided-practice', label: 'Geführt üben' },
  { value: 'independent-practice', label: 'Selbstständig üben' },
  { value: 'automate', label: 'Automatisieren' },
  { value: 'transfer', label: 'Übertragen' }
]

const REVIEW_CRITERIA = [
  'Der Arbeitsauftrag ist sofort verständlich.',
  'Die Aufgabe verlangt eine sinnvolle mathematische Handlung.',
  'Die Darstellung zeigt alles Bekannte und verrät nichts Gesuchtes.',
  'Antwortform und Arbeitsauftrag passen zusammen.',
  'Die Hilfe bezieht sich auf sichtbare Informationen.',
  'Das Fehlerfeedback passt zum konkreten Fehler.',
  'Die Remediation ist leichter, verwandt und nicht identisch.',
  'Text und Bedienelemente passen auf einen kleinen Bildschirm.',
  'Die Aufgabe liegt fachlich auf dem vorgesehenen Klasse-3-Niveau.'
] as const

function initialScenario(): ReviewScenario {
  return { skillId: 'addition', phase: 'activate', difficulty: 1, seed: 1 }
}

export default function ReviewWorkbench() {
  const [scenario, setScenario] = useState<ReviewScenario>(initialScenario)
  const [revision, setRevision] = useState(0)
  const [result, setResult] = useState<AttemptResult | null>(null)
  const [checks, setChecks] = useState<Record<number, boolean>>({})
  const [expected, setExpected] = useState('')
  const [actual, setActual] = useState('')
  const [severity, setSeverity] = useState('hoch')
  const [report, setReport] = useState('')
  const activeSkills = useMemo(() => SKILL_IDS.filter(isSkillEnabled), [])
  const exercise = useMemo(() => createReviewExercise(scenario), [scenario])
  const scenarioId = reviewScenarioKey(scenario)

  const replaceScenario = (next: ReviewScenario) => {
    setScenario(next)
    setResult(null)
    setChecks({})
    setReport('')
  }

  const restart = () => {
    setRevision((current) => current + 1)
    setResult(null)
  }

  const createReport = () => {
    const failedCriteria = REVIEW_CRITERIA.filter((_, index) => !checks[index])
    setReport([
      '## Didaktischer Befund',
      `- Kompetenz: \`${scenario.skillId}\` (${getSkillLabel(scenario.skillId)})`,
      `- Seed: \`${scenario.seed}\``,
      `- Lernphase: \`${scenario.phase}\``,
      `- Schwierigkeit: \`${scenario.difficulty}\``,
      `- Variante: \`${exercise.variant.key}\``,
      `- Typ: \`${exercise.typeId}\``,
      `- Pfad: \`${scenario.errorPath ?? 'base'}\``,
      `- Priorität: **${severity}**`,
      '',
      '### Erwartetes Verhalten',
      expected.trim() || 'Noch nicht beschrieben.',
      '',
      '### Tatsächliches Verhalten',
      actual.trim() || 'Noch nicht beschrieben.',
      '',
      '### Nicht erfüllte Prüfkriterien',
      ...(failedCriteria.length > 0 ? failedCriteria.map((criterion) => `- [ ] ${criterion}`) : ['- Keine; Befund betrifft einen anderen Aspekt.'])
    ].join('\n'))
  }

  return (
    <main className="review-workbench">
      <header className="review-header">
        <div>
          <span className="eyebrow">Nur Entwicklung</span>
          <h1>Didaktischer Prüfstand</h1>
          <p>Diese Ansicht verwendet dieselben Generatoren und dieselbe Aufgabenkomponente wie die Kinder-App.</p>
        </div>
        <ClipboardList aria-hidden="true" />
      </header>

      <section className="review-controls" aria-label="Prüfszenario">
        <label>Kompetenz
          <select value={scenario.skillId} onChange={(event) => replaceScenario({ ...scenario, skillId: event.target.value as SkillId })}>
            {activeSkills.map((skillId) => <option key={skillId} value={skillId}>{getSkillLabel(skillId)} ({skillId})</option>)}
          </select>
        </label>
        <label>Lernphase
          <select value={scenario.phase} onChange={(event) => replaceScenario({ ...scenario, phase: event.target.value as LearningPhase })}>
            {PHASES.map((phase) => <option key={phase.value} value={phase.value}>{phase.label}</option>)}
          </select>
        </label>
        <label>Schwierigkeit
          <select value={scenario.difficulty} onChange={(event) => replaceScenario({ ...scenario, difficulty: Number(event.target.value) as Difficulty })}>
            {[1, 2, 3].map((difficulty) => <option key={difficulty} value={difficulty}>Stufe {difficulty}</option>)}
          </select>
        </label>
        <label>Seed
          <input type="number" min="1" step="1" value={scenario.seed} onChange={(event) => replaceScenario({ ...scenario, seed: Math.max(1, Number(event.target.value) || 1) })} />
        </label>
        <label>Aufgabenpfad
          <select value={scenario.errorPath ?? 'base'} onChange={(event) => replaceScenario({ ...scenario, errorPath: event.target.value === 'remediation' ? 'remediation' : undefined })}>
            <option value="base">Ausgangsaufgabe</option>
            <option value="remediation">Leichtere Folgeaufgabe</option>
          </select>
        </label>
        <button type="button" className="primary-button" onClick={restart}><RefreshCw aria-hidden="true" />Aufgabe neu starten</button>
      </section>

      <aside className="review-metadata" aria-label="Technische Aufgabendaten">
        <span>Seed <strong>{scenario.seed}</strong></span>
        <span>Variante <strong>{exercise.variant.key}</strong></span>
        <span>Typ <strong>{exercise.typeId}</strong></span>
        <span>Phase <strong>{exercise.learningPhase}</strong></span>
        <span>Darstellung <strong>{exercise.representation?.kind ?? 'keine'}</strong></span>
        <span>Fehlroute <strong>{result?.detectedMisconceptions?.join(', ') || 'noch keine'}</strong></span>
        <details><summary>Technische Lösung anzeigen</summary><code>{exercise.correctAnswer}</code></details>
      </aside>

      <div className="review-exercise" data-review-scenario={scenarioId}>
        <ExerciseCard key={`${scenarioId}:${revision}`} exercise={exercise} onComplete={setResult} />
      </div>

      <section className="review-checklist" aria-labelledby="review-checklist-title">
        <h2 id="review-checklist-title">Prüfliste für diese Variante</h2>
        {REVIEW_CRITERIA.map((criterion, index) => (
          <label key={criterion}>
            <input type="checkbox" checked={Boolean(checks[index])} onChange={(event) => setChecks((current) => ({ ...current, [index]: event.target.checked }))} />
            <span>{criterion}</span>
          </label>
        ))}
        <div className="review-finding-fields">
          <label>Priorität<select value={severity} onChange={(event) => setSeverity(event.target.value)}><option>kritisch</option><option>hoch</option><option>mittel</option><option>gering</option></select></label>
          <label>Erwartetes Verhalten<textarea value={expected} onChange={(event) => setExpected(event.target.value)} /></label>
          <label>Tatsächliches Verhalten<textarea value={actual} onChange={(event) => setActual(event.target.value)} /></label>
        </div>
        <button className="primary-button" type="button" onClick={createReport}>Befundvorlage erzeugen</button>
        {report && <textarea className="review-report" aria-label="Befund als Markdown" readOnly value={report} />}
      </section>
    </main>
  )
}
