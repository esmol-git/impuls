import { computed, onMounted, onUnmounted, ref } from 'vue'
import { site } from '~/data/site'

/**
 * Статус «на линии» только после mount — иначе SSR/клиент
 * могут разойтись по минутам и дать hydration mismatch.
 */
export function useBusinessHours() {
  const isOpen = ref(false)
  const ready = ref(false)
  let intervalId: ReturnType<typeof setInterval> | undefined

  function update() {
    const now = new Date()
    const minutes = now.getHours() * 60 + now.getMinutes()
    const start = site.phoneHoursStart * 60
    const end = site.phoneHoursEnd * 60
    isOpen.value = minutes >= start && minutes < end
    ready.value = true
  }

  onMounted(() => {
    update()
    intervalId = setInterval(update, 60_000)
  })

  onUnmounted(() => {
    if (intervalId !== undefined) clearInterval(intervalId)
  })

  const statusText = computed(() => {
    if (!ready.value) return 'Проверка времени приёма'
    return isOpen.value ? 'Сейчас на связи' : 'Вне часов приёма'
  })

  return { isOpen, ready, statusText }
}
