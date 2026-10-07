<script setup lang="ts">
import type { Location } from '~/types'

const props = withDefaults(defineProps<{
  location: Location
  source?: string
  compact?: boolean
}>(), {
  source: 'location',
  compact: false,
})
</script>

<template>
  <article
    class="card flex h-full flex-col"
    :class="compact ? 'p-4 sm:p-5' : 'p-5 sm:p-6'"
  >
    <div
      class="mb-3 flex items-center justify-center rounded-xl bg-brand-50 text-brand-600"
      :class="compact ? 'h-9 w-9' : 'h-10 w-10'"
    >
      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </div>
    <h3 class="font-bold text-brand-600" :class="compact ? 'text-sm sm:text-base' : undefined">
      {{ location.name }}
    </h3>
    <p class="mt-2 flex-1 text-sm leading-relaxed text-brand-600/70">
      {{ location.address }}
    </p>
    <ModalTrigger
      type="lead"
      :payload="{ source, location: location.name }"
      class="mt-4 inline-flex min-h-[44px] items-center text-sm font-bold text-accent-500 transition hover:text-accent-600"
    >
      Записаться →
    </ModalTrigger>
  </article>
</template>
