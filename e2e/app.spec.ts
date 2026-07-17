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
    const modelContinue = page.getByRole('button', { name: 'Weiter zur Rechnung' })
    if (await modelContinue.isVisible().catch(() => false)) {
      await modelContinue.click()
      continue
    }
    const guidedNumberInput = page.getByLabel('Dein Ergebnis')
    if (await guidedNumberInput.isVisible().catch(() => false)) {
      await guidedNumberInput.fill('9999')
      await page.getByRole('button', { name: 'Ergebnis prüfen' }).click()
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
    catalogVersion: '0.12.0',
    schemaVersion: 10,
    appVersion: '0.13.1'
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

test('Symmetrie zeigt mobil eine Achse zwischen den Zellen ohne Overflow', async ({ page }, testInfo) => {
  await page.route('**/content/task-catalog.json', async (route) => {
    const response = await route.fetch()
    const catalog = await response.json() as { skills: Array<{ id: string; releaseStatus: string }> }
    catalog.skills.forEach((skill) => {
      if (!['addition', 'symmetry'].includes(skill.id)) skill.releaseStatus = 'disabled'
    })
    await route.fulfill({ response, json: catalog })
  })

  await onboard(page, 'Spiegel')
  await page.getByRole('button', { name: /Mathe-Runde starten/i }).click()
  for (let exercise = 0; exercise < 2; exercise += 1) {
    const prompt = await page.locator('.exercise-heading h2').textContent()
    const [first, second] = prompt?.match(/\d+/g)?.map(Number) ?? []
    if (first === undefined || second === undefined) throw new Error('Additionsvorübung ist nicht lesbar')
    await page.getByLabel('Deine Antwort').fill(String(first + second))
    await page.getByRole('button', { name: 'Antwort prüfen' }).click()
    await page.getByRole('button', { name: 'Weiter', exact: true }).click()
  }

  const source = page.getByRole('img', { name: /Vorlage zum Spiegeln.*Senkrechte Spiegelachse zwischen Feldern/ })
  await expect(source).toBeVisible()
  await expect(page.getByText('Die grüne Linie ist die Spiegelachse.')).toBeVisible()
  const axisMetrics = await source.evaluate((element) => {
    const box = element.getBoundingClientRect()
    const style = getComputedStyle(element)
    const axis = getComputedStyle(element, '::after')
    return {
      columns: Number(style.getPropertyValue('--grid-columns')),
      rows: Number(style.getPropertyValue('--grid-rows')),
      boxRatio: box.width / box.height,
      axisRatio: Number.parseFloat(axis.left) / box.width,
      axisWidth: Number.parseFloat(axis.width),
      axisColor: axis.backgroundColor
    }
  })
  expect(axisMetrics.boxRatio).toBeCloseTo(axisMetrics.columns / axisMetrics.rows, 1)
  expect(axisMetrics.axisRatio).toBeCloseTo(0.5, 1)
  expect(axisMetrics.axisWidth).toBeGreaterThanOrEqual(3)
  expect(axisMetrics.axisColor).not.toBe('rgba(0, 0, 0, 0)')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.locator('.session-page').screenshot({ path: testInfo.outputPath('symmetrie-achse-375x812.png'), fullPage: true })
})

test('Körperansichten zeigen Gebäude, Richtungen und drei Raster mobil ohne Overflow', async ({ page }, testInfo) => {
  await page.route('**/content/task-catalog.json', async (route) => {
    const response = await route.fetch()
    const catalog = await response.json() as { skills: Array<{ id: string; releaseStatus: string }> }
    catalog.skills.forEach((skill) => {
      if (!['addition', 'body-views'].includes(skill.id)) skill.releaseStatus = 'disabled'
    })
    await route.fulfill({ response, json: catalog })
  })

  await onboard(page, 'Würfel')
  await page.getByRole('button', { name: /Mathe-Runde starten/i }).click()
  for (let exercise = 0; exercise < 2; exercise += 1) {
    const prompt = await page.locator('.exercise-heading h2').textContent()
    const [first, second] = prompt?.match(/\d+/g)?.map(Number) ?? []
    if (first === undefined || second === undefined) throw new Error('Additionsvorübung ist nicht lesbar')
    await page.getByLabel('Deine Antwort').fill(String(first + second))
    await page.getByRole('button', { name: 'Antwort prüfen' }).click()
    await page.getByRole('button', { name: 'Weiter', exact: true }).click()
  }

  await expect(page.getByRole('img', { name: /Würfel.*Vorne und rechts sind markiert/i })).toBeVisible()
  await expect(page.getByText('vorne')).toBeVisible()
  await expect(page.getByText('rechts')).toBeVisible()
  await expect(page.getByRole('img', { name: /Ansicht [ABC]/ })).toHaveCount(3)
  expect(await page.locator('.iso-cube').count()).toBeGreaterThanOrEqual(2)
  expect(await page.locator('.iso-cube').count()).toBeLessThanOrEqual(3)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.locator('.session-page').screenshot({ path: testInfo.outputPath('koerperansichten-375x812.png'), fullPage: true })

  await page.setViewportSize({ width: 812, height: 375 })
  await expect(page.locator('.cube-building-visual')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.locator('.session-page').screenshot({ path: testInfo.outputPath('koerperansichten-812x375.png'), fullPage: true })
})

test('Sachaufgabe führt mobil über ein unbekanntenhaltiges Modell zur eigenen Rechnung', async ({ page }, testInfo) => {
  await page.route('**/content/task-catalog.json', async (route) => {
    const response = await route.fetch()
    const catalog = await response.json() as {
      skills: Array<{ id: string; releaseStatus: string }>
      wordProblems: Array<{ id: string }>
    }
    catalog.skills.forEach((skill) => {
      if (!['addition', 'word-problem'].includes(skill.id)) skill.releaseStatus = 'disabled'
    })
    catalog.wordProblems = catalog.wordProblems.filter((template) => template.id === 'shells-addition')
    await route.fulfill({ response, json: catalog })
  })

  await onboard(page, 'Modell')
  await page.getByRole('button', { name: /Mathe-Runde starten/i }).click()
  for (let exercise = 0; exercise < 2; exercise += 1) {
    const prompt = await page.locator('.exercise-heading h2').textContent()
    const [first, second] = prompt?.match(/\d+/g)?.map(Number) ?? []
    if (first === undefined || second === undefined) throw new Error('Additionsvorübung ist nicht lesbar')
    const input = page.getByLabel('Deine Antwort')
    await input.fill(String(first + second))
    await page.getByRole('button', { name: 'Antwort prüfen' }).click()
    await page.getByRole('button', { name: 'Weiter', exact: true }).click()
  }

  await expect(page.getByText('1. Was wird gesucht?')).toBeVisible()
  await expect(page.getByText(/Mengenbeziehung|Welche Rechenart/i)).toHaveCount(0)
  await page.getByRole('button', { name: 'Wie viele Muscheln hat Mila jetzt?' }).click()
  await expect(page.getByText('2. Welche Angaben brauchst du für die ganze Geschichte?')).toBeVisible()
  await page.getByRole('button', { name: /Muscheln und \d+ neue Muscheln/ }).click()
  const model = page.getByRole('img', { name: /neue Gesamtmenge unbekannt/i })
  await expect(model).toBeVisible()
  await expect(model).toContainText('?')
  const modelLabel = await model.getAttribute('aria-label')
  const [knownAmount, addedAmount] = modelLabel?.match(/\d+/g)?.map(Number) ?? []
  if (knownAmount === undefined || addedAmount === undefined) throw new Error('Mengenverhältnis ist nicht lesbar')
  const renderedRatio = await model.evaluate((element) => {
    const bars = element.querySelectorAll<HTMLElement>('.model-bar')
    return bars[0]!.getBoundingClientRect().width / bars[1]!.getBoundingClientRect().width
  })
  expect(renderedRatio).toBeCloseTo(knownAmount / (knownAmount + addedAmount), 2)
  await expect(page.locator('.feedback--step-success')).toBeVisible()
  await expect(page.locator('.feedback--try')).toHaveCount(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.locator('.session-page').screenshot({ path: testInfo.outputPath('sachaufgabe-modell-375x812.png'), fullPage: true })
  await page.getByRole('button', { name: 'Weiter zur Rechnung' }).click()
  const equationButton = page.getByRole('button', { name: /^\d+ \+ \d+ = \?$/ })
  const equation = await equationButton.textContent()
  if (!equation) throw new Error('Passende Rechnung fehlt')
  const [first, second] = equation.match(/\d+/g)?.map(Number) ?? []
  if (first === undefined || second === undefined) throw new Error('Rechnung ist nicht lesbar')
  await equationButton.click()
  await page.getByLabel('Dein Ergebnis').fill(String(first + second))
  await page.getByRole('button', { name: 'Ergebnis prüfen' }).click()
  await page.getByRole('button', { name: new RegExp(`Das Ergebnis ${first + second} ist größer`) }).click()
  await page.getByRole('button', { name: `Mila hat jetzt ${first + second} Muscheln.` }).click()
  await page.getByRole('button', { name: 'Weiter', exact: true }).click()
})

test('Schriftliche Addition wird nach den Voraussetzungen mobil vollständig bearbeitet', async ({ page }, testInfo) => {
  await page.route('**/content/task-catalog.json', async (route) => {
    const response = await route.fetch()
    const catalog = await response.json() as { skills: Array<{ id: string; releaseStatus: string }> }
    catalog.skills.forEach((skill) => {
      if (!['addition', 'written-addition'].includes(skill.id)) skill.releaseStatus = 'disabled'
    })
    await route.fulfill({ response, json: catalog })
  })

  await onboard(page, 'Spalte')
  await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('mathe-reise')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    const transaction = database.transaction('progress', 'readwrite')
    const store = transaction.objectStore('progress')
    const progress = (skillId: string) => ({
      skillId,
      attempts: 6,
      correctAnswers: 5,
      hintsUsed: 0,
      lastPracticedAt: '2026-07-17T10:00:00.000Z',
      difficulty: 2,
      learningPhase: 'independent-practice',
      mastery: 70,
      recentErrors: 0,
      correctStreak: 2,
      lastVariantKey: null,
      status: 'practicing',
      subskills: {}
    })
    store.put(progress('place-value'))
    store.put(progress('addition-1000'))
    store.put(progress('written-addition'))
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
    database.close()
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((registration) => registration.unregister()))
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
  })
  await page.reload()
  await page.getByRole('button', { name: /Mathe-Runde starten/i }).click()

  for (let warmup = 0; warmup < 2; warmup += 1) {
    const prompt = await page.locator('.exercise-heading h2').textContent()
    const [first, second] = prompt?.match(/\d+/g)?.map(Number) ?? []
    if (first === undefined || second === undefined) throw new Error('Additionsvorübung ist nicht lesbar')
    await page.getByLabel('Deine Antwort').fill(String(first + second))
    await page.getByRole('button', { name: 'Antwort prüfen' }).click()
    await page.getByRole('button', { name: 'Weiter', exact: true }).click()
  }

  const column = page.getByRole('img', { name: /Schriftliche Addition .* Ergebnis ist noch offen/i })
  await expect(column).toBeVisible()
  const label = await column.getAttribute('aria-label')
  const [first, second] = label?.match(/\d+/g)?.map(Number) ?? []
  if (first === undefined || second === undefined) throw new Error('Summanden der Spaltendarstellung fehlen')
  const answer = first + second
  const stepAnswers = [answer % 10, 1, Math.floor(answer / 10) % 10, Math.floor(answer / 100)]
  const resultRow = column.locator('.column-row--result')
  const carryRow = column.locator('.column-row--carry')
  await expect(resultRow).toHaveText('???')
  await expect(carryRow).toHaveText('')
  for (const [index, stepAnswer] of stepAnswers.entries()) {
    await page.getByLabel('Dein Ergebnis').fill(String(stepAnswer))
    await page.getByRole('button', { name: 'Ergebnis prüfen' }).click()
    if (index === 0) {
      await expect(resultRow).toHaveText(`??${answer % 10}`)
      await expect(carryRow).toHaveText('')
    }
    if (index === 1) await expect(carryRow).toHaveText('1')
    if (index === 2) await expect(resultRow).toHaveText(`?${String(answer).slice(1)}`)
  }
  await expect(resultRow).toHaveText(String(answer))
  await expect(page.getByText(/Die Hunderterziffer \d stimmt/)).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.locator('.session-page').screenshot({ path: testInfo.outputPath('schriftliche-addition-375x812.png'), fullPage: true })
})

