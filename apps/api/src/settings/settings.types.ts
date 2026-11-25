import { SiteSectionKey } from '@prisma/client'
import type { HomeBlockKey } from './home-blocks'
import type { ShopFeatureKey } from './site-features'
import type { ThemeMode } from './theme'
import type { ContactsStatus } from './contacts'

export const SECTION_KEYS = [
  SiteSectionKey.CATALOG,
  SiteSectionKey.NEWS,
  SiteSectionKey.REVIEW,
  SiteSectionKey.GALLERY,
  SiteSectionKey.COACHES,
] as const

export type { SiteSectionKey, ContactsStatus }

export interface SectionStatus {
  key: SiteSectionKey
  enabled: boolean
  itemCount: number
  canEnable: boolean
  visible: boolean
}

export interface HomeBlockStatus {
  key: HomeBlockKey
  label: string
  description: string
  enabled: boolean
  sortOrder: number
  contentKey?: SiteSectionKey
  visible: boolean
}

export interface FeatureStatus {
  key: ShopFeatureKey
  label: string
  description: string
  enabled: boolean
}

export interface MaintenanceStatus {
  enabled: boolean
}

export interface ThemeStatus {
  mode: ThemeMode
}
