import { expect, test, type Page } from '@playwright/test'

async function finishCurrentRound(page: Page) {
  for (let action = 0; action < 80; action += 1) {
    if (await page.getByText('Etappe geschafft').isVisible().catch(() => false)) return
    const continueWithHelp = page.getByRole('button', { name: /Mit einer (Grundlagenaufgabe|leichteren Aufgabe) weiter/ })
    if (await continueWithHelp.isVisible().catch(() => false)) {
      await continueWithHelp.click()
      continue
    }
    const next = page.getByRole('button', { name: 'Weiter', exact: true })
    if (await next.isVisible().catch(() => false)) {
      await next.click()
      continue
    }
    const numberInput = page.getByLabel('Deine Antwort')
    if (await numberInput.isVisible().catch(() => false)) {
      await numberInput.fill('9999')
      await page.getByRole('button', { name: 'Antwort prüfen' }).click()
      continue
    }
    const option = page.locator('.answer-option:visible, .symmetry-option:visible').first()
    if (await option.isVisible().catch(() => false)) {
      await option.click()
      continue
    }
    await page.waitForTimeout(50)
  }
  throw new Error('Die Runde konnte nicht innerhalb der erwarteten Aktionen abgeschlossen werden.')
}

async function onboard(page: Page, nickname = 'Nova') {
  await page.goto('/')
  const installButton = page.getByRole('button', { name: 'Weiter zur Mathe-Reise' })
  const nicknameInput = page.getByLabel('Dein Spitzname')
  const startButton = page.getByRole('button', { name: /Mathe-Runde starten/i })
  await expect(installButton.or(nicknameInput).or(startButton).first()).toBeVisible()
  if (await installButton.isVisible().catch(() => false)) await installButton.click()
  await expect(nicknameInput.or(startButton).first()).toBeVisible()
  if (await nicknameInput.isVisible().catch(() => false)) {
    await nicknameInput.fill(nickname)
    await page.getByRole('button', { name: 'Los geht’s' }).click()
  }
  await expect(startButton).toBeVisible()
}

test('vollständige mobile Runde bleibt nach Reload erhalten und läuft offline', async ({ page, context }) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })

  await onboard(page)
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker?.ready.then(() => true))).toBe(true)
  await expect(page.getByText('Offline bereit')).toBeVisible()
  await page.getByRole('button', { name: /Mathe-Runde starten/i }).click()
  await finishCurrentRound(page)
  await page.getByRole('button', { name: 'Mein Denken' }).click()
  await expect(page.getByText('1', { exact: true }).first()).toBeVisible()
  const completedSessionMetadata = await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('mathe-reise')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    const sessions = await new Promise<Array<Record<string, unknown>>>((resolve, reject) => {
      const request = database.transaction('sessions', 'readonly').objectStore('sessions').getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    database.close()
    const session = sessions[0]
    return session && {
      catalogId: session.catalogId,
      catalogVersion: session.catalogVersion,
      schemaVersion: session.schemaVersion,
      appVersion: session.appVersion
    }
  })
  expect(completedSessionMetadata).toEqual({
    catalogId: 'nrw-klasse3-foerderkern',
    catalogVersion: '0.4.0',
    schemaVersion: 4,
    appVersion: '0.5.0'
  })

  await page.reload()
  await expect(page.getByText('Hallo, Nova!')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

  await context.setOffline(true)
  await page.reload()
  await expect(page.getByText('Hallo, Nova!')).toBeVisible()
  await page.close()

  const reopenedPage = await context.newPage()
  reopenedPage.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  await reopenedPage.goto('/')
  await expect(reopenedPage.getByText('Hallo, Nova!')).toBeVisible()
  await reopenedPage.getByRole('button', { name: /Mathe-Runde starten/i }).click()
  await finishCurrentRound(reopenedPage)
  await reopenedPage.getByRole('button', { name: 'Ein Tipp' }).click()
  await expect(reopenedPage.getByRole('button', { name: /Mathe-Runde starten/i })).toBeVisible()
  expect(consoleErrors).toEqual([])
})

test('Landscape bleibt vollständig bedienbar und ohne horizontales Overflow', async ({ page }) => {
  await page.setViewportSize({ width: 812, height: 375 })
  await onboard(page, 'Komet')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.getByRole('button', { name: /Mathe-Runde starten/i }).click()
  await expect(page.locator('.exercise-panel')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
