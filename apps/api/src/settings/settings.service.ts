import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common'
import { MediaType, type SiteSection } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import {
  HOME_BLOCK_DEFS,
  HOME_BLOCK_KEYS,
  isHomeBlockKey,
  type HomeBlockKey,
} from './home-blocks'
import {
  SHOP_FEATURE_DEFS,
  SITE_FEATURE_DEFS,
  isShopFeatureKey,
  isSiteFeatureKey,
  type ShopFeatureKey,
} from './site-features'

const SECTION_KEYS = [MediaType.CATALOG, MediaType.NEWS, MediaType.REVIEW] as const

export interface SectionStatus {
  key: MediaType
  enabled: boolean
  itemCount: number
  /** Можно ли включить свитч (есть опубликованный контент) */
  canEnable: boolean
  /** Показывать ли раздел на сайте */
  visible: boolean
}

export interface HomeBlockStatus {
  key: HomeBlockKey
  label: string
  description: string
  enabled: boolean
  sortOrder: number
  /** Связь с контентным разделом (каталог/новости/отзывы) */
  contentKey?: 'CATALOG' | 'NEWS' | 'REVIEW'
  /** Итоговая видимость на главной с учётом контента */
  visible: boolean
}

export interface FeatureStatus {
  key: ShopFeatureKey
  label: string
  description: string
  enabled: boolean
}

export interface MaintenanceStatus {
  enabled: boolean
}

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureDefaults() {
    await Promise.all(
      SECTION_KEYS.map((key) =>
        this.prisma.siteSection.upsert({
          where: { key },
          create: { key, enabled: true },
          update: {},
        }),
      ),
    )
    await this.ensureHomeBlockDefaults()
    await this.ensureFeatureDefaults()
  }

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

  async ensureHomeBlockDefaults() {
    await Promise.all(
      HOME_BLOCK_DEFS.map((def, index) =>
        this.prisma.homeBlock.upsert({
          where: { key: def.key },
          create: {
            key: def.key,
            enabled: def.defaultEnabled,
            sortOrder: index,
          },
          update: {},
        }),
      ),
    )
  }

  async listSections(): Promise<SectionStatus[]> {
    await this.ensureDefaults()

    const [rows, catalogCount, newsCount, reviewCount] = await Promise.all([
      this.prisma.siteSection.findMany(),
      this.prisma.mediaItem.count({ where: { type: MediaType.CATALOG, published: true } }),
      this.prisma.mediaItem.count({ where: { type: MediaType.NEWS, published: true } }),
      this.prisma.mediaItem.count({ where: { type: MediaType.REVIEW, published: true } }),
    ])

    const countMap: Record<MediaType, number> = {
      [MediaType.CATALOG]: catalogCount,
      [MediaType.NEWS]: newsCount,
      [MediaType.REVIEW]: reviewCount,
    }

    return SECTION_KEYS.map((key) => {
      const row = rows.find((item: SiteSection) => item.key === key)
      const itemCount = countMap[key]
      const canEnable = itemCount > 0
      const enabled = Boolean(row?.enabled) && canEnable

      return {
        key,
        enabled,
        itemCount,
        canEnable,
        visible: enabled,
      }
    })
  }

  async getSectionMap() {
    const list = await this.listSections()
    return Object.fromEntries(list.map((item) => [item.key, item])) as Record<
      MediaType,
      SectionStatus
    >
  }

  async setEnabled(key: MediaType, enabled: boolean): Promise<SectionStatus> {
    if (!SECTION_KEYS.includes(key as (typeof SECTION_KEYS)[number])) {
      throw new BadRequestException('Неизвестный раздел')
    }

    await this.ensureDefaults()

    const itemCount = await this.prisma.mediaItem.count({
      where: { type: key, published: true },
    })
    const canEnable = itemCount > 0

    if (enabled && !canEnable) {
      throw new BadRequestException('Нельзя показать раздел без контента')
    }

    await this.prisma.siteSection.upsert({
      where: { key },
      create: { key, enabled },
      update: { enabled },
    })

    return {
      key,
      enabled,
      itemCount,
      canEnable,
      visible: enabled && canEnable,
    }
  }

  async listHomeBlocks(): Promise<HomeBlockStatus[]> {
    await this.ensureHomeBlockDefaults()

    const [rows, contentSections] = await Promise.all([
      this.prisma.homeBlock.findMany(),
      this.listSections(),
    ])

    const contentVisible = Object.fromEntries(
      contentSections.map((section) => [section.key, section.visible]),
    ) as Record<MediaType, boolean>

    const byKey = new Map(rows.map((block) => [block.key, block] as const))

    return HOME_BLOCK_DEFS.map((def, index) => {
      const block = byKey.get(def.key)
      const enabled = block?.enabled ?? def.defaultEnabled
      const sortOrder = block?.sortOrder ?? index
      const contentKey =
        'contentKey' in def
          ? (def.contentKey as 'CATALOG' | 'NEWS' | 'REVIEW' | undefined)
          : undefined
      const contentOk = contentKey ? Boolean(contentVisible[contentKey]) : true

      return {
        key: def.key,
        label: def.label,
        description: def.description,
        enabled,
        sortOrder,
        contentKey,
        visible: enabled && contentOk,
      }
    }).sort((a, b) => a.sortOrder - b.sortOrder || a.key.localeCompare(b.key))
  }

  async setHomeBlockEnabled(key: string, enabled: boolean): Promise<HomeBlockStatus[]> {
    if (!isHomeBlockKey(key)) {
      throw new BadRequestException('Неизвестный блок главной')
    }

    await this.ensureHomeBlockDefaults()
    await this.prisma.homeBlock.update({
      where: { key },
      data: { enabled },
    })
    return this.listHomeBlocks()
  }

  async reorderHomeBlocks(keys: string[]): Promise<HomeBlockStatus[]> {
    if (keys.length !== HOME_BLOCK_KEYS.length) {
      throw new BadRequestException('Передайте полный список блоков')
    }

    const unique = new Set(keys)
    if (unique.size !== keys.length || !keys.every(isHomeBlockKey)) {
      throw new BadRequestException('Некорректный список блоков')
    }

    await this.ensureHomeBlockDefaults()
    await this.prisma.$transaction(
      keys.map((key, index) =>
        this.prisma.homeBlock.update({
          where: { key },
          data: { sortOrder: index },
        }),
      ),
    )

    return this.listHomeBlocks()
  }

  /** Выключить раздел, если не осталось опубликованных элементов */
  async syncAfterMediaChange(type: MediaType) {
    const itemCount = await this.prisma.mediaItem.count({
      where: { type, published: true },
    })
    if (itemCount > 0) return

    await this.prisma.siteSection.upsert({
      where: { key: type },
      create: { key: type, enabled: false },
      update: { enabled: false },
    })
  }
}
