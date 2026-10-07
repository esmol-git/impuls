import { Module } from '@nestjs/common'
import { SettingsModule } from '../settings/settings.module'
import { MediaAdminController } from './media-admin.controller'
import { MediaController } from './media.controller'
import { MediaService } from './media.service'

@Module({
  imports: [SettingsModule],
  controllers: [MediaController, MediaAdminController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
