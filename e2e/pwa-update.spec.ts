import { createServer } from 'node:http'
import { expect, test } from '@playwright/test'

test('PWA aktualisiert den Service Worker ohne das lokale Profil zu verlieren', async ({ page, context, baseURL }) => {
  test.setTimeout(90_000)
  let revision = 1
  // The proxy changes only the worker bytes, never the running app or container.
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? '/', baseURL)
      const upstream = await fetch(url)
      let body = Buffer.from(await upstream.arrayBuffer())
      if (url.pathname === '/sw.js') {
        body = Buffer.concat([body, Buffer.from(`\n// update-test-${revision}\n`)])
      }
      response.writeHead(upstream.status, {
        'Content-Type': upstream.headers.get('content-type') ?? 'application/octet-stream',
        'Cache-Control': 'no-store'
      })
      response.end(body)
    } catch {
      response.writeHead(502)
      response.end()
    }
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  try {
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('Test server has no port')
    const url = `http://127.0.0.1:${address.port}`
    await page.goto(url)
    const installButton = page.getByRole('button', { name: 'Weiter zur Mathe-Reise' })
    const nickname = page.getByLabel('Dein Spitzname')
    await expect(installButton.or(nickname).first()).toBeVisible()
    if (await installButton.isVisible()) await installButton.click()
    await nickname.fill('Update-Test')
    await page.getByRole('button', { name: 'Los geht’s' }).click()
    await expect(page.getByText('Offline bereit')).toBeVisible()
    await page.reload()
    await expect(page.getByText('Hallo, Update-Test!')).toBeVisible()

    revision = 2
    await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready
      await registration.update()
    })
    const updateButton = page.getByRole('button', { name: 'Jetzt aktualisieren' })
    await expect(updateButton).toBeVisible({ timeout: 15_000 })
    await updateButton.click()
    await expect(updateButton).toBeHidden()
    await expect.poll(() => page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready
      return registration.waiting === null && navigator.serviceWorker.controller !== null
    })).toBe(true)
    await expect(page.getByText('Hallo, Update-Test!')).toBeVisible()
    await context.setOffline(true)
    await page.reload()
    await expect(page.getByText('Hallo, Update-Test!')).toBeVisible()
  } finally {
    await context.setOffline(false)
    server.closeAllConnections()
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  }
})
