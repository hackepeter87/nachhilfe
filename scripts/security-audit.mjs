import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

export const AUDIT_UNAVAILABLE_EXIT_CODE = 75

const transientFailurePattern = /\b(?:408|425|429|500|502|503|504)\b|EAI_AGAIN|ECONN(?:ABORTED|REFUSED|RESET)|ENETUNREACH|ETIMEDOUT|fetch failed|network timeout|socket hang up|service unavailable|bad gateway|gateway timeout|audit endpoint returned an error|request to .* failed/i

function parseReport(stdout) {
  try {
    const report = JSON.parse(stdout)
    return report && typeof report === 'object' ? report : null
  } catch {
    return null
  }
}

function blockedFindingCount(report) {
  const vulnerabilities = report?.metadata?.vulnerabilities
  if (!vulnerabilities || typeof vulnerabilities !== 'object') return null

  return ['moderate', 'high', 'critical'].reduce((sum, severity) => {
    const count = vulnerabilities[severity]
    return sum + (Number.isInteger(count) ? count : 0)
  }, 0)
}

export function classifyAuditResult({ status, stdout = '', stderr = '' }) {
  const report = parseReport(stdout)
  const findings = blockedFindingCount(report)

  if (findings !== null) {
    if (findings > 0) return { kind: 'findings', exitCode: 1 }
    if (status === 0) return { kind: 'clean', exitCode: 0 }
  }

  const diagnostic = `${stdout}\n${stderr}`.trim()
  if (status !== 0 && transientFailurePattern.test(diagnostic)) {
    return { kind: 'unavailable', exitCode: AUDIT_UNAVAILABLE_EXIT_CODE }
  }

  const exitCode = Number.isInteger(status) && status > 0 && status !== AUDIT_UNAVAILABLE_EXIT_CODE ? status : 2
  return { kind: 'error', exitCode }
}

export async function runAuditWithRetry({ execute, sleep, attempts = 3, delayMs = 2_000 }) {
  if (!Number.isInteger(attempts) || attempts < 1) throw new Error('attempts muss mindestens 1 sein')

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const execution = await execute()
    const result = classifyAuditResult(execution)

    if (result.kind !== 'unavailable' || attempt === attempts) {
      return { ...result, attempts: attempt, execution }
    }

    await sleep(delayMs * attempt)
  }

  throw new Error('Audit-Schleife wurde unerwartet verlassen')
}

function executeNpmAudit() {
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  const execution = spawnSync(npmCommand, [
    'audit',
    '--json',
    '--audit-level=moderate',
    '--fetch-retries=0',
    '--fetch-timeout=20000'
  ], {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024
  })

  return {
    status: execution.status,
    stdout: execution.stdout ?? '',
    stderr: execution.stderr ?? ''
  }
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function main() {
  const result = await runAuditWithRetry({ execute: executeNpmAudit, sleep: wait })

  if (result.kind === 'clean') {
    process.stdout.write(`npm audit: keine Funde ab moderate (${result.attempts} Versuch${result.attempts === 1 ? '' : 'e'}).\n`)
  } else if (result.kind === 'findings') {
    process.stderr.write('npm audit: Sicherheitsfunde ab moderate blockieren die Freigabe.\n')
    process.stderr.write(result.execution.stdout)
  } else if (result.kind === 'unavailable') {
    process.stderr.write(`npm audit: Advisory-Dienst nach ${result.attempts} Versuchen nicht erreichbar.\n`)
    process.stderr.write(result.execution.stderr || result.execution.stdout)
  } else {
    process.stderr.write('npm audit: unerwarteter Fehler; die Freigabe bleibt blockiert.\n')
    process.stderr.write(result.execution.stderr || result.execution.stdout)
  }

  process.exitCode = result.exitCode
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main()
}
