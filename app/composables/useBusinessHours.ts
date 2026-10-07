import { computed, onMounted, onUnmounted, ref } from 'vue'
import { site } from '~/data/site'

export function useBusinessHours() {
  const isOpen = ref<boolean | null>(null)
  let intervalId: ReturnType<typeof setInterval> | undefined

  function update() {
    const now = new Date()
    const minutes = now.getHours() * 60 + now.getMinutes()
    const start = site.phoneHoursStart * 60
    const end = site.phoneHoursEnd * 60
    isOpen.value = minutes >= start && minutes < end
  }

  onMounted(() => {
    update()
    intervalId = setInterval(update, 60_000)
  })

  onUnmounted(() => {
    if (intervalId !== undefined) clearInterval(intervalId)
  })

  const statusText = computed(() => {
    if (isOpen.value === null) return site.phoneHours
    return isOpen.value ? 'Сейчас на связи' : 'Вне часов приёма'
  })

  return { isOpen, statusText }
}
