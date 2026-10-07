<script setup lang="ts">
import { pages } from '~/data/pages'
import { site } from '~/data/site'
import { educationSections } from '~/data/education'

const meta = pages.education

definePageMeta({ breadcrumb: meta.breadcrumb })

usePageSeo(`${meta.title} — ${site.name}`, meta.description)
</script>

<template>
  <BaseSection page-top alt>
    <Breadcrumbs />
    <SectionHeader v-bind="meta.heading" />

    <div class="mt-8 space-y-4 sm:mt-12">
      <article
        v-for="section in educationSections"
        :id="section.id"
        :key="section.id"
        class="card p-4 sm:p-6"
      >
        <h2 class="text-base font-bold text-brand-600 sm:text-lg">{{ section.title }}</h2>
        <p class="mt-3 text-sm leading-relaxed text-brand-600/70">{{ section.content }}</p>
      </article>
    </div>
  </BaseSection>
</template>
