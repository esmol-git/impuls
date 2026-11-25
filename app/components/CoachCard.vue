<script setup lang="ts">
import type { Coach } from '~/types'
import { sanitizeHtml } from '~/utils/sanitizeHtml'

const props = withDefaults(
  defineProps<{
    coach: Coach
    /** Для слайдера на главной — короче, без био */
    compact?: boolean
  }>(),
  { compact: false },
)

/** Пока на карточке только фото + ФИО; роль/стаж/теги/био оставлены ниже */
const showDetails = false
const safeBio = computed(() => sanitizeHtml(props.coach.bio))
</script>

<template>
  <NuxtLink
    :to="`/coaches/${coach.id}`"
    class="card group flex h-full flex-col overflow-hidden transition hover:border-brand-200"
  >
    <div class="relative aspect-[3/4] shrink-0 overflow-hidden bg-brand-50">
      <img
        v-if="coach.imageSrc"
        :src="coach.imageSrc"
        :alt="coach.imageAlt || coach.name"
        class="h-full w-full object-cover object-[center_20%] transition duration-300 group-hover:scale-[1.02]"
        loading="lazy"
      >
      <UiMediaPlaceholder
        v-else
        label="Фото тренера"
        hint="Скоро добавим"
        aspect="auto"
        :rounded="false"
        class="absolute inset-0"
      />
    </div>

    <div class="flex flex-1 flex-col p-4 sm:p-5">
      <h3
        class="font-bold text-brand-800 transition group-hover:text-accent-500"
        :class="compact ? 'text-base leading-snug' : 'text-lg'"
      >
        {{ coach.name }}
      </h3>

      <template v-if="showDetails">
        <p
          v-if="coach.role"
          class="mt-1 text-sm font-medium text-accent-500"
        >
          {{ coach.role }}
        </p>

        <p
          v-if="coach.experience"
          class="mt-2 text-xs font-semibold text-brand-400"
        >
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

        <div
          v-if="!compact && safeBio"
          class="coach-card__bio mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-brand-600/70"
          v-html="safeBio"
        />
      </template>
    </div>
  </NuxtLink>
</template>
