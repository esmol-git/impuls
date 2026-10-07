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
