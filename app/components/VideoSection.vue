<script setup lang="ts">
import { sections } from '~/data/sections'

const config = sections.video
</script>

<template>
  <BaseSection id="video">
    <template #default="{ headingId }">
      <SectionHeader v-bind="config" :title-id="headingId" />

      <ScrollReveal>
        <div class="video-stage relative mt-8 overflow-hidden rounded-2xl sm:mt-10">
          <div class="video-stage__base" aria-hidden="true" />
          <div class="video-stage__glow video-stage__glow--red" aria-hidden="true" />
          <div class="video-stage__glow video-stage__glow--blue" aria-hidden="true" />
          <div class="video-stage__beam" aria-hidden="true" />
          <div class="accent-bloom" aria-hidden="true" />

          <div class="relative z-[1] flex aspect-video flex-col items-center justify-center gap-3 px-6 text-center">
            <span class="video-stub__badge">Наполнение</span>
            <span
              class="video-stub__play flex h-16 w-16 items-center justify-center rounded-full sm:h-20 sm:w-20"
              aria-hidden="true"
            >
              <svg class="ml-1 h-7 w-7 sm:h-8 sm:w-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <p class="text-sm font-semibold text-white sm:text-base">Видео о нашей школе</p>
            <p class="text-xs text-white/65 sm:text-sm">Ролик готовится — блок оставляем на месте</p>
          </div>
        </div>
      </ScrollReveal>
    </template>
  </BaseSection>
</template>

<style scoped>
.video-stage {
  background-color: #1e3358;
  box-shadow: 0 18px 48px rgb(16 28 48 / 0.28);
}

.video-stage__base {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 70% at 18% 40%, rgb(255 55 55 / 0.2) 0%, transparent 55%),
    radial-gradient(ellipse 50% 60% at 88% 55%, rgb(90 140 210 / 0.26) 0%, transparent 58%),
    linear-gradient(125deg, #2a426c 0%, #1a2f52 48%, #14243f 100%);
}

.video-stage__glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.video-stage__glow--red {
  top: -10%;
  left: -5%;
  width: 48%;
  height: 70%;
  background: radial-gradient(circle, rgb(255 60 60 / 0.22) 0%, transparent 68%);
}

.video-stage__glow--blue {
  right: -8%;
  bottom: -20%;
  width: 55%;
  height: 80%;
  background: radial-gradient(circle, rgb(110 160 220 / 0.2) 0%, transparent 70%);
}

.video-stage__beam {
  position: absolute;
  top: -20%;
  left: 35%;
  width: 28%;
  height: 140%;
  background: linear-gradient(
    168deg,
    rgb(255 255 255 / 0.1) 0%,
    rgb(255 70 70 / 0.06) 30%,
    transparent 60%
  );
  transform: rotate(-16deg);
  pointer-events: none;
}

.video-stub__badge {
  display: inline-flex;
  align-items: center;
  border-radius: 0.375rem;
  padding: 0.15rem 0.55rem;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: rgb(248 113 113 / 0.22);
  color: #fecaca;
}

.video-stub__play {
  border: 2px solid rgb(255 255 255 / 0.35);
  background: rgb(255 255 255 / 0.1);
  color: rgb(255 255 255 / 0.9);
  box-shadow:
    0 0 0 10px rgb(255 255 255 / 0.04),
    0 12px 28px rgb(0 0 0 / 0.25);
}

:global(html.dark .video-stage__base) {
  background:
    radial-gradient(ellipse 60% 70% at 18% 40%, rgb(255 55 55 / 0.24) 0%, transparent 55%),
    radial-gradient(ellipse 50% 60% at 88% 55%, rgb(90 140 210 / 0.22) 0%, transparent 58%),
    linear-gradient(125deg, #1c2f4e 0%, #132038 48%, #0e1829 100%);
}
</style>
