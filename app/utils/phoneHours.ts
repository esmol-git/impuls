const CLOCK = /^([01]?\d|2[0-3]):([0-5]\d)$/

export function parseClockMinutes(value: string | null | undefined): number | null {
  if (!value) return null
  const match = value.trim().match(CLOCK)
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

export function formatClock(hours: number, minutes: number) {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function extractHoursRange(input: {
  from?: string | null
  to?: string | null
  text?: string | null
}): { from: string; to: string; start: number; end: number } | null {
  const from = parseClockMinutes(input.from ?? '')
  const to = parseClockMinutes(input.to ?? '')
  if (from != null && to != null && from < to) {
    return {
      from: normalizeClock(input.from!),
      to: normalizeClock(input.to!),
      start: from,
      end: to,
    }
  }

  const found = [...(input.text ?? '').matchAll(/(\d{1,2}):(\d{2})/g)]
  if (found.length >= 2) {
    const startH = Number(found[0]![1])
    const startM = Number(found[0]![2])
    const endH = Number(found[1]![1])
    const endM = Number(found[1]![2])
    const start = startH * 60 + startM
    const end = endH * 60 + endM
    if (startH <= 23 && endH <= 23 && startM <= 59 && endM <= 59 && start < end) {
      return {
        from: formatClock(startH, startM),
        to: formatClock(endH, endM),
        start,
        end,
      }
    }
  }

  return null
}

export function normalizeClock(value: string) {
  const minutes = parseClockMinutes(value)
  if (minutes == null) return value
  return formatClock(Math.floor(minutes / 60), minutes % 60)
}

export function formatPhoneHoursLabel(from: string, to: string) {
  return `Мы на связи с ${normalizeClock(from)} до ${normalizeClock(to)}`
}
