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

const LEAD_SOURCE_LABELS: Record<string, string> = {
  hero: 'Герой',
  header: 'Шапка',
  'header-mobile': 'Шапка (моб.)',
  'sticky-mobile': 'Нижняя кнопка',
  'exit-intent': 'При уходе',
  steps: 'Шаги записи',
  'pain-points': 'Блок «боли»',
  ecosystem: 'Экосистема',
  'program-card': 'Карточка программы',
  'program-level': 'Уровень программы',
  programs: 'Программы',
  'programs-section': 'Программы (главная)',
  'programs-page': 'Страница программ',
  'programs-page-bottom': 'Низ страницы программ',
  'cta-section': 'Блок CTA',
  'home-bottom': 'Низ главной',
  'about-bottom': 'Низ «О школе»',
  'coaches-bottom': 'Низ «Тренеры»',
  'catalog-page-bottom': 'Низ каталога',
  'gallery-page-bottom': 'Низ галереи',
  location: 'Филиал',
  'location-preview': 'Филиалы (превью)',
  'contacts-location': 'Контакты · филиал',
  'contacts-page': 'Страница контактов',
  catalog: 'Каталог',
  cart: 'Корзина',
  favorites: 'Избранное',
}

/** Человекочитаемый источник заявки для админки */
export function leadSourceLabel(source?: string | null) {
  if (!source) return '—'
  const known = LEAD_SOURCE_LABELS[source]
  if (known) return known

  if (source.endsWith('-details')) {
    const base = source.slice(0, -'-details'.length)
    const baseLabel = LEAD_SOURCE_LABELS[base] || base
    return `${baseLabel} · подробнее`
  }

  return source
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
