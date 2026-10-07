<script setup lang="ts">
const { progress } = useScrollProgress()
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px] safe-top"
    role="progressbar"
    :aria-valuenow="Math.round(progress)"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-label="Прогресс прокрутки страницы"
  >
    <div
      class="h-full origin-left bg-gradient-to-r from-brand-600 to-accent-500 transition-[width] duration-100 ease-out will-change-[width]"
      :style="{ width: `${progress}%` }"
    />
  </div>
</template>
