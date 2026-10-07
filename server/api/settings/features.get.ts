import type { FeatureStatus } from '../../utils/site-features'

const FALLBACK: FeatureStatus[] = [
  {
    key: 'CART',
    label: 'Корзина',
    description: 'Кнопка «В корзину», иконка в шапке и оформление заявки из корзины.',
    enabled: true,
  },
  {
    key: 'FAVORITES',
    label: 'Избранное',
    description: 'Сердечко на карточках каталога (сохраняется у гостя в браузере).',
    enabled: true,
  },
]

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const apiUrl = (config.apiUrl as string | undefined)?.replace(/\/$/, '')

  if (!apiUrl) {
    return FALLBACK
  }

  try {
    return await $fetch<FeatureStatus[]>(`${apiUrl}/api/settings/features`, {
      timeout: 5_000,
    })
  } catch (error) {
    console.warn('[api/settings/features] не удалось загрузить настройки из Nest', error)
    return FALLBACK
  }
})
