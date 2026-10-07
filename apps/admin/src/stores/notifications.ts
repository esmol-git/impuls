import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getToken, setTokens, getRefreshToken } from '@/api/client'
import type { NotificationLead, NotificationsPayload } from '@/api/types'
import { useToast } from '@/composables/useToast'

/** Редко и только на активной вкладке — для 1–2 админов нагрузка копеечная. */
const POLL_MS = 30_000

export const useNotificationsStore = defineStore('notifications', () => {
  const newLeads = ref(0)
  const latest = ref<NotificationLead[]>([])
  const revision = ref(0)
  const ready = ref(false)
  const toast = useToast()

  let timer: ReturnType<typeof setInterval> | null = null
  let started = false
  let etag: string | null = null
  let inFlight = false

  const badgeLabel = computed(() => {
    if (newLeads.value <= 0) return ''
    return newLeads.value > 99 ? '99+' : String(newLeads.value)
  })

  async function fetchNotifications(options: { silent?: boolean } = {}) {
    if (inFlight) return
    if (typeof document !== 'undefined' && document.hidden) return

    inFlight = true
    try {
      const headers = new Headers({ Accept: 'application/json' })
      const token = getToken()
      if (token) headers.set('Authorization', `Bearer ${token}`)
      if (etag) headers.set('If-None-Match', etag)

      let res = await fetch('/api/admin/notifications', { headers })

      if (res.status === 401 && getRefreshToken()) {
        const refreshed = await refreshAccessToken()
        if (refreshed) {
          headers.set('Authorization', `Bearer ${getToken()}`)
          res = await fetch('/api/admin/notifications', { headers })
        }
      }

      if (res.status === 304) return
      if (!res.ok) return

      const nextEtag = res.headers.get('ETag')
      if (nextEtag) etag = nextEtag

      const data = (await res.json()) as NotificationsPayload
      const prev = newLeads.value
      const wasReady = ready.value

      newLeads.value = data.newLeads
      latest.value = data.latest
      ready.value = true

      // Список заявок перезагружаем только при появлении новых, не на каждый poll
      if (wasReady && data.newLeads > prev) {
        const diff = data.newLeads - prev
        revision.value += 1
        if (!options.silent) {
          toast.info(diff === 1 ? 'Новая заявка' : `Новых заявок: ${diff}`)
        }
      }
    } catch {
      /* keep previous values while offline */
    } finally {
      inFlight = false
    }
  }

  async function refreshAccessToken() {
    const refreshToken = getRefreshToken()
    if (!refreshToken) return false
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      if (!res.ok) {
        setTokens(null, null)
        return false
      }
      const data = (await res.json()) as { accessToken: string; refreshToken: string }
      setTokens(data.accessToken, data.refreshToken)
      return true
    } catch {
      setTokens(null, null)
      return false
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
