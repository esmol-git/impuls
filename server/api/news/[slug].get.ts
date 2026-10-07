import type { MediaNewsDto } from '~/utils/news'
import { mapMediaToNews } from '~/utils/news'

function publicImageUrl(imageUrl: string) {
  if (!imageUrl) return imageUrl
  if (/^https?:\/\//i.test(imageUrl)) {
    try {
      const url = new URL(imageUrl)
      if (url.pathname.startsWith('/uploads/')) return url.pathname
    } catch {
      /* keep */
    }
    return imageUrl
  }
  return imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`
}

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Не указан slug' })
  }

  const config = useRuntimeConfig()
  const apiUrl = (config.apiUrl as string | undefined)?.replace(/\/$/, '')
  if (!apiUrl) {
    throw createError({ statusCode: 404, statusMessage: 'Новость не найдена' })
  }

  try {
    const item = await $fetch<MediaNewsDto>(`${apiUrl}/api/media/news/${slug}`)
    return mapMediaToNews({
      ...item,
      imageUrl: publicImageUrl(item.imageUrl),
    })
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Новость не найдена' })
  }
})

