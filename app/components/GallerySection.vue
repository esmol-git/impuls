<script setup lang="ts">
import {
  HOME_GALLERY_COUNT,
  mapMediaToGalleryItems,
  type GalleryMediaDto,
} from '~/data/gallery'
import { sections } from '~/data/sections'
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

const config = sections.gallery

const { data } = await useFetch<GalleryMediaDto[]>('/api/media', {
  query: { type: 'GALLERY', limit: HOME_GALLERY_COUNT },
  key: 'home-gallery-shots',
  default: () => [],
  transform: (rows) => (Array.isArray(rows) ? rows.filter((row) => !!row?.imageUrl) : []),
})

const items = computed(() => mapMediaToGalleryItems(data.value).slice(0, HOME_GALLERY_COUNT))
</script>

<template>
  <BaseSection
    v-if="items.length"
    id="gallery"
    :tone="tone"
    :edge="edge"
    :flip-wave="flipWave"
    :wave="wave"
  >
    <template #default="{ headingId }">
      <SectionHeader
        v-bind="config"
        :title-id="headingId"
      />
      <GalleryGrid :items="items" />
    </template>
  </BaseSection>
</template>
