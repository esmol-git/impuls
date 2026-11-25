import { getCurrentInstance, onMounted, onUnmounted } from 'vue'
import {
  isThemeMode,
  resolveThemeMode,
  type ThemeMode,
} from '~/utils/theme'
import { THEME_COOKIE, THEME_RESOLVED_COOKIE } from '~/utils/themeCookie'

interface ThemeStatus {
  mode: ThemeMode
}

function readPrefersDark(): boolean {
  if (!import.meta.client) return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function writeCookies(mode: ThemeMode, resolved: 'light' | 'dark') {
  if (!import.meta.client) return
  const maxAge = 60 * 60 * 24 * 365
  document.cookie = `${THEME_COOKIE}=${encodeURIComponent(mode)}; path=/; max-age=${maxAge}; SameSite=Lax`
  document.cookie = `${THEME_RESOLVED_COOKIE}=${resolved}; path=/; max-age=${maxAge}; SameSite=Lax`
}

function applyDom(mode: ThemeMode, resolved: 'light' | 'dark') {
  if (!import.meta.client) return
  const root = document.documentElement
  root.classList.toggle('dark', resolved === 'dark')
  if (resolved !== 'dark') root.classList.remove('dark')
  root.dataset.theme = mode
  root.style.colorScheme = resolved
  writeCookies(mode, resolved)
}

function cookieResolved(
  mode: ThemeMode,
  resolvedCookie: string | null | undefined,
): 'light' | 'dark' {
  if (mode === 'dark') return 'dark'
  if (mode === 'light') return 'light'
  return resolvedCookie === 'dark' ? 'dark' : 'light'
}

/** Тема сайта из админки: light / dark / system. */
export async function useSiteTheme() {
  // readonly: не шлём Set-Cookie на SSR. Запись — document.cookie в applyDom после mount.
  const themeCookie = useCookie<ThemeMode>(THEME_COOKIE, {
    default: () => 'system',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    readonly: true,
  })

  const resolvedCookie = useCookie<'light' | 'dark'>(THEME_RESOLVED_COOKIE, {
    default: () => 'light',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    readonly: true,
  })

  const { data, refresh, status } = await useFetch<ThemeStatus>('/api/settings/theme', {
    key: 'site-theme',
    default: () => ({
      mode: isThemeMode(String(themeCookie.value))
        ? themeCookie.value
        : ('system' as ThemeMode),
    }),
    transform: (row) => ({
      mode: isThemeMode(row?.mode) ? row.mode : ('system' as ThemeMode),
    }),
  })

  const mode = computed<ThemeMode>(() => data.value?.mode ?? 'system')

  /** До mount не трогаем matchMedia — иначе SSR/клиент разъедутся. */
  const readyForSystem = ref(false)
  const prefersDark = ref(false)

  const resolved = computed<'light' | 'dark'>(() => {
    if (mode.value !== 'system') {
      return mode.value
    }
    if (!readyForSystem.value) {
      return cookieResolved('system', resolvedCookie.value)
    }
    return resolveThemeMode('system', prefersDark.value)
  })

  const isDark = computed(() => resolved.value === 'dark')

  // Не трогаем htmlAttrs через useHead: theme-boot.js уже выставил class/data-theme
  // до Vue, а useHead с class="" / data-theme=light даёт hydration mismatch.

  function syncFromOs() {
    prefersDark.value = readPrefersDark()
    applyDom(mode.value, resolveThemeMode(mode.value, prefersDark.value))
  }

  function bindClientListeners() {
    readyForSystem.value = true
    syncFromOs()

    if (status.value === 'pending' || status.value === 'idle') {
      void refresh().then(() => applyDom(mode.value, resolved.value))
    }

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onMq = () => {
      prefersDark.value = mq.matches
      applyDom(mode.value, resolveThemeMode(mode.value, mq.matches))
    }
    mq.addEventListener('change', onMq)

    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return
      void refresh().then(() => applyDom(mode.value, resolved.value))
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      mq.removeEventListener('change', onMq)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }

  watch(mode, (m) => {
    if (!import.meta.client || !readyForSystem.value) return
    applyDom(m, resolveThemeMode(m, prefersDark.value))
  })

  if (import.meta.client) {
    const instance = getCurrentInstance()
    if (instance) {
      onMounted(() => {
        const cleanup = bindClientListeners()
        onUnmounted(cleanup)
      })
    }
    else {
      const nuxtApp = useNuxtApp()
      let cleanup: (() => void) | undefined
      nuxtApp.hook('app:mounted', () => {
        cleanup?.()
        cleanup = bindClientListeners()
      })
      if (import.meta.client) {
        window.addEventListener('pagehide', () => cleanup?.(), { once: true })
      }
    }
  }

  return { mode, resolved, isDark, refresh }
}
