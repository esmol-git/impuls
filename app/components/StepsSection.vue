<script setup lang="ts">
import { enrollmentSteps } from '~/data/steps'
import { sections } from '~/data/sections'

const config = sections.steps
</script>

<template>
  <BaseSection id="steps" alt v-slot="{ headingId }">
    <SectionHeader
      v-bind="config"
      :title-id="headingId"
    />

    <ol class="mt-8 grid list-none gap-5 sm:mt-12 sm:gap-6 lg:grid-cols-3 lg:gap-8">
      <li v-for="step in enrollmentSteps" :key="step.step" class="relative">
        <ScrollReveal class="h-full">
          <article class="card relative flex h-full flex-col p-5 sm:p-6">
            <span
              class="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-base font-extrabold text-white sm:h-12 sm:w-12 sm:text-lg"
              aria-hidden="true"
            >
              {{ step.step }}
            </span>
            <h3 class="text-lg font-bold text-brand-600">
              {{ step.title }}
            </h3>
            <p class="mt-2 flex-1 text-sm leading-relaxed text-brand-600/70 sm:text-base">
              {{ step.description }}
            </p>
          </article>
        </ScrollReveal>
      </li>
    </ol>

    <ScrollReveal>
      <div class="mt-8 flex justify-center sm:mt-10">
        <ModalTrigger
          type="lead"
          :payload="{ source: 'steps' }"
          class="btn-primary w-full sm:w-auto"
        >
          Записаться на пробное
        </ModalTrigger>
      </div>
    </ScrollReveal>
  </BaseSection>
</template>
