export interface ClockHandAngles {
  hour: number
  minute: number
}

export function clockHandAngles(hour: number, minute: number): ClockHandAngles {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23 || !Number.isInteger(minute) || minute < 0 || minute > 59) {
    throw new RangeError('Uhrzeiger brauchen eine gültige Stunde und Minute.')
  }
  return {
    minute: minute * 6,
    hour: (hour % 12) * 30 + minute * 0.5
  }
}
