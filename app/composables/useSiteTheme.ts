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

/** Тема сайта из админки: light / dark / system. */
export function useSiteTheme() {
  const themeCookie = useCookie<ThemeMode>(THEME_COOKIE, {
    default: () => 'system',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  })

  const resolvedCookie = useCookie<'light' | 'dark'>(THEME_RESOLVED_COOKIE, {
    default: () => 'light',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  })

  const { data, refresh } = useFetch<ThemeStatus>('/api/settings/theme', {
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

  const prefersDark = ref(readPrefersDark())

  const resolved = computed<'light' | 'dark'>(() => {
    // На SSR для system берём прошлый resolved из cookie (его пишет клиент).
    if (
      import.meta.server &&
      mode.value === 'system' &&
      (resolvedCookie.value === 'dark' || resolvedCookie.value === 'light')
    ) {
      return resolvedCookie.value
    }
    return resolveThemeMode(mode.value, prefersDark.value)
  })

  const isDark = computed(() => resolved.value === 'dark')

  // Не затирать class пустой строкой — только 'dark' | undefined
  useHead({
    htmlAttrs: computed(() => ({
      lang: 'ru',
      class: isDark.value ? 'dark' : undefined,
      'data-theme': mode.value,
      style: `color-scheme:${resolved.value}`,
    })),
  })

  watch(
    [mode, resolved],
    ([m, r]) => {
      themeCookie.value = m
      resolvedCookie.value = r
      applyDom(m, r)
    },
    { immediate: true },
  )

  function bindClientListeners() {
    prefersDark.value = readPrefersDark()
    applyDom(mode.value, resolved.value)

    void refresh().then(() => {
      applyDom(mode.value, resolved.value)
    })

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onMq = () => {
      prefersDark.value = mq.matches
      applyDom(mode.value, resolveThemeMode(mode.value, mq.matches))
    }
    mq.addEventListener('change', onMq)

    const onFocus = () => {
      void refresh().then(() => applyDom(mode.value, resolved.value))
    }
    window.addEventListener('focus', onFocus)

    return () => {
      mq.removeEventListener('change', onMq)
      window.removeEventListener('focus', onFocus)
    }
  }

  if (import.meta.client) {
    const instance = getCurrentInstance()
    if (instance) {
      onMounted(() => {
        const cleanup = bindClientListeners()
        onUnmounted(cleanup)
      })
    }
    else {
      /* plugin / вне setup — без Vue lifecycle hooks */
      const nuxtApp = useNuxtApp()
      let cleanup: (() => void) | undefined
      nuxtApp.hook('app:mounted', () => {
        cleanup = bindClientListeners()
      })
      nuxtApp.hook('app:unmounted', () => {
        cleanup?.()
      })
    }
  }

  return { mode, resolved, isDark, refresh }
}
