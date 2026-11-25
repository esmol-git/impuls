export const site = {
  name: 'ФК «Импульс»',
  tagline: 'Детская футбольная школа',
  city: 'Ярославль',
  /** Полная вторая строка бренда в шапке */
  brandLine: 'ФК «Импульс» Ярославль',
  description: 'Детская футбольная школа. Бесплатное пробное занятие для каждого ребёнка.',
  /** Часы для индикатора «на линии» — подпись и номер берутся из админки */
  phoneHoursStart: 10,
  phoneHoursEnd: 20,
  legal: 'Юридическая информация будет добавлена позже',
} as const

export const navigation = [
  { label: 'О школе', to: '/about' },
  { label: 'Новости', to: '/news', section: 'news' as const },
  { label: 'Тренеры', to: '/coaches', section: 'coaches' as const },
  { label: 'Группы', to: '/programs' },
  { label: 'Адреса', to: '/contacts' },
] as const

export type NavSectionKey = 'catalog' | 'news' | 'coaches'

export const footerLinks = [
  { label: 'Сведения об организации', to: '/education' },
  { label: 'Правовая информация', to: '/legal' },
] as const
