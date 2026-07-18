import { expect, test, type Page } from '@playwright/test'

async function onboard(page: Page) {
  await page.goto('/')
  const installButton = page.getByRole('button', { name: 'Weiter zur Mathe-Reise' })
  const nickname = page.getByLabel('Dein Spitzname')
  const startButton = page.getByRole('button', { name: /Mathe-Runde starten/i })
  await expect(installButton.or(nickname).or(startButton).first()).toBeVisible()
  if (await installButton.isVisible().catch(() => false)) await installButton.click()
  await expect(nickname.or(startButton).first()).toBeVisible()
  if (await nickname.isVisible().catch(() => false)) {
    await nickname.fill('WebKit')
    await page.getByRole('button', { name: 'Los geht’s' }).click()
  }
  await expect(startButton).toBeVisible()
}

async function finishAdditionWarmups(page: Page) {
  for (let exercise = 0; exercise < 2; exercise += 1) {
    const prompt = await page.locator('.exercise-heading h2').textContent() ?? ''
    const complement = prompt.match(/Welche Zahl ergänzt (\d+) bis 10\?/)
    if (complement) {
      await page.getByRole('button', { name: String(10 - Number(complement[1])), exact: true }).click()
    } else {
      const terms = prompt.match(/(\d+) \+ (\d+)/)
      if (!terms) throw new Error(`Unerwartete Einstiegsaufgabe: ${prompt}`)
      await page.getByLabel('Deine Antwort').fill(String(Number(terms[1]) + Number(terms[2])))
      await page.getByRole('button', { name: 'Antwort prüfen' }).click()
    }
    await page.getByRole('button', { name: 'Weiter', exact: true }).click()
  }
}

test('Mobile-Safari-Näherung startet Aufgaben neutral und setzt Touch-Zustände zurück', async ({ page }) => {
  await page.route('**/content/task-catalog.json', async (route) => {
    const response = await route.fetch()
    const catalog = await response.json() as { skills: Array<{ id: string; releaseStatus: string }> }
    catalog.skills.forEach((skill) => {
      if (!['addition', 'body-views'].includes(skill.id)) skill.releaseStatus = 'disabled'
    })
    await route.fulfill({ response, json: catalog })
  })

  await onboard(page)
  await page.getByRole('button', { name: /Mathe-Runde starten/i }).click()

  let openedHint = false
  for (let action = 0; action < 8 && !(await page.locator('.answer-option').first().isVisible().catch(() => false)); action += 1) {
    const input = page.getByLabel('Deine Antwort')
    if (await input.isVisible().catch(() => false)) {
      if (!openedHint) {
        await page.getByRole('button', { name: 'Ich brauche einen Tipp' }).click()
        openedHint = true
      }
      const prompt = await page.locator('.exercise-heading h2').textContent()
      const terms = prompt?.match(/(\d+) \+ (\d+)/)
      if (!terms) throw new Error(`Unerwartete Einstiegsaufgabe: ${prompt}`)
      await input.fill(String(Number(terms[1]) + Number(terms[2])))
      await page.getByRole('button', { name: 'Antwort prüfen' }).click()
      await page.getByRole('button', { name: 'Weiter', exact: true }).click()
      continue
    }
  }

  const options = page.locator('.answer-option')
  await expect(options.first()).toBeVisible()
  await expect(page.locator('.exercise-heading h2')).toBeFocused()
  await expect(options).toHaveCount(3)
  for (let index = 0; index < 3; index += 1) {
    await expect(options.nth(index)).toHaveAttribute('data-answer-state', 'idle')
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

test('Mobile-Safari-Näherung zeigt eine kontrollierte Würfelrotation neutral und vollständig', async ({ page }) => {
  await page.route('**/content/task-catalog.json', async (route) => {
    const response = await route.fetch()
    const catalog = await response.json() as { skills: Array<{ id: string; releaseStatus: string }> }
    catalog.skills.forEach((skill) => {
      if (!['addition', 'cube-rotation'].includes(skill.id)) skill.releaseStatus = 'disabled'
    })
    await route.fulfill({ response, json: catalog })
  })

  await onboard(page)
  await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('mathe-reise')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction('progress', 'readwrite')
      transaction.objectStore('progress').put({
        skillId: 'body-views', attempts: 5, correctAnswers: 4, hintsUsed: 0,
        lastPracticedAt: '2026-07-17T10:00:00.000Z', difficulty: 2,
        learningPhase: 'independent-practice', mastery: 60, recentErrors: 0,
        correctStreak: 2, lastVariantKey: null, status: 'practicing', subskills: {}
      })
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
    database.close()
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((registration) => registration.unregister()))
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames.map((name) => caches.delete(name)))
  })
  await page.reload()
  await page.getByRole('button', { name: /Mathe-Runde starten/i }).click()
  await finishAdditionWarmups(page)

  await expect(page.locator('.cube-rotation-visual')).toBeVisible()
  await expect(page.locator('.rotation-axis')).toBeVisible()
  await expect(page.locator('.rotation-turn--right')).toBeVisible()
  const options = page.locator('.answer-option')
  await expect(options).toHaveCount(3)
  for (let index = 0; index < 3; index += 1) await expect(options.nth(index)).toHaveAttribute('data-answer-state', 'idle')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
