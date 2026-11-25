<script setup lang="ts">
import { sections } from '~/data/sections'
import ctaPattern from '~/assets/img/pattern-cta.webp'

withDefaults(defineProps<{
  title?: string
  description?: string
  buttonText?: string
  source?: string
}>(), {
  source: 'cta-section',
})

const defaults = sections.cta
</script>

<template>
  <BaseSection id="cta" aria-label="Призыв к действию">
    <ScrollReveal>
      <div class="cta-banner relative overflow-hidden rounded-xl px-5 py-10 sm:rounded-2xl sm:px-8 sm:py-12 lg:px-12 lg:py-16">
        <img
          :src="ctaPattern"
          alt=""
          aria-hidden="true"
          class="cta-banner__bg"
          decoding="async"
        >
        <!-- Затемнение слева под текст, справа паттерн читается яснее -->
        <div class="cta-banner__scrim" aria-hidden="true" />
        <div class="accent-bloom accent-bloom--corner" aria-hidden="true" />

        <div class="relative z-[1] min-w-0 max-w-xl">
          <h2 class="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
            {{ title || defaults.title }}
          </h2>
          <p class="mt-3 text-sm text-white/85 sm:mt-4 sm:text-base">
            {{ description || defaults.description }}
          </p>
          <ModalTrigger
            type="lead"
            :payload="{ source }"
            class="btn-primary mt-6 w-full max-w-full min-w-0 sm:mt-8 sm:w-auto"
          >
            {{ buttonText || defaults.action?.label || 'Оставить заявку' }}
          </ModalTrigger>
        </div>
      </div>
    </ScrollReveal>
  </BaseSection>
</template>

<style scoped>
.cta-banner {
  background-color: #1e3a6e;
}

.cta-banner__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center right;
  pointer-events: none;
  user-select: none;
}

.cta-banner__scrim {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    100deg,
    rgb(15 30 60 / 0.88) 0%,
    rgb(15 30 60 / 0.72) 42%,
    rgb(15 30 60 / 0.35) 72%,
    rgb(15 30 60 / 0.2) 100%
  );
}
</style>
