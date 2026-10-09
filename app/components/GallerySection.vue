<script setup lang="ts">
import {
  HOME_GALLERY_COUNT,
  mapMediaToGalleryItems,
  type GalleryMediaDto,
} from '~/data/gallery'
import { sections } from '~/data/sections'

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
  <BaseSection v-if="items.length" id="gallery" alt v-slot="{ headingId }">
    <SectionHeader
      v-bind="config"
      :title-id="headingId"
    />
    <GalleryGrid :items="items" />
  </BaseSection>
</template>
