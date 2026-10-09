<script setup lang="ts">
import { pages } from '~/data/pages'
import { site } from '~/data/site'
import {
  CATALOG_PAGE_SIZE,
  emptyCatalogPage,
  mapMediaToCatalog,
  type CatalogPageResult,
  type CatalogSort,
} from '~/utils/catalog'

const meta = pages.catalog

definePageMeta({ breadcrumb: meta.breadcrumb })

usePageSeo(`${meta.title} — ${site.name}`, meta.description)

const { visible } = await useManagedSections()
const route = useRoute()
const router = useRouter()

function parseCategories(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => String(item).split(',')).map((s) => s.trim()).filter(Boolean)
  }
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((s) => s.trim()).filter(Boolean)
  }
  return []
}

function parseSort(value: unknown): CatalogSort {
  const allowed: CatalogSort[] = ['default', 'price-asc', 'price-desc', 'title']
  return typeof value === 'string' && allowed.includes(value as CatalogSort)
    ? (value as CatalogSort)
    : 'default'
}

const page = ref(Math.max(1, Number(route.query.page) || 1))
const categories = ref(parseCategories(route.query.categories))
const priceMin = ref(Number(route.query.priceMin) || 0)
const priceMax = ref(Number(route.query.priceMax) || 0)
const onlySale = ref(route.query.onlySale === '1' || route.query.onlySale === 'true')
const query = ref(typeof route.query.q === 'string' ? route.query.q : '')
const sort = ref<CatalogSort>(parseSort(route.query.sort))
const debouncedQuery = ref(query.value)
const debouncedPriceMin = ref(priceMin.value)
const debouncedPriceMax = ref(priceMax.value)

/** Границы цены уже известны (из URL или с сервера) */
const priceBoundsReady = ref(
  Number(route.query.priceMin) > 0 && Number(route.query.priceMax) > 0,
)
const filtersReady = ref(false)
/** Полный диапазон с API — чтобы не тащить data внутрь fetchQuery (лишний refetch) */
const facetPriceMin = ref(0)
const facetPriceMax = ref(0)

let searchTimer: ReturnType<typeof setTimeout> | null = null
let priceTimer: ReturnType<typeof setTimeout> | null = null

watch(query, (value) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    debouncedQuery.value = value
  }, 300)
})

watch([priceMin, priceMax], ([min, max]) => {
  if (priceTimer) clearTimeout(priceTimer)
  priceTimer = setTimeout(() => {
    debouncedPriceMin.value = min
    debouncedPriceMax.value = max
  }, 250)
})

const fetchQuery = computed(() => {
  const params: Record<string, string | number | boolean> = {
    page: page.value,
    limit: CATALOG_PAGE_SIZE,
    sort: sort.value,
  }

  if (categories.value.length) params.categories = categories.value.join(',')
  if (debouncedQuery.value.trim()) params.q = debouncedQuery.value.trim()
  if (onlySale.value) params.onlySale = true

  /**
   * priceMin/Max только если диапазон сужен (URL / слайдер).
   * Иначе после первого ответа bounds → новый query → refetch → pending → opacity на карточках.
   */
  if (priceBoundsReady.value) {
    const min = debouncedPriceMin.value
    const max = debouncedPriceMax.value
    const narrowed =
      facetPriceMin.value <= 0
      || facetPriceMax.value <= 0
      || min > facetPriceMin.value
      || max < facetPriceMax.value
    if (narrowed && min > 0 && max > 0) {
      params.priceMin = min
      params.priceMax = max
    }
  }

  return params
})

/** Стабильный ключ: computed каждый раз отдаёт новый объект и провоцировал лишний watch */
const fetchQueryKey = computed(() => JSON.stringify(fetchQuery.value))

const { data, pending, status } = await useFetch<CatalogPageResult>('/api/catalog', {
  query: fetchQuery,
  key: 'catalog-page',
  default: () => emptyCatalogPage(),
  watch: [fetchQueryKey],
})

const facets = computed(() => data.value?.facets ?? emptyCatalogPage().facets)
const items = computed(() => (data.value?.items || []).map(mapMediaToCatalog))
const total = computed(() => data.value?.meta.total || 0)
const pageCount = computed(() => data.value?.meta.totalPages || 1)

