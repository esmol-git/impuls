<script setup lang="ts">
import { computed } from 'vue'

const config = useRuntimeConfig()
const embedUrl = computed(() => config.public.yandexMapEmbedUrl as string)
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-brand-100 bg-brand-50">
    <iframe
      v-if="embedUrl"
      :src="embedUrl"
      class="aspect-[16/10] w-full border-0"
      allowfullscreen
      loading="lazy"
      title="Карта"
    />
    <div
      v-else
      class="relative flex aspect-[16/10] flex-col items-center justify-center gap-3 overflow-hidden bg-brand-50 p-8 text-center"
    >
      <div
        class="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
        style="background-image: radial-gradient(circle at 25% 40%, #b0191b 0%, transparent 45%), radial-gradient(circle at 75% 60%, #3d5d91 0%, transparent 40%)"
      />
      <svg class="relative h-12 w-12 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <p class="relative text-sm font-semibold text-brand-600">Интерактивная карта филиалов</p>
      <p class="relative text-xs text-brand-400">Скоро добавим — пока выберите площадку из списка выше</p>
    </div>
  </div>
</template>
