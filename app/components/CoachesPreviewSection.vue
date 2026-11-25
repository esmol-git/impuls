<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { sections } from '~/data/sections'
import type { SectionEdge, SectionTone } from '~/utils/sectionSurface'

withDefaults(defineProps<{
  tone?: SectionTone
  edge?: SectionEdge
  flipWave?: boolean
  wave?: boolean
}>(), {
  tone: 'mist',
  edge: 'slant',
  flipWave: false,
  wave: true,
})

const config = sections.coaches
const { data: coaches } = await useCoaches()

const track = ref<HTMLElement>()
const canScrollPrev = ref(false)
const canScrollNext = ref(false)

function updateButtons() {
  const el = track.value
  if (!el) return
  canScrollPrev.value = el.scrollLeft > 4
  canScrollNext.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 4
}

function scrollStep(direction: -1 | 1) {
  const el = track.value
  if (!el) return

  const firstCard = el.querySelector<HTMLElement>('[data-coach-card]')
  const styles = getComputedStyle(el)
  const gap = Number.parseFloat(styles.columnGap || styles.gap || '24') || 24
  const step = firstCard ? firstCard.offsetWidth + gap : el.clientWidth * 0.85

  el.scrollBy({ left: direction * step, behavior: 'smooth' })
}

let touchStartX = 0

function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0]?.clientX ?? 0
}

function onTouchEnd(e: TouchEvent) {
  const diff = touchStartX - (e.changedTouches[0]?.clientX ?? 0)
  if (Math.abs(diff) > 50) scrollStep(diff > 0 ? 1 : -1)
}

onMounted(() => {
  const el = track.value
  if (!el) return

  el.addEventListener('scroll', updateButtons, { passive: true })
  window.addEventListener('resize', updateButtons)
  updateButtons()
})

onUnmounted(() => {
  const el = track.value
  if (el) el.removeEventListener('scroll', updateButtons)
  window.removeEventListener('resize', updateButtons)
})
</script>

<template>
  <BaseSection
    v-if="coaches?.length"
    id="coaches"
    class="coaches-section"
    :tone="tone"
    :edge="edge"
    :flip-wave="flipWave"
    :wave="wave"
  >
    <template #default="{ headingId }">
      <SectionHeader
        :label="config.label"
        :title="config.title"
        :description="config.description"
        :title-id="headingId"
      />

      <div class="coaches-slider relative mt-8 sm:mt-12">
        <div
          ref="track"
          class="slider-scroll coaches-track -mx-4 flex snap-x snap-mandatory gap-4 sm:mx-0 sm:gap-6 sm:px-0"
          aria-label="Тренеры"
          @touchstart.passive="onTouchStart"
          @touchend.passive="onTouchEnd"
        >
          <div
            v-for="coach in coaches"
            :key="coach.id"
            data-coach-card
            class="w-[min(100%,19rem)] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
          >
            <CoachCard :coach="coach" compact />
          </div>
        </div>

        <button
          v-show="canScrollPrev"
          type="button"
          class="carousel-btn carousel-btn--prev absolute top-1/2 z-10 hidden -translate-y-1/2 sm:flex"
          aria-label="Предыдущие тренеры"
          @click="scrollStep(-1)"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          v-show="canScrollNext"
          type="button"
          class="carousel-btn carousel-btn--next absolute top-1/2 z-10 hidden -translate-y-1/2 sm:flex"
          aria-label="Следующие тренеры"
          @click="scrollStep(1)"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div
          v-if="config.action"
          class="mt-4 flex justify-center sm:mt-6"
        >
          <NuxtLink
            :to="config.action.to"
            class="btn-outline w-full sm:w-auto"
          >
            {{ config.action.label }}
          </NuxtLink>
        </div>
      </div>
    </template>
  </BaseSection>
</template>

<style scoped>
.coaches-slider {
  --carousel-btn-gap: 0.75rem;
}

.coaches-track {
  padding-inline: 1.5rem;
  scroll-padding-inline: 1.5rem;
}

@media (min-width: 640px) {
  .coaches-track {
    padding-inline: 0;
    scroll-padding-inline: 0;
  }
}

.carousel-btn--prev {
  right: 100%;
  margin-right: var(--carousel-btn-gap);
}

.carousel-btn--next {
  left: 100%;
  margin-left: var(--carousel-btn-gap);
}

@media (min-width: 640px) {
  :deep(.base-section) {
    overflow-x: visible;
  }
}
</style>
