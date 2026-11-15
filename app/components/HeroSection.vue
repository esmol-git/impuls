<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { gsap } from 'gsap'
import { heroBenefits, heroContent } from '~/data/home'
import heroStagePattern from '~/assets/img/pattern-stage.webp'
import heroField from '~/assets/img/hero/field-ground.webp'
import heroSmoke from '~/assets/img/hero/smoke.webp'
import type { SectionEdge, SectionTone } from '~/utils/sectionSurface'

/** Пропсы стыка с главной — игнорируем (у hero нет волны). */
defineProps<{
  tone?: SectionTone
  edge?: SectionEdge
  flipWave?: boolean
  wave?: boolean
}>()

const { isBlockVisible } = await useHomeBlocks()
const showVideoCta = computed(() => isBlockVisible('video'))

const contentRef = ref<HTMLElement>()

onMounted(() => {
  if (!contentRef.value) return
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) return

  gsap.from(contentRef.value.querySelectorAll('.hero-animate'), {
    y: 24,
    autoAlpha: 0,
    duration: 0.55,
    stagger: 0.07,
    ease: 'power3.out',
    clearProps: 'opacity,visibility,transform',
  })
})
</script>

<template>
  <section
    class="hero relative flex min-h-[100svh] flex-col overflow-hidden pt-[var(--header-h)]"
    :style="{ '--hero-pattern': `url(${heroStagePattern})` }"
    aria-label="Главный экран"
  >
    <div class="hero-bg" aria-hidden="true">
      <div class="hero-bg__pattern" />
      <div class="hero-bg__scrim" />
      <div class="hero-bg__glow hero-bg__glow--blue" />
      <div class="hero-bg__glow hero-bg__glow--red" />
      <div class="hero-bg__glow hero-bg__glow--field" />
      <div class="hero-bg__beam" />
      <div class="hero-bg__vignette" />
    </div>

    <div class="hero-figure-wrap hidden lg:block">
      <div class="hero-figure-halo" aria-hidden="true" />
      <img
        class="hero-figure-smoke"
        :src="heroSmoke"
        alt=""
        width="2200"
        height="1472"
        decoding="async"
        aria-hidden="true"
      >
      <img
        class="hero-figure-turf"
        :src="heroField"
        alt=""
        width="2400"
        height="400"
        decoding="async"
        aria-hidden="true"
      >
      <img
        class="hero-figure"
        :src="heroContent.imageSrc"
        :alt="heroContent.imageAlt"
        width="1600"
        height="2179"
        decoding="async"
        fetchpriority="high"
      >
    </div>

    <div class="container-site relative z-[2] grid flex-1 items-center gap-8 py-8 sm:gap-10 sm:py-10 lg:grid-cols-2 lg:gap-6 lg:py-8 xl:gap-8">
      <div ref="contentRef" class="relative z-[2] max-w-xl lg:max-w-none">
        <h1 class="hero-animate hero-title text-[1.75rem] font-extrabold leading-[1.2] tracking-tight xs:text-3xl sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
          {{ heroContent.titleBefore }}
          <span class="hero-accent">{{ heroContent.titleAccent }}</span>
          {{ heroContent.titleAfter }}
        </h1>

        <p class="hero-animate hero-copy mt-5 max-w-md text-base leading-relaxed sm:mt-6 sm:text-lg">
          {{ heroContent.subtitle }}
        </p>

        <ul class="hero-animate hero-benefits mt-8 space-y-4 sm:mt-9 sm:grid sm:grid-cols-2 sm:gap-x-8 sm:gap-y-5 sm:space-y-0">
          <li
            v-for="benefit in heroBenefits"
            :key="benefit.title"
            class="flex gap-3.5"
          >
            <span class="hero-accent mt-1 flex h-5 w-5 shrink-0 items-center justify-center" aria-hidden="true">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <div class="min-w-0">
              <p class="hero-title font-semibold leading-snug">
                {{ benefit.title }}
              </p>
              <p class="hero-muted mt-1 text-sm leading-relaxed">
                {{ benefit.description }}
              </p>
            </div>
          </li>
        </ul>

        <div class="hero-animate mt-8 flex flex-col gap-4 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
          <ModalTrigger
            type="lead"
            :payload="{ source: 'hero' }"
            class="btn-primary hero-cta w-full sm:w-auto"
          >
            {{ heroContent.ctaPrimary }}
          </ModalTrigger>

          <NuxtLink
            v-if="showVideoCta"
            :to="heroContent.ctaVideoTo"
            class="hero-link group inline-flex items-center justify-center gap-3 text-sm font-semibold sm:justify-start"
          >
            <span class="hero-play flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2">
              <svg class="ml-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <span class="max-w-[14rem] text-left leading-snug sm:max-w-none">
              {{ heroContent.ctaVideo }}
            </span>
          </NuxtLink>
        </div>
      </div>

      <!-- правая колонка — место под фигуру -->
      <div class="hero-slot hidden lg:block" aria-hidden="true" />
    </div>

    <div class="hero-edge" aria-hidden="true" />
  </section>
