<script setup lang="ts">
defineProps<{
  label?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  light?: boolean
  titleId?: string
}>()
</script>

<template>
  <div :class="align === 'center' ? 'text-center' : 'text-left'">
    <p
      v-if="label"
      class="mb-1.5 text-xs font-semibold uppercase tracking-widest sm:mb-2 sm:text-sm"
      :class="light ? 'text-white/80' : 'text-accent-500'"
    >
      {{ label }}
    </p>
    <h2
      :id="titleId"
      class="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl"
      :class="light ? 'text-white' : 'text-brand-600'"
    >
      {{ title }}
    </h2>
    <p
      v-if="description"
      class="mt-3 max-w-2xl text-sm leading-relaxed sm:mt-4 sm:text-base"
      :class="[
        light ? 'text-white/80' : 'text-brand-600/70',
        { 'mx-auto': align === 'center' },
      ]"
    >
      {{ description }}
    </p>
  </div>
</template>
