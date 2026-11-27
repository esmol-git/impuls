<script setup lang="ts">
import type { EnrollmentStepIcon } from '~/types'
import { enrollmentSteps } from '~/data/steps'
import { sections } from '~/data/sections'

const config = sections.steps

const icons: Record<EnrollmentStepIcon, string> = {
  form: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
  trial: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z',
  train: 'M13 10V3L4 14h7v7l9-11h-7z',
}
</script>

<template>
  <BaseSection id="steps" v-slot="{ headingId }">
    <div class="steps-block">
    <SectionHeader
      v-bind="config"
      :title-id="headingId"
    />

    <ScrollReveal>
      <ol class="steps-track">
        <li
          v-for="(step, index) in enrollmentSteps"
          :key="step.step"
          class="steps-item"
        >
          <article class="step-card card">
            <span class="step-card__index" aria-hidden="true">
              {{ String(step.step).padStart(2, '0') }}
            </span>

            <div class="step-card__top">
              <span class="step-card__badge" aria-hidden="true">
                {{ step.step }}
              </span>
              <span
                v-if="step.icon"
                class="step-card__icon"
                aria-hidden="true"
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                  <path stroke-linecap="round" stroke-linejoin="round" :d="icons[step.icon]" />
                </svg>
              </span>
            </div>

            <h3 class="step-card__title">
              {{ step.title }}
            </h3>
            <p class="step-card__text">
              {{ step.description }}
            </p>
          </article>

          <span
            v-if="index < enrollmentSteps.length - 1"
            class="steps-connector"
            aria-hidden="true"
          />
        </li>
      </ol>

      <div class="steps-cta surface-brand relative mt-8 overflow-hidden rounded-2xl bg-brand-600 sm:mt-10">
        <div
          class="absolute inset-0 bg-gradient-to-r from-brand-700/90 via-brand-600/85 to-brand-600/70"
          aria-hidden="true"
        />
        <div class="accent-bloom accent-bloom--corner" aria-hidden="true" />
        <div class="relative z-[1] flex flex-col items-center gap-3 px-4 py-7 text-center sm:px-8 sm:py-8">
          <p class="text-sm font-medium text-white/80 sm:text-base">
            Первое занятие — бесплатно
          </p>
          <ModalTrigger
            type="lead"
            :payload="{ source: 'steps' }"
            class="btn-primary w-full max-w-full min-w-0 sm:w-auto"
          >
            Записаться на пробное
          </ModalTrigger>
        </div>
      </div>
    </ScrollReveal>
    </div>
  </BaseSection>
</template>

<style scoped>
.steps-block {
  display: flex;
  flex-direction: column;
  gap: 3.25rem;
}

@media (min-width: 640px) {
  .steps-block {
    gap: 3.75rem;
  }
}

.steps-track {
  display: grid;
  gap: 1rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

@media (min-width: 1024px) {
  .steps-track {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.25rem;
  }
}

.steps-item {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.steps-connector {
  display: none;
}

@media (min-width: 1024px) {
  .steps-connector {
    display: block;
    position: absolute;
    top: 2.35rem;
    left: calc(100% - 0.15rem);
    z-index: 2;
    width: 1.55rem;
    height: 2px;
    background: linear-gradient(
      90deg,
      rgb(var(--c-accent-500) / 0.55),
      rgb(var(--c-brand-300) / 0.65)
    );
    pointer-events: none;
  }

  .steps-connector::after {
    content: '';
    position: absolute;
    top: 50%;
    right: -1px;
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: rgb(var(--c-accent-500));
    transform: translateY(-50%);
    box-shadow: 0 0 0 3px rgb(var(--c-accent-500) / 0.18);
  }
}

.step-card {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  padding: 1.25rem 1.25rem 1.35rem;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}

.step-card::before {
  content: '';
  position: absolute;
  inset: 0 auto auto 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, rgb(var(--c-accent-500)), transparent 75%);
  opacity: 0.85;
}

.step-card:hover {
  transform: translateY(-3px);
  border-color: rgb(var(--c-accent-500) / 0.28);
}

.step-card__index {
  position: absolute;
  right: 0.85rem;
  bottom: 0.55rem;
  font-size: 2.4rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
  color: rgb(var(--c-brand-600) / 0.07);
  pointer-events: none;
}

.step-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.step-card__badge {
  display: flex;
  width: 2.65rem;
  height: 2.65rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 0.85rem;
  background: linear-gradient(
    145deg,
    rgb(var(--c-brand-600)),
    rgb(var(--c-brand-500)) 55%,
    rgb(var(--c-accent-500))
  );
  font-size: 1rem;
  font-weight: 800;
  color: #fff;
  box-shadow: 0 10px 20px -10px rgb(var(--c-brand-600) / 0.55);
}

.step-card__icon {
  display: flex;
  width: 2.4rem;
  height: 2.4rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: rgb(var(--c-accent-50));
  color: rgb(var(--c-accent-500));
}

.step-card__icon svg {
  width: 1.2rem;
  height: 1.2rem;
}

.step-card__title {
  margin: 0;
  padding-right: 1.5rem;
  font-size: 1.05rem;
  font-weight: 800;
  line-height: 1.25;
  color: rgb(var(--c-brand-600));
}

.step-card__text {
  margin: 0.55rem 0 0;
  padding-right: 1.25rem;
  font-size: 0.9rem;
  line-height: 1.5;
  color: rgb(var(--c-brand-600) / 0.72);
}

@media (min-width: 640px) {
  .step-card {
    padding: 1.4rem 1.4rem 1.5rem;
  }

  .step-card__badge {
    width: 2.85rem;
    height: 2.85rem;
  }

  .step-card__title {
    font-size: 1.125rem;
  }

  .step-card__text {
    font-size: 0.95rem;
  }

  .step-card__index {
    font-size: 2.75rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .step-card {
    transition: none;
  }

  .step-card:hover {
    transform: none;
  }
}

:global(html.dark .step-card__icon) {
  background: rgb(255 255 255 / 0.06);
}
</style>
