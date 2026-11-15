export const SITE_FEATURE_KEYS = ['CART', 'FAVORITES', 'SECTION_EDGES', 'MAINTENANCE'] as const

export type SiteFeatureKey = (typeof SITE_FEATURE_KEYS)[number]

/** Публичные переключаемые функции (не maintenance). */
export type ShopFeatureKey = Exclude<SiteFeatureKey, 'MAINTENANCE'>

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
  {
    key: 'SECTION_EDGES',
    label: 'Волны и скосы',
    description: 'Плавные переходы (волна / скос) между блоками на главной. На мобильных всегда выключены.',
    defaultEnabled: true,
  },
  {
    key: 'MAINTENANCE',
    label: 'Режим обслуживания',
    description: 'Публичный сайт показывает заглушку вместо обычных страниц.',
    defaultEnabled: false,
  },
]

export const SHOP_FEATURE_DEFS = SITE_FEATURE_DEFS.filter(
  (def): def is SiteFeatureDef & { key: ShopFeatureKey } => def.key !== 'MAINTENANCE',
)

export function isSiteFeatureKey(value: string): value is SiteFeatureKey {
  return (SITE_FEATURE_KEYS as readonly string[]).includes(value)
}

export function isShopFeatureKey(value: string): value is ShopFeatureKey {
  return value === 'CART' || value === 'FAVORITES' || value === 'SECTION_EDGES'
}
