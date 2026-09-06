import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import {
  AUDIT_UNAVAILABLE_EXIT_CODE,
  classifyAuditResult,
  runAuditWithRetry
} from './security-audit.mjs'

const cleanReport = JSON.stringify({
  metadata: {
    vulnerabilities: { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0 }
  }
})

const vulnerableReport = JSON.stringify({
  metadata: {
    vulnerabilities: { info: 0, low: 0, moderate: 1, high: 0, critical: 0, total: 1 }
  }
})

describe('npm-Audit-Ausfallsicherung', () => {
  it('verankert Lockfile-Scan und Audit-Policy im CI-Gate', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'))
    const workflow = fs.readFileSync(path.resolve('.github/workflows/ci.yml'), 'utf8')

    expect(packageJson.scripts['security:audit']).toBe('node scripts/security-audit.mjs')
    expect(workflow).toContain('name: Scan npm lockfile')
    expect(workflow).toContain('scan-type: fs')
    expect(workflow).toContain('severity: MEDIUM,HIGH,CRITICAL')
    expect(workflow).toContain("TRIVY_INCLUDE_DEV_DEPS: 'true'")
    expect(workflow).toContain('npm run security:audit')
    expect(workflow).toContain('if [ "$status" -eq 75 ]; then')
  })

  it('akzeptiert einen erfolgreichen Audit ohne Funde', () => {
    expect(classifyAuditResult({ status: 0, stdout: cleanReport, stderr: '' })).toEqual({
      kind: 'clean',
      exitCode: 0
    })
  })

  it('blockiert bei einem Fund ab moderate ohne Wiederholung', async () => {
    const execute = vi.fn().mockReturnValue({ status: 1, stdout: vulnerableReport, stderr: '' })

    const result = await runAuditWithRetry({ execute, sleep: vi.fn(), attempts: 3 })

    expect(result).toMatchObject({ kind: 'findings', exitCode: 1, attempts: 1 })
    expect(execute).toHaveBeenCalledTimes(1)
  })

  it('wiederholt einen eindeutig technischen Audit-Ausfall', async () => {
    const execute = vi.fn()
      .mockReturnValueOnce({ status: 1, stdout: '', stderr: 'npm error code ETIMEDOUT' })
      .mockReturnValueOnce({ status: 1, stdout: '', stderr: '503 Service Unavailable' })
      .mockReturnValueOnce({ status: 0, stdout: cleanReport, stderr: '' })
    const sleep = vi.fn().mockResolvedValue(undefined)

    const result = await runAuditWithRetry({ execute, sleep, attempts: 3 })

    expect(result).toMatchObject({ kind: 'clean', exitCode: 0, attempts: 3 })
    expect(sleep).toHaveBeenCalledTimes(2)
  })

  it('meldet einen fortdauernden Dienstausfall mit einem eigenen Exitcode', async () => {
    const execute = vi.fn().mockReturnValue({
      status: 1,
      stdout: JSON.stringify({ error: { summary: '502 Bad Gateway' } }),
      stderr: ''
    })

    const result = await runAuditWithRetry({ execute, sleep: vi.fn(), attempts: 3 })

    expect(result).toMatchObject({
      kind: 'unavailable',
      exitCode: AUDIT_UNAVAILABLE_EXIT_CODE,
      attempts: 3
    })
  })

  it('maskiert keine unbekannten npm- oder Skriptfehler', async () => {
    const execute = vi.fn().mockReturnValue({ status: 2, stdout: 'not-json', stderr: 'unexpected failure' })

    const result = await runAuditWithRetry({ execute, sleep: vi.fn(), attempts: 3 })

    expect(result).toMatchObject({ kind: 'error', exitCode: 2, attempts: 1 })
    expect(execute).toHaveBeenCalledTimes(1)
  })

  it('reserviert Exitcode 75 ausschließlich für erkannte Dienstausfälle', () => {
    expect(classifyAuditResult({ status: 75, stdout: 'not-json', stderr: 'unexpected failure' })).toEqual({
      kind: 'error',
      exitCode: 2
    })
  })
})
