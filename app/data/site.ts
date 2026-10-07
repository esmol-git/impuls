import type { SocialLink } from '~/types'

export const site = {
  name: 'ФК «Импульс»',
  tagline: 'Детская футбольная школа',
  description: 'Детская футбольная школа. Бесплатное пробное занятие для каждого ребёнка.',
  phone: '+7 (981) 683-70-28',
  phoneHoursStart: 9,
  phoneHoursEnd: 21,
  phoneHours: 'Звоните с 9:00 до 21:00',
  email: 'info@example.com',
  legal: 'Юридическая информация будет добавлена позже',
} as const

export const socialLinks: SocialLink[] = [
  { label: 'ВКонтакте', href: 'https://vk.com', icon: 'vk' },
  { label: 'Telegram', href: 'https://t.me', icon: 'telegram' },
  { label: 'YouTube', href: 'https://youtube.com', icon: 'youtube' },
]

export const navigation = [
  { label: 'Каталог', to: '/catalog', section: 'catalog' as const },
  { label: 'Новости', to: '/news', section: 'news' as const },
  { label: 'Адреса', to: '/contacts' },
  { label: 'О школе', to: '/about' },
  { label: 'Тренеры', to: '/coaches' },
] as const

export type NavSectionKey = 'catalog' | 'news'

export const footerLinks = [
  { label: 'Сведения об организации', to: '/education' },
  { label: 'Политика конфиденциальности', to: '/privacy' },
] as const
