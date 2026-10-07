import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { AuditModule } from './audit/audit.module'
import { AuthModule } from './auth/auth.module'
import { CoachesModule } from './coaches/coaches.module'
import { HealthModule } from './health/health.module'
import { LeadsModule } from './leads/leads.module'
import { MediaModule } from './media/media.module'
import { PrismaModule } from './prisma/prisma.module'
import { SettingsModule } from './settings/settings.module'
import { StatsModule } from './stats/stats.module'
import { StorageModule } from './storage/storage.module'
import { TaxonomyModule } from './taxonomy/taxonomy.module'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 600,
        // Админка под JWT не должна упираться в общий лимит (много параллельных запросов)
        skipIf: (ctx) => {
          const req = ctx.switchToHttp().getRequest<{ headers?: { authorization?: string } }>()
          return Boolean(req.headers?.authorization)
        },
      },
      { name: 'auth', ttl: 60_000, limit: 10 },
      { name: 'leads', ttl: 60_000, limit: 8 },
    ]),
    StorageModule,
    PrismaModule,
    HealthModule,
    AuditModule,
    AuthModule,
    UsersModule,
    MediaModule,
    CoachesModule,
    LeadsModule,
    StatsModule,
    SettingsModule,
    TaxonomyModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
