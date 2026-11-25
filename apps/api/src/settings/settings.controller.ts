import { Controller, Get } from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import { SKIP_ALL_THROTTLES } from '../common/throttle'
import { SettingsService } from './settings.service'

@Controller('settings')
@SkipThrottle(SKIP_ALL_THROTTLES)
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get('sections')
  listSections() {
    return this.settings.listSections()
  }

  @Get('home-blocks')
  listHomeBlocks() {
    return this.settings.listHomeBlocks()
  }

  @Get('features')
  listFeatures() {
    return this.settings.listFeatures()
  }

  @Get('maintenance')
  getMaintenance() {
    return this.settings.getMaintenance()
  }

  @Get('theme')
  getTheme() {
    return this.settings.getTheme()
  }

  @Get('contacts')
  getContacts() {
    return this.settings.getContacts()
  }
}