const sectionEnabled = computed(() => visible.value.catalog)
const hasCatalog = computed(() => (data.value?.facets.totalAll ?? 0) > 0)
/** Первый ответ ещё не пришёл — скелетон; пустой ответ API ≠ loading */
const awaitingData = computed(
  () => pending.value && !hasCatalog.value && items.value.length === 0,
)
const loading = computed(() => pending.value || status.value === 'idle')

const showBootSkeleton = computed(() => sectionEnabled.value && awaitingData.value)
const showCatalog = computed(() => sectionEnabled.value && hasCatalog.value)
const showEmptyCatalog = computed(
  () => sectionEnabled.value && !pending.value && !hasCatalog.value,
)
const showFilterEmpty = computed(
  () => showCatalog.value && !pending.value && items.value.length === 0,
)
const showGridSkeleton = computed(
  () => showCatalog.value && pending.value && items.value.length === 0,
)

watch(
  () => data.value?.facets,
  (next) => {
    if (!next) return

    facetPriceMin.value = next.priceMin
    facetPriceMax.value = next.priceMax

    if (!priceBoundsReady.value) {
      const fromUrlMin = Number(route.query.priceMin)
      const fromUrlMax = Number(route.query.priceMax)
      priceMin.value =
        Number.isFinite(fromUrlMin) && fromUrlMin > 0 ? fromUrlMin : next.priceMin
      priceMax.value =
        Number.isFinite(fromUrlMax) && fromUrlMax > 0 ? fromUrlMax : next.priceMax
      debouncedPriceMin.value = priceMin.value
      debouncedPriceMax.value = priceMax.value
      priceBoundsReady.value = true
      nextTick(() => {
        filtersReady.value = true
      })
      return
    }

    if (priceMin.value < next.priceMin) priceMin.value = next.priceMin
    if (priceMax.value > next.priceMax) priceMax.value = next.priceMax
  },
  { immediate: true },
)

watch(
  [categories, debouncedPriceMin, debouncedPriceMax, onlySale, debouncedQuery, sort],
  () => {
    if (!filtersReady.value) return
    if (page.value !== 1) page.value = 1
  },
)

watch(
  [page, categories, debouncedPriceMin, debouncedPriceMax, onlySale, debouncedQuery, sort, priceBoundsReady],
  () => {
    if (!priceBoundsReady.value || awaitingData.value) return

    const nextQuery: Record<string, string> = {}
    if (page.value > 1) nextQuery.page = String(page.value)
    if (categories.value.length) nextQuery.categories = categories.value.join(',')
    if (debouncedQuery.value.trim()) nextQuery.q = debouncedQuery.value.trim()
    if (onlySale.value) nextQuery.onlySale = '1'
    if (sort.value !== 'default') nextQuery.sort = sort.value
    if (debouncedPriceMin.value > facets.value.priceMin) {
      nextQuery.priceMin = String(debouncedPriceMin.value)
    }
    if (debouncedPriceMax.value < facets.value.priceMax) {
      nextQuery.priceMax = String(debouncedPriceMax.value)
    }

    const current = route.query
    const same =
      String(current.page || '') === (nextQuery.page || '') &&
      String(current.categories || '') === (nextQuery.categories || '') &&
      String(current.q || '') === (nextQuery.q || '') &&
      String(current.onlySale || '') === (nextQuery.onlySale || '') &&
      String(current.sort || '') === (nextQuery.sort || '') &&
      String(current.priceMin || '') === (nextQuery.priceMin || '') &&
      String(current.priceMax || '') === (nextQuery.priceMax || '')

    if (!same) {
      router.replace({ query: nextQuery })
    }
  },
)

