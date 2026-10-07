import type { Component } from 'vue'
import {
  Avatar,
  ChatDotRound,
  ChatLineSquare,
  Document,
  Goods,
  Notebook,
  Odometer,
  Setting,
  User,
} from '@element-plus/icons-vue'

export interface NavItem {
  path: string
  label: string
  icon: Component
  adminOnly?: boolean
}

export const navItems: NavItem[] = [
  { path: '/', label: 'Дашборд', icon: Odometer },
  { path: '/leads', label: 'Заявки', icon: ChatDotRound },
  { path: '/catalog', label: 'Каталог', icon: Goods },
  { path: '/news', label: 'Новости', icon: Notebook },
  { path: '/reviews', label: 'Отзывы', icon: ChatLineSquare },
  { path: '/coaches', label: 'Тренеры', icon: Avatar },
  { path: '/settings', label: 'Настройки', icon: Setting },
  { path: '/users', label: 'Пользователи', icon: User, adminOnly: true },
  { path: '/audit', label: 'Журнал', icon: Document, adminOnly: true },
]
