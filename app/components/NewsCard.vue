<script setup lang="ts">
import type { NewsItem } from '~/types'
import { formatNewsDate } from '~/data/news'

defineProps<{
  item: NewsItem
  compact?: boolean
}>()
</script>

<template>
  <article class="news-card card group flex h-full flex-col overflow-hidden transition hover:border-brand-200">
    <div class="news-card__media relative shrink-0 overflow-hidden bg-brand-50">
      <img
        v-if="item.imageUrl"
        :src="item.imageUrl"
        :alt="item.title"
        class="news-card__img"
        loading="lazy"
        decoding="async"
      >
      <div
        v-else
        class="absolute inset-0 flex items-center justify-center"
      >
        <svg class="h-10 w-10 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <span
        v-if="item.imageUrl"
        class="news-card__shade"
        aria-hidden="true"
      />
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

<style scoped>
.news-card__media {
  /* Чуть выше 16:10 — групповые фото меньше режутся по ногам */
  aspect-ratio: 4 / 3;
}

.news-card__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  transition: transform 0.35s ease;
}

.news-card:hover .news-card__img {
  transform: scale(1.03);
}

.news-card__shade {
  position: absolute;
  inset: auto 0 0;
  height: 28%;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgb(15 30 60 / 0.12) 100%
  );
}

@media (prefers-reduced-motion: reduce) {
  .news-card__img {
    transition: none;
  }

  .news-card:hover .news-card__img {
    transform: none;
  }
}
</style>
