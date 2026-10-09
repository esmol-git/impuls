import type { GalleryItem } from '~/types'

export type { GalleryItem } from '~/types'

/** Сколько фото показываем в блоке на главной */
export const HOME_GALLERY_COUNT = 6

/** Сколько фото сразу на странице /gallery, дальше — по скроллу */
export const GALLERY_PAGE_BATCH = 12

export interface GalleryMediaDto {
  id: string
  title?: string | null
  imageUrl?: string | null
}

export function mapMediaToGalleryItem(row: GalleryMediaDto): GalleryItem | null {
  if (!row?.id || !row.imageUrl) return null
  return {
    id: row.id,
    alt: row.title?.trim() || 'Фото',
    src: row.imageUrl,
  }
}

export function mapMediaToGalleryItems(rows: GalleryMediaDto[] | null | undefined): GalleryItem[] {
  if (!Array.isArray(rows)) return []
  return rows
    .map(mapMediaToGalleryItem)
    .filter((item): item is GalleryItem => item !== null)
}
