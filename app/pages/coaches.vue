<script setup lang="ts">
import { coachesApproach } from '~/data/coaches'
import { pages } from '~/data/pages'
import { site } from '~/data/site'

const meta = pages.coaches
const { data: coaches } = await useCoaches()

definePageMeta({ breadcrumb: meta.breadcrumb })

usePageSeo(`${meta.title} — ${site.name}`, meta.description)
</script>

<template>
  <div>
    <BaseSection page-top alt>
      <ScrollReveal>
        <Breadcrumbs />
        <SectionHeader v-bind="meta.heading" />
      </ScrollReveal>

      <ul class="mt-8 grid list-none gap-6 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="coach in coaches" :key="coach.id">
          <ScrollReveal class="h-full">
            <CoachCard :coach="coach" />
          </ScrollReveal>
        </li>
      </ul>

      <p v-if="!coaches?.length" class="mt-10 text-center text-sm text-brand-500">
        Скоро здесь появится команда тренеров.
      </p>
    </BaseSection>

    <BaseSection id="approach" alt container-class="max-w-4xl">
      <ScrollReveal>
        <SectionHeader
          :label="coachesApproach.label"
          :title="coachesApproach.title"
          :description="coachesApproach.description"
          align="center"
        />
      </ScrollReveal>

      <ul class="mt-8 grid list-none gap-4 sm:mt-10">
        <li v-for="(point, index) in coachesApproach.points" :key="index">
          <ScrollReveal>
            <div class="flex gap-4 rounded-xl border border-brand-100 bg-white p-4 sm:p-5">
              <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-sm font-extrabold text-accent-500">
                {{ index + 1 }}
              </span>
              <p class="text-sm leading-relaxed text-brand-600/80 sm:text-base">{{ point }}</p>
            </div>
          </ScrollReveal>
        </li>
      </ul>
    </BaseSection>

    <CtaSection
      title="Познакомьтесь с тренером на занятии"
      description="Запишитесь на бесплатное пробное — ребёнок попадёт в группу к педагогу своего возраста и уровня."
      button-text="Записаться на пробное"
      source="coaches-bottom"
    />
  </div>
</template>
