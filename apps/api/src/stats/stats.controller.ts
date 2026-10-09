import { Controller, Get, Headers, Query, Res, UseGuards } from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import type { Response } from 'express'
import { createHash } from 'crypto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { SKIP_ALL_THROTTLES } from '../common/throttle'
import { StatsSeriesQueryDto } from './dto/stats-series-query.dto'
import { StatsService } from './stats.service'

@Controller('admin')
@UseGuards(JwtAuthGuard)
@SkipThrottle(SKIP_ALL_THROTTLES)
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  @Get('stats')
  dashboard() {
    return this.stats.dashboard()
  }

  @Get('stats/series')
  series(@Query() query: StatsSeriesQueryDto) {
    return this.stats.series(query.range ?? 'week')
  }

  @Get('notifications')
  async notifications(
    @Headers('if-none-match') ifNoneMatch: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.stats.notifications()
    const fingerprint = `${data.newLeads}:${data.latest.map((l) => l.id).join(',')}`
    const etag = `"${createHash('sha1').update(fingerprint).digest('hex')}"`

    res.setHeader('ETag', etag)
    res.setHeader('Cache-Control', 'private, no-cache')

    if (ifNoneMatch && ifNoneMatch === etag) {
      res.status(304)
      return
    }

    return data
  }
}
