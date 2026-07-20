import { useLayoutEffect, useRef, useState, type FormEvent } from 'react'
import { Check, HelpCircle, Lightbulb, Send } from 'lucide-react'
import { analyzeWrongAnswer, isAnswerCorrect, isStepAnswerCorrect } from '../domain'
import type { AttemptResult, Exercise, ExerciseStep } from '../domain'
import { GridPicture } from './GridPicture'
import { MathRepresentation } from './MathRepresentation'

interface ExerciseCardProps {
  exercise: Exercise
  onComplete: (result: AttemptResult) => void
}

type AnswerState = 'answering' | 'correct' | 'scaffold'
type MessageKind = 'error' | 'success'

function safeExerciseSteps(exercise: Exercise): ExerciseStep[] | undefined {
  const steps = exercise.steps
  const result = Number(exercise.variant.values.result)
  if (exercise.answerMode !== 'guided-word' || !steps || !Number.isFinite(result) ||
    steps.some((step) => step.interaction === 'guided-number' && step.correctAnswer === String(result))) return steps

  const calculation: ExerciseStep = {
    id: 'calculate',
    curriculumStage: 'calculate',
    prompt: 'Rechne jetzt selbst. Wie lautet das Ergebnis?',
    interaction: 'guided-number',
    correctAnswer: String(result),
    errorFeedback: 'Nutze die bekannten Zahlen aus der Geschichte und rechne noch einmal.',
    successFeedback: 'Deine Rechnung stimmt.'
  }
  const checkIndex = steps.findIndex((step) => step.id === 'check')
  return checkIndex < 0
    ? [...steps, calculation]
    : [...steps.slice(0, checkIndex), calculation, ...steps.slice(checkIndex)]
}

export function ExerciseCard({ exercise, onComplete }: ExerciseCardProps) {
  return <ExerciseCardState key={exercise.id} exercise={exercise} onComplete={onComplete} />
}

