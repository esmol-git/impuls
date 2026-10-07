export const SITE_FEATURE_KEYS = ['CART', 'FAVORITES'] as const

export type SiteFeatureKey = (typeof SITE_FEATURE_KEYS)[number]

export interface SiteFeatureDef {
  key: SiteFeatureKey
  label: string
  description: string
  defaultEnabled: boolean
}

export const SITE_FEATURE_DEFS: SiteFeatureDef[] = [
  {
    key: 'CART',
    label: 'Корзина',
    description: 'Кнопка «В корзину», иконка в шапке и оформление заявки из корзины.',
    defaultEnabled: true,
  },
  {
    key: 'FAVORITES',
    label: 'Избранное',
    description: 'Сердечко на карточках каталога (сохраняется у гостя в браузере).',
    defaultEnabled: true,
  },
]

export function isSiteFeatureKey(value: string): value is SiteFeatureKey {
  return (SITE_FEATURE_KEYS as readonly string[]).includes(value)
}
