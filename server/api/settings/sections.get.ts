type MediaType = 'CATALOG' | 'NEWS' | 'REVIEW' | 'GALLERY'

interface SectionStatus {
  key: MediaType
  enabled: boolean
  itemCount: number
  canEnable: boolean
  visible: boolean
}

/** Fail-open: при недоступности Nest не прячем пункты меню / секции */
const FAIL_OPEN: SectionStatus[] = [
  { key: 'CATALOG', enabled: true, itemCount: 1, canEnable: true, visible: true },
  { key: 'NEWS', enabled: true, itemCount: 1, canEnable: true, visible: true },
  { key: 'REVIEW', enabled: true, itemCount: 1, canEnable: true, visible: true },
  { key: 'GALLERY', enabled: true, itemCount: 1, canEnable: true, visible: true },
]

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const apiUrl = (config.apiUrl as string | undefined)?.replace(/\/$/, '')

  if (!apiUrl) {
    return FAIL_OPEN
  }

  try {
    return await $fetch<SectionStatus[]>(`${apiUrl}/api/settings/sections`, {
      // Не кэшируем ошибку надолго — иначе раздел «пропадёт» после 429
      timeout: 5_000,
    })
  } catch (error) {
    console.warn('[api/settings/sections] не удалось загрузить настройки из Nest', error)
    return FAIL_OPEN
  }
})
