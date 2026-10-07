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

    <ul class="mt-8 grid list-none gap-5 sm:mt-10 lg:grid-cols-3 lg:gap-6">
      <li v-for="card in conditionCards" :key="card.step">
        <ScrollReveal class="h-full">
          <article class="card flex h-full flex-col overflow-hidden">
            <UiMediaPlaceholder :label="`Фото ${card.step}`" aspect="video" :rounded="false" />
            <div class="flex flex-1 flex-col p-5 sm:p-6">
              <span class="text-sm font-extrabold text-accent-500">{{ card.step }}</span>
              <h3 class="mt-2 text-base font-bold leading-snug text-brand-600 sm:text-lg">
                {{ card.title }}
              </h3>
              <p class="mt-2 flex-1 text-sm leading-relaxed text-brand-600/70">
                {{ card.description }}
              </p>
            </div>
          </article>
        </ScrollReveal>
      </li>
    </ul>
  </BaseSection>
</template>
