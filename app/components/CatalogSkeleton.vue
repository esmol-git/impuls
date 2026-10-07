<script setup lang="ts">
withDefaults(
  defineProps<{
    count?: number
    filters?: boolean
  }>(),
  {
    count: 9,
    filters: true,
  },
)
</script>

<template>
  <div class="catalog-skeleton" aria-busy="true" aria-live="polite">
    <span class="sr-only">Загрузка каталога…</span>

    <div v-if="filters" class="catalog-skeleton__filters">
      <div class="catalog-skeleton__bar">
        <div class="catalog-skeleton__block catalog-skeleton__search" />
        <div class="catalog-skeleton__price">
          <div class="catalog-skeleton__line catalog-skeleton__line--short" />
          <div class="catalog-skeleton__block catalog-skeleton__range" />
        </div>
        <div class="catalog-skeleton__block catalog-skeleton__sort" />
      </div>
      <div class="catalog-skeleton__chips">
        <div v-for="n in 3" :key="n" class="catalog-skeleton__chip" />
      </div>
    </div>

    <div v-if="filters" class="catalog-skeleton__meta">
      <div class="catalog-skeleton__line catalog-skeleton__line--meta" />
    </div>

    <div class="catalog-skeleton__grid">
      <div v-for="n in count" :key="n" class="catalog-skeleton__card">
        <div class="catalog-skeleton__media" />
        <div class="catalog-skeleton__body">
          <div class="catalog-skeleton__tag" />
          <div class="catalog-skeleton__line catalog-skeleton__line--title" />
          <div class="catalog-skeleton__line catalog-skeleton__line--desc" />
          <div class="catalog-skeleton__line catalog-skeleton__line--price" />
          <div class="catalog-skeleton__cta" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.catalog-skeleton__filters {
  display: grid;
  gap: 0.75rem;
  padding: 0.85rem 0.95rem;
  border: 1px solid rgb(226 232 240);
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 8px 22px rgb(15 23 42 / 4%);
}

.catalog-skeleton__bar {
  display: grid;
  grid-template-columns: minmax(9rem, 1.1fr) minmax(11rem, 1.4fr) auto;
  align-items: end;
  gap: 0.75rem 1rem;
}

@media (max-width: 767px) {
  .catalog-skeleton__bar {
    grid-template-columns: 1fr;
  }
}

.catalog-skeleton__block,
.catalog-skeleton__media,
.catalog-skeleton__tag,
.catalog-skeleton__line,
.catalog-skeleton__chip,
.catalog-skeleton__cta {
  background: linear-gradient(90deg, #eef2f8 0%, #f8fafc 45%, #eef2f8 100%);
  background-size: 200% 100%;
  animation: catalog-shimmer 1.2s ease-in-out infinite;
}

.catalog-skeleton__search {
  height: 2.25rem;
  border-radius: 0.7rem;
}

.catalog-skeleton__price {
  display: grid;
  gap: 0.35rem;
  padding-bottom: 0.15rem;
}

.catalog-skeleton__range {
  height: 0.85rem;
  border-radius: 999px;
}

.catalog-skeleton__sort {
  width: 10rem;
  height: 2.25rem;
  border-radius: 0.7rem;
}

.catalog-skeleton__chips {
  display: flex;
  gap: 0.4rem;
}

.catalog-skeleton__chip {
  width: 4.5rem;
  height: 1.9rem;
  border-radius: 999px;
}

.catalog-skeleton__meta {
  margin-top: 1rem;
}

.catalog-skeleton__grid {
  display: grid;
  gap: 1.5rem;
  margin-top: 1rem;
}

@media (min-width: 640px) {
  .catalog-skeleton__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .catalog-skeleton__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.catalog-skeleton__card {
  overflow: hidden;
  border: 1px solid #dce4f0;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 4px 24px rgb(37 56 99 / 8%);
}

.catalog-skeleton__media {
  aspect-ratio: 4 / 3;
}

.catalog-skeleton__body {
  display: grid;
  gap: 0.65rem;
  padding: 1.25rem;
}

.catalog-skeleton__tag {
  width: 4.5rem;
  height: 1.25rem;
  border-radius: 0.375rem;
}

.catalog-skeleton__line {
  height: 0.85rem;
  border-radius: 0.35rem;
}

.catalog-skeleton__line--short {
  width: 40%;
  height: 0.7rem;
}

.catalog-skeleton__line--meta {
  width: 6rem;
  height: 0.85rem;
}

.catalog-skeleton__line--title {
  width: 70%;
  height: 1.1rem;
}

.catalog-skeleton__line--desc {
  width: 95%;
}

.catalog-skeleton__line--price {
  width: 35%;
  height: 1.1rem;
  margin-top: 0.25rem;
}

.catalog-skeleton__cta {
  height: 2.625rem;
  margin-top: 0.35rem;
  border-radius: 0.5rem;
}

@keyframes catalog-shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
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
