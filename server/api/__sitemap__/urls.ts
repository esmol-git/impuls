import type { MediaNewsDto } from '~/utils/news'

export default defineSitemapEventHandler(async () => {
  const config = useRuntimeConfig()
  const apiUrl = (config.apiUrl as string | undefined)?.replace(/\/$/, '')
  if (!apiUrl) return []

  try {
    const data = await $fetch<{ items: MediaNewsDto[] }>(`${apiUrl}/api/media/news`, {
      query: { page: 1, limit: 48 },
    })
    return (data.items || []).map((item) => ({
      loc: `/news/${item.slug || item.id}`,
      lastmod: item.publishAt || item.createdAt,
    }))
  } catch (error) {
    console.warn('[sitemap] не удалось загрузить новости', error)
    return []
  }
})
