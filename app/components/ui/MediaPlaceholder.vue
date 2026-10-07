<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
  aspect?: 'square' | 'video' | 'auto'
  rounded?: boolean
  dark?: boolean
}>(), {
  label: 'Фото',
  aspect: 'video',
  rounded: true,
  dark: false,
})
</script>

<template>
  <UiSkeletonImage
    :aspect="aspect"
    :rounded="rounded"
    :class="[
      dark ? 'border-brand-700/50 bg-brand-800' : 'border-brand-100',
      'border',
    ]"
  >
    <div class="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
      <svg
        class="h-8 w-8 sm:h-10 sm:w-10"
        :class="dark ? 'text-brand-500' : 'text-brand-300'"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="1.25"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p class="mt-2 text-xs" :class="dark ? 'text-brand-400' : 'text-brand-400'">{{ label }}</p>
    </div>
  </UiSkeletonImage>
</template>
