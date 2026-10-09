import type { BreadcrumbItem } from '~/types'
import { pages } from '~/data/pages'

const home: BreadcrumbItem = { label: 'Главная', to: '/' }

/** Родительские разделы для вложенных страниц */
export const breadcrumbParents = {
  news: { label: pages.news.breadcrumb, to: '/news' },
} as const

function trail(current: string): BreadcrumbItem[] {
  return [home, { label: current }]
}

/** Цепочки для статических страниц — по path */
export const routeBreadcrumbs: Record<string, BreadcrumbItem[]> = {
  '/about': trail(pages.about.breadcrumb),
  '/programs': trail(pages.programs.breadcrumb),
  '/coaches': trail(pages.coaches.breadcrumb),
  '/contacts': trail(pages.contacts.breadcrumb),
  '/news': trail(pages.news.breadcrumb),
  '/gallery': trail(pages.gallery.breadcrumb),
  '/education': trail(pages.education.breadcrumb),
  '/privacy': trail(pages.privacy.breadcrumb),
}

export function newsArticleBreadcrumbs(title: string): BreadcrumbItem[] {
  return [
    home,
    { ...breadcrumbParents.news },
    { label: title },
  ]
}

export function resolveBreadcrumbs(path: string, metaLabel?: string): BreadcrumbItem[] {
  if (routeBreadcrumbs[path]) {
    return routeBreadcrumbs[path]
  }

  if (metaLabel) {
    return trail(metaLabel)
  }

  return [home]
}
