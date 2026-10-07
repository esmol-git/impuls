<script setup lang="ts">
import { sections } from '~/data/sections'
import { mapMediaToCatalog, type CatalogItem } from '~/utils/catalog'

const config = sections.catalog

const { data } = await useFetch<CatalogItem[]>('/api/media', {
  query: { type: 'CATALOG' },
  default: () => [],
})

const latest = computed(() => (data.value || []).map(mapMediaToCatalog).slice(0, 3))
</script>

<template>
  <BaseSection id="catalog" v-slot="{ headingId }">
    <SectionHeader
      v-bind="config"
      :title-id="headingId"
      :action="config.action"
    />

    <div class="mt-8 grid gap-6 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
      <ScrollReveal v-for="item in latest" :key="item.id">
        <CatalogCard :item="item" />
      </ScrollReveal>
    </div>
  </BaseSection>
</template>
