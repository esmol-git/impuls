<script setup lang="ts">
/**
 * Мягкие цветовые пятна — едва заметный оттенок фона.
 */
import type { AmbientGlow } from '~/data/sectionDecor'

const props = defineProps<{
  glows?: AmbientGlow[]
}>()

function glowStyle(g: AmbientGlow) {
  const size = g.size || '44%'
  const raw = g.opacity != null ? g.opacity : 1
  return {
    width: size,
    height: size,
    top: g.top,
    left: g.left,
    right: g.right,
    bottom: g.bottom,
    /* жёсткий потолок — пятно не должно «кричать» */
    opacity: String(Math.min(raw, 0.55)),
  }
}
</script>

<template>
  <div
    v-for="(g, i) in (props.glows || [])"
    :key="i"
    class="section-ambient"
    :class="`section-ambient--${g.tone || 'blue'}`"
    :style="glowStyle(g)"
    aria-hidden="true"
  />
</template>

<style scoped>
.section-ambient {
  position: absolute;
  z-index: 0;
  pointer-events: none;
  border-radius: 50%;
  filter: blur(28px);
  transform: translateZ(0);
  mix-blend-mode: multiply;
}

.section-ambient--red {
  background: radial-gradient(
    ellipse at center,
    rgb(255 80 80 / 0.11) 0%,
    rgb(255 80 80 / 0.05) 38%,
    transparent 72%
  );
}

.section-ambient--blue {
  background: radial-gradient(
    ellipse at center,
    rgb(61 93 145 / 0.1) 0%,
    rgb(61 93 145 / 0.04) 40%,
    transparent 74%
  );
}

.section-ambient--brand {
  background: radial-gradient(
    ellipse at center,
    rgb(11 42 91 / 0.07) 0%,
    rgb(11 42 91 / 0.03) 42%,
    transparent 76%
  );
}

:global(html.dark .section-ambient) {
  mix-blend-mode: screen;
  filter: blur(32px);
}

:global(html.dark .section-ambient--red) {
  background: radial-gradient(
    ellipse at center,
    rgb(255 70 70 / 0.14) 0%,
    rgb(255 70 70 / 0.05) 40%,
    transparent 74%
  );
}

:global(html.dark .section-ambient--blue) {
  background: radial-gradient(
    ellipse at center,
    rgb(100 140 200 / 0.12) 0%,
    rgb(100 140 200 / 0.04) 42%,
    transparent 76%
  );
}

:global(html.dark .section-ambient--brand) {
  background: radial-gradient(
    ellipse at center,
    rgb(90 130 190 / 0.1) 0%,
    rgb(90 130 190 / 0.03) 44%,
    transparent 78%
  );
}
</style>
