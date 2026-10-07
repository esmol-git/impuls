type MediaType = 'CATALOG' | 'NEWS' | 'REVIEW'

interface SectionStatus {
  key: MediaType
  enabled: boolean
  itemCount: number
  canEnable: boolean
  visible: boolean
}

const EMPTY: SectionStatus[] = [
  { key: 'CATALOG', enabled: false, itemCount: 0, canEnable: false, visible: false },
  { key: 'NEWS', enabled: false, itemCount: 0, canEnable: false, visible: false },
  { key: 'REVIEW', enabled: false, itemCount: 0, canEnable: false, visible: false },
]

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const apiUrl = (config.apiUrl as string | undefined)?.replace(/\/$/, '')

  if (!apiUrl) {
    return EMPTY
  }

  try {
    return await $fetch<SectionStatus[]>(`${apiUrl}/api/settings/sections`, {
      // Не кэшируем ошибку надолго — иначе раздел «пропадёт» после 429
      timeout: 5_000,
    })
  } catch (error) {
    console.warn('[api/settings/sections] не удалось загрузить настройки из Nest', error)
    return EMPTY
  }
})
