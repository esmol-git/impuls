<script setup lang="ts">
import {
  aboutHighlight,
  aboutIntro,
  aboutMilestones,
  aboutParagraphs,
  aboutValues,
  aboutValuesHeading,
} from '~/data/about'
import { pages } from '~/data/pages'
import { site } from '~/data/site'

const meta = pages.about

definePageMeta({ breadcrumb: meta.breadcrumb })

usePageSeo(`${meta.title} — ${site.name}`, meta.description)
</script>

<template>
  <div>
    <BaseSection page-top alt>
      <ScrollReveal>
        <Breadcrumbs />
        <SectionHeader v-bind="aboutIntro" />
      </ScrollReveal>

      <div class="mt-8 grid gap-8 sm:mt-12 lg:grid-cols-[1fr_minmax(0,20rem)] lg:items-start lg:gap-10">
        <ScrollReveal class="space-y-5 text-brand-600/80">
          <p v-for="(paragraph, index) in aboutParagraphs" :key="index" class="leading-relaxed">
            {{ paragraph }}
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <UiMediaPlaceholder
            label="Фото школы на тренировке"
            hint="Скоро добавим"
            aspect="video"
          />
        </ScrollReveal>
      </div>

      <ScrollReveal class="mt-8 sm:mt-10">
        <aside class="surface-brand relative overflow-hidden rounded-2xl bg-brand-600 px-6 py-8 sm:px-8 sm:py-10">
          <div class="accent-bloom accent-bloom--corner" aria-hidden="true" />
          <div class="relative z-[1]">
            <p class="text-sm font-semibold uppercase tracking-wider text-accent-300">
              {{ aboutHighlight.label }}
            </p>
            <h2 class="mt-2 text-xl font-bold text-white sm:text-2xl">{{ aboutHighlight.name }}</h2>
            <p class="mt-4 text-sm leading-relaxed text-white/80 sm:text-base">
              {{ aboutHighlight.text }}
            </p>
          </div>
        </aside>
      </ScrollReveal>
    </BaseSection>

    <StatsBand />

    <BaseSection id="values">
      <ScrollReveal>
        <SectionHeader v-bind="aboutValuesHeading" />
      </ScrollReveal>
      <ScrollReveal>
        <ul class="mt-8 grid list-none gap-6 sm:mt-12 md:grid-cols-3">
          <li v-for="value in aboutValues" :key="value.title">
            <FeatureCard v-bind="value" />
          </li>
        </ul>
      </ScrollReveal>
    </BaseSection>

    <BaseSection id="history" alt container-class="max-w-3xl">
      <ScrollReveal>
        <SectionHeader
          label="История"
          title="Как мы развивались"
          align="center"
        />
      </ScrollReveal>
      <ScrollReveal>
        <ol class="relative mt-8 list-none space-y-0 sm:mt-10">
          <li
            v-for="(item, index) in aboutMilestones"
            :key="item.year"
            class="relative flex gap-4 pb-8 last:pb-0 sm:gap-6"
          >
            <div
              v-if="index < aboutMilestones.length - 1"
              class="absolute left-[0.6875rem] top-8 h-[calc(100%-2rem)] w-px bg-brand-200 sm:left-3"
              aria-hidden="true"
            />
            <div class="flex w-full gap-4 sm:gap-6">
              <span class="relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-500 ring-4 ring-white sm:h-7 sm:w-7">
                <span class="h-2 w-2 rounded-full bg-white" aria-hidden="true" />
              </span>
              <div class="min-w-0 flex-1 rounded-xl border border-brand-100 bg-white p-4 sm:p-5">
                <p class="text-sm font-extrabold text-accent-500">{{ item.year }}</p>
                <p class="mt-1 text-sm leading-relaxed text-brand-600/80 sm:text-base">{{ item.text }}</p>
              </div>
            </div>
          </li>
        </ol>
      </ScrollReveal>
    </BaseSection>

    <CtaSection
      title="Приходите на бесплатное занятие"
      description="Убедитесь сами в атмосфере и подходе — запишем на пробную тренировку в удобном филиале."
      button-text="Записаться бесплатно"
      source="about-bottom"
    />
  </div>
</template>
