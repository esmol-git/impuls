import { Controller, Get, Param, Query } from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import { SKIP_ALL_THROTTLES } from '../common/throttle'
import { CoachesService } from './coaches.service'
import { PublicCoachesQueryDto } from './dto/public-coaches-query.dto'

@Controller('coaches')
@SkipThrottle(SKIP_ALL_THROTTLES)
export class CoachesController {
  constructor(private readonly coaches: CoachesService) {}

  @Get()
  list(@Query() query: PublicCoachesQueryDto) {
    return this.coaches.listPublic(query.limit ?? 100)
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.coaches.findPublicById(id)
  }
}
