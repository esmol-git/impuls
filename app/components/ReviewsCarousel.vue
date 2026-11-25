<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { reviewPlatforms } from '~/data/reviews'
import { sections } from '~/data/sections'
import reviewsPattern from '~/assets/img/pattern-stage.webp'
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

interface ReviewShot {
  id: string
  imageUrl: string
  title?: string
}

const config = sections.reviews

/** Как у новостей: await useFetch — и SSR, и клиентский переход на главную. */
const { data: mediaReviews } = await useFetch<ReviewShot[]>('/api/media', {
  query: { type: 'REVIEW' },
  key: 'home-review-shots',
  default: () => [],
  transform: (rows) => (Array.isArray(rows) ? rows.filter((row) => !!row?.imageUrl) : []),
})

const items = computed(() => mediaReviews.value || [])

const current = ref(0)
const total = computed(() => items.value.length)
const dragOffset = ref(0)
const isDragging = ref(false)

watch(total, (n) => {
  if (current.value >= n) current.value = Math.max(0, n - 1)
})

function goTo(index: number) {
  if (!total.value) return
  current.value = (index + total.value) % total.value
}

function prev() {
  goTo(current.value - 1)
}

function next() {
  goTo(current.value + 1)
}

let pointerStartX = 0
let pointerActive = false

function onPointerDown(e: PointerEvent) {
  if (total.value < 2) return
  pointerActive = true
  isDragging.value = true
  pointerStartX = e.clientX
  dragOffset.value = 0
  ;(e.currentTarget as HTMLElement | null)?.setPointerCapture?.(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!pointerActive) return
  dragOffset.value = e.clientX - pointerStartX
}

function onPointerUp() {
  if (!pointerActive) return
  const delta = dragOffset.value
  pointerActive = false
  isDragging.value = false
  dragOffset.value = 0
  if (Math.abs(delta) > 48) {
    delta < 0 ? next() : prev()
  }
}

const trackStyle = computed(() => {
  const base = -current.value * 100
  if (!isDragging.value || !dragOffset.value) {
    return { transform: `translateX(${base}%)` }
  }
  // Rough px→% conversion relative to phone width (~280–320)
  const dragPct = (dragOffset.value / 300) * 100
  return {
    transform: `translateX(calc(${base}% + ${dragPct}%))`,
    transition: 'none',
  }
})
</script>

<template>
  <BaseSection
    v-if="total"
    id="reviews"
    :tone="tone"
    :edge="edge"
    :flip-wave="flipWave"
    :wave="wave"
  >
    <template #default="{ headingId }">
      <div
        class="reviews-panel"
        :style="{ '--reviews-pattern': `url(${reviewsPattern})` }"
      >
        <div class="reviews-panel__bg" aria-hidden="true" />
        <div class="reviews-panel__scrim" aria-hidden="true" />
        <div class="accent-bloom accent-bloom--corner" aria-hidden="true" />

        <div class="reviews-layout">
          <div class="reviews-copy">
            <h2 :id="headingId" class="reviews-title">
              {{ config.title }}
            </h2>
            <p class="reviews-lead">
              Реальные отзывы родителей — листайте скриншоты с Яндекса и 2ГИС.
            </p>

            <div class="reviews-badges" aria-label="Рейтинги на площадках">
              <component
                :is="platform.href ? 'a' : 'div'"
                v-for="platform in reviewPlatforms"
                :key="platform.id"
                class="reviews-badge"
                :href="platform.href"
                :target="platform.href ? '_blank' : undefined"
                :rel="platform.href ? 'noopener noreferrer' : undefined"
              >
                <span class="reviews-badge__score">
                  {{ platform.rating }}
                  <span class="reviews-badge__star" aria-hidden="true">★</span>
                </span>
                <span class="reviews-badge__logo" :data-platform="platform.id" aria-hidden="true">
                  <svg v-if="platform.id === 'yandex'" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2C7.58 2 4 5.58 4 10c0 5.25 7 12 8 12s8-6.75 8-12c0-4.42-3.58-8-8-8z"
                      fill="#FC3F1D"
                    />
                    <circle cx="12" cy="10" r="2.5" fill="#fff" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#00B73C" />
                    <text
                      x="12"
                      y="16"
                      text-anchor="middle"
                      fill="#fff"
                      font-size="11"
                      font-weight="700"
                      font-family="system-ui, sans-serif"
                    >2</text>
                  </svg>
                </span>
                <span class="sr-only">{{ platform.label }}</span>
              </component>
            </div>
          </div>

          <div v-if="total" class="reviews-stage">
            <button
              v-if="total > 1"
              type="button"
              class="reviews-nav reviews-nav--prev"
              aria-label="Предыдущий отзыв"
              @click="prev"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div
              class="phone"
              :class="{ 'is-dragging': isDragging }"
              @pointerdown="onPointerDown"
              @pointermove="onPointerMove"
              @pointerup="onPointerUp"
              @pointercancel="onPointerUp"
            >
              <div class="phone__frame">
                <div class="phone__island" aria-hidden="true" />
                <div class="phone__screen" aria-live="polite">
                  <div class="phone__track" :style="trackStyle">
                    <div
                      v-for="item in items"
                      :key="item.id"
                      class="phone__slide"
                    >
                      <img
                        :src="item.imageUrl"
                        :alt="item.title || 'Отзыв'"
                        class="phone__image"
                        loading="lazy"
                        draggable="false"
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              v-if="total > 1"
              type="button"
              class="reviews-nav reviews-nav--next"
              aria-label="Следующий отзыв"
              @click="next"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>

          </div>
        </div>
      </div>
    </template>
  </BaseSection>
