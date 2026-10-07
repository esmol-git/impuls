<script setup lang="ts">
import { computed, watch } from 'vue'
import type { CatalogFacets, CatalogSort } from '~/utils/catalog'
import { formatRub } from '~/utils/catalog'

const props = defineProps<{
  facets: CatalogFacets
}>()

const categoriesSelected = defineModel<string[]>('categories', { default: () => [] })
const priceMin = defineModel<number>('priceMin', { required: true })
const priceMax = defineModel<number>('priceMax', { required: true })
const onlySale = defineModel<boolean>('onlySale', { default: false })
const query = defineModel<string>('query', { default: '' })
const sort = defineModel<CatalogSort>('sort', { default: 'default' })

const emit = defineEmits<{
  reset: []
}>()

const bounds = computed(() => ({
  min: props.facets.priceMin,
  max: props.facets.priceMax,
}))

const categoryOptions = computed(() => props.facets.categories)
const saleCount = computed(() => props.facets.saleCount)
const selectedSet = computed(() => new Set(categoriesSelected.value))

function clearCategories() {
  categoriesSelected.value = []
}

function toggleCategory(name: string) {
  const next = new Set(categoriesSelected.value)
  if (next.has(name)) next.delete(name)
  else next.add(name)
  categoriesSelected.value = [...next]
}

const sortOptions: { value: CatalogSort; label: string }[] = [
  { value: 'default', label: 'По умолчанию' },
  { value: 'price-asc', label: 'Сначала дешевле' },
  { value: 'price-desc', label: 'Сначала дороже' },
  { value: 'title', label: 'По названию' },
]

const hasActiveFilters = computed(() => {
  return (
    categoriesSelected.value.length > 0 ||
    onlySale.value ||
    Boolean(query.value.trim()) ||
    sort.value !== 'default' ||
    priceMin.value > bounds.value.min ||
    priceMax.value < bounds.value.max
  )
})

watch(
  bounds,
  (next) => {
    if (!next.max && !next.min) return
    if (priceMin.value < next.min || priceMin.value > next.max) priceMin.value = next.min
    if (priceMax.value > next.max || priceMax.value < next.min) priceMax.value = next.max
    if (priceMin.value > priceMax.value) {
      priceMin.value = next.min
      priceMax.value = next.max
    }
  },
  { immediate: true },
)

function onMinInput(event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  priceMin.value = Math.min(value, priceMax.value)
}

function onMaxInput(event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  priceMax.value = Math.max(value, priceMin.value)
}

const rangeProgress = computed(() => {
  const span = bounds.value.max - bounds.value.min || 1
  const left = ((priceMin.value - bounds.value.min) / span) * 100
  const right = ((priceMax.value - bounds.value.min) / span) * 100
  return { left, right }
})

function reset() {
  categoriesSelected.value = []
  onlySale.value = false
  query.value = ''
  sort.value = 'default'
  priceMin.value = bounds.value.min
  priceMax.value = bounds.value.max
  emit('reset')
}
</script>