</template>

<style scoped>
/* Hero всегда на brand-тёмном фоне — цвета фиксируем здесь, не через утилиты */
.hero {
  background-color: #253863;
  color: #ffffff;
}

.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.hero-bg__pattern {
  position: absolute;
  inset: 0;
  background-image: var(--hero-pattern);
  background-size: cover;
  background-position: center center;
  opacity: 0.55;
}

.hero-bg__scrim {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 55% 50% at 12% 22%, rgb(255 50 50 / 0.1) 0%, transparent 58%),
    radial-gradient(ellipse 42% 38% at 88% 78%, rgb(61 93 145 / 0.22) 0%, transparent 60%),
    linear-gradient(
      115deg,
      rgb(37 56 99 / 0.94) 0%,
      rgb(37 56 99 / 0.86) 42%,
      rgb(30 45 79 / 0.78) 72%,
      rgb(16 25 41 / 0.82) 100%
    );
}

.hero-bg__glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(2px);
}

.hero-bg__glow--blue {
  top: 14%;
  left: -10%;
  width: min(52vw, 32rem);
  height: min(52vw, 32rem);
  background: radial-gradient(circle, rgb(110 150 210 / 0.34) 0%, transparent 68%);
  opacity: 0.7;
}

.hero-bg__glow--red {
  top: 8%;
  right: 4%;
  width: min(48vw, 30rem);
  height: min(48vw, 30rem);
  background: radial-gradient(circle, rgb(255 48 48 / 0.3) 0%, transparent 70%);
  opacity: 0.65;
}

.hero-bg__glow--field {
  right: 6%;
  bottom: -8%;
  width: min(52vw, 34rem);
  height: min(32vw, 18rem);
  background: radial-gradient(ellipse, rgb(255 42 42 / 0.26) 0%, rgb(37 56 99 / 0.1) 42%, transparent 72%);
  opacity: 0.85;
}

.hero-bg__beam {
  position: absolute;
  top: -12%;
  right: 14%;
  width: min(40vw, 24rem);
  height: 125%;
  background: linear-gradient(
    168deg,
    rgb(255 255 255 / 0.1) 0%,
    rgb(255 70 70 / 0.08) 26%,
    transparent 56%
  );
  transform: rotate(-18deg);
  opacity: 0.8;
  pointer-events: none;
}

.hero-bg__vignette {
  position: absolute;
  inset: 0;
  z-index: 2;
  background:
    radial-gradient(ellipse 90% 80% at 50% 45%, transparent 42%, rgb(10 16 30 / 0.28) 100%),
    linear-gradient(90deg, rgb(16 25 45 / 0.35) 0%, transparent 28%, transparent 72%, rgb(16 25 45 / 0.2) 100%);
}

@media (prefers-reduced-motion: no-preference) {
  .hero-bg__glow--red {
    animation: hero-glow-pulse 9s ease-in-out infinite;
  }

  .hero-bg__glow--blue {
    animation: hero-glow-pulse 11s ease-in-out infinite reverse;
  }
}

@keyframes hero-glow-pulse {
  0%,
  100% {
    opacity: 0.42;
    transform: scale(1);
  }

  50% {
    opacity: 0.62;
    transform: scale(1.04);
  }
}

.hero-title,
.hero-copy,
.hero-link {
  color: #ffffff !important;
}

.hero-muted {
  color: rgb(255 255 255 / 0.88) !important;
}

.hero-accent {
  color: #ff3b3b !important;
  background: linear-gradient(180deg, transparent 62%, rgb(255 59 59 / 0.22) 62%, rgb(255 59 59 / 0.22) 88%, transparent 88%);
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

.hero-benefits {
  position: relative;
  padding: 1rem 1.1rem;
  border-radius: 1.15rem;
  background: linear-gradient(145deg, rgb(255 255 255 / 0.06), rgb(255 255 255 / 0.02));
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.08);
  backdrop-filter: blur(6px);
}

.hero-cta {
  background-color: #ff2a2a !important;
  color: #ffffff !important;
  box-shadow: 0 10px 28px rgb(255 42 42 / 0.28);
}

.hero-cta:hover {
  box-shadow: 0 12px 32px rgb(255 42 42 / 0.36);
}

.hero-play {
  border-color: rgb(255 255 255 / 0.45);
  color: #ffffff;
  box-shadow: 0 0 0 6px rgb(255 255 255 / 0.04);
}

