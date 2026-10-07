<script setup lang="ts">
import { galleryItems } from '~/data/gallery'
import { sections } from '~/data/sections'

const config = sections.gallery
const { open } = useLightbox()
</script>

<template>
  <BaseSection id="gallery" alt v-slot="{ headingId }">
    <SectionHeader
      v-bind="config"
      :title-id="headingId"
    />
    <ul class="mt-8 grid list-none grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-4">
      <li v-for="(item, index) in galleryItems" :key="item.id">
        <button
          type="button"
          class="group relative w-full overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2"
          :aria-label="`Открыть ${item.alt}`"
          @click="open(index, galleryItems)"
        >
          <UiSkeletonImage aspect="square">
            <img
              v-if="item.src"
              :src="item.src"
              :alt="item.alt"
              class="absolute inset-0 h-full w-full object-cover transition group-hover:scale-105"
              loading="lazy"
            >
            <div v-else class="absolute inset-0 flex items-center justify-center">
              <svg class="h-8 w-8 text-brand-300 transition group-hover:text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </UiSkeletonImage>
          <div class="absolute inset-0 bg-brand-900/0 transition group-hover:bg-brand-900/10" aria-hidden="true" />
        </button>
      </li>
    </ul>
  </BaseSection>
</template>
