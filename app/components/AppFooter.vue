<script setup lang="ts">
import { computed } from 'vue'
import { footerLinks, navigation, site } from '~/data/site'

const { visible } = await useManagedSections()

const navItems = computed(() =>
  navigation.filter((item) => {
    if (!('section' in item) || !item.section) return true
    return visible.value[item.section]
  }),
)
</script>

<template>
  <footer class="bg-brand-600 text-white">
    <div class="container-site section-padding pb-6 sm:pb-8">
      <div class="grid gap-8 sm:gap-10 md:grid-cols-3">
        <div>
          <div class="mb-4 flex items-center gap-3">
            <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-lg font-extrabold text-brand-600">
              И
            </span>
            <div>
              <p class="font-bold">{{ site.name }}</p>
              <p class="text-sm text-white/70">{{ site.tagline }}</p>
            </div>
          </div>
          <p class="text-sm leading-relaxed text-white/70">
            {{ site.description }}
          </p>
          <div class="mt-5">
            <SocialLinks variant="light" size="sm" />
          </div>
        </div>

        <div>
          <p class="mb-4 text-sm font-semibold uppercase tracking-wider text-white/90">
            Навигация
          </p>
          <ul class="space-y-2">
            <li v-for="item in navItems" :key="item.to">
              <NuxtLink :to="item.to" class="text-sm text-white/70 transition hover:text-white">
                {{ item.label }}
              </NuxtLink>
            </li>
            <li v-for="item in footerLinks" :key="item.to">
              <NuxtLink :to="item.to" class="text-sm text-white/70 transition hover:text-white">
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <p class="mb-4 text-sm font-semibold uppercase tracking-wider text-white/90">
            Контакты
          </p>
          <ul class="space-y-2 text-sm text-white/70">
            <li>
              <a :href="`tel:${site.phone.replace(/[\s()-]/g, '')}`" class="font-bold text-white hover:underline">
                {{ site.phone }}
              </a>
            </li>
            <li>{{ site.phoneHours }}</li>
            <li>{{ site.email }}</li>
          </ul>
        </div>
      </div>

      <div class="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-center sm:mt-10 sm:flex-row sm:pt-8 sm:text-left">
        <p class="text-sm text-white/50">
          © {{ new Date().getFullYear() }} {{ site.name }}. Все права защищены.
        </p>
        <p class="text-xs text-white/40">
          {{ site.legal }}
        </p>
      </div>
    </div>
  </footer>
</template>
