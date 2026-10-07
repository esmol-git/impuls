<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import type { Location } from '~/types'

const props = withDefaults(defineProps<{
  items: Location[]
  source?: string
  ariaLabel?: string
}>(), {
  source: 'location',
  ariaLabel: 'Площадки',
})

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

  const firstCard = el.querySelector<HTMLElement>('[data-location-card]')
  const gap = 16
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
  <div class="relative">
    <div class="relative sm:px-12 md:px-14">
      <div
        ref="track"
        class="slider-scroll -mx-4 flex snap-x snap-mandatory gap-4 px-4 sm:mx-0 sm:px-0"
        :aria-label="ariaLabel"
        @touchstart.passive="onTouchStart"
        @touchend.passive="onTouchEnd"
      >
        <div
          v-for="loc in items"
          :key="loc.id"
          data-location-card
          class="w-[min(100%,20rem)] shrink-0 snap-start sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.67rem)] xl:w-[calc(25%-0.75rem)]"
        >
          <LocationCard :location="loc" :source="source" compact />
        </div>
      </div>

      <button
        v-show="canScrollPrev"
        type="button"
        class="carousel-btn absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 sm:flex"
        aria-label="Предыдущие площадки"
        @click="scrollStep(-1)"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        v-show="canScrollNext"
        type="button"
        class="carousel-btn absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 sm:flex"
        aria-label="Следующие площадки"
        @click="scrollStep(1)"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <p class="mt-3 text-center text-xs text-brand-400 sm:hidden">
      Свайпните для просмотра
    </p>
  </div>
</template>

<style scoped>
.carousel-btn {
  @apply flex h-10 w-10 items-center justify-center rounded-full border border-brand-200 bg-white text-brand-600 shadow-card transition hover:border-brand-300 hover:bg-brand-50 hover:shadow-lg active:scale-95 md:h-11 md:w-11;
}
</style>
