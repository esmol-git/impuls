import { BadRequestException, Injectable } from '@nestjs/common'
import { MediaType, SiteSectionKey, type SiteSection } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { SECTION_KEYS, type SectionStatus } from './settings.types'

@Injectable()
export class SettingsSectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureSectionDefaults() {
    await Promise.all(
      SECTION_KEYS.map((key) =>
        this.prisma.siteSection.upsert({
          where: { key },
          create: { key, enabled: true },
          update: {},
        }),
      ),
    )
  }

  private async countPublished(key: SiteSectionKey): Promise<number> {
    if (key === SiteSectionKey.COACHES) {
      return this.prisma.coach.count({ where: { published: true } })
    }
    return this.prisma.mediaItem.count({
      where: { type: key as MediaType, published: true },
    })
  }

  private isSectionKey(value: string): value is SiteSectionKey {
    return (SECTION_KEYS as readonly string[]).includes(value)
  }

  async listSections(): Promise<SectionStatus[]> {
    await this.ensureSectionDefaults()

    const [rows, catalogCount, newsCount, reviewCount, galleryCount, coachesCount] =
      await Promise.all([
        this.prisma.siteSection.findMany(),
        this.prisma.mediaItem.count({ where: { type: MediaType.CATALOG, published: true } }),
        this.prisma.mediaItem.count({ where: { type: MediaType.NEWS, published: true } }),
        this.prisma.mediaItem.count({ where: { type: MediaType.REVIEW, published: true } }),
        this.prisma.mediaItem.count({ where: { type: MediaType.GALLERY, published: true } }),
        this.prisma.coach.count({ where: { published: true } }),
      ])

    const countMap: Record<SiteSectionKey, number> = {
      [SiteSectionKey.CATALOG]: catalogCount,
      [SiteSectionKey.NEWS]: newsCount,
      [SiteSectionKey.REVIEW]: reviewCount,
      [SiteSectionKey.GALLERY]: galleryCount,
      [SiteSectionKey.COACHES]: coachesCount,
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
      SiteSectionKey,
      SectionStatus
    >
  }

  async setEnabled(key: string, enabled: boolean): Promise<SectionStatus> {
    if (!this.isSectionKey(key)) {
      throw new BadRequestException('Неизвестный раздел')
    }

    await this.ensureSectionDefaults()

    const itemCount = await this.countPublished(key)
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

  async syncAfterMediaChange(type: MediaType) {
    await this.syncAfterSectionContentChange(type)
  }

  async syncAfterCoachChange() {
    await this.syncAfterSectionContentChange(SiteSectionKey.COACHES)
  }

  private async syncAfterSectionContentChange(key: SiteSectionKey) {
    const itemCount = await this.countPublished(key)
    if (itemCount > 0) return

    await this.prisma.siteSection.upsert({
      where: { key },
      create: { key, enabled: false },
      update: { enabled: false },
    })
  }
}
