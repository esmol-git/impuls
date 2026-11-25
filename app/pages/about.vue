<script setup lang="ts">
import {
  aboutIntro,
  aboutMilestones,
  aboutParagraphs,
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
      </ScrollReveal>

      <div class="mt-6 grid gap-8 sm:mt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start lg:gap-12 xl:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
        <ScrollReveal>
          <SectionHeader v-bind="aboutIntro" />
          <div class="mt-6 space-y-5 text-brand-600/80 sm:mt-8">
            <p v-for="(paragraph, index) in aboutParagraphs" :key="index" class="leading-relaxed">
              {{ paragraph }}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal class="lg:pt-1">
          <AboutGallerySlider />
        </ScrollReveal>
      </div>

      <ScrollReveal class="mt-8 sm:mt-10">
        <AboutLeadershipCard />
      </ScrollReveal>
    </BaseSection>

    <StatsBand />

    <BaseSection id="values" container-class="max-w-5xl">
      <ScrollReveal>
        <SectionHeader v-bind="aboutValuesHeading" />
      </ScrollReveal>
      <ScrollReveal class="mt-8 sm:mt-10">
        <AboutValuesList />
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
              <span class="relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-500 ring-4 ring-[var(--section-surface,#fff)] sm:h-7 sm:w-7">
                <span class="h-2 w-2 rounded-full bg-white" aria-hidden="true" />
              </span>
              <div class="card min-w-0 flex-1 p-4 sm:p-5">
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