function ExerciseCardState({ exercise, onComplete }: ExerciseCardProps) {
  const panelRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [answer, setAnswer] = useState('')
  const [answerState, setAnswerState] = useState<AnswerState>('answering')
  const [checks, setChecks] = useState(0)
  const [hadError, setHadError] = useState(false)
  const [hintsShown, setHintsShown] = useState(0)
  const [message, setMessage] = useState('')
  const [messageKind, setMessageKind] = useState<MessageKind>('success')
  const [stepIndex, setStepIndex] = useState(0)
  const [completedStepAnswers, setCompletedStepAnswers] = useState<Record<string, string>>({})
  const [detectedMisconceptions, setDetectedMisconceptions] = useState<string[]>([])
  const [pairingSelections, setPairingSelections] = useState<string[]>([])
  const steps = safeExerciseSteps(exercise)

  useLayoutEffect(() => {
    panelRef.current?.scrollTo?.({ top: 0, left: 0 })
    headingRef.current?.focus({ preventScroll: true })
  }, [])

  const currentStep = steps?.[stepIndex]
  const currentInteraction = currentStep?.interaction ?? 'select'
  const visibleHintLimit = exercise.answerMode === 'guided-word' && currentStep?.id !== 'model' ? 1 : 2

  const showNextHint = () => {
    setHintsShown((current) => Math.min(visibleHintLimit, current + 1))
  }

  const registerWrongAnswer = (feedback: string, misconceptionId?: string) => {
    const nextChecks = checks + 1
    setChecks(nextChecks)
    setHadError(true)
    if (misconceptionId) setDetectedMisconceptions((current) => [...current, misconceptionId])
    setMessage(feedback)
    setMessageKind('error')
    setAnswer('')
    setPairingSelections([])
    setHintsShown((current) => Math.max(current, 1))
    if (nextChecks >= 2) setAnswerState('scaffold')
  }

  const selectedOption = (value: string) => (currentStep?.options ?? exercise.options ?? []).find((option) => option.value === value)

  const optionFeedback = (value: string, fallback: string) => {
    const option = selectedOption(value)
    const analyzed = analyzeWrongAnswer(exercise, value)
    return {
      feedback: option?.misconceptionFeedback ?? analyzed?.feedback ?? fallback,
      misconceptionId: option?.misconceptionId ?? analyzed?.id
    }
  }

  const checkRegularAnswer = (value: string) => {
    if (isAnswerCorrect(exercise, value)) {
      setChecks((current) => current + 1)
      setAnswerState('correct')
      setMessage(hadError ? `Jetzt passt es. ${exercise.successFeedback}` : exercise.successFeedback)
      setMessageKind('success')
      return
    }
    const routed = optionFeedback(value, exercise.errorFeedback)
    registerWrongAnswer(routed.feedback, routed.misconceptionId)
  }

  const checkStepAnswer = (value: string) => {
    if (!currentStep) return
    if (!isStepAnswerCorrect(currentStep, value)) {
      const routed = optionFeedback(value, currentStep.errorFeedback)
      registerWrongAnswer(routed.feedback, routed.misconceptionId)
      return
    }
    setChecks((current) => current + 1)
    setCompletedStepAnswers((current) => ({ ...current, [currentStep.id]: value }))
    setMessage(currentStep.successFeedback)
    setMessageKind('success')
    if (stepIndex === (steps?.length ?? 1) - 1) {
      setAnswerState('correct')
    } else {
      setStepIndex((current) => current + 1)
      setAnswer('')
      setPairingSelections([])
    }
  }

  const finish = () => {
    onComplete({
      exerciseId: exercise.id,
      skillId: exercise.skillId,
      subskillId: exercise.subskillId,
      variantKey: exercise.variant.key,
      correct: !hadError && answerState === 'correct',
      hintsUsed: hintsShown,
      attempts: Math.max(1, checks),
      detectedMisconceptions: [...new Set(detectedMisconceptions)],
      completedAt: new Date().toISOString()
    })
  }

  const submitNumber = (event: FormEvent) => {
    event.preventDefault()
    if (!answer.trim()) return
    if (currentStep && ['guided-number', 'guided-equation', 'place-value-input'].includes(currentInteraction)) checkStepAnswer(answer)
    else checkRegularAnswer(answer)
  }

  const continueStep = () => {
    if (!currentStep) return
    setCompletedStepAnswers((current) => ({ ...current, [currentStep.id]: currentStep.correctAnswer }))
    setMessage(currentStep.successFeedback)
    setMessageKind('success')
    if (stepIndex === (steps?.length ?? 1) - 1) setAnswerState('correct')
    else setStepIndex((current) => current + 1)
  }

  const togglePairing = (value: string) => {
    setPairingSelections((current) => current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value])
  }

  const submitPairing = () => {
    if (!currentStep || pairingSelections.length === 0) return
    checkStepAnswer([...pairingSelections].sort().join('|'))
  }

  const updatePlaceValueDigit = (index: number, value: string) => {
    const digits = answer.padStart(3, ' ').slice(-3).split('')
    digits[index] = value.replace(/[^0-9]/g, '').slice(-1) || ' '
    setAnswer(digits.join('').trimStart())
  }

  const displayedRepresentation = exercise.representation?.kind === 'column-calculation'
    ? {
        ...exercise.representation,
        valueRoles: {
          ...exercise.representation.valueRoles,
          knownValues: [...new Set([
            ...exercise.representation.valueRoles.knownValues,
            'carry', 'unbundle', 'revealedDigits', 'activeColumn'
          ])]
        },
        values: {
          ...exercise.representation.values,
          carry: completedStepAnswers.carry || (exercise.difficulty === 3 && completedStepAnswers.hundreds)
            ? exercise.representation.values.carry
            : 0,
          unbundle: exercise.representation.values.operation === '−' && (exercise.difficulty === 3 || completedStepAnswers.unbundle)
            ? exercise.representation.values.unbundle
            : 0,
          revealedDigits: [
            completedStepAnswers.hundreds === undefined ? -1 : Number(completedStepAnswers.hundreds),
            completedStepAnswers.tens === undefined ? -1 : Number(completedStepAnswers.tens),
            completedStepAnswers.ones === undefined ? -1 : Number(completedStepAnswers.ones)
          ],
          activeColumn: currentStep?.id === 'ones'
            ? 'ones'
            : currentStep?.id === 'tens'
              ? 'tens'
              : currentStep?.id === 'hundreds'
                ? 'hundreds'
                : currentStep?.id === 'carry'
                  ? 'carry'
                  : currentStep?.id === 'unbundle'
                    ? 'unbundle'
                  : 'none'
        }
      }
    : exercise.representation

  const progressivelyRevealedRepresentation = displayedRepresentation
    ? {
        ...displayedRepresentation,
        valueRoles: {
          ...displayedRepresentation.valueRoles,
          revealedValues: [
            ...displayedRepresentation.valueRoles.revealedValues,
            ...Object.keys(completedStepAnswers).filter((key) => displayedRepresentation.valueRoles.unknownValues.includes(key))
          ]
        }
      }
    : displayedRepresentation

  const presentationRepresentation = progressivelyRevealedRepresentation && answerState === 'correct'
    ? {
        ...progressivelyRevealedRepresentation,
        valueRoles: {
          ...progressivelyRevealedRepresentation.valueRoles,
          revealedValues: [...progressivelyRevealedRepresentation.valueRoles.unknownValues]
        }
      }
    : progressivelyRevealedRepresentation

  const modelStepIndex = steps?.findIndex((step) => step.id === 'model') ?? -1
  const persistentWordModel = exercise.answerMode === 'guided-word' && modelStepIndex >= 0 && stepIndex > modelStepIndex
    ? presentationRepresentation
    : undefined

  const renderOptions = () => {
    const options = currentStep?.options ?? exercise.options ?? []
    return (
      <div className={options.some((option) => option.representation) ? 'answer-options model-options' : exercise.answerMode === 'symmetry' ? 'symmetry-options' : 'answer-options'}>
        {options.map((option) => (
          <button
            className={option.representation ? 'answer-option model-option' : exercise.answerMode === 'symmetry' ? 'symmetry-option' : 'answer-option'}
            data-answer-state="idle"
            key={option.value}
            type="button"
            onClick={() => currentStep ? checkStepAnswer(option.value) : checkRegularAnswer(option.value)}
          >
            {option.grid ? <GridPicture grid={option.grid} label={option.label} axis={exercise.symmetry?.axis} axisPosition={exercise.symmetry?.axisPosition} /> : option.representation ? <><span>{option.label}</span><MathRepresentation representation={option.representation} /></> : option.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <section className="exercise-panel" aria-labelledby="exercise-title" data-exercise-id={exercise.id} data-skill-id={exercise.skillId} ref={panelRef}>
      <div className="exercise-heading">
        <span className="eyebrow">{exercise.title}</span>
        <h2 id="exercise-title" ref={headingRef} tabIndex={-1}>{exercise.prompt}</h2>
      </div>

      {exercise.answerMode !== 'guided-word' && presentationRepresentation && (
        presentationRepresentation.visibility === 'always' ||
        (presentationRepresentation.visibility === 'hint' && hintsShown > 0) ||
        checks > 0 ||
        answerState === 'scaffold'
      ) && (
        <MathRepresentation representation={presentationRepresentation} />
      )}

      {(exercise.answerMode === 'guided-word' || exercise.answerMode === 'guided-choice' || exercise.answerMode === 'guided-number') && currentStep && answerState === 'answering' && (
        <div className="guided-step" data-curriculum-stage={currentStep.curriculumStage}>
          <div className="step-dots" aria-label={`Schritt ${stepIndex + 1} von ${steps?.length}`}>
            {steps?.map((step, index) => <span className={index <= stepIndex ? 'step-dot step-dot--active' : 'step-dot'} key={step.id} />)}
          </div>
          <h3>{stepIndex + 1}. {currentStep.prompt}</h3>
          {(currentStep.representation ?? persistentWordModel) && <MathRepresentation representation={(currentStep.representation ?? persistentWordModel)!} />}
          {['select', 'mark', 'match', 'order', 'complete-model', 'identify-error', 'choose-strategy'].includes(currentInteraction) && renderOptions()}
          {currentInteraction === 'build-pairing' && (
            <div className="pairing-builder">
              <div className="pairing-options" aria-label="Mögliche Paarungen">
                {(currentStep.options ?? []).map((option) => (
                  <button
                    aria-pressed={pairingSelections.includes(option.value)}
                    className="pairing-option"
                    key={option.id ?? option.value}
                    type="button"
                    onClick={() => togglePairing(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p>{pairingSelections.length} Paarungen ausgewählt</p>
              <button className="primary-button" type="button" disabled={pairingSelections.length === 0} onClick={submitPairing}>Paarungen prüfen</button>
            </div>
          )}
          {currentInteraction === 'continue' && <button className="primary-button" type="button" onClick={continueStep}>{currentStep.continueLabel ?? 'Weiter'}</button>}
          {currentInteraction === 'guided-number' && (
            <form className="number-answer" onSubmit={submitNumber}>
              <label htmlFor="guided-number-answer">Dein Ergebnis</label>
              <div className="number-row">
                <input id="guided-number-answer" inputMode="numeric" pattern="[0-9]*" autoComplete="off" value={answer} onChange={(event) => setAnswer(event.target.value.replace(/[^0-9]/g, '').slice(0, 4))} />
                <button className="icon-button icon-button--primary" type="submit" aria-label="Ergebnis prüfen" title="Ergebnis prüfen"><Send aria-hidden="true" /></button>
              </div>
            </form>
          )}
          {currentInteraction === 'place-value-input' && (
            <form className="place-value-answer" onSubmit={submitNumber}>
              <fieldset>
                <legend>Trage die Ziffern an der richtigen Stelle ein</legend>
                <div className="place-value-inputs">
                  {['Hunderter', 'Zehner', 'Einer'].map((label, index) => (
                    <label key={label}>
                      <span>{label[0]}</span>
                      <input
                        aria-label={label}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="off"
                        value={answer.padStart(3, ' ').slice(-3)[index]?.trim() ?? ''}
                        onChange={(event) => updatePlaceValueDigit(index, event.target.value)}
                      />
                    </label>
                  ))}
                </div>
              </fieldset>
              <button className="primary-button" type="submit" disabled={!answer.trim()}>Stellen prüfen</button>
            </form>
          )}
          {currentInteraction === 'guided-equation' && (
            <form className="number-answer" onSubmit={submitNumber}>
              <label htmlFor="guided-equation-answer">Deine Rechnung</label>
              <div className="number-row">
                <input id="guided-equation-answer" inputMode="text" autoComplete="off" value={answer} onChange={(event) => setAnswer(event.target.value.replace(/[^0-9+\-−·:*/= ?]/g, '').slice(0, 28))} />
                <button className="icon-button icon-button--primary" type="submit" aria-label="Rechnung prüfen" title="Rechnung prüfen"><Send aria-hidden="true" /></button>
              </div>
            </form>
          )}
        </div>
      )}

      {exercise.answerMode === 'symmetry' && answerState === 'answering' && (
        <div className="symmetry-task">
          <div className="source-grid">
            <span>Vorlage</span>
            {exercise.sourceGrid && <GridPicture grid={exercise.sourceGrid} label="Vorlage zum Spiegeln" axis={exercise.symmetry?.axis} axisPosition={exercise.symmetry?.axisPosition} />}
            {exercise.symmetry && <small className="axis-legend">{exercise.symmetry.axisLegend}</small>}
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
          <button className="text-button" type="button" onClick={showNextHint} disabled={hintsShown >= visibleHintLimit}>
            <HelpCircle aria-hidden="true" />
            {hintsShown === 0
              ? 'Ich brauche einen Tipp'
              : hintsShown < visibleHintLimit
                ? 'Noch ein Tipp'
                : visibleHintLimit === 1
                  ? 'Tipp'
                  : 'Beide Tipps geöffnet'}
          </button>
          {hintsShown > 0 && (
            <div className="hint" aria-live="polite">
              <Lightbulb aria-hidden="true" />
              <div>
                {exercise.hints.slice(0, Math.min(hintsShown, visibleHintLimit)).map((hint) => <p key={hint.level}>{hint.text}</p>)}
              </div>
            </div>
          )}
        </div>
      )}

      {message && answerState === 'answering' && <p className={`feedback ${messageKind === 'error' ? 'feedback--try' : 'feedback--step-success'}`} role="status">{message}</p>}

      {answerState === 'scaffold' && (
        <div className="scaffold" role="status">
          <Lightbulb aria-hidden="true" />
          <div>
            <h3>Wir lösen es gemeinsam.</h3>
            {exercise.answerMode === 'guided-word' && presentationRepresentation && <MathRepresentation representation={presentationRepresentation} />}
            {exercise.answerMode === 'symmetry' && exercise.sourceGrid && (
              <GridPicture
                grid={exercise.sourceGrid}
                label="Vorlage zum gemeinsamen Spiegeln"
                axis={exercise.symmetry?.axis}
                axisPosition={exercise.symmetry?.axisPosition}
              />
            )}
            <p>{exercise.remediation.strategy}</p>
            <p>{exercise.explanation}</p>
            <button className="primary-button" type="button" onClick={finish}>
              {exercise.remediation.helpLevel === 5 ? 'Mit einer Grundlagenaufgabe weiter' : 'Mit einer leichteren Aufgabe weiter'}
            </button>
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
