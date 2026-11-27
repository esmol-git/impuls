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
}): { from: string; to: string } | null {
  const start = parseClockMinutes(input.from ?? '')
  const end = parseClockMinutes(input.to ?? '')
  if (start != null && end != null && start < end) {
    return { from: padClock(input.from!), to: padClock(input.to!) }
  }

  const found = [...(input.text ?? '').matchAll(/(\d{1,2}):(\d{2})/g)]
  if (found.length >= 2) {
    const startH = Number(found[0]![1])
    const startM = Number(found[0]![2])
    const endH = Number(found[1]![1])
    const endM = Number(found[1]![2])
    if (startH <= 23 && endH <= 23 && startM <= 59 && endM <= 59 && startH * 60 + startM < endH * 60 + endM) {
      return {
        from: formatClock(startH, startM),
        to: formatClock(endH, endM),
      }
    }
  }
  return null
}

function padClock(value: string) {
  const minutes = parseClockMinutes(value)
  if (minutes == null) return value
  return formatClock(Math.floor(minutes / 60), minutes % 60)
}

export function formatPhoneHoursLabel(from: string, to: string) {
  return `Мы на связи с ${padClock(from)} до ${padClock(to)}`
}

export function hoursRangeError(from: string, to: string) {
  if (!from && !to) return ''
  if (!from || !to) return 'Укажите оба времени'
  if (parseClockMinutes(from) == null || parseClockMinutes(to) == null) {
    return 'Формат ЧЧ:ММ'
  }
  if (!extractHoursRange({ from, to })) {
    return 'Время «до» должно быть позже «с»'
  }
  return ''
}
