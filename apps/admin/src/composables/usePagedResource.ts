import { onMounted, ref, watch, type Ref } from 'vue'
import { getErrorMessage } from '@/utils/apiError'
import { useToast } from '@/composables/useToast'

export const DEFAULT_PAGE_SIZES = [5, 10, 20, 50] as const

export interface PageMeta {
  total: number
  totalPages: number
}

export type SortOrder = 'asc' | 'desc'

export interface PagedFetchParams<TSort extends string> {
  page: number
  limit: number
  sort: TSort
  order: SortOrder
}

export interface UsePagedResourceOptions<T, TSort extends string> {
  defaultSort: TSort
  defaultOrder?: SortOrder
  defaultPageSize?: number
  pageSizes?: number[]
  /** Сообщение toast при ошибке load */
  errorMessage?: string
  /** false — не грузить на mount (редко) */
  immediate?: boolean
  fetchPage: (params: PagedFetchParams<TSort>) => Promise<{ items: T[]; meta: PageMeta }>
  /** Доп. работа при load (например секция сайта). Не silent-only. */
  onLoadSideEffect?: (options: { silent?: boolean }) => Promise<void>
}

/**
 * Общий паттерн списков: page / pageSize / sort / load / onSortChange.
 * Специфичные мутации (delete, publish) остаются во view.
 */
export function usePagedResource<T, TSort extends string>(
  options: UsePagedResourceOptions<T, TSort>,
) {
  const toast = useToast()

  const items = ref<T[]>([]) as Ref<T[]>
  const loading = ref(false)
  const page = ref(1)
  const pageSize = ref(options.defaultPageSize ?? 10)
  const pageSizes = options.pageSizes ? [...options.pageSizes] : [...DEFAULT_PAGE_SIZES]
  const total = ref(0)
  const sort = ref(options.defaultSort) as Ref<TSort>
  const order = ref<SortOrder>(options.defaultOrder ?? 'desc')

  async function load(loadOptions: { silent?: boolean } = {}) {
    if (!loadOptions.silent) loading.value = true
    try {
      const [data] = await Promise.all([
        options.fetchPage({
          page: page.value,
          limit: pageSize.value,
          sort: sort.value,
          order: order.value,
        }),
        options.onLoadSideEffect && !loadOptions.silent
          ? options.onLoadSideEffect(loadOptions)
          : Promise.resolve(),
      ])
      items.value = data.items
      total.value = data.meta.total
      if (page.value > data.meta.totalPages && data.meta.totalPages > 0) {
        page.value = data.meta.totalPages
      }
    } catch (e) {
      if (!loadOptions.silent) {
        toast.error(getErrorMessage(e, options.errorMessage || 'Ошибка загрузки'))
      }
    } finally {
      loading.value = false
    }
  }

  function onSortChange(payload: { prop: string; order: string | null }) {
    if (!payload.order) {
      sort.value = options.defaultSort
      order.value = options.defaultOrder ?? 'desc'
    } else {
      sort.value = payload.prop as TSort
      order.value = payload.order === 'ascending' ? 'asc' : 'desc'
    }
    if (page.value !== 1) page.value = 1
    else void load()
  }

  /** После удаления последней строки на странице — уйти на предыдущую. */
  async function afterDelete() {
    if (items.value.length === 1 && page.value > 1) {
      page.value -= 1
    } else {
      await load({ silent: true })
    }
  }

  function replaceItem(id: string, next: T, idOf: (row: T) => string) {
    const idx = items.value.findIndex((row) => idOf(row) === id)
    if (idx >= 0) items.value[idx] = next
  }

  watch(pageSize, () => {
    if (page.value !== 1) page.value = 1
    else void load()
  })

  watch(page, () => {
    void load()
  })

  if (options.immediate !== false) {
    onMounted(() => {
      void load()
    })
  }

  return {
    items,
    loading,
    page,
    pageSize,
    pageSizes,
    total,
    sort,
    order,
    load,
    onSortChange,
    afterDelete,
    replaceItem,
  }
}
