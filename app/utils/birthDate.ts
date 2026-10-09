/** Допустимый возраст ребёнка в заявке */
export const CHILD_AGE_MIN = 3
export const CHILD_AGE_MAX = 17

export function toIsoDate(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Границы date-input: ребёнку от 3 до 17 лет включительно */
export function childBirthDateBounds(today = new Date()) {
  const max = new Date(today.getFullYear() - CHILD_AGE_MIN, today.getMonth(), today.getDate())
  const min = new Date(today.getFullYear() - CHILD_AGE_MAX, today.getMonth(), today.getDate())
  return {
    min: toIsoDate(min),
    max: toIsoDate(max),
  }
}

export function isValidChildBirthDate(value: string, today = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const { min, max } = childBirthDateBounds(today)
  return value >= min && value <= max
}

/** YYYY-MM-DD → ДД.ММ.ГГГГ */
export function formatBirthDateRu(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return value
  return `${match[3]}.${match[2]}.${match[1]}`
}
