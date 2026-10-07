<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { sections } from '~/data/sections'

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
  <BaseSection id="coaches" v-slot="{ headingId }">
    <SectionHeader
      v-bind="config"
      :title-id="headingId"
    />

    <div v-if="coaches?.length" class="relative mt-8 sm:mt-12 sm:px-12 md:px-14">
      <div
        ref="track"
        class="slider-scroll -mx-4 flex snap-x snap-mandatory gap-4 px-4 sm:mx-0 sm:gap-6 sm:px-0"
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
        class="carousel-btn absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 sm:flex"
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
        class="carousel-btn absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 sm:flex"
        aria-label="Следующие тренеры"
        @click="scrollStep(1)"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <p class="mt-3 text-center text-xs text-brand-400 sm:hidden">
        Свайпните для просмотра
      </p>
    </div>
  </BaseSection>
</template>

<style scoped>
.carousel-btn {
  @apply flex h-10 w-10 items-center justify-center rounded-full border border-brand-200 bg-white text-brand-600 shadow-card transition hover:border-brand-300 hover:bg-brand-50 hover:shadow-lg active:scale-95 md:h-11 md:w-11;
}
</style>
