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

const aboutLead = aboutParagraphs[0]
const aboutBeside = aboutParagraphs.slice(1)
</script>

<template>
  <div>
    <BaseSection page-top alt>
      <ScrollReveal>
        <Breadcrumbs />
      </ScrollReveal>

      <ScrollReveal class="about-hero mt-6 sm:mt-8">
        <div class="about-hero__intro">
          <SectionHeader v-bind="aboutIntro" />
          <p class="about-hero__lead">
            {{ aboutLead }}
          </p>
          <p
            v-for="(paragraph, index) in aboutBeside"
            :key="index"
            class="about-hero__p"
          >
            {{ paragraph }}
          </p>
        </div>
        <aside class="about-hero__media">
          <AboutGallerySlider />
        </aside>
      </ScrollReveal>

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

<style scoped>
.about-hero {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.about-hero__lead {
  margin: 1.35rem 0 0;
  max-width: 36rem;
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.65;
  color: #253863;
}

.about-hero__p {
  margin: 0.95rem 0 0;
  max-width: 36rem;
  font-size: 0.98rem;
  line-height: 1.7;
  color: rgb(37 56 99 / 0.82);
}

.about-hero__media {
  width: 100%;
  max-width: 24rem;
  margin-inline: auto;
}

@media (min-width: 1024px) {
  .about-hero {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(22rem, 26rem);
    align-items: start;
    column-gap: 2.75rem;
  }

  .about-hero__media {
    max-width: none;
    margin-inline: 0;
    position: sticky;
    top: 6.5rem;
  }

  .about-hero__lead {
    margin-top: 1.5rem;
    font-size: 1.08rem;
  }
}

@media (min-width: 1280px) {
  .about-hero {
    grid-template-columns: minmax(0, 1.2fr) minmax(24rem, 28rem);
    column-gap: 3rem;
  }
}

:global(html.dark) .about-hero__lead {
  color: #e8eef8;
}

:global(html.dark) .about-hero__p {
  color: rgb(232 238 248 / 0.8);
}
</style>
