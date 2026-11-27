import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { apiFetch } from '@/api/client'
import type { NotificationLead, NotificationsPayload } from '@/api/types'
import { useToast } from '@/composables/useToast'

/** Редко и только на активной вкладке — для 1–2 админов нагрузка копеечная. */
const POLL_MS = 30_000

function playNudge() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.value = 0.04
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18)
    osc.stop(ctx.currentTime + 0.2)
    void ctx.close()
  } catch {
    /* ignore */
  }
}

export const useNotificationsStore = defineStore('notifications', () => {
  const newLeads = ref(0)
  const callbacksToday = ref(0)
  const callbacksOverdue = ref(0)
  const dueNow = ref(0)
  const latest = ref<NotificationLead[]>([])
  const revision = ref(0)
  const ready = ref(false)
  const toast = useToast()

  let timer: ReturnType<typeof setInterval> | null = null
  let started = false
  let etag: string | null = null
  let inFlight = false

  const badgeLabel = computed(() => {
    const total = newLeads.value + callbacksOverdue.value + dueNow.value
    if (total <= 0) return ''
    return total > 99 ? '99+' : String(total)
  })

  async function fetchNotifications(options: { silent?: boolean } = {}) {
    if (inFlight) return
    if (typeof document !== 'undefined' && document.hidden) return

    inFlight = true
    try {
      const headers = new Headers({ Accept: 'application/json' })
      if (etag) headers.set('If-None-Match', etag)

      const res = await apiFetch('/api/admin/notifications', { headers })

      if (res.status === 304) return
      if (!res.ok) return

      const nextEtag = res.headers.get('ETag')
      if (nextEtag) etag = nextEtag

      const data = (await res.json()) as NotificationsPayload
      const prevNew = newLeads.value
      const prevOverdue = callbacksOverdue.value
      const prevDue = dueNow.value
      const wasReady = ready.value

      newLeads.value = data.newLeads
      callbacksToday.value = data.callbacksToday ?? 0
      callbacksOverdue.value = data.callbacksOverdue ?? 0
      dueNow.value = data.dueNow ?? 0
      latest.value = data.latest
      ready.value = true

      if (wasReady && data.newLeads > prevNew) {
        const diff = data.newLeads - prevNew
        revision.value += 1
        if (!options.silent) {
          toast.info(diff === 1 ? 'Новая заявка' : `Новых заявок: ${diff}`)
        }
      }

      if (wasReady && !options.silent) {
        if (callbacksOverdue.value > prevOverdue) {
          toast.warning(
            callbacksOverdue.value === 1
              ? 'Есть просроченный перезвон'
              : `Просроченных перезвонов: ${callbacksOverdue.value}`,
          )
          playNudge()
        } else if (dueNow.value > prevDue) {
          toast.warning(
            dueNow.value === 1
              ? 'Подошло время перезвона'
              : `Пора перезвонить: ${dueNow.value}`,
          )
          playNudge()
        }
      }
    } catch {
      /* offline или сессия истекла (authFailureHandler уже отработал) */
    } finally {
      inFlight = false
    }
  }

  function clearTimer() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  function schedule() {
    clearTimer()
    if (!started || document.hidden) return
    timer = setInterval(() => {
      void fetchNotifications()
    }, POLL_MS)
  }

  function onVisibility() {
    if (document.hidden) {
      clearTimer()
      return
    }
    void fetchNotifications({ silent: true })
    schedule()
  }

  function start() {
    if (started) return
    started = true
    void fetchNotifications({ silent: true })
    schedule()
    document.addEventListener('visibilitychange', onVisibility)
  }

  function stop() {
    started = false
    clearTimer()
    document.removeEventListener('visibilitychange', onVisibility)
  }

  async function refresh() {
    etag = null
    await fetchNotifications({ silent: true })
  }

  return {
    newLeads,
    callbacksToday,
    callbacksOverdue,
    dueNow,
    latest,
    revision,
    ready,
    badgeLabel,
    start,
    stop,
    refresh,
    fetchNotifications,
  }
})
