<script setup lang="ts">
import { aboutGallery } from '~/data/about'

const INTERVAL_MS = 3800
const VISIBLE = 3

const active = ref(0)
const leaving = ref<number | null>(null)
const dir = ref<1 | -1>(1)
const paused = ref(false)
const reduceMotion = ref(false)

let timer: ReturnType<typeof setInterval> | null = null
let leaveTimer: ReturnType<typeof setTimeout> | null = null

const total = aboutGallery.length

function stackIndex(i: number) {
  if (leaving.value === i) return -1
  const from = active.value
  return (i - from + total) % total
}

function isVisible(i: number) {
  if (leaving.value === i) return true
  return stackIndex(i) < VISIBLE
}

function advance(step: 1 | -1) {
  if (leaveTimer) return

  dir.value = step
  const outgoing = active.value
  const next = (outgoing + step + total) % total

  if (reduceMotion.value) {
    active.value = next
    return
  }

  leaving.value = outgoing
  active.value = next

  leaveTimer = setTimeout(() => {
    leaving.value = null
    leaveTimer = null
  }, 620)
}

function goTo(i: number) {
  if (i === active.value || leaveTimer) return

  const forward = (i - active.value + total) % total
  const backward = (active.value - i + total) % total

  if (forward === 1) {
    advance(1)
  }
  else if (backward === 1) {
    advance(-1)
  }
  else {
    leaving.value = null
    active.value = i
  }
  restart()
}

function next() {
  advance(1)
}

function prev() {
  advance(-1)
}

function restart() {
  stop()
  if (!paused.value && !reduceMotion.value) start()
}

function start() {
  stop()
  timer = setInterval(() => advance(1), INTERVAL_MS)
}

function stop() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function onEnter() {
  paused.value = true
  stop()
}

function onLeave() {
  paused.value = false
  if (!reduceMotion.value) start()
}

onMounted(() => {
  reduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduceMotion.value) start()
})

onUnmounted(() => {
  stop()
  if (leaveTimer) clearTimeout(leaveTimer)
})
</script>

<template>
  <div
    class="gallery"
    role="region"
    aria-roledescription="карусель"
    aria-label="Фото школы на тренировках"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
    @focusin="onEnter"
    @focusout="onLeave"
  >
    <div class="gallery__stage">
      <article
        v-for="(slide, i) in aboutGallery"
        :key="slide.src"
        class="gallery__card"
        :class="{
          'is-active': stackIndex(i) === 0,
          'is-next': stackIndex(i) === 1,
          'is-deep': stackIndex(i) === 2,
          'is-leaving': leaving === i,
          'is-leaving--prev': leaving === i && dir === -1,
          'is-hidden': !isVisible(i),
        }"
        :aria-hidden="stackIndex(i) !== 0"
        :style="{ zIndex: leaving === i ? VISIBLE + 1 : VISIBLE - Math.max(stackIndex(i), 0) }"
      >
        <img
          :src="slide.src"
          :alt="slide.alt"
          class="gallery__img"
          width="640"
          height="480"
          :loading="i === 0 ? 'eager' : 'lazy'"
          decoding="async"
          draggable="false"
        >
      </article>
    </div>

    <div class="gallery__controls">
      <button
        type="button"
        class="gallery__nav"
        aria-label="Предыдущее фото"
        @click="prev(); restart()"
      >
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M12.5 4.5L7 10l5.5 5.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <div class="gallery__dots" role="tablist" aria-label="Выбор фото">
        <button
          v-for="(_, i) in aboutGallery"
          :key="i"
          type="button"
          role="tab"
          class="gallery__dot"
          :class="{ 'is-active': i === active }"
          :aria-selected="i === active"
          :aria-label="`Фото ${i + 1} из ${total}`"
          @click="goTo(i)"
        />
      </div>

      <button
        type="button"
        class="gallery__nav"
        aria-label="Следующее фото"
        @click="next(); restart()"
      >
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M7.5 4.5L13 10l-5.5 5.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>

    <p class="sr-only" aria-live="polite">
      Фото {{ active + 1 }} из {{ total }}
    </p>
  </div>
</template>

<style scoped>
.gallery {
  --gallery-radius: 1.25rem;
  position: relative;
  width: 100%;
}

.gallery__stage {
  position: relative;
  aspect-ratio: 3 / 4;
  min-height: 22rem;
  perspective: 1200px;
  padding: 0 8% 10% 0;
}

@media (min-width: 1024px) {
  .gallery__stage {
    min-height: 26rem;
  }
}

.gallery__card {
  position: absolute;
  top: 0;
  left: 0;
  width: 93%;
  height: 91%;
  overflow: hidden;
  border-radius: var(--gallery-radius);
  background: #dce4f0;
  box-shadow:
    0 14px 36px rgb(23 35 61 / 0.14),
    0 2px 0 rgb(255 255 255 / 0.35) inset;
  transform-origin: 50% 85%;
  transition:
    transform 0.65s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.5s ease,
    filter 0.5s ease;
  will-change: transform, opacity;
}

.gallery__card.is-active {
  transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
  opacity: 1;
  filter: none;
  pointer-events: auto;
}

.gallery__card.is-next {
  transform: translate3d(5%, 4%, -40px) scale(0.96) rotate(1.8deg);
  opacity: 0.95;
  filter: brightness(0.96);
  pointer-events: none;
}

.gallery__card.is-deep {
  transform: translate3d(10%, 8%, -80px) scale(0.92) rotate(3.4deg);
  opacity: 0.72;
  filter: brightness(0.9);
  pointer-events: none;
}

.gallery__card.is-leaving {
  transform: translate3d(-18%, -6%, 40px) scale(0.98) rotate(-7deg);
  opacity: 0;
  filter: brightness(1.05);
  pointer-events: none;
}

.gallery__card.is-leaving--prev {
  transform: translate3d(18%, -6%, 40px) scale(0.98) rotate(7deg);
}

.gallery__card.is-hidden {
  transform: translate3d(12%, 10%, -100px) scale(0.9) rotate(4deg);
  opacity: 0;
  pointer-events: none;
}

.gallery__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  user-select: none;
}

.gallery__controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  margin-top: 0.9rem;
}

.gallery__nav {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  border: 1px solid rgb(37 56 99 / 0.14);
  background: #fff;
  color: #253863;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.gallery__nav:hover {
  border-color: rgb(176 25 27 / 0.35);
  color: #b0191b;
}

.gallery__nav:focus-visible {
  outline: 2px solid #b0191b;
  outline-offset: 2px;
}

.gallery__nav svg {
  width: 1rem;
  height: 1rem;
}

.gallery__dots {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  max-width: min(100%, 11.5rem);
  padding: 0.15rem;
}

.gallery__dot {
  flex: 0 0 auto;
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 999px;
  border: none;
  padding: 0;
  background: rgb(37 56 99 / 0.22);
  transition: width 0.35s ease, background 0.35s ease;
}

.gallery__dot.is-active {
  width: 1.15rem;
  background: #b0191b;
}

.gallery__dot:focus-visible {
  outline: 2px solid #b0191b;
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .gallery__card {
    transition: opacity 0.25s ease;
  }

  .gallery__card.is-next,
  .gallery__card.is-deep,
  .gallery__card.is-hidden,
  .gallery__card.is-leaving {
    transform: none;
    opacity: 0;
  }

  .gallery__card.is-active {
    opacity: 1;
  }
}
</style>
