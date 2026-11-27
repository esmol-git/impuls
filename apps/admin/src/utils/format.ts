import type { LeadAssignee, LeadStatus } from '@/api/types'

export function formatDateTime(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDate(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function roleLabel(role: string) {
  if (role === 'SUPERADMIN') return 'Суперадмин'
  if (role === 'ADMIN') return 'Админ'
  if (role === 'MANAGER') return 'Менеджер'
  return role
}

/** Группы источников для менеджера */
export type LeadSourceGroup =
  | 'shop'
  | 'nav'
  | 'home'
  | 'programs'
  | 'contacts'
  | 'pages'
  | 'other'

export interface LeadSourceInfo {
  group: LeadSourceGroup
  groupLabel: string
  label: string
}

const LEAD_SOURCE_GROUP_LABELS: Record<LeadSourceGroup, string> = {
  shop: 'Магазин',
  nav: 'Навигация',
  home: 'Главная',
  programs: 'Программы',
  contacts: 'Контакты',
  pages: 'Страницы сайта',
  other: 'Прочее',
}

const LEAD_SOURCES: Record<string, { group: LeadSourceGroup; label: string }> = {
  // Магазин
  cart: { group: 'shop', label: 'Корзина · оформление' },
  favorites: { group: 'shop', label: 'Избранное' },
  catalog: { group: 'shop', label: 'Карточка товара' },
  'catalog-page-bottom': { group: 'shop', label: 'Низ страницы каталога' },

  // Навигация
  header: { group: 'nav', label: 'Кнопка в шапке' },
  'header-mobile': { group: 'nav', label: 'Кнопка в шапке · телефон' },
  'sticky-mobile': { group: 'nav', label: 'Нижняя кнопка на телефоне' },

  // Главная
  hero: { group: 'home', label: 'Первый экран' },
  steps: { group: 'home', label: 'Блок «Как записаться»' },
  'pain-points': { group: 'home', label: 'Блок проблем родителей' },
  ecosystem: { group: 'home', label: 'Блок экосистемы' },
  'programs-section': { group: 'home', label: 'Программы на главной' },
  'cta-section': { group: 'home', label: 'Призыв к записи' },
  'home-bottom': { group: 'home', label: 'Низ главной' },
  'exit-intent': { group: 'home', label: 'Окно при уходе с сайта' },

  // Программы
  programs: { group: 'programs', label: 'Список программ' },
  'programs-page': { group: 'programs', label: 'Страница программ' },
  'programs-page-bottom': { group: 'programs', label: 'Низ страницы программ' },
  'program-card': { group: 'programs', label: 'Карточка программы' },
  'program-level': { group: 'programs', label: 'Уровень программы' },

  // Контакты / филиалы
  'contacts-page': { group: 'contacts', label: 'Форма на странице контактов' },
  'contacts-map': { group: 'contacts', label: 'Карта на странице контактов' },
  'contacts-location': { group: 'contacts', label: 'Филиал на странице контактов' },
  map: { group: 'contacts', label: 'Карта филиалов' },
  location: { group: 'contacts', label: 'Карточка филиала' },
  'location-preview': { group: 'contacts', label: 'Превью филиалов' },

  // Другие страницы
  'about-bottom': { group: 'pages', label: 'Низ «О школе»' },
  'coaches-bottom': { group: 'pages', label: 'Низ «Тренеры»' },
  'gallery-page-bottom': { group: 'pages', label: 'Низ галереи' },

  // Служебные
  curl: { group: 'other', label: 'Тестовая заявка (API)' },
  debug: { group: 'other', label: 'Отладка' },
}

export const LEAD_STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'NEW', label: 'Новая' },
  { value: 'IN_PROGRESS', label: 'В работе' },
  { value: 'PROCESSED', label: 'Обработана' },
  { value: 'TRIAL', label: 'Пробное' },
  { value: 'ENROLLED', label: 'Записан' },
  { value: 'LOST', label: 'Отказ' },
  { value: 'DONE', label: 'Завершена' },
]

export const LEAD_LOST_REASONS = [
  'Не дозвонились',
  'Передумал',
  'Выбрал другую школу',
  'Не подходит расписание',
  'Дорого',
  'Возраст / группа',
  'Спам / ошибка',
  'Другое',
] as const

export function leadStatusLabel(status: LeadStatus) {
  return LEAD_STATUS_OPTIONS.find((item) => item.value === status)?.label ?? status
}

export function leadStatusTagType(status: LeadStatus): 'warning' | 'primary' | 'success' | 'info' | 'danger' {
  if (status === 'NEW') return 'warning'
  if (status === 'IN_PROGRESS') return 'primary'
  if (status === 'PROCESSED' || status === 'TRIAL') return 'success'
  if (status === 'ENROLLED') return 'success'
  if (status === 'LOST') return 'danger'
  return 'info'
}

export function isCallbackOverdue(nextContactAt?: string | null) {
  if (!nextContactAt) return false
  const day = new Date()
  day.setHours(0, 0, 0, 0)
  return new Date(nextContactAt).getTime() < day.getTime()
}

export function isCallbackToday(nextContactAt?: string | null) {
  if (!nextContactAt) return false
  const value = new Date(nextContactAt)
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  const t = value.getTime()
  return t >= start.getTime() && t <= end.getTime()
}

export function assigneeLabel(user?: LeadAssignee | null) {
  if (!user) return '—'
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  return name || user.email
}

export function leadSourceInfo(source?: string | null): LeadSourceInfo {
  if (!source) {
    return {
      group: 'other',
      groupLabel: LEAD_SOURCE_GROUP_LABELS.other,
      label: 'Не указан',
    }
  }

  const known = LEAD_SOURCES[source]
  if (known) {
    return {
      group: known.group,
      groupLabel: LEAD_SOURCE_GROUP_LABELS[known.group],
      label: known.label,
    }
  }

  if (source.endsWith('-details')) {
    const base = source.slice(0, -'-details'.length)
    const baseInfo = leadSourceInfo(base)
    return {
      ...baseInfo,
      label: `${baseInfo.label} · подробнее`,
    }
  }

  return {
    group: 'other',
    groupLabel: LEAD_SOURCE_GROUP_LABELS.other,
    label: source,
  }
}

/** Короткая подпись: «Магазин · Корзина · оформление» */
export function leadSourceLabel(source?: string | null) {
  const info = leadSourceInfo(source)
  if (!source) return '—'
  return `${info.groupLabel} · ${info.label}`
}

/** Дата рождения (YYYY-MM-DD) или старый свободный текст возраста */
export function leadAgeLabel(value?: string | null) {
  if (!value) return '—'
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (match) return `${match[3]}.${match[2]}.${match[1]}`
  return value
}

/** Склонение: 1 год, 2 года, 5 лет */
export function yearsWord(years: number) {
  const n = Math.abs(Math.trunc(years)) % 100
  const last = n % 10
  if (n > 10 && n < 20) return 'лет'
  if (last === 1) return 'год'
  if (last >= 2 && last <= 4) return 'года'
  return 'лет'
}

export function formatYears(years: number) {
  return `${Math.trunc(years)} ${yearsWord(years)}`
}

/** Достаёт число лет из «12 лет» / «1 год» / «12» */
export function parseYears(value?: string | null) {
  if (!value) return null
  const match = value.trim().match(/^(\d+)/)
  if (!match) return null
  const years = Number(match[1])
  return Number.isFinite(years) ? years : null
}
