<script setup lang="ts">
import { computed } from 'vue'
import type { Program } from '~/types'

const props = defineProps<{
  program: Program
  featured?: boolean
}>()

const modalPayload = computed(() => ({
  source: 'program-card',
  program: `${props.program.title} (${props.program.age})`,
}))
</script>

<template>
  <article
    class="card flex flex-col p-6"
    :class="{ 'ring-2 ring-accent-500/30': featured }"
  >
    <div class="mb-4 flex items-start justify-between gap-4">
      <div>
        <h3 class="text-xl font-bold text-brand-600">{{ program.title }}</h3>
        <p class="mt-1 text-sm font-semibold text-accent-500">{{ program.age }}</p>
      </div>
      <span v-if="featured" class="rounded-full bg-accent-50 px-3 py-1 text-xs font-bold text-accent-500">
        Популярно
      </span>
    </div>

    <p class="mb-6 flex-1 text-sm leading-relaxed text-brand-600/70">
      {{ program.description }}
    </p>

    <ul class="mb-6 space-y-2">
      <li v-for="feature in program.features" :key="feature" class="flex items-center gap-2 text-sm text-brand-600/80">
        <svg class="h-4 w-4 shrink-0 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        {{ feature }}
      </li>
    </ul>

    <div class="border-t border-brand-100 pt-4">
      <p class="text-sm font-medium text-brand-600">{{ program.schedule }}</p>
      <ModalTrigger
        type="lead"
        :payload="modalPayload"
        class="mt-3 inline-block text-sm font-bold text-accent-500 hover:text-accent-600"
      >
        Узнать стоимость →
      </ModalTrigger>
    </div>
  </article>
</template>
