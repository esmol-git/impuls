<script setup lang="ts">
import { conditionCards, conditionsSection } from '~/data/conditions'
</script>

<template>
  <BaseSection id="conditions" container-class="max-w-5xl">
    <ScrollReveal>
      <h2 class="text-center text-xl font-extrabold leading-snug text-brand-600 sm:text-2xl lg:text-3xl">
        <span class="text-accent-500">{{ conditionsSection.titleBefore }}</span>
        {{ conditionsSection.titleAccent }}
      </h2>
    </ScrollReveal>

    <ScrollReveal>
      <ol class="conditions-grid list-none">
        <li
          v-for="card in conditionCards"
          :key="card.step"
          class="conditions-item"
        >
          <article class="conditions-card">
            <div class="conditions-card__head">
              <span class="conditions-card__num" aria-hidden="true">
                {{ String(card.step).padStart(2, '0') }}
              </span>
              <span class="conditions-card__rule" aria-hidden="true" />
            </div>
            <h3 class="conditions-card__title">
              {{ card.title }}
            </h3>
            <p class="conditions-card__text">
              {{ card.description }}
            </p>
          </article>
        </li>
      </ol>
    </ScrollReveal>
  </BaseSection>
</template>

<style scoped>
.conditions-grid {
  display: grid;
  gap: 1rem;
  margin: 2rem 0 0;
  padding: 0;
}

@media (min-width: 640px) {
  .conditions-grid {
    margin-top: 2.5rem;
  }
}

@media (min-width: 1024px) {
  .conditions-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.25rem;
    margin-top: 2.75rem;
  }
}

.conditions-card {
  height: 100%;
  padding: 1.35rem 1.35rem 1.5rem;
  border-radius: 1.25rem;
  border: 1px solid rgb(37 56 99 / 0.1);
  background:
    linear-gradient(165deg, rgb(255 255 255 / 0.95) 0%, rgb(238 242 247 / 0.55) 100%);
  box-shadow: 0 10px 28px rgb(37 56 99 / 0.06);
}

@media (min-width: 640px) {
  .conditions-card {
    padding: 1.6rem 1.6rem 1.75rem;
  }
}

.conditions-card__head {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1rem;
}

.conditions-card__num {
  flex-shrink: 0;
  font-size: 1.75rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
  color: #ff2a2a;
}

.conditions-card__rule {
  display: block;
  height: 2px;
  width: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, rgb(255 42 42 / 0.55), rgb(37 56 99 / 0.08));
}

.conditions-card__title {
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.3;
  color: #253863;
}

.conditions-card__text {
  margin-top: 0.7rem;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: rgb(37 56 99 / 0.78);
}

:global(html.dark .conditions-card) {
  border-color: rgb(200 214 235 / 0.12);
  background:
    linear-gradient(165deg, rgb(28 42 68 / 0.95) 0%, rgb(20 31 51 / 0.9) 100%);
  box-shadow: 0 12px 30px rgb(0 0 0 / 0.25);
}

:global(html.dark .conditions-card__title) {
  color: #e8eef8;
}

:global(html.dark .conditions-card__text) {
  color: rgb(232 238 248 / 0.78);
}

:global(html.dark .conditions-card__rule) {
  background: linear-gradient(90deg, rgb(255 92 92 / 0.55), rgb(200 214 235 / 0.1));
}
</style>
