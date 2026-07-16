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
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
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
    catalogVersion: '0.6.0',
    schemaVersion: 5,
    appVersion: '0.8.0'
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

test('Punktgruppen zeigen auf dem mobilen Viewport jede Gruppe und jeden Punkt', async ({ page }, testInfo) => {
  await page.route('**/content/task-catalog.json', async (route) => {
    const response = await route.fetch()
    const catalog = await response.json() as { skills: Array<{ id: string; releaseStatus: string }> }
    catalog.skills.forEach((skill) => {
      if (['addition', 'subtraction', 'division'].includes(skill.id)) skill.releaseStatus = 'disabled'
    })
    await route.fulfill({ response, json: catalog })
  })

  await onboard(page, 'Punkt')
  await page.getByRole('button', { name: /Mathe-Runde starten/i }).click()
  const groupsVisual = page.locator('.groups-visual')
  await expect(groupsVisual).toBeVisible()
  const counts = await groupsVisual.evaluate((element) => {
    const groups = [...element.querySelectorAll('.visual-group')]
    return {
      groups: groups.length,
      pointsPerGroup: groups.map((group) => group.querySelectorAll('i').length),
      totalPoints: element.querySelectorAll('.visual-group i').length
    }
  })
  expect(counts.groups).toBeGreaterThanOrEqual(2)
  expect(counts.groups).toBeLessThanOrEqual(10)
  expect(new Set(counts.pointsPerGroup).size).toBe(1)
  expect(counts.pointsPerGroup[0]).toBeGreaterThanOrEqual(2)
  expect(counts.pointsPerGroup[0]).toBeLessThanOrEqual(10)
  expect(counts.totalPoints).toBe(counts.groups * counts.pointsPerGroup[0]!)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('punktgruppen-375x812.png'), fullPage: true })
})

test('Geld und Längen besitzen eigene mobile Darstellungen ohne Overflow', async ({ page }, testInfo) => {
  await page.route('**/content/task-catalog.json', async (route) => {
    const response = await route.fetch()
    const catalog = await response.json() as { skills: Array<{ id: string; releaseStatus: string }> }
    catalog.skills.forEach((skill) => {
      if (!['addition', 'money', 'lengths'].includes(skill.id)) skill.releaseStatus = 'disabled'
    })
    await route.fulfill({ response, json: catalog })
  })

  await onboard(page, 'Maß')
  await page.getByRole('button', { name: /Mathe-Runde starten/i }).click()
  let moneySeen = false
  let lengthSeen = false
  for (let action = 0; action < 30 && (!moneySeen || !lengthSeen); action += 1) {
    if (await page.locator('.money-visual').isVisible().catch(() => false)) {
      moneySeen = true
      expect(await page.locator('.coin').count()).toBeGreaterThan(0)
      await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
      await page.locator('.session-page').screenshot({ path: testInfo.outputPath('geld-375x812.png') })
    }
    if (await page.locator('.length-visual').isVisible().catch(() => false)) {
      lengthSeen = true
      await expect(page.getByRole('img', { name: /Messstrecke.*Zentimeter/ })).toBeVisible()
      await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
      await page.locator('.session-page').screenshot({ path: testInfo.outputPath('laenge-375x812.png') })
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    const next = page.getByRole('button', { name: 'Weiter', exact: true })
    if (await next.isVisible().catch(() => false)) {
      await next.click()
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
      continue
    }
    const scaffold = page.getByRole('button', { name: /Mit einer (Grundlagenaufgabe|leichteren Aufgabe) weiter/ })
    if (await scaffold.isVisible().catch(() => false)) {
      await scaffold.click()
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
      continue
    }
    const numberInput = page.getByLabel('Deine Antwort')
    if (await numberInput.isVisible().catch(() => false)) {
      await numberInput.fill('9999')
      await page.getByRole('button', { name: 'Antwort prüfen' }).click()
      continue
    }
    const option = page.locator('.answer-option:visible').first()
    if (await option.isVisible().catch(() => false)) await option.click()
  }
  expect(moneySeen).toBe(true)
  expect(lengthSeen).toBe(true)
})
