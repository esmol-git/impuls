import { onUnmounted, ref } from 'vue'

/**
 * Debounced search input → committed `search` string (trimmed).
 * Views watch `search` / reset page themselves.
 */
export function useDebouncedSearch(delayMs = 300) {
  const searchInput = ref('')
  const search = ref('')
  let timer: ReturnType<typeof setTimeout> | null = null

  function onSearchInput(value: string) {
    searchInput.value = value
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      const next = value.trim()
      if (next === search.value) return
      search.value = next
    }, delayMs)
  }

  function clearSearch() {
    searchInput.value = ''
    if (timer) clearTimeout(timer)
    if (!search.value) return
    search.value = ''
  }

  function resetSearch() {
    searchInput.value = ''
    if (timer) clearTimeout(timer)
    search.value = ''
  }

  onUnmounted(() => {
    if (timer) clearTimeout(timer)
  })

  return {
    searchInput,
    search,
    onSearchInput,
    clearSearch,
    resetSearch,
  }
}
