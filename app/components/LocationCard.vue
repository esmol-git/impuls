<script setup lang="ts">
import { locationBranchHint } from '~/data/locations'
import type { Location } from '~/types'

const props = withDefaults(defineProps<{
  location: Location
  compact?: boolean
  active?: boolean
  /** Клик по карточке показывает точку на карте */
  selectable?: boolean
}>(), {
  compact: false,
  active: false,
  selectable: false,
})

const emit = defineEmits<{
  select: [id: string]
}>()

const branchHint = computed(() => locationBranchHint(props.location))

function onSelect() {
  if (!props.selectable) return
  emit('select', props.location.id)
}
</script>

<template>
  <article
    class="card flex h-full flex-col transition"
    :class="[
      compact ? 'p-3 sm:p-5' : 'p-5 sm:p-6',
      selectable ? 'cursor-pointer hover:border-brand-300' : '',
      active ? 'border-accent-400 ring-2 ring-accent-400/25' : '',
    ]"
    :role="selectable ? 'button' : undefined"
    :tabindex="selectable ? 0 : undefined"
    :aria-pressed="selectable ? active : undefined"
    @click="onSelect"
    @keydown.enter.prevent="onSelect"
  >
    <div
      class="mb-2 flex items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition sm:mb-3 sm:rounded-xl"
      :class="[
        compact ? 'h-8 w-8 sm:h-9 sm:w-9' : 'h-10 w-10',
        active ? 'bg-accent-50 text-accent-500' : '',
      ]"
      aria-hidden="true"
    >
      <svg class="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" />
        <path stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" d="M12 3.5l1.8 1.7 2.4-.3-.9 2.2 1.5 1.9-2.3.6-.8 2.2L12 11.2l-1.7 1.2-.8-2.2-2.3-.6 1.5-1.9-.9-2.2 2.4.3L12 3.5z" />
      </svg>
    </div>
    <p class="text-[0.65rem] font-semibold uppercase tracking-wider text-accent-500 sm:text-xs">
      {{ branchHint }}
    </p>
    <h3
      class="mt-0.5 font-bold leading-snug text-brand-600 sm:mt-1"
      :class="compact ? 'text-sm sm:text-base' : undefined"
    >
      {{ location.address }}
    </h3>
    <p
      v-if="selectable"
      class="mt-2 text-[0.7rem] font-medium text-brand-400 sm:mt-3 sm:text-xs"
    >
      Нажмите — показать на карте
    </p>
  </article>
</template>
