import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { databaseMetadata } from './storage/db'

vi.mock('virtual:pwa-register', () => ({
  registerSW: ({ onRegisteredSW }: { onRegisteredSW?: () => void }) => {
    onRegisteredSW?.()
    return vi.fn(async () => undefined)
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
})
