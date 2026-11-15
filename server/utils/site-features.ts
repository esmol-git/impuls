export type SiteFeatureKey = 'CART' | 'FAVORITES' | 'SECTION_EDGES'

export interface FeatureStatus {
  key: SiteFeatureKey
  label: string
  description: string
  enabled: boolean
}
