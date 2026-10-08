import { ref } from 'vue'

/** Mini-режим отключён — сайдбар всегда развёрнут. */
const collapsed = ref(false)

export function useSidebarCollapsed() {
  return {
    collapsed,
    toggleCollapsed() {
      /* no-op: переключатель убран из UI */
    },
  }
}