</template>

<style scoped>
.reviews-panel {
  position: relative;
  overflow: hidden;
  border-radius: 1.5rem;
  background-color: #253863;
  box-shadow:
    0 1px 2px rgb(15 23 42 / 4%),
    0 18px 48px rgb(15 23 42 / 12%);
  padding: 1.75rem 1.25rem;
}

:global(html.dark .reviews-panel) {
  background-color: #121c30;
  box-shadow:
    0 0 0 1px rgb(148 163 184 / 0.28),
    0 18px 48px rgb(0 0 0 / 0.45);
}

@media (min-width: 640px) {
  .reviews-panel {
    padding: 2.25rem 2rem;
    border-radius: 1.75rem;
  }
}

@media (min-width: 1024px) {
  .reviews-panel {
    padding: 3rem 2.75rem;
  }
}

/* Растягиваем паттерн на всю плашку */
.reviews-panel__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image: var(--reviews-pattern);
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
}

/* Тёмный brand поверх паттерна */
.reviews-panel__scrim {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    linear-gradient(
      115deg,
      rgb(37 56 99 / 0.92) 0%,
      rgb(37 56 99 / 0.82) 45%,
      rgb(30 45 79 / 0.72) 100%
    );
}

:global(html.dark .reviews-panel__bg) {
  opacity: 0.7;
  filter: brightness(0.7) contrast(1.05);
}

:global(html.dark .reviews-panel__scrim) {
  background:
    linear-gradient(
      115deg,
      rgb(14 22 38 / 0.95) 0%,
      rgb(18 28 48 / 0.9) 45%,
      rgb(10 16 28 / 0.88) 100%
    );
}

.reviews-layout {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 2.5rem;
  align-items: center;
}

@media (min-width: 1024px) {
  .reviews-layout {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
    gap: 3rem;
  }
}

.reviews-copy {
  max-width: 28rem;
}

.reviews-title {
  font-size: clamp(1.75rem, 3.5vw, 2.75rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: #fff;
}

.reviews-lead {
  margin-top: 0.9rem;
  max-width: 26rem;
  font-size: 1rem;
  line-height: 1.55;
  color: rgb(255 255 255 / 0.75);
}

.reviews-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.reviews-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.55rem 0.9rem;
  border: 1px solid rgb(226 232 240);
  border-radius: 0.85rem;
  background: #fff;
  box-shadow: 0 6px 16px rgb(15 23 42 / 5%);
  text-decoration: none;
  color: inherit;
}

.reviews-badge__score {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0b2a5b;
}

.reviews-badge__star {
  color: #f5a524;
  font-size: 0.95rem;
  line-height: 1;
}

.reviews-badge__logo {
  display: inline-flex;
  width: 1.35rem;
  height: 1.35rem;
}

.reviews-badge__logo svg {
  width: 100%;
  height: 100%;
}

.reviews-stage {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-width: 0;
}

@media (min-width: 640px) {
  .reviews-stage {
    flex-wrap: nowrap;
    gap: 1.25rem;
  }
}

.reviews-nav {
  display: none;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 1.5px solid rgb(255 255 255 / 0.55);
  border-radius: 999px;
  background: rgb(255 255 255 / 0.14);
  color: #fff;
  backdrop-filter: blur(6px);
  transition:
    background 0.15s ease,
    color 0.15s ease,
    transform 0.15s ease;
}

@media (min-width: 640px) {
  .reviews-nav {
    display: inline-flex;
  }
}

.reviews-nav:hover {
  background: #fff;
  color: #253863;
}

.reviews-nav:active {
  transform: scale(0.96);
}

.phone {
  width: min(100%, 22.5rem);
  touch-action: pan-y;
  cursor: grab;
  user-select: none;
  filter: drop-shadow(0 28px 48px rgb(15 23 42 / 16%));
}

.phone.is-dragging {
  cursor: grabbing;
}

@media (min-width: 640px) {
  .phone {
    width: min(100%, 300px);
  }
}

@media (min-width: 1024px) {
  .phone {
    width: min(100%, 320px);
  }
}

.phone__frame {
  position: relative;
  aspect-ratio: 9 / 19.2;
  padding: 10px;
  border-radius: 2.4rem;
  background:
    linear-gradient(160deg, #3a3a3c 0%, #1c1c1e 45%, #0a0a0a 100%);
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 12%),
    inset 0 0 0 3px #111;
}

.phone__island {
  position: absolute;
  top: 18px;
  left: 50%;
  z-index: 3;
  width: 28%;
  height: 18px;
  transform: translateX(-50%);
  border-radius: 999px;
  background: #0a0a0a;
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 6%);
  pointer-events: none;
}

.phone__screen {
  position: relative;
  z-index: 1;
  height: 100%;
  overflow: hidden;
  border-radius: 1.9rem;
  background: #fff;
}

.phone__track {
  display: flex;
  height: 100%;
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

.phone__slide {
  position: relative;
  display: flex;
  flex: 0 0 100%;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-width: 0;
  background: #fff;
}

.phone__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center center;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
