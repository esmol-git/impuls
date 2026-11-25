<script setup lang="ts">
import { coachPageBreadcrumbs } from '~/data/breadcrumbs'
import { pages } from '~/data/pages'
import { site } from '~/data/site'
import type { Coach } from '~/types'

definePageMeta({ breadcrumb: pages.coach.breadcrumb })

const route = useRoute()
const id = route.params.id as string

const { data: coach, error } = await useFetch<Coach>(`/api/coaches/${id}`)

if (error.value || !coach.value) {
  throw createError({ statusCode: 404, statusMessage: 'Тренер не найден' })
}

usePageSeo(`${coach.value.name} — ${site.name}`, `Профиль тренера ${coach.value.name} в футбольной школе «Импульс».`)

const breadcrumbs = computed(() => coachPageBreadcrumbs(coach.value!.name))
</script>

<template>
  <div v-if="coach" class="section-padding section-alt page-top">
    <div class="container-site">
      <Breadcrumbs :items="breadcrumbs" />

      <article class="coach-hero">
        <div class="coach-hero__photo">
          <img
            v-if="coach.imageSrc"
            :src="coach.imageSrc"
            :alt="coach.imageAlt || coach.name"
            class="coach-hero__img"
            width="720"
            height="960"
            decoding="async"
          >
          <UiMediaPlaceholder
            v-else
            label="Фото тренера"
            hint="Скоро добавим"
            aspect="auto"
            :rounded="false"
            class="absolute inset-0"
          />
        </div>

        <div class="coach-hero__body">
          <div class="coach-hero__top">
            <h1 class="coach-hero__name">{{ coach.name }}</h1>
          </div>

          <div class="coach-hero__slot">
            <p class="coach-hero__note">Инфа о тренере</p>
          </div>

          <NuxtLink to="/coaches" class="coach-hero__back">
            ← Все тренеры
          </NuxtLink>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.coach-hero {
  display: grid;
  gap: 1.5rem;
  width: 100%;
  margin-top: 1.5rem;
  align-items: start;
}

@media (min-width: 640px) {
  .coach-hero {
    margin-top: 2rem;
    gap: 2rem;
  }
}

@media (min-width: 768px) {
  .coach-hero {
    grid-template-columns: minmax(0, 22rem) minmax(0, 1fr);
    gap: 2.25rem;
    align-items: stretch;
  }
}

@media (min-width: 1024px) {
  .coach-hero {
    grid-template-columns: minmax(0, 26rem) minmax(0, 1fr);
    gap: 2.75rem;
  }
}

.coach-hero__photo {
  position: relative;
  width: 100%;
  max-width: 22rem;
  margin-inline: auto;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border-radius: 1.5rem;
  background: #dce4f0;
  box-shadow:
    0 16px 40px rgb(23 35 61 / 0.14),
    inset 0 1px 0 rgb(255 255 255 / 0.35);
}

@media (min-width: 768px) {
  .coach-hero__photo {
    max-width: none;
    margin-inline: 0;
    height: 100%;
    min-height: 28rem;
    aspect-ratio: auto;
  }
}

@media (min-width: 1024px) {
  .coach-hero__photo {
    min-height: 32rem;
    border-radius: 1.75rem;
  }
}

.coach-hero__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 18%;
}

.coach-hero__body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-width: 0;
  min-height: 100%;
  padding: 0.15rem 0.1rem 0.5rem;
}

@media (min-width: 768px) {
  .coach-hero__body {
    padding: 0.5rem 0 0.25rem;
  }
}

.coach-hero__top {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.85rem;
}

.coach-hero__name {
  margin: 0;
  font-size: 1.65rem;
  font-weight: 800;
  line-height: 1.15;
  color: #17233d;
}

@media (min-width: 768px) {
  .coach-hero__name {
    font-size: 2rem;
  }
}

@media (min-width: 1024px) {
  .coach-hero__name {
    font-size: 2.35rem;
  }
}

.coach-hero__slot {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 8rem;
  border-radius: 1.25rem;
  border: 1px dashed rgb(37 56 99 / 0.16);
  background: rgb(255 255 255 / 0.72);
  padding: 1.25rem 1.5rem;
  box-shadow: 0 10px 28px rgb(23 35 61 / 0.05);
  text-align: center;
}

@media (min-width: 768px) {
  .coach-hero__slot {
    min-height: 14rem;
  }
}

.coach-hero__note {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.45;
  color: rgb(23 35 61 / 0.45);
}

.coach-hero__back {
  margin-top: auto;
  font-size: 0.875rem;
  font-weight: 600;
  color: #253863;
  transition: color 0.15s ease;
}

.coach-hero__back:hover {
  color: #b0191b;
}
</style>
