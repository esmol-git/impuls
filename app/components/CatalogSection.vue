<script setup lang="ts">
import { sections } from '~/data/sections'
import { mapMediaToCatalog, type CatalogItem } from '~/utils/catalog'
import type { SectionEdge, SectionTone } from '~/utils/sectionSurface'

withDefaults(defineProps<{
  tone?: SectionTone
  edge?: SectionEdge
  flipWave?: boolean
  wave?: boolean
}>(), {
  tone: 'paper',
  edge: 'slant',
  flipWave: false,
  wave: true,
})

const config = sections.catalog

const { data } = await useFetch<CatalogItem[]>('/api/media', {
  query: { type: 'CATALOG' },
  key: 'home-catalog',
  default: () => [],
})

const latest = computed(() => (data.value || []).map(mapMediaToCatalog).slice(0, 3))
</script>

<template>
  <BaseSection
    v-if="latest.length"
    id="catalog"
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
          <CatalogCard
            v-for="item in latest"
            :key="item.id"
            :item="item"
          />
        </div>
      </ScrollReveal>
    </template>
  </BaseSection>
</template>
