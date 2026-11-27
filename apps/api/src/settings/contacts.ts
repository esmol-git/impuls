export const CONTACTS_SETTING_KEY = 'CONTACTS'

export interface ContactsSocials {
  vk: string
  telegram: string
  youtube: string
}

export interface ContactsStatus {
  phone: string
  phoneHours: string
  /** Часы для индикатора «на линии», формат HH:mm */
  phoneHoursFrom: string
  phoneHoursTo: string
  email: string
  socials: ContactsSocials
}

/** Стартовые значения: телефон оставляем, почту/соцсети — пустыми (показ только если заданы). */
export const CONTACTS_DEFAULT: ContactsStatus = {
  phone: '+7 (920) 130-72-40',
  phoneHours: 'Мы на связи с 10:00 до 20:00',
  phoneHoursFrom: '10:00',
  phoneHoursTo: '20:00',
  email: '',
  socials: {
    vk: '',
    telegram: '',
    youtube: '',
  },
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export function normalizeContacts(raw: unknown): ContactsStatus {
  const input = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const socialsRaw =
    input.socials && typeof input.socials === 'object'
      ? (input.socials as Record<string, unknown>)
      : {}

  const fromInput = asString(input.phoneHoursFrom)
  const toInput = asString(input.phoneHoursTo)
  const text = asString(input.phoneHours)
  const range = resolveHoursRange(fromInput, toInput, text)

  return {
    phone: asString(input.phone),
    phoneHours: range
      ? formatPhoneHoursLabel(range.from, range.to)
      : text,
    phoneHoursFrom: range?.from ?? fromInput,
    phoneHoursTo: range?.to ?? toInput,
    email: asString(input.email),
    socials: {
      vk: asString(socialsRaw.vk),
      telegram: asString(socialsRaw.telegram),
      youtube: asString(socialsRaw.youtube),
    },
  }
}

const CLOCK = /^([01]?\d|2[0-3]):([0-5]\d)$/

function parseClockMinutes(value: string): number | null {
  const match = value.trim().match(CLOCK)
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

function formatClock(hours: number, minutes: number) {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function normalizeClock(value: string) {
  const minutes = parseClockMinutes(value)
  if (minutes == null) return value
  return formatClock(Math.floor(minutes / 60), minutes % 60)
}

export function formatPhoneHoursLabel(from: string, to: string) {
  return `Мы на связи с ${normalizeClock(from)} до ${normalizeClock(to)}`
}

export function resolveHoursRange(
  from: string,
  to: string,
  text = '',
): { from: string; to: string } | null {
  const start = parseClockMinutes(from)
  const end = parseClockMinutes(to)
  if (start != null && end != null && start < end) {
    return { from: normalizeClock(from), to: normalizeClock(to) }
  }

  const found = [...text.matchAll(/(\d{1,2}):(\d{2})/g)]
  if (found.length >= 2) {
    const startH = Number(found[0]![1])
    const startM = Number(found[0]![2])
    const endH = Number(found[1]![1])
    const endM = Number(found[1]![2])
    const startMin = startH * 60 + startM
    const endMin = endH * 60 + endM
    if (startH <= 23 && endH <= 23 && startM <= 59 && endM <= 59 && startMin < endMin) {
      return {
        from: formatClock(startH, startM),
        to: formatClock(endH, endM),
      }
    }
  }

  return null
}

export function isValidHoursRange(from: string, to: string) {
  return resolveHoursRange(from, to) != null
}

export function parseContactsValue(value: string | null | undefined): ContactsStatus {
  if (!value) return { ...CONTACTS_DEFAULT, socials: { ...CONTACTS_DEFAULT.socials } }
  try {
    return normalizeContacts(JSON.parse(value))
  } catch {
    return { ...CONTACTS_DEFAULT, socials: { ...CONTACTS_DEFAULT.socials } }
  }
}
