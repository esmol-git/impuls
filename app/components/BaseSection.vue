<script setup lang="ts">
import { computed } from 'vue'
import { decorFor, decosOf, glowsOf } from '~/data/sectionDecor'
import {
  SECTION_SURFACE,
  type SectionEdge,
  type SectionTone,
} from '~/utils/sectionSurface'

const props = withDefaults(defineProps<{
  id?: string
  /** @deprecated используйте tone */
  alt?: boolean
  tone?: SectionTone
  wave?: boolean
  edge?: SectionEdge
  flipWave?: boolean
  pageTop?: boolean
  containerClass?: string
  ariaLabel?: string
  /** Ключ блока для авто-декора из sectionDecor */
  decorKey?: string
}>(), {
  alt: false,
  wave: false,
  edge: 'wave',
  flipWave: false,
  pageTop: false,
})

const resolvedTone = computed<SectionTone>(() => {
  if (props.tone) return props.tone
  return props.alt ? 'paper' : 'mist'
})

const surface = computed(() => SECTION_SURFACE[resolvedTone.value])
const headingId = computed(() => (props.id ? `${props.id}-title` : undefined))
const labelledBy = computed(() => (props.ariaLabel ? undefined : headingId.value))
const decor = computed(() => decorFor(props.decorKey || props.id || ''))
const decos = computed(() => decosOf(decor.value))
const glows = computed(() => glowsOf(decor.value))
</script>

<template>
  <section
    :id="id"
    class="base-section section-padding"
    :class="{
      'page-top': pageTop,
      'base-section--edge': wave,
    }"
    :style="{ '--section-surface': surface, backgroundColor: surface }"
    :aria-label="ariaLabel"
    :aria-labelledby="labelledBy"
  >
    <SectionWave
      v-if="wave"
      :fill="surface"
      :flip="flipWave"
      :variant="edge"
    />
    <SectionAmbient :glows="glows" />
    <SectionWash
      v-if="decor?.wash"
      :src="decor.wash.src"
      :opacity="decor.wash.opacity"
      :side="decor.wash.side"
      :repeat="decor.wash.repeat"
      :size="decor.wash.size"
    />
    <SectionDeco
      v-for="(item, i) in decos"
      :key="i"
      v-bind="item"
    />
    <slot name="deco" />
    <div class="container-site relative z-[2]" :class="containerClass">
      <slot :heading-id="headingId" :tone="resolvedTone" />
    </div>
  </section>
</template>

<style scoped>
.base-section {
  position: relative;
  z-index: 0;
  /* Свой stacking context: wash/декор не вылезают поверх волны следующей секции */
  isolation: isolate;
  overflow-x: clip;
  overflow-y: visible;
}

.base-section--edge {
  padding-bottom: 5rem;
}

@media (min-width: 640px) {
  .base-section--edge {
    padding-bottom: 6rem;
  }
}

@media (min-width: 768px) {
  .base-section--edge {
    padding-top: calc(3.25rem + 0.75rem);
    padding-bottom: 6.5rem;
  }
}

@media (min-width: 1024px) {
  .base-section--edge {
    padding-top: calc(4rem + 1rem);
    padding-bottom: 7.5rem;
  }
}
</style>
