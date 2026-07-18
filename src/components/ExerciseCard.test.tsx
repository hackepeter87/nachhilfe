import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { generateExercise } from '../domain'
import { ExerciseCard } from './ExerciseCard'

describe('ExerciseCard', () => {
  it('routet eine erkannte Fehlvorstellung in spezifisches Feedback und das Versuchsergebnis', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    const exercise = generateExercise('addition', 72, 2)
    const wrongOperation = String(Math.abs(Number(exercise.variant.values.first) - Number(exercise.variant.values.second)))
    render(<ExerciseCard exercise={exercise} onComplete={onComplete} />)

    await user.type(screen.getByLabelText('Deine Antwort'), wrongOperation)
    await user.click(screen.getByRole('button', { name: 'Antwort prüfen' }))
    expect(screen.getByText(/Hier kommt die zweite Menge dazu/)).toBeVisible()
    expect(screen.getByRole('img', { name: /Zerlegt bis 10/ })).toBeVisible()

    await user.type(screen.getByLabelText('Deine Antwort'), exercise.correctAnswer)
    await user.click(screen.getByRole('button', { name: 'Antwort prüfen' }))
    await user.click(screen.getByRole('button', { name: 'Weiter' }))
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ detectedMisconceptions: ['addition-operation-reversal'] }))
  })

  it('baut Kombinationspaare aktiv auf, bevor die Anzahl abgefragt wird', async () => {
    const user = userEvent.setup()
    const exercise = generateExercise('combinatorics', 37, 1, undefined, 'guided-practice')
    render(<ExerciseCard exercise={exercise} onComplete={vi.fn()} />)
    const pairing = exercise.steps?.[0]
    if (!pairing?.options) throw new Error('Paarungsschritt fehlt')

    for (const option of pairing.options) await user.click(screen.getByRole('button', { name: option.label }))
    expect(screen.getByText(`${pairing.options.length} Paarungen ausgewählt`)).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Paarungen prüfen' }))
    expect(screen.getByText(/Wie viele verschiedene Paarungen/)).toBeVisible()
  })

  it('deckt Nachbargrenzen nacheinander auf', async () => {
    const user = userEvent.setup()
    const exercise = generateExercise('neighbor-tens', 55, 1, undefined, 'understand')
    const { container } = render(<ExerciseCard exercise={exercise} onComplete={vi.fn()} />)
    const [lower, upper] = exercise.steps ?? []
    if (!lower || !upper) throw new Error('Nachbarschritte fehlen')

    expect(container.querySelectorAll('.number-line-tick small')).toHaveLength(0)
    await user.click(screen.getByRole('button', { name: lower.correctAnswer }))
    expect([...container.querySelectorAll('.number-line-tick small')].map((node) => node.textContent)).toEqual([lower.correctAnswer])
    expect(screen.getByRole('heading', { name: new RegExp(upper.prompt.replace(/[?]/g, '\\?')) })).toBeVisible()
  })

  it('setzt Auswahl, Hilfe und Feedback beim Aufgabenwechsel vollständig zurück', async () => {
    const user = userEvent.setup()
    const first = generateExercise('addition', 31, 2)
    const second = generateExercise('subtraction', 32, 2)
    const { rerender } = render(<ExerciseCard exercise={first} onComplete={vi.fn()} />)
    await user.type(screen.getByLabelText('Deine Antwort'), '99')
    await user.click(screen.getByRole('button', { name: 'Antwort prüfen' }))
    expect(screen.getByRole('img', { name: /Zerlegt bis 10/ })).toBeVisible()

    rerender(<ExerciseCard exercise={second} onComplete={vi.fn()} />)
    expect(screen.getByLabelText('Deine Antwort')).toHaveValue('')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByRole('img', { name: /Zerlegt bis 10/ })).not.toBeInTheDocument()
  })
  it('lässt eine Körperansicht auswählen und gibt richtungsbezogenes Feedback', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    const exercise = generateExercise('body-views', 42, 2)
    render(<ExerciseCard exercise={exercise} onComplete={onComplete} />)
    expect(screen.getByRole('img', { name: /Würfel.*Vorne und rechts sind markiert/i })).toBeVisible()
    expect(screen.getAllByRole('img', { name: /Ansicht [ABC]/ })).toHaveLength(3)
    await user.click(screen.getByRole('button', { name: new RegExp(exercise.options?.find((option) => option.value === exercise.correctAnswer)?.label ?? '') }))
    expect(screen.getByText(exercise.successFeedback)).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Weiter' }))
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ skillId: 'body-views', correct: true }))
  })

  it('lässt eine Würfeldrehung aus drei neutralen Folgezuständen auswählen', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    const exercise = generateExercise('cube-rotation', 42, 2, 'cube-rotation-left')
    const { container } = render(<ExerciseCard exercise={exercise} onComplete={onComplete} />)

    expect(screen.getByRole('img', { name: /90 Grad nach links.*senkrechte Achse/i })).toBeVisible()
    expect(screen.getAllByRole('img', { name: /Gebäude [ABC].*nach der Drehung/i })).toHaveLength(3)
    expect(container.querySelectorAll('.answer-option[data-answer-state="idle"]')).toHaveLength(3)
    const correct = exercise.options?.find((option) => option.value === exercise.correctAnswer)
    if (!correct) throw new Error('Die Rotationsaufgabe enthält keine richtige Antwortoption.')
    await user.click(screen.getByRole('button', { name: new RegExp(correct.label) }))
    expect(screen.getByText(exercise.successFeedback)).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Weiter' }))
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ skillId: 'cube-rotation', subskillId: 'cube-rotation-left', correct: true }))
  })

  it('gibt bei unveränderter Lage rotationsbezogene Hilfe statt allgemeinem Feedback', async () => {
    const user = userEvent.setup()
    const exercise = generateExercise('cube-rotation', 43, 3)
    render(<ExerciseCard exercise={exercise} onComplete={vi.fn()} />)
    const unchanged = exercise.options?.find((option) => option.misconception === 'not-rotated')
    if (!unchanged) throw new Error('Die Rotationsaufgabe enthält keinen Unverändert-Distraktor.')

    await user.click(screen.getByRole('button', { name: new RegExp(unchanged.label) }))
    expect(screen.getByText(unchanged.misconceptionFeedback!)).toHaveTextContent(/Lageänderung.*auffällige Ecke/i)
    await user.click(screen.getByRole('button', { name: /Tipp/i }))
    expect(screen.getByText(exercise.hints[0].text)).toHaveTextContent(/auffällige Ecke/i)
  })

  it('zeigt bei Symmetrie die katalogisierte Spiegelachse eindeutig an', () => {
    const exercise = generateExercise('symmetry', 42, 1, 'symmetry-phase-1')
    render(<ExerciseCard exercise={exercise} onComplete={vi.fn()} />)

    expect(screen.getByText('Die grüne Linie ist die Spiegelachse.')).toBeVisible()
    expect(screen.getByRole('img', { name: /Vorlage zum Spiegeln.*Senkrechte Spiegelachse zwischen Feldern/ })).toBeVisible()
    expect(screen.getAllByRole('img', { name: /Spiegelachse zwischen Feldern/ })).toHaveLength(4)
  })

  it('zeigt Hilfen und konkretes Fehlerfeedback', async () => {
    const user = userEvent.setup()
    const exercise = generateExercise('addition', 42)
    render(<ExerciseCard exercise={exercise} onComplete={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /tipp/i }))
    expect(screen.getByText(exercise.hints[0].text)).toBeVisible()

    const input = screen.getByLabelText('Deine Antwort')
    await user.type(input, '99')
    fireEvent.submit(input.closest('form')!)
    expect(screen.getByText(exercise.errorFeedback)).toBeVisible()
  })

  it('führt nach zwei Fehlern mit einer Erklärung weiter', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    const exercise = generateExercise('subtraction', 99)
    render(<ExerciseCard exercise={exercise} onComplete={onComplete} />)

    const input = screen.getByLabelText('Deine Antwort')
    for (let index = 0; index < 2; index += 1) {
      await user.type(input, '99')
      fireEvent.submit(input.closest('form')!)
    }
    expect(screen.getByText('Wir lösen es gemeinsam.')).toBeVisible()
    await user.click(screen.getByRole('button', { name: /Mit einer (Grundlagenaufgabe|leichteren Aufgabe) weiter/ }))
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ correct: false }))
  })

  it('meldet eine richtige Antwort als erfolgreich', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    const exercise = generateExercise('multiplication', 120)
    render(<ExerciseCard exercise={exercise} onComplete={onComplete} />)
    await user.type(screen.getByLabelText('Deine Antwort'), exercise.correctAnswer)
    await user.click(screen.getByRole('button', { name: 'Antwort prüfen' }))
    await user.click(screen.getByRole('button', { name: 'Weiter' }))
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ correct: true }))
  })

  it('führt die multiplikative Aufgabenfamilie als zwei Transferhandlungen aus', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    const exercise = generateExercise('multiplication', 120, 3, 'times-7', 'transfer')
    render(<ExerciseCard exercise={exercise} onComplete={onComplete} />)
    const [commutative, inverse] = exercise.steps ?? []
    if (!commutative || !inverse) throw new Error('Transferhandlungen fehlen')

    await user.click(screen.getByRole('button', { name: commutative.correctAnswer }))
    expect(screen.getByRole('heading', { name: new RegExp(inverse.prompt) })).toBeVisible()
    await user.click(screen.getByRole('button', { name: inverse.correctAnswer }))
    await user.click(screen.getByRole('button', { name: 'Weiter' }))
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ correct: true, subskillId: 'times-7' }))
  })

  it('trennt beim geführten Dividieren Arbeitsplan und Ergebnis', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    const exercise = generateExercise('division', 125, 1, 'division-grouping-by-5', 'guided-practice')
    render(<ExerciseCard exercise={exercise} onComplete={onComplete} />)
    const [relationship, result] = exercise.steps ?? []
    if (!relationship || !result) throw new Error('Divisionsschritte fehlen')

    expect(screen.getByRole('img', { name: /vollständig in gleich große Gruppen/ })).toBeVisible()
    await user.click(screen.getByRole('button', { name: relationship.correctAnswer }))
    expect(screen.getByLabelText('Dein Ergebnis')).toHaveValue('')
    await user.type(screen.getByLabelText('Dein Ergebnis'), result.correctAnswer)
    await user.click(screen.getByRole('button', { name: 'Ergebnis prüfen' }))
    await user.click(screen.getByRole('button', { name: 'Weiter' }))
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ correct: true, subskillId: 'division-grouping-by-5' }))
  })

  it('reagiert bei Multiplikation auf das Addieren der Faktoren mit passender Hilfe', async () => {
    const user = userEvent.setup()
    const exercise = generateExercise('multiplication', 128, 2, 'times-4', 'independent-practice')
    render(<ExerciseCard exercise={exercise} onComplete={vi.fn()} />)
    const addedFactors = String(Number(exercise.variant.values.first) + Number(exercise.variant.values.second))

    await user.type(screen.getByLabelText('Deine Antwort'), addedFactors)
    await user.click(screen.getByRole('button', { name: 'Antwort prüfen' }))
    expect(screen.getByText(/Faktoren addiert/)).toBeVisible()
  })

  it('deckt eine unbekannte Darstellungsgröße erst nach richtiger Lösung auf', async () => {
    const user = userEvent.setup()
    const exercise = generateExercise('addition', 42, 1)
    const { container } = render(<ExerciseCard exercise={exercise} onComplete={vi.fn()} />)
    const endLabel = () => container.querySelector('.number-line-labels span:last-child')

    expect(endLabel()).toHaveTextContent('?')
    expect(endLabel()).not.toHaveTextContent(exercise.correctAnswer)
    await user.type(screen.getByLabelText('Deine Antwort'), exercise.correctAnswer)
    await user.click(screen.getByRole('button', { name: 'Antwort prüfen' }))
    expect(endLabel()).toHaveTextContent(exercise.correctAnswer)
  })

  it('führt eine mehrschrittige Strategieaufgabe vollständig aus', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    const exercise = generateExercise('round-tens', 88, 3)
    render(<ExerciseCard exercise={exercise} onComplete={onComplete} />)
    for (const step of exercise.steps ?? []) {
      await user.click(screen.getByRole('button', { name: step.correctAnswer }))
    }
    await user.click(screen.getByRole('button', { name: 'Weiter' }))
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ correct: true }))
  })

  it('führt die Rundungsentscheidung von Nachbarn über Abstände zum Ergebnis', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    const exercise = generateExercise('round-hundreds', 95, 1, undefined, 'guided-practice')
    render(<ExerciseCard exercise={exercise} onComplete={onComplete} />)
    expect(exercise.steps?.map((step) => step.id)).toEqual(['neighbors', 'compare-distances', 'round-result'])
    for (const step of exercise.steps?.slice(0, 2) ?? []) {
      const option = step.options?.find((candidate) => candidate.value === step.correctAnswer)
      if (!option) throw new Error(`Richtige Option für ${step.id} fehlt`)
      await user.click(screen.getByRole('button', { name: option.label }))
    }
    const resultStep = exercise.steps?.[2]
    if (!resultStep) throw new Error('Rundungsergebnis fehlt')
    await user.type(screen.getByLabelText('Dein Ergebnis'), resultStep.correctAnswer)
    await user.click(screen.getByRole('button', { name: 'Ergebnis prüfen' }))
    await user.click(screen.getByRole('button', { name: 'Weiter' }))
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ skillId: 'round-hundreds', correct: true }))
  })

  it('blendet eine Hilfe-Darstellung erst mit dem Tipp ein', async () => {
    const user = userEvent.setup()
    const exercise = generateExercise('place-value', 42, 2)
    render(<ExerciseCard exercise={exercise} onComplete={vi.fn()} />)
    expect(screen.queryByRole('img', { name: 'Stellenwerttafel' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /tipp/i }))
    expect(screen.getByRole('img', { name: 'Stellenwerttafel' })).toBeVisible()
  })

  it('zeigt eine reine Remediation-Darstellung weder initial noch nach einem Tipp', async () => {
    const user = userEvent.setup()
    const exercise = generateExercise('addition', 42, 3)
    render(<ExerciseCard exercise={exercise} onComplete={vi.fn()} />)
    expect(exercise.representation?.visibility).toBe('scaffold')
    expect(screen.queryByRole('img', { name: /Zerlegt bis 10/ })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /tipp/i }))
    expect(screen.queryByRole('img', { name: /Zerlegt bis 10/ })).not.toBeInTheDocument()

    for (let attempt = 0; attempt < 2; attempt += 1) {
      await user.type(screen.getByLabelText('Deine Antwort'), '99')
      await user.click(screen.getByRole('button', { name: 'Antwort prüfen' }))
    }
    expect(screen.getByRole('img', { name: /Zerlegt bis 10/ })).toBeVisible()
  })

  it('zeigt einen modellbezogenen Sachaufgabentipp nur beim sichtbaren Modellschritt', async () => {
    const user = userEvent.setup()
    const exercise = generateExercise('word-problem', 42, 1)
    render(<ExerciseCard exercise={exercise} onComplete={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Ich brauche einen Tipp' }))
    expect(screen.getByText(exercise.hints[0].text)).toBeVisible()
    expect(screen.queryByText(exercise.hints[1].text)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tipp geöffnet' })).toBeDisabled()
  })

  it('zeigt mathematische Teilsprünge erst mit der Zahlenstrahl-Hilfe', async () => {
    const user = userEvent.setup()
    const exercise = generateExercise('addition-1000', 42, 2)
    render(<ExerciseCard exercise={exercise} onComplete={vi.fn()} />)
    expect(screen.queryByRole('img', { name: 'Rechenstrich mit Zwischenziel' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /tipp/i }))
    const representation = screen.getByRole('img', { name: /Rechenstrich mit Zwischenziel/ })
    expect(representation).toBeVisible()
    const jumps = exercise.representation?.values.jumps
    expect(Array.isArray(jumps)).toBe(true)
    if (!Array.isArray(jumps)) throw new Error('Sprünge fehlen')
    expect(screen.getAllByLabelText('Rechenschritt unbekannt zu einem unbekannten Wert')).toHaveLength(jumps.length)
  })

  it('startet phasenspezifische Rechenstrategien bis 1000 ohne vorausgewählte Antwort', () => {
    for (const skillId of ['addition-1000', 'subtraction-1000', 'complement-1000'] as const) {
      const exercise = generateExercise(skillId, 73, 1, undefined, 'activate')
      const { unmount } = render(<ExerciseCard exercise={exercise} onComplete={vi.fn()} />)
      expect(screen.getByRole('img')).toBeVisible()
      for (const option of exercise.options ?? []) {
        expect(screen.getByRole('button', { name: option.label })).toHaveAttribute('data-answer-state', 'idle')
      }
      unmount()
    }
  })

  it('prüft Zwischenstation und Ergebnis bei einem Stellenübergang', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    const exercise = generateExercise('subtraction-1000', 42, 3)
    render(<ExerciseCard exercise={exercise} onComplete={onComplete} />)
    expect(exercise.steps?.map((step) => step.id)).toEqual(['bridge', 'result'])
    for (const step of exercise.steps ?? []) {
      const option = step.options?.find((candidate) => candidate.value === step.correctAnswer)
      if (!option) throw new Error(`Richtige Option für ${step.id} fehlt`)
      await user.click(screen.getByRole('button', { name: option.label }))
    }
    await user.click(screen.getByRole('button', { name: 'Weiter' }))
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ correct: true }))
  })

  it('führt die schriftliche Addition spaltenweise aus und gibt spaltenspezifisches Feedback', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    const exercise = generateExercise('written-addition', 42, 2)
    render(<ExerciseCard exercise={exercise} onComplete={onComplete} />)

    expect(screen.getByRole('img', { name: /schriftliche Addition/i })).toBeVisible()
    const firstStep = exercise.steps?.[0]
    if (!firstStep) throw new Error('Einerschritt fehlt')
    await user.type(screen.getByLabelText('Dein Ergebnis'), firstStep.correctAnswer === '9' ? '8' : '9')
    await user.click(screen.getByRole('button', { name: 'Ergebnis prüfen' }))
    expect(screen.getByText(firstStep.errorFeedback)).toBeVisible()

    for (const step of exercise.steps ?? []) {
      await user.type(screen.getByLabelText('Dein Ergebnis'), step.correctAnswer)
      await user.click(screen.getByRole('button', { name: 'Ergebnis prüfen' }))
    }
    await user.click(screen.getByRole('button', { name: 'Weiter' }))
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ skillId: 'written-addition', correct: false }))
  })

  it('trägt bei 618 + 226 Ergebnis und Übertrag von rechts nach links ein', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    const exercise = structuredClone(generateExercise('written-addition', 42, 2))
    exercise.prompt = 'Rechne 618 + 226 schriftlich.'
    exercise.correctAnswer = '844'
    exercise.variant.values = { ...exercise.variant.values, first: 618, second: 226, answer: 844 }
    exercise.representation = {
      ...exercise.representation!,
      values: { first: 618, second: 226, operation: '+', carry: 1, carryColumn: 'tens' }
    }
    const answers: Record<string, string> = { ones: '4', carry: '1', tens: '4', hundreds: '8' }
    exercise.steps = exercise.steps?.map((step) => ({ ...step, correctAnswer: answers[step.id]! }))
    const { container } = render(<ExerciseCard exercise={exercise} onComplete={onComplete} />)
    const result = () => container.querySelector('.column-row--result')?.textContent
    const carry = () => container.querySelector('.column-row--carry')?.textContent?.trim()

    expect(result()).toBe('???')
    expect(carry()).toBe('')
    await user.type(screen.getByLabelText('Dein Ergebnis'), '4')
    await user.click(screen.getByRole('button', { name: 'Ergebnis prüfen' }))
    expect(result()).toBe('??4')
    expect(carry()).toBe('')
    await user.type(screen.getByLabelText('Dein Ergebnis'), '1')
    await user.click(screen.getByRole('button', { name: 'Ergebnis prüfen' }))
    expect(result()).toBe('??4')
    expect(carry()).toBe('1')
    await user.type(screen.getByLabelText('Dein Ergebnis'), '4')
    await user.click(screen.getByRole('button', { name: 'Ergebnis prüfen' }))
    expect(result()).toBe('?44')
    await user.type(screen.getByLabelText('Dein Ergebnis'), '8')
    await user.click(screen.getByRole('button', { name: 'Ergebnis prüfen' }))
    expect(result()).toBe('844')
    await user.click(screen.getByRole('button', { name: 'Weiter' }))
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ correct: true }))
  })

  it('entbündelt bei der schriftlichen Subtraktion sichtbar und rechnet von rechts nach links', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    const exercise = generateExercise('written-subtraction', 42, 2)
    const { container } = render(<ExerciseCard exercise={exercise} onComplete={onComplete} />)
    const adjustment = () => container.querySelector('.column-row--carry')?.textContent?.trim()
    const result = () => container.querySelector('.column-row--result')?.textContent

    expect(screen.getByRole('img', { name: /schriftliche Subtraktion/i })).toBeVisible()
    expect(exercise.steps?.map((step) => step.id)).toEqual(['unbundle', 'ones', 'tens', 'hundreds'])
    expect(adjustment()).toBe('')
    expect(result()).toBe('???')

    for (const [index, step] of (exercise.steps ?? []).entries()) {
      await user.type(screen.getByLabelText('Dein Ergebnis'), step.correctAnswer)
      await user.click(screen.getByRole('button', { name: 'Ergebnis prüfen' }))
      if (index === 0) expect(adjustment()).not.toBe('')
      if (step.id === 'ones') expect(result()).toMatch(/^\?\?\d$/)
      if (step.id === 'tens') expect(result()).toMatch(/^\?\d\d$/)
    }
    expect(result()).toBe(exercise.correctAnswer)
    await user.click(screen.getByRole('button', { name: 'Weiter' }))
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ skillId: 'written-subtraction', correct: true }))
  })

  it('startet schriftliche Verfahren mit einer neutralen stellengerechten Anordnung', async () => {
    const user = userEvent.setup()
    const exercise = generateExercise('written-addition', 71, 1, undefined, 'activate')
    const { container } = render(<ExerciseCard exercise={exercise} onComplete={vi.fn()} />)
    const rows = container.querySelectorAll('.column-equation .column-row')

    expect(rows[1]).toHaveTextContent('???')
    expect(container.querySelector('.column-row--result')).toHaveTextContent('???')
    expect(screen.queryByText(exercise.correctAnswer)).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('Dein Ergebnis'), exercise.correctAnswer)
    await user.click(screen.getByRole('button', { name: 'Ergebnis prüfen' }))
    expect(rows[1]).toHaveTextContent(exercise.correctAnswer)
  })

  it('zeigt bei einer falschen Entbündelung eine konkrete Tauschhilfe', async () => {
    const user = userEvent.setup()
    const exercise = generateExercise('written-subtraction', 42, 2)
    const { container } = render(<ExerciseCard exercise={exercise} onComplete={vi.fn()} />)
    const unbundleStep = exercise.steps?.find((step) => step.id === 'unbundle')
    if (!unbundleStep) throw new Error('Entbündelungsschritt fehlt')

    await user.type(screen.getByLabelText('Dein Ergebnis'), '2')
    await user.click(screen.getByRole('button', { name: 'Ergebnis prüfen' }))
    expect(screen.getByText(unbundleStep.errorFeedback)).toBeVisible()
    expect(container.querySelector('.column-row--carry')).toHaveTextContent('')

    await user.type(screen.getByLabelText('Dein Ergebnis'), '1')
    await user.click(screen.getByRole('button', { name: 'Ergebnis prüfen' }))
    expect(container.querySelector('.column-row--carry')).not.toHaveTextContent('')
  })

  it('schließt die selbstständige Entbündelung mit einer Additionsprobe ab', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    const exercise = generateExercise('written-subtraction', 84, 3)
    render(<ExerciseCard exercise={exercise} onComplete={onComplete} />)

    expect(screen.queryByRole('img', { name: /schriftliche Subtraktion/i })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Ich brauche einen Tipp' }))
    expect(screen.getByRole('img', { name: /schriftliche Subtraktion.*entbündelt/i })).toBeVisible()

    for (const step of exercise.steps ?? []) {
      await user.type(screen.getByLabelText('Dein Ergebnis'), step.correctAnswer)
      await user.click(screen.getByRole('button', { name: 'Ergebnis prüfen' }))
    }
    expect(screen.getByText(/Die Probe ergibt wieder/)).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Weiter' }))
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ skillId: 'written-subtraction', correct: true, hintsUsed: 1 }))
  })

  it('führt eine zweischrittige Sachaufgabe bis zum Antwortsatz', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    const exercise = Array.from({ length: 200 }, (_, index) => generateExercise('word-problem', index + 1, 3))
      .find((candidate) => candidate.variant.values.secondOperation)
    if (!exercise) throw new Error('Keine zweischrittige Sachaufgabe erzeugt')
    render(<ExerciseCard exercise={exercise} onComplete={onComplete} />)
    for (const step of exercise.steps ?? []) {
      if (step.interaction === 'guided-number') {
        await user.type(screen.getByLabelText('Dein Ergebnis'), step.correctAnswer)
        await user.click(screen.getByRole('button', { name: 'Ergebnis prüfen' }))
      } else if (step.interaction === 'continue') {
        await user.click(screen.getByRole('button', { name: step.continueLabel ?? 'Weiter' }))
      } else {
        const option = step.options?.find((candidate) => candidate.value === step.correctAnswer)
        if (!option) throw new Error(`Richtige Option für ${step.id} fehlt`)
        await user.click(screen.getByText(option.label))
      }
    }
    await user.click(screen.getByRole('button', { name: 'Weiter' }))
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ correct: true }))
  })

  it('lässt das Kind die Rechnung einer geführten Sachaufgabe selbst eintragen', async () => {
    const user = userEvent.setup()
    const exercise = generateExercise('word-problem', 42, 1, undefined, 'guided-practice')
    render(<ExerciseCard exercise={exercise} onComplete={vi.fn()} />)

    for (const step of exercise.steps ?? []) {
      if (step.id === 'equation') {
        expect(screen.getByLabelText('Deine Rechnung')).toHaveValue('')
        await user.type(screen.getByLabelText('Deine Rechnung'), step.correctAnswer)
        await user.click(screen.getByRole('button', { name: 'Rechnung prüfen' }))
        expect(screen.getByText(/Rechne selbst/)).toBeVisible()
        break
      }
      if (step.interaction === 'continue') await user.click(screen.getByRole('button', { name: step.continueLabel ?? 'Weiter' }))
      else {
        const correct = step.options?.find((option) => option.value === step.correctAnswer)
        if (!correct) throw new Error(`Richtige Option für ${step.id} fehlt`)
        await user.click(screen.getByRole('button', { name: correct.label }))
      }
    }
  })

  it('zeigt positives Zwischenfeedback bei Sachaufgaben grün', async () => {
    const user = userEvent.setup()
    const exercise = generateExercise('word-problem', 42, 1)
    render(<ExerciseCard exercise={exercise} onComplete={vi.fn()} />)

    for (const stepId of ['question', 'relevant']) {
      const step = exercise.steps?.find((candidate) => candidate.id === stepId)
      const option = step?.options?.find((candidate) => candidate.value === step.correctAnswer)
      if (!step || !option) throw new Error(`Richtige Option für ${stepId} fehlt`)
      await user.click(screen.getByRole('button', { name: option.label }))
    }

    const feedback = screen.getByText(exercise.steps?.find((step) => step.id === 'relevant')?.successFeedback ?? '')
    expect(feedback).toHaveClass('feedback--step-success')
    expect(feedback).not.toHaveClass('feedback--try')
  })

  it('startet Auswahlaufgaben neutral und trennt Fokus von Auswahl', () => {
    const exercise = generateExercise('body-views', 42, 2)
    const { container } = render(<ExerciseCard exercise={exercise} onComplete={vi.fn()} />)
    const heading = screen.getByRole('heading', { level: 2 })
    const options = [...container.querySelectorAll<HTMLButtonElement>('.answer-option')]

    expect(heading).toHaveFocus()
    expect(options).toHaveLength(3)
    options.forEach((option) => expect(option).toHaveAttribute('data-answer-state', 'idle'))
    options[0]?.focus()
    expect(options[0]).toHaveFocus()
    expect(options[0]).toHaveAttribute('data-answer-state', 'idle')
  })

  it('setzt Auswahl, Hilfe, Eingabe, Feedback und Fokus bei einer neuen Aufgabe zurück', async () => {
    const user = userEvent.setup()
    const first = generateExercise('addition', 42, 2)
    const second = generateExercise('body-views', 43, 2)
    const { rerender } = render(<ExerciseCard exercise={first} onComplete={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /tipp/i }))
    await user.type(screen.getByLabelText('Deine Antwort'), '999')
    await user.click(screen.getByRole('button', { name: 'Antwort prüfen' }))
    expect(screen.getByText(first.errorFeedback)).toBeVisible()

    rerender(<ExerciseCard exercise={second} onComplete={vi.fn()} />)
    expect(screen.queryByText(first.errorFeedback)).not.toBeInTheDocument()
    expect(screen.queryByText(first.hints[0].text)).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toHaveFocus()
    screen.getAllByRole('button').filter((button) => button.classList.contains('answer-option'))
      .forEach((button) => expect(button).toHaveAttribute('data-answer-state', 'idle'))
  })

  it.each(['money', 'lengths'] as const)('lässt eine Größenaufgabe %s vollständig lösen', async (skill) => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    const exercise = generateExercise(skill, 77, 1)
    render(<ExerciseCard exercise={exercise} onComplete={onComplete} />)
    const option = exercise.options?.find((candidate) => candidate.value === exercise.correctAnswer)
    if (!option) throw new Error('Richtige Größenoption fehlt')
    await user.click(screen.getByRole('button', { name: option.label }))
    await user.click(screen.getByRole('button', { name: 'Weiter' }))
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ correct: true, skillId: skill }))
  })
})
