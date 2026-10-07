<script setup lang="ts">
withDefaults(defineProps<{
  aspect?: 'square' | 'video' | 'auto'
  rounded?: boolean
}>(), {
  aspect: 'square',
  rounded: true,
})
</script>

<template>
  <div
    class="relative overflow-hidden bg-brand-100"
    :class="[
      rounded ? 'rounded-xl' : '',
      aspect === 'square' ? 'aspect-square' : '',
      aspect === 'video' ? 'aspect-video' : '',
    ]"
  >
    <div class="absolute inset-0 animate-pulse bg-gradient-to-r from-brand-100 via-brand-50 to-brand-100 bg-[length:200%_100%]" />
    <slot />
  </div>
</template>

<style scoped>
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.animate-pulse {
  animation: shimmer 1.5s ease-in-out infinite;
}
</style>
