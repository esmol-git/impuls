import { Controller, Get, ServiceUnavailableException } from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import { PrismaService } from '../prisma/prisma.service'

@Controller('health')
@SkipThrottle({ default: true, auth: true, leads: true })
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
