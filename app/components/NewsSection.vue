<script setup lang="ts">
import { sections } from '~/data/sections'
import { mapMediaToNews, type MediaNewsDto } from '~/utils/news'
import type { SectionEdge, SectionTone } from '~/utils/sectionSurface'

withDefaults(defineProps<{
  tone?: SectionTone
  edge?: SectionEdge
  flipWave?: boolean
  wave?: boolean
}>(), {
  tone: 'mist',
  edge: 'wave',
  flipWave: false,
  wave: true,
})

const config = sections.news

const { data } = await useFetch<MediaNewsDto[]>('/api/media', {
  query: { type: 'NEWS' },
  key: 'home-news',
  default: () => [],
})

const latest = computed(() => (data.value || []).map(mapMediaToNews).slice(0, 3))
</script>

<template>
  <BaseSection
    v-if="latest.length"
    id="news"
    :tone="tone"
    :edge="edge"
    :flip-wave="flipWave"
    :wave="wave"
  >
    <template #default="{ headingId }">
      <SectionHeader
        v-bind="config"
        :title-id="headingId"
        :action="config.action"
      />

      <ScrollReveal>
        <div class="mt-8 grid gap-6 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
          <NewsCard
            v-for="item in latest"
            :key="item.slug"
            :item="item"
          />
        </div>
      </ScrollReveal>
    </template>
  </BaseSection>
</template>
