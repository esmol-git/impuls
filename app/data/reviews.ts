import type { Review } from '~/types'

export type { Review } from '~/types'

/** Заглушки на время наполнения — блок отзывов оставляем на месте */
export const reviews: Review[] = [
  { id: '1', author: 'Родитель', rating: 5, text: 'Отзыв готовится — скоро появится здесь.' },
  { id: '2', author: 'Родитель', rating: 5, text: 'Отзыв готовится — скоро появится здесь.' },
  { id: '3', author: 'Родитель', rating: 4, text: 'Отзыв готовится — скоро появится здесь.' },
  { id: '4', author: 'Родитель', rating: 5, text: 'Отзыв готовится — скоро появится здесь.' },
]

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
