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
    await user.click(screen.getByRole('button', { name: 'Mit Hilfe weiter' }))
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

  it('blendet eine Hilfe-Darstellung erst mit dem Tipp ein', async () => {
    const user = userEvent.setup()
    const exercise = generateExercise('place-value', 42, 2)
    render(<ExerciseCard exercise={exercise} onComplete={vi.fn()} />)
    expect(screen.queryByRole('img', { name: 'Stellenwerttafel' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /tipp/i }))
    expect(screen.getByRole('img', { name: 'Stellenwerttafel' })).toBeVisible()
  })
})
