export type WrittenSubtractionUnbundlePattern = 'none' | 'tens' | 'hundreds' | 'both' | 'across-zero'

export interface WrittenSubtractionExchange {
  from: 'hundreds' | 'tens'
  to: 'tens' | 'ones'
}

export interface WrittenSubtractionAnalysis {
  adjustedDigits: [number, number, number]
  exchanges: WrittenSubtractionExchange[]
  pattern: WrittenSubtractionUnbundlePattern
}

export function analyzeWrittenSubtraction(first: number, second: number): WrittenSubtractionAnalysis | null {
  if (!Number.isInteger(first) || first < 100 || first > 999 || !Number.isInteger(second) || second < 1 || second >= first) return null

  let hundreds = Math.floor(first / 100)
  let tens = Math.floor(first / 10) % 10
  let ones = first % 10
  const secondTens = Math.floor(second / 10) % 10
  const secondOnes = second % 10
  const exchanges: WrittenSubtractionExchange[] = []
  let crossedZero = false

  if (ones < secondOnes) {
    if (tens === 0) {
      hundreds -= 1
      tens += 10
      exchanges.push({ from: 'hundreds', to: 'tens' })
      crossedZero = true
    }
    tens -= 1
    ones += 10
    exchanges.push({ from: 'tens', to: 'ones' })
  }

  if (tens < secondTens) {
    hundreds -= 1
    tens += 10
    exchanges.push({ from: 'hundreds', to: 'tens' })
  }

  if (hundreds < Math.floor(second / 100)) return null

  const pattern: WrittenSubtractionUnbundlePattern = exchanges.length === 0
    ? 'none'
    : crossedZero
      ? 'across-zero'
      : exchanges.length === 2
        ? 'both'
        : exchanges[0]?.from === 'tens'
          ? 'tens'
          : 'hundreds'

  return { adjustedDigits: [hundreds, tens, ones], exchanges, pattern }
}
