interface TaxonomyItem {
  id: string
  kind: string
  name: string
  sortOrder: number
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const kind = typeof query.kind === 'string' ? query.kind : undefined
  const config = useRuntimeConfig()
  const apiUrl = (config.apiUrl as string | undefined)?.replace(/\/$/, '')
  if (!apiUrl) return []

  try {
    return await $fetch<TaxonomyItem[]>(`${apiUrl}/api/taxonomies`, {
      query: kind ? { kind } : undefined,
    })
  } catch (error) {
    console.warn('[api/taxonomies] не удалось загрузить таксономии', error)
    return []
  }
})
