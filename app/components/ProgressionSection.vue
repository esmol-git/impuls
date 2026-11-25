<script setup lang="ts">
import { progressionSection } from '~/data/progression'
</script>

<template>
  <BaseSection id="progression" container-class="max-w-6xl">
    <ScrollReveal>
      <h2 class="text-center text-xl font-extrabold leading-snug text-brand-600 sm:text-2xl lg:text-3xl">
        {{ progressionSection.titleBefore }}
        <span class="text-accent-500">{{ progressionSection.titleAccent }}</span>
      </h2>

      <div class="mt-6 sm:mt-8">
        <img
          :src="progressionSection.imageSrc"
          :alt="progressionSection.imageAlt"
          class="progression-visual__img"
          width="1920"
          height="557"
          loading="lazy"
          decoding="async"
        >
      </div>

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

<style scoped>
.progression-visual__img {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
  object-position: center;
}
</style>
