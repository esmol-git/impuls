import type { MediaNewsDto } from '~/utils/news'
import { mapMediaToNews } from '~/utils/news'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Не указан slug' })
  }

  const config = useRuntimeConfig()
  const apiUrl = (config.apiUrl as string | undefined)?.replace(/\/$/, '')
  if (!apiUrl) {
    throw createError({ statusCode: 503, statusMessage: 'Сервис временно недоступен' })
  }

  try {
    const item = await $fetch<MediaNewsDto>(`${apiUrl}/api/media/news/${slug}`)
    return mapMediaToNews({
      ...item,
      imageUrl: publicImageUrl(item.imageUrl),
    })
  } catch (error) {
    rethrowUpstreamNotFound(error, 'Новость не найдена')
  }
})
