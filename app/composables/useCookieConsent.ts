const STORAGE_KEY = 'cookie-consent'

/** Общий флаг баннера cookies — sticky CTA / scroll-top не перекрывают. */
export function useCookieConsent() {
  const visible = useState('cookie-banner-visible', () => false)

  function syncFromStorage() {
    if (!import.meta.client) return
    visible.value = !localStorage.getItem(STORAGE_KEY)
  }

  function accept() {
    if (import.meta.client) localStorage.setItem(STORAGE_KEY, '1')
    visible.value = false
  }

  return { visible, syncFromStorage, accept }
}
