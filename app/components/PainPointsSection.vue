<script setup lang="ts">
import type { PainPointIcon } from '~/types'
import { painPoints, painPointsSection } from '~/data/painPoints'

const icons: Record<PainPointIcon, string> = {
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  health: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  gadget: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
  coach: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  quality: 'M7 20l4-16m2 16l4-16M6 9h14M4 15h14',
  friends: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
}
</script>

<template>
  <BaseSection id="pain-points" alt container-class="max-w-5xl">
    <ScrollReveal>
      <h2 class="text-center text-2xl font-extrabold text-brand-600 sm:text-3xl">
        {{ painPointsSection.title }}
      </h2>
    </ScrollReveal>

    <ul class="mt-6 grid list-none gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
      <li v-for="point in painPoints" :key="point.id">
        <ScrollReveal class="h-full">
          <article class="card flex h-full gap-3 p-4 sm:gap-4 sm:p-5">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-500 sm:h-10 sm:w-10">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" :d="icons[point.icon]" />
              </svg>
            </span>
            <p class="text-sm leading-relaxed text-brand-600/80 sm:text-base">
              {{ point.text }}
            </p>
          </article>
        </ScrollReveal>
      </li>
    </ul>

    <ScrollReveal>
      <div class="relative mt-6 overflow-hidden rounded-2xl bg-brand-600 sm:mt-8">
        <div
          class="absolute inset-0 bg-gradient-to-r from-brand-700/90 via-brand-600/85 to-brand-600/70"
          aria-hidden="true"
        />
        <div class="relative px-5 py-8 text-center sm:px-8 sm:py-10">
          <h3 class="text-xl font-bold text-white sm:text-2xl">
            {{ painPointsSection.joinTitle }}
          </h3>
          <p class="mt-2 text-sm font-bold uppercase tracking-wider text-accent-300 sm:text-base">
            {{ painPointsSection.joinSubtitle }}
          </p>
          <ModalTrigger
            type="lead"
            :payload="{ source: 'pain-points' }"
            class="btn-primary mx-auto mt-5 w-full sm:mt-6 sm:w-auto"
          >
            {{ painPointsSection.joinCta }}
          </ModalTrigger>
        </div>
      </div>
    </ScrollReveal>
  </BaseSection>
</template>
