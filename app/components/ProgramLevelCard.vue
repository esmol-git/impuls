<script setup lang="ts">
import { computed } from 'vue'
import type { ProgramFeatureIcon, ProgramLevel } from '~/types'

const props = defineProps<{
  level: ProgramLevel
  ageLabel: string
}>()

const icons: Record<ProgramFeatureIcon, string> = {
  clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  users: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  trophy: 'M5 3h14M7 3v2a5 5 0 0010 0V3M5 3v1a3 3 0 003 3m11-4v1a3 3 0 01-3 3M9 21h6M12 17v4',
  ball: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z',
  game: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
}

const modalPayload = computed(() => ({
  source: 'program-level',
  program: `${props.level.title} (${props.ageLabel})`,
}))
</script>

<template>
  <article class="flex h-full flex-col rounded-xl border border-brand-100 bg-white p-4 shadow-card sm:p-5">
    <h3 class="text-sm font-bold leading-snug text-brand-600 sm:text-base">
      {{ level.title }}
    </h3>

    <ul class="mt-3 flex-1 space-y-2 sm:mt-4">
      <li
        v-for="feature in level.features"
        :key="feature.text"
        class="flex items-start gap-2.5 text-xs leading-snug text-brand-600/75 sm:text-sm"
      >
        <svg
          class="mt-0.5 h-4 w-4 shrink-0 text-brand-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" :d="icons[feature.icon]" />
        </svg>
        {{ feature.text }}
      </li>
    </ul>

    <div class="mt-4 flex items-center gap-2 border-t border-brand-100 pt-3 sm:mt-5">
      <ModalTrigger
        type="lead"
        :payload="modalPayload"
        class="inline-flex min-h-[40px] flex-1 items-center justify-center rounded-lg px-3 text-xs font-bold uppercase tracking-wide text-white transition sm:text-sm"
        :class="level.buttonVariant === 'accent' ? 'bg-accent-500 hover:bg-accent-600' : 'bg-brand-600 hover:bg-brand-700'"
      >
        Подробнее
      </ModalTrigger>
      <button
        type="button"
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-200 text-brand-400 transition hover:border-brand-300 hover:text-brand-600"
        :aria-label="`Подробнее о ${level.title}`"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>
  </article>
</template>
