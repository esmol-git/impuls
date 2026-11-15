<script setup lang="ts">
import {
  HOME_GALLERY_COUNT,
  mapMediaToGalleryItems,
  type GalleryMediaDto,
} from '~/data/gallery'
import { sections } from '~/data/sections'
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
  tone: 'mist',
  edge: 'wave',
  flipWave: false,
  wave: true,
})

const config = sections.gallery
const headingId = 'gallery-title'
const surface = computed(() => SECTION_SURFACE[props.tone])
const decor = decorFor('gallery')
const decos = decosOf(decor)
const glows = glowsOf(decor)

const { data } = await useFetch<GalleryMediaDto[]>('/api/media', {
  query: { type: 'GALLERY', limit: HOME_GALLERY_COUNT },
  key: 'home-gallery-shots',
  default: () => [],
  transform: (rows) => (Array.isArray(rows) ? rows.filter((row) => !!row?.imageUrl) : []),
})

const items = computed(() => mapMediaToGalleryItems(data.value).slice(0, HOME_GALLERY_COUNT))
</script>

<template>
  <section
    v-if="items.length"
    id="gallery"
    class="gallery-section section-padding"
    :class="{ 'gallery-section--edge': wave }"
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
      />
      <GalleryGrid :items="items" />
    </div>
  </section>
</template>

<style scoped>
.gallery-section {
  position: relative;
  z-index: 0;
  isolation: isolate;
  overflow-x: clip;
  overflow-y: visible;
}

.gallery-section--edge {
  padding-bottom: 5rem;
}

@media (min-width: 640px) {
  .gallery-section--edge {
    padding-bottom: 6rem;
  }
}

@media (min-width: 768px) {
  .gallery-section--edge {
    padding-top: calc(3.25rem + 0.75rem);
    padding-bottom: 6.5rem;
  }
}

@media (min-width: 1024px) {
  .gallery-section--edge {
    padding-top: calc(4rem + 1rem);
    padding-bottom: 7.5rem;
  }
}
</style>
