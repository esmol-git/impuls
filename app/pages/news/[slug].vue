<script setup lang="ts">
import { newsArticleBreadcrumbs } from '~/data/breadcrumbs'
import { site } from '~/data/site'
import { pages } from '~/data/pages'
import { formatNewsDate, getNewsBySlug, newsItems } from '~/data/news'
import { mapMediaToNews, type MediaNewsDto } from '~/utils/news'
import { sanitizeHtml } from '~/utils/sanitizeHtml'
import type { NewsItem } from '~/types'

const route = useRoute()
const slug = route.params.slug as string

const { data: remote } = await useFetch<NewsItem | null>(`/api/news/${slug}`, {
  default: () => null,
})

const article = computed<NewsItem | null>(() => {
  if (remote.value) return remote.value
  if (import.meta.dev) return getNewsBySlug(slug) || null
  return null
})

const current = article.value
if (!current) {
  throw createError({ statusCode: 404, statusMessage: 'Новость не найдена' })
}

const safeBody = computed(() => sanitizeHtml(article.value?.body))

definePageMeta({ breadcrumb: pages.newsArticle.breadcrumb })

usePageSeo(
  `${current.title} — ${site.name}`,
  current.excerpt,
  current.imageUrl || undefined,
)

const breadcrumbs = computed(() => newsArticleBreadcrumbs(article.value?.title || current.title))

const { data: list } = await useFetch<MediaNewsDto[]>('/api/media', {
  query: { type: 'NEWS' },
  default: () => [] as MediaNewsDto[],
})

const relatedNews = computed(() => {
  const currentSlug = article.value?.slug || current.slug
  const fromApi = (list.value || [])
    .map(mapMediaToNews)
    .filter(item => item.slug !== currentSlug)
    .slice(0, 3)

  if (fromApi.length) return fromApi
  if (!import.meta.dev) return []
  return newsItems.filter(item => item.slug !== currentSlug).slice(0, 3)
})
</script>

<template>
  <article v-if="article" class="section-padding section-alt page-top">
    <div class="container-site">
      <Breadcrumbs :items="breadcrumbs" />

      <header class="mt-6 sm:mt-8">
        <div class="mb-4 flex flex-wrap items-center gap-3 text-sm">
          <span class="rounded-md bg-accent-50 px-3 py-1 font-semibold text-accent-500">
            {{ article.category }}
          </span>
          <time :datetime="article.date" class="text-brand-400">
            {{ formatNewsDate(article.date) }}
          </time>
        </div>

        <h1 class="text-3xl font-bold text-brand-600 sm:text-4xl">
          {{ article.title }}
        </h1>
      </header>

      <div
        v-if="safeBody"
        class="prose-news mt-8 text-brand-600/80 leading-relaxed"
        v-html="safeBody"
      />
      <div v-else class="mt-8 space-y-4 text-brand-600/80 leading-relaxed">
        <p>{{ article.excerpt }}</p>
      </div>

      <aside class="mt-12 border-t border-brand-100 pt-8">
        <h2 class="mb-4 text-sm font-semibold text-brand-600">Другие новости</h2>
        <ul class="space-y-2">
          <li v-for="item in relatedNews" :key="item.slug">
            <NuxtLink :to="`/news/${item.slug}`" class="text-sm text-brand-600/70 hover:text-accent-500">
              {{ item.title }}
            </NuxtLink>
          </li>
        </ul>
      </aside>
    </div>
  </article>
</template>

<style scoped>
.prose-news :deep(p) {
  margin: 0 0 0.85em;
}

.prose-news :deep(h2) {
  margin: 1.1em 0 0.45em;
  font-size: 1.35rem;
  font-weight: 800;
  color: #1e3a8a;
}

.prose-news :deep(h3) {
  margin: 1em 0 0.4em;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e3a8a;
}

.prose-news :deep(ul),
.prose-news :deep(ol) {
  margin: 0 0 0.85em;
  padding-left: 1.25rem;
}

.prose-news :deep(a) {
  color: #1d4ed8;
  text-decoration: underline;
}

/* Пока все картинки в тексте на всю ширину; размеры вернём отдельно */
.prose-news :deep(img) {
  display: block;
  width: 100% !important;
  max-width: 100% !important;
  height: auto;
  margin: 1.25em 0;
  border-radius: 6px;
  object-fit: cover;
}

.prose-news :deep(.rte-columns) {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin: 1em 0;
}

.prose-news :deep(.rte-column) {
  min-width: 0;
}

.prose-news :deep(.rte-column img) {
  width: 100% !important;
  max-width: 100% !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}

@media (max-width: 640px) {
  .prose-news :deep(.rte-columns) {
    grid-template-columns: 1fr;
  }
}
</style>
