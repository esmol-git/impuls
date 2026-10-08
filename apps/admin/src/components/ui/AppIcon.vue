<script setup lang="ts">
import { computed } from 'vue'
import { icons, type IconName } from '@/icons'

const props = withDefaults(
  defineProps<{
    name: IconName
    size?: number | string
  }>(),
  {
    size: 22,
  },
)

const component = computed(() => icons[props.name])

const px = computed(() =>
  typeof props.size === 'number' ? `${props.size}px` : props.size,
)
</script>

<template>
  <component
    :is="component"
    class="app-icon app-svg-icon"
    :style="{ width: px, height: px }"
    aria-hidden="true"
    focusable="false"
  />
</template>

<style scoped>
.app-icon {
  display: block;
  flex-shrink: 0;
  color: currentColor;
  overflow: visible;
}
</style>
