<script setup lang="ts">
import { computed } from 'vue'
import type { NuxtError } from '#app'
import { site } from '~/data/site'

const props = defineProps<{
  error: NuxtError
}>()

const is404 = computed(() => props.error.statusCode === 404)

const message = computed(() => {
  if (is404.value) return 'Страница не найдена'
  return 'Что-то пошло не так'
})

const hint = computed(() => {
  if (is404.value) return 'Возможно, ссылка устарела или страница была перемещена.'
  return 'Попробуйте обновить страницу или вернитесь на главную.'
})

function handleError() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-brand-50 px-4 text-center safe-top safe-bottom">
    <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-2xl font-extrabold text-white">
      И
    </div>
    <p class="mt-6 text-6xl font-extrabold text-brand-600 sm:text-8xl">{{ error.statusCode }}</p>
    <h1 class="mt-4 text-xl font-bold text-brand-600 sm:text-2xl">{{ message }}</h1>
    <p class="mt-2 max-w-md text-sm text-brand-600/60 sm:text-base">
      {{ hint }}
    </p>
    <div class="mt-8 flex flex-col gap-3 sm:flex-row">
      <button type="button" class="btn-primary" @click="handleError">
        На главную
      </button>
      <NuxtLink v-if="is404" to="/contacts" class="btn-outline">
        Контакты
      </NuxtLink>
    </div>
    <p class="mt-10 text-xs text-brand-400">{{ site.name }}</p>
  </div>
</template>
