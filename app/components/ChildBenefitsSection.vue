<script setup lang="ts">
import { childBenefitCards, childBenefitsSection } from '~/data/childBenefits'
</script>

<template>
  <BaseSection id="child-benefits" container-class="max-w-5xl">
    <ScrollReveal>
      <h2 class="text-center text-xl font-extrabold leading-snug text-brand-600 sm:text-2xl lg:text-3xl">
        {{ childBenefitsSection.titleBefore }}
        <span class="text-accent-500">{{ childBenefitsSection.titleAccent }}</span>
      </h2>
    </ScrollReveal>

    <ScrollReveal>
      <ul class="mt-8 grid list-none gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        <li v-for="card in childBenefitCards" :key="card.id">
          <article class="benefit-card group relative flex h-full min-h-[260px] flex-col overflow-hidden rounded-xl border border-brand-100 sm:min-h-[280px]">
            <div class="absolute inset-0">
              <img
                v-if="card.imageSrc"
                :src="card.imageSrc"
                :alt="card.imageAlt"
                class="h-full w-full object-cover object-[center_28%]"
                loading="lazy"
                decoding="async"
              >
              <UiMediaPlaceholder
                v-else
                :label="card.imageAlt"
                hint="Фото готовится"
                aspect="auto"
                compact
                class="absolute inset-0 !h-full !min-h-0 !rounded-none"
              />
            </div>

            <div class="benefit-card__scrim" aria-hidden="true" />

            <div class="benefit-card__copy relative z-[1] mt-auto p-4 sm:p-5">
              <h3 class="text-base font-bold leading-snug text-white sm:text-lg">
                {{ card.title }}
              </h3>
              <p class="mt-1.5 text-sm leading-relaxed text-white/90">
                {{ card.description }}
              </p>
            </div>
          </article>
        </li>
      </ul>
    </ScrollReveal>
  </BaseSection>
</template>

<style scoped>
.benefit-card__scrim {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    linear-gradient(
      to top,
      rgb(16 25 45 / 0.97) 0%,
      rgb(16 25 45 / 0.92) 34%,
      rgb(16 25 45 / 0.55) 58%,
      rgb(16 25 45 / 0.18) 78%,
      transparent 100%
    );
}

.benefit-card__copy {
  text-shadow: 0 1px 3px rgb(0 0 0 / 0.55);
}
</style>
