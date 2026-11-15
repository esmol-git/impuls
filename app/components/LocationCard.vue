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
      compact ? 'p-4 sm:p-5' : 'p-5 sm:p-6',
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
      class="mb-3 flex items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition"
      :class="[
        compact ? 'h-9 w-9' : 'h-10 w-10',
        active ? 'bg-accent-50 text-accent-500' : '',
      ]"
      aria-hidden="true"
    >
      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" />
        <path stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" d="M12 3.5l1.8 1.7 2.4-.3-.9 2.2 1.5 1.9-2.3.6-.8 2.2L12 11.2l-1.7 1.2-.8-2.2-2.3-.6 1.5-1.9-.9-2.2 2.4.3L12 3.5z" />
      </svg>
    </div>
    <p class="text-xs font-semibold uppercase tracking-wider text-accent-500">
      {{ branchHint }}
    </p>
    <h3 class="mt-1 font-bold text-brand-600" :class="compact ? 'text-sm sm:text-base' : undefined">
      {{ location.address }}
    </h3>
    <p
      v-if="selectable"
      class="mt-3 text-xs font-medium text-brand-400"
    >
      Нажмите — показать на карте
    </p>
  </article>
</template>
