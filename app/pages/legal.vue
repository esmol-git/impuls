<script setup lang="ts">
import { pages } from '~/data/pages'
import { site } from '~/data/site'

const meta = pages.legal

definePageMeta({ breadcrumb: meta.breadcrumb })

usePageSeo(`${meta.title} — ${site.name}`, meta.description)
</script>

<template>
  <BaseSection page-top alt>
    <Breadcrumbs />
    <SectionHeader v-bind="meta.heading" />

    <div class="mt-8 space-y-12 sm:mt-10">
      <section id="consent" class="scroll-mt-28">
        <h2 class="text-xl font-extrabold tracking-tight text-brand-700 sm:text-2xl">
          Согласие на обработку персональных данных
        </h2>
        <div class="prose prose-brand mt-4 max-w-none">
          <p class="text-brand-600/70">
            Текст согласия будет добавлен позже.
          </p>
        </div>
      </section>

      <section id="policy" class="scroll-mt-28">
        <h2 class="text-xl font-extrabold tracking-tight text-brand-700 sm:text-2xl">
          Политика обработки персональных данных
        </h2>
        <div class="prose prose-brand mt-4 max-w-none">
          <p class="text-brand-600/70">
            Текст политики будет добавлен позже.
          </p>
        </div>
      </section>
    </div>
  </BaseSection>
</template>
