<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { reviewPlatforms, reviews as fallbackReviews } from '~/data/reviews'
import { sections } from '~/data/sections'

interface ReviewShot {
  id: string
  imageUrl: string
  title?: string
}

const config = sections.reviews
const headingId = 'reviews-title'

// useState: SSR и клиент видят одни данные (useFetch + default:[] давал hydration mismatch —
// картинки с сервера мигали и сменялись заглушкой).
const mediaReviews = useState<ReviewShot[]>('media-reviews-shots', () => [])

if (import.meta.server) {
  try {
    const data = await $fetch<ReviewShot[]>('/api/media', {
      query: { type: 'REVIEW' },
    })
    mediaReviews.value = Array.isArray(data) ? data.filter((s) => !!s?.imageUrl) : []
  } catch {
    mediaReviews.value = []
  }
}

const shots = computed(() => mediaReviews.value || [])
const useScreenshots = computed(() => shots.value.length > 0)
const items = computed(() =>
  useScreenshots.value
    ? shots.value
    : fallbackReviews.map((review) => ({
        id: review.id,
        imageUrl: '',
        title: review.author,
        text: review.text,
        rating: review.rating,
        author: review.author,
      })),
)

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
  <section
    id="reviews"
    class="reviews-section section-padding"
    :aria-labelledby="headingId"
  >
    <div class="container-site">
      <div class="reviews-panel">
        <!-- сюда позже можно положить фоновые картинки -->
        <div class="reviews-panel__bg" aria-hidden="true" />

        <div class="reviews-layout">
          <div class="reviews-copy">
            <h2 :id="headingId" class="reviews-title">
              {{ config.title }}
            </h2>

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
                        v-if="useScreenshots && item.imageUrl"
                        :src="item.imageUrl"
                        :alt="item.title || 'Отзыв'"
                        class="phone__image"
                        loading="lazy"
                        draggable="false"
                      >
                      <div v-else class="phone__fallback">
                        <div class="mb-3 flex justify-center gap-1" aria-hidden="true">
                          <svg
                            v-for="n in 5"
                            :key="n"
                            class="h-4 w-4"
                            :class="n <= (('rating' in item && item.rating) || 0) ? 'text-amber-400' : 'text-brand-200'"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <blockquote class="text-sm leading-relaxed text-brand-700">
                          «{{ 'text' in item ? item.text : '' }}»
                        </blockquote>
                        <p class="mt-4 text-sm font-semibold text-brand-800">
                          {{ 'author' in item ? item.author : item.title }}
                        </p>
                      </div>
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
    </div>
  </section>
</template>

<style scoped>
.reviews-section {
  background: #eef2f7;
}

.reviews-panel {
  position: relative;
  overflow: hidden;
  border-radius: 1.5rem;
  background: #fff;
  box-shadow:
    0 1px 2px rgb(15 23 42 / 4%),
    0 18px 48px rgb(15 23 42 / 8%);
  padding: 1.75rem 1.25rem;
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

.reviews-panel__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  /* место под фоновые изображения */
  background: transparent;
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
  color: #0b2a5b;
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
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-width: 0;
}

@media (min-width: 640px) {
  .reviews-stage {
    gap: 1.25rem;
  }
}

.reviews-nav {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 1.5px solid #0b2a5b;
  border-radius: 999px;
  background: rgb(255 255 255 / 70%);
  color: #0b2a5b;
  backdrop-filter: blur(6px);
  transition:
    background 0.15s ease,
    color 0.15s ease,
    transform 0.15s ease;
}

.reviews-nav:hover {
  background: #0b2a5b;
  color: #fff;
}

.reviews-nav:active {
  transform: scale(0.96);
}

.phone {
  width: min(100%, 280px);
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

.phone__fallback {
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: center;
  padding: 2rem 1.25rem 1.5rem;
  text-align: center;
  background: #fff;
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
