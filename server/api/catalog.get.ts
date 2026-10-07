import type { CatalogItem, CatalogPageResult, CatalogSort } from '~/utils/catalog'
import { emptyCatalogPage } from '~/utils/catalog'

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

function mapItem(item: CatalogItem): CatalogItem {
  const imageUrls = (item.imageUrls?.length ? item.imageUrls : item.imageUrl ? [item.imageUrl] : []).map(
    publicImageUrl,
  )
  return {
    ...item,
    imageUrl: publicImageUrl(item.imageUrl),
    imageUrls,
  }
}

function pickString(value: unknown) {
  return typeof value === 'string' ? value : undefined
}

function pickNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value)
    if (Number.isFinite(n)) return n
  }
  return undefined
}

function pickBool(value: unknown) {
  if (value === true || value === 'true' || value === '1') return true
  if (value === false || value === 'false' || value === '0') return false
  return undefined
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const config = useRuntimeConfig()
  const apiUrl = (config.apiUrl as string | undefined)?.replace(/\/$/, '')

  if (!apiUrl) return emptyCatalogPage()

  const sort = pickString(query.sort) as CatalogSort | undefined
  const upstreamQuery = {
    page: pickNumber(query.page),
    limit: pickNumber(query.limit) ?? 9,
    q: pickString(query.q),
    categories: pickString(query.categories),
    priceMin: pickNumber(query.priceMin),
    priceMax: pickNumber(query.priceMax),
    onlySale: pickBool(query.onlySale),
    sort,
  }

  try {
    const data = await $fetch<CatalogPageResult>(`${apiUrl}/api/media/catalog`, {
      query: upstreamQuery,
    })
    return {
      ...data,
      items: (data.items || []).map(mapItem),
    }
  } catch (error) {
    console.warn('[api/catalog] не удалось загрузить каталог из Nest', error)
    return emptyCatalogPage()
  }
})
