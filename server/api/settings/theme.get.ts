import type { ThemeMode } from '../../utils/theme'

export interface ThemeStatus {
  mode: ThemeMode
}

const FALLBACK: ThemeStatus = { mode: 'system' }

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store')

  const config = useRuntimeConfig()
  const apiUrl = (config.apiUrl as string | undefined)?.replace(/\/$/, '')

  if (!apiUrl) {
    return FALLBACK
  }

  try {
    return await $fetch<ThemeStatus>(`${apiUrl}/api/settings/theme`, {
      timeout: 5_000,
    })
  } catch (error) {
    console.warn('[api/settings/theme] не удалось загрузить тему из Nest', error)
    return FALLBACK
  }
})
