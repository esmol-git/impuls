<script setup lang="ts">
import { sections } from '~/data/sections'
import { mapMediaToCatalog, type CatalogItem } from '~/utils/catalog'
import { decorFor, decosOf, glowsOf } from '~/data/sectionDecor'
import {
  SECTION_SURFACE,
  type SectionEdge,
  type SectionTone,
} from '~/utils/sectionSurface'

const props = withDefaults(defineProps<{
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
const headingId = 'catalog-title'
const surface = computed(() => SECTION_SURFACE[props.tone])
const decor = decorFor('catalog')
const decos = decosOf(decor)
const glows = glowsOf(decor)

const { data } = await useFetch<CatalogItem[]>('/api/media', {
  query: { type: 'CATALOG' },
  default: () => [],
})

const latest = computed(() => (data.value || []).map(mapMediaToCatalog).slice(0, 3))
</script>

<template>
  <section
    id="catalog"
    class="catalog-section section-padding"
    :class="{ 'catalog-section--edge': wave }"
    :aria-labelledby="headingId"
    :style="{ '--section-surface': surface, backgroundColor: surface }"
  >
    <SectionWave
      v-if="wave"
      :fill="surface"
      :flip="flipWave"
      :variant="edge"
    />
    <SectionAmbient :glows="glows" />
    <SectionWash
      v-if="decor?.wash"
      v-bind="decor.wash"
    />
    <SectionDeco
      v-for="(item, i) in decos"
      :key="i"
      v-bind="item"
    />

    <div class="container-site relative z-[2]">
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
    </div>
  </section>
</template>

<style scoped>
.catalog-section {
  position: relative;
  z-index: 0;
  isolation: isolate;
  overflow-x: clip;
  overflow-y: visible;
}

.catalog-section--edge {
  padding-bottom: 5rem;
}

@media (min-width: 640px) {
  .catalog-section--edge {
    padding-bottom: 6rem;
  }
}

@media (min-width: 768px) {
  .catalog-section--edge {
    padding-top: calc(3.25rem + 0.75rem);
    padding-bottom: 6.5rem;
  }
}

@media (min-width: 1024px) {
  .catalog-section--edge {
    padding-top: calc(4rem + 1rem);
    padding-bottom: 7.5rem;
  }
}
</style>
