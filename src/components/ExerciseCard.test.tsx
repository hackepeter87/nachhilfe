import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { generateExercise } from '../domain'
import { ExerciseCard } from './ExerciseCard'

describe('ExerciseCard', () => {
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

  it('blendet eine Hilfe-Darstellung erst mit dem Tipp ein', async () => {
    const user = userEvent.setup()
    const exercise = generateExercise('place-value', 42, 2)
    render(<ExerciseCard exercise={exercise} onComplete={vi.fn()} />)
    expect(screen.queryByRole('img', { name: 'Stellenwerttafel' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /tipp/i }))
    expect(screen.getByRole('img', { name: 'Stellenwerttafel' })).toBeVisible()
  })

  it('zeigt mathematische Teilsprünge erst mit der Zahlenstrahl-Hilfe', async () => {
    const user = userEvent.setup()
    const exercise = generateExercise('addition-1000', 42, 2)
    render(<ExerciseCard exercise={exercise} onComplete={vi.fn()} />)
    expect(screen.queryByRole('img', { name: 'Rechenweg in Teilschritten' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /tipp/i }))
    const representation = screen.getByRole('img', { name: 'Rechenweg in Teilschritten' })
    expect(representation).toBeVisible()
    const jumps = exercise.representation?.values.jumps
    expect(Array.isArray(jumps)).toBe(true)
    if (!Array.isArray(jumps)) throw new Error('Sprünge fehlen')
    jumps.forEach((jump) => {
      if (typeof jump === 'number') throw new Error('Ungültiger Zahlenstrahlsprung')
      expect(screen.getByLabelText(`Sprung von ${jump.from} bis ${jump.to}: ${jump.label}`)).toBeVisible()
    })
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
      if (step.interaction === 'number') {
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
