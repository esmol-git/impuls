import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { SettingsAdminController } from './settings-admin.controller'
import { SettingsController } from './settings.controller'
import { SettingsService } from './settings.service'

@Module({
  imports: [AuthModule],
  controllers: [SettingsController, SettingsAdminController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
