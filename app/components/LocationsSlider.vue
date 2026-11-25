<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import type { Location } from '~/types'

const props = withDefaults(defineProps<{
  items: Location[]
  ariaLabel?: string
  activeId?: string | null
  selectable?: boolean
}>(), {
  ariaLabel: 'Площадки',
  activeId: null,
  selectable: false,
})

const emit = defineEmits<{
  select: [id: string]
}>()

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

function scrollToActive(id: string | null | undefined) {
  if (!id || !track.value) return
  const card = track.value.querySelector<HTMLElement>(`[data-location-id="${id}"]`)
  if (!card) return
  card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  window.setTimeout(updateButtons, 350)
}

onMounted(() => {
  const el = track.value
  if (!el) return

  el.addEventListener('scroll', updateButtons, { passive: true })
  window.addEventListener('resize', updateButtons)
  updateButtons()
  if (props.activeId) scrollToActive(props.activeId)
})

onUnmounted(() => {
  const el = track.value
  if (el) el.removeEventListener('scroll', updateButtons)
  window.removeEventListener('resize', updateButtons)
})

watch(() => props.activeId, (id) => {
  scrollToActive(id)
})
</script>

<template>
  <div class="relative">
    <div class="relative sm:px-12 md:px-14">
      <div
        ref="track"
        class="slider-scroll locations-track -mx-4 flex snap-x snap-mandatory gap-3 sm:mx-0 sm:gap-4 sm:px-0"
        :aria-label="ariaLabel"
        @touchstart.passive="onTouchStart"
        @touchend.passive="onTouchEnd"
      >
        <div
          v-for="loc in items"
          :key="loc.id"
          data-location-card
          :data-location-id="loc.id"
          class="w-[min(100%,16.5rem)] shrink-0 snap-start sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.67rem)] xl:w-[calc(25%-0.75rem)]"
        >
          <LocationCard
            :location="loc"
            :active="activeId === loc.id"
            :selectable="selectable"
            compact
            @select="emit('select', $event)"
          />
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
  </div>
</template>

<style scoped>
.locations-track {
  padding-inline: 1.5rem;
  scroll-padding-inline: 1.5rem;
}

@media (min-width: 640px) {
  .locations-track {
    padding-inline: 0;
    scroll-padding-inline: 0;
  }
}
</style>
