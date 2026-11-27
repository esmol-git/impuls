<script setup lang="ts">
import { heroStats } from '~/data/home'
import type { HeroStat } from '~/types'
import type { SectionEdge, SectionTone } from '~/utils/sectionSurface'

/** Стык с главной не рисуем: полоса без волны и без запаса под неё. */
defineProps<{
  tone?: SectionTone
  edge?: SectionEdge
  flipWave?: boolean
  wave?: boolean
}>()

const DURATION_MS = 1100

const rootRef = ref<HTMLElement | null>(null)
const display = ref<string[]>(heroStats.map((stat) => (hasTarget(stat) ? formatStat(stat, 0) : stat.value)))
const started = ref(false)

function hasTarget(stat: HeroStat): stat is HeroStat & { target: number } {
  return typeof stat.target === 'number'
}

function formatStat(stat: HeroStat, current: number) {
  return `${stat.prefix ?? ''}${Math.round(current)}${stat.suffix ?? ''}`
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

function prefersReducedMotion() {
  if (!import.meta.client) return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function showFinal() {
  display.value = heroStats.map((stat) =>
    hasTarget(stat) ? formatStat(stat, stat.target) : stat.value,
  )
}

function runCounters() {
  if (started.value) return
  started.value = true

  if (prefersReducedMotion()) {
    showFinal()
    return
  }

  const start = performance.now()

  const tick = (now: number) => {
    const progress = Math.min(1, (now - start) / DURATION_MS)
    const eased = easeOutCubic(progress)

    display.value = heroStats.map((stat) => {
      if (!hasTarget(stat)) return stat.value
      return formatStat(stat, stat.target * eased)
    })

    if (progress < 1) {
      requestAnimationFrame(tick)
    } else {
      showFinal()
    }
  }

  requestAnimationFrame(tick)
}

let observer: IntersectionObserver | null = null

onMounted(() => {
  if (!rootRef.value) return

  if (prefersReducedMotion()) {
    showFinal()
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        runCounters()
        observer?.disconnect()
        observer = null
      }
    },
    { threshold: 0.4 },
  )

  observer.observe(rootRef.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <section
    ref="rootRef"
    class="stats-band"
    aria-label="Показатели школы"
  >
    <div class="container-site">
      <ScrollReveal>
        <ul class="stats-grid">
          <li
            v-for="(stat, index) in heroStats"
            :key="stat.label"
            class="stats-item"
          >
            <p
              class="stats-value"
              :aria-label="stat.value"
            >
              <span aria-hidden="true">{{ display[index] }}</span>
            </p>
            <p class="stats-label">
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
  padding-top: 2rem;
  padding-bottom: 2rem;
}

@media (min-width: 640px) {
  .stats-band {
    padding-top: 2.35rem;
    padding-bottom: 2.35rem;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 1rem;
  row-gap: 1.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

@media (min-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0;
  }
}

.stats-item {
  position: relative;
  text-align: center;
  padding-inline: 0.5rem;
  transition: transform 0.25s ease;
}

.stats-item:hover {
  transform: translateY(-1px);
}

@media (min-width: 640px) {
  .stats-item:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 12%;
    right: 0;
    bottom: 12%;
    width: 1px;
    background: linear-gradient(
      180deg,
      transparent,
      rgb(var(--c-brand-200) / 0.9) 20%,
      rgb(var(--c-brand-200) / 0.9) 80%,
      transparent
    );
  }
}

.stats-value {
  margin: 0;
  font-size: 1.85rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1.05;
  font-variant-numeric: tabular-nums;
  background: linear-gradient(
    120deg,
    rgb(var(--c-brand-700)) 0%,
    rgb(var(--c-brand-500)) 45%,
    rgb(var(--c-accent-500)) 88%
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.stats-label {
  margin: 0.4rem 0 0;
  font-size: 0.75rem;
  line-height: 1.35;
  letter-spacing: 0.01em;
  color: rgb(var(--c-brand-600) / 0.58);
  transition: color 0.25s ease;
}

.stats-item:hover .stats-label {
  color: rgb(var(--c-brand-600) / 0.78);
}

@media (min-width: 640px) {
  .stats-value {
    font-size: 2.25rem;
    letter-spacing: 0.05em;
  }

  .stats-label {
    font-size: 0.875rem;
  }
}

@media (min-width: 1024px) {
  .stats-value {
    font-size: 2.75rem;
    letter-spacing: 0.06em;
  }
}

@media (prefers-reduced-motion: reduce) {
  .stats-item {
    transition: none;
  }

  .stats-item:hover {
    transform: none;
  }
}
</style>
