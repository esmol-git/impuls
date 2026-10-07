<script setup lang="ts">
import { childBenefitCards, childBenefitsSection } from '~/data/childBenefits'
</script>

<template>
  <BaseSection id="child-benefits" alt container-class="max-w-5xl">
    <ScrollReveal>
      <h2 class="text-center text-xl font-extrabold leading-snug text-brand-600 sm:text-2xl lg:text-3xl">
        {{ childBenefitsSection.titleBefore }}
        <span class="text-accent-500">{{ childBenefitsSection.titleAccent }}</span>
      </h2>
    </ScrollReveal>

    <ul class="mt-8 grid list-none gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
      <li v-for="card in childBenefitCards" :key="card.id">
        <ScrollReveal class="h-full">
          <article class="group relative h-full min-h-[200px] overflow-hidden rounded-xl border border-brand-100 sm:min-h-[220px]">
            <div v-if="card.imageSrc" class="absolute inset-0">
              <img :src="card.imageSrc" :alt="card.imageAlt" class="h-full w-full object-cover">
            </div>
            <UiMediaPlaceholder
              v-else
              :label="card.imageAlt"
              aspect="auto"
              class="absolute inset-0 !h-full !min-h-0 !rounded-none"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-brand-900/90 via-brand-900/40 to-transparent" />
            <p class="absolute inset-x-0 bottom-0 p-4 text-sm font-semibold leading-snug text-white sm:p-5 sm:text-base">
              {{ card.title }}
            </p>
          </article>
        </ScrollReveal>
      </li>
    </ul>
  </BaseSection>
</template>
