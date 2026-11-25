import { ref } from 'vue'

export type PublishedFilter = 'ALL' | 'published' | 'hidden'

export const PUBLISHED_FILTER_OPTIONS = [
  { label: 'Все', value: 'ALL' as const },
  { label: 'На сайте', value: 'published' as const },
  { label: 'Скрытые', value: 'hidden' as const },
]

/** Фильтр «Все / На сайте / Скрытые» для списков с published. */
export function usePublishedFilter() {
  const publishedFilter = ref<PublishedFilter>('ALL')

  function applyPublishedParam(params: URLSearchParams) {
    if (publishedFilter.value === 'published') params.set('published', 'true')
    else if (publishedFilter.value === 'hidden') params.set('published', 'false')
  }

  return {
    publishedFilter,
    publishedFilterOptions: PUBLISHED_FILTER_OPTIONS,
    applyPublishedParam,
  }
}