.hero-link:hover,
.hero-link:hover .hero-play {
  color: #ffffff;
}

.hero-link:hover .hero-play {
  border-color: #ff3b3b;
  color: #ff3b3b;
}

:global(html.dark .hero) {
  background-color: #1a2744;
}

:global(html.dark .hero-bg__pattern) {
  opacity: 0.22;
}

:global(html.dark .hero-bg__scrim) {
  background:
    radial-gradient(ellipse 52% 46% at 14% 20%, rgb(255 50 50 / 0.14) 0%, transparent 58%),
    radial-gradient(ellipse 40% 36% at 86% 76%, rgb(70 110 170 / 0.2) 0%, transparent 60%),
    linear-gradient(
      115deg,
      #1a2744 0%,
      rgb(26 39 68 / 0.92) 50%,
      rgb(26 39 68 / 0.75) 100%
    );
}

:global(html.dark .hero-bg__glow--red) {
  opacity: 0.58;
}

:global(html.dark .hero-bg__glow--blue) {
  opacity: 0.45;
}

:global(html.dark .hero-bg__glow--field) {
  opacity: 0.75;
}

:global(html.dark .hero-bg__beam) {
  opacity: 0.5;
}

:global(html.dark .hero-accent) {
  color: #ff4242 !important;
}

:global(html.dark .hero-cta) {
  background-color: #ff3333 !important;
}

.hero-slot {
  min-height: min(58vh, 30rem);
}

.hero-figure-wrap {
  position: absolute;
  right: 4%;
  bottom: 0;
  z-index: 2;
  height: calc((100% - var(--header-h)) * 0.92);
  width: auto;
  pointer-events: none;
  overflow: visible;
}

.hero-figure-halo {
  position: absolute;
  left: 50%;
  top: 42%;
  width: 78%;
  height: 70%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background:
    radial-gradient(circle, rgb(255 55 55 / 0.22) 0%, transparent 58%),
    radial-gradient(circle, rgb(90 140 210 / 0.18) 0%, transparent 72%);
  filter: blur(8px);
}

/*
  Дым — оригинал за фигурой: soft-light + подъём яркости,
  эллипс только вокруг игрока (без белой стены на текст).
*/
.hero-figure-smoke {
  position: absolute;
  left: 50%;
  top: 2%;
  z-index: 0;
  width: 160%;
  max-width: none;
  height: auto;
  transform: translateX(-44%);
  opacity: 0.9;
  mix-blend-mode: soft-light;
  filter: brightness(2.1) contrast(1.2);
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none;
  -webkit-mask-image: radial-gradient(
    ellipse 52% 56% at 52% 42%,
    #000 0%,
    #000 48%,
    transparent 80%
  );
  mask-image: radial-gradient(
    ellipse 52% 56% at 52% 42%,
    #000 0%,
    #000 48%,
    transparent 80%
  );
}

/* газон привязан к фигуре — пятно под ногами, не отдельный прямоугольник */
.hero-figure-turf {
  position: absolute;
  left: 50%;
  bottom: -2%;
  z-index: 0;
  width: 210%;
  max-width: none;
  height: auto;
  transform: translateX(-52%);
  opacity: 0.95;
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none;
  filter: saturate(0.95) brightness(0.97);
}

.hero-figure {
  position: relative;
  z-index: 1;
  display: block;
  height: 100%;
  width: auto;
  max-width: none;
  object-fit: contain;
  object-position: bottom center;
  /* чёрный фон макета дизайнера уходит на brand-синем */
  mix-blend-mode: screen;
  user-select: none;
  -webkit-user-drag: none;
  filter:
    drop-shadow(0 18px 30px rgb(0 0 0 / 0.32))
    drop-shadow(0 0 28px rgb(255 50 50 / 0.12));
}

.hero-edge {
  position: relative;
  z-index: 10;
  height: 0.2rem;
  background: linear-gradient(
    90deg,
    #1a2744 0%,
    #3d5d91 28%,
    #ff2a2a 52%,
    #3d5d91 76%,
    #1a2744 100%
  );
  box-shadow: 0 0 18px rgb(255 42 42 / 0.35);
}

@media (min-width: 640px) {
  .hero-edge {
    height: 0.28rem;
  }
}

@media (min-width: 1280px) {
  .hero-figure-wrap {
    right: 6%;
    bottom: 0;
    height: calc((100% - var(--header-h)) * 0.94);
  }

  .hero-figure-smoke {
    width: 150%;
  }

  .hero-figure-turf {
    width: 230%;
    bottom: -3%;
  }
}

@media (min-width: 1536px) {
  .hero-figure-wrap {
    right: 8%;
    height: calc((100% - var(--header-h)) * 0.95);
  }
}
</style>
