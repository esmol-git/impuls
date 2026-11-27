type PageSeoOptions = {
  ogType?: 'website' | 'article'
  publishedTime?: string
}

export function usePageSeo(
  title: string,
  description: string,
  image?: string,
  options: PageSeoOptions = {},
) {
  const siteUrl = useSiteConfig().url.replace(/\/$/, '')
  const ogImage = image
    ? (image.startsWith('http') ? image : `${siteUrl}${image.startsWith('/') ? image : `/${image}`}`)
    : `${siteUrl}/favicon-512.png`

  const ogType = options.ogType || 'website'

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogLocale: 'ru_RU',
    ogType,
    ogImage,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: ogImage,
    ...(ogType === 'article' && options.publishedTime
      ? { articlePublishedTime: options.publishedTime }
      : {}),
  })
}
