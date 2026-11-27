import { MediaType } from '@prisma/client'

export const CATALOG_PAGE_SIZE = 9
/** Временно 3 — синхрон с витриной; потом вернуть 9 */
export const NEWS_PAGE_SIZE = 9

/** Поля для публичных/админ-списков без тяжёлого HTML body */
export const MEDIA_LIST_SELECT = {
  id: true,
  type: true,
  title: true,
  imageUrl: true,
  imageUrls: true,
  topic: true,
  category: true,
  sku: true,
  quantity: true,
  slug: true,
  description: true,
  price: true,
  discount: true,
  salePrice: true,
  sortOrder: true,
  published: true,
  publishAt: true,
  unpublishAt: true,
  createdAt: true,
  updatedAt: true,
} as const

export type CatalogRow = {
  id: string
  type: MediaType
  title: string
  imageUrl: string
  imageUrls: string[]
  topic: string | null
  category: string | null
  sku: string | null
  quantity: number | null
  slug: string | null
  description: string | null
  price: number | null
  discount: number | null
  salePrice: number | null
  sortOrder: number
  published: boolean
  publishAt: Date | null
  unpublishAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export function normalizeSku(value?: string | null) {
  const sku = value?.trim()
  return sku ? sku : null
}

export function calcSalePrice(
  price?: number | null,
  discount?: number | null,
  salePrice?: number | null,
) {
  if (salePrice != null) return salePrice
  if (price == null || discount == null || discount <= 0) return null
  return Math.round((price * (100 - discount)) / 100)
}

export function normalizeImageUrls(imageUrl?: string | null, imageUrls?: string[] | null) {
  const list = (imageUrls || []).map((url) => url.trim()).filter(Boolean)
  const cover = imageUrl?.trim()
  if (cover && !list.includes(cover)) {
    list.unshift(cover)
  }
  return {
    imageUrl: list[0] || cover || '',
    imageUrls: list,
  }
}
