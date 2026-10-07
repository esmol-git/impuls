import type { Ref } from 'vue'
import { onUnmounted, watch } from 'vue'
import { lockBodyScroll, unlockBodyScroll } from '~/utils/scrollLock'

export function useBodyScrollLock(locked: Ref<boolean>) {
  watch(locked, (val) => {
    if (!import.meta.client) return
    if (val) lockBodyScroll()
    else unlockBodyScroll()
  }, { immediate: true })

  onUnmounted(() => {
    if (import.meta.client) unlockBodyScroll()
  })
}
