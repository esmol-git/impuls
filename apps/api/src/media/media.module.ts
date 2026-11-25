import { Module } from '@nestjs/common'
import { SettingsModule } from '../settings/settings.module'
import { MediaAdminController } from './media-admin.controller'
import { MediaAdminService } from './media-admin.service'
import { MediaCatalogService } from './media-catalog.service'
import { MediaController } from './media.controller'
import { MediaPublicService } from './media-public.service'
import { MediaService } from './media.service'

@Module({
  imports: [SettingsModule],
  controllers: [MediaController, MediaAdminController],
  providers: [MediaPublicService, MediaCatalogService, MediaAdminService, MediaService],
  exports: [MediaService],
})
export class MediaModule {}
