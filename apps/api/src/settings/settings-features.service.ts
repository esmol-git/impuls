import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import {
  SHOP_FEATURE_DEFS,
  SITE_FEATURE_DEFS,
  isShopFeatureKey,
  isSiteFeatureKey,
} from './site-features'
import type { FeatureStatus, MaintenanceStatus } from './settings.types'

@Injectable()
export class SettingsFeaturesService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureFeatureDefaults() {
    await Promise.all(
      SITE_FEATURE_DEFS.map((def) =>
        this.prisma.siteFeature.upsert({
          where: { key: def.key },
          create: { key: def.key, enabled: def.defaultEnabled },
          update: {},
        }),
      ),
    )
  }

  async listFeatures(): Promise<FeatureStatus[]> {
    await this.ensureFeatureDefaults()
    const rows = await this.prisma.siteFeature.findMany()
    const byKey = new Map(rows.map((row) => [row.key, row.enabled] as const))

    return SHOP_FEATURE_DEFS.map((def) => ({
      key: def.key,
      label: def.label,
      description: def.description,
      enabled: byKey.get(def.key) ?? def.defaultEnabled,
    }))
  }

  async setFeatureEnabled(key: string, enabled: boolean): Promise<FeatureStatus[]> {
    if (key === 'MAINTENANCE') {
      throw new ForbiddenException('Используйте /admin/settings/maintenance')
    }
    if (!isShopFeatureKey(key) || !isSiteFeatureKey(key)) {
      throw new BadRequestException('Неизвестная функция')
    }

    await this.ensureFeatureDefaults()
    await this.prisma.siteFeature.update({
      where: { key },
      data: { enabled },
    })
    return this.listFeatures()
  }

  async getMaintenance(): Promise<MaintenanceStatus> {
    await this.ensureFeatureDefaults()
    const row = await this.prisma.siteFeature.findUnique({ where: { key: 'MAINTENANCE' } })
    return { enabled: row?.enabled ?? false }
  }

  async setMaintenance(enabled: boolean): Promise<MaintenanceStatus> {
    await this.ensureFeatureDefaults()
    const row = await this.prisma.siteFeature.update({
      where: { key: 'MAINTENANCE' },
      data: { enabled },
    })
    return { enabled: row.enabled }
  }
}
