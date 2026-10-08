import { onMounted, ref, watch } from 'vue'
import { useMediaQuery } from '@/composables/useMediaQuery'

const STORAGE_KEY = 'admin-sidebar-collapsed'

const collapsed = ref(false)
let initialized = false

export function useSidebarCollapsed() {
  const isNarrow = useMediaQuery('(max-width: 1279px)')

  onMounted(() => {
    if (initialized) return
    initialized = true

    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === '1' || saved === '0') {
      collapsed.value = saved === '1'
    } else {
      collapsed.value = isNarrow.value
    }

    watch(isNarrow, (narrow) => {
      if (localStorage.getItem(STORAGE_KEY) != null) return
      collapsed.value = narrow
    })
  })

  function toggleCollapsed() {
    collapsed.value = !collapsed.value
    localStorage.setItem(STORAGE_KEY, collapsed.value ? '1' : '0')
  }

  return { collapsed, toggleCollapsed }
}
