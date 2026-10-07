import type { NewsItem } from '~/types'

export type { NewsItem } from '~/types'

export const newsItems: NewsItem[] = [
  {
    slug: 'news-1',
    title: 'Заголовок новости 1',
    excerpt: 'Краткое описание новости. Текст будет добавлен позже.',
    date: '2026-01-15',
    category: 'События',
  },
  {
    slug: 'news-2',
    title: 'Заголовок новости 2',
    excerpt: 'Краткое описание новости. Текст будет добавлен позже.',
    date: '2026-01-10',
    category: 'Турниры',
  },
  {
    slug: 'news-3',
    title: 'Заголовок новости 3',
    excerpt: 'Краткое описание новости. Текст будет добавлен позже.',
    date: '2026-01-05',
    category: 'Школа',
  },
  {
    slug: 'news-4',
    title: 'Заголовок новости 4',
    excerpt: 'Краткое описание новости. Текст будет добавлен позже.',
    date: '2025-12-28',
    category: 'События',
  },
]

export function getNewsBySlug(slug: string): NewsItem | undefined {
  return newsItems.find(item => item.slug === slug)
}

export function formatNewsDate(date: string) {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
