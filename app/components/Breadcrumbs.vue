<script setup lang="ts">
import { computed } from 'vue'
import { resolveBreadcrumbs } from '~/data/breadcrumbs'
import type { BreadcrumbItem } from '~/types'

const props = defineProps<{
  items?: BreadcrumbItem[]
}>()

const route = useRoute()
const siteUrl = useRequestURL().origin

const items = computed(() => {
  if (props.items?.length) {
    return props.items
  }

  return resolveBreadcrumbs(
    route.path,
    route.meta.breadcrumb as string | undefined,
  )
})

useHead(computed(() => ({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.value.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        ...(item.to ? { item: `${siteUrl}${item.to}` } : {}),
      })),
    }),
  }],
})))
</script>

<template>
  <nav v-if="items.length > 1" aria-label="Хлебные крошки" class="mb-5 sm:mb-6">
    <ol class="flex flex-wrap items-center gap-1 rounded-xl border border-brand-100 bg-brand-50/80 px-3 py-2.5 sm:gap-1.5 sm:px-4">
      <li
        v-for="(item, index) in items"
        :key="`${item.label}-${index}`"
        class="flex min-w-0 items-center gap-1 sm:gap-1.5"
      >
        <svg
          v-if="index > 0"
          class="h-3.5 w-3.5 shrink-0 text-brand-300 sm:h-4 sm:w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>

        <NuxtLink
          v-if="item.to"
          :to="item.to"
          class="inline-flex min-h-[32px] items-center gap-1.5 rounded-md px-1 text-xs font-medium text-brand-500 transition hover:bg-white hover:text-brand-600 sm:text-sm"
        >
          <svg
            v-if="index === 0"
            class="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>{{ item.label }}</span>
        </NuxtLink>

        <span
          v-else
          aria-current="page"
          class="max-w-[12rem] truncate px-1 text-xs font-semibold text-brand-600 sm:max-w-xs sm:text-sm md:max-w-md"
          :title="item.label"
        >
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>
