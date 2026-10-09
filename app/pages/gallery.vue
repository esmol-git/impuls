<script setup lang="ts">
import {
  GALLERY_PAGE_BATCH,
  mapMediaToGalleryItems,
  type GalleryMediaDto,
} from '~/data/gallery'
import { pages } from '~/data/pages'
import { site } from '~/data/site'

const meta = pages.gallery

definePageMeta({ breadcrumb: meta.breadcrumb })

usePageSeo(`${meta.title} — ${site.name}`, meta.description)

const { data } = await useFetch<GalleryMediaDto[]>('/api/media', {
  query: { type: 'GALLERY', limit: 300 },
  key: 'page-gallery-shots',
  default: () => [],
  transform: (rows) => (Array.isArray(rows) ? rows.filter((row) => !!row?.imageUrl) : []),
})

const items = computed(() => mapMediaToGalleryItems(data.value))
</script>

<template>
  <div>
    <BaseSection page-top alt>
      <ScrollReveal>
        <Breadcrumbs />
        <SectionHeader v-bind="meta.heading" />
      </ScrollReveal>

      <GalleryGrid
        v-if="items.length"
        :items="items"
        :initial-count="GALLERY_PAGE_BATCH"
        :batch-size="GALLERY_PAGE_BATCH"
      />
      <p v-else class="mt-10 text-center text-brand-600/70">
        Пока нет фотографий — скоро добавим.
      </p>
    </BaseSection>

    <CtaSection
      title="Хотите увидеть школу вживую?"
      description="Запишитесь на бесплатное пробное занятие — приходите на тренировку и познакомитесь с тренером."
      button-text="Записаться на пробное"
      source="gallery-page-bottom"
    />
  </div>
</template>
