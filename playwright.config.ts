import { defineConfig, devices } from '@playwright/test'

const externalBaseUrl = process.env.E2E_BASE_URL

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: externalBaseUrl ?? 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    serviceWorkers: 'allow'
  },
  webServer: externalBaseUrl ? undefined : {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173',
    port: 4173,
    reuseExistingServer: false,
    timeout: 120_000
  },
  projects: [
    {
      name: 'iPhone-13-mini',
      testIgnore: /mobile-safari\.spec\.ts/,
      use: { ...devices['iPhone 13'], browserName: 'chromium', viewport: { width: 375, height: 812 } }
    },
    {
      name: 'mobile-safari-webkit',
      testMatch: /mobile-safari\.spec\.ts/,
      use: { ...devices['iPhone 13'], viewport: { width: 375, height: 812 } }
    }
  ]
})
