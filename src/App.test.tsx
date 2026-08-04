import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { databaseMetadata, loadAppData } from './storage/db'

const pwa = vi.hoisted(() => ({
  onNeedRefresh: undefined as (() => void) | undefined,
  update: vi.fn(async () => undefined)
}))

vi.mock('virtual:pwa-register', () => ({
  registerSW: ({ onRegisteredSW, onNeedRefresh }: { onRegisteredSW?: () => void; onNeedRefresh?: () => void }) => {
    pwa.onNeedRefresh = onNeedRefresh
    onRegisteredSW?.()
    return pwa.update
  }
}))

function deleteDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(databaseMetadata.name)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

describe('App-Ablauf', () => {
  beforeEach(async () => {
    await deleteDatabase()
    pwa.onNeedRefresh = undefined
    pwa.update.mockClear()
  })

  it('führt vom Installationshinweis über Onboarding zur Startseite', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(await screen.findByText('Auf dem iPhone installieren')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Weiter zur Mathe-Reise' }))
    await user.type(await screen.findByLabelText('Dein Spitzname'), 'Nova')
    await user.click(screen.getByRole('button', { name: 'Los geht’s' }))
    expect(await screen.findByText('Hallo, Nova!')).toBeVisible()
    expect(screen.getByRole('button', { name: /mathe-runde starten/i })).toBeEnabled()
    await waitFor(() => expect(screen.getByText(/Offline (bereit|wird vorbereitet)/)).toBeVisible())
  })

  it('zeigt technische Versionen nur auf Abruf', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(await screen.findByRole('button', { name: 'Weiter zur Mathe-Reise' }))
    await user.click(await screen.findByRole('button', { name: 'Los geht’s' }))

    await screen.findByRole('button', { name: /mathe-runde starten/i })
    expect(screen.getByText('nrw-klasse3-foerderkern 0.31.3')).not.toBeVisible()
    await user.click(screen.getByLabelText('Versionsinformationen öffnen'))
    expect(screen.getByText('nrw-klasse3-foerderkern 0.31.3')).toBeVisible()
    expect(screen.getByText('0.32.6')).toBeVisible()
    expect(screen.getByText('ready-for-review')).toBeVisible()
  })

  it('aktiviert ein PWA-Update nicht während einer laufenden Runde', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(await screen.findByRole('button', { name: 'Weiter zur Mathe-Reise' }))
    await user.click(await screen.findByRole('button', { name: 'Los geht’s' }))
    await user.click(await screen.findByRole('button', { name: /mathe-runde starten/i }))

    act(() => pwa.onNeedRefresh?.())
    expect(screen.queryByText('Eine neue Version ist bereit.')).not.toBeInTheDocument()
    expect(pwa.update).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Runde verlassen und zur Startseite' }))
    await user.click(screen.getByRole('button', { name: 'Zur Startseite' }))
    expect(screen.getByText('Eine neue Version ist bereit.')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Jetzt aktualisieren' }))
    expect(pwa.update).toHaveBeenCalledWith(true)
  })

  it('verlässt eine laufende Runde erst nach Bestätigung', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(await screen.findByRole('button', { name: 'Weiter zur Mathe-Reise' }))
    await user.click(await screen.findByRole('button', { name: 'Los geht’s' }))
    await user.click(await screen.findByRole('button', { name: /mathe-runde starten/i }))

    await user.click(screen.getByRole('button', { name: 'Runde verlassen und zur Startseite' }))
    const dialog = screen.getByRole('alertdialog', { name: 'Zur Startseite?' })
    await user.click(within(dialog).getByRole('button', { name: 'Abbrechen' }))
    expect(screen.getByText(/1 \/ \d+/)).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Runde verlassen und zur Startseite' }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Zur Startseite' }))
    expect(await screen.findByRole('button', { name: /mathe-runde starten/i })).toBeEnabled()
  })

  it('beginnt über die Navigation bewusst eine neue Runde bei Aufgabe 1', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(await screen.findByRole('button', { name: 'Weiter zur Mathe-Reise' }))
    await user.click(await screen.findByRole('button', { name: 'Los geht’s' }))
    await user.click(await screen.findByRole('button', { name: /mathe-runde starten/i }))

    await user.click(await screen.findByRole('button', { name: 'Navigation öffnen' }))
    await user.click(screen.getByRole('button', { name: /Neue Runde beginnen/ }))
    expect(screen.getByRole('alertdialog', { name: 'Neue Runde beginnen?' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Neue Runde starten' }))

    expect(await screen.findByText(/1 \/ \d+/)).toBeVisible()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('setzt die App nur nach Bestätigung vollständig zurück', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(await screen.findByRole('button', { name: 'Weiter zur Mathe-Reise' }))
    await user.type(await screen.findByLabelText('Dein Spitzname'), 'Nova')
    await user.click(screen.getByRole('button', { name: 'Los geht’s' }))

    await user.click(await screen.findByRole('button', { name: 'Navigation öffnen' }))
    await user.click(screen.getByRole('button', { name: /App zurücksetzen/ }))
    const dialog = screen.getByRole('alertdialog', { name: 'App wirklich zurücksetzen?' })
    await user.click(within(dialog).getByRole('button', { name: 'Abbrechen' }))
    expect(screen.getByText('Hallo, Nova!')).toBeVisible()
    expect((await loadAppData()).profile?.nickname).toBe('Nova')

    await user.click(screen.getByRole('button', { name: 'Navigation öffnen' }))
    await user.click(screen.getByRole('button', { name: /App zurücksetzen/ }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Alles zurücksetzen' }))

    expect(await screen.findByText('Wie möchtest du hier heißen?')).toBeVisible()
    expect(await loadAppData()).toEqual({
      profile: null,
      settings: { key: 'app-settings', installHelpDismissed: false, schemaVersion: 1 },
      progress: {},
      sessions: []
    })
  })
})
