import { expect, test, type Page } from '@playwright/test'

async function finishCurrentRound(page: Page, onExercise?: (skillId: string) => void) {
  const reportedExercises = new Set<string>()
  for (let action = 0; action < 80; action += 1) {
    if (await page.getByText('Etappe geschafft').isVisible().catch(() => false)) return
    const panel = page.locator('.exercise-panel')
    if (await panel.isVisible().catch(() => false)) {
      const exerciseId = await panel.getAttribute('data-exercise-id')
      const skillId = await panel.getAttribute('data-skill-id')
      if (exerciseId && skillId && !reportedExercises.has(exerciseId)) {
        reportedExercises.add(exerciseId)
        onExercise?.(skillId)
      }
    }
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
    const pairingOptions = page.locator('.pairing-option[aria-pressed="false"]')
    if (await pairingOptions.first().isVisible().catch(() => false)) {
      while (await pairingOptions.count() > 0) await pairingOptions.first().click()
      await page.getByRole('button', { name: 'Paarungen prüfen' }).click()
      continue
    }
    const guidedNumberInput = page.getByLabel('Dein Ergebnis')
    if (await guidedNumberInput.isVisible().catch(() => false)) {
      await guidedNumberInput.fill('9999')
      await page.getByRole('button', { name: 'Ergebnis prüfen' }).evaluate((button: HTMLButtonElement) => button.click())
      continue
    }
    const equationInput = page.getByLabel('Deine Rechnung')
    if (await equationInput.isVisible().catch(() => false)) {
      await equationInput.fill('0 + 0 = ?')
      await page.getByRole('button', { name: 'Rechnung prüfen' }).evaluate((button: HTMLButtonElement) => button.click())
      continue
    }
    const numberInput = page.getByLabel('Deine Antwort')
    if (await numberInput.isVisible().catch(() => false)) {
      await numberInput.fill('9999')
      await page.getByRole('button', { name: 'Antwort prüfen' }).evaluate((button: HTMLButtonElement) => button.click())
      continue
    }
    const option = page.locator('.answer-option:visible, .symmetry-option:visible').first()
    if (await option.isVisible().catch(() => false)) {
      await option.evaluate((button: HTMLButtonElement) => button.click())
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

async function finishAdditionWarmups(page: Page) {
  for (let exercise = 0; exercise < 2; exercise += 1) {
    const prompt = await page.locator('.exercise-heading h2').textContent() ?? ''
    const complement = prompt.match(/Welche Zahl ergänzt (\d+) bis 10\?/)
    if (complement) {
      await page.getByRole('button', { name: String(10 - Number(complement[1])), exact: true }).click()
    } else if (/Welche Aussage beschreibt das Gruppenbild/.test(prompt)) {
      const description = await page.locator('.groups-visual').getAttribute('aria-label')
      const groups = description?.match(/(\d+) Gruppen mit je (\d+) Punkten/)
      if (!groups) throw new Error(`Gruppenbild ist nicht zugänglich beschrieben: ${description}`)
      await page.getByRole('button', { name: `${groups[1]} Gruppen mit je ${groups[2]} Punkten`, exact: true }).click()
    } else if (/werden auf \d+ Gruppen verteilt/.test(prompt)) {
      await page.getByRole('button', { name: 'die Punkte in jeder Gruppe', exact: true }).click()
    } else if (/werden immer zu \d+ Punkten zusammengelegt/.test(prompt)) {
      await page.getByRole('button', { name: 'die Anzahl der Gruppen', exact: true }).click()
    } else {
      const [first, second] = prompt.match(/\d+/g)?.map(Number) ?? []
      const input = page.getByLabel('Deine Antwort')
      if (first === undefined || second === undefined || !await input.isVisible().catch(() => false)) {
        throw new Error(`Additionsvorübung ist nicht lösbar: ${prompt}`)
      }
      await input.fill(String(first + second))
      await page.getByRole('button', { name: 'Antwort prüfen' }).click()
    }
    await page.getByRole('button', { name: 'Weiter', exact: true }).click()
  }
}

async function finishSubtractionWarmups(page: Page) {
  for (let exercise = 0; exercise < 2; exercise += 1) {
    const prompt = await page.locator('.exercise-heading h2').textContent() ?? ''
    const partWhole = prompt.match(/wie (\d+) in (\d+) und (\d+) zerlegt/i)
    if (partWhole) {
      await page.getByRole('button', { name: `${partWhole[2]} + ${partWhole[3]} = ${partWhole[1]}`, exact: true }).click()
    } else if (/Welche Plusaufgabe gehört zur selben Aufgabenfamilie/i.test(prompt)) {
      const [whole, removed, difference] = prompt.match(/\d+/g)?.map(Number) ?? []
      if (whole === undefined || removed === undefined || difference === undefined) {
        throw new Error(`Aufgabenfamilie ist nicht lesbar: ${prompt}`)
      }
      await page.getByRole('button', { name: `${difference} + ${removed} = ${whole}`, exact: true }).click()
    } else {
      const [first, second] = prompt.match(/\d+/g)?.map(Number) ?? []
      const input = page.getByLabel('Deine Antwort')
      if (first === undefined || second === undefined || !await input.isVisible().catch(() => false)) {
        throw new Error(`Subtraktionsvorübung ist nicht lösbar: ${prompt}`)
      }
      await input.fill(String(first - second))
      await page.getByRole('button', { name: 'Antwort prüfen' }).click()
    }
    await page.getByRole('button', { name: 'Weiter', exact: true }).click()
  }
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
  const firstRoundSkills = new Set<string>()
  await finishCurrentRound(page, (skillId) => firstRoundSkills.add(skillId))
  const focusDomains = {
    numbers: ['place-value', 'decompose', 'compose', 'neighbor-tens', 'neighbor-hundreds', 'round-tens', 'round-hundreds', 'addition-1000', 'written-addition', 'subtraction-1000', 'written-subtraction', 'complement-1000'],
    quantities: ['money', 'lengths', 'time', 'mass', 'capacity'],
    data: ['read-tables', 'read-charts', 'probability', 'combinatorics'],
    geometry: ['body-views', 'cube-rotation', 'folding', 'plane-shapes', 'patterns', 'area', 'perimeter']
  }
  for (const skills of Object.values(focusDomains)) expect(skills.some((skillId) => firstRoundSkills.has(skillId))).toBe(true)
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
    catalogVersion: '0.30.1',
    schemaVersion: 19,
    appVersion: '0.31.1'
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

test('Tabellen und Diagramme bleiben mobil lesbar und Antworten starten neutral', async ({ page }, testInfo) => {
  await page.route('**/content/task-catalog.json', async (route) => {
    const response = await route.fetch()
    const catalog = await response.json() as { skills: Array<{ id: string; releaseStatus: string }> }
    catalog.skills.forEach((skill) => {
      if (!['addition', 'read-tables'].includes(skill.id)) skill.releaseStatus = 'disabled'
    })
    await route.fulfill({ response, json: catalog })
  })

  await onboard(page, 'Daten')
  await page.getByRole('button', { name: /Mathe-Runde starten/i }).click()
  await finishAdditionWarmups(page)

  await expect(page.locator('.data-display')).toBeVisible()
  await expect(page.locator('.data-table, .tally-list')).toBeVisible()
  await expect(page.locator('.answer-option[data-answer-state="idle"]')).toHaveCount(3)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.locator('.session-page').screenshot({ path: testInfo.outputPath('daten-375x812.png'), fullPage: true })

  await page.setViewportSize({ width: 812, height: 375 })
  await expect(page.locator('.data-display')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

test('Wahrscheinlichkeit und Kombinationen bleiben mobil lesbar und ergebnisoffen', async ({ page }, testInfo) => {
  await page.route('**/content/task-catalog.json', async (route) => {
    const response = await route.fetch()
    const catalog = await response.json() as { skills: Array<{ id: string; releaseStatus: string }> }
    catalog.skills.forEach((skill) => {
      if (!['addition', 'probability', 'combinatorics'].includes(skill.id)) skill.releaseStatus = 'disabled'
    })
    await route.fulfill({ response, json: catalog })
  })

  await onboard(page, 'Zufall')
  await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('mathe-reise')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction('progress', 'readwrite')
      for (const skillId of ['probability', 'combinatorics']) transaction.objectStore('progress').put({
        skillId, attempts: 2, correctAnswers: 1, hintsUsed: 0,
        lastPracticedAt: '2026-07-20T08:00:00.000Z', difficulty: 1,
        learningPhase: 'guided-practice', mastery: 35, recentErrors: 0,
        correctStreak: 1, lastVariantKey: null, status: 'learning', subskills: {}
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

  const seen = new Set<string>()
  for (let focus = 0; focus < 2; focus += 1) {
    const chance = page.locator('.chance-display')
    const combinations = page.locator('.combination-display')
    await expect(chance.or(combinations).first()).toBeVisible()
    await expect(page.locator('.answer-option[data-answer-state="idle"]')).toHaveCount(3)
    if (await chance.isVisible().catch(() => false)) {
      seen.add('probability')
      await expect(chance).toHaveAttribute('aria-label', /Mögliche gleich große Felder oder Ergebnisse/)
      const outcomes = (await chance.locator('.chance-outcomes span, .chance-legend span, .coin-faces span').allTextContents()).map((outcome) => outcome.replace(/^[□○●KZ]\s*/, '').trim())
      expect(outcomes.length).toBeGreaterThanOrEqual(2)
      const prompt = await page.locator('.exercise-heading h2').textContent()
      await page.locator('.session-page').screenshot({ path: testInfo.outputPath('wahrscheinlichkeit-375x812.png'), fullPage: true })
      if (prompt?.includes('im sichtbaren Ergebnisraum enthalten')) {
        await page.getByRole('button', { name: outcomes[0]!, exact: true }).click()
      } else if (prompt?.includes('Vorhersage')) {
        await page.getByRole('button', { name: `Es kann ${[...new Set(outcomes)].join(' oder ')} erscheinen.`, exact: true }).click()
      } else {
        const event = ['rot', 'blau', 'grün', 'gelb'].find((color) => prompt?.toLowerCase().includes(color))
        if (!event) throw new Error('Das Ereignis der Zufallsaufgabe ist nicht lesbar.')
        const matches = outcomes.filter((outcome) => outcome.toLowerCase().includes(event)).length
        const answer = matches === 0 ? 'unmöglich' : matches === outcomes.length ? 'sicher' : 'möglich'
        await page.getByRole('button', { name: answer, exact: true }).click()
      }
    } else {
      seen.add('combinatorics')
      await expect(combinations).toHaveAttribute('aria-label', /Die Anzahl bleibt unbekannt/)
      expect(await combinations.locator('.combination-cell').count()).toBeGreaterThanOrEqual(4)
      await expect(combinations.locator('.combination-cell--missing')).toHaveText('?')
      await page.locator('.session-page').screenshot({ path: testInfo.outputPath('kombinatorik-375x812.png'), fullPage: true })
      const missingPair = await combinations.locator('.combination-table').evaluate((table) => {
        const columns = [...table.querySelectorAll('.combination-heading:not(.combination-heading--row)')].map((node) => node.textContent?.trim() ?? '')
        const rows = [...table.querySelectorAll('.combination-heading--row')].map((node) => node.textContent?.trim() ?? '')
        const cells = [...table.querySelectorAll('.combination-cell')]
        const missingIndex = cells.findIndex((cell) => cell.classList.contains('combination-cell--missing'))
        if (missingIndex < 0 || columns.length === 0) return ''
        return `${rows[Math.floor(missingIndex / columns.length)]} mit ${columns[missingIndex % columns.length]}`
      })
      if (!missingPair) throw new Error('Die offene Paarung ist nicht aus Zeile und Spalte lesbar.')
      await page.getByRole('button', { name: missingPair, exact: true }).click()
      await expect(combinations.locator('.combination-cell--missing')).toHaveCount(0)
      const combinationCount = await combinations.locator('.combination-cell:not(.combination-cell--blocked)').count()
      await page.getByRole('button', { name: String(combinationCount), exact: true }).click()
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    if (focus === 1) {
      await page.setViewportSize({ width: 812, height: 375 })
      await expect(page.locator('.exercise-panel')).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    }
    await page.getByRole('button', { name: 'Weiter', exact: true }).click()
  }
  expect(seen).toEqual(new Set(['probability', 'combinatorics']))
})

test('Zeit, Masse und Rauminhalt bleiben mobil lesbar und ergebnisoffen', async ({ page }, testInfo) => {
  await page.route('**/content/task-catalog.json', async (route) => {
    const response = await route.fetch()
    const catalog = await response.json() as { skills: Array<{ id: string; releaseStatus: string }> }
    catalog.skills.forEach((skill) => {
      if (!['addition', 'time', 'mass', 'capacity'].includes(skill.id)) skill.releaseStatus = 'disabled'
    })
    await route.fulfill({ response, json: catalog })
  })

  await onboard(page, 'Messen')
  await page.getByRole('button', { name: /Mathe-Runde starten/i }).click()
  await finishAdditionWarmups(page)

  const referenceAnswers = new Map([
    ['einem Apfel', '200 g'], ['einer Packung Butter', '250 g'], ['einer Packung Mehl', '1 kg'],
    ['einem Teelöffel', '5 ml'], ['einem Trinkglas', '250 ml'], ['ein kleines Trinkpäckchen', '200 ml']
  ])
  const seen = new Set<string>()
  for (let focus = 0; focus < 3; focus += 1) {
    const clock = page.locator('.clock-visual')
    const mass = page.locator('.quantity-measure--mass')
    const capacity = page.locator('.quantity-measure--capacity')
    await expect(clock.or(mass).or(capacity).first()).toBeVisible()
    await expect(page.locator('.answer-option[data-answer-state="idle"]')).toHaveCount(3)
    await expect(page.locator('.quantity-result')).toHaveCount(0)

    if (await clock.isVisible().catch(() => false)) {
      seen.add('time')
      const handRoleAnswer = page.getByRole('button', { name: 'Der lange Zeiger zeigt die Minuten.', exact: true })
      if (await handRoleAnswer.isVisible().catch(() => false)) {
        await handRoleAnswer.click()
      } else {
        const description = await clock.getAttribute('aria-label')
        const match = description?.match(/Stunde (\d+), der lange Zeiger zu (\d+) Minuten/)
        if (!match) throw new Error('Analoge Uhrzeit ist nicht zugänglich beschrieben.')
        const answer = `${match[1]!.padStart(2, '0')}:${match[2]!.padStart(2, '0')} Uhr`
        await page.getByRole('button', { name: answer, exact: true }).click()
      }
      await page.locator('.session-page').screenshot({ path: testInfo.outputPath('zeit-375x812.png'), fullPage: true })
    } else {
      const prompt = await page.locator('.exercise-heading h2').textContent() ?? ''
      const matchingEntry = [...referenceAnswers.entries()].find(([item]) => prompt.includes(item))
      if (!matchingEntry) throw new Error(`Bezugsgröße ist nicht zuordenbar: ${prompt}`)
      const [item, answer] = matchingEntry
      if (await mass.isVisible().catch(() => false)) seen.add('mass')
      else seen.add('capacity')
      await page.getByRole('button', { name: answer, exact: true }).click()
      await page.locator('.session-page').screenshot({ path: testInfo.outputPath(`${item.includes('Teelöffel') || item.includes('Trinkglas') || item.includes('Trinkpäckchen') ? 'rauminhalt' : 'masse'}-375x812.png`), fullPage: true })
    }
    await expect(page.locator('.quantity-result')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    if (focus === 2) {
      await page.setViewportSize({ width: 812, height: 375 })
      await expect(page.locator('.exercise-panel')).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    }
    await page.getByRole('button', { name: 'Weiter', exact: true }).click()
  }
  expect(seen).toEqual(new Set(['time', 'mass', 'capacity']))
})

test('Ebene Figuren und Muster bleiben mobil lesbar und ergebnisoffen', async ({ page }, testInfo) => {
  await page.route('**/content/task-catalog.json', async (route) => {
    const response = await route.fetch()
    const catalog = await response.json() as { skills: Array<{ id: string; releaseStatus: string }> }
    catalog.skills.forEach((skill) => {
      if (!['addition', 'plane-shapes', 'patterns'].includes(skill.id)) skill.releaseStatus = 'disabled'
    })
    await route.fulfill({ response, json: catalog })
  })
  await onboard(page, 'Form')
  await page.getByRole('button', { name: /Mathe-Runde starten/i }).click()
  await finishAdditionWarmups(page)
  const seen = new Set<string>()
  for (let focus = 0; focus < 2; focus += 1) {
    await expect(page.locator('.answer-option[data-answer-state="idle"]')).toHaveCount(3)
    await expect(page.locator('.quantity-result')).toHaveCount(0)
    const shape = page.locator('.shape-visual')
    if (await shape.isVisible().catch(() => false)) {
      seen.add('plane-shapes')
      const comparisonAnswer = page.getByRole('button', { name: 'Beide Figuren haben vier Ecken.', exact: true })
      const outline = shape.locator('.shape-outline')
      const answer = await comparisonAnswer.isVisible().catch(() => false)
        ? 'Beide Figuren haben vier Ecken.'
        : await outline.evaluate((element) => element.classList.contains('shape-outline--triangle') ? 'Dreieck' : element.classList.contains('shape-outline--square') ? 'Quadrat' : 'Rechteck')
      await page.getByRole('button', { name: answer, exact: true }).click()
      expect(await page.locator('.session-page').evaluate((element) => {
        const bounds = element.getBoundingClientRect()
        return bounds.left >= 0 && bounds.right <= window.innerWidth
      })).toBe(true)
      await page.screenshot({ path: testInfo.outputPath('ebene-figur-375x812.png'), fullPage: true })
    } else {
      seen.add('patterns')
      const description = await page.locator('.pattern-visual').getAttribute('aria-label') ?? ''
      const sequence = description.match(/Sichtbare Folge: ([^.]+)\./)?.[1]?.split(', ') ?? []
      const blockLength = [1, 2, 3].find((length) => sequence.every((symbol, index) => symbol === sequence[index % length]))
      if (!blockLength) throw new Error(`Kein Wiederholungsblock erkennbar: ${description}`)
      const answer = sequence.slice(0, blockLength).join(' – ')
      await page.getByRole('button', { name: answer, exact: true }).click()
      expect(await page.locator('.session-page').evaluate((element) => {
        const bounds = element.getBoundingClientRect()
        return bounds.left >= 0 && bounds.right <= window.innerWidth
      })).toBe(true)
      await page.screenshot({ path: testInfo.outputPath('muster-375x812.png'), fullPage: true })
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await page.getByRole('button', { name: 'Weiter', exact: true }).click()
  }
  expect(seen).toEqual(new Set(['plane-shapes', 'patterns']))
})

test('Fläche und Umfang beginnen mit unterschiedlichen Einheiten und maskieren das Ergebnis', async ({ page }, testInfo) => {
  await page.route('**/content/task-catalog.json', async (route) => {
    const response = await route.fetch()
    const catalog = await response.json() as { skills: Array<{ id: string; releaseStatus: string }> }
    catalog.skills.forEach((skill) => {
      if (!['addition', 'area', 'perimeter'].includes(skill.id)) skill.releaseStatus = 'disabled'
    })
    await route.fulfill({ response, json: catalog })
  })
  await onboard(page, 'Raster')
  await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('mathe-reise')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction('progress', 'readwrite')
      transaction.objectStore('progress').put({
        skillId: 'plane-shapes', attempts: 5, correctAnswers: 4, hintsUsed: 0,
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
  const seen = new Set<string>()
  for (let focus = 0; focus < 2; focus += 1) {
    const grid = page.locator('.unit-grid-visual')
    await expect(grid).toBeVisible()
    await expect(grid.locator('.quantity-result')).toHaveCount(0)
    await expect(page.locator('.answer-option[data-answer-state="idle"]')).toHaveCount(3)
    let answer: string
    if (await grid.evaluate((element) => element.classList.contains('unit-grid-visual--area'))) {
      seen.add('area')
      answer = 'Ein gefülltes Einheitsquadrat.'
      await page.screenshot({ path: testInfo.outputPath('flaeche-375x812.png'), fullPage: true })
    } else {
      seen.add('perimeter')
      answer = 'Eine Seite eines Einheitsquadrats.'
      await page.screenshot({ path: testInfo.outputPath('umfang-375x812.png'), fullPage: true })
    }
    await page.getByRole('button', { name: String(answer), exact: true }).click()
    await expect(grid.locator('.quantity-result')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    if (focus === 1) {
      await page.setViewportSize({ width: 812, height: 375 })
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    }
    await page.getByRole('button', { name: 'Weiter', exact: true }).click()
  }
  expect(seen).toEqual(new Set(['area', 'perimeter']))
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

test('Division zeigt mobil die vollständige Gruppierung oder Verteilung ohne numerische Lösung', async ({ page }, testInfo) => {
  await page.route('**/content/task-catalog.json', async (route) => {
    const response = await route.fetch()
    const catalog = await response.json() as { skills: Array<{ id: string; releaseStatus: string }> }
    catalog.skills.forEach((skill) => {
      if (['addition', 'subtraction', 'multiplication'].includes(skill.id)) skill.releaseStatus = 'disabled'
    })
    await route.fulfill({ response, json: catalog })
  })

  await onboard(page, 'Teilen')
  await page.getByRole('button', { name: /Mathe-Runde starten/i }).click()
  const model = page.locator('.division-model').first()
  await expect(model).toBeVisible()
  await expect(model).toHaveAttribute('aria-label', /vollständig.*unbekannt/i)
  await expect(model.locator(':scope > strong').last()).toContainText('?')
  const counts = await model.evaluate((element) => ({
    pool: element.querySelectorAll('.known-pool i').length,
    partition: element.querySelectorAll('.division-partition i').length,
    groups: element.querySelectorAll('.division-group').length,
    pointsPerGroup: [...element.querySelectorAll('.division-group')].map((group) => group.querySelectorAll('i').length)
  }))
  expect(counts.pool).toBeGreaterThanOrEqual(4)
  expect(counts.partition).toBe(counts.pool)
  expect(counts.groups).toBeGreaterThanOrEqual(2)
  expect(new Set(counts.pointsPerGroup).size).toBe(1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('division-vollstaendig-375x812.png'), fullPage: true })
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
  await finishAdditionWarmups(page)

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

test('Körperansichten beginnen mit der Blickrichtung und bleiben mobil ohne Overflow', async ({ page }, testInfo) => {
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
  await finishAdditionWarmups(page)

  await expect(page.getByRole('img', { name: /Würfel.*Vorne und rechts sind markiert/i })).toBeVisible()
  await expect(page.getByText('vorne', { exact: true })).toBeVisible()
  await expect(page.getByText('rechts', { exact: true })).toBeVisible()
  await expect(page.getByRole('img', { name: /Ansicht [ABC]/ })).toHaveCount(0)
  await expect(page.locator('.answer-option[data-answer-state="idle"]')).toHaveCount(3)
  await page.getByRole('button', { name: 'Vorderansicht', exact: true }).click()
  expect(await page.locator('.iso-cube').count()).toBeGreaterThanOrEqual(2)
  expect(await page.locator('.iso-cube').count()).toBeLessThanOrEqual(3)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.locator('.session-page').screenshot({ path: testInfo.outputPath('koerperansichten-375x812.png'), fullPage: true })

  await page.setViewportSize({ width: 812, height: 375 })
  await expect(page.locator('.cube-building-visual')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.locator('.session-page').screenshot({ path: testInfo.outputPath('koerperansichten-812x375.png'), fullPage: true })
})

test('Würfelrotation beginnt mit Achse und Drehrichtung mobil ohne Overflow', async ({ page }, testInfo) => {
  await page.route('**/content/task-catalog.json', async (route) => {
    const response = await route.fetch()
    const catalog = await response.json() as { skills: Array<{ id: string; releaseStatus: string }> }
    catalog.skills.forEach((skill) => {
      if (!['addition', 'cube-rotation'].includes(skill.id)) skill.releaseStatus = 'disabled'
    })
    await route.fulfill({ response, json: catalog })
  })

  await onboard(page, 'Drehung')
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

  const rotation = page.locator('.cube-rotation-visual')
  await expect(rotation).toBeVisible()
  await expect(page.getByText('senkrechte Drehachse')).toBeVisible()
  const turnLabel = (await rotation.locator('.rotation-turn text').textContent())?.trim()
  expect(turnLabel).toMatch(/^90 Grad nach (links|rechts)$/)
  await expect(page.getByRole('img', { name: /Gebäude [ABC].*nach der Drehung/i })).toHaveCount(0)
  await expect(page.locator('.answer-option[data-answer-state="idle"]')).toHaveCount(3)
  await page.getByRole('button', { name: turnLabel!, exact: true }).click()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.locator('.session-page').screenshot({ path: testInfo.outputPath('wuerfelrotation-375x812.png'), fullPage: true })

  await page.setViewportSize({ width: 812, height: 375 })
  await expect(page.locator('.cube-rotation-visual')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.locator('.session-page').screenshot({ path: testInfo.outputPath('wuerfelrotation-812x375.png'), fullPage: true })
})

test('Einzelfaltung beginnt mit Achse und bewegter Papierhälfte mobil ohne Overflow', async ({ page }, testInfo) => {
  await page.route('**/content/task-catalog.json', async (route) => {
    const response = await route.fetch()
    const catalog = await response.json() as { skills: Array<{ id: string; releaseStatus: string }> }
    catalog.skills.forEach((skill) => {
      if (!['addition', 'folding'].includes(skill.id)) skill.releaseStatus = 'disabled'
    })
    await route.fulfill({ response, json: catalog })
  })

  await onboard(page, 'Faltung')
  await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('mathe-reise')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction('progress', 'readwrite')
      transaction.objectStore('progress').put({
        skillId: 'symmetry', attempts: 8, correctAnswers: 6, hintsUsed: 1,
        lastPracticedAt: '2026-07-17T10:00:00.000Z', difficulty: 3,
        learningPhase: 'automate', mastery: 75, recentErrors: 0,
        correctStreak: 3, lastVariantKey: null, status: 'practicing', subskills: {}
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

  await expect(page.getByRole('img', { name: /Faltachse/i }).first()).toBeVisible()
  await expect(page.locator('.folding-grid--axis-vertical').first()).toBeVisible()
  await expect(page.locator('.answer-option[data-answer-state="idle"]')).toHaveCount(3)
  await expect(page.getByRole('img', { name: /Bild [ABC]/ })).toHaveCount(0)
  const foldLabel = (await page.locator('.folding-instruction span').textContent())?.trim()
  expect(foldLabel).toBeTruthy()
  await page.getByRole('button', { name: foldLabel!, exact: true }).click()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.locator('.session-page').screenshot({ path: testInfo.outputPath('falten-375x812.png'), fullPage: true })

  await page.setViewportSize({ width: 812, height: 375 })
  await expect(page.locator('.folding-paper-visual').first()).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.locator('.session-page').screenshot({ path: testInfo.outputPath('falten-812x375.png'), fullPage: true })
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
  await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('mathe-reise')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction('progress', 'readwrite')
      transaction.objectStore('progress').put({
        skillId: 'word-problem', attempts: 2, correctAnswers: 1, hintsUsed: 0,
        lastPracticedAt: '2026-07-17T10:00:00.000Z', difficulty: 1,
        learningPhase: 'guided-practice', mastery: 35, recentErrors: 0,
        correctStreak: 1, lastVariantKey: null, status: 'learning', subskills: {}
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

  await expect(page.getByRole('heading', { name: /1\. Welche Rechnung beschreibt die Geschichte/ })).toBeVisible()
  await expect(page.getByText(/Mengenbeziehung|Welche Rechenart/i)).toHaveCount(0)
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
  await expect(page.locator('.feedback--step-success')).toHaveCount(0)
  await expect(page.locator('.feedback--try')).toHaveCount(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.locator('.session-page').screenshot({ path: testInfo.outputPath('sachaufgabe-modell-375x812.png'), fullPage: true })
  const story = await page.locator('.exercise-heading h2').textContent()
  const [first, second] = story?.match(/\d+/g)?.map(Number) ?? []
  if (first === undefined || second === undefined) throw new Error('Rechnung ist nicht lesbar')
  await expect(model).toBeVisible()
  await page.getByRole('button', { name: `${first} + ${second} = ?`, exact: true }).click()
  await expect(page.locator('.feedback--step-success')).toBeVisible()
  await expect(model).toBeVisible()
  await page.getByLabel('Dein Ergebnis').fill(String(first + second))
  await page.getByRole('button', { name: 'Ergebnis prüfen' }).click()
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

  await finishAdditionWarmups(page)

  const column = page.locator('.column-calculation')
  await expect(column).toBeVisible()
  await expect(column).toHaveAttribute('aria-label', /Schriftliche Addition .* Ergebnis ist noch offen/i)
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

  await finishSubtractionWarmups(page)

  const column = page.locator('.column-calculation')
  await expect(column).toBeVisible()
  await expect(column).toHaveAttribute('aria-label', /Schriftliche Subtraktion .* Ergebnis ist noch offen/i)
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
  await expect(page.getByText(/Bei den Hundertern: \d − \d = \d\. Das stimmt\./)).toBeVisible()
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
      await expect(page.locator('.money-visual')).toHaveAttribute('aria-label', /Gesamtbetrag (?:unbekannt|\d+ Cent)/)
      await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
      await page.locator('.session-page').screenshot({ path: testInfo.outputPath('geld-375x812.png') })
    }
    if (await page.locator('.length-visual').isVisible().catch(() => false)) {
      lengthSeen = true
      await expect(page.getByRole('img', { name: /Messstrecke.*Länge (?:unbekannt|\d+ Zentimeter)/ })).toBeVisible()
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
