import { Injectable } from '@nestjs/common'
import { MediaType } from '@prisma/client'
import type { ThemeMode } from './theme'
import type { ContactsStatus } from './contacts'
import { SettingsAppearanceService } from './settings-appearance.service'
import { SettingsFeaturesService } from './settings-features.service'
import { SettingsHomeService } from './settings-home.service'
import { SettingsSectionsService } from './settings-sections.service'

export type {
  SectionStatus,
  HomeBlockStatus,
  FeatureStatus,
  MaintenanceStatus,
  ThemeStatus,
  ContactsStatus,
  SiteSectionKey,
} from './settings.types'

/**
 * Facade over settings domain services (sections / home / features / appearance).
 */
@Injectable()
export class SettingsService {
  constructor(
    private readonly sections: SettingsSectionsService,
    private readonly home: SettingsHomeService,
    private readonly features: SettingsFeaturesService,
    private readonly appearance: SettingsAppearanceService,
  ) {}

  async ensureDefaults() {
    await this.sections.ensureSectionDefaults()
    await this.home.ensureHomeBlockDefaults()
    await this.features.ensureFeatureDefaults()
    await this.appearance.ensureThemeDefault()
  }

  listSections() {
    return this.sections.listSections()
  }

  getSectionMap() {
    return this.sections.getSectionMap()
  }

  setEnabled(key: string, enabled: boolean) {
    return this.sections.setEnabled(key, enabled)
  }

  syncAfterMediaChange(type: MediaType) {
    return this.sections.syncAfterMediaChange(type)
  }

  syncAfterCoachChange() {
    return this.sections.syncAfterCoachChange()
  }

  listHomeBlocks() {
    return this.home.listHomeBlocks()
  }

  setHomeBlockEnabled(key: string, enabled: boolean) {
    return this.home.setHomeBlockEnabled(key, enabled)
  }

  reorderHomeBlocks(keys: string[]) {
    return this.home.reorderHomeBlocks(keys)
  }

  listFeatures() {
    return this.features.listFeatures()
  }

  setFeatureEnabled(key: string, enabled: boolean) {
    return this.features.setFeatureEnabled(key, enabled)
  }

  getMaintenance() {
    return this.features.getMaintenance()
  }

  setMaintenance(enabled: boolean) {
    return this.features.setMaintenance(enabled)
  }

  getTheme() {
    return this.appearance.getTheme()
  }

  setTheme(mode: ThemeMode) {
    return this.appearance.setTheme(mode)
  }

  getContacts() {
    return this.appearance.getContacts()
  }

  setContacts(input: Partial<ContactsStatus>) {
    return this.appearance.setContacts(input)
  }
}
