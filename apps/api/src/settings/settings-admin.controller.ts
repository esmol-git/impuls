import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common'
import { Role } from '@prisma/client'
import { SkipThrottle } from '@nestjs/throttler'
import { Roles } from '../auth/decorators/roles.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { UpdateEnabledDto } from '../common/dto/update-enabled.dto'
import { SKIP_ALL_THROTTLES } from '../common/throttle'
import { ReorderHomeBlocksDto } from './dto/reorder-home-blocks.dto'
import { UpdateSectionDto } from './dto/update-section.dto'
import { UpdateContactsDto } from './dto/update-contacts.dto'
import { UpdateThemeDto } from './dto/update-theme.dto'
import { SettingsService } from './settings.service'

@Controller('admin/settings')
@UseGuards(JwtAuthGuard)
@SkipThrottle(SKIP_ALL_THROTTLES)
export class SettingsAdminController {
  constructor(private readonly settings: SettingsService) {}

  @Get('sections')
  listSections() {
    return this.settings.listSections()
  }

  @Patch('sections/:key')
  setEnabled(@Param('key') key: string, @Body() dto: UpdateSectionDto) {
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
  setHomeBlockEnabled(@Param('key') key: string, @Body() dto: UpdateEnabledDto) {
    return this.settings.setHomeBlockEnabled(key, dto.enabled)
  }

  @Get('features')
  listFeatures() {
    return this.settings.listFeatures()
  }

  @Patch('features/:key')
  setFeatureEnabled(@Param('key') key: string, @Body() dto: UpdateEnabledDto) {
    return this.settings.setFeatureEnabled(key, dto.enabled)
  }

  @Get('maintenance')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERADMIN)
  getMaintenance() {
    return this.settings.getMaintenance()
  }

  @Patch('maintenance')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERADMIN)
  setMaintenance(@Body() dto: UpdateEnabledDto) {
    return this.settings.setMaintenance(dto.enabled)
  }

  @Get('theme')
  getTheme() {
    return this.settings.getTheme()
  }

  @Patch('theme')
  setTheme(@Body() dto: UpdateThemeDto) {
    return this.settings.setTheme(dto.mode)
  }

  @Get('contacts')
  getContacts() {
    return this.settings.getContacts()
  }

  @Patch('contacts')
  setContacts(@Body() dto: UpdateContactsDto) {
    return this.settings.setContacts({
      phone: dto.phone,
      phoneHours: dto.phoneHours,
      phoneHoursFrom: dto.phoneHoursFrom,
      phoneHoursTo: dto.phoneHoursTo,
      email: dto.email,
      socials: dto.socials
        ? {
            vk: dto.socials.vk ?? '',
            telegram: dto.socials.telegram ?? '',
            youtube: dto.socials.youtube ?? '',
          }
        : undefined,
    })
  }
}
