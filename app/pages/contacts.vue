<script setup lang="ts">
import { contactsSections } from '~/data/about'
import { contactsFaq } from '~/data/contacts'
import { pages } from '~/data/pages'
import { site } from '~/data/site'
import { locations } from '~/data/locations'

const meta = pages.contacts

const contactsFaqHeading = {
  label: 'Вопросы',
  title: 'Перед записью',
  description: 'Короткие ответы о филиалах и пробном занятии',
} as const

definePageMeta({ breadcrumb: meta.breadcrumb })

usePageSeo(`${meta.title} — ${site.name}`, meta.description)
</script>

<template>
  <div>
    <BaseSection page-top alt>
      <ScrollReveal>
        <Breadcrumbs />
        <SectionHeader v-bind="contactsSections.locations" />
      </ScrollReveal>

      <div class="mt-8 sm:mt-12">
        <ScrollReveal>
          <LocationsSlider :items="locations" source="contacts-location" />
        </ScrollReveal>
      </div>

      <div class="mt-8 sm:mt-12">
        <ScrollReveal>
          <MapSection />
        </ScrollReveal>
      </div>
    </BaseSection>

    <BaseSection id="contacts-info">
      <ScrollReveal>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <HeaderPhone variant="card" class="h-full" />

          <a
            :href="`mailto:${site.email}`"
            class="card flex h-full flex-col p-5 transition hover:border-brand-200 sm:p-6"
          >
            <p class="text-xs font-semibold uppercase tracking-wider text-accent-500">Email</p>
            <p class="mt-2 text-lg font-bold text-brand-600">{{ site.email }}</p>
            <p class="mt-auto pt-3 text-sm text-brand-400">Ответим в рабочее время</p>
          </a>

          <div class="card flex h-full flex-col p-5 sm:p-6">
            <p class="text-xs font-semibold uppercase tracking-wider text-accent-500">Мы в соцсетях</p>
            <p class="mt-2 text-sm text-brand-600/70">Новости, фото с тренировок и анонсы турниров</p>
            <SocialLinks size="sm" class="mt-4" />
          </div>
        </div>
      </ScrollReveal>
    </BaseSection>

    <BaseSection id="form">
      <div class="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ScrollReveal>
          <SectionHeader v-bind="contactsSections.form" />
          <p class="mt-4 text-sm leading-relaxed text-brand-600/70">
            Или позвоните — подберём филиал и время пробного занятия за один разговор.
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <div class="card p-6 sm:p-8">
            <LeadForm variant="full" :payload="{ source: 'contacts-page' }" />
          </div>
        </ScrollReveal>
      </div>
    </BaseSection>

    <FaqAccordion
      section-id="contacts-faq"
      :items="contactsFaq"
      :heading="contactsFaqHeading"
      alt
    />
  </div>
</template>
