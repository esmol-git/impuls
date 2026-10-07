import type { Review } from '~/types'

export type { Review } from '~/types'

export const reviews: Review[] = [
  { id: '1', author: 'Имя 1', rating: 5, text: 'Текст отзыва будет добавлен позже.' },
  { id: '2', author: 'Имя 2', rating: 5, text: 'Текст отзыва будет добавлен позже.' },
  { id: '3', author: 'Имя 3', rating: 4, text: 'Текст отзыва будет добавлен позже.' },
  { id: '4', author: 'Имя 4', rating: 5, text: 'Текст отзыва будет добавлен позже.' },
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
