<script setup lang="ts">
import { founderSpeech, trainingSection } from '~/data/training'

const [lead, ...body] = founderSpeech.paragraphs
</script>

<template>
  <BaseSection
    id="training"
    container-class="max-w-5xl"
    aria-label="О школе"
  >
    <template #default="{ headingId }">
      <ScrollReveal>
        <div class="founder">
          <header class="founder__head">
            <p class="founder__label">{{ trainingSection.label }}</p>
            <h2 :id="headingId" class="founder__title">
              {{ trainingSection.titleBefore }}
              <span>{{ trainingSection.titleAccent }}</span>
            </h2>
          </header>

          <div class="founder__stage">
            <div class="founder__wash" aria-hidden="true" />

            <div class="founder__layout">
              <article class="founder__quote">
                <p class="founder__lead">{{ lead }}</p>
                <p
                  v-for="(paragraph, index) in body"
                  :key="index"
                  class="founder__p"
                >
                  {{ paragraph }}
                </p>

                <footer class="founder__sign">
                  <strong>{{ founderSpeech.name }}</strong>
                  <span>{{ founderSpeech.role }}</span>
                </footer>
              </article>

              <div class="founder__figure">
                <img
                  class="founder__img"
                  :src="founderSpeech.figureSrc"
                  :alt="founderSpeech.figureAlt"
                  width="480"
                  height="1040"
                  loading="lazy"
                  decoding="async"
                >
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </template>
  </BaseSection>
</template>

<style scoped>
.founder {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  overflow: visible;
}

.founder__head {
  max-width: 36rem;
}

.founder__label {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #ff2a2a;
}

.founder__title {
  margin: 0.4rem 0 0;
  font-size: clamp(1.45rem, 2.5vw, 1.9rem);
  font-weight: 800;
  line-height: 1.18;
  letter-spacing: -0.02em;
  color: #253863;
}

.founder__title span {
  color: #ff2a2a;
}

.founder__stage {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border-radius: 1.35rem;
  background: #dfe8f2;
  padding: 0.85rem;
}

@media (min-width: 1024px) {
  .founder__stage {
    overflow: visible;
    margin-top: 4.5rem;
    padding: 1.35rem 0.5rem 1.35rem 1.5rem;
  }
}

.founder__wash {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  pointer-events: none;
  background:
    radial-gradient(ellipse 52% 68% at 86% 62%, rgb(255 42 42 / 0.11), transparent 64%),
    radial-gradient(ellipse 44% 52% at 14% 24%, rgb(37 56 99 / 0.13), transparent 60%),
    linear-gradient(165deg, rgb(236 244 252 / 0.92) 0%, rgb(208 222 236 / 0.8) 100%);
}

.founder__layout {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

@media (min-width: 1024px) {
  .founder__layout {
    display: grid;
    grid-template-columns: minmax(0, 1.08fr) minmax(16rem, 0.92fr);
    gap: 1.25rem;
    align-items: center;
  }
}

.founder__quote {
  position: relative;
  z-index: 2;
  order: 2;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  padding: 1.05rem 1.1rem 1.15rem;
  border-radius: 1rem;
  background: rgb(255 255 255 / 0.96);
  border: 1px solid rgb(255 255 255 / 0.72);
  box-shadow: 0 10px 24px rgb(37 56 99 / 0.08);
  backdrop-filter: blur(12px);
}

@media (min-width: 1024px) {
  .founder__quote {
    order: 0;
    align-self: center;
    gap: 0.8rem;
    padding: 1.25rem 1.3rem 1.35rem;
    box-shadow: 0 14px 34px rgb(37 56 99 / 0.1);
  }
}

.founder__lead {
  margin: 0;
  font-size: 0.98rem;
  font-weight: 700;
  line-height: 1.5;
  color: #253863;
}

.founder__p {
  margin: 0;
  font-size: 0.92rem;
  font-weight: 500;
  line-height: 1.55;
  color: rgb(37 56 99 / 0.86);
}

@media (min-width: 1024px) {
  .founder__lead {
    font-size: 1.05rem;
  }

  .founder__p {
    font-size: 0.98rem;
    line-height: 1.6;
  }
}

.founder__sign {
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
  margin-top: 0.2rem;
  padding-top: 0.9rem;
  border-top: 1px solid rgb(37 56 99 / 0.12);
}

.founder__sign strong {
  font-size: 0.95rem;
  font-weight: 700;
  color: #253863;
}

.founder__sign span {
  font-size: 0.8125rem;
  color: rgb(37 56 99 / 0.55);
}

.founder__figure {
  position: relative;
  z-index: 1;
  order: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin: 0 auto;
  width: min(100%, 14rem);
  height: 15.5rem;
  overflow: hidden;
  pointer-events: none;
}

@media (min-width: 1024px) {
  .founder__figure {
    z-index: 4;
    order: 0;
    width: auto;
    height: auto;
    min-height: 26rem;
    overflow: visible;
    margin: -7.5rem 0 -1.1rem;
    justify-content: flex-end;
    align-items: flex-end;
  }
}

.founder__img {
  display: block;
  width: auto;
  max-width: 100%;
  height: 24rem;
  object-fit: contain;
  object-position: top center;
  filter: drop-shadow(0 14px 22px rgb(16 28 48 / 0.28));
  user-select: none;
  -webkit-user-drag: none;
}

@media (min-width: 1024px) {
  .founder__img {
    height: clamp(28rem, 42vw, 35rem);
    object-position: bottom center;
    filter: drop-shadow(0 22px 34px rgb(16 28 48 / 0.34));
  }
}

:global(html.dark) .founder__title,
:global(html.dark) .founder__lead,
:global(html.dark) .founder__sign strong {
  color: #e8eef8;
}

:global(html.dark) .founder__p {
  color: rgb(232 238 248 / 0.82);
}

:global(html.dark) .founder__sign {
  border-top-color: rgb(255 255 255 / 0.12);
}

:global(html.dark) .founder__sign span {
  color: rgb(232 238 248 / 0.5);
}

:global(html.dark) .founder__stage {
  background: #15233c;
}

:global(html.dark) .founder__wash {
  background:
    radial-gradient(ellipse 52% 68% at 86% 62%, rgb(255 51 51 / 0.15), transparent 64%),
    radial-gradient(ellipse 44% 52% at 14% 24%, rgb(120 160 220 / 0.12), transparent 60%),
    linear-gradient(165deg, rgb(21 35 60 / 0.9) 0%, rgb(16 28 48 / 0.94) 100%);
}

:global(html.dark) .founder__quote {
  background: rgb(18 28 48 / 0.84);
  border-color: rgb(255 255 255 / 0.1);
  box-shadow: 0 14px 34px rgb(0 0 0 / 0.28);
}
</style>
