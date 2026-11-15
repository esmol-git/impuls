<script setup lang="ts">
import type { WashSide } from '~/data/sectionDecor'

withDefaults(defineProps<{
  src: string
  opacity?: number
  side?: WashSide
  repeat?: boolean
  size?: string
}>(), {
  opacity: 0.2,
  side: 'left',
  repeat: false,
  size: 'cover',
})
</script>

<template>
  <div
    class="section-wash"
    :class="`section-wash--${side}`"
    :style="{
      opacity,
      backgroundImage: `url(${src})`,
      backgroundRepeat: repeat ? 'repeat' : 'no-repeat',
      backgroundSize: size,
    }"
    aria-hidden="true"
  />
</template>

<style scoped>
.section-wash {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-position: center center;
  mix-blend-mode: multiply;
}

/* На тёмном wash легко даёт «муть» — сильно приглушаем */
:global(html.dark .section-wash) {
  mix-blend-mode: soft-light;
  filter: invert(1) brightness(0.85);
  opacity: 0.12 !important;
}

.section-wash--left {
  background-position: left center;
  -webkit-mask-image: linear-gradient(100deg, #000 0%, #000 42%, transparent 78%);
  mask-image: linear-gradient(100deg, #000 0%, #000 42%, transparent 78%);
}

.section-wash--right {
  background-position: right center;
  -webkit-mask-image: linear-gradient(260deg, #000 0%, #000 42%, transparent 78%);
  mask-image: linear-gradient(260deg, #000 0%, #000 42%, transparent 78%);
}

.section-wash--center {
  background-position: center center;
  -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 28%, #000 72%, transparent 100%);
  mask-image: linear-gradient(180deg, transparent 0%, #000 28%, #000 72%, transparent 100%);
}

.section-wash--full {
  background-position: center top;
  -webkit-mask-image: linear-gradient(180deg, #000 0%, #000 70%, transparent 100%);
  mask-image: linear-gradient(180deg, #000 0%, #000 70%, transparent 100%);
}
</style>
