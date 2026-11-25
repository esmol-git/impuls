import { BadRequestException, Injectable } from '@nestjs/common'
import { SiteSectionKey } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import {
  HOME_BLOCK_DEFS,
  HOME_BLOCK_KEYS,
  isHomeBlockKey,
} from './home-blocks'
import { SettingsSectionsService } from './settings-sections.service'
import type { HomeBlockStatus } from './settings.types'

@Injectable()
export class SettingsHomeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sections: SettingsSectionsService,
  ) {}

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

  async listHomeBlocks(): Promise<HomeBlockStatus[]> {
    await this.ensureHomeBlockDefaults()

    const [rows, contentSections] = await Promise.all([
      this.prisma.homeBlock.findMany(),
      this.sections.listSections(),
    ])

    const contentVisible = Object.fromEntries(
      contentSections.map((section) => [section.key, section.visible]),
    ) as Record<SiteSectionKey, boolean>

    const byKey = new Map(rows.map((block) => [block.key, block] as const))

    return HOME_BLOCK_DEFS.map((def, index) => {
      const block = byKey.get(def.key)
      const enabled = block?.enabled ?? def.defaultEnabled
      const sortOrder = block?.sortOrder ?? index
      const contentKey =
        'contentKey' in def ? (def.contentKey as SiteSectionKey | undefined) : undefined
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
}
