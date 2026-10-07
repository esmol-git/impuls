import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

export function useScrollProgress() {
  const progress = ref(0)
  const route = useRoute()

  function update() {
    if (!import.meta.client) return

    const max = document.documentElement.scrollHeight - window.innerHeight
    progress.value = max > 0
      ? Math.min(100, Math.max(0, (window.scrollY / max) * 100))
      : 0
  }

  watch(() => route.path, () => {
    nextTick(update)
  })

  onMounted(() => {
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    update()
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', update)
    window.removeEventListener('resize', update)
  })

  return { progress }
}
