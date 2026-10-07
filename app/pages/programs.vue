<script setup lang="ts">
import { programsPage } from '~/data/about'
import { pages } from '~/data/pages'
import { site } from '~/data/site'

const meta = pages.programs

definePageMeta({ breadcrumb: meta.breadcrumb })

usePageSeo(`${meta.title} — ${site.name}`, meta.description)
</script>

<template>
  <div>
    <BaseSection page-top alt container-class="max-w-5xl">
      <ScrollReveal>
        <Breadcrumbs />
        <SectionHeader v-bind="programsPage.heading" />
      </ScrollReveal>

      <ProgramsTabsContent
        source="programs-page"
        tab-id-prefix="programs-page"
        show-details
      />
    </BaseSection>

    <CtaSection
      title="Узнать подробности"
      description="Оставьте заявку — подберём группу и расскажем о расписании."
      button-text="Оставить заявку"
      source="programs-page-bottom"
    />
  </div>
</template>
