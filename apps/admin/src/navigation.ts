import type { Component } from 'vue'
import { icons } from '@/icons'

export interface NavItem {
  path: string
  label: string
  icon: Component
  adminOnly?: boolean
}

export const navItems: NavItem[] = [
  { path: '/', label: 'Дашборд', icon: icons['home-1'] },
  { path: '/leads', label: 'Заявки', icon: icons['message-1'] },
  { path: '/catalog', label: 'Каталог', icon: icons['shopping-bag'] },
  { path: '/news', label: 'Новости', icon: icons['sticky-note'] },
  { path: '/reviews', label: 'Отзывы', icon: icons['message-2'] },
  { path: '/gallery', label: 'Галерея', icon: icons.image },
  { path: '/coaches', label: 'Тренеры', icon: icons.honour },
  { path: '/settings', label: 'Настройки', icon: icons['settings-2'] },
  { path: '/users', label: 'Пользователи', icon: icons.user, adminOnly: true },
  { path: '/audit', label: 'Журнал', icon: icons.file, adminOnly: true },
]
