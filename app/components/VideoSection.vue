<script setup lang="ts">
import { sections } from '~/data/sections'

const config = sections.video
</script>

<template>
  <BaseSection id="video" v-slot="{ headingId }">
    <SectionHeader v-bind="config" :title-id="headingId" />

    <ScrollReveal>
      <div class="relative mt-8 overflow-hidden rounded-2xl bg-brand-600 sm:mt-10">
        <div
          class="absolute inset-0 opacity-30"
          aria-hidden="true"
          style="background-image: radial-gradient(circle at 20% 50%, #ffffff 0%, transparent 40%), radial-gradient(circle at 80% 50%, #b0191b 0%, transparent 50%)"
        />
        <div class="relative flex aspect-video flex-col items-center justify-center px-6 text-center">
          <button
            type="button"
            class="group flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-accent-500 shadow-xl transition hover:scale-105 hover:bg-white sm:h-20 sm:w-20"
            aria-label="Смотреть видео о школе"
            disabled
          >
            <svg class="ml-1 h-7 w-7 sm:h-8 sm:w-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
          <p class="mt-4 text-sm font-semibold text-white sm:text-base">Видео о нашей школе</p>
          <p class="mt-1 text-xs text-white/60 sm:text-sm">Скоро добавим</p>
        </div>
      </div>
    </ScrollReveal>
  </BaseSection>
</template>