<template>
  <div class="catalog-filters">
    <div class="catalog-filters__bar">
      <label class="catalog-search">
        <span class="sr-only">Поиск по каталогу</span>
        <svg class="catalog-search__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
        </svg>
        <input
          v-model="query"
          type="search"
          placeholder="Поиск…"
          class="catalog-search__input"
        >
      </label>

      <div class="catalog-price">
        <div class="catalog-price__meta">
          <span>Цена</span>
          <strong>{{ formatRub(priceMin) }} — {{ formatRub(priceMax) }}</strong>
        </div>
        <div
          class="catalog-range"
          :style="{
            '--range-left': `${rangeProgress.left}%`,
            '--range-right': `${rangeProgress.right}%`,
          }"
        >
          <div class="catalog-range__track" aria-hidden="true" />
          <input
            type="range"
            class="catalog-range__input"
            :min="bounds.min"
            :max="bounds.max"
            :step="Math.max(1, Math.round((bounds.max - bounds.min) / 100))"
            :value="priceMin"
            aria-label="Минимальная цена"
            @input="onMinInput"
          >
          <input
            type="range"
            class="catalog-range__input"
            :min="bounds.min"
            :max="bounds.max"
            :step="Math.max(1, Math.round((bounds.max - bounds.min) / 100))"
            :value="priceMax"
            aria-label="Максимальная цена"
            @input="onMaxInput"
          >
        </div>
      </div>

      <div class="catalog-filters__actions">
        <UiAppSelect
          v-model="sort"
          :options="sortOptions"
          aria-label="Сортировка"
        />

        <button
          v-if="saleCount"
          type="button"
          class="catalog-sale"
          :class="{ 'is-active': onlySale }"
          @click="onlySale = !onlySale"
        >
          Со скидкой
        </button>

        <button
          v-if="hasActiveFilters"
          type="button"
          class="catalog-reset"
          @click="reset"
        >
          Сбросить
        </button>
      </div>
    </div>

    <div v-if="categoryOptions.length" class="catalog-filters__chips" aria-label="Категории">
      <button
        type="button"
        class="catalog-chip"
        :class="{ 'is-active': !categoriesSelected.length }"
        @click="clearCategories"
      >
        Все
      </button>
      <button
        v-for="item in categoryOptions"
        :key="item.name"
        type="button"
        class="catalog-chip"
        :class="{ 'is-active': selectedSet.has(item.name) }"
        :aria-pressed="selectedSet.has(item.name)"
        @click="toggleCategory(item.name)"
      >
        {{ item.name }}
        <span class="catalog-chip__count">{{ item.count }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.catalog-filters {
  display: grid;
  gap: 0.75rem;
  padding: 0.85rem 0.95rem;
  border: 1px solid rgb(226 232 240);
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 8px 22px rgb(15 23 42 / 4%);
}

.catalog-filters__bar {
  display: grid;
  grid-template-columns: minmax(9rem, 1.1fr) minmax(11rem, 1.4fr) auto;
  align-items: end;
  gap: 0.75rem 1rem;
}

@media (max-width: 767px) {
  .catalog-filters__bar {
    grid-template-columns: 1fr;
    align-items: stretch;
  }
}

.catalog-search {
  position: relative;
  min-width: 0;
}

.catalog-filters__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.catalog-search__icon {
  position: absolute;
  top: 50%;
  left: 0.7rem;
  width: 0.95rem;
  height: 0.95rem;
  color: rgb(100 116 139);
  transform: translateY(-50%);
  pointer-events: none;
}

.catalog-search__input {
  width: 100%;
  min-height: 2.25rem;
  padding: 0.4rem 0.75rem 0.4rem 2.15rem;
  border: 1px solid rgb(226 232 240);
  border-radius: 0.7rem;
  background: rgb(248 250 252);
  color: #0b2a5b;
  font-size: 0.8125rem;
  outline: none;
}

.catalog-search__input:focus {
  border-color: rgb(37 99 235 / 55%);
  background: #fff;
  box-shadow: 0 0 0 3px rgb(37 99 235 / 10%);
}

.catalog-sale {
  min-height: 2.25rem;
  padding: 0.35rem 0.75rem;
  border: 1px solid rgb(254 215 170);
  border-radius: 0.7rem;
  background: rgb(255 247 237);
  color: #9a3412;
  font-size: 0.8125rem;
  font-weight: 700;
}

.catalog-sale.is-active {
  border-color: #ea580c;
  background: #ea580c;
  color: #fff;
}

.catalog-reset {
  min-height: 2.25rem;
  padding: 0.35rem 0.55rem;
  border: 0;
  background: transparent;
  color: rgb(100 116 139);
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.catalog-filters__chips {
  display: flex;
  gap: 0.4rem;
  overflow-x: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.catalog-filters__chips::-webkit-scrollbar {
  display: none;
}

.catalog-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  flex-shrink: 0;
  min-height: 1.9rem;
  padding: 0.25rem 0.7rem;
  border: 1px solid rgb(226 232 240);
  border-radius: 999px;
  background: #fff;
  color: #0b2a5b;
  font-size: 0.75rem;
  font-weight: 600;
}

.catalog-chip.is-active {
  border-color: #0b2a5b;
  background: #0b2a5b;
  color: #fff;
}

.catalog-chip__count {
  opacity: 0.7;
  font-size: 0.68rem;
}

.catalog-price {
  display: grid;
  gap: 0.2rem;
  min-width: 0;
  padding-bottom: 0.15rem;
}

.catalog-price__meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.7rem;
  color: rgb(100 116 139);
}

.catalog-price__meta strong {
  color: #0b2a5b;
  font-weight: 700;
}

.catalog-range {
  position: relative;
  height: 22px;
}

.catalog-range__track {
  position: absolute;
  top: 50%;
  right: 0;
  left: 0;
  height: 4px;
  border-radius: 999px;
  background: rgb(226 232 240);
  transform: translateY(-50%);
}

.catalog-range__track::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: var(--range-left);
  right: calc(100% - var(--range-right));
  border-radius: inherit;
  background: #0b2a5b;
}

.catalog-range__input {
  position: absolute;
  inset: 0;
  width: 100%;
  margin: 0;
  appearance: none;
  background: transparent;
  pointer-events: none;
}

.catalog-range__input::-webkit-slider-thumb {
  appearance: none;
  width: 14px;
  height: 14px;
  border: 2px solid #fff;
  border-radius: 999px;
  background: #0b2a5b;
  box-shadow: 0 1px 4px rgb(15 23 42 / 22%);
  pointer-events: auto;
  cursor: pointer;
}

.catalog-range__input::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border: 2px solid #fff;
  border-radius: 999px;
  background: #0b2a5b;
  box-shadow: 0 1px 4px rgb(15 23 42 / 22%);
  pointer-events: auto;
  cursor: pointer;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
