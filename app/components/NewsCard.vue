<script setup lang="ts">
import type { NewsItem } from '~/types'
import { formatNewsDate } from '~/data/news'

defineProps<{
  item: NewsItem
  compact?: boolean
}>()
</script>

<template>
  <article class="card group flex h-full flex-col overflow-hidden transition hover:border-brand-200">
    <div class="relative aspect-video shrink-0 overflow-hidden bg-brand-50">
      <img
        v-if="item.imageUrl"
        :src="item.imageUrl"
        :alt="item.title"
        class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        loading="lazy"
      >
      <div v-else class="absolute inset-0 flex items-center justify-center">
        <svg class="h-10 w-10 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>

    <div class="flex flex-1 flex-col p-5" :class="{ 'p-4': compact }">
      <div class="mb-2 flex items-center gap-2 text-xs">
        <span class="rounded-md bg-accent-50 px-2.5 py-0.5 font-semibold text-accent-500">
          {{ item.category }}
        </span>
        <time :datetime="item.date" class="text-brand-400">{{ formatNewsDate(item.date) }}</time>
      </div>
      <h3 class="font-bold text-brand-600 transition group-hover:text-accent-500" :class="compact ? 'text-base' : 'text-lg'">
        {{ item.title }}
      </h3>
      <p v-if="!compact" class="mt-2 flex-1 text-sm leading-relaxed text-brand-600/70">
        {{ item.excerpt }}
      </p>
      <NuxtLink
        :to="`/news/${item.slug}`"
        class="mt-4 inline-block text-sm font-bold text-brand-600 hover:text-accent-500"
      >
        Читать →
      </NuxtLink>
    </div>
  </article>
</template>
