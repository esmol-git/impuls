export type SiteFeatureKey = 'CART' | 'FAVORITES'

export interface FeatureStatus {
  key: SiteFeatureKey
  label: string
  description: string
  enabled: boolean
}

/** Флаги функций сайта из админки (корзина, избранное). */
export function useSiteFeatures() {
  const { data } = useFetch<FeatureStatus[]>('/api/settings/features', {
    key: 'site-features',
    default: () => [
      {
        key: 'CART',
        label: 'Корзина',
        description: '',
        enabled: true,
      },
      {
        key: 'FAVORITES',
        label: 'Избранное',
        description: '',
        enabled: true,
      },
    ],
  })

  const enabled = computed(() => {
    const map = Object.fromEntries((data.value || []).map((row) => [row.key, row.enabled]))
    return {
      cart: map.CART !== false,
      favorites: map.FAVORITES !== false,
    }
  })

  return { features: data, enabled }
}
