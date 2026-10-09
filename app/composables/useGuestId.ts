const GUEST_KEY = 'impuls-guest-token'

function createToken() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `g_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

/** Стабильный анонимный id гостя (корзина, избранное, будущие заказы). */
export function useGuestId() {
  const token = useState<string>('guest-token', () => '')

  function ensure() {
    if (!import.meta.client) return token.value
    if (token.value) return token.value

    try {
      const stored = localStorage.getItem(GUEST_KEY)
      if (stored) {
        token.value = stored
        return stored
      }
    } catch {
      // private mode
    }

    const next = createToken()
    token.value = next
    try {
      localStorage.setItem(GUEST_KEY, next)
    } catch {
      // ignore
    }
    return next
  }

  return { token, ensure }
}
