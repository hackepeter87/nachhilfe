import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import ReviewWorkbench from './ReviewWorkbench'

describe('ReviewWorkbench', () => {
  it('stellt alle aktiven Kompetenzen reproduzierbar bereit und verbirgt die Lösung', async () => {
    const user = userEvent.setup()
    const { container } = render(<ReviewWorkbench />)

    expect(screen.getByRole('heading', { name: 'Didaktischer Prüfstand' })).toBeVisible()
    expect(screen.getByLabelText('Kompetenz').querySelectorAll('option')).toHaveLength(34)
    expect(container.querySelector('[data-review-scenario="addition:activate:1:1:base"]')).toBeInTheDocument()
    const solutionDetails = screen.getByText('Technische Lösung anzeigen').closest('details')
    expect(solutionDetails).not.toBeNull()
    expect(solutionDetails).not.toHaveAttribute('open')

    fireEvent.change(screen.getByLabelText('Seed'), { target: { value: '801' } })
    expect(container.querySelector('[data-review-scenario="addition:activate:1:801:base"]')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Ich brauche einen Tipp' }))
    expect(container.querySelector('.hint')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Aufgabe neu starten' }))
    expect(screen.getByRole('button', { name: 'Ich brauche einen Tipp' })).toBeVisible()
    expect(container.querySelector('.hint')).not.toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Aufgabenpfad'), 'remediation')
    expect(container.querySelector('[data-review-scenario="addition:activate:1:801:remediation"]')).toBeInTheDocument()
  })

  it('erzeugt eine reproduzierbare Markdown-Befundvorlage', async () => {
    const user = userEvent.setup()
    render(<ReviewWorkbench />)

    await user.selectOptions(screen.getByLabelText('Kompetenz'), 'word-problem')
    await user.selectOptions(screen.getByLabelText('Lernphase'), 'guided-practice')
    await user.type(screen.getByLabelText('Erwartetes Verhalten'), 'Das Kind rechnet selbst.')
    await user.type(screen.getByLabelText('Tatsächliches Verhalten'), 'Das Ergebnis erscheint vorher.')
    await user.click(screen.getByRole('button', { name: 'Befundvorlage erzeugen' }))

    expect((screen.getByLabelText('Befund als Markdown') as HTMLTextAreaElement).value).toContain('Kompetenz: `word-problem`')
    expect((screen.getByLabelText('Befund als Markdown') as HTMLTextAreaElement).value).toContain('Das Kind rechnet selbst.')
  })
})
