<script setup lang="ts">
import { audienceCards, audienceSection } from '~/data/audience'
</script>

<template>
  <BaseSection id="audience" container-class="max-w-6xl">
    <ScrollReveal>
      <h2 class="text-center text-xl font-extrabold leading-snug text-brand-600 sm:text-2xl lg:text-3xl">
        {{ audienceSection.titleBefore }}
        <span class="text-accent-500">{{ audienceSection.titleAccent }}</span>
      </h2>
    </ScrollReveal>

    <ScrollReveal>
      <ul class="mt-6 grid list-none items-stretch gap-4 sm:mt-8 lg:grid-cols-3 lg:gap-5">
        <li
          v-for="card in audienceCards"
          :key="card.id"
          class="min-h-0"
        >
          <article class="card flex h-full flex-col overflow-hidden">
            <UiSkeletonImage
              aspect="auto"
              class="audience-card__media !rounded-none"
            >
              <img
                v-if="card.imageSrc"
                :src="card.imageSrc"
                :alt="card.imageAlt"
                class="absolute inset-0 h-full w-full object-cover"
                :class="card.id === 'results' ? 'object-[center_20%]' : 'object-center'"
                loading="lazy"
                decoding="async"
              >
              <div
                v-else
                class="absolute inset-0 flex items-center justify-center text-brand-300"
              >
                <svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </UiSkeletonImage>

            <div class="flex flex-1 flex-col p-4 sm:p-5">
              <h3 class="min-h-[3.25rem] text-base font-bold leading-snug text-brand-600 sm:min-h-[3.5rem] sm:text-lg">
                {{ card.title }}
              </h3>
              <p class="mt-2 flex-1 text-sm leading-relaxed text-brand-600/70">
                {{ card.description }}
              </p>
            </div>
          </article>
        </li>
      </ul>
    </ScrollReveal>
  </BaseSection>
</template>

<style scoped>
.audience-card__media {
  aspect-ratio: 4 / 3;
  width: 100%;
  flex-shrink: 0;
}

@media (min-width: 1024px) {
  .audience-card__media {
    aspect-ratio: 5 / 4;
  }
}
</style>
