<script setup lang="ts">
import { pages } from '~/data/pages'
import { site } from '~/data/site'
import {
  emptyNewsPage,
  mapMediaToNews,
  NEWS_PAGE_SIZE,
  withNewsFallback,
  type NewsPageResult,
} from '~/utils/news'

interface TaxonomyItem {
  id: string
  name: string
}

const meta = pages.news

definePageMeta({ breadcrumb: meta.breadcrumb })

usePageSeo(`${meta.title} — ${site.name}`, meta.description)

const route = useRoute()
const router = useRouter()

const page = ref(Math.max(1, Number(route.query.page) || 1))
const topic = ref(typeof route.query.topic === 'string' ? route.query.topic : '')
const pageDirection = ref(1)

const { data: topics } = await useFetch<TaxonomyItem[]>('/api/taxonomies', {
  query: { kind: 'NEWS_TOPIC' },
  default: () => [] as TaxonomyItem[],
})

const { data, pending } = await useFetch<NewsPageResult>('/api/news', {
  query: computed(() => ({
    page: page.value,
    limit: NEWS_PAGE_SIZE,
    ...(topic.value ? { topic: topic.value } : {}),
  })),
  default: () => emptyNewsPage(),
  watch: [page, topic],
})

const allFallback = computed(() => withNewsFallback([]))

const items = computed(() => {
  const mapped = (data.value?.items || []).map(mapMediaToNews)
  if (mapped.length) return mapped
  if (page.value === 1 && !topic.value && import.meta.dev) {
    return allFallback.value.slice(0, NEWS_PAGE_SIZE)
  }
  return []
})

const pageCount = computed(() => {
  const metaPages = data.value?.meta.totalPages || 0
  if (metaPages > 0) return metaPages
  if (!topic.value && import.meta.dev && allFallback.value.length) {
    return Math.max(1, Math.ceil(allFallback.value.length / NEWS_PAGE_SIZE))
  }
  return 1
})

const total = computed(() => data.value?.meta.total || (import.meta.dev && !topic.value ? allFallback.value.length : 0))

const pageButtons = computed(() => {
  const totalPages = pageCount.value
  const current = page.value
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
  const pagesSet = new Set<number>([1, totalPages, current, current - 1, current + 1])
  return [...pagesSet].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)
})

/** Ключ сетки: страница + id карточек — чтобы Transition перезапускал вход */
const gridKey = computed(() => `${page.value}:${topic.value}:${items.value.map((item) => item.slug).join(',')}`)

function syncRoute(nextPage: number, nextTopic: string) {
  router.replace({
    query: {
      ...route.query,
      page: nextPage > 1 ? String(nextPage) : undefined,
      topic: nextTopic || undefined,
    },
  })
}

