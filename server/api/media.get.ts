type MediaType = 'CATALOG' | 'NEWS' | 'REVIEW'

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

/** В браузере отдаём относительный /uploads — его проксирует Nuxt на API */
function publicImageUrl(imageUrl: string) {
  if (!imageUrl) return imageUrl
  if (/^https?:\/\//i.test(imageUrl)) {
    try {
      const url = new URL(imageUrl)
      if (url.pathname.startsWith('/uploads/')) return url.pathname
    } catch {
      /* keep as is */
    }
    return imageUrl
  }
  return imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const type = typeof query.type === 'string' ? query.type : undefined
  const config = useRuntimeConfig()
  const apiUrl = (config.apiUrl as string | undefined)?.replace(/\/$/, '')

  if (!apiUrl) {
    return []
  }

  try {
    const items = await $fetch<MediaItem[]>(`${apiUrl}/api/media`, {
      query: type ? { type } : undefined,
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
