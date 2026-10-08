<script setup lang="ts">
import logoUrl from '~/assets/img/logo.png'
import { site } from '~/data/site'

definePageMeta({
  layout: 'maintenance',
})

const phoneHref = computed(() => `tel:${site.phone.replace(/[\s()-]/g, '')}`)
</script>

<template>
  <div
    class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16 text-center"
  >
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(14,116,144,0.12),_transparent_55%),linear-gradient(180deg,#f8fafc_0%,#eef6f8_45%,#f1f5f9_100%)]"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -left-24 top-1/4 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -right-16 bottom-1/4 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl"
      aria-hidden="true"
    />

    <div class="relative mx-auto flex w-full max-w-lg flex-col items-center">
      <img
        :src="logoUrl"
        :alt="site.name"
        class="mb-8 h-24 w-24 shrink-0 object-contain drop-shadow-sm sm:h-28 sm:w-28"
        width="112"
        height="112"
      />

      <p class="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">
        {{ site.brandLine }}
      </p>

      <h1 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Ведутся технические работы
      </h1>

      <p class="mt-4 max-w-md text-base leading-relaxed text-slate-600 sm:text-lg">
        Сайт временно недоступен. Мы уже всё чиним — скоро снова можно будет записаться
        и посмотреть расписание.
      </p>

      <a
        :href="phoneHref"
        class="mt-8 inline-flex items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        {{ site.phone }}
      </a>

      <p class="mt-3 text-sm text-slate-500">{{ site.phoneHours }}</p>
    </div>
  </div>
</template>
