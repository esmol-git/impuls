<script setup lang="ts">
import { computed } from 'vue'
import { site } from '~/data/site'

withDefaults(defineProps<{
  variant?: 'inline' | 'card' | 'bar'
}>(), {
  variant: 'inline',
})

const { isOpen, statusText } = useBusinessHours()

const phoneHref = computed(() => `tel:${site.phone.replace(/[\s()-]/g, '')}`)

const dotClass = computed(() => {
  if (isOpen.value === null) return 'bg-brand-300'
  return isOpen.value ? 'bg-emerald-500' : 'bg-red-500'
})

const statusAria = computed(() => {
  if (isOpen.value === null) return 'Проверка времени приёма звонков'
  return isOpen.value ? 'Сейчас принимаем звонки' : 'Сейчас вне времени приёма звонков'
})
</script>

<template>
  <a
    :href="phoneHref"
    class="group transition"
    :class="{
      'flex items-center gap-3 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 hover:border-brand-200 hover:bg-white': variant === 'card',
      'flex items-center gap-2.5 rounded-xl border border-brand-100/80 bg-brand-50/60 px-3 py-2 hover:border-brand-200 hover:bg-brand-50': variant === 'inline',
      'flex min-w-0 items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-brand-50/80': variant === 'bar',
    }"
  >
    <span class="relative flex h-2.5 w-2.5 shrink-0" :aria-label="statusAria" role="status">
      <span
        v-if="isOpen"
        class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"
        aria-hidden="true"
      />
      <span
        class="relative inline-flex h-2.5 w-2.5 rounded-full ring-2 ring-white"
        :class="dotClass"
        aria-hidden="true"
      />
    </span>

    <span class="min-w-0 text-left">
      <span
        class="block font-bold leading-tight text-brand-600 group-hover:text-brand-700"
        :class="variant === 'bar' ? 'text-[15px] tracking-tight' : 'text-sm'"
      >
        {{ site.phone }}
      </span>
      <span
        class="block truncate leading-snug text-brand-400"
        :class="variant === 'bar' ? 'text-[11px]' : 'text-[11px] sm:text-xs'"
      >
        {{ site.phoneHours }}
        <span v-if="isOpen !== null" class="text-brand-400"> · {{ statusText }}</span>
      </span>
    </span>

    <svg
      v-if="variant === 'card'"
      class="ml-auto h-5 w-5 shrink-0 text-accent-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  </a>
</template>
