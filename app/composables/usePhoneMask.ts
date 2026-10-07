/** Строго: +7 (999) 999-99-99 — только цифры */
export function formatPhoneInput(value: string): string {
  let digits = value.replace(/\D/g, '')

  if (digits.startsWith('8')) digits = `7${digits.slice(1)}`
  if (!digits.startsWith('7')) digits = `7${digits}`
  digits = digits.slice(0, 11)

  const local = digits.slice(1)
  let result = '+7'
  if (!local.length) return result

  result += ` (${local.slice(0, 3)}`
  if (local.length <= 3) return result

  result += `) ${local.slice(3, 6)}`
  if (local.length <= 6) return result

  result += `-${local.slice(6, 8)}`
  if (local.length <= 8) return result

  return `${result}-${local.slice(8, 10)}`
}

export function phoneDigits(value: string): string {
  return value.replace(/\D/g, '')
}

export function isValidRuPhone(value: string): boolean {
  const digits = phoneDigits(value)
  return digits.length === 11 && digits.startsWith('7')
}

export function onPhoneKeydown(event: KeyboardEvent) {
  if (event.ctrlKey || event.metaKey || event.altKey) return
  const allowed = [
    'Backspace',
    'Delete',
    'Tab',
    'Escape',
    'Enter',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Home',
    'End',
  ]
  if (allowed.includes(event.key)) return
  if (!/^\d$/.test(event.key)) {
    event.preventDefault()
  }
}
