import type { SocialLink } from '~/types'

export const site = {
  name: 'ФК «Импульс»',
  tagline: 'Детская футбольная школа',
  city: 'Ярославль',
  /** Полная вторая строка бренда в шапке */
  brandLine: 'ФК «Импульс» Ярославль',
  description: 'Детская футбольная школа. Бесплатное пробное занятие для каждого ребёнка.',
  phone: '+7 (920) 130-72-40',
  phoneHoursStart: 10,
  phoneHoursEnd: 20,
  phoneHours: 'Мы на связи с 10:00 до 20:00',
  email: 'info@example.com',
  legal: 'Юридическая информация будет добавлена позже',
} as const

export const socialLinks: SocialLink[] = [
  { label: 'ВКонтакте', href: 'https://vk.com', icon: 'vk' },
  { label: 'Telegram', href: 'https://t.me', icon: 'telegram' },
  { label: 'YouTube', href: 'https://youtube.com', icon: 'youtube' },
]

export const navigation = [
  { label: 'О школе', to: '/about' },
  { label: 'Новости', to: '/news', section: 'news' as const },
  { label: 'Тренеры', to: '/coaches' },
  { label: 'Группы', to: '/programs' },
  { label: 'Адреса', to: '/contacts' },
] as const

export type NavSectionKey = 'catalog' | 'news'

export const footerLinks = [
  { label: 'Сведения об организации', to: '/education' },
  { label: 'Правовая информация', to: '/legal' },
] as const
