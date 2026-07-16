import { useState, type FormEvent } from 'react'
import { Check, HelpCircle, Lightbulb, Send } from 'lucide-react'
import { isAnswerCorrect, isStepAnswerCorrect } from '../domain'
import type { AttemptResult, Exercise } from '../domain'
import { GridPicture } from './GridPicture'

interface ExerciseCardProps {
  exercise: Exercise
  onComplete: (result: AttemptResult) => void
}

type AnswerState = 'answering' | 'correct' | 'scaffold'

export function ExerciseCard({ exercise, onComplete }: ExerciseCardProps) {
  const [answer, setAnswer] = useState('')
  const [answerState, setAnswerState] = useState<AnswerState>('answering')
  const [checks, setChecks] = useState(0)
  const [hadError, setHadError] = useState(false)
  const [hintsShown, setHintsShown] = useState(0)
  const [message, setMessage] = useState('')
  const [stepIndex, setStepIndex] = useState(0)

  const currentStep = exercise.steps?.[stepIndex]

  const showNextHint = () => {
    setHintsShown((current) => Math.min(2, current + 1))
  }

  const registerWrongAnswer = (feedback: string) => {
    const nextChecks = checks + 1
    setChecks(nextChecks)
    setHadError(true)
    setMessage(feedback)
    setAnswer('')
    if (nextChecks >= 2) setAnswerState('scaffold')
  }

  const checkRegularAnswer = (value: string) => {
    setChecks((current) => current + 1)
    if (isAnswerCorrect(exercise, value)) {
      setAnswerState('correct')
      setMessage(hadError ? 'Jetzt passt es. Du bist drangeblieben!' : 'Richtig erkannt!')
      return
    }
    registerWrongAnswer(exercise.errorFeedback)
  }

  const checkStepAnswer = (value: string) => {
    if (!currentStep) return
    setChecks((current) => current + 1)
    if (!isStepAnswerCorrect(currentStep, value)) {
      registerWrongAnswer(currentStep.errorFeedback)
      return
    }
    setMessage(currentStep.successFeedback)
    if (stepIndex === (exercise.steps?.length ?? 1) - 1) {
      setAnswerState('correct')
    } else {
      setStepIndex((current) => current + 1)
      setAnswer('')
    }
  }

  const finish = () => {
    onComplete({
      exerciseId: exercise.id,
      skillId: exercise.skillId,
      variantKey: exercise.variant.key,
      correct: !hadError && answerState === 'correct',
      hintsUsed: hintsShown,
      attempts: Math.max(1, checks),
      completedAt: new Date().toISOString()
    })
  }

  const submitNumber = (event: FormEvent) => {
    event.preventDefault()
    if (answer.trim()) checkRegularAnswer(answer)
  }

  const renderOptions = () => {
    const options = currentStep?.options ?? exercise.options ?? []
    return (
      <div className={exercise.answerMode === 'symmetry' ? 'symmetry-options' : 'answer-options'}>
        {options.map((option) => (
          <button
            className={exercise.answerMode === 'symmetry' ? 'symmetry-option' : 'answer-option'}
            key={option.value}
            type="button"
            onClick={() => currentStep ? checkStepAnswer(option.value) : checkRegularAnswer(option.value)}
          >
            {option.grid ? <GridPicture grid={option.grid} label={option.label} /> : option.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <section className="exercise-panel" aria-labelledby="exercise-title">
      <div className="exercise-heading">
        <span className="eyebrow">{exercise.title}</span>
        <h2 id="exercise-title">{exercise.prompt}</h2>
      </div>

      {exercise.answerMode === 'guided-word' && currentStep && answerState === 'answering' && (
        <div className="guided-step">
          <div className="step-dots" aria-label={`Schritt ${stepIndex + 1} von ${exercise.steps?.length}`}>
            {exercise.steps?.map((step, index) => <span className={index <= stepIndex ? 'step-dot step-dot--active' : 'step-dot'} key={step.id} />)}
          </div>
          <h3>{stepIndex + 1}. {currentStep.prompt}</h3>
          {renderOptions()}
        </div>
      )}

      {exercise.answerMode === 'symmetry' && answerState === 'answering' && (
        <div className="symmetry-task">
          <div className="source-grid">
            <span>Vorlage</span>
            {exercise.sourceGrid && <GridPicture grid={exercise.sourceGrid} label="Vorlage zum Spiegeln" />}
          </div>
          {renderOptions()}
        </div>
      )}

      {exercise.answerMode === 'choice' && answerState === 'answering' && renderOptions()}

      {exercise.answerMode === 'number' && answerState === 'answering' && (
        <form className="number-answer" onSubmit={submitNumber}>
          <label htmlFor="number-answer">Deine Antwort</label>
          <div className="number-row">
            <input
              id="number-answer"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              value={answer}
              onChange={(event) => setAnswer(event.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
            />
            <button className="icon-button icon-button--primary" type="submit" aria-label="Antwort prüfen" title="Antwort prüfen">
              <Send aria-hidden="true" />
            </button>
          </div>
        </form>
      )}

      {answerState === 'answering' && (
        <div className="help-area">
          <button className="text-button" type="button" onClick={showNextHint} disabled={hintsShown >= 2}>
            <HelpCircle aria-hidden="true" />
            {hintsShown === 0 ? 'Ich brauche einen Tipp' : hintsShown === 1 ? 'Noch ein Tipp' : 'Beide Tipps geöffnet'}
          </button>
          {hintsShown > 0 && (
            <div className="hint" aria-live="polite">
              <Lightbulb aria-hidden="true" />
              <div>
                {exercise.hints.slice(0, hintsShown).map((hint) => <p key={hint.level}>{hint.text}</p>)}
              </div>
            </div>
          )}
        </div>
      )}

      {message && answerState === 'answering' && <p className="feedback feedback--try" role="status">{message}</p>}

      {answerState === 'scaffold' && (
        <div className="scaffold" role="status">
          <Lightbulb aria-hidden="true" />
          <div>
            <h3>Wir lösen es gemeinsam.</h3>
            <p>{exercise.explanation}</p>
            <button className="primary-button" type="button" onClick={finish}>Mit Hilfe weiter</button>
          </div>
        </div>
      )}

      {answerState === 'correct' && (
        <div className="feedback feedback--success" role="status">
          <Check aria-hidden="true" />
          <div>
            <strong>{message}</strong>
            <p>{exercise.explanation}</p>
            <button className="primary-button" type="button" onClick={finish}>Weiter</button>
          </div>
        </div>
      )}
    </section>
  )
}
