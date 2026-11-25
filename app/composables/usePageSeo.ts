export function usePageSeo(title: string, description: string, image?: string) {
  const siteUrl = useSiteConfig().url.replace(/\/$/, '')
  const ogImage = image
    ? (image.startsWith('http') ? image : `${siteUrl}${image.startsWith('/') ? image : `/${image}`}`)
    : `${siteUrl}/favicon-512.png`

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogLocale: 'ru_RU',
    ogType: 'website',
    ogImage,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: ogImage,
  })
}
