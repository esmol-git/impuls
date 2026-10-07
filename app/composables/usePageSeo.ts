export function usePageSeo(title: string, description: string) {
  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogLocale: 'ru_RU',
  })
}
