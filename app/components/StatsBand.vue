<script setup lang="ts">
import { heroStats } from '~/data/home'
import type { SectionEdge, SectionTone } from '~/utils/sectionSurface'

/** Пропсы стыка с главной — игнорируем (стык рисует следующая секция). */
defineProps<{
  tone?: SectionTone
  edge?: SectionEdge
  flipWave?: boolean
  wave?: boolean
}>()

const { enabled: features } = useSiteFeatures()
</script>

<template>
  <section
    class="stats-band"
    :class="{ 'stats-band--clearance': features.sectionEdges }"
    aria-label="Показатели школы"
  >
    <div class="container-site">
      <ScrollReveal>
        <ul class="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 sm:gap-6 lg:gap-8">
          <li
            v-for="stat in heroStats"
            :key="stat.label"
            class="text-center sm:text-left"
          >
            <p class="text-2xl font-extrabold text-brand-600 sm:text-3xl lg:text-4xl">
              {{ stat.value }}
            </p>
            <p class="mt-1 text-xs leading-snug text-brand-600/60 sm:text-sm">
              {{ stat.label }}
            </p>
          </li>
        </ul>
      </ScrollReveal>
    </div>
  </section>
</template>

<style scoped>
.stats-band {
  position: relative;
  z-index: 1;
  background: var(--surface-paper);
  padding-top: 1.75rem;
  padding-bottom: 1.75rem;
}

@media (min-width: 640px) {
  .stats-band {
    padding-top: 2rem;
    padding-bottom: 2rem;
  }
}

/* Запас снизу только когда следующая секция наезжает волной */
@media (min-width: 768px) {
  .stats-band--clearance {
    padding-bottom: calc(2.5rem + var(--section-edge-h, 5rem));
  }
}

@media (min-width: 1024px) {
  .stats-band--clearance {
    padding-bottom: calc(2.75rem + var(--section-edge-h, 5.5rem));
  }
}
</style>
