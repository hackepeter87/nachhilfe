import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { generateExercise } from '../domain'
import { ExerciseCard } from './ExerciseCard'

describe('ExerciseCard', () => {
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

    for (const stepId of ['question', 'situation']) {
      const step = exercise.steps?.find((candidate) => candidate.id === stepId)
      const option = step?.options?.find((candidate) => candidate.value === step.correctAnswer)
      if (!step || !option) throw new Error(`Richtige Option für ${stepId} fehlt`)
      await user.click(screen.getByRole('button', { name: option.label }))
    }

    const feedback = screen.getByText(exercise.steps?.find((step) => step.id === 'situation')?.successFeedback ?? '')
    expect(feedback).toHaveClass('feedback--step-success')
    expect(feedback).not.toHaveClass('feedback--try')
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
