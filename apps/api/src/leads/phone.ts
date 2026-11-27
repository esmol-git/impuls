/** Нормализация телефона для поиска дублей: только цифры. */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return ''
  // 8XXXXXXXXXX → 7XXXXXXXXXX (РФ)
  if (digits.length === 11 && digits.startsWith('8')) {
    return `7${digits.slice(1)}`
  }
  return digits
}