function goToPage(next: number) {
  const target = Math.min(pageCount.value, Math.max(1, next))
  if (target === page.value) return
  pageDirection.value = target > page.value ? 1 : -1
  page.value = target
  syncRoute(target, topic.value)
  if (import.meta.client) {
    document.getElementById('news-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function setTopic(next: string) {
  if (next === topic.value) return
  topic.value = next
  page.value = 1
  pageDirection.value = 1
  syncRoute(1, next)
  if (import.meta.client) {
    document.getElementById('news-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

watch(
  () => [route.query.page, route.query.topic] as const,
  ([pageValue, topicValue]) => {
    const nextPage = Math.max(1, Number(pageValue) || 1)
    const nextTopic = typeof topicValue === 'string' ? topicValue : ''
    if (nextTopic !== topic.value) {
      topic.value = nextTopic
      pageDirection.value = 1
    }
    if (nextPage !== page.value) {
      pageDirection.value = nextPage > page.value ? 1 : -1
      page.value = nextPage
    }
  },
)

watch(
  pageCount,
  (count) => {
    if (page.value > count) page.value = count
  },
)
</script>

<template>
  <BaseSection page-top alt>
    <Breadcrumbs />
    <SectionHeader v-bind="meta.listHeading" />

    <p v-if="total > 0" class="mt-4 text-sm text-brand-500">
      Всего: <span class="font-semibold text-brand-700">{{ total }}</span>
    </p>

    <div v-if="topics?.length" class="news-topics" role="tablist" aria-label="Темы новостей">
      <button
        type="button"
        class="news-topics__chip"
        :class="{ 'is-active': !topic }"
        role="tab"
        :aria-selected="!topic"
        @click="setTopic('')"
      >
        Все
      </button>
      <button
        v-for="item in topics"
        :key="item.id"
        type="button"
        class="news-topics__chip"
        :class="{ 'is-active': topic === item.name }"
        role="tab"
        :aria-selected="topic === item.name"
        @click="setTopic(item.name)"
      >
        {{ item.name }}
      </button>
    </div>

    <div
      id="news-list"
      class="news-list"
      :class="{ 'is-pending': pending }"
      :style="{ '--news-dir': pageDirection }"
    >
      <Transition
        name="news-swap"
        mode="out-in"
      >
        <ul
          v-if="items.length"
          :key="gridKey"
          class="news-grid"
        >
          <li
            v-for="(item, index) in items"
            :key="item.slug"
            class="news-grid__item"
            :style="{ '--i': index }"
          >
            <NewsCard :item="item" />
          </li>
        </ul>
      </Transition>
    </div>

    <nav
      v-if="pageCount > 1"
      class="news-pagination"
      aria-label="Страницы новостей"
    >
      <button
        type="button"
        class="news-pagination__btn"
        :disabled="page <= 1 || pending"
        @click="goToPage(page - 1)"
      >
        Назад
      </button>

      <button
        v-for="p in pageButtons"
        :key="p"
        type="button"
        class="news-pagination__page"
        :class="{ 'is-active': p === page }"
        :aria-current="p === page ? 'page' : undefined"
        :disabled="pending"
        @click="goToPage(p)"
      >
        {{ p }}
      </button>

      <button
        type="button"
        class="news-pagination__btn"
        :disabled="page >= pageCount || pending"
        @click="goToPage(page + 1)"
      >
        Вперёд
      </button>
    </nav>

    <div
      v-else-if="!pending && !items.length"
      class="empty-panel mt-10"
    >
      <p class="text-base font-semibold text-brand-700">
        {{ topic ? 'В этой теме пока нет новостей' : 'Новости скоро появятся' }}
      </p>
      <p class="mt-2 text-sm text-brand-500">
        {{ topic ? 'Выберите другую тему или посмотрите все публикации.' : 'Сейчас в разделе ещё нет публикаций.' }}
      </p>
      <button
        v-if="topic"
        type="button"
        class="btn-outline mt-6 inline-flex"
        @click="setTopic('')"
      >
        Все новости
      </button>
      <NuxtLink v-else to="/" class="btn-outline mt-6 inline-flex">
        На главную
      </NuxtLink>
    </div>
  </BaseSection>
</template>

<style scoped>
.news-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.25rem;
}

.news-topics__chip {
  min-height: 2rem;
  padding: 0.35rem 0.85rem;
  border: 1px solid var(--card-border);
  border-radius: 999px;
  background: var(--card-bg);
  color: rgb(var(--c-brand-600));
  font-size: 0.8125rem;
  font-weight: 600;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.news-topics__chip.is-active {
  border-color: rgb(var(--c-brand-600));
  background: rgb(var(--c-brand-600));
  color: #fff;
}

.news-topics__chip:not(.is-active):hover {
  border-color: var(--outline-border);
}

.news-list {
  margin-top: 1.5rem;
  min-height: 12rem;
}

@media (min-width: 640px) {
  .news-list {
    margin-top: 2rem;
  }
}

.news-list.is-pending {
  pointer-events: none;
}

.news-grid {
  display: grid;
  gap: 1.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

@media (min-width: 640px) {
  .news-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .news-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

/* Уход текущей страницы */
.news-swap-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.news-swap-leave-to {
  opacity: 0;
  transform: translate3d(calc(var(--news-dir, 1) * -12px), 8px, 0) scale(0.985);
}

/* Вход новой — контейнер, карточки с задержкой */
.news-swap-enter-active {
  transition: opacity 0.2s ease;
}

.news-swap-enter-active .news-grid__item {
  animation: news-card-in 0.48s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--i, 0) * 55ms);
}

.news-swap-enter-from {
  opacity: 0;
}

@keyframes news-card-in {
  from {
    opacity: 0;
    transform: translate3d(calc(var(--news-dir, 1) * 18px), 16px, 0);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .news-swap-leave-active,
  .news-swap-enter-active {
    transition: none;
  }

  .news-swap-enter-active .news-grid__item {
    animation: none;
  }

  .news-swap-leave-to,
  .news-swap-enter-from {
    opacity: 1;
    transform: none;
  }
}

.news-pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  margin-top: 2rem;
}

.news-pagination__btn,
.news-pagination__page {
  min-width: 2.25rem;
  min-height: 2.25rem;
  padding: 0.35rem 0.7rem;
  border: 1px solid var(--card-border);
  border-radius: 0.65rem;
  background: var(--card-bg);
  color: rgb(var(--c-brand-600));
  font-size: 0.8125rem;
  font-weight: 600;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.15s ease;
}

.news-pagination__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.news-pagination__page.is-active {
  border-color: rgb(var(--c-brand-600));
  background: rgb(var(--c-brand-600));
  color: #fff;
}

.news-pagination__btn:not(:disabled):hover,
.news-pagination__page:not(.is-active):hover {
  border-color: var(--outline-border);
  filter: brightness(0.98);
}

.news-pagination__btn:not(:disabled):active,
.news-pagination__page:not(.is-active):active {
  transform: scale(0.96);
}
</style>
