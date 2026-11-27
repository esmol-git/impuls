import type { NewsItem } from '~/types'
import { newsItems as fallbackNews } from '~/data/news'

export const NEWS_PAGE_SIZE = 9

export interface MediaNewsDto {
  id: string
  title: string
  imageUrl: string
  body?: string | null
  topic?: string | null
  slug?: string | null
  description?: string | null
  publishAt?: string | null
  unpublishAt?: string | null
  createdAt: string
}

export interface NewsPageResult {
  items: MediaNewsDto[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function emptyNewsPage(page = 1, limit = NEWS_PAGE_SIZE): NewsPageResult {
  return {
    items: [],
    meta: { page, limit, total: 0, totalPages: 0 },
  }
}

function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function toDateKey(value: string) {
  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10)
  }
  return value.slice(0, 10)
}

export function mapMediaToNews(item: MediaNewsDto): NewsItem {
  const text = item.description?.trim() || stripHtml(item.body || '')
  const displayDate = item.publishAt || item.createdAt
  return {
    slug: item.slug || item.id,
    title: item.title,
    excerpt: text.slice(0, 160) || 'Подробности в материале.',
    date: toDateKey(displayDate),
    publishedAt: displayDate,
    category: item.topic?.trim() || 'Новости',
    imageUrl: item.imageUrl,
    body: item.body || undefined,
  }
}

/** Статический fallback только в dev — на проде пустой список / 404. */
export function withNewsFallback(items: NewsItem[]) {
  if (items.length) return items
  if (import.meta.dev) return fallbackNews
  return []
}
