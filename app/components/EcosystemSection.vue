<script setup lang="ts">
import { ecosystemCards, ecosystemSection } from '~/data/ecosystem'
</script>

<template>
  <BaseSection id="ecosystem" alt container-class="max-w-5xl">
    <div class="relative overflow-hidden rounded-2xl bg-brand-700 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div
        class="pointer-events-none absolute inset-0 opacity-20"
        aria-hidden="true"
        style="background-image: radial-gradient(circle at 30% 20%, #b0191b 0%, transparent 50%), radial-gradient(circle at 80% 80%, #3d5d91 0%, transparent 40%)"
      />

      <ScrollReveal class="relative">
        <h2 class="text-center text-xl font-extrabold leading-snug text-white sm:text-2xl lg:text-3xl">
          {{ ecosystemSection.title }}
        </h2>
        <p class="mx-auto mt-4 max-w-3xl text-center text-sm leading-relaxed text-white/75 sm:text-base">
          {{ ecosystemSection.intro }}
        </p>
      </ScrollReveal>

      <ul class="relative mt-8 grid list-none gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5">
        <li v-for="card in ecosystemCards" :key="card.id">
          <ScrollReveal class="h-full">
            <article class="flex h-full flex-col rounded-xl border border-white/10 bg-brand-800/60 p-4 backdrop-blur-sm sm:p-5">
              <h3 class="font-bold text-white">{{ card.title }}</h3>
              <ul class="mt-3 flex-1 space-y-2">
                <li
                  v-for="item in card.items"
                  :key="item"
                  class="flex gap-2 text-sm leading-snug text-white/75"
                >
                  <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" aria-hidden="true" />
                  {{ item }}
                </li>
              </ul>
            </article>
          </ScrollReveal>
        </li>
      </ul>

      <ScrollReveal>
        <div class="relative mt-8 flex justify-center sm:mt-10">
          <ModalTrigger
            type="lead"
            :payload="{ source: 'ecosystem' }"
            class="btn-primary w-full sm:w-auto"
          >
            Записаться на бесплатное занятие
          </ModalTrigger>
        </div>
      </ScrollReveal>
    </div>
  </BaseSection>
</template>
