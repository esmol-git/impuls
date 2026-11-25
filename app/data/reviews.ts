export interface ReviewPlatform {
  id: 'yandex' | '2gis'
  rating: string
  label: string
  href?: string
}

/** Рейтинги площадок в блоке отзывов */
export const reviewPlatforms: ReviewPlatform[] = [
  { id: 'yandex', rating: '4.9', label: 'Яндекс' },
  { id: '2gis', rating: '4.9', label: '2ГИС' },
]
