import type { NewsItem } from '~/types'
import { newsItems as fallbackNews } from '~/data/news'

export interface MediaNewsDto {
  id: string
  title: string
  imageUrl: string
  body?: string | null
  topic?: string | null
  slug?: string | null
  description?: string | null
  createdAt: string
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
  return {
    slug: item.slug || item.id,
    title: item.title,
    excerpt: text.slice(0, 160) || 'Подробности в материале.',
    date: toDateKey(item.createdAt),
    category: item.topic?.trim() || 'Новости',
    imageUrl: item.imageUrl,
    body: item.body || undefined,
  }
}

export function withNewsFallback(items: NewsItem[]) {
  return items.length ? items : fallbackNews
}
