<script setup lang="ts">
import { heroStats } from '~/data/home'
</script>

<template>
  <section class="border-b border-brand-100 bg-white py-6 sm:py-8" aria-label="Показатели школы">
    <div class="container-site">
      <ul class="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 sm:gap-6 lg:gap-8">
        <li
          v-for="stat in heroStats"
          :key="stat.label"
          class="text-center sm:text-left"
        >
          <ScrollReveal>
            <p class="text-2xl font-extrabold text-brand-600 sm:text-3xl lg:text-4xl">
              {{ stat.value }}
            </p>
            <p class="mt-1 text-xs leading-snug text-brand-600/60 sm:text-sm">
              {{ stat.label }}
            </p>
          </ScrollReveal>
        </li>
      </ul>
    </div>
  </section>
</template>
