<script setup lang="ts">
import { progressionSection } from '~/data/progression'
</script>

<template>
  <BaseSection id="progression" alt container-class="max-w-5xl">
    <ScrollReveal>
      <h2 class="text-center text-xl font-extrabold leading-snug text-brand-600 sm:text-2xl lg:text-3xl">
        {{ progressionSection.titleBefore }}
        <span class="text-accent-500">{{ progressionSection.titleAccent }}</span>
      </h2>
    </ScrollReveal>

    <ScrollReveal>
      <div class="mt-6 sm:mt-8">
        <div v-if="progressionSection.imageSrc" class="overflow-hidden rounded-2xl">
          <NuxtImg
            :src="progressionSection.imageSrc"
            :alt="progressionSection.imageAlt"
            class="w-full object-contain"
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
        </div>
        <UiSkeletonImage
          v-else
          aspect="video"
          class="min-h-[180px] rounded-2xl border border-brand-100 sm:min-h-[220px] lg:min-h-[280px]"
        >
          <div class="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <svg class="h-10 w-10 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.25">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="mt-3 text-sm text-brand-400">Фото пути воспитанника</p>
          </div>
        </UiSkeletonImage>
      </div>
    </ScrollReveal>

    <ScrollReveal>
      <div class="card mx-auto mt-6 max-w-3xl p-5 text-center sm:mt-8 sm:p-7">
        <p
          v-for="(text, index) in progressionSection.paragraphs"
          :key="index"
          class="text-sm leading-relaxed sm:text-base"
          :class="index === progressionSection.paragraphs.length - 1
            ? 'mt-4 font-bold text-accent-500'
            : 'text-brand-600/75'"
        >
          {{ text }}
        </p>
      </div>
    </ScrollReveal>
  </BaseSection>
</template>
