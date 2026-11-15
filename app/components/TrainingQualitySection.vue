<script setup lang="ts">
import { founderSpeech, trainingSection } from '~/data/training'

const photo = founderSpeech.photos.find((p) => p.id === 'ball')!
const [lead, ...rest] = founderSpeech.paragraphs
const closing = rest[rest.length - 1]
const middle = rest.slice(0, -1)
</script>

<template>
  <BaseSection
    id="training"
    container-class="max-w-none !px-0"
    aria-label="О школе"
  >
    <template #default="{ headingId }">
      <div class="founder-split">
        <div class="founder-split__media">
          <img
            :src="photo.src"
            :alt="photo.alt"
            width="900"
            height="1350"
            loading="lazy"
            decoding="async"
          >
          <div class="founder-split__media-fade" aria-hidden="true" />
        </div>

        <div class="founder-split__content">
          <ScrollReveal>
            <p class="founder-split__label">{{ trainingSection.label }}</p>
            <h2 :id="headingId" class="founder-split__title">
              {{ trainingSection.titleBefore }}
              <span>{{ trainingSection.titleAccent }}</span>
            </h2>

            <article class="founder-split__speech">
              <p class="founder-split__lead">{{ lead }}</p>
              <p
                v-for="(paragraph, index) in middle"
                :key="index"
                class="founder-split__p"
              >
                {{ paragraph }}
              </p>
              <p class="founder-split__close">{{ closing }}</p>
              <footer class="founder-split__sign">
                <strong>{{ founderSpeech.name }}</strong>
                <span>{{ founderSpeech.role }}</span>
              </footer>
            </article>
          </ScrollReveal>
        </div>
      </div>
    </template>
  </BaseSection>
</template>

<style scoped>
.founder-split {
  display: grid;
  gap: 0;
}

@media (min-width: 1024px) {
  .founder-split {
    grid-template-columns: minmax(18rem, 0.9fr) minmax(0, 1.1fr);
    min-height: min(42rem, 88svh);
    align-items: stretch;
  }
}

.founder-split__media {
  position: relative;
  background: #1a2744;
  overflow: hidden;
  min-height: 22rem;
}

@media (min-width: 640px) {
  .founder-split__media {
    min-height: 28rem;
  }
}

@media (min-width: 1024px) {
  .founder-split__media {
    min-height: 100%;
    border-radius: 0 1.25rem 1.25rem 0;
  }
}

.founder-split__media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 12%;
}

.founder-split__media-fade {
  position: absolute;
  inset: auto 0 0;
  height: 35%;
  background: linear-gradient(180deg, transparent, rgb(26 39 68 / 0.55));
  pointer-events: none;
}

@media (min-width: 1024px) {
  .founder-split__media-fade {
    inset: 0 auto 0 0;
    width: 28%;
    height: auto;
    background: linear-gradient(90deg, rgb(26 39 68 / 0.25), transparent);
  }
}

.founder-split__content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.5rem;
  padding: 1.75rem 1.25rem 2rem;
}

@media (min-width: 640px) {
  .founder-split__content {
    padding: 2.25rem 2rem 2.5rem;
  }
}

@media (min-width: 1024px) {
  .founder-split__content {
    padding: 2.5rem clamp(1.5rem, 4vw, 3.5rem) 2.75rem;
    max-width: 40rem;
  }
}

.founder-split__label {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #ff2a2a;
}

.founder-split__title {
  margin: 0.45rem 0 0;
  font-size: 1.4rem;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: #253863;
}

.founder-split__title span {
  color: #ff2a2a;
}

@media (min-width: 640px) {
  .founder-split__title {
    font-size: 1.85rem;
  }
}

@media (min-width: 1024px) {
  .founder-split__title {
    font-size: 2.15rem;
  }
}

.founder-split__speech {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.founder-split__lead {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.4;
  color: #253863;
}

@media (min-width: 640px) {
  .founder-split__lead {
    font-size: 1.15rem;
  }
}

.founder-split__p {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: rgb(37 56 99 / 0.78);
}

@media (min-width: 640px) {
  .founder-split__p {
    font-size: 1rem;
  }
}

.founder-split__close {
  margin: 0.15rem 0 0;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.45;
  color: #253863;
}

.founder-split__sign {
  margin-top: 0.65rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding-top: 1.1rem;
  border-top: 1px solid rgb(37 56 99 / 0.12);
}

.founder-split__sign strong {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #253863;
}

.founder-split__sign span {
  font-size: 0.8125rem;
  color: rgb(37 56 99 / 0.55);
}

:global(html.dark) .founder-split__title,
:global(html.dark) .founder-split__lead,
:global(html.dark) .founder-split__close,
:global(html.dark) .founder-split__sign strong {
  color: #e8eef8;
}

:global(html.dark) .founder-split__p {
  color: rgb(232 238 248 / 0.78);
}

:global(html.dark) .founder-split__sign {
  border-top-color: rgb(255 255 255 / 0.12);
}

:global(html.dark) .founder-split__sign span {
  color: rgb(232 238 248 / 0.5);
}
</style>
