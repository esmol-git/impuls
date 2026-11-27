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
  <article class="program-card card flex h-full flex-col p-4 sm:p-5">
    <p
      v-if="level.eyebrow"
      class="program-card__eyebrow text-[11px] font-semibold uppercase tracking-[0.08em] sm:text-xs"
      :class="level.buttonVariant === 'accent' ? 'program-card__eyebrow--accent' : 'program-card__eyebrow--brand'"
    >
      {{ level.eyebrow }}
    </p>
    <h3
      class="program-card__title text-sm font-bold leading-snug sm:text-base"
      :class="{ 'mt-1.5': level.eyebrow }"
    >
      {{ level.title }}
    </h3>

    <ul class="program-card__list mt-3.5 flex-1 sm:mt-4">
      <li
        v-for="feature in level.features"
        :key="feature.text"
        class="program-card__row flex items-start gap-2.5 text-xs leading-snug sm:gap-3 sm:text-sm"
      >
        <span class="program-card__icon-wrap" aria-hidden="true">
          <svg
            class="program-card__icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.75"
          >
            <path stroke-linecap="round" stroke-linejoin="round" :d="icons[feature.icon]" />
          </svg>
        </span>
        <span>{{ feature.text }}</span>
      </li>
    </ul>

    <div class="program-card__foot mt-4 pt-3 sm:mt-5">
      <ModalTrigger
        type="lead"
        :payload="modalPayload"
        class="program-card__cta"
        :class="level.buttonVariant === 'accent' ? 'program-card__cta--accent' : 'program-card__cta--brand'"
      >
        Записаться
      </ModalTrigger>
    </div>
  </article>
</template>

<style scoped>
.program-card__eyebrow--brand {
  color: rgb(var(--c-brand-500));
}

.program-card__eyebrow--accent {
  color: rgb(var(--c-accent-500));
}

.program-card__title {
  color: var(--page-fg);
}

.program-card__list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.program-card__row {
  color: rgb(var(--c-brand-600) / 0.8);
}

.program-card__icon-wrap {
  display: flex;
  width: 1.55rem;
  height: 1.55rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  margin-top: 0.05rem;
  border-radius: 0.45rem;
  background: rgb(var(--c-brand-50));
  color: rgb(var(--c-brand-500));
}

.program-card__icon {
  width: 0.9rem;
  height: 0.9rem;
}

.program-card__foot {
  border-top: 1px solid var(--card-border);
}

.program-card__cta {
  display: inline-flex;
  min-height: 2.5rem;
  width: 100%;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  padding-inline: 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #fff;
  transition: filter 0.2s ease, background-color 0.2s ease;
}

@media (min-width: 640px) {
  .program-card__cta {
    font-size: 0.875rem;
  }
}

.program-card__cta--brand {
  background: rgb(var(--c-brand-600));
}

.program-card__cta--brand:hover {
  background: rgb(var(--c-brand-700));
}

.program-card__cta--accent {
  background: rgb(var(--c-accent-500));
}

.program-card__cta--accent:hover {
  background: rgb(var(--c-accent-600));
}

:global(html.dark .program-card) {
  background: rgb(255 255 255 / 0.05);
  box-shadow: none;
}

:global(html.dark .program-card__icon-wrap) {
  background: rgb(255 255 255 / 0.06);
  color: rgb(var(--c-brand-300));
}
</style>
