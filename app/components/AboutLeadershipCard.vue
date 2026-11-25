<script setup lang="ts">
import { aboutHighlight } from '~/data/about'
</script>

<template>
  <aside class="lead-card" aria-label="Руководство школы">
    <div class="lead-card__glow" aria-hidden="true" />
    <div class="lead-card__glow lead-card__glow--accent" aria-hidden="true" />

    <div class="lead-card__grid">
      <div class="lead-card__copy">
        <p class="lead-card__label">{{ aboutHighlight.label }}</p>
        <p class="lead-card__role">{{ aboutHighlight.role }}</p>
        <h2 class="lead-card__name">{{ aboutHighlight.name }}</h2>
        <p class="lead-card__org">{{ aboutHighlight.org }}</p>

        <blockquote class="lead-card__quote">
          {{ aboutHighlight.text }}
        </blockquote>
      </div>

      <div class="lead-card__media">
        <img
          :src="aboutHighlight.imageSrc"
          :alt="aboutHighlight.imageAlt"
          class="lead-card__img"
          width="720"
          height="480"
          loading="lazy"
          decoding="async"
        >
      </div>
    </div>
  </aside>
</template>

<style scoped>
.lead-card {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border-radius: 1.5rem;
  background:
    linear-gradient(145deg, #1a2b4d 0%, #253863 48%, #1c2744 100%);
  box-shadow:
    0 20px 48px rgb(16 28 48 / 0.28),
    inset 0 1px 0 rgb(255 255 255 / 0.08);
}

.lead-card__glow {
  position: absolute;
  z-index: 0;
  width: min(70%, 28rem);
  height: min(70%, 22rem);
  border-radius: 999px;
  pointer-events: none;
  background: radial-gradient(circle, rgb(120 160 220 / 0.28), transparent 68%);
  top: -28%;
  left: -12%;
}

.lead-card__glow--accent {
  top: auto;
  left: auto;
  right: -18%;
  bottom: -34%;
  background: radial-gradient(circle, rgb(255 42 42 / 0.28), transparent 66%);
}

.lead-card__grid {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 0;
}

@media (min-width: 900px) {
  .lead-card__grid {
    grid-template-columns: minmax(0, 1.05fr) minmax(16rem, 0.95fr);
    align-items: stretch;
    min-height: 22rem;
  }
}

.lead-card__copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.55rem;
  padding: 1.5rem 1.35rem 1.6rem;
}

@media (min-width: 640px) {
  .lead-card__copy {
    padding: 2rem 1.75rem 2.1rem 2rem;
  }
}

.lead-card__label {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #ff8f8f;
}

.lead-card__role {
  margin: 0.15rem 0 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: rgb(255 255 255 / 0.72);
}

.lead-card__name {
  margin: 0;
  font-size: clamp(1.45rem, 2.6vw, 2rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.03em;
  color: #fff;
}

.lead-card__org {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(200 214 235 / 0.78);
}

.lead-card__quote {
  margin: 0.85rem 0 0;
  padding: 0.95rem 0 0;
  border-top: 1px solid rgb(255 255 255 / 0.14);
  font-size: clamp(0.98rem, 1.5vw, 1.12rem);
  font-weight: 500;
  line-height: 1.55;
  color: rgb(255 255 255 / 0.9);
}

.lead-card__media {
  position: relative;
  min-height: 14rem;
  overflow: hidden;
  background: #101828;
}

@media (min-width: 900px) {
  .lead-card__media {
    min-height: 100%;
  }

  .lead-card__media::before {
    content: '';
    position: absolute;
    inset: 0 auto 0 0;
    z-index: 1;
    width: 4.5rem;
    background: linear-gradient(90deg, #1c2744, transparent);
    pointer-events: none;
  }
}

.lead-card__img {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 14rem;
  object-fit: cover;
  object-position: center 28%;
}

@media (min-width: 900px) {
  .lead-card__img {
    position: absolute;
    inset: 0;
    min-height: 0;
  }
}
</style>
