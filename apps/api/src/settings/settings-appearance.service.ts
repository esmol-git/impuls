import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import {
  CONTACTS_DEFAULT,
  CONTACTS_SETTING_KEY,
  normalizeContacts,
  parseContactsValue,
  type ContactsStatus,
} from './contacts'
import {
  THEME_DEFAULT,
  THEME_SETTING_KEY,
  isThemeMode,
  type ThemeMode,
} from './theme'
import type { ThemeStatus } from './settings.types'

@Injectable()
export class SettingsAppearanceService {
  constructor(private readonly prisma: PrismaService) {}

  /** Race-safe insert: параллельные ensure не должны валить P2002. */
  private async ensureSetting(key: string, value: string) {
    const existing = await this.prisma.siteSetting.findUnique({ where: { key } })
    if (existing) return
    try {
      await this.prisma.siteSetting.create({ data: { key, value } })
    } catch (error) {
      const code = (error as { code?: string } | null)?.code
      if (code === 'P2002') return
      throw error
    }
  }

  async ensureThemeDefault() {
    await this.ensureSetting(THEME_SETTING_KEY, THEME_DEFAULT)
  }

  async ensureContactsDefault() {
    await this.ensureSetting(CONTACTS_SETTING_KEY, JSON.stringify(CONTACTS_DEFAULT))
  }

  async getContacts(): Promise<ContactsStatus> {
    await this.ensureContactsDefault()
    const row = await this.prisma.siteSetting.findUnique({
      where: { key: CONTACTS_SETTING_KEY },
    })
    return parseContactsValue(row?.value)
  }

  async setContacts(input: Partial<ContactsStatus>): Promise<ContactsStatus> {
    const current = await this.getContacts()
    const next = normalizeContacts({
      phone: input.phone ?? current.phone,
      phoneHours: input.phoneHours ?? current.phoneHours,
      email: input.email ?? current.email,
      socials: {
        vk: input.socials?.vk ?? current.socials.vk,
        telegram: input.socials?.telegram ?? current.socials.telegram,
        youtube: input.socials?.youtube ?? current.socials.youtube,
      },
    })

    await this.prisma.siteSetting.upsert({
      where: { key: CONTACTS_SETTING_KEY },
      create: { key: CONTACTS_SETTING_KEY, value: JSON.stringify(next) },
      update: { value: JSON.stringify(next) },
    })
    return next
  }

  async getTheme(): Promise<ThemeStatus> {
    await this.ensureThemeDefault()
    const row = await this.prisma.siteSetting.findUnique({
      where: { key: THEME_SETTING_KEY },
    })
    const value = row?.value ?? THEME_DEFAULT
    return { mode: isThemeMode(value) ? value : THEME_DEFAULT }
  }

  async setTheme(mode: ThemeMode): Promise<ThemeStatus> {
    if (!isThemeMode(mode)) {
      throw new BadRequestException('Неизвестный режим темы')
    }
    await this.prisma.siteSetting.upsert({
      where: { key: THEME_SETTING_KEY },
      create: { key: THEME_SETTING_KEY, value: mode },
      update: { value: mode },
    })
    return { mode }
  }
}
