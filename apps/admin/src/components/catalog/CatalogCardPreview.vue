<script setup lang="ts">
import { computed, ref, watch } from 'vue'

export interface CatalogPreviewItem {
  id?: string
  title: string
  category?: string | null
  description?: string | null
  price?: number | null
  discount?: number | null
  salePrice?: number | null
  imageUrls: string[]
}

const props = defineProps<{
  item: CatalogPreviewItem
}>()

function formatRub(value?: number | null) {
  if (value == null) return null
  return `${value.toLocaleString('ru-RU')} ₽`
}

const images = computed(() => props.item.imageUrls.filter(Boolean))
const priceLabel = computed(() => formatRub(props.item.price))
const saleLabel = computed(() => formatRub(props.item.salePrice))
const hasSale = computed(
  () =>
    props.item.salePrice != null &&
    props.item.price != null &&
    props.item.salePrice < props.item.price,
)

const current = ref(0)

watch(
  () => [props.item.id, images.value.join('|')] as const,
  () => {
    current.value = 0
  },
)

function goTo(index: number) {
  if (!images.value.length) return
  current.value = (index + images.value.length) % images.value.length
}

function prev() {
  goTo(current.value - 1)
}

function next() {
  goTo(current.value + 1)
}
</script>

<template>
  <article class="site-card group">
    <div class="site-card__media">
      <div
        v-if="images.length"
        class="site-card__track"
        :style="{ transform: `translateX(-${current * 100}%)` }"
      >
        <img
          v-for="(src, index) in images"
          :key="`${item.id || 'preview'}-${index}`"
          :src="src"
          :alt="item.title || 'Товар'"
          class="site-card__img"
          draggable="false"
        />
      </div>
      <div v-else class="site-card__empty">
        <svg class="site-card__empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      <span v-if="item.discount" class="site-card__discount">−{{ item.discount }}%</span>

      <template v-if="images.length > 1">
        <button type="button" class="site-card__nav site-card__nav--prev" aria-label="Предыдущее фото" @click="prev">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button type="button" class="site-card__nav site-card__nav--next" aria-label="Следующее фото" @click="next">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div class="site-card__dots">
          <button
            v-for="(_, index) in images"
            :key="index"
            type="button"
            class="site-card__dot"
            :class="{ 'is-active': index === current }"
            @click="goTo(index)"
          />
        </div>
      </template>
    </div>

    <div class="site-card__body">
      <span v-if="item.category" class="site-card__category">{{ item.category }}</span>
      <h3 class="site-card__title">{{ item.title || 'Название товара' }}</h3>
      <p v-if="item.description" class="site-card__desc">{{ item.description }}</p>

      <div class="site-card__price">
        <span v-if="hasSale && saleLabel" class="site-card__price-sale">{{ saleLabel }}</span>
        <span
          v-if="priceLabel"
          class="site-card__price-base"
          :class="{ 'is-old': hasSale }"
        >
          {{ priceLabel }}
        </span>
        <span v-else class="site-card__price-base is-muted">Цена не указана</span>
      </div>

      <button type="button" class="site-card__cta" tabindex="-1">Узнать подробнее</button>
    </div>
  </article>
</template>

<style scoped>
/* Цвета и стили как у карточки на сайте (CatalogCard) */
.site-card {
  display: flex;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #dce4f0;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 4px 24px rgb(37 56 99 / 8%);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.site-card:hover {
  border-color: #b9c9e1;
  box-shadow: 0 10px 28px rgb(37 56 99 / 12%);
}

.site-card__media {
  position: relative;
  aspect-ratio: 4 / 3;
  flex-shrink: 0;
  overflow: hidden;
  background: #eef2f8;
}

.site-card__track {
  display: flex;
  height: 100%;
  transition: transform 0.3s ease-out;
}

.site-card__img {
  display: block;
  width: 100%;
  height: 100%;
  flex-shrink: 0;
  object-fit: cover;
}

.site-card__empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.site-card__empty-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: #8aa3c9;
}

.site-card__discount {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 1;
  padding: 0.25rem 0.625rem;
  border-radius: 0.375rem;
  background: #b0191b;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  box-shadow: 0 1px 2px rgb(15 23 42 / 12%);
}

.site-card__nav {
  position: absolute;
  top: 50%;
  z-index: 1;
  display: inline-flex;
  width: 1.75rem;
  height: 1.75rem;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: rgb(255 255 255 / 28%);
  color: rgb(255 255 255 / 90%);
  backdrop-filter: blur(2px);
  transform: translateY(-50%);
  opacity: 0;
  transition:
    opacity 0.15s ease,
    background 0.15s ease;
}

.site-card:hover .site-card__nav {
  opacity: 0.85;
}

.site-card__nav:hover {
  background: rgb(255 255 255 / 48%);
}

.site-card__nav--prev {
  left: 0.5rem;
}

.site-card__nav--next {
  right: 0.5rem;
}

.site-card__dots {
  position: absolute;
  right: 0;
  bottom: 0.55rem;
  left: 0;
  z-index: 1;
  display: flex;
  justify-content: center;
  gap: 0.3rem;
}

.site-card__dot {
  width: 0.4rem;
  height: 0.4rem;
  border: 0;
  border-radius: 999px;
  background: rgb(255 255 255 / 55%);
  box-shadow: 0 1px 3px rgb(15 23 42 / 20%);
}

.site-card__dot.is-active {
  width: 1rem;
  background: #fff;
}

.site-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 1.25rem;
}

.site-card__category {
  display: inline-flex;
  width: fit-content;
  margin-bottom: 0.5rem;
  padding: 0.125rem 0.625rem;
  border-radius: 0.375rem;
  background: #fdf2f2;
  color: #b0191b;
  font-size: 0.75rem;
  font-weight: 600;
}

.site-card__title {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: #253863;
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.35;
  transition: color 0.15s ease;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.site-card:hover .site-card__title {
  color: #b0191b;
}

.site-card__desc {
  display: -webkit-box;
  margin: 0.5rem 0 0;
  overflow: hidden;
  flex: 1;
  color: rgb(37 56 99 / 70%);
  font-size: 0.875rem;
  line-height: 1.625;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
}

.site-card__price {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem;
  margin-top: 1rem;
}

.site-card__price-sale,
.site-card__price-base {
  font-size: 1.125rem;
}

.site-card__price-sale {
  color: #1e2d4f;
  font-weight: 800;
}

.site-card__price-base {
  color: #1e2d4f;
  font-weight: 800;
}

.site-card__price-base.is-old {
  color: #5a7aad;
  font-weight: 400;
  text-decoration: line-through;
}

.site-card__price-base.is-muted {
  color: #8aa3c9;
  font-size: 0.95rem;
  font-weight: 600;
}

.site-card__cta {
  display: inline-flex;
  width: 100%;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  margin-top: 1.25rem;
  padding: 0.5rem 1.25rem;
  border: 2px solid #253863;
  border-radius: 0.5rem;
  background: transparent;
  color: #253863;
  font-size: 0.875rem;
  font-weight: 600;
  pointer-events: none;
}
</style>
