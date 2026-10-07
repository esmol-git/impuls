<script setup lang="ts">
import { sections } from '~/data/sections'
import { mapMediaToNews, type MediaNewsDto } from '~/utils/news'

const config = sections.news

const { data } = await useFetch<MediaNewsDto[]>('/api/media', {
  query: { type: 'NEWS' },
  default: () => [],
})

/** На главной показываем только реальные новости из API (раздел скрывается, если их нет) */
const latest = computed(() => (data.value || []).map(mapMediaToNews).slice(0, 3))
</script>

<template>
  <BaseSection id="news" alt v-slot="{ headingId }">
    <SectionHeader
      v-bind="config"
      :title-id="headingId"
      :action="config.action"
    />

    <div class="mt-8 grid gap-6 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
      <ScrollReveal v-for="item in latest" :key="item.slug">
        <NewsCard :item="item" />
      </ScrollReveal>
    </div>
  </BaseSection>
</template>
