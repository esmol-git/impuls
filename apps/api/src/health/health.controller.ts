import { Controller, Get, ServiceUnavailableException } from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import { SKIP_ALL_THROTTLES } from '../common/throttle'
import { PrismaService } from '../prisma/prisma.service'

@Controller('health')
@SkipThrottle(SKIP_ALL_THROTTLES)
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`
      return {
        ok: true,
        ts: new Date().toISOString(),
      }
    } catch {
      throw new ServiceUnavailableException({
        ok: false,
        ts: new Date().toISOString(),
        error: 'database_unavailable',
      })
    }
  }
}
