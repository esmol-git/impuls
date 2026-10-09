export type HomeBlockKey =
  | 'hero'
  | 'stats'
  | 'programs'
  | 'painPoints'
  | 'audience'
  | 'childBenefits'
  | 'steps'
  | 'progression'
  | 'trainingQuality'
  | 'conditions'
  | 'ecosystem'
  | 'advantages'
  | 'video'
  | 'locations'
  | 'gallery'
  | 'catalog'
  | 'news'
  | 'reviews'
  | 'faq'
  | 'coaches'
  | 'cta'

export interface HomeBlockStatus {
  key: HomeBlockKey
  label: string
  description: string
  enabled: boolean
  sortOrder: number
  contentKey?: 'CATALOG' | 'NEWS' | 'REVIEW' | 'GALLERY'
  visible: boolean
}

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const apiUrl = (config.apiUrl as string | undefined)?.replace(/\/$/, '')

  if (!apiUrl) return []

  try {
    return await $fetch<HomeBlockStatus[]>(`${apiUrl}/api/settings/home-blocks`, {
      timeout: 5_000,
    })
  } catch (error) {
    console.warn('[api/settings/home-blocks] не удалось загрузить блоки главной из Nest', error)
    return []
  }
})
