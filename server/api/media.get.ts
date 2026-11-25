type MediaType = 'CATALOG' | 'NEWS' | 'REVIEW' | 'GALLERY'

interface MediaItem {
  id: string
  type: MediaType
  title: string
  imageUrl: string
  imageUrls?: string[]
  body?: string | null
  topic?: string | null
  category?: string | null
  slug?: string | null
  description?: string | null
  price?: number | null
  discount?: number | null
  salePrice?: number | null
  sortOrder: number
  published: boolean
  createdAt: string
  updatedAt: string
}

const DEFAULT_LIMIT: Record<MediaType, number> = {
  CATALOG: 48,
  NEWS: 48,
  REVIEW: 48,
  GALLERY: 48,
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const type = typeof query.type === 'string' ? (query.type as MediaType) : undefined
  const rawLimit = typeof query.limit === 'string' ? Number(query.limit) : Number(query.limit)
  const fallback = type ? DEFAULT_LIMIT[type] : 48
  const limit = Number.isFinite(rawLimit) && rawLimit > 0
    ? Math.min(100, Math.round(rawLimit))
    : fallback

  const config = useRuntimeConfig()
  const apiUrl = (config.apiUrl as string | undefined)?.replace(/\/$/, '')

  if (!apiUrl) {
    return []
  }

  try {
    const items = await $fetch<MediaItem[]>(`${apiUrl}/api/media`, {
      query: {
        ...(type ? { type } : {}),
        limit,
      },
    })
    return items.map((item) => ({
      ...item,
      imageUrl: publicImageUrl(item.imageUrl),
      imageUrls: (item.imageUrls?.length ? item.imageUrls : item.imageUrl ? [item.imageUrl] : []).map(
        publicImageUrl,
      ),
    }))
  } catch (error) {
    console.warn('[api/media] не удалось загрузить медиа из Nest', error)
    return []
  }
})
