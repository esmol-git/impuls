export const CONTACTS_SETTING_KEY = 'CONTACTS'

export interface ContactsSocials {
  vk: string
  telegram: string
  youtube: string
}

export interface ContactsStatus {
  phone: string
  phoneHours: string
  email: string
  socials: ContactsSocials
}

/** Стартовые значения: телефон оставляем, почту/соцсети — пустыми (показ только если заданы). */
export const CONTACTS_DEFAULT: ContactsStatus = {
  phone: '+7 (920) 130-72-40',
  phoneHours: 'Мы на связи с 10:00 до 20:00',
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

  return {
    phone: asString(input.phone),
    phoneHours: asString(input.phoneHours),
    email: asString(input.email),
    socials: {
      vk: asString(socialsRaw.vk),
      telegram: asString(socialsRaw.telegram),
      youtube: asString(socialsRaw.youtube),
    },
  }
}

export function parseContactsValue(value: string | null | undefined): ContactsStatus {
  if (!value) return { ...CONTACTS_DEFAULT, socials: { ...CONTACTS_DEFAULT.socials } }
  try {
    return normalizeContacts(JSON.parse(value))
  } catch {
    return { ...CONTACTS_DEFAULT, socials: { ...CONTACTS_DEFAULT.socials } }
  }
}
