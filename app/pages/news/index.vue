<script setup lang="ts">
import { pages } from '~/data/pages'
import { site } from '~/data/site'
import { mapMediaToNews, withNewsFallback, type MediaNewsDto } from '~/utils/news'

const meta = pages.news

definePageMeta({ breadcrumb: meta.breadcrumb })

usePageSeo(`${meta.title} — ${site.name}`, meta.description)

const { data } = await useFetch<MediaNewsDto[]>('/api/media', {
  query: { type: 'NEWS' },
  default: () => [],
})

const items = computed(() => withNewsFallback((data.value || []).map(mapMediaToNews)))
</script>

<template>
  <BaseSection page-top alt>
    <Breadcrumbs />
    <SectionHeader v-bind="meta.listHeading" />

    <ul
      v-if="items.length"
      class="mt-8 grid list-none gap-6 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3"
    >
      <li v-for="item in items" :key="item.slug">
        <NewsCard :item="item" />
      </li>
    </ul>

    <div
      v-else
      class="empty-panel mt-10"
    >
      <p class="text-base font-semibold text-brand-700">Новости скоро появятся</p>
      <p class="mt-2 text-sm text-brand-500">
        Сейчас в разделе ещё нет публикаций.
      </p>
      <NuxtLink to="/" class="btn-outline mt-6 inline-flex">
        На главную
      </NuxtLink>
    </div>
  </BaseSection>
</template>
