export type SiteFeatureKey = 'CART' | 'FAVORITES'

export interface FeatureStatus {
  key: SiteFeatureKey
  label: string
  description: string
  enabled: boolean
}
