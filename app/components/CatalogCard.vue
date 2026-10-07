<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { CatalogItem } from '~/utils/catalog'
import { catalogImages, catalogInquiryLabel, formatRub } from '~/utils/catalog'
import { cartLineFromCatalog, orderProgramLabel } from '~/utils/commerce'

const props = defineProps<{
  item: CatalogItem
}>()

const { enabled: features } = useSiteFeatures()
const { add: addToCart } = useGuestCart()
const { show: showCart } = useCartDrawer()
const { has: hasFavorite, toggle: toggleFavorite } = useGuestFavorites()
const { open: openModal } = useModal()

const priceLabel = computed(() => formatRub(props.item.price))
const saleLabel = computed(() => formatRub(props.item.salePrice))
const hasSale = computed(
  () => props.item.salePrice != null && props.item.price != null && props.item.salePrice < props.item.price,
)
const favorited = computed(() => hasFavorite(props.item.id))

const images = computed(() => catalogImages(props.item))
const current = ref(0)
const addedFlash = ref(false)

watch(
  () => props.item.id,
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

let touchStartX = 0

function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0]?.clientX ?? 0
}

function onTouchEnd(e: TouchEvent) {
  const diff = touchStartX - (e.changedTouches[0]?.clientX ?? 0)
  if (Math.abs(diff) > 40) diff > 0 ? next() : prev()
}

function onAddToCart() {
  if (!features.value.cart) return
  addToCart(props.item)
  addedFlash.value = true
  window.setTimeout(() => {
    addedFlash.value = false
  }, 1200)
  showCart()
}

function onBuyNow() {
  const line = cartLineFromCatalog(props.item)
  openModal('checkout', {
    source: 'catalog',
    program: orderProgramLabel([line]),
    items: [line],
  })
}

function onAskDetails() {
  openModal('lead', {
    source: 'catalog',
    program: catalogInquiryLabel(props.item),
  })
}

function onToggleFavorite() {
  if (!features.value.favorites) return
  toggleFavorite(props.item)
}
</script>

<template>
  <article class="card group flex h-full flex-col overflow-hidden transition hover:border-brand-200">
    <div
      class="relative aspect-[4/3] shrink-0 overflow-hidden bg-brand-50"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
    >
      <div
        v-if="images.length"
        class="flex h-full transition-transform duration-300 ease-out"
        :style="{ transform: `translateX(-${current * 100}%)` }"
      >
        <img
          v-for="(src, index) in images"
          :key="`${item.id}-${index}`"
          :src="src"
          :alt="`${item.title}${images.length > 1 ? ` — фото ${index + 1}` : ''}`"
          class="h-full w-full shrink-0 object-cover"
          loading="lazy"
          draggable="false"
        >
      </div>
      <div v-else class="absolute inset-0 flex items-center justify-center">
        <svg class="h-10 w-10 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      <span
        v-if="item.discount"
        class="absolute left-3 top-3 z-[1] rounded-md bg-accent-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm"
      >
        −{{ item.discount }}%
      </span>

      <button
        v-if="features.favorites"
        type="button"
        class="absolute right-3 top-3 z-[1] flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-brand-400 shadow-sm transition hover:text-accent-500"
        :class="{ '!text-accent-500': favorited }"
        :aria-label="favorited ? 'Убрать из избранного' : 'В избранное'"
        :aria-pressed="favorited"
        @click="onToggleFavorite"
      >
        <svg class="h-5 w-5" :fill="favorited ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      <template v-if="images.length > 1">
        <button
          type="button"
          class="catalog-card__nav catalog-card__nav--prev"
          aria-label="Предыдущее фото"
          @click="prev"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          class="catalog-card__nav catalog-card__nav--next"
          aria-label="Следующее фото"
          @click="next"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div class="catalog-card__dots" role="tablist" aria-label="Фото товара">
          <button
            v-for="(_, index) in images"
            :key="index"
            type="button"
            class="catalog-card__dot"
            :class="{ 'is-active': index === current }"
            :aria-label="`Фото ${index + 1}`"
            :aria-selected="index === current"
            @click="goTo(index)"
          />
        </div>
      </template>
    </div>

    <div class="flex flex-1 flex-col p-5">
      <span
        v-if="item.category"
        class="mb-2 inline-flex w-fit rounded-md bg-accent-50 px-2.5 py-0.5 text-xs font-semibold text-accent-500"
      >
        {{ item.category }}
      </span>
      <h3 class="line-clamp-2 text-lg font-bold text-brand-600 transition group-hover:text-accent-500">
        {{ item.title }}
      </h3>
      <p
        v-if="item.description"
        class="mt-2 flex-1 text-sm leading-relaxed text-brand-600/70 line-clamp-3"
      >
        {{ item.description }}
      </p>

      <div class="mt-4 flex flex-wrap items-baseline gap-2">
        <span
          v-if="hasSale && saleLabel"
          class="text-lg font-extrabold text-brand-700"
        >
          {{ saleLabel }}
        </span>
        <span
          v-if="priceLabel"
          class="text-lg"
          :class="hasSale ? 'text-brand-400 line-through' : 'font-extrabold text-brand-700'"
        >
          {{ priceLabel }}
        </span>
      </div>

      <div class="mt-5 grid gap-2">
        <button
          v-if="features.cart"
          type="button"
          class="btn-primary w-full !min-h-[42px] text-sm"
          @click="onAddToCart"
        >
          {{ addedFlash ? 'Добавлено' : 'В корзину' }}
        </button>
        <button
          type="button"
          class="w-full !min-h-[42px] text-sm"
          :class="features.cart ? 'btn-outline' : 'btn-primary'"
          @click="features.cart ? onBuyNow() : onAskDetails()"
        >
          {{ features.cart ? 'Оформить заявку' : 'Узнать подробнее' }}
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.catalog-card__nav {
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
  box-shadow: none;
  backdrop-filter: blur(2px);
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.15s ease, background 0.15s ease;
}

.catalog-card__nav:hover {
  background: rgb(255 255 255 / 48%);
}

.group:hover .catalog-card__nav,
.group:focus-within .catalog-card__nav {
  opacity: 0.85;
}

@media (max-width: 639px) {
  .catalog-card__nav {
    opacity: 0.7;
  }
}

.catalog-card__nav--prev {
  left: 0.5rem;
}

.catalog-card__nav--next {
  right: 0.5rem;
}

.catalog-card__dots {
  position: absolute;
  right: 0;
  bottom: 0.55rem;
  left: 0;
  z-index: 1;
  display: flex;
  justify-content: center;
  gap: 0.3rem;
}

.catalog-card__dot {
  width: 0.4rem;
  height: 0.4rem;
  border: 0;
  border-radius: 999px;
  background: rgb(255 255 255 / 55%);
  box-shadow: 0 1px 3px rgb(15 23 42 / 20%);
}

.catalog-card__dot.is-active {
  width: 1rem;
  background: #fff;
}
</style>
