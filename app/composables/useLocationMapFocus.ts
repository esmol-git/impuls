/**
 * Общий фокус площадки: карточка ↔ карта.
 */
export function useLocationMapFocus(key = 'location-map-focus') {
  const focusId = useState<string | null>(key, () => null)

  async function select(id: string) {
    /* повторный выбор той же площадки — сбрасываем, чтобы карта снова сфокусировалась */
    if (focusId.value === id) {
      focusId.value = null
      await nextTick()
    }
    focusId.value = id
  }

  function clear() {
    focusId.value = null
  }

  return { focusId, select, clear }
}
