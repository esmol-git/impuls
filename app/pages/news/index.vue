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

    <ul class="mt-8 grid list-none gap-6 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="item in items" :key="item.slug">
        <NewsCard :item="item" />
      </li>
    </ul>
  </BaseSection>
</template>
