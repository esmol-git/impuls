import { Controller, Get } from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import { SettingsService } from './settings.service'

@Controller('settings')
@SkipThrottle({ default: true, auth: true, leads: true })
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
}