test('Schriftliche Subtraktion entbündelt mobil sichtbar und vollständig', async ({ page }, testInfo) => {
  await page.route('**/content/task-catalog.json', async (route) => {
    const response = await route.fetch()
    const catalog = await response.json() as { skills: Array<{ id: string; releaseStatus: string }> }
    catalog.skills.forEach((skill) => {
      if (!['subtraction', 'written-subtraction'].includes(skill.id)) skill.releaseStatus = 'disabled'
    })
    await route.fulfill({ response, json: catalog })
  })

  await onboard(page, 'Entbündeln')
  await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('mathe-reise')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    const transaction = database.transaction('progress', 'readwrite')
    const store = transaction.objectStore('progress')
    const progress = (skillId: string) => ({
      skillId,
      attempts: 6,
      correctAnswers: 5,
      hintsUsed: 0,
      lastPracticedAt: '2026-07-17T10:00:00.000Z',
      difficulty: 2,
      learningPhase: 'independent-practice',
      mastery: 70,
      recentErrors: 0,
      correctStreak: 2,
      lastVariantKey: null,
      status: 'practicing',
      subskills: {}
    })
    store.put(progress('place-value'))
    store.put(progress('subtraction-1000'))
    store.put(progress('written-subtraction'))
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
    database.close()
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((registration) => registration.unregister()))
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
  })
  await page.reload()
  await page.getByRole('button', { name: /Mathe-Runde starten/i }).click()

  for (let warmup = 0; warmup < 2; warmup += 1) {
    const prompt = await page.locator('.exercise-heading h2').textContent()
    const [first, second] = prompt?.match(/\d+/g)?.map(Number) ?? []
    if (first === undefined || second === undefined) throw new Error('Subtraktionsvorübung ist nicht lesbar')
    await page.getByLabel('Deine Antwort').fill(String(first - second))
    await page.getByRole('button', { name: 'Antwort prüfen' }).click()
    await page.getByRole('button', { name: 'Weiter', exact: true }).click()
  }

  const column = page.getByRole('img', { name: /Schriftliche Subtraktion .* Ergebnis ist noch offen/i })
  await expect(column).toBeVisible()
  const label = await column.getAttribute('aria-label')
  const [first, second] = label?.match(/\d+/g)?.map(Number) ?? []
  if (first === undefined || second === undefined) throw new Error('Zahlen der Spaltendarstellung fehlen')
  const answer = first - second
  const resultRow = column.locator('.column-row--result')
  const adjustmentRow = column.locator('.column-row--carry')
  await expect(resultRow).toHaveText('???')
  await expect(adjustmentRow).toHaveText('')

  for (const [index, stepAnswer] of [1, answer % 10, Math.floor(answer / 10) % 10, Math.floor(answer / 100)].entries()) {
    await page.getByLabel('Dein Ergebnis').fill(String(stepAnswer))
    await page.getByRole('button', { name: 'Ergebnis prüfen' }).click()
    if (index === 0) {
      await expect(adjustmentRow).not.toHaveText('')
      await expect(column).toHaveAttribute('aria-label', /entbündelt/)
    }
    if (index === 1) await expect(resultRow).toHaveText(`??${answer % 10}`)
    if (index === 2) await expect(resultRow).toHaveText(`?${String(answer).slice(1)}`)
  }
  await expect(resultRow).toHaveText(String(answer))
  await expect(page.getByText(/Die Hunderterziffer \d stimmt/)).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.locator('.session-page').screenshot({ path: testInfo.outputPath('schriftliche-subtraktion-375x812.png'), fullPage: true })
  await page.setViewportSize({ width: 812, height: 375 })
  await expect(column).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.locator('.session-page').screenshot({ path: testInfo.outputPath('schriftliche-subtraktion-812x375.png'), fullPage: true })
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
