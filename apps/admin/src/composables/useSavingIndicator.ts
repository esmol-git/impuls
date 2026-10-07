import { onUnmounted, ref } from 'vue'

/** Плавный индикатор сохранения: спиннер только если запрос дольше ~200 мс */
export function useSavingIndicator() {
  const saving = ref(false)
  const showSaving = ref(false)
  let timer: ReturnType<typeof setTimeout> | null = null

  function startSaving() {
    saving.value = true
    showSaving.value = false
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      showSaving.value = true
    }, 220)
  }

  async function stopSaving() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    if (showSaving.value) {
      await new Promise((resolve) => setTimeout(resolve, 180))
    }
    showSaving.value = false
    saving.value = false
  }

  onUnmounted(() => {
    if (timer) clearTimeout(timer)
  })

  return { saving, showSaving, startSaving, stopSaving }
}
