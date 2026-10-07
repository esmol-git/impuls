<script setup lang="ts">
import { sections } from '~/data/sections'

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
      <div class="relative overflow-hidden rounded-xl bg-brand-600 px-5 py-10 sm:rounded-2xl sm:px-8 sm:py-12 lg:px-12 lg:py-16">
        <div class="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent-500/20 blur-3xl" aria-hidden="true" />
        <div class="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/5 blur-2xl" aria-hidden="true" />

        <div class="relative max-w-xl">
          <h2 class="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
            {{ title || defaults.title }}
          </h2>
          <p class="mt-3 text-sm text-white/80 sm:mt-4 sm:text-base">
            {{ description || defaults.description }}
          </p>
          <ModalTrigger
            type="lead"
            :payload="{ source }"
            class="btn-primary mt-6 w-full sm:mt-8 sm:w-auto"
          >
            {{ buttonText || defaults.action?.label || 'Оставить заявку' }}
          </ModalTrigger>
        </div>
      </div>
    </ScrollReveal>
  </BaseSection>
</template>
