import { computed, onMounted, onUnmounted, ref, toValue, type MaybeRefOrGetter } from 'vue'
import { site } from '~/data/site'
import { extractHoursRange } from '~/utils/phoneHours'

/**
 * Статус «на линии» только после mount — иначе SSR/клиент
 * могут разойтись по минутам и дать hydration mismatch.
 */
export function useBusinessHours(source?: {
  from?: MaybeRefOrGetter<string>
  to?: MaybeRefOrGetter<string>
  text?: MaybeRefOrGetter<string>
}) {
  const isOpen = ref(false)
  const ready = ref(false)
  let intervalId: ReturnType<typeof setInterval> | undefined

  function minutesNow() {
    const now = new Date()
    return now.getHours() * 60 + now.getMinutes()
  }

  function bounds() {
    const parsed = extractHoursRange({
      from: toValue(source?.from) || '',
      to: toValue(source?.to) || '',
      text: toValue(source?.text) || '',
    })
    return {
      start: parsed?.start ?? site.phoneHoursStart * 60,
      end: parsed?.end ?? site.phoneHoursEnd * 60,
    }
  }

  function update() {
    const { start, end } = bounds()
    const minutes = minutesNow()
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
