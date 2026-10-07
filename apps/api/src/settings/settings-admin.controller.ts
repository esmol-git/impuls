import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import { MediaType } from '@prisma/client'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { ReorderHomeBlocksDto } from './dto/reorder-home-blocks.dto'
import { UpdateHomeBlockDto } from './dto/update-home-block.dto'
import { UpdateSectionDto } from './dto/update-section.dto'
import { SettingsService } from './settings.service'

@Controller('admin/settings')
@UseGuards(JwtAuthGuard)
@SkipThrottle({ default: true, auth: true, leads: true })
export class SettingsAdminController {
  constructor(private readonly settings: SettingsService) {}

  @Get('sections')
  listSections() {
    return this.settings.listSections()
  }

  @Patch('sections/:key')
  setEnabled(@Param('key') key: MediaType, @Body() dto: UpdateSectionDto) {
    return this.settings.setEnabled(key, dto.enabled)
  }

  @Get('home-blocks')
  listHomeBlocks() {
    return this.settings.listHomeBlocks()
  }

  @Patch('home-blocks/reorder')
  reorderHomeBlocks(@Body() dto: ReorderHomeBlocksDto) {
    return this.settings.reorderHomeBlocks(dto.keys)
  }

  @Patch('home-blocks/:key')
  setHomeBlockEnabled(@Param('key') key: string, @Body() dto: UpdateHomeBlockDto) {
    return this.settings.setHomeBlockEnabled(key, dto.enabled)
  }

  @Get('features')
  listFeatures() {
    return this.settings.listFeatures()
  }

  @Patch('features/:key')
  setFeatureEnabled(@Param('key') key: string, @Body() dto: UpdateHomeBlockDto) {
    return this.settings.setFeatureEnabled(key, dto.enabled)
  }
}