const pageButtons = computed(() => {
  const totalPages = pageCount.value
  const current = page.value
  const windowSize = 5
  let start = Math.max(1, current - Math.floor(windowSize / 2))
  let end = Math.min(totalPages, start + windowSize - 1)
  start = Math.max(1, end - windowSize + 1)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

function goToPage(next: number) {
  if (next < 1 || next > pageCount.value || next === page.value) return
  page.value = next
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function onFiltersReset() {
  page.value = 1
}
</script>

<template>
  <div>
    <BaseSection page-top alt>
      <Breadcrumbs />
      <SectionHeader v-bind="meta.listHeading" />

      <!-- Пока нет данных с API — только скелетон -->
      <div v-if="showBootSkeleton" class="mt-8 sm:mt-10">
        <CatalogSkeleton :count="6" />
      </div>

      <template v-else-if="showCatalog">
        <div class="mt-8 sm:mt-10">
          <CatalogFilters
            v-model:categories="categories"
            v-model:price-min="priceMin"
            v-model:price-max="priceMax"
            v-model:only-sale="onlySale"
            v-model:query="query"
            v-model:sort="sort"
            :facets="facets"
            @reset="onFiltersReset"
          />
        </div>

        <p class="mt-4 text-sm text-brand-500">
          <template v-if="pending && !items.length">Загрузка…</template>
          <template v-else>
            Найдено: <span class="font-semibold text-brand-700">{{ total }}</span>
          </template>
        </p>

        <div class="relative mt-4">
          <CatalogSkeleton
            v-if="showGridSkeleton"
            :filters="false"
            :count="6"
          />

          <div
            v-else-if="items.length"
            class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            :class="{ 'opacity-60 transition-opacity': pending && filtersReady }"
          >
            <CatalogCard
              v-for="item in items"
              :key="item.id"
              :item="item"
            />
          </div>

          <div
            v-else-if="showFilterEmpty"
            class="rounded-2xl border border-dashed border-brand-200 bg-brand-50/60 px-6 py-10 text-center"
          >
            <p class="font-semibold text-brand-700">Ничего не найдено</p>
            <p class="mt-1 text-sm text-brand-500">
              Попробуйте сбросить фильтры или изменить диапазон цены.
            </p>
          </div>
        </div>

        <nav
          v-if="pageCount > 1 && !showGridSkeleton"
          class="catalog-pagination"
          aria-label="Страницы каталога"
        >
          <button
            type="button"
            class="catalog-pagination__btn"
            :disabled="page <= 1 || pending"
            @click="goToPage(page - 1)"
          >
            Назад
          </button>

          <button
            v-for="p in pageButtons"
            :key="p"
            type="button"
            class="catalog-pagination__page"
            :class="{ 'is-active': p === page }"
            :aria-current="p === page ? 'page' : undefined"
            :disabled="pending"
            @click="goToPage(p)"
          >
            {{ p }}
          </button>

          <button
            type="button"
            class="catalog-pagination__btn"
            :disabled="page >= pageCount || pending"
            @click="goToPage(page + 1)"
          >
            Вперёд
          </button>
        </nav>
      </template>

      <!-- Пусто только после реального ответа API -->
      <div
        v-else-if="showEmptyCatalog || !sectionEnabled"
        class="mt-10 rounded-2xl border border-brand-100 bg-white px-6 py-12 text-center shadow-card"
      >
        <p class="text-base font-semibold text-brand-700">Каталог скоро появится</p>
        <p class="mt-2 text-sm text-brand-500">
          Сейчас раздел скрыт или в нём ещё нет товаров.
        </p>
        <NuxtLink to="/" class="btn-outline mt-6 inline-flex">
          На главную
        </NuxtLink>
      </div>

      <!-- На всякий случай, если секция включена, а ветка ещё не выбрана -->
      <div v-else-if="sectionEnabled && loading" class="mt-8 sm:mt-10">
        <CatalogSkeleton :count="6" />
      </div>
    </BaseSection>

    <CtaSection
      v-if="showCatalog"
      title="Есть вопросы по товару?"
      description="Оставьте заявку — подскажем по размерам, наличию и доставке."
      button-text="Оставить заявку"
      source="catalog-page-bottom"
    />
  </div>
</template>

<style scoped>
.catalog-pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  margin-top: 2rem;
}

.catalog-pagination__btn,
.catalog-pagination__page {
  min-width: 2.25rem;
  min-height: 2.25rem;
  padding: 0.35rem 0.7rem;
  border: 1px solid rgb(226 232 240);
  border-radius: 0.65rem;
  background: #fff;
  color: #0b2a5b;
  font-size: 0.8125rem;
  font-weight: 600;
}

.catalog-pagination__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.catalog-pagination__page.is-active {
  border-color: #0b2a5b;
  background: #0b2a5b;
  color: #fff;
}

.catalog-pagination__btn:not(:disabled):hover,
.catalog-pagination__page:not(.is-active):hover {
  border-color: rgb(148 163 184);
  background: rgb(248 250 252);
}
</style>
