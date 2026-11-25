<script setup lang="ts">
import { coachesApproach } from '~/data/coaches'
import { pages } from '~/data/pages'
import { site } from '~/data/site'

const meta = pages.coaches
const { visible } = await useManagedSections()
const { data: coaches } = await useCoaches()

const sectionEnabled = computed(() => visible.value.coaches)
const hasCoaches = computed(() => Boolean(coaches.value?.length))

definePageMeta({ breadcrumb: meta.breadcrumb })

usePageSeo(`${meta.title} — ${site.name}`, meta.description)
</script>

<template>
  <div>
    <BaseSection page-top alt>
      <ScrollReveal>
        <Breadcrumbs />
        <SectionHeader v-bind="meta.heading" />

        <ul
          v-if="sectionEnabled && hasCoaches"
          class="mt-8 grid list-none gap-6 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3"
        >
          <li v-for="coach in coaches" :key="coach.id">
            <CoachCard :coach="coach" />
          </li>
        </ul>

        <p
          v-else
          class="mt-10 text-center text-sm text-brand-500"
        >
          {{
            sectionEnabled
              ? 'Скоро здесь появится команда тренеров.'
              : 'Сейчас раздел скрыт или в нём ещё нет тренеров.'
          }}
        </p>
      </ScrollReveal>
    </BaseSection>

    <template v-if="sectionEnabled">
      <BaseSection id="approach" alt container-class="max-w-4xl">
        <ScrollReveal>
          <SectionHeader
            :label="coachesApproach.label"
            :title="coachesApproach.title"
            :description="coachesApproach.description"
            align="center"
          />
        </ScrollReveal>

        <ScrollReveal>
          <ul class="mt-8 grid list-none gap-4 sm:mt-10">
            <li v-for="(point, index) in coachesApproach.points" :key="index">
              <div class="card flex gap-4 p-4 sm:p-5">
                <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-sm font-extrabold text-accent-500">
                  {{ index + 1 }}
                </span>
                <p class="text-sm leading-relaxed text-brand-600/80 sm:text-base">{{ point }}</p>
              </div>
            </li>
          </ul>
        </ScrollReveal>
      </BaseSection>

      <CtaSection
        title="Познакомьтесь с тренером на занятии"
        description="Запишитесь на бесплатное пробное — ребёнок попадёт в группу к педагогу своего возраста и уровня."
        button-text="Записаться на пробное"
        source="coaches-bottom"
      />
    </template>
  </div>
</template>
