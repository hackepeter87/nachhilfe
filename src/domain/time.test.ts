import { describe, expect, it } from 'vitest'
import { clockHandAngles } from './time'

describe('analoge Uhrgeometrie', () => {
  it('berechnet alle 720 Minuten eines Zwölfstundenzyklus kontinuierlich', () => {
    let previous = clockHandAngles(0, 0)
    for (let total = 1; total < 720; total += 1) {
      const current = clockHandAngles(Math.floor(total / 60), total % 60)
      expect(current.minute).toBe((total % 60) * 6)
      expect(current.hour - previous.hour).toBeCloseTo(0.5)
      previous = current
    }
  })

  it.each([
    [1, 0, 30, 0],
    [1, 30, 45, 180],
    [1, 45, 52.5, 270],
    [2, 30, 75, 180]
  ] as const)('positioniert %i:%i mit Stundenwinkel %f und Minutenwinkel %f', (hour, minute, expectedHour, expectedMinute) => {
    expect(clockHandAngles(hour, minute)).toEqual({ hour: expectedHour, minute: expectedMinute })
  })

  it('weist ungültige Uhrzeiten zurück', () => {
    expect(() => clockHandAngles(1, 60)).toThrow(RangeError)
    expect(() => clockHandAngles(-1, 0)).toThrow(RangeError)
  })
})
