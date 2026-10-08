<script setup lang="ts">
import { site } from '~/data/site'

useSeoMeta({
  title: `${site.name} — технические работы`,
  description: 'Сайт временно недоступен: ведутся технические работы.',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="min-h-screen">
    <slot />
  </div>
</template>
