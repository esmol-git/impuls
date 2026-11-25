import type { MediaType } from '@/api/types'

export interface MediaPageCopy {
  description: string
  empty: string
  add: string
  defaultTitle?: string
  uploadHint?: string
}

/** Тексты шапки/empty для News / Reviews / Gallery. */
export function mediaPageCopy(type: MediaType, title: string): MediaPageCopy {
  if (type === 'NEWS') {
    return {
      description: 'Заголовок, тема, текст в редакторе и обложка новости.',
      empty: 'Пока нет новостей — добавьте первую.',
      add: 'Добавить новость',
    }
  }
  if (type === 'GALLERY') {
    return {
      description:
        'Фото для раздела «Галерея» на сайте. На главной — первые 6, на /gallery — все. Загрузка порциями; порядок меняйте перетаскиванием в пределах страницы. На сервере — WebP.',
      empty: 'Пока нет фото — нажмите «+», чтобы загрузить.',
      add: 'Добавить фото',
      defaultTitle: 'Фото',
      uploadHint: 'Квадрат или альбом · от 1200 px',
    }
  }
  if (type === 'REVIEW') {
    return {
      description:
        'Скриншоты отзывов — так же будут выглядеть на сайте. Загрузка порциями; порядок — перетаскиванием в пределах страницы. Формат: вертикальный 9:19, от 1080×2280 px. На сервере — WebP.',
      empty: 'Пока нет скриншотов — нажмите «+», чтобы загрузить.',
      add: 'Добавить скриншот',
      defaultTitle: 'Отзыв',
      uploadHint: '9:19 · от 1080×2280',
    }
  }
  return {
    description: title,
    empty: 'Пока пусто',
    add: 'Добавить',
  }
}
