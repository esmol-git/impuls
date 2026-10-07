import type { GalleryItem } from '~/types'

export type { GalleryItem } from '~/types'

export const galleryItems: GalleryItem[] = Array.from({ length: 6 }, (_, i) => ({
  id: String(i + 1),
  alt: `Фото ${i + 1}`,
}))
