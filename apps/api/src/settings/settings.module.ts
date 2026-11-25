import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { SettingsAdminController } from './settings-admin.controller'
import { SettingsAppearanceService } from './settings-appearance.service'
import { SettingsController } from './settings.controller'
import { SettingsFeaturesService } from './settings-features.service'
import { SettingsHomeService } from './settings-home.service'
import { SettingsSectionsService } from './settings-sections.service'
import { SettingsService } from './settings.service'

@Module({
  imports: [AuthModule],
  controllers: [SettingsController, SettingsAdminController],
  providers: [
    SettingsSectionsService,
    SettingsHomeService,
    SettingsFeaturesService,
    SettingsAppearanceService,
    SettingsService,
  ],
  exports: [SettingsService],
})
export class SettingsModule {}
