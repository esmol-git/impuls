<script setup lang="ts">
import { pages } from '~/data/pages'
import { site } from '~/data/site'

const meta = pages.privacy

definePageMeta({ breadcrumb: meta.breadcrumb })

usePageSeo(`${meta.title} — ${site.name}`, meta.description)
</script>

<template>
  <BaseSection page-top alt>
    <Breadcrumbs />
    <SectionHeader v-bind="meta.heading" />
    <div class="prose prose-brand mt-8 max-w-none sm:mt-10">
      <p class="text-brand-600/70">Lorem ipsum — заглушка для текста политики.</p>
    </div>
  </BaseSection>
</template>
