<script setup lang="ts">
import type { Coach } from '~/types'

withDefaults(
  defineProps<{
    coach: Coach
    /** Для слайдера на главной — чуть компактнее типографика */
    compact?: boolean
  }>(),
  { compact: false },
)
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

      <p
        v-if="coach.role"
        class="coach-card__role mt-1.5"
        :class="compact ? 'text-xs sm:text-[0.8125rem]' : 'text-sm'"
      >
        {{ coach.role }}
      </p>
    </div>
  </NuxtLink>
</template>

<style scoped>
.coach-card__role {
  font-weight: 500;
  line-height: 1.35;
  color: rgb(var(--c-brand-600) / 0.58);
  letter-spacing: 0.01em;
}

.group:hover .coach-card__role {
  color: rgb(var(--c-brand-600) / 0.72);
}
</style>
