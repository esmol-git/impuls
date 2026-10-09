<script setup lang="ts">
import type { Coach } from '~/types'

withDefaults(
  defineProps<{
    coach: Coach
    /** Для слайдера на главной — короче, без био */
    compact?: boolean
  }>(),
  { compact: false },
)

/** Пока на карточке только фото + ФИО; роль/стаж/теги/био оставлены ниже */
const showDetails = false
</script>

<template>
  <article class="card group flex h-full flex-col overflow-hidden transition hover:border-brand-200">
    <div class="relative aspect-square shrink-0 overflow-hidden bg-brand-50">
      <img
        v-if="coach.imageSrc"
        :src="coach.imageSrc"
        :alt="coach.imageAlt || coach.name"
        class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        loading="lazy"
      >
      <div
        v-else
        class="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center"
      >
        <svg
          class="h-9 w-9 text-brand-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </div>
    </div>

    <div class="flex flex-1 flex-col p-4 sm:p-5">
      <h3
        class="font-bold text-brand-800 transition group-hover:text-accent-500"
        :class="compact ? 'text-base leading-snug' : 'text-lg'"
      >
        {{ coach.name }}
      </h3>

      <template v-if="showDetails">
        <p class="mt-1 text-sm font-medium text-accent-500">
          {{ coach.role }}
        </p>

        <p class="mt-2 text-xs font-semibold text-brand-400">
          Стаж {{ coach.experience }}
        </p>

        <ul
          v-if="coach.specialties?.length"
          class="mt-2 flex flex-wrap gap-1.5"
        >
          <li
            v-for="tag in coach.specialties.slice(0, compact ? 3 : 4)"
            :key="tag"
            class="rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-600"
          >
            {{ tag }}
          </li>
        </ul>

        <p
          v-if="!compact"
          class="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-brand-600/70"
        >
          {{ coach.bio }}
        </p>
      </template>
    </div>
  </article>
</template>
