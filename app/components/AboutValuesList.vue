<script setup lang="ts">
import { aboutValues } from '~/data/about'
</script>

<template>
  <ul class="values-grid" aria-label="Ценности школы">
    <li
      v-for="(value, index) in aboutValues"
      :key="value.title"
      class="values-card"
    >
      <div class="values-card__media">
        <img
          :src="value.imageSrc"
          :alt="value.imageAlt"
          class="values-card__img"
          :style="{ objectPosition: value.imagePosition || 'center' }"
          width="640"
          height="480"
          loading="lazy"
          decoding="async"
        >
      </div>
      <div class="values-card__body">
        <div class="values-card__meta">
          <span class="values-card__num" aria-hidden="true">
            {{ String(index + 1).padStart(2, '0') }}
          </span>
          <span class="values-card__rule" aria-hidden="true" />
        </div>
        <h3 class="values-card__title">{{ value.title }}</h3>
        <p class="values-card__text">{{ value.description }}</p>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.values-grid {
  display: flex;
  gap: 1rem;
  margin: 0;
  padding: 0 0.15rem 0.35rem;
  list-style: none;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: 0.15rem;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  overscroll-behavior-x: contain;
}

.values-grid::-webkit-scrollbar {
  display: none;
}

.values-card {
  display: flex;
  flex-direction: column;
  flex: 0 0 min(86vw, 22rem);
  min-height: 100%;
  overflow: hidden;
  scroll-snap-align: start;
  border-radius: 1.25rem;
  background: #fff;
  border: 1px solid rgb(37 56 99 / 0.1);
  box-shadow: 0 10px 28px rgb(37 56 99 / 0.06);
}

@media (min-width: 768px) {
  .values-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.25rem;
    overflow: visible;
    padding: 0;
    scroll-snap-type: none;
  }

  .values-card {
    flex: none;
    height: 100%;
  }
}

.values-card__media {
  position: relative;
  flex-shrink: 0;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: #e8eef6;
}

.values-card__media::after {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 2.5rem;
  background: linear-gradient(180deg, transparent, rgb(255 255 255 / 0.55));
  pointer-events: none;
}

.values-card__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.values-card__body {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 0.65rem;
  padding: 1.15rem 1.2rem 1.35rem;
}

.values-card__meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.values-card__num {
  flex-shrink: 0;
  font-size: 1.35rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
  color: #ff2a2a;
}

.values-card__rule {
  display: block;
  height: 2px;
  width: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, rgb(255 42 42 / 0.55), rgb(37 56 99 / 0.08));
}

.values-card__title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.02em;
  color: #253863;
}

.values-card__text {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: rgb(37 56 99 / 0.72);
}

:global(html.dark) .values-card {
  background: rgb(18 28 48 / 0.9);
  border-color: rgb(255 255 255 / 0.1);
  box-shadow: 0 12px 30px rgb(0 0 0 / 0.25);
}

:global(html.dark) .values-card__media {
  background: #15233c;
}

:global(html.dark) .values-card__media::after {
  background: linear-gradient(180deg, transparent, rgb(18 28 48 / 0.7));
}

:global(html.dark) .values-card__title {
  color: #e8eef8;
}

:global(html.dark) .values-card__text {
  color: rgb(232 238 248 / 0.78);
}

:global(html.dark) .values-card__rule {
  background: linear-gradient(90deg, rgb(255 92 92 / 0.55), rgb(200 214 235 / 0.1));
}
</style>
