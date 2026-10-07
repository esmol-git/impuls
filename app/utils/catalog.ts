export interface CatalogItem {
  id: string
  title: string
  imageUrl: string
  imageUrls?: string[]
  category?: string | null
  sku?: string | null
  quantity?: number | null
  description?: string | null
  price?: number | null
  discount?: number | null
  salePrice?: number | null
  sortOrder: number
}

export function catalogImages(item: CatalogItem) {
  if (item.imageUrls?.length) return item.imageUrls
  return item.imageUrl ? [item.imageUrl] : []
}

export function formatRub(value?: number | null) {
  if (value == null) return null
  return `${value.toLocaleString('ru-RU')} ₽`
}

/** Актуальная цена с учётом скидки */
export function effectivePrice(item: CatalogItem) {
  if (item.salePrice != null) return item.salePrice
  return item.price ?? null
}

/** Контекст товара для заявки «Узнать подробнее» (в админке, не в форме клиента) */
export function catalogInquiryLabel(item: CatalogItem) {
  const parts = [item.title.trim()]
  if (item.category?.trim()) parts.push(item.category.trim())
  const price = formatRub(effectivePrice(item))
  if (price) parts.push(price)
  return parts.filter(Boolean).join(' · ')
}

export function mapMediaToCatalog(item: CatalogItem): CatalogItem {
  return {
    id: item.id,
    title: item.title,
    imageUrl: item.imageUrl,
    imageUrls: catalogImages(item),
    category: item.category,
    sku: item.sku,
    quantity: item.quantity,
    description: item.description,
    price: item.price,
    discount: item.discount,
    salePrice: item.salePrice,
    sortOrder: item.sortOrder,
  }
}

export type CatalogSort = 'default' | 'price-asc' | 'price-desc' | 'title'

export const CATALOG_PAGE_SIZE = 9

export interface CatalogFacets {
  totalAll: number
  priceMin: number
  priceMax: number
  categories: { name: string; count: number }[]
  saleCount: number
}

export interface CatalogPageResult {
  items: CatalogItem[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  facets: CatalogFacets
}

export function emptyCatalogPage(page = 1, limit = CATALOG_PAGE_SIZE): CatalogPageResult {
  return {
    items: [],
    meta: { page, limit, total: 0, totalPages: 0 },
    facets: {
      totalAll: 0,
      priceMin: 0,
      priceMax: 0,
      categories: [],
      saleCount: 0,
    },
  }
}
