<script setup lang="ts">
import { computed } from 'vue'

export interface NewsPreviewItem {
  title: string
  topic?: string | null
  description?: string | null
  imageUrl?: string | null
  date?: string | null
}

const props = defineProps<{
  item: NewsPreviewItem
}>()

function formatNewsDate(value?: string | null) {
  if (!value) {
    return new Date().toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const title = computed(() => props.item.title.trim() || 'Заголовок новости')
const topic = computed(() => props.item.topic?.trim() || 'Новости')
const excerpt = computed(() => {
  const text = props.item.description?.trim()
  if (text) return text.slice(0, 160)
  return 'Короткий анонс появится здесь'
})
const dateLabel = computed(() => formatNewsDate(props.item.date))
</script>

<template>
  <article class="news-card group">
    <div class="news-card__media">
      <img
        v-if="item.imageUrl"
        :src="item.imageUrl"
        :alt="title"
        class="news-card__img"
      >
      <div v-else class="news-card__empty">
        <svg class="news-card__empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <span
        v-if="item.imageUrl"
        class="news-card__shade"
        aria-hidden="true"
      />
    </div>

    <div class="news-card__body">
      <div class="news-card__meta">
        <span class="news-card__topic">{{ topic }}</span>
        <time class="news-card__date">{{ dateLabel }}</time>
      </div>
      <h3 class="news-card__title">{{ title }}</h3>
      <p class="news-card__excerpt">{{ excerpt }}</p>
      <span class="news-card__more">Читать →</span>
    </div>
  </article>
</template>

<style scoped>
/* Полная копия карточки новостей на сайте (NewsCard) */
.news-card {
  display: flex;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 4px 24px rgb(37 56 99 / 8%);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.news-card:hover {
  border-color: #b9c9e1;
  box-shadow: 0 10px 28px rgb(37 56 99 / 12%);
}

.news-card__media {
  position: relative;
  aspect-ratio: 4 / 3;
  flex-shrink: 0;
  overflow: hidden;
  background: #eef2f8;
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

.news-card__empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.news-card__empty-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: #8aa3c9;
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

.news-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 1.25rem;
}

.news-card__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
}

.news-card__topic {
  display: inline-flex;
  padding: 0.125rem 0.625rem;
  border-radius: 0.375rem;
  background: #fdf2f2;
  color: #b0191b;
  font-weight: 600;
}

.news-card__date {
  color: #5a7aad;
}

.news-card__title {
  margin: 0;
  color: #253863;
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.35;
  transition: color 0.15s ease;
  /* Полный заголовок — как на сайте, без обрезки */
  white-space: normal;
  overflow-wrap: anywhere;
}

.news-card:hover .news-card__title {
  color: #b0191b;
}

.news-card__excerpt {
  flex: 1;
  margin: 0.5rem 0 0;
  color: rgb(37 56 99 / 70%);
  font-size: 0.875rem;
  line-height: 1.625;
}

.news-card__more {
  display: inline-block;
  margin-top: 1rem;
  color: #253863;
  font-size: 0.875rem;
  font-weight: 700;
  pointer-events: none;
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
