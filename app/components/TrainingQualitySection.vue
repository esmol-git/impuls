<script setup lang="ts">
import type { TrainingIcon } from '~/types'
import { trainingPoints, trainingSection } from '~/data/training'

const icons: Record<TrainingIcon, string> = {
  method: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  trophy: 'M5 3h14M7 3v2a5 5 0 0010 0V3M5 3v1a3 3 0 003 3m11-4v1a3 3 0 01-3 3M9 21h6M12 17v4',
  coach: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  clipboard: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  field: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
  boot: 'M3 21h18M5 21V7l8-4v18M19 21V11l-6-4',
  jersey: 'M7 20l4-16m2 16l4-16M6 9h14M4 15h14',
  feedback: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
}
</script>

<template>
  <BaseSection id="training" v-slot="{ headingId }">
    <ScrollReveal>
      <p class="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-accent-500 sm:text-sm">
        {{ trainingSection.label }}
      </p>
      <h2
        :id="headingId"
        class="text-center text-xl font-extrabold leading-snug text-brand-600 sm:text-2xl lg:text-3xl"
      >
        {{ trainingSection.titleBefore }}
        <span class="text-accent-500">{{ trainingSection.titleAccent }}</span>
      </h2>
      <p class="mx-auto mt-3 max-w-xl text-center text-sm text-brand-600/65 sm:text-base">
        {{ trainingSection.subtitle }}
      </p>
    </ScrollReveal>

    <div class="mt-8 grid gap-8 lg:mt-12 lg:grid-cols-[1fr_minmax(0,22rem)] lg:items-start lg:gap-10">
      <ul class="grid list-none gap-x-6 gap-y-4 sm:grid-cols-2">
        <li v-for="point in trainingPoints" :key="point.id">
          <ScrollReveal class="flex h-full gap-3">
            <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-500">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" :d="icons[point.icon]" />
              </svg>
            </span>
            <p class="text-sm leading-relaxed text-brand-600/80">{{ point.text }}</p>
          </ScrollReveal>
        </li>
      </ul>

      <ScrollReveal>
        <div class="space-y-4">
          <UiMediaPlaceholder label="Фото тренера" aspect="video" />
          <NuxtLink
            to="#video"
            class="card flex items-center gap-3 p-4 transition hover:border-brand-200"
          >
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-500 text-white">
              <svg class="ml-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <span class="text-sm font-semibold text-brand-600">Посмотрите, как обучаются наши тренеры</span>
          </NuxtLink>
        </div>
      </ScrollReveal>
    </div>
  </BaseSection>
</template>
