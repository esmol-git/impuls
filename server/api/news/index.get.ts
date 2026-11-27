import { emptyNewsPage, type MediaNewsDto, type NewsPageResult, NEWS_PAGE_SIZE } from '~/utils/news'

function pickNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value)
    if (Number.isFinite(n)) return n
  }
  return undefined
}

function mapItem(item: MediaNewsDto): MediaNewsDto {
  return {
    ...item,
    imageUrl: publicImageUrl(item.imageUrl),
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const config = useRuntimeConfig()
  const apiUrl = (config.apiUrl as string | undefined)?.replace(/\/$/, '')

  const page = pickNumber(query.page) ?? 1
  const limit = pickNumber(query.limit) ?? NEWS_PAGE_SIZE
  const topic = typeof query.topic === 'string' ? query.topic.trim() : undefined

  if (!apiUrl) return emptyNewsPage(page, limit)

  try {
    const data = await $fetch<NewsPageResult>(`${apiUrl}/api/media/news`, {
      query: {
        page,
        limit,
        ...(topic ? { topic } : {}),
      },
    })
    return {
      ...data,
      items: (data.items || []).map(mapItem),
    }
  } catch (error) {
    console.warn('[api/news] не удалось загрузить новости из Nest', error)
    return emptyNewsPage(page, limit)
  }
})
