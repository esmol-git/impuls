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
    class="skeleton-image relative overflow-hidden"
    :class="[
      rounded ? 'rounded-xl' : '',
      aspect === 'square' ? 'aspect-square' : '',
      aspect === 'video' ? 'aspect-video' : '',
    ]"
  >
    <div class="skeleton-image__pulse absolute inset-0" aria-hidden="true" />
    <slot />
  </div>
</template>

<style scoped>
.skeleton-image {
  background-color: var(--skeleton-bg, #dce4f0);
}

.skeleton-image__pulse {
  background: linear-gradient(
    90deg,
    var(--skeleton-bg, #dce4f0) 0%,
    var(--skeleton-shine, #eef2f8) 50%,
    var(--skeleton-bg, #dce4f0) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
